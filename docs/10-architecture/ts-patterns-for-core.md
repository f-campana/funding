# TypeScript Patterns — `@repo/core` Implementation Guide

This document covers the specific TypeScript patterns the core library
must use. It is not a general TypeScript guide — it is scoped to the
exact decisions made in the ADRs and spec for this library.

---

## 1. Discriminated unions as the primary representation

Every type in this library is a **plain discriminated union object**.
Not a class. Not a prototype chain. A plain object with a `_tag` string
discriminant and function properties for operations.

```typescript
// ✅ Correct — plain discriminated union
type Option<T> =
  | { readonly _tag: 'Some'; readonly value: T; map: ...; flatMap: ...; ... }
  | { readonly _tag: 'None'; map: ...; flatMap: ...; ... }

// ❌ Wrong — class instance
class Some<T> {
  constructor(readonly value: T) {}
  map<U>(fn: (value: T) => U): Option<U> { ... }
}
```

**Why this matters:** ts-pattern matches on object shape. Class instances
require `instanceof` registration with ts-pattern. Plain objects work
natively. Application code can also do `option._tag === 'Some'` directly.

---

## 2. Methods on objects — not on prototypes

Methods are function properties defined on the object returned by the
constructor. They are NOT on a prototype chain.

```typescript
// ✅ Correct — method as function property
function makeSome<T>(value: T): Option<T> {
  const self = {
    _tag: 'Some' as const,
    value,
    map<U>(fn: (v: T) => U): Option<U> {
      return makeSome(fn(self.value))
    },
    flatMap<U>(fn: (v: T) => Option<U>): Option<U> {
      return fn(self.value)
    },
    getOr(_fallback: T): T {
      return self.value
    },
    match<U>(cases: { Some: (v: T) => U; None: () => U }): U {
      return cases.Some(self.value)
    },
    isSome(): this is { _tag: 'Some'; value: T } {
      return true
    },
    isNone(): this is { _tag: 'None' } {
      return false
    },
  }
  return self
}
```

**The `self` closure pattern:** inside each method, use `self` to refer
to the current object rather than `this`. `this` binding in TypeScript
is fragile when methods are destructured or passed as callbacks.
`self` captures the reference at construction time and is always correct.

---

## 3. `as const` for discriminant tags

Every `_tag` must be typed as a string literal, not `string`.
Use `as const` to ensure the literal type is preserved.

```typescript
// ✅ Correct — literal type
_tag: 'Some' as const   // type: 'Some'

// ❌ Wrong — widened to string
_tag: 'Some'            // type: string (in some inference contexts)
```

The discriminant must be `readonly`. Mutating the discriminant after
construction would corrupt the type system's invariants.

```typescript
// ✅ Correct
readonly _tag: 'Some'

// ❌ Wrong — mutable discriminant
_tag: 'Some'
```

---

## 4. Generic constraints and variance

**Option\<T\>:** `T` is covariant — if `B extends A`, then `Option<B>`
should be usable where `Option<A>` is expected. TypeScript structural
typing handles this automatically for plain objects.

**Result\<T, E\>:** `T` is covariant, `E` is covariant.

**AsyncData\<T\>:** `T` is covariant.

**Future\<T\>:** `T` is covariant.

No explicit variance annotations are needed — structural typing gives
them for free. Do not add `in`/`out` modifiers unless there is a
specific inference problem to solve.

---

## 5. Return type annotations — explicit on public API

Every function exported from the library must have an explicit return
type annotation. TypeScript can infer return types, but explicit
annotations:
- Prevent return type widening during refactors
- Document the contract at the call site
- Catch accidental type changes as compile errors rather than silent
  inference changes

```typescript
// ✅ Correct — explicit return type
function makeSome<T>(value: T): Option<T> { ... }
function makeNone<T>(): Option<T> { ... }

// ❌ Wrong — inferred return type on public API
function makeSome<T>(value: T) { ... }
```

Internal helper functions (not exported) may use inferred return types.

---

## 6. `readonly` everywhere

All properties on all types must be `readonly`. The library produces
immutable values — operations produce new values rather than mutating
existing ones.

```typescript
// ✅ Correct
type SomeOption<T> = {
  readonly _tag: 'Some'
  readonly value: T
}

// ❌ Wrong — mutable properties
type SomeOption<T> = {
  _tag: 'Some'
  value: T
}
```

For arrays returned by the library (e.g., `Result.all` input), prefer
`readonly T[]` or `ReadonlyArray<T>` over `T[]` in parameter positions.

---

## 7. Type predicates for narrowing

Methods like `isSome()` and `isNone()` must return type predicates
so that TypeScript narrows the type after a truthiness check.

```typescript
// ✅ Correct — type predicate
isSome(): this is { _tag: 'Some'; value: T } {
  return true
}

// ❌ Wrong — returns boolean, TypeScript cannot narrow
isSome(): boolean {
  return true
}
```

After calling `option.isSome()` in an `if` block, TypeScript should
know that `option.value` is accessible without further casting.

---

## 8. The `satisfies` operator for registry objects

When creating a record that maps step IDs to schemas or constructors,
use `satisfies` to get both type checking and literal type inference.

```typescript
// ✅ Correct — satisfies gives type checking without widening the type
const Option = {
  Some: makeSome,
  None: makeNone,
  fromNullable: makeFromNullable,
  fromPredicate: makeFromPredicate,
  all: makeAll,
} satisfies Record<string, (...args: never[]) => unknown>

// satisfies checks the shape but preserves the literal types
// Option.Some is typed as (value: T) => Option<T>, not as (...args) => unknown
```

---

## 9. Overloads for multi-arity combinators

`Result.all` and `Option.all` need overloads to preserve the tuple
structure of their input:

```typescript
// Preserves tuple types via overloads
function all<T, U>(results: [Result<T, E>, Result<U, E>]): Result<[T, U], E[]>
function all<T, U, V>(results: [Result<T, E>, Result<U, E>, Result<V, E>]): Result<[T, U, V], E[]>
function all<T>(results: Result<T, E>[]): Result<T[], E[]>
function all(results: Result<unknown, unknown>[]): Result<unknown[], unknown[]> {
  // implementation
}
```

Provide overloads for 2, 3, 4, and 5-tuple inputs. The variadic
fallback covers larger arrays at the cost of losing tuple structure.

---

## 10. Strict null handling in operations

The library must handle the case where a callback passed to `map` or
`flatMap` throws. In a pure functional design, throwing is not expected
— but defensive handling prevents cryptic errors:

**Option:** `map` and `flatMap` should not catch — if the callback throws,
that is the caller's bug, not the library's responsibility. Document this
clearly in JSDoc.

**Result.fromTryCatch:** the explicit escape hatch for wrapping throwing
code. Catches all thrown values and wraps them in `Result.Error`.

```typescript
function fromTryCatch<T, E = unknown>(fn: () => T): Result<T, E>

// Typed variant — requires the caller to specify how to map the error
function fromTryCatchTyped<T, E>(
  fn: () => T,
  mapError: (e: unknown) => E,
): Result<T, E>
```

---

## 11. Future<T> — the cancel function contract

`Future.make` takes a function that receives a `resolve` callback and
returns a **cancel function**. The cancel function contract:

1. After cancel is called, `resolve` must never be called
2. If `resolve` has already been called before cancel, cancel is a no-op
3. Cancel may be called multiple times — idempotent

Implementation pattern:

```typescript
function make<T>(fn: (resolve: (value: T) => void) => () => void): Future<T> {
  return {
    _tag: 'Future' as const,
    get(onResolve: (value: T) => void): () => void {
      let cancelled = false
      const cancel = fn((value) => {
        if (!cancelled) {
          onResolve(value)
        }
      })
      return () => {
        cancelled = true
        cancel()
      }
    },
  }
}
```

The `cancelled` flag is set by the returned cancel function — it wraps
the user-provided cancel function to ensure `onResolve` is never called
after cancellation, regardless of the implementation of the inner cancel.

---

## 12. JSDoc on every exported symbol

Every exported type, function, and constant must have JSDoc. Minimum:
one sentence explaining what it does and when to use it. For types,
include the list of variants and their semantics. For functions,
include `@param` for non-obvious parameters and `@example`.

```typescript
/**
 * Represents a value that may or may not be present.
 * Use instead of `null | undefined` to make absence explicit and composable.
 *
 * @example
 * const name = Option.fromNullable(user.preferredName)
 *   .getOr(user.firstName)
 */
type Option<T> = ...
```

---

## 13. No `any` — use `unknown` and narrow

The Biome config bans `any` as an error. When the type of a value is
genuinely unknown, use `unknown` and narrow with type guards or
discriminated union checks.

The one exception: internal implementation details where `unknown` would
require excessive casting. In these cases, use `// biome-ignore lint/suspicious/noExplicitAny: <reason>` with a specific, honest reason.

```typescript
// ✅ Correct
function fromTryCatch<T>(fn: () => T): Result<T, unknown>

// ❌ Wrong
function fromTryCatch<T>(fn: () => T): Result<T, any>
```
