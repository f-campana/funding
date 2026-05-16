# Closing Readiness Dashboard Implementation Status

## Objective

Execute `docs/40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-prompt.md`:
add the Closing Readiness / Exception Dashboard V1 surface in `@repo/kit`,
preserve existing package structure and boundaries, maintain `PLAN.md` and
`STATUS.md`, and stop after full verification.

## Docs Read

- `docs/40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-prompt.md`
- `docs/20-specs/closing-readiness-dashboard-v1-spec.md`
- `docs/30-testing/testing-closing-readiness-dashboard.md`
- `docs/60-planning/closing-readiness-exception-dashboard-v1.md`
- `docs/60-planning/current-priorities-and-rationale.md`
- `docs/20-specs/domain-reconciliation-spec.md`
- `docs/30-testing/testing-domain-reconciliation.md`

## Implementation

- Added `packages/kit/src/readiness/` with:
  - `closing-readiness-summary.tsx`
  - `closing-blocker-queue.tsx`
  - `capital-reconciliation-panel.tsx`
  - tests, stories, and `index.ts`
- Exported the new readiness components and types from `packages/kit/src/index.ts`.
- Refined `DealDashboardDemo` so the hierarchy is now deal context,
  readiness summary, blocker queue, capital reconciliation, investor records,
  and supporting context.
- Added dashboard story variants for desktop, narrow, blocked, attention, and
  ready states.
- Updated `apps/web/tests/e2e/homepage.spec.ts` only for public route
  assertions covering readiness, critical blocker visibility, keyboard
  interaction, investor-row expansion, mobile ordering, and mobile overflow.

## Verification

Passed:

- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit lint`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web e2e`
- `pnpm storybook:build`
- `pnpm turbo typecheck lint test`
- `pnpm lint`
- `pnpm e2e`
- `git diff --check`

Audits passed with no output:

- `rg -n "from ['\"](?:next-intl|next/navigation|@repo/web|@/|.*trpc|.*prisma|.*database|.*server)" packages/kit/src || true`
- `rg -n "#[0-9a-fA-F]{3,8}|oklch\(|\bdark:|\b(?:text|bg|border|ring|fill|stroke)-(?:red|green|blue|amber|yellow|slate|zinc|neutral|stone|gray|teal)-[0-9]{2,3}" packages/kit/src || true`
- `find . -name 'tailwind.config.*' -print`

Follow-up audit note:

- The first local `pnpm --filter @repo/web e2e` rerun exposed a Playwright
  locator issue in `apps/web/tests/e2e/homepage.spec.ts`: after activating the
  blocker details button, the button accessible name changes from
  "Show details" to "Hide details", so the original locator re-resolved to the
  next collapsed row. The assertion now scopes to the first blocker row and
  expects the renamed button.
- After that fix, `pnpm --filter @repo/web e2e` passed with 4/4 tests.
- Root `pnpm e2e` also passed through Turbo with 4/4 web Playwright tests.

## Completion Audit

Objective success criteria and evidence:

- Required readiness files exist: yes, all requested component, test, story,
  and index files exist under `packages/kit/src/readiness/`.
- New components are exported from `@repo/kit`: yes, `packages/kit/src/index.ts`
  exports the components and public types; `package-exports.test.ts` asserts
  the exports.
- `DealDashboardDemo` renders readiness summary and blocker queue: yes,
  `deal-dashboard-demo.tsx` composes `ClosingReadinessSummary`,
  `ClosingBlockerQueue`, and `CapitalReconciliationPanel`; tests assert the
  slots and visible copy.
- Blocker queue has real local interactions: yes, local React state controls
  details expansion, selection, and acknowledge/unacknowledge; component tests
  assert expand/collapse and reversible acknowledgement.
- Capital reconciliation uses `@repo/domain/reconciliation`: yes, the demo,
  stories, and tests build summaries with `summarizeCapitalReconciliation` and
  fixtures; the panel accepts `CapitalReconciliationSummary`.
- Readiness states and `data-state` are covered: yes, component tests cover all
  four states and dashboard tests cover blocked, ready, and attention.
- Blocker sorting and empty state are covered: yes,
  `closing-blocker-queue.test.tsx`.
- Capital committed/signed/received/matched/remaining/unmatched/unfunded states
  are covered: yes, `capital-reconciliation-panel.test.tsx`.
- Dashboard primary operational flow is covered: yes, kit tests assert
  readiness and critical blockers without opening investor rows; mobile
  secondary sections remain collapsed while readiness and blockers stay visible.
- Public route assertions were updated only in `apps/web/tests/e2e/**`: yes,
  only `apps/web/tests/e2e/homepage.spec.ts` changed under app scope.
- Public route e2e passed locally after the locator fix: yes, 4/4 Playwright
  tests passed.
- No forbidden package boundaries were crossed: yes, forbidden import audit has
  no hits.
- No hardcoded raw colors or manual dark classes were introduced: yes, raw
  color/manual dark audit has no hits.
- No `tailwind.config.*` file exists: yes, find audit has no output.
- No `data-testid` was added: yes, kit contract and lint checks passed.
- Allowed-scope note: implementation changes are in `packages/kit/**`,
  `apps/web/tests/e2e/**`, `PLAN.md`, and `STATUS.md`. Prompt-prep docs were
  already dirty at the start of this implementation turn and were left as-is.

Completion status: complete.
