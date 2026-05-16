# Ralph Loop Prompt — Kit Visual Refinement

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

## Objective

Refine the `@repo/kit` product surface so the current dashboard stops reading
as a generic card stack and starts reading as a premium private-markets
operations interface.

This is a product-component pass. It may use the implemented chart primitives
from `@repo/ui`, but it must not modify foundational packages, implement live
data, or add app flows.

## Read First

Read these documents before editing files:

1. `docs/60-planning/kit-visual-refinement-spec.md`
2. `docs/60-planning/design-refinement-plan.md`
3. `docs/20-specs/kit-spec.md`
4. `docs/30-testing/testing-kit.md`
5. `docs/20-specs/chart-primitives-spec.md`
6. `docs/30-testing/testing-chart-primitives.md`
7. `docs/20-specs/ui-spec.md`
8. `docs/30-testing/testing-ui.md`
9. `docs/10-architecture/package-boundaries.md`
10. `docs/20-specs/domain-spec.md`
11. `docs/20-specs/design-tokens-spec.md`
12. `docs/50-research/funding.md`
13. `docs/50-research/funding-frontend-spec.md`
14. `docs/50-research/fodmapp-ui-patterns.md`
15. `docs/10-architecture/monorepo-conventions.md`

Treat `docs/60-planning/kit-visual-refinement-spec.md` as the source of truth
for visual/product direction. Treat `docs/20-specs/kit-spec.md` as the source
of truth for existing package boundaries and first-batch component contracts.

If documents conflict, follow the more specific/current document and record the
conflict in `STATUS.md`.

## Current State

Already implemented:

- `@repo/core`
- `@repo/domain`
- `@repo/design-tokens`
- `@repo/tailwind-config`
- `@repo/ui`, including shadcn-compatible chart primitives
- `@repo/kit` first component batch:
  - `MoneyDisplay`
  - `MetricCard`
  - `CommitmentProgress`
  - `SpvStateTracker`
  - `DealTermsPanel`
  - `InvestorRow`
  - `DealDashboardDemo`
- `apps/web` renders `DealDashboardDemo` at `/deals/northstar-energy`
- `apps/storybook` renders `ui` and `kit` stories

Known visual issue:

- the dashboard is structurally correct but still too generic
- the page needs stronger dashboard hierarchy, chart-backed context, activity,
  and table-like financial records
- `SpvStateTracker` already supports `horizontal` and `compact`; preserve that
  no-clipping contract

## Hard Boundaries

You may modify:

- `packages/kit/**`
- `apps/web/**` only if the `DealDashboardDemo` public API changes or e2e needs
  a narrow assertion update
- `pnpm-lock.yaml` only if a direct kit dependency is added
- `PLAN.md`
- `STATUS.md`

You may modify docs only if implementation reveals a necessary correction.

Do not modify:

- `packages/core/**`
- `packages/domain/**`
- `packages/design-tokens/**`
- `packages/tailwind-config/**`
- `packages/ui/**`
- `apps/storybook/**` unless a Storybook config issue blocks kit stories

Do not implement:

- investor commitment form
- React Hook Form
- Zod resolver integration
- tRPC
- GraphQL
- auth/session logic
- database or API clients
- server actions
- route handlers
- TanStack Table
- TanStack Virtual
- D3
- XState
- real-time data
- broad token redesign

`@repo/kit` must not import:

- `next-intl`
- `next/navigation`
- app code
- server/database modules
- tRPC clients or routers

## Dependency Rule

`@repo/ui` now provides chart composition helpers, but Recharts primitives are
still imported from `recharts` by chart consumers.

If `@repo/kit` imports Recharts primitives directly, add `recharts` as a normal
runtime dependency of `@repo/kit`. Do not rely on `@repo/ui`'s transitive
dependency.

Do not add Tremor, D3, Chart.js, TanStack Table, or TanStack Virtual.

## Required Outcome

Refine or add the following product components:

- preserve/refine `SpvStateTracker` with `horizontal` and `compact` variants
- refine `MetricCard`
- refine `CommitmentProgress` or introduce a clearer `CommitmentOverview`
- refine `InvestorRow`
- add `TicketDistribution`
- add `InvestorStatusBreakdown`
- add `ActivityTimeline`
- refine `DealDashboardDemo` into a page-width review surface

Keep `MoneyDisplay` focused and exact. Do not add domain ratio helpers or money
math to `@repo/domain`.

## Suggested Public APIs

Use these as a starting contract unless implementation reveals a simpler better
shape. If you deviate, record why in `STATUS.md`.

```ts
export type TicketDistributionSegment = {
  readonly id: string
  readonly label: string
  readonly amount: EuroCents
  readonly investorCount: number
  readonly percentageBasisPoints: number
}

export type TicketDistributionProps = {
  readonly title: string
  readonly description?: string
  readonly segments: readonly TicketDistributionSegment[]
  readonly locale?: string
  readonly emptyLabel?: string
  readonly className?: string
}

export type InvestorStatusBreakdownItem = {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly percentageBasisPoints: number
}

export type InvestorStatusBreakdownProps = {
  readonly title: string
  readonly description?: string
  readonly items: readonly InvestorStatusBreakdownItem[]
  readonly emptyLabel?: string
  readonly className?: string
}

export type ActivityTimelineItem = {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly timestamp: string
  readonly tone?: 'neutral' | 'success' | 'warning'
}

export type ActivityTimelineProps = {
  readonly title: string
  readonly items: readonly ActivityTimelineItem[]
  readonly emptyLabel?: string
  readonly className?: string
}
```

Rules:

- visible labels are provided as props
- demo labels may be English static text inside `DealDashboardDemo`
- reusable components must not import `next-intl`
- percentages are display inputs or computed from local static demo data only
- use `EuroCents` and `MoneyDisplay` for visible money amounts

## Visual Direction

Make the dashboard:

- denser but still legible
- more operational
- less uniformly card-based
- less "generic shadcn demo"
- clearly about deal progress, investor movement, and closing work

Use:

- table-like rows and separators where information is record-like
- chart-backed distribution widgets where they answer a real operational
  question
- clear primary/secondary hierarchy
- subdued color and exact money typography
- compact activity/timeline texture

Avoid:

- decorative dashboard charts without decision value
- bright fintech/neobank colors
- raw color utilities or manual `dark:` classes
- nested card piles
- fake action-heavy controls

## Milestones

Maintain `PLAN.md` from the start. Update `STATUS.md` after each milestone.

### Milestone 1 — Audit And Plan

- Read required docs.
- Inspect current kit components and stories.
- Confirm whether `recharts` is needed as a direct kit dependency.
- Write a concise milestone plan to `PLAN.md`.
- Record current assumptions in `STATUS.md`.

Verification:

```bash
pnpm --filter @repo/kit typecheck
```

### Milestone 2 — Distribution And Activity Components

Implement:

- `TicketDistribution`
- `InvestorStatusBreakdown`
- `ActivityTimeline`

Expected files:

```text
packages/kit/src/distribution/ticket-distribution.tsx
packages/kit/src/distribution/investor-status-breakdown.tsx
packages/kit/src/distribution/index.ts
packages/kit/src/activity/activity-timeline.tsx
packages/kit/src/activity/index.ts
```

Rules:

- use `@repo/ui` chart primitives where they materially help
- use Recharts directly only through a direct `@repo/kit` dependency
- support empty states
- expose stable `data-slot` attributes
- use semantic Tailwind classes only
- no `space-x-*` / `space-y-*`

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
```

### Milestone 3 — Refine Existing Components

Refine:

- `MetricCard`
- `CommitmentProgress` or add `CommitmentOverview`
- `InvestorRow`
- `SpvStateTracker` only if needed, preserving variants and tests
- `DealTermsPanel` only if it improves dashboard hierarchy

Rules:

- preserve public APIs where practical
- add new props only when they reduce hardcoded demo assumptions
- do not break `apps/web` unless updating the integration is part of the same
  milestone
- keep exact money rendering through `MoneyDisplay`

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
```

### Milestone 4 — Dashboard Composition

Refine `DealDashboardDemo`:

- stronger page-level hierarchy
- better primary operating row
- chart/distribution context
- activity timeline
- refined investor commitments surface
- compact sidebar lifecycle still clean

If the exported component API changes, update `apps/web` narrowly and record the
app change in `STATUS.md`.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit test
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
```

### Milestone 5 — Stories And Tests

Add or update stories:

- `Kit/DealDashboardDemo` page-width desktop review
- `Kit/SpvStateTracker` compact/sidebar and horizontal/wide
- `Kit/TicketDistribution`
- `Kit/InvestorStatusBreakdown`
- `Kit/ActivityTimeline`
- updated stories for refined components

Add or update tests:

- behavior/contract tests for new components
- accessibility checks for representative states
- investor row disclosure still works
- dashboard smoke and accessibility checks still pass
- package export smoke test covers new exports

Visual regression:

- allowed but not mandatory
- add Playwright screenshots only for stable surfaces
- if browser permissions block screenshot/e2e execution, document the exact
  blocker in `STATUS.md`

Verification:

```bash
pnpm --filter @repo/kit test:coverage
pnpm storybook:build
```

### Milestone 6 — Full Verification And Audits

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run package-boundary audits:

```bash
rg -n "from ['\"]next-intl|from ['\"]next/navigation|from ['\"]@/|from ['\"].*trpc|from ['\"].*(server|database|db|prisma)" packages/kit/src || true
rg -n "React\\.forwardRef|\\bforwardRef\\s*\\(|\\.displayName\\s*=|data-testid|dangerouslySetInnerHTML|dark:|space-[xy]-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/kit/src || true
rg -n "TicketDistribution|InvestorStatusBreakdown|ActivityTimeline" packages/core packages/domain packages/design-tokens packages/tailwind-config packages/ui apps/web || true
```

The first two audits should return no forbidden hits. The third audit should
return no hits outside allowed app integration text unless an app update was
explicitly needed and documented.

If app E2E was affected or browser access is available, also run:

```bash
pnpm --filter @repo/web e2e
```

If local browser launch is blocked by macOS sandbox permissions, document the
exact blocker in `STATUS.md` and provide server-render/build evidence instead.

## Completion Audit

Before finishing, verify and record in `STATUS.md`:

- required new components exist and are exported
- `DealDashboardDemo` uses the new/refined components
- `SpvStateTracker` remains clean in compact/sidebar and horizontal/wide stories
- `packages/core`, `packages/domain`, `packages/design-tokens`,
  `packages/tailwind-config`, and `packages/ui` were not modified
- no app route/API/auth/data work was introduced
- no broad token redesign was introduced
- no forbidden imports or styling patterns were introduced
- all verification commands passed or any browser-only blocker is documented

Stop after verification and report the final status.
