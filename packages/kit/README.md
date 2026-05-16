# @repo/kit

Product-shaped composed React components for the funding workspace.

This package is where generic UI primitives from `@repo/ui` meet domain-shaped
data from `@repo/domain`. It stays render-focused: no data fetching, no Next.js
routing, no auth, no tRPC, no database code, and no app-level i18n providers.
It currently exposes only accepted baseline components while the next app
vertical is rebuilt.

## Exports

Root export:

```ts
import {
  DealCommitmentsTable,
  DealProgressPanel,
} from '@repo/kit'
```

Fixture data is not exported from this package. App routes should use app-owned
data adapters rather than importing package fixtures.

## Component Scope

Accepted baselines:

- `DealCommitmentsTable` — commitment operations table baseline.
- `DealProgressPanel` — deal progress command panel baseline.

## Boundary Rules

May import:

- React
- `lucide-react`
- `ts-pattern`
- `@repo/domain`
- `@repo/ui`

Must not import:

- Next.js modules
- `next-intl`
- app code
- tRPC clients or routers
- database/server/auth modules
- raw color values or manual `dark:` Tailwind variants

The package accepts labels and `locale` values through props. App-level
translation and routing concerns belong in `apps/web`.

## Commands

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm storybook:build
```

See [../../docs/20-specs/kit-spec.md](../../docs/20-specs/kit-spec.md),
[../../docs/30-testing/testing-kit.md](../../docs/30-testing/testing-kit.md), and
[../../docs/10-architecture/package-boundaries.md](../../docs/10-architecture/package-boundaries.md).
