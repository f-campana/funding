# Ralph Loop Prompt — Investor Records V2 + Mobile/Narrow Behavior

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

## Objective

Refine the current `@repo/kit` dashboard so investor records feel like a real
private-markets operations surface and the dashboard behaves responsibly at
narrow/mobile widths.

This is a bounded product-surface pass. It should improve `InvestorRow`, the
investor-record section inside `DealDashboardDemo`, narrow/mobile dashboard
composition, and the stories/tests needed to verify those behaviors.

It is not a broad redesign, token pass, form pass, data-fetching pass, or
backend/API pass.

## Read First

Read these documents before editing files:

1. `docs/60-planning/investor-records-mobile-v2.md`
2. `docs/60-planning/dashboard-visual-qa.md`
3. `docs/60-planning/kit-visual-refinement-spec.md`
4. `docs/60-planning/design-refinement-plan.md`
5. `docs/20-specs/kit-spec.md`
6. `docs/30-testing/testing-kit.md`
7. `docs/20-specs/chart-primitives-spec.md`
8. `docs/20-specs/ui-spec.md`
9. `docs/10-architecture/package-boundaries.md`
10. `docs/20-specs/domain-spec.md`
11. `docs/20-specs/design-tokens-spec.md`
12. `docs/50-research/funding.md`
13. `docs/50-research/funding-frontend-spec.md`
14. `docs/50-research/fodmapp-ui-patterns.md`
15. `docs/10-architecture/monorepo-conventions.md`

Treat `docs/60-planning/investor-records-mobile-v2.md` as the current source of
truth for this pass. It supersedes broader visual-refinement notes where scope
is narrower here.

If documents conflict, follow the more specific/current document and record the
decision in `STATUS.md`.

## Current State

Already implemented:

- `@repo/core`
- `@repo/domain`
- `@repo/design-tokens`
- `@repo/tailwind-config`
- `@repo/ui`, including shadcn-compatible chart primitives
- `@repo/kit`, including:
  - `MoneyDisplay`
  - `MetricCard`
  - `CommitmentProgress`
  - `SpvStateTracker`
  - `DealTermsPanel`
  - `InvestorRow`
  - `TicketDistribution`
  - `InvestorStatusBreakdown`
  - `ActivityTimeline`
  - `DealDashboardDemo`
- `apps/web` renders `DealDashboardDemo` at `/deals/northstar-energy`
- `apps/storybook` renders `ui` and `kit` stories

The latest dashboard composition pass fixed the main desktop KPI/right-rail
composition issue. The remaining visible problems are concentrated around
investor-record quality and mobile/narrow behavior.

Known current issues:

- expanded investor rows mostly repeat summary fields
- desktop investor rows repeat visible column labels inside every row
- mobile/narrow dashboard stacks every module open, producing an overly long
  page
- secondary modules remain useful but need progressive disclosure or stronger
  subordination on narrow viewports
- Storybook needs investor-record and narrow-dashboard review stories that
  expose these risks

## Hard Boundaries

You may modify:

- `packages/kit/**`
- `apps/web/**` only if app-level e2e assertions or public route behavior must
  change because of the narrow/mobile dashboard behavior
- `PLAN.md`
- `STATUS.md`

You may modify docs only if implementation reveals a necessary correction.

Do not modify:

- `packages/core/**`
- `packages/domain/**`
- `packages/design-tokens/**`
- `packages/tailwind-config/**`
- `packages/ui/**`
- `apps/storybook/**` unless a Storybook configuration issue blocks existing
  kit stories

Do not implement:

- new domain package models
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
- Tremor
- Chart.js
- new token generation
- broad token redesign
- new external UI libraries
- full mobile navigation or app IA

`@repo/kit` must not import:

- `next-intl`
- `next/navigation`
- app code
- server/database modules
- tRPC clients or routers

## Required Outcome

Improve the investor-record and narrow-dashboard experience without expanding
product scope.

Required results:

1. `InvestorRow` collapsed state reads as a compact record row on desktop.
2. Repeated visible labels are removed from desktop row cells while accessible
   labels are preserved.
3. Mobile/narrow investor rows remain self-explanatory without relying on a
   table header.
4. Expanded investor rows reveal useful secondary operational detail instead of
   repeating the visible summary.
5. `DealDashboardDemo` uses a narrow/mobile composition that does not stack all
   secondary modules fully open.
6. Desktop dashboard behavior from the previous pass remains intact.
7. Long investor names and EUR values do not clip or create horizontal scroll.
8. Storybook includes investor-record and narrow-dashboard review surfaces.
9. Existing tests are updated or expanded for the new contracts.
10. Existing package boundaries remain intact.

## Investor Records V2 Target

### Collapsed Desktop Row

The desktop row should scan like an operations record, not a card.

It should show:

- investor name
- investor status
- country
- qualification
- commitment amount
- disclosure control

Guidance:

- use the dashboard table/header context for visible column labels
- hide repeated visible labels in row cells at desktop widths
- keep accessible labels available for assistive technology
- keep row height compact
- use `MoneyDisplay` for the amount
- keep status as compact metadata, not a large call-to-action
- preserve `data-slot="investor-row"` and useful `data-state`

### Collapsed Mobile/Narrow Row

The mobile/narrow row cannot rely on a table header.

It should show enough context directly:

- investor name and status
- commitment amount
- compact country/qualification metadata
- disclosure control with correct accessible label

Guidance:

- visible labels are acceptable on narrow layouts
- avoid a four-field vertical form-like stack for every investor if a more
  compact record layout is possible
- no horizontal scrolling
- no clipped long names or amounts

### Expanded Row

The expanded row should reveal operational detail that is not already obvious
from the summary.

Useful detail candidates:

- entity type
- KYC/document state
- subscription package state
- wire/payment state
- last event
- next action
- closing note
- internal reference

You may add optional presentation-only detail fields to `InvestorRowData` if
needed. Keep them local to `@repo/kit`; do not add domain package types. The
fields must be optional and backward-compatible with existing stories/tests.

Good pattern:

```ts
export type InvestorRowDetail = {
  readonly id: string
  readonly label: string
  readonly value: React.ReactNode
  readonly description?: React.ReactNode
  readonly tone?: 'neutral' | 'success' | 'warning'
}
```

This is only a suggestion. If you choose a different shape, keep it simple,
presentation-oriented, and documented through tests/stories.

Do not make the expanded panel a nested card. It should feel like opening a
record drawer inside the table.

## Mobile/Narrow Dashboard Target

At narrow widths, the dashboard should not become a long dump of every desktop
module fully open.

Primary content should remain visible in a sensible order:

```text
Deal header
KPI summary
Commitment progress
Investor status summary
Investor records
Secondary operating context
```

Secondary operating context can include:

- SPV lifecycle
- ticket distribution
- activity timeline
- deal terms

On narrow widths, secondary context should be visually subordinate. Acceptable
approaches:

- native `details`/`summary` sections inside `DealDashboardDemo`
- compact section blocks collapsed by default
- reordered modules where investor records appear before lower-priority panels

Desktop behavior must remain visible and operational:

- right rail remains a right rail
- lifecycle, investor status, activity timeline, and deal terms remain visible
  on desktop
- the previous KPI/main/right-rail composition must not regress

## Data And Domain Rules

For this pass:

- do not add domain package types
- do not move investor operational display fields into `@repo/domain`
- do not introduce backend/API concepts
- demo data may gain presentation-only fields inside `packages/kit`
- reusable component labels must still come from props, not hardcoded app
  translations
- default stories/demo labels may remain English
- all visible EUR values must use `MoneyDisplay`
- do not perform money math in React components
- no `number as EuroCents`

## Storybook Rules

Update or add kit stories so visual review covers:

- `InvestorRow` collapsed desktop/table context
- `InvestorRow` expanded with real secondary details
- `InvestorRow` narrow/mobile layout
- `DealDashboardDemo` desktop review
- `DealDashboardDemo` narrow/mobile review

Rules:

- product stories should render in realistic review containers
- centered examples are acceptable only for small isolated components
- story titles/descriptions should not dominate product review surfaces
- include at least one long investor name or legal-entity name
- include at least one large EUR value
- include at least one KYC/document blocker in expanded detail

Do not change Storybook app configuration unless a config issue blocks the
required stories.

## Token Rule

Do not change `@repo/design-tokens` in this loop.

Allowed in `@repo/kit`:

- semantic token classes
- canonical shadcn variable usage through Tailwind utilities
- existing chart CSS variables through `@repo/ui` chart primitives

Forbidden:

- raw hex/rgb/hsl/oklch color literals
- manual `dark:` utilities
- broad surface/elevation redesign in component code

If current tokens block the target behavior, record the exact blocker in
`STATUS.md` and leave token work for a separate pass.

## Milestones

Maintain `PLAN.md` from the start. Update `STATUS.md` after each milestone.

### Milestone 1 — Audit And Plan

- Read required docs.
- Inspect current `InvestorRow`, `DealDashboardDemo`, related stories/tests,
  and app e2e tests.
- Record the exact investor-record and narrow/mobile issues you intend to fix.
- Write the milestone plan to `PLAN.md`.
- Record assumptions and any doc conflict in `STATUS.md`.

Verification:

```bash
pnpm --filter @repo/kit typecheck
```

### Milestone 2 — InvestorRow V2

- Refine collapsed desktop row density.
- Preserve mobile/narrow self-explanatory labels.
- Make expanded content reveal secondary operational detail.
- Keep public props backward-compatible where practical.
- Add optional presentation-only detail fields only if needed.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
```

### Milestone 3 — Dashboard Investor Section And Narrow Behavior

- Refine the investor-record section in `DealDashboardDemo`.
- Reorder or progressively disclose secondary modules on narrow widths.
- Preserve desktop right-rail behavior.
- Ensure investor records are reachable without excessive scrolling on narrow
  viewports.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
pnpm --filter @repo/web build
```

### Milestone 4 — Stories And E2E Coverage

- Add or update investor-row stories for collapsed, expanded, and narrow
  review.
- Add or update dashboard stories for desktop and narrow review.
- Add or update app e2e coverage for the mobile/narrow public route if useful.
- Keep stories realistic and product-shaped.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
pnpm --filter @repo/web build
pnpm storybook:build
```

### Milestone 5 — Full Verification And Audit

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run these audits and record the result in `STATUS.md`:

```bash
rg -n "from ['\"]next-intl|from ['\"]next/navigation|from ['\"]@/|from ['\"].*trpc|from ['\"].*(server|database|db|prisma)" packages/kit/src || true
rg -n "React\.forwardRef|\bforwardRef\s*\(|\.displayName\s*=|data-testid|dangerouslySetInnerHTML|dark:|space-[xy]-|#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|oklch\(" packages/kit/src || true
rg -n "InvestorRow|InvestorRowData|DealDashboardDemo" packages/core packages/domain packages/design-tokens packages/tailwind-config packages/ui || true
```

Browser verification:

- Use the available in-app browser or Playwright browser tooling.
- Render `/deals/northstar-energy` at desktop width.
- Render `/deals/northstar-energy` at a narrow/mobile width.
- Render the dashboard Storybook desktop review story.
- Render the dashboard Storybook narrow/mobile review story.
- Render `InvestorRow` collapsed and expanded stories.

If Chromium/browser launch is blocked by the local environment, record the exact
blocker in `STATUS.md`. If browser access works, this pass should not be marked
complete without rendered desktop and narrow inspection.

## Completion Audit

Before reporting complete, confirm in `STATUS.md`:

- required docs were read
- `PLAN.md` and `STATUS.md` were maintained
- desktop investor rows no longer repeat visible column labels
- mobile investor rows remain self-explanatory
- expanded investor rows reveal secondary operational detail
- narrow/mobile dashboard does not stack all secondary modules fully open
- desktop dashboard right rail did not regress
- long names and money values do not clip or create horizontal scrolling
- Storybook contains investor-row and narrow-dashboard review surfaces
- no forbidden package boundaries were crossed
- no token package changes were made
- no app data/API/auth/form scope was added
- all required non-browser verification commands passed
- browser/e2e verification passed or is blocked with exact error text

Stop after verification and report:

- files changed
- verification results
- browser/e2e status
- any deliberate deviations
- any remaining visual risks
