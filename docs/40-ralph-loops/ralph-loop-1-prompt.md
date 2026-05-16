# Task: Implement `@repo/core` — Algebraic Data Types Library

You are implementing `packages/core` in a TypeScript monorepo. This is
the foundational library for a financial investment platform (Funding).
Everything else in the codebase depends on this library being correct.

Read all referenced documents **before writing any code**. The documents
contain decisions that must not be relitigated — they are constraints, not
suggestions.

---

## Documents to read first (in order)

1. `docs/20-specs/core-spec.md` — the full type specification and API surface
2. `docs/10-architecture/core-adrs.md` — architectural decisions and their rationale
3. `docs/10-architecture/ts-patterns-for-core.md` — TypeScript implementation patterns
4. `docs/30-testing/testing-core.md` — testing requirements and law verification
5. `docs/10-architecture/monorepo-conventions.md` — package structure, config, commands

Do not begin implementation until you have read all five documents.

---

## Your task

Implement `packages/core` completely, including:

1. All four types: `Option<T>`, `Result<T, E>`, `AsyncData<T>`, `Future<T>`
2. All operations specified in `core-spec.md` §2
3. All static combinators including `Result.all` (Applicative, not Monad)
4. Adapters: `tanstack-query` and `zod` (separate export paths)
5. Full test suite: unit tests + property-based law tests + Future cancellation tests
6. ts-pattern compatibility verification file
7. Complete monorepo setup: `package.json`, `tsconfig.json`, `vitest.config.ts`

---

## Milestones

Work through these in order. After each milestone, run the verification
commands. Do not proceed to the next milestone if verification fails.

### Milestone 1 — Monorepo scaffolding

Create the package structure:
```
packages/core/
  src/
    adapters/
  package.json
  tsconfig.json
  vitest.config.ts
```

Create root-level config files if they do not exist:
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `turbo.json`

**Verification:**
```bash
cd packages/core && pnpm typecheck
# Expected: no errors (empty src/index.ts)
```

---

### Milestone 2 — `Option<T>`

Implement `src/option.ts` with all constructors and operations:
- `Option.Some`, `Option.None`, `Option.fromNullable`, `Option.fromPredicate`
- `.map`, `.flatMap`, `.getOr`, `.getOrElse`, `.match`
- `.isSome`, `.isNone`, `.toResult`, `.filter`
- `Option.all` (2-tuple and variadic overloads)

Implement `src/option.test.ts` with:
- Unit tests for all operations
- Functor law property tests (identity, composition)
- Monad law property tests (left identity, right identity, associativity)

**Verification:**
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
# Expected: 100% coverage, all laws passing
```

---

### Milestone 3 — `Result<T, E>`

Implement `src/result.ts` with all constructors and operations:
- `Result.Ok`, `Result.Error`, `Result.fromTryCatch`, `Result.fromTryCatchTyped`
- `.map`, `.mapError`, `.flatMap`, `.getOr`, `.getOrElse`, `.match`
- `.isOk`, `.isError`, `.toOption`
- `Result.all` (MUST collect ALL errors — not short-circuit. See ADR-008)
- `Result.traverse`

Implement `src/result.test.ts` with:
- Unit tests for all operations
- Explicit test verifying `Result.all` collects ALL errors, not just the first
- Functor law property tests
- Monad law property tests

**Verification:**
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```

---

### Milestone 4 — `AsyncData<T>`

Implement `src/async-data.ts`:
- `AsyncData.NotAsked`, `AsyncData.Loading`, `AsyncData.Done`
- `.map`, `.flatMap`, `.match`
- `.isNotAsked`, `.isLoading`, `.isDone`
- `AsyncData.all` (Loading if any Loading, Done only if all Done)

Implement `src/async-data.test.ts`:
- Unit tests for all operations
- Functor law property tests
- Property test for `AsyncData.all` combining behaviour

**Verification:**
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```

---

### Milestone 5 — `Future<T>`

Implement `src/future.ts`:
- `Future.make` — the primary constructor (see ts-patterns-for-core.md §11 for the exact cancel pattern)
- `Future.value` — lift a resolved value
- `Future.fromPromise` — convert a Promise (loses cancellation)
- `.map`, `.flatMap`, `.get`

Implement `src/future.test.ts`:
- Unit tests for basic resolution
- Cancellation contract tests (see testing-core.md §5 — all three scenarios)
- `.map` and `.flatMap` composition tests

**Verification:**
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```

---

### Milestone 6 — Adapters

Implement `src/adapters/tanstack-query.ts`:
```typescript
// Converts TanStack Query useQuery/useSuspenseQuery result to AsyncData<Result<T,E>>
// TanStack Query is a peer dependency — import type only, never import at runtime
import type { UseQueryResult } from '@tanstack/react-query'
import type { AsyncData } from '../async-data'
import type { Result } from '../result'

export function fromTanStackQuery<T, E = Error>(
  query: UseQueryResult<T, E>,
): AsyncData<Result<T, E>>
```

Implement `src/adapters/zod.ts`:
```typescript
import type { ZodError, ZodSchema } from 'zod'
import type { Result } from '../result'

export function fromZod<T>(
  schema: ZodSchema<T>,
  value: unknown,
): Result<T, ZodError>
```

**Note:** Both adapters must declare `@tanstack/react-query` and `zod`
as peer dependencies in `packages/core/package.json` under
`peerDependenciesMeta.optional: true`. They are never installed as
direct dependencies of `@repo/core`.

**Verification:**
```bash
pnpm typecheck && pnpm lint
# Adapters do not need coverage — they are thin wrappers
```

---

### Milestone 7 — ts-pattern compatibility

Create `src/ts-pattern-compat.test-types.ts` as specified in
`testing-core.md` §6. This file must compile with zero errors.

Add to `packages/core/tsconfig.json` includes:
```json
"include": ["src/**/*.ts"]
```

The `test-types.ts` file is included in the TypeScript compile but
excluded from Vitest's test runner:
```typescript
// vitest.config.ts
test: {
  include: ['src/**/*.test.ts'],     // note: NOT *.test-types.ts
}
```

**Verification:**
```bash
pnpm typecheck
# The compat file must compile with zero errors
```

---

### Milestone 8 — `src/index.ts` barrel

Create the main barrel export as specified in `monorepo-conventions.md` §9.

Run the full verification suite one final time:

```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```

All of the following must be true:
- Zero TypeScript errors
- Zero Biome lint errors
- 100% line coverage
- 100% branch coverage
- 100% function coverage
- All Functor law tests passing
- All Monad law tests passing
- All Future cancellation tests passing
- ts-pattern compatibility file compiles

---

## Constraints — these are invariants, not preferences

These mirror the invariants in `core-spec.md` §5. Violating any of them
means the implementation is wrong, not just imperfect.

1. **Zero runtime dependencies.** `@repo/core`'s `dependencies` field in
   `package.json` must be empty. All test and type tooling goes in
   `devDependencies`. TanStack Query and Zod go in `peerDependencies`
   with `optional: true`.

2. **No class instances.** No `class` keyword anywhere in `src/`. All types
   are plain discriminated union objects with function properties.
   See `ts-patterns-for-core.md` §1 and §2.

3. **`_tag` values are frozen.** The discriminant values (`'Some'`, `'None'`,
   `'Ok'`, `'Error'`, `'NotAsked'`, `'Loading'`, `'Done'`, `'Future'`)
   must be exactly as specified. They are the public API.

4. **`Result.all` collects all errors.** It must NOT short-circuit on the
   first error. See ADR-008. The test in Milestone 3 verifies this explicitly.

5. **`Future` is lazy.** `Future.make`'s `fn` must not execute until `.get()`
   is called. A Future constructed but never `.get()`-ted must have no side effects.

6. **No `any`.** The Biome config bans it as an error. If you encounter a
   situation where `any` seems necessary, use `unknown` and narrow explicitly,
   or add a `// biome-ignore` comment with a specific, honest reason.

7. **100% test coverage.** Not 99%. If a branch cannot be tested, it should
   not exist. If it must exist (e.g., `assertNever`), use `/* v8 ignore next */`
   with an explanatory comment.

8. **Explicit return types on all exports.** Every exported function has an
   explicit return type annotation. See `ts-patterns-for-core.md` §5.

---

## What success looks like

At the end of this task, a developer importing from `@repo/core` can write:

```typescript
import { Option, Result, AsyncData, Future } from '@repo/core'
import { fromTanStackQuery } from '@repo/core/adapters/tanstack-query'
import { fromZod } from '@repo/core/adapters/zod'
import { match } from 'ts-pattern'

// Option with ts-pattern
const name: Option<string> = Option.fromNullable(user.preferredName)
match(name)
  .with({ _tag: 'Some' }, ({ value }) => display(value))
  .with({ _tag: 'None' }, () => display('Anonymous'))
  .exhaustive()

// Result railway
const result: Result<number, ParseError> = parseAmount(raw)
  .flatMap(validateMinimum)
  .flatMap(applyCarry)

// AsyncData from TanStack Query
const data: AsyncData<Result<Investor[], ApiError>> = fromTanStackQuery(query)
data.match({
  NotAsked: () => null,
  Loading: () => <Skeleton />,
  Done: (r) => r.match({
    Ok: (investors) => <Table data={investors} />,
    Error: (e) => <Error error={e} />,
  }),
})

// Future with React useEffect cancellation
useEffect(() => {
  const cancel = fetchInvestors(dealId).get(setInvestors)
  return cancel
}, [dealId])
```

And a TypeScript error is emitted if any variant of any type is not handled.

---

## Do not

- Do not add dependencies not listed in this prompt
- Do not modify files outside `packages/core/`
- Do not create a `dist/` folder — the package is consumed as source via
  TypeScript path resolution
- Do not use `jest`, `mocha`, or any test framework other than `vitest`
- Do not use `chai`, `sinon`, or assertion libraries other than `vitest`'s built-in `expect`
- Do not write snapshot tests
- Do not skip the law verification tests
- Do not create `__mocks__` directories
- Do not use `vi.mock()` to mock internal modules — if you need to mock
  something, the design needs to be reconsidered
