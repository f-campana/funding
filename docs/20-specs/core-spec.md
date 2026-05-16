# Core Library Specification
## `@repo/core` — Functional building blocks for safe TypeScript frontends

**Status:** Implemented · v1.0
**Author:** Fabien Campana
**Scope:** Core library only — `Option`, `Result`, `AsyncData`, `Future`
**Last updated:** May 2026

---

## 0. Purpose and Philosophy

This library provides four algebraic data types that solve a single problem: **TypeScript product types create impossible states, and those impossible states produce bugs**.

When you represent async state as `{ isLoading: boolean, data: T | null, error: E | null }`, you have created a type with 8 possible states, most of which your application never intentionally enters and none of which the compiler will warn you about entering. When you represent absence as `null | undefined`, you have created an implicit branching path that callers may or may not handle. When you represent a fallible operation as a function that either returns a value or throws, you have hidden the error path from the type system entirely.

This library's answer to all three problems is the same: **replace product types with sum types wherever the domain has exclusive alternatives**. The result is fewer impossible states, compiler-enforced exhaustive handling, and composable operations that propagate absence and failure without nested conditionals.

### Design principles

**Small API surface.** Each type exposes the minimum operations needed to be useful: `map`, `flatMap`, `getOr`, `match`, and a small number of constructors. Operators can be composed; a large API cannot be made small.

**Accessible naming.** `Some` and `None` over `Just` and `Nothing`. `Ok` and `Error` over `Right` and `Left`. `NotAsked`, `Loading`, `Done` over academic alternatives. The concepts come from category theory; the names should not.

**ts-pattern compatibility as a hard constraint.** Every type in this library is a plain discriminated union — no class instances, no prototype methods that would prevent structural matching. `ts-pattern`'s `.exhaustive()` must work natively on all types.

**No domain knowledge in the library.** `Money`, `EuroCents`, `InvestorId`, and every other application-domain type belong in the application. The library provides computational vocabulary. The application writes the sentences.

**Zero runtime dependencies.** The library has no dependencies other than TypeScript itself. Ecosystem adapters (TanStack Query, Zod) are separate exports that can be tree-shaken.

---

## 1. Scope

### In scope — v1

| Type | Purpose |
|---|---|
| `Option<T>` | Explicit, composable nullable |
| `Result<T, E>` | Explicit, composable fallible operation |
| `AsyncData<T>` | Async operation lifecycle with three exclusive states |
| `Future<T>` | Lazy, cancellable async computation |

### In scope — v1 adapters (separate export paths)

| Adapter | Purpose |
|---|---|
| `fromTanStackQuery(query)` | Convert TanStack Query result to `AsyncData<Result<T,E>>` |
| `Result.fromZod(schema, value)` | Convert Zod parse result to `Result<T, ZodError>` |
| `Option.fromNullable(value)` | Lift `T | null | undefined` to `Option<T>` |

### Explicitly out of scope

- `Money<Currency>` — application domain type, not a computational primitive
- Branded identity types (`InvestorId`, `ClaimId`) — application concern
- Any framework-specific hooks — adapters only, no React dependency in core
- `Either<L, R>` — `Result<T, E>` covers the same ground with better naming
- `IO`, `Task`, `Reader` monad — beyond the complexity budget for v1

---

## 2. Type Specifications

### 2.1 Option\<T\>

Represents a value that may or may not be present. Eliminates `null | undefined` from domain logic.

#### Type definition

```typescript
type Option<T> =
  | { readonly _tag: 'Some'; readonly value: T }
  | { readonly _tag: 'None' }
```

#### Constructors

```typescript
Option.Some<T>(value: T): Option<T>
Option.None<T>(): Option<T>
Option.fromNullable<T>(value: T | null | undefined): Option<T>
Option.fromPredicate<T>(value: T, predicate: (value: T) => boolean): Option<T>
```

#### Operations

```typescript
// Transform the value if present, propagate None if absent
option.map<U>(fn: (value: T) => U): Option<U>

// Chain Option-returning operations — prevents Option<Option<T>>
option.flatMap<U>(fn: (value: T) => Option<U>): Option<U>

// Extract with a fallback — terminates the Option chain
option.getOr(fallback: T): T
option.getOrElse(fn: () => T): T

// Exhaustive match — required for rendering
option.match<U>(cases: { Some: (value: T) => U; None: () => U }): U

// Predicate check — does not extract value
option.isSome(): this is { _tag: 'Some'; value: T }
option.isNone(): this is { _tag: 'None' }

// Convert to Result
option.toResult<E>(error: E): Result<T, E>

// Filter — None if predicate fails
option.filter(predicate: (value: T) => boolean): Option<T>
```

#### Static combinators

```typescript
// Combine Options — None if any input is None
Option.all<T, U>(a: Option<T>, b: Option<U>): Option<[T, U]>
Option.all<T extends readonly [Option<unknown>, Option<unknown>, ...Option<unknown>[]]>(
  ...options: T
): Option<OptionValues<T>>
Option.allFromRecord<T extends Record<string, Option<unknown>>>(record: T): Option<OptionRecord<T>>
```

#### Usage

```typescript
// Composing nullable operations
const displayName = user
  .flatMap(u => Option.fromNullable(u.profile))
  .flatMap(p => Option.fromNullable(p.preferredName))
  .getOr(user.map(u => u.firstName).getOr('Anonymous'))

// Exhaustive rendering — compiler enforces both cases
option.match({
  Some: (value) => <UserCard user={value} />,
  None: ()      => <EmptyState />,
})
```

---

### 2.2 Result\<T, E\>

Represents an operation that may succeed with a value or fail with a typed error. Makes error handling explicit and composable.

#### Type definition

```typescript
type Result<T, E> =
  | { readonly _tag: 'Ok';    readonly value: T }
  | { readonly _tag: 'Error'; readonly error: E }
```

#### Constructors

```typescript
Result.Ok<T, E>(value: T): Result<T, E>
Result.Error<T, E>(error: E): Result<T, E>
Result.fromTryCatch<T>(fn: () => T): Result<T, unknown>
Result.fromTryCatchTyped<T, E>(fn: () => T, mapError: (e: unknown) => E): Result<T, E>
```

#### Operations

```typescript
// Transform value on Ok, propagate Error unchanged
result.map<U>(fn: (value: T) => U): Result<U, E>

// Transform error on Error, propagate Ok unchanged
result.mapError<F>(fn: (error: E) => F): Result<T, F>

// Chain Result-returning operations — railway oriented
result.flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>

// Extract with fallback
result.getOr(fallback: T): T
result.getOrElse(fn: (error: E) => T): T

// Exhaustive match
result.match<U>(cases: { Ok: (value: T) => U; Error: (error: E) => U }): U

// Predicates
result.isOk():    this is { _tag: 'Ok';    value: T }
result.isError(): this is { _tag: 'Error'; error: E }

// Convert
result.toOption(): Option<T>
```

#### Static combinators

```typescript
// Sequential — short-circuits on first error (Monad)
Result.flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E>

// Parallel — collects ALL errors (Applicative)
Result.all<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<ResultValues<T>, ResultErrors<T>[number][]>

// Map an array, collecting all errors
Result.traverse<T, U, E>(
  items: T[],
  fn: (item: T) => Result<U, E>
): Result<U[], E[]>
```

#### Usage

```typescript
// Railway — sequential pipeline, stops at first error
const processCommitment = (raw: unknown): Result<Commitment, ProcessError> =>
  parseCommitment(raw)
    .flatMap(c => validateMinimumTicket(c, deal.minTicket))
    .flatMap(c => validateInvestorKyc(c, investor))
    .map(c => enrichWithDealTerms(c, deal))

// Collecting all errors — show complete form validation
const validateForm = (fields: FormFields): Result<ValidForm, ValidationError[]> =>
  Result.all([
    validateName(fields.name),
    validateEmail(fields.email),
    validateAmount(fields.amount),
  ])
```

---

### 2.3 AsyncData\<T\>

Represents the lifecycle of an async operation with three exclusive states. When nested with `Result<T, E>`, it yields four meaningful rendering outcomes without impossible boolean flag combinations.

#### Type definition

```typescript
type AsyncData<T> =
  | { readonly _tag: 'NotAsked' }
  | { readonly _tag: 'Loading'  }
  | { readonly _tag: 'Done'; readonly value: T }
```

The value type `T` is typically `Result<Data, Error>`, giving the full picture:

```typescript
type UserRequest = AsyncData<Result<User, ApiError>>
// Exactly 4 meaningful rendering outcomes:
// NotAsked         — never initiated
// Loading          — in flight
// Done(Ok(user))   — succeeded
// Done(Error(e))   — failed
```

#### Why four states, not three

`NotAsked` and `Loading` are different states that produce different UIs:
- `NotAsked` → render nothing (a button not yet pressed)
- `Loading` → render a skeleton or spinner (a request in flight)

TanStack Query's `{ isLoading, isError, data }` conflates these. A query that has never been enabled looks identical to a query that has started loading. On a conditional query (enabled only when a deal is selected), the UI difference matters.

#### Constructors

```typescript
AsyncData.NotAsked<T>(): AsyncData<T>
AsyncData.Loading<T>(): AsyncData<T>
AsyncData.Done<T>(value: T): AsyncData<T>
```

#### Operations

```typescript
// Transform Done value, propagate other states
asyncData.map<U>(fn: (value: T) => U): AsyncData<U>

// Chain — flatten AsyncData<AsyncData<T>>
asyncData.flatMap<U>(fn: (value: T) => AsyncData<U>): AsyncData<U>

// Exhaustive match — the primary rendering operator
asyncData.match<U>(cases: {
  NotAsked: () => U
  Loading:  () => U
  Done:     (value: T) => U
}): U

// Predicates
asyncData.isNotAsked(): this is { _tag: 'NotAsked' }
asyncData.isLoading():  this is { _tag: 'Loading' }
asyncData.isDone():     this is { _tag: 'Done'; value: T }
```

#### Static combinators

```typescript
// Combine — Loading if any Loading, NotAsked if any NotAsked, Done if all Done
AsyncData.all<T, U>(
  a: AsyncData<T>,
  b: AsyncData<U>
): AsyncData<[T, U]>
AsyncData.all<T extends readonly [AsyncData<unknown>, AsyncData<unknown>, ...AsyncData<unknown>[]]>(
  ...items: T
): AsyncData<AsyncDataValues<T>>
```

#### Usage

```typescript
// The canonical React rendering pattern
const InvestorPanel = ({ dealId }: Props) => {
  const investorData: AsyncData<Result<Investor[], ApiError>> =
    useInvestors(dealId)

  return investorData.match({
    NotAsked: () => null,
    Loading:  () => <InvestorSkeleton />,
    Done:     (result) => result.match({
      Ok:    (investors) => <InvestorTable investors={investors} />,
      Error: (error)     => <ErrorBanner error={error} />,
    }),
  })
}
```

---

### 2.4 Future\<T\>

A lazy, cancellable alternative to `Promise`. Does not start executing until `.get()` is called. Returns a cancel function that aborts the underlying operation when invoked.

#### Why Future over Promise

`Promise` is:
- **Eager** — starts executing on construction, not on consumption
- **Not cancellable** — once created, a Promise runs to completion regardless of whether the result is still needed
- **Error-conflating** — a rejected Promise conflates infrastructure errors (network failure, timeout) with domain errors (validation failed, not found)

In React, this causes:
- `useEffect` returning a Promise that sets state on an unmounted component
- The `isMounted` guard antipattern
- No way to abort a request when dependencies change mid-flight

`Future<T>` solves all three:
- **Lazy** — constructed futures are descriptions, not running computations
- **Cancellable** — `.get()` returns a `() => void` cancel function
- **Error-separated** — `Future<Result<T, E>>` distinguishes infrastructure from domain errors

#### Type definition

```typescript
type CancelFn = () => void
type Future<T> = {
  readonly _tag: 'Future'
  map: <U>(fn: (value: T) => U) => Future<U>
  flatMap: <U>(fn: (value: T) => Future<U>) => Future<U>
  get: (resolve: (value: T) => void) => CancelFn
}
```

#### Constructors

```typescript
// Primary constructor — fn receives resolve, returns cancel
Future.make<T>(fn: (resolve: (value: T) => void) => CancelFn): Future<T>

// Lift a resolved value — for testing and composition
Future.value<T>(value: T): Future<T>

// Convert from Promise — loses cancellation, gains compatibility
Future.fromPromise<T>(fn: () => Promise<T>): Future<Result<T, Error>>
```

#### Operations

```typescript
// Transform value when resolved
future.map<U>(fn: (value: T) => U): Future<U>

// Chain — sequence dependent async operations
future.flatMap<U>(fn: (value: T) => Future<U>): Future<U>

// Execute — starts the computation, returns cancel
future.get(onResolve: (value: T) => void): CancelFn
```

#### React integration pattern

```typescript
const useInvestors = (dealId: string) => {
  const [state, setState] = useState<AsyncData<Result<Investor[], ApiError>>>(
    AsyncData.NotAsked()
  )

  useEffect(() => {
    setState(AsyncData.Loading())

    const cancel = fetchInvestors(dealId).get(result =>
      setState(AsyncData.Done(result))
    )

    return cancel // React calls this on unmount or dealId change
  }, [dealId])

  return state
}
```

No `isMounted` guard. No stale state on component unmount. No cancelled requests setting state.

---

## 3. Composition Patterns

### 3.1 Nested matching

The primary composition idiom is nesting `.match()` calls:

```typescript
asyncData.match({
  NotAsked: () => <Idle />,
  Loading:  () => <Loading />,
  Done: (result) => result.match({
    Ok:    (data)  => <Success data={data} />,
    Error: (error) => <Error error={error} />,
  }),
})
```

This is intentionally explicit. A wrapper that flattens `AsyncData<Result<T, E>>` into a single 4-case match is a premature convenience that hides the type structure.

### 3.2 Pipeline composition with Result

```typescript
const pipeline = (input: RawInput): Result<Output, PipelineError> =>
  parseInput(input)              // Result<Parsed, ParseError>
    .mapError(toParseError)       // Result<Parsed, PipelineError>
    .flatMap(validate)            // Result<Validated, PipelineError>
    .flatMap(transform)           // Result<Output, PipelineError>
```

### 3.3 ts-pattern integration

Because all types are plain discriminated unions, `ts-pattern`'s `match` and `.exhaustive()` work natively:

```typescript
import { match } from 'ts-pattern'

// ts-pattern for complex multi-dimensional matching
const renderQualification = (qualification: Option<InvestorQualification>) =>
  match(qualification)
    .with({ _tag: 'None' },                          () => <QualificationRequired />)
    .with({ _tag: 'Some', value: 'professional' },   () => <ProfessionalBadge />)
    .with({ _tag: 'Some', value: 'informed' },        () => <InformedBadge />)
    .with({ _tag: 'Some', value: 'retail' },          () => <RetailWarning />)
    .with({ _tag: 'Some', value: 'non_eligible' },    () => <BlockedState />)
    .exhaustive() // compile error if a new qualification type is added
```

### 3.4 Adapters

#### TanStack Query adapter

```typescript
import { fromTanStackQuery } from '@repo/core/adapters/tanstack-query'

const useInvestors = (dealId: string) => {
  const query = useSuspenseQuery(investorsQuery(dealId))
  return fromTanStackQuery(query) // AsyncData<Result<Investor[], ApiError>>
}
```

#### Zod adapter

```typescript
import { fromZod } from '@repo/core/adapters/zod'

const parseCommitment = (raw: unknown): Result<Commitment, ZodError> =>
  fromZod(CommitmentSchema, raw)
```

---

## 4. Module Structure

```
@repo/core/
├── src/
│   ├── option.ts          — Option<T> type and operations
│   ├── result.ts          — Result<T, E> type and operations
│   ├── async-data.ts      — AsyncData<T> type and operations
│   ├── future.ts          — Future<T> type and operations
│   ├── index.ts           — Re-exports all four types
│   └── adapters/
│       ├── tanstack-query.ts
│       ├── zod.ts
│       └── index.ts
├── test/
│   ├── option.test.ts
│   ├── result.test.ts
│   ├── async-data.test.ts
│   ├── future.test.ts
│   └── properties/
│       ├── option.property.ts    — fast-check property tests
│       ├── result.property.ts
│       └── async-data.property.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Invariants

These do not bend. They exist because violating them has concrete, traceable costs.

1. **No domain types in the library.** A type that knows about money, investors, or any application domain does not belong here. Zero exceptions.

2. **No class instances as the primary representation.** All types are plain discriminated union objects. Chaining methods are defined on the object, not via prototype. ts-pattern and structural matching must work without the library present.

3. **No breaking changes to the discriminant.** The `_tag` values (`'Some'`, `'None'`, `'Ok'`, `'Error'`, `'NotAsked'`, `'Loading'`, `'Done'`) are part of the public API. Application code that pattern-matches on `_tag` must not break on a patch or minor update.

4. **Adapters have no effect on the core types.** The TanStack Query and Zod adapters are pure conversion functions. They do not modify the library's types and can be removed without affecting core behavior.

5. **`Future` is never eager.** A `Future` constructed with `Future.make` must not execute its `fn` until `.get()` is called. Violating this would break the React useEffect cancellation pattern.

6. **`Result.all` collects all errors.** The Applicative combinator must not short-circuit. If it short-circuits, it becomes `flatMap` under a different name, and the distinction between sequential and parallel error handling is lost.

---

## 6. Testing Requirements

### Unit tests (Vitest)

Every operation on every type has a unit test. Minimum coverage:

- Constructors produce correct `_tag` values
- `.map()` transforms value, preserves shape
- `.flatMap()` correctly flattens one level of nesting
- `.match()` calls the correct branch for each state
- `.getOr()` returns value on presence, fallback on absence
- `Result.all()` collects all errors (does not short-circuit)
- `Future.get()` returns a cancel function that prevents resolution after call

### Property-based tests (fast-check)

Functor laws for all four types:
- `x.map(id) === x` (identity)
- `x.map(f).map(g) === x.map(x => g(f(x)))` (composition)

Monad laws for `Option` and `Result`:
- `Option.Some(x).flatMap(f) === f(x)` (left identity)
- `m.flatMap(Option.Some) === m` (right identity)
- `m.flatMap(f).flatMap(g) === m.flatMap(x => f(x).flatMap(g))` (associativity)

`Future` cancellation:
- Calling the cancel function before resolution prevents the callback from firing
- Calling the cancel function after resolution is a no-op

### ts-pattern compatibility tests

```typescript
// These must compile without error
const o: Option<number> = Option.Some(1)
const r: Result<number, string> = Result.Ok(1)
const a: AsyncData<number> = AsyncData.Done(1)

match(o).with({ _tag: 'Some' }, () => 'some').with({ _tag: 'None' }, () => 'none').exhaustive()
match(r).with({ _tag: 'Ok' },   () => 'ok')  .with({ _tag: 'Error' }, () => 'err').exhaustive()
match(a)
  .with({ _tag: 'NotAsked' }, () => 'na')
  .with({ _tag: 'Loading' },  () => 'l')
  .with({ _tag: 'Done' },     () => 'd')
  .exhaustive()
```

---

## 7. Open Questions for v2

These are explicitly deferred. They should not creep into v1.

- **`Future.race` and `Future.all`** — combining multiple concurrent futures
- **`AsyncData.Reloading`** — a fifth state for background refresh (showing stale data while fetching fresh)
- **`Option.zip` alias** — `Option.all` already supports variadic tuples; a
  separate `zip` alias is deferred until it has a concrete readability benefit.
- **Result error union narrowing** — improving TypeScript inference when errors have different types across flatMap chains
- **Short-circuiting `sequence` for arrays** — `Result.traverse` ships in v1 with error-collection semantics; a separate short-circuiting array combinator is deferred until a concrete use case appears.

---

## 8. Non-Goals

These will never be in this library:

- **Lenses and optics** — use a dedicated optics library
- **Observable streams** — use RxJS or a streaming library
- **Effect system** — out of scope for a frontend utility library
- **JSON serialization helpers** — use Zod or the Zod adapter
- **React hooks** — hooks import React; the core library must not
