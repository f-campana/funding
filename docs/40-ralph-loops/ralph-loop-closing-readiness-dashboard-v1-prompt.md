# Ralph Loop Prompt — Closing Readiness / Exception Dashboard V1

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

## Objective

Implement the Closing Readiness / Exception Dashboard V1 pass.

The goal is to turn the existing `@repo/kit` deal dashboard from a descriptive
status report into a first private-markets exception workspace.

This pass must use the already implemented domain reconciliation helpers and
status/readiness tokens. It must not add backend/API/persistence behavior.

## Read First

Read these documents before editing files:

1. `docs/20-specs/closing-readiness-dashboard-v1-spec.md`
2. `docs/30-testing/testing-closing-readiness-dashboard.md`
3. `docs/60-planning/closing-readiness-exception-dashboard-v1.md`
4. `docs/60-planning/current-priorities-and-rationale.md`
5. `docs/20-specs/domain-reconciliation-spec.md`
6. `docs/30-testing/testing-domain-reconciliation.md`
7. `docs/20-specs/status-tokens-spec.md`
8. `docs/30-testing/testing-status-tokens.md`
9. `docs/20-specs/kit-spec.md`
10. `docs/30-testing/testing-kit.md`
11. `docs/60-planning/investor-records-mobile-v2.md`
12. `docs/60-planning/dashboard-visual-qa.md`
13. `docs/60-planning/kit-visual-refinement-spec.md`
14. `docs/20-specs/chart-primitives-spec.md`
15. `docs/20-specs/ui-spec.md`
16. `docs/10-architecture/package-boundaries.md`
17. `docs/20-specs/domain-spec.md`
18. `docs/20-specs/design-tokens-spec.md`
19. `docs/50-research/funding.md`
20. `docs/50-research/funding-frontend-spec.md`
21. `docs/50-research/fodmapp-ui-patterns.md`
22. `docs/10-architecture/monorepo-conventions.md`

Treat `docs/20-specs/closing-readiness-dashboard-v1-spec.md` as the source of
truth for this loop. Treat `docs/60-planning/closing-readiness-exception-dashboard-v1.md`
as product rationale and scope guard. If documents conflict, follow the more
specific/current document and record the decision in `STATUS.md`.

## Current State

Already implemented:

- `@repo/core`
- `@repo/domain`
- `@repo/domain/reconciliation`
- `@repo/design-tokens`, including status/readiness tokens
- `@repo/tailwind-config`, including status/readiness Tailwind v4 mappings
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
- `apps/storybook` renders UI and kit stories

Known current product issue:

- the dashboard is polished but passive
- it does not immediately answer what blocks the close
- it conflates committed capital with funded/matched capital
- important next actions are buried in investor details and timeline copy

## Hard Boundaries

You may modify:

- `packages/kit/**`
- `apps/web/tests/e2e/**` only for public route assertions
- `PLAN.md`
- `STATUS.md`

You may modify docs only if implementation reveals a necessary correction.

Do not modify:

- `packages/core/**`
- `packages/domain/**`
- `packages/design-tokens/**`
- `packages/tailwind-config/**`
- `packages/ui/**`
- `apps/web/app/**`
- `apps/storybook/**`

Do not implement:

- new domain package models
- readiness legal computation
- concentration-risk domain helpers
- document lifecycle domain models
- investor commitment form
- React Hook Form
- Zod resolver integration
- tRPC
- GraphQL
- auth/session logic
- database or API clients
- server actions
- route handlers
- real reminder sending
- real document upload/download
- real payment-provider behavior
- persisted blocker acknowledgement
- new external UI libraries
- broad token redesign
- Tailwind v3 config

`@repo/kit` must not import:

- `next-intl`
- `next/navigation`
- app code
- server/database modules
- tRPC clients or routers

## Required Outcome

Add the Closing Readiness V1 product surface:

1. `ClosingReadinessSummary`
2. `ClosingBlockerQueue`
3. `CapitalReconciliationPanel`
4. refined `DealDashboardDemo` composition
5. focused stories and tests for each new component
6. app e2e updates only if needed for the public route assertions

The first screen of the dashboard must now answer:

- Are we ready, attention-worthy, blocked, or not started?
- What blocks the close?
- Who owns the next action?
- What capital is committed, signed, received, matched, and remaining?
- When was the data last updated?

## Implementation Guidance

### New Module

Create:

```text
packages/kit/src/readiness/
  capital-reconciliation-panel.tsx
  capital-reconciliation-panel.test.tsx
  capital-reconciliation-panel.stories.tsx
  closing-blocker-queue.tsx
  closing-blocker-queue.test.tsx
  closing-blocker-queue.stories.tsx
  closing-readiness-summary.tsx
  closing-readiness-summary.test.tsx
  closing-readiness-summary.stories.tsx
  index.ts
```

Update:

```text
packages/kit/src/index.ts
packages/kit/src/demo/deal-dashboard-demo.tsx
packages/kit/src/demo/deal-dashboard-demo.test.tsx
packages/kit/src/demo/deal-dashboard-demo.stories.tsx
```

### Domain Reconciliation Usage

Use `@repo/domain/reconciliation`.

Expected imports may include:

```ts
import {
  reconciliationFixtures,
  summarizeCapitalReconciliation,
  type CapitalReconciliationSummary,
} from '@repo/domain/reconciliation'
```

Do not recompute domain reconciliation derived amounts inside React when the
summary already provides them.

If `summarizeCapitalReconciliation` returns `Result.Error` in fixture setup,
render a clear demo fallback or throw during fixture construction. Do not ignore
the error.

### Status / Readiness Tokens

Use semantic token classes only:

- `bg-readiness-ready-muted`
- `text-readiness-ready`
- `border-readiness-ready-border`
- `bg-readiness-attention-muted`
- `text-readiness-attention`
- `border-readiness-attention-border`
- `bg-readiness-blocked-muted`
- `text-readiness-blocked`
- `border-readiness-blocked-border`
- `bg-readiness-not-started-muted`
- `text-readiness-not-started`
- `border-readiness-not-started-border`
- `bg-status-success-muted`
- `text-status-success`
- `bg-status-attention-muted`
- `text-status-attention`
- `bg-status-danger-muted`
- `text-status-danger`
- `bg-status-info-muted`
- `text-status-info`
- `bg-status-pending-muted`
- `text-status-pending`

Do not use hardcoded color families such as `text-green-700`, `bg-red-50`, or
manual `dark:` overrides.

### Interactions

The blocker queue must include real local interactions:

- expand/collapse blocker details
- acknowledge/unacknowledge a blocker locally
- optionally select/focus a blocker

Rules:

- interactions use React local state only
- buttons must have accessible names
- no fake network call
- no server action
- no optimistic mutation wording
- no persisted state

### Dashboard Composition

Refine `DealDashboardDemo` so the page hierarchy becomes:

1. deal context
2. readiness summary
3. blockers / next actions
4. capital reconciliation
5. investor records
6. lifecycle, status distribution, activity timeline, and deal terms as
   supporting context

Mobile/narrow:

- readiness and blockers are visible before secondary disclosure sections
- secondary modules may be behind closed native `<details>`
- top blockers must not be hidden behind collapsed disclosure
- no horizontal overflow

Preserve the Investor Records V2 behavior. Do not undo desktop/narrow investor
row improvements.

## Storybook Requirements

Add stories for:

- `ClosingReadinessSummary`
  - ready
  - attention
  - blocked
  - not started
- `ClosingBlockerQueue`
  - populated
  - empty
  - interaction review
- `CapitalReconciliationPanel`
  - normal
  - unmatched funds
  - high committed / low matched
  - not started
- `DealDashboardDemo`
  - desktop review
  - narrow review
  - blocked state
  - attention state
  - ready state

Use existing kit story layout helpers. Do not add Storybook addons.

## Testing Requirements

Implement or update tests for:

- readiness states and `data-state`
- readiness summary content
- blocker sorting by severity and due state
- blocker empty state
- blocker details expand/collapse
- blocker acknowledgement local interaction
- capital reconciliation panel rendering committed/signed/received/matched
  values
- unmatched and unfunded capital display
- dashboard rendering readiness and critical blockers without expanding investor
  rows
- mobile/narrow dashboard preserving primary operational flow
- representative `vitest-axe` checks
- package exports

Do not add `data-testid`.

## Required Verification

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
pnpm e2e
git diff --check
```

Run audits:

```bash
rg -n "from ['\\\"](?:next-intl|next/navigation|@repo/web|@/|.*trpc|.*prisma|.*database|.*server)" packages/kit/src || true
rg -n "#[0-9a-fA-F]{3,8}|oklch\\(|\\bdark:|\\b(?:text|bg|border|ring|fill|stroke)-(?:red|green|blue|amber|yellow|slate|zinc|neutral|stone|gray|teal)-[0-9]{2,3}" packages/kit/src || true
find . -name 'tailwind.config.*' -print
```

Expected audit result:

- forbidden import audit returns no hits
- forbidden raw color/manual dark audit returns no hits
- no `tailwind.config.*` file exists

If Playwright or browser launch is blocked, record the exact error in
`STATUS.md`. Still complete typecheck, lint, unit coverage, app build,
Storybook build, workspace tests, and `git diff --check`.

## Completion Audit

Before final response, verify and record in `STATUS.md`:

- required readiness files exist
- new components are exported from `@repo/kit`
- `DealDashboardDemo` renders readiness summary and blocker queue
- blocker queue has real local interactions
- capital reconciliation uses `@repo/domain/reconciliation`
- no forbidden package boundaries were crossed
- no hardcoded raw colors or manual dark classes were introduced
- no changes were made outside allowed scope, except documented app e2e updates
- all verification commands passed or browser blockers were precisely recorded
