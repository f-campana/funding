# Ralph Loop Prompt — Chart Primitives

You are working in `/Users/fabiencampana/Documents/funding`.

## Objective

Implement shadcn-compatible chart primitives in `packages/ui`.

This is a generic UI infrastructure pass only. Do not implement product
dashboard widgets, financial charts, app routes, data fetching, or kit
refinements.

## Read First

Read these documents before editing files:

1. `docs/20-specs/chart-primitives-spec.md`
2. `docs/30-testing/testing-chart-primitives.md`
3. `docs/20-specs/ui-spec.md`
4. `docs/30-testing/testing-ui.md`
5. `docs/10-architecture/package-boundaries.md`
6. `docs/20-specs/design-tokens-spec.md`
7. `docs/60-planning/kit-visual-refinement-spec.md`
8. `docs/50-research/fodmapp-ui-patterns.md`
9. `docs/10-architecture/monorepo-conventions.md`

Treat `docs/20-specs/chart-primitives-spec.md` as the source of truth for this
loop. If another document conflicts with it, follow the chart-primitives spec
and record the conflict in `STATUS.md`.

## Hard Boundaries

You may modify:

- `packages/ui/**`
- `apps/storybook/**` only if Storybook configuration needs a narrow adjustment
- `pnpm-lock.yaml`
- `PLAN.md`
- `STATUS.md`

You may modify docs only if the implementation reveals a necessary correction
to the chart-primitives docs.

Do not modify:

- `packages/core/**`
- `packages/domain/**`
- `packages/design-tokens/**`
- `packages/tailwind-config/**`
- `packages/kit/**`
- `apps/web/**`
- app routes

Do not implement:

- `TicketDistribution`
- `InvestorStatusBreakdown`
- `CommitmentOverview`
- dashboard visual refinements
- investor commitment form
- React Hook Form
- tRPC
- GraphQL
- auth
- database code
- server actions
- route handlers
- visual screenshot infrastructure

## Required Output

Implement:

- `packages/ui/src/components/chart.tsx`
- `packages/ui/src/components/chart.stories.tsx`
- `packages/ui/src/components/chart.test.tsx`
- exports from `packages/ui/src/index.ts`
- package dependency/export updates needed for `@repo/ui/components/chart`

The public API must include:

- `ChartConfig`
- `ChartContainer`
- `ChartStyle`
- `ChartTooltip`
- `ChartTooltipContent`
- `ChartLegend`
- `ChartLegendContent`

Use Recharts directly. Do not create proprietary chart wrappers.

## Implementation Rules

- Follow shadcn/ui chart composition.
- Add Recharts if it is not already installed.
- Keep `packages/ui` generic and domain-free.
- No `@repo/domain`, `@repo/kit`, `next-intl`, or app imports.
- No direct icon-library imports.
- No `React.forwardRef`, imported `forwardRef`, or `.displayName`.
- No `data-testid`.
- No hardcoded color utilities or raw palette values in component source.
- Use canonical chart tokens through CSS variables, e.g. `var(--chart-1)`.
- Stories must use neutral sample data and neutral labels.
- Recharts chart roots in stories should use `accessibilityLayer` where
  supported.
- Keep tests behavior/contract oriented; do not assert SVG path internals.

## Milestones

Update `PLAN.md` before starting, then keep it current.

### Milestone 1 — Dependency And API Shape

- Add Recharts dependency to `packages/ui` if needed.
- Create `chart.tsx` with the required exports.
- Re-export chart primitives from `packages/ui/src/index.ts`.
- Ensure `@repo/ui/components/chart` works through existing package exports.

Verification:

```bash
pnpm --filter @repo/ui typecheck
```

### Milestone 2 — Component Contracts

- Implement `ChartContainer` and `ChartStyle`.
- Implement tooltip and legend components.
- Preserve shadcn-compatible naming and composition.
- Add stable `data-slot` attributes.

Verification:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
```

### Milestone 3 — Tests

- Add chart tests following `docs/30-testing/testing-chart-primitives.md`.
- Include focused accessibility checks where practical.
- Cover no-data/empty payload safety for tooltip and legend.
- Keep tests typed; do not use `any`.

Verification:

```bash
pnpm --filter @repo/ui test:coverage
```

### Milestone 4 — Stories

- Add generic Storybook stories for chart primitives.
- Include at least one tooltip story and one legend story.
- Use explicit chart height/min-height.
- Use `var(--chart-*)` token colors.

Verification:

```bash
pnpm storybook:build
```

### Milestone 5 — Boundary Audit And Full Verification

Run:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run these audits:

```bash
rg -n "forwardRef|React\\.forwardRef|\\.displayName\\s*=|data-testid|lucide-react|@repo/domain|@repo/kit|next-intl" packages/ui/src
rg -n "text-(green|red|blue|stone|slate|zinc|neutral)-|bg-(green|red|blue|stone|slate|zinc|neutral)-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/ui/src/components/chart.tsx packages/ui/src/components/chart.stories.tsx packages/ui/src/components/chart.test.tsx
```

If an audit returns a hit that is intentionally safe, document the exact reason
in `STATUS.md`. Otherwise fix it.

## Completion Audit

Before finishing, verify and record in `STATUS.md`:

- required chart files exist
- `@repo/ui` exports chart primitives from root and subpath
- Storybook build includes chart stories
- no forbidden package imports were introduced
- no product/domain chart widgets were implemented
- no app or kit files were changed
- all verification commands passed

Stop after verification and report the final status.
