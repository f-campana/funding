# Architecture Decision Records — `@repo/core`

Each ADR records a significant decision: what was decided, why, and what was explicitly rejected. The rejected alternatives section is as important as the decision itself.

---

## ADR-001: Build a custom library instead of using Boxed directly

**Status:** Accepted  
**Date:** April 2026

### Context

Swan's `@bloodyowl/boxed` (also known as `boxed.cool`) already solves the core problem: it provides `Option`, `Result`, `AsyncData`, and `Future` for TypeScript with a small API surface, ts-pattern compatibility, and production validation at scale inside Swan's banking platform. The library is well-maintained, open source, and MIT-licensed.

### Decision

Build a custom library rather than adopt Boxed directly.

### Rationale

**Understanding over adoption.** The primary motivation is not technical superiority — Boxed is a well-designed library. The motivation is that building these types from scratch forces a deep understanding of the underlying patterns: why Functors compose, why Monad laws matter, why `Future` cancellation is structured the way it is. Using Boxed as a black box forecloses that understanding. Building it produces it.

**Control over the API surface.** Boxed's API was designed for Swan's specific codebase and conventions. Our adapters (TanStack Query integration, Zod integration) can be designed to fit our patterns precisely rather than working around someone else's conventions.

**Dependency ownership.** A dependency on an external library means accepting its versioning, its breaking changes, and the risk that maintenance decisions diverge from our needs. For a library this central to our codebase, owning it is worth the build cost.

**Scope control.** We can start with fewer features (no `Deferred`, no `Boxed.default`, limited combinators) and add deliberately as we discover actual needs. Boxed's full API includes features we don't yet need and may never need.

### Rejected alternatives

**Adopt Boxed directly.** Rejected for the reasons above. If the learning objective were not present, this would be the practical choice. Boxed is production-validated at a scale we have not yet reached.

**Use fp-ts.** Rejected decisively. fp-ts implements a comprehensive category theory hierarchy (Functor, Applicative, Monad, Foldable, Traversable, ...) with Haskell-derived naming and pipe-based composition. The conceptual overhead is high, the API surface is large, and it requires familiarity with functional programming theory to use correctly. Our stated principle is accessible naming and small API surface — fp-ts is the opposite on both.

**Use neverthrow (Result only).** A well-regarded Result library for TypeScript. Rejected because it covers only one of the four types we need, and combining it with a separate AsyncData library creates two inconsistent APIs, two sets of conventions, and two sources of documentation.

### Consequences

We build, maintain, and test the library ourselves. The initial build cost is modest (the spec is clear, the prior art is well-documented). The ongoing maintenance cost is low for a library with no runtime dependencies and a frozen API surface.

---

## ADR-002: Chaining API over pipe-based composition

**Status:** Accepted  
**Date:** April 2026

### Context

Functional programming in TypeScript has two major API styles for composing operations:

**Chaining:** Methods on the value that return new values.
```typescript
option.map(fn1).flatMap(fn2).getOr(fallback)
```

**Piping:** Pure functions composed with a `pipe` utility.
```typescript
pipe(option, map(fn1), flatMap(fn2), getOr(fallback))
```

Both are valid and both are used in production TypeScript codebases. fp-ts uses piping. Boxed uses chaining.

### Decision

Use chaining as the primary API style.

### Rationale

**IDE autocomplete.** After typing `option.`, TypeScript's language server immediately shows every available operation with its signature. After typing `pipe(option,`, the developer must remember the function names and import them. For a library whose goal is to be approachable, autocomplete on the value is a meaningful ergonomic advantage.

**No utility import required.** Chaining requires no `pipe` function. The operations are self-contained on the value. This reduces the surface area of what a new user must learn.

**Consistent with Boxed.** Our primary reference implementation uses chaining. Our API should be learnable by someone who has used Boxed, and should not surprise someone reading Boxed's code for reference.

**Readability for the team.** The team has a TypeScript/React background, not an Haskell/PureScript background. Chaining reads left-to-right in the natural order of operations. `option.map(fn).flatMap(fn2)` maps, then flatMaps. `pipe(option, map(fn), flatMap(fn2))` is functionally identical but requires familiarity with `pipe`'s argument order.

### Rejected alternatives

**Pipe-based composition (fp-ts style).** Rejected primarily on ergonomics grounds for the team's current background. The pipe style has genuine advantages: it composes with arbitrary functions, avoids the need for method definitions on every type, and is strictly more functional. If the team's composition needs grow significantly or if we decide to align with fp-ts conventions, this can be revisited as ADR-002-revised.

**Dual API (both chaining and pipe).** Rejected. Maintaining two APIs doubles the surface, doubles the documentation, and introduces questions about which style to prefer in code review. One coherent API is better than two inconsistent ones.

### Consequences

Operations are defined as methods on objects returned by constructors. The `_tag` discriminant remains accessible for ts-pattern, but the methods provide the primary interface for most usage.

---

## ADR-003: Discriminated unions over class instances

**Status:** Accepted  
**Date:** April 2026

### Context

The chaining API decision (ADR-002) requires methods on the values. In TypeScript, methods can be provided two ways:

1. **Class instances** — `class Some<T> { map(fn) { ... } }` — methods via prototype chain
2. **Objects with methods** — plain objects where methods are function properties

Additionally, there's a question of the primary representation type: is `Option<T>` a union of class instances, or a union of plain object types with a discriminant?

### Decision

All types are plain discriminated union objects. Methods are defined as function properties on the object, not on a prototype. The `_tag` string discriminant is the primary structural marker.

```typescript
// What Option.Some(42) produces:
{
  _tag: 'Some',
  value: 42,
  map: (fn) => ...,
  flatMap: (fn) => ...,
  // etc.
}
```

### Rationale

**ts-pattern structural matching.** ts-pattern matches on object shape. It understands `{ _tag: 'Some' }`. It does not understand class instances — `instanceof` checks require explicit registration with ts-pattern. Plain objects work with ts-pattern out of the box, with no configuration.

**Serialization.** Plain objects serialize to JSON without custom serialization logic. A class instance carrying methods will produce unexpected behavior when passed through `JSON.stringify`. For debug logging, error reporting, and test fixtures, plain objects are significantly more predictable.

**No prototype chain overhead.** Every method call on a class instance traverses the prototype chain. For objects created millions of times in a financial projection, this has a measurable cost. Plain objects with function properties resolve immediately.

**Structural typing alignment.** TypeScript's type system is structural, not nominal. Two different types with the same shape are equivalent. Discriminated unions lean into this — the `_tag` field is the discriminant, and the structure is the type. Classes introduce nominal typing via `instanceof`, which works against TypeScript's structural model.

### Rejected alternatives

**Class-based implementation.** Rejected for the reasons above. The most significant blocker is ts-pattern compatibility — making class instances work with ts-pattern requires extra configuration that is easy to forget and hard to enforce.

**Abstract types with sealed constructors (like Haskell ADTs).** Not expressible in TypeScript without significant complexity. Discriminated unions are TypeScript's native equivalent.

### Consequences

The `_tag` property is a published API contract. If pattern-matching code in application layer uses `option._tag === 'Some'` directly (or via ts-pattern), we must never rename `_tag` or change the discriminant values in a non-breaking release.

---

## ADR-004: Naming conventions — accessibility over category theory

**Status:** Accepted  
**Date:** April 2026

### Context

The types in this library derive from functional programming's algebraic tradition. The academic naming for these types uses terminology from Haskell and category theory:

| Academic name | Our name |
|---|---|
| `Maybe<T>` or `Option<T>` | `Option<T>` |
| `Just<T>` | `Some<T>` |
| `Nothing` | `None` |
| `Either<L, R>` or `These<A, B>` | `Result<T, E>` |
| `Right<T>` (success) | `Ok<T>` |
| `Left<E>` (failure) | `Error<E>` |
| `RemoteData<T, E>` | `AsyncData<T>` |
| `NotAsked`, `Loading`, `Success`, `Failure` | `NotAsked`, `Loading`, `Done` |
| `Task<T>` or `IO<T>` | `Future<T>` |

### Decision

Use accessible, descriptive names throughout. The names chosen should be self-explanatory to a developer who has never encountered functional programming terminology.

### Rationale

**The library's stated goal is accessible naming.** A developer encountering `Option.Some(value)` understands it immediately: there is some value. A developer encountering `Option.Just(value)` must already know the Haskell/Scala convention or look it up. The library's users are TypeScript/React developers, not Haskellers.

**`Result` over `Either`.** `Either<L, R>` is symmetric — neither side is designated success or failure. `Result<T, E>` has an asymmetry built into the name: the first type parameter is the result value, the second is the error. This is both more descriptive and more aligned with how the type is used.

**`Ok/Error` over `Right/Left`.** The spatial metaphor of `Right` for success and `Left` for failure is an accident of history (Haskell's convention that success goes right because it's "right"). `Ok` and `Error` describe the semantics directly.

**`AsyncData` over `RemoteData`.** `RemoteData` implies the data comes from a remote (network) source. `AsyncData` describes any asynchronous operation — including local computation, file reading, or any future async primitive.

**`Done` over `Success` and `Failure`.** The `Done` state wraps a `Result<T, E>`. The `Done` name signals completion of the async operation without prejudging whether that completion was a success or failure — that's the inner `Result`'s job. `Success` and `Failure` as AsyncData states would need to be duplicated inside the `Result`, creating redundancy.

### Rejected alternatives

**Use Haskell-derived naming throughout.** Rejected. The library's users are not Haskell programmers. `Just`, `Nothing`, `Right`, `Left` require learning a convention that adds no value for our team.

**Match fp-ts naming exactly.** Rejected. fp-ts uses `O.some`, `O.none`, `E.right`, `E.left` — abbreviated module namespaces. This creates name collisions with natural TypeScript identifiers and requires the module prefix convention to disambiguate.

**Match Boxed naming exactly.** Acceptable — Boxed's naming is well-considered and similar to ours. Minor divergences: we use `Error` instead of `Error` (same), `Done` instead of `Done` (same). Our naming is effectively aligned with Boxed.

### Consequences

The names are a public API. `Option.Some`, `Option.None`, `Result.Ok`, `Result.Error`, `AsyncData.NotAsked`, `AsyncData.Loading`, `AsyncData.Done` are the published discriminant values. Application code that uses these values in pattern matching is a consumer of this API contract.

---

## ADR-005: AsyncData's value type is T, not Result<T, E>

**Status:** Accepted  
**Date:** April 2026

### Context

`AsyncData<T>` has three states: `NotAsked`, `Loading`, `Done(value: T)`. The `T` is intentionally left generic. The canonical usage is `AsyncData<Result<T, E>>`, but the library does not enforce this at the type level.

An alternative design would encode the error directly: `AsyncData<T, E>` with states `NotAsked | Loading | Done(T) | Failed(E)`. This is how `RemoteData` in some implementations is defined.

### Decision

`AsyncData<T>` takes one type parameter. Error handling is the responsibility of the inner `Result<T, E>`, not of `AsyncData` itself.

### Rationale

**Separation of concerns.** `AsyncData` models the async lifecycle. `Result` models success/failure. Combining them in a single type creates a four-state flat union where two of the states (`Done(T)` and `Failed(E)`) represent the same lifecycle phase (completed) with different outcomes. The distinction is cleaner when the types are separate.

**Composability.** `AsyncData<Option<T>>`, `AsyncData<T[]>`, `AsyncData<number>` are all valid. The inner type does not need to be a `Result`. A query that returns a list has state `AsyncData<T[]>` — there is no error type because TanStack Query handles the error at the query layer. Making the error type mandatory would force a phantom error type parameter everywhere.

**`Done` state is richer.** When `T = Result<Data, Error>`, the `Done` state can contain `Ok(data)` or `Error(err)`. The UI can then distinguish between "request completed successfully" and "request completed with a domain error" differently from "request is still in flight". This two-level structure is more expressive than a flat four-state enum.

**Alignment with Boxed.** Boxed makes the same choice for the same reasons. The production validation at Swan confirms this is not a design mistake.

### Rejected alternatives

**`AsyncData<T, E>` with four states.** Rejected. Flat four-state enum conflates "completed" lifecycle with "outcome" semantics. The nesting `AsyncData<Result<T, E>>` is the more compositional model.

**Aliasing `AsyncData<Result<T, E>>` as `RemoteResult<T, E>`.** Tempting as a convenience but rejected. It introduces a new type name that is a composite of two existing types, creating documentation overhead and potential confusion about whether `RemoteResult` has different behavior than `AsyncData<Result>`. The nesting is explicit and self-documenting.

### Consequences

The canonical usage pattern is `AsyncData<Result<T, E>>`. This requires nested `.match()` calls in rendering code. This is intentional — the nesting makes the two-phase structure visible. Developers who find the nesting verbose can create a local utility function for their most common pattern.

---

## ADR-006: Future ships in v1, not deferred

**Status:** Accepted  
**Date:** April 2026

### Context

The original build plan deferred `Future<T>` to Phase 2, noting that tRPC handles the async lifecycle and `Future` could be added later. This ADR revisits that decision.

### Decision

`Future<T>` ships in v1 alongside `Option`, `Result`, and `AsyncData`.

### Rationale

**The `isMounted` problem is active today.** The primary motivation for `Future` is not convenience but correctness. A `useEffect` that fires an async operation and sets state on an unmounted component is a React warning in development and a potential memory leak in production. The `isMounted` guard is the standard workaround. Every developer who uses this library without `Future` will independently rediscover this problem and independently implement the workaround. Shipping `Future` in v1 makes the right solution the easy solution from the start.

**`Future` is the simplest of the four types.** It has fewer combinators than `Result`, no Applicative instances, and its core abstraction (a function that accepts a resolve callback and returns a cancel function) is simple to implement and simple to test. Deferring it to Phase 2 would not meaningfully simplify v1.

**Consistency with Boxed.** Boxed ships all four types together. A developer comparing our library to Boxed who finds `Future` missing will correctly identify this as an incomplete implementation.

**The React adapter pattern requires it.** The `useInvestors` hook pattern shown in §2.4 of the spec is a canonical usage that will appear in the first week of building the application layer. Shipping without `Future` means either reimplementing it ad-hoc in the application or using raw Promises with the `isMounted` guard.

### Rejected alternatives

**Defer `Future` to Phase 2.** Rejected for the reasons above. The previous reasoning was based on tRPC managing async lifecycle — but tRPC manages the data fetching lifecycle via TanStack Query, not the React effect lifecycle. `Future` solves a React problem that tRPC does not solve.

**Use AbortController with Promises directly.** The AbortController API solves the network cancellation problem but not the callback-fires-after-unmount problem. A Promise that resolves after the AbortController fires will still call its `.then()` handler. `Future` solves both because the cancel function prevents the resolve callback from ever being called.

### Consequences

v1 ships four types. The build plan is updated accordingly. `Future` tests must include cancellation property tests.

---

## ADR-007: TanStack Query adapter ships as a separate export

**Status:** Accepted  
**Date:** April 2026

### Context

The TanStack Query adapter converts `{ status, data, error }` from TanStack Query's `useQuery` hook into `AsyncData<Result<T, E>>`. It is a single pure function. The question is where it lives: in core, in a separate package, or as a separate export path within core.

### Decision

The adapter ships as a separate export path within the core package: `@repo/core/adapters/tanstack-query`. The core `index.ts` does not re-export it.

### Rationale

**Dependency graph.** The core library has zero runtime dependencies. If the TanStack Query adapter is in `index.ts`, importing `@repo/core` in a non-React context (a test, a Node.js script, a serverless function) would pull in TanStack Query as a transitive dependency. A separate export path allows tree-shaking.

**Optional peer dependency semantics.** TanStack Query is an optional peer dependency of the core library. A project that uses `Future` for its own async management and never uses TanStack Query should not need TanStack Query installed.

**Precedent.** This is the standard pattern for optional integrations in the TypeScript ecosystem: Zod integrations, React bindings, and adapter layers are consistently published as separate export paths or separate packages.

### Rejected alternatives

**Separate package `@repo/core-tanstack-query`.** Rejected as premature overhead for a small, stable adapter. A separate npm package adds versioning complexity, publication steps, and documentation overhead. An export path within the same package is simpler.

**Include in core `index.ts`.** Rejected for the dependency graph reasons above.

### Consequences

The adapter is imported explicitly: `import { fromTanStackQuery } from '@repo/core/adapters/tanstack-query'`. This requires the `exports` field in `package.json` to declare the adapter export path. TypeScript path resolution must be configured accordingly.

---

## ADR-008: Result.all collects all errors (Applicative semantics)

**Status:** Accepted  
**Date:** April 2026

### Context

`Result.all([r1, r2, r3])` combines multiple Results. There are two meaningful semantics for this combination:

1. **Short-circuit (Monad):** Return the first `Error` encountered. Subsequent Results are not evaluated.
2. **Collect all (Applicative):** Evaluate all Results. Return `Ok([v1, v2, v3])` if all succeed, or `Error([e1, e2, e3])` collecting all errors if any fail.

`flatMap` already provides short-circuit semantics. The question is what `all` should do.

### Decision

`Result.all` collects all errors. An input array of Results where three fail returns `Error([e1, e2, e3])`. This is the Applicative interpretation.

### Rationale

**`flatMap` already handles short-circuit.** If you want sequential, stop-on-first-error behavior, you chain `.flatMap()` calls. `Result.all` should not duplicate `flatMap` semantics under a different name.

**The primary use case for `all` is form validation.** A form with five fields should show all validation errors simultaneously, not just the first. The entire value of `all` is that it enables this pattern. A version that stops at the first error would be `flatMap` spelled differently.

**Error accumulation is the hard case.** Short-circuit is expressible with chained `flatMap`. Error collection requires a combinator. Giving the hard, non-obvious case its own function is the right division of responsibility.

**Consistency with Boxed.** Boxed's `Result.all` collects all errors. Our primary reference implementation makes this choice. Diverging without a strong reason adds unnecessary cognitive overhead for anyone familiar with Boxed.

### Rejected alternatives

**`Result.all` short-circuits on first error.** Rejected. This duplicates `flatMap` and destroys the primary use case (form validation showing all errors).

**Provide both `Result.all` (collect) and `Result.sequence` (short-circuit).** Considered but rejected for v1. The naming distinction between `all` and `sequence` is not self-evident. When the concrete need for a short-circuit `all` arises, we can introduce it with a clear name derived from the actual use case.

### Consequences

`Result.all` is the Applicative combinator. Its error type is an array: `Result<T[], E[]>`. Callers who want to display all errors receive them as a list. This requires the error type to be homogeneous across the combined Results — all errors must be the same type `E`. If errors have different types, map them to a common type before combining.
