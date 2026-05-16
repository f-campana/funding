# Testing Philosophy — `@repo/core`

This document defines the testing requirements for the core library.
Read it before writing a single test. The testing approach here is
different from standard React component testing — it is grounded in
mathematical laws that must hold for the types to be trustworthy.

---

## 1. Why the tests matter more here than elsewhere

The core library is the foundation of the entire codebase. A bug in
`Result.flatMap` is not a component bug — it is a bug that propagates
through every financial pipeline that uses it. A broken Monad law in
`Option` means that every `flatMap` chain in the application has
unpredictable behavior.

The tests are not optional. They are not to be skipped "for now."
They ship with the first commit.

---

## 2. Test framework setup

```
Vitest       — unit and property-based tests (no DOM required)
fast-check   — property-based testing / fuzzing for law verification
```

No `@testing-library`. No DOM. The core library has zero React
dependency and zero browser dependency. All tests run in Node.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
```

100% coverage is the floor, not a goal. If a branch cannot be tested,
it should not exist.

---

## 3. Unit tests — behaviour contract

Unit tests verify that each operation behaves correctly for concrete inputs.
One test file per type. Each test file covers all operations on that type.

### File structure

```
src/
  option.ts
  option.test.ts      ← unit + property tests for Option
  result.ts
  result.test.ts
  async-data.ts
  async-data.test.ts
  future.ts
  future.test.ts
```

### What to cover

For each operation, test:
1. The happy path — expected input, expected output
2. The propagation case — does the operation correctly pass through
   when in the "absent" or "error" state?
3. Edge cases specific to the operation

```typescript
// option.test.ts — example unit tests
import { describe, expect, it } from 'vitest'
import { Option } from './option'

describe('Option.map', () => {
  it('transforms the value when Some', () => {
    const result = Option.Some(5).map(x => x * 2)
    expect(result).toMatchObject({ _tag: 'Some', value: 10 })
  })

  it('propagates None without calling the function', () => {
    const fn = vi.fn()
    const result = Option.None<number>().map(fn)
    expect(result).toMatchObject({ _tag: 'None' })
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('Option.flatMap', () => {
  it('chains Some values', () => {
    const safeDiv = (n: number, d: number) =>
      d === 0 ? Option.None<number>() : Option.Some(n / d)
    const result = Option.Some(10).flatMap(n => safeDiv(n, 2))
    expect(result).toMatchObject({ _tag: 'Some', value: 5 })
  })

  it('short-circuits to None when the chain returns None', () => {
    const result = Option.Some(10).flatMap(_ => Option.None<number>())
    expect(result).toMatchObject({ _tag: 'None' })
  })

  it('does not call the function when starting from None', () => {
    const fn = vi.fn()
    Option.None<number>().flatMap(fn)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('Option.match', () => {
  it('calls the Some branch with the value', () => {
    const result = Option.Some(42).match({
      Some: v => `got ${v}`,
      None: () => 'nothing',
    })
    expect(result).toBe('got 42')
  })

  it('calls the None branch when None', () => {
    const result = Option.None<number>().match({
      Some: v => `got ${v}`,
      None: () => 'nothing',
    })
    expect(result).toBe('nothing')
  })
})

describe('Option.all', () => {
  it('returns Some tuple when all inputs are Some', () => {
    const result = Option.all(Option.Some(1), Option.Some('a'))
    expect(result).toMatchObject({ _tag: 'Some', value: [1, 'a'] })
  })

  it('returns None when any input is None', () => {
    expect(Option.all(Option.Some(1), Option.None())).toMatchObject({ _tag: 'None' })
    expect(Option.all(Option.None(), Option.Some(1))).toMatchObject({ _tag: 'None' })
    expect(Option.all(Option.None(), Option.None())).toMatchObject({ _tag: 'None' })
  })
})
```

---

## 4. Property-based tests — mathematical laws

Property-based tests use `fast-check` to generate arbitrary inputs and
verify that the Functor and Monad laws hold for all inputs, not just
the ones you thought of.

These are not optional. They are the proof that the types are correct.

### Functor laws

Every type with `map` must satisfy:

**Identity:** `x.map(id) ≡ x`
Mapping with the identity function returns an equivalent value.

**Composition:** `x.map(f).map(g) ≡ x.map(x => g(f(x)))`
Mapping twice is equivalent to mapping with the composed function.

```typescript
// option.test.ts — functor laws
import * as fc from 'fast-check'

describe('Option — Functor laws', () => {
  const optionArb = fc.oneof(
    fc.integer().map(Option.Some),
    fc.constant(Option.None<number>()),
  )

  it('identity: option.map(x => x) equals option', () => {
    fc.assert(
      fc.property(optionArb, (option) => {
        const result = option.map(x => x)
        expect(result).toMatchObject(option)
      }),
    )
  })

  it('composition: map(f).map(g) equals map(x => g(f(x)))', () => {
    const f = (x: number) => x * 2
    const g = (x: number) => x + 1
    fc.assert(
      fc.property(optionArb, (option) => {
        const left = option.map(f).map(g)
        const right = option.map(x => g(f(x)))
        expect(left).toMatchObject(right)
      }),
    )
  })
})
```

### Monad laws

Every type with `flatMap` must satisfy:

**Left identity:** `Option.Some(x).flatMap(f) ≡ f(x)`
Lifting a value and immediately flatMapping is the same as applying
the function directly.

**Right identity:** `m.flatMap(Option.Some) ≡ m`
flatMapping with the Some constructor is a no-op.

**Associativity:** `m.flatMap(f).flatMap(g) ≡ m.flatMap(x => f(x).flatMap(g))`
The order of composition does not matter.

```typescript
describe('Option — Monad laws', () => {
  const f = (x: number): Option<number> =>
    x > 0 ? Option.Some(x * 2) : Option.None()
  const g = (x: number): Option<string> =>
    x < 100 ? Option.Some(x.toString()) : Option.None()

  it('left identity: Some(x).flatMap(f) equals f(x)', () => {
    fc.assert(
      fc.property(fc.integer(), (x) => {
        const left = Option.Some(x).flatMap(f)
        const right = f(x)
        expect(left).toMatchObject(right)
      }),
    )
  })

  it('right identity: m.flatMap(Some) equals m', () => {
    const optionArb = fc.oneof(
      fc.integer().map(Option.Some),
      fc.constant(Option.None<number>()),
    )
    fc.assert(
      fc.property(optionArb, (m) => {
        const result = m.flatMap(Option.Some)
        expect(result).toMatchObject(m)
      }),
    )
  })

  it('associativity: m.flatMap(f).flatMap(g) equals m.flatMap(x => f(x).flatMap(g))', () => {
    const optionArb = fc.oneof(
      fc.integer().map(Option.Some),
      fc.constant(Option.None<number>()),
    )
    fc.assert(
      fc.property(optionArb, (m) => {
        const left = m.flatMap(f).flatMap(g)
        const right = m.flatMap(x => f(x).flatMap(g))
        expect(left).toMatchObject(right)
      }),
    )
  })
})
```

Apply the same Functor and Monad law tests to `Result<T, E>` and
`AsyncData<T>`. The arbitraries will differ (generate both Ok and Error
variants for Result, all three states for AsyncData) but the law
structure is identical.

### Result.all — Applicative law (no short-circuit)

```typescript
describe('Result.all — collects all errors', () => {
  it('returns Ok tuple when all inputs succeed', () => {
    fc.assert(
      fc.property(fc.integer(), fc.string(), (n, s) => {
        const result = Result.all([Result.Ok(n), Result.Ok(s)])
        expect(result).toMatchObject({ _tag: 'Ok', value: [n, s] })
      }),
    )
  })

  it('collects ALL errors — does not short-circuit', () => {
    const e1 = new Error('first')
    const e2 = new Error('second')
    const e3 = new Error('third')
    const result = Result.all([
      Result.Error(e1),
      Result.Ok(1),
      Result.Error(e2),
      Result.Error(e3),
    ])
    expect(result._tag).toBe('Error')
    if (result._tag === 'Error') {
      // MUST contain all three errors, not just the first
      expect(result.error).toHaveLength(3)
      expect(result.error).toContain(e1)
      expect(result.error).toContain(e2)
      expect(result.error).toContain(e3)
    }
  })
})
```

---

## 5. Future<T> — cancellation tests

The cancellation contract is:
1. After cancel is called, the resolve callback must never fire
2. Cancelling after resolution is a no-op (does not throw)
3. Cancelling multiple times is idempotent

```typescript
describe('Future — cancellation contract', () => {
  it('resolve is not called after cancel', async () => {
    const resolve = vi.fn()
    let outerResolve: (v: number) => void

    const future = Future.make<number>((r) => {
      outerResolve = r
      return () => {} // external cancel — we control resolution manually
    })

    const cancel = future.get(resolve)
    cancel() // cancel before resolving
    outerResolve!(42) // attempt to resolve after cancel

    // Give microtasks time to settle
    await new Promise(r => setTimeout(r, 0))
    expect(resolve).not.toHaveBeenCalled()
  })

  it('resolve IS called if future resolves before cancel', async () => {
    const resolve = vi.fn()

    const future = Future.make<number>((r) => {
      r(42) // resolve immediately
      return () => {}
    })

    const cancel = future.get(resolve)
    // resolve was synchronous — already fired
    expect(resolve).toHaveBeenCalledWith(42)
    // cancelling now is a no-op, does not throw
    expect(() => cancel()).not.toThrow()
  })

  it('cancel is idempotent — calling multiple times does not throw', () => {
    const future = Future.make<number>((r) => {
      return () => {}
    })
    const cancel = future.get(vi.fn())
    expect(() => {
      cancel()
      cancel()
      cancel()
    }).not.toThrow()
  })
})
```

---

## 6. ts-pattern compatibility — compile-time tests

These tests must compile without error. They are `tsc --noEmit` tests,
not runtime tests. If adding a new variant to any union breaks these
compile checks, that is intentional — it means the union change requires
updating every match site.

Create a file `src/ts-pattern-compat.test-types.ts` (not picked up by
Vitest, only by `tsc`):

```typescript
// src/ts-pattern-compat.test-types.ts
// This file must compile without errors. It verifies that all types
// produced by this library are compatible with ts-pattern's exhaustive matcher.

import { match } from 'ts-pattern'
import { Option } from './option'
import { Result } from './result'
import { AsyncData } from './async-data'

// Option exhaustiveness
declare const opt: Option<number>
const _optResult: string = match(opt)
  .with({ _tag: 'Some' }, ({ value }) => `some: ${value}`)
  .with({ _tag: 'None' }, () => 'none')
  .exhaustive()

// Result exhaustiveness
declare const res: Result<number, string>
const _resResult: string = match(res)
  .with({ _tag: 'Ok' }, ({ value }) => `ok: ${value}`)
  .with({ _tag: 'Error' }, ({ error }) => `error: ${error}`)
  .exhaustive()

// AsyncData exhaustiveness
declare const ad: AsyncData<number>
const _adResult: string = match(ad)
  .with({ _tag: 'NotAsked' }, () => 'not asked')
  .with({ _tag: 'Loading' }, () => 'loading')
  .with({ _tag: 'Done' }, ({ value }) => `done: ${value}`)
  .exhaustive()

// Nested — the canonical usage
declare const adRes: AsyncData<Result<number, string>>
const _adResResult: string = match(adRes)
  .with({ _tag: 'NotAsked' }, () => 'not asked')
  .with({ _tag: 'Loading' }, () => 'loading')
  .with({ _tag: 'Done', value: { _tag: 'Ok' } }, ({ value }) => `ok: ${value.value}`)
  .with({ _tag: 'Done', value: { _tag: 'Error' } }, ({ value }) => `error: ${value.error}`)
  .exhaustive()
```

Add to `package.json` scripts:
```json
"typecheck": "tsc --noEmit",
"typecheck:compat": "tsc --noEmit --project tsconfig.compat.json"
```

---

## 7. What NOT to test

- **Snapshot tests** — banned. A snapshot of `{ _tag: 'Some', value: 42, map: [Function] }`
  is not a meaningful test. It tests the object shape, not the behavior.

- **Implementation details** — do not test how a method is implemented internally,
  only what it returns and what side effects it has (for Future).

- **TypeScript inference** — do not write tests that assert TypeScript infers
  a specific type. That is what the `test-types.ts` compile check is for.

- **Third-party library behavior** — do not test that `fast-check` generates
  arbitrary values correctly. Trust the library.

---

## 8. Coverage requirements

100% line, branch, function, and statement coverage.

The one legitimate exception: the `default` branch of a switch over a
discriminated union that has `.exhaustive()` coverage via ts-pattern.
If TypeScript proves the default is unreachable, the coverage tool may
flag it. Use `/* v8 ignore next */` with an explanatory comment:

```typescript
// v8 ignore next — TypeScript proves this branch is unreachable via exhaustive union
default: assertNever(tag)
```

`assertNever` pattern:
```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`)
}
```
