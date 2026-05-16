# Ralph Loop Prompt — Dashboard Composition V2

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

## Objective

Refine the current `@repo/kit` dashboard composition so the public app surface
and Storybook review surfaces stop reading as a stretched card grid and start
reading as a compact, premium private-markets operations dashboard.

This is a composition and visual QA pass. It is not a component-expansion pass.
The current component set is enough for this loop unless a tiny private helper
is needed to remove duplication inside `DealDashboardDemo`.

## Read First

Read these documents before editing files:

1. `docs/60-planning/dashboard-visual-qa.md`
2. `docs/60-planning/kit-visual-refinement-spec.md`
3. `docs/60-planning/design-refinement-plan.md`
4. `docs/20-specs/kit-spec.md`
5. `docs/30-testing/testing-kit.md`
6. `docs/20-specs/chart-primitives-spec.md`
7. `docs/20-specs/ui-spec.md`
8. `docs/10-architecture/package-boundaries.md`
9. `docs/20-specs/domain-spec.md`
10. `docs/20-specs/design-tokens-spec.md`
11. `docs/50-research/funding.md`
12. `docs/50-research/funding-frontend-spec.md`
13. `docs/50-research/fodmapp-ui-patterns.md`
14. `docs/10-architecture/monorepo-conventions.md`

Treat `docs/60-planning/dashboard-visual-qa.md` as the current source of truth
for this pass. It supersedes the earlier visual refinement prompt where the
current screenshots reveal new issues.

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

Known current visual issues:

- top-row metric cards stretch vertically to match the lifecycle panel
- large empty metric-card bodies make the dashboard look unfinished
- the committed-capital amount is too large for some card widths
- the screen still has too many equally weighted bordered cards
- some Storybook product stories are centered in huge empty canvases rather
  than realistic review containers
- the right rail should feel intentionally operational, not like leftover
  modules

## Hard Boundaries

You may modify:

- `packages/kit/**`
- `apps/web/**` only if app-level assertions or route copy must change because
  the `DealDashboardDemo` public behavior changed
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

- new domain models
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
- XState
- real-time data
- broad token redesign
- new exported kit widgets unless the need is recorded in `STATUS.md`

`@repo/kit` must not import:

- `next-intl`
- `next/navigation`
- app code
- server/database modules
- tRPC clients or routers

## Required Outcome

Improve the existing dashboard surface without expanding product scope.

Required results:

1. `DealDashboardDemo` uses a layout that separates compact KPI rows from
   taller sidebar/rail modules.
2. Metric cards no longer stretch vertically just because a sibling panel is
   taller.
3. Long EUR money values fit comfortably in metric cards and record rows.
4. The first viewport has one clear primary read.
5. The dashboard has fewer equally weighted cards and a clearer operating
   hierarchy.
6. The right rail reads as intentional operational context.
7. Storybook product stories use realistic review containers.
8. Constrained stories cover dashboard/sidebar/narrow-width risks.
9. Existing tests are updated or expanded for the new layout contracts.
10. Existing package boundaries remain intact.

## Composition Target

Use this target structure unless you find a simpler layout that satisfies the
same acceptance criteria:

```text
Deal header
Compact KPI strip
Main content region
  - Commitment progress / operating summary
  - Ticket distribution or investor concentration
  - Investor records
Right rail
  - SPV lifecycle compact
  - Investor status
  - Activity timeline
  - Deal terms
```

Important:

- the lifecycle panel must not define the height of the KPI strip
- repeated investor records should stay denser than cards
- not every module needs the same card treatment
- use separators, section rhythm, and compact rails where they improve
  hierarchy
- do not add fake action buttons just to make the header look busier

## Metric And Money Rules

For this pass, financial values must feel exact, stable, and controlled.

Rules:

- use `MoneyDisplay` for all visible EUR amounts
- do not perform money math in React components
- no `number as EuroCents`
- large metric values must have a bounded responsive size
- avoid text sizes that can clip at common desktop widths
- use tabular-number alignment for financial values
- metric-card descriptions should not sit in oversized empty bodies

If `MetricCard` needs a size or density variant, add it carefully while
preserving the existing public props.

## Storybook Rules

Product stories should reveal composition problems before the app route does.

Update kit stories so that:

- dashboard stories render in realistic page-width containers
- sidebar/right-rail stories render in constrained widths
- long money values are visible in at least one story
- narrow-width behavior is represented where relevant
- component titles/descriptions do not dominate the visual review surface
- centered examples remain acceptable only for small isolated components

Do not change Storybook app configuration unless a config issue blocks the
required stories.

## Token Rule

Do not change `@repo/design-tokens` in this loop.

If current tokens block the target composition, record the exact blocker in
`STATUS.md` and leave token changes for a separate token pass.

Allowed in `@repo/kit`:

- semantic token classes
- canonical shadcn variable usage through Tailwind utilities
- existing chart CSS variables through `@repo/ui` chart primitives

Forbidden:

- raw hex/rgb/hsl/oklch color literals
- manual `dark:` utilities
- broad surface/elevation redesign in component code

## Milestones

Maintain `PLAN.md` from the start. Update `STATUS.md` after each milestone.

### Milestone 1 — Audit And Plan

- Read required docs.
- Inspect current `DealDashboardDemo`, `MetricCard`, `CommitmentProgress`,
  `InvestorRow`, right-rail widgets, and related stories/tests.
- Record the exact layout issues you intend to fix.
- Write the milestone plan to `PLAN.md`.
- Record assumptions and any doc conflict in `STATUS.md`.

Verification:

```bash
pnpm --filter @repo/kit typecheck
```

### Milestone 2 — Layout And Metric Composition

- Refine `DealDashboardDemo` layout to prevent KPI card stretching.
- Make KPI cards compact and visually subordinate to the main operating read.
- Adjust `MetricCard` only if needed for density/size control.
- Keep public component APIs backward-compatible where practical.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
```

### Milestone 3 — Money Fit And Record Density

- Ensure long EUR values fit comfortably in metric cards and investor records.
- Refine `CommitmentProgress` layout only if the current container creates
  awkward spacing.
- Preserve investor-row disclosure behavior and record density.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
```

### Milestone 4 — Storybook Review Surfaces

- Update dashboard and product-component stories to use realistic containers.
- Add or update constrained-width stories for sidebar/right-rail contexts.
- Keep primitive-style centered examples only where appropriate.

Verification:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
pnpm storybook:build
```

### Milestone 5 — Full Verification And Audit

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web build
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run these audits and record the result in `STATUS.md`:

```bash
rg -n "from ['\"]next-intl|from ['\"]next/navigation|from ['\"]@/|from ['\"].*trpc|from ['\"].*(server|database|db|prisma)" packages/kit/src || true
rg -n "React\.forwardRef|\bforwardRef\s*\(|\.displayName\s*=|data-testid|dangerouslySetInnerHTML|dark:|space-[xy]-|#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|oklch\(" packages/kit/src || true
rg -n "DashboardComposition|MetricCard|DealDashboardDemo" packages/core packages/domain packages/design-tokens packages/tailwind-config packages/ui || true
```

Browser/e2e verification:

- Try `pnpm --filter @repo/web e2e`.
- If Chromium/browser launch is blocked by the local environment, record the
  exact blocker in `STATUS.md`.
- If browser access works, visually inspect:
  - `/deals/northstar-energy`
  - the dashboard Storybook story
  - at least one narrower viewport
  - `InvestorRow` collapsed and expanded states

## Completion Audit

Before reporting complete, confirm in `STATUS.md`:

- required docs were read
- `PLAN.md` and `STATUS.md` were maintained
- KPI cards no longer stretch due to the lifecycle panel
- long EUR values do not clip in visible dashboard/story surfaces
- Storybook product stories use realistic review containers
- no forbidden package boundaries were crossed
- no token package changes were made
- no app data/API/auth/form scope was added
- all required non-browser verification commands passed
- browser/e2e verification either passed or is blocked with exact error text

Stop after verification and report:

- files changed
- verification results
- browser/e2e status
- any deliberate deviations
- any remaining visual risks
