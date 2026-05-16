# @repo/core

Functional building blocks for safe TypeScript code.

This package owns small algebraic data types used across the workspace. It has
no domain knowledge and no React dependency.

## Exports

Root export:

```ts
import { AsyncData, Future, Option, Result } from '@repo/core'
```

Adapter exports:

```ts
import { fromTanStackQuery } from '@repo/core/adapters/tanstack-query'
import { fromZod } from '@repo/core/adapters/zod'
```

## Types

- `Option<T>` — explicit presence or absence: `Some(value)` or `None`.
- `Result<T, E>` — explicit success or failure: `Ok(value)` or
  `Error(error)`.
- `AsyncData<T>` — async lifecycle: `NotAsked`, `Loading`, or `Done(value)`.
- `Future<T>` — lazy, cancellable async computation.

All types are plain discriminated unions and are compatible with `ts-pattern`.

## Examples

```ts
const name = Option.fromNullable(user.profile?.name).getOr('Anonymous')
```

```ts
const parsed = Result.fromTryCatchTyped(
  () => JSON.parse(raw),
  (error) => ({ _tag: 'InvalidJson' as const, error }),
)
```

```ts
const state = AsyncData.Done(Result.Ok(['investor-1']))
```

```ts
const cancel = Future.fromPromise(() => fetch('/api/investors')).get((result) => {
  // Result<Response, Error>
  void result
})

cancel()
```

## Commands

```bash
pnpm --filter @repo/core typecheck
pnpm --filter @repo/core lint
pnpm --filter @repo/core test:coverage
```

## Non-Goals

- Money or financial primitives
- Branded domain IDs
- React hooks
- UI state managers
- Framework-specific behavior beyond isolated adapters

See [../../docs/20-specs/core-spec.md](../../docs/20-specs/core-spec.md) and
[../../docs/10-architecture/core-adrs.md](../../docs/10-architecture/core-adrs.md).

