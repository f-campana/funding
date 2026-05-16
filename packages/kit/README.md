# @repo/kit

Product-shaped composed React components for the funding workspace.

This package is where generic UI primitives from `@repo/ui` meet domain-shaped
data from `@repo/domain`. It stays render-focused: no data fetching, no Next.js
routing, no auth, no tRPC, no database code, and no app-level i18n providers.

## Exports

Root export:

```ts
import {
  CommitmentProgress,
  DealDashboardDemo,
  DealTermsPanel,
  InvestorRow,
  MetricCard,
  MoneyDisplay,
  SpvStateTracker,
} from '@repo/kit'
```

Fixture export:

```ts
import { northstarDealFixture } from '@repo/kit/fixtures'
```

Fixture data is intentionally kept off the root export. App routes should use
app-owned data adapters rather than importing fixtures directly throughout route
files.

## Component Scope

Implemented first composed batch:

- `MoneyDisplay` — locale-aware EUR rendering through `@repo/domain`.
- `MetricCard` — compact label/value/supporting text display.
- `CommitmentProgress` — committed vs target visualization using exact
  `EuroCents` inputs.
- `SpvStateTracker` — SPV lifecycle display backed by domain status order.
- `DealTermsPanel` — deal term/value list.
- `InvestorRow` — expandable investor commitment row.
- Deal operations components — readiness, blockers, reconciliation, investor
  operations, document completeness, activity, and the assembled
  `DealDashboardDemo` surface for Storybook and review.

## Boundary Rules

May import:

- React
- `motion`
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
