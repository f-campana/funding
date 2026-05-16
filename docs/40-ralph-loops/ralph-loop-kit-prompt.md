# Task: Implement `@repo/kit` - composed product components

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

Read these documents before editing files:

```text
docs/20-specs/kit-spec.md
docs/30-testing/testing-kit.md
docs/10-architecture/package-boundaries.md
docs/20-specs/domain-spec.md
docs/30-testing/testing-domain.md
docs/20-specs/ui-spec.md
docs/30-testing/testing-ui.md
docs/20-specs/design-tokens-spec.md
docs/50-research/funding.md
docs/10-architecture/monorepo-conventions.md
```

Current implemented foundation:

- `@repo/core` is complete.
- `@repo/domain` is complete.
- `@repo/design-tokens` is complete.
- `@repo/tailwind-config` is complete.
- `@repo/ui` is complete for the first primitive batch.
- Storybook is configured as `apps/storybook` and reads stories from
  `packages/ui` and `packages/kit`.
- `@repo/kit` currently contains only a bootstrap placeholder.

Your task is to replace the bootstrap `@repo/kit` placeholder with the first
real product-shaped composed component set.

Maintain `PLAN.md` and `STATUS.md` while working. Start by writing a concise
milestone plan to `PLAN.md`. Update `STATUS.md` after each milestone with what
passed, what failed, and what remains.

## Non-Negotiable Boundaries

Do not modify or refactor these packages except where explicitly required by
workspace imports or verification:

```text
packages/core
packages/domain
packages/design-tokens
packages/tailwind-config
packages/ui
apps/web
```

Do not implement:

- app routes
- data fetching
- tRPC
- auth/session code
- database code
- React Hook Form commitment form
- Zod resolver integration
- TanStack Table
- TanStack Virtual
- Recharts
- D3
- XState
- visual regression/image snapshot infrastructure

`packages/kit` must not import:

- `next-intl`
- `next/navigation`
- app code
- server/database modules
- tRPC clients or routers

`packages/kit` may import:

- `@repo/domain`
- `@repo/ui`
- `motion/react`
- `lucide-react`
- `ts-pattern`

## Required Outcome

At the end of this loop, `@repo/kit` should provide:

- `MoneyDisplay`
- `MetricCard`
- `CommitmentProgress`
- `SpvStateTracker`
- `DealTermsPanel`
- `InvestorRow`
- `DealDashboardDemo`
- Storybook stories under `Kit/*`
- Testing Library and accessibility tests
- a package-level contract script
- passing verification commands

Remove the bootstrap placeholder component, test, and story.

## Milestone 1: Package Setup

Update `packages/kit/package.json`.

Required runtime dependencies:

```json
{
  "@repo/domain": "workspace:*",
  "@repo/ui": "workspace:*",
  "lucide-react": "^1.14.0",
  "motion": "^12.38.0",
  "ts-pattern": "^5.9.0"
}
```

If the exact `motion` version is not available, use the latest stable version
resolved by pnpm and record the deviation in `STATUS.md`.

Required dev dependencies if missing:

```json
{
  "@testing-library/user-event": "^14.6.1",
  "@vitest/coverage-v8": "^4.1.5",
  "axe-core": "^4.11.0",
  "vitest-axe": "^0.1.0"
}
```

Add scripts:

```json
{
  "build": "tsc --noEmit -p tsconfig.json",
  "check:contracts": "node scripts/check-kit-contract.mjs",
  "lint": "biome check ./src ./scripts",
  "typecheck": "tsc --noEmit -p tsconfig.json",
  "test": "pnpm check:contracts && vitest run",
  "test:coverage": "pnpm check:contracts && vitest run --coverage"
}
```

Run:

```bash
pnpm install
pnpm --filter @repo/kit typecheck
```

Record dependency changes in `STATUS.md`.

## Milestone 2: Contract Script

Create:

```text
packages/kit/scripts/check-kit-contract.mjs
```

Follow `docs/30-testing/testing-kit.md`.

It must reject at least:

- `React.forwardRef`
- imported `forwardRef`
- `.displayName =`
- `data-testid`
- `dangerouslySetInnerHTML`
- `next-intl`
- `next/navigation`
- app imports
- server/database imports
- tRPC imports
- raw hex colors
- raw `oklch(...)`
- hardcoded Tailwind color utilities
- manual `dark:` overrides
- `space-x-*` and `space-y-*`

Do not reject `lucide-react` in `packages/kit`.

Run:

```bash
pnpm --filter @repo/kit test
```

## Milestone 3: Component Implementation

Implement the components from `docs/20-specs/kit-spec.md`:

```text
packages/kit/src/money/money-display.tsx
packages/kit/src/metrics/metric-card.tsx
packages/kit/src/commitment/commitment-progress.tsx
packages/kit/src/spv/spv-state-tracker.tsx
packages/kit/src/deal/deal-terms-panel.tsx
packages/kit/src/investors/investor-row.tsx
packages/kit/src/demo/deal-dashboard-demo.tsx
```

Create focused `index.ts` files for each folder and update
`packages/kit/src/index.ts`.

Implementation rules:

- use public imports from `@repo/ui` and `@repo/domain`
- use semantic Tailwind classes only
- no raw colors
- no manual dark mode classes
- no `space-x-*` or `space-y-*`
- no direct `number` money arithmetic
- use `MoneyDisplay` for visible monetary amounts
- use `motion/react` for `InvestorRow` disclosure mount/unmount
- use `ts-pattern` where branching on SPV/domain states is needed
- keep components framework-neutral by accepting `locale` and `labels` as props

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test
```

## Milestone 4: Tests

Write tests following `docs/30-testing/testing-kit.md`.

Required test files:

```text
packages/kit/src/money/money-display.test.tsx
packages/kit/src/metrics/metric-card.test.tsx
packages/kit/src/commitment/commitment-progress.test.tsx
packages/kit/src/spv/spv-state-tracker.test.tsx
packages/kit/src/deal/deal-terms-panel.test.tsx
packages/kit/src/investors/investor-row.test.tsx
packages/kit/src/demo/deal-dashboard-demo.test.tsx
packages/kit/src/package-exports.test.ts
```

Use:

- Testing Library queries
- `user-event` for disclosure interaction
- `vitest-axe` for representative accessibility checks
- spacing normalization for French currency formatting

Do not use snapshots.

Run:

```bash
pnpm --filter @repo/kit test:coverage
```

Coverage should be 100 percent for implemented files unless there is a clear,
recorded reason.

## Milestone 5: Stories

Add stories under `packages/kit/src`.

Required stories:

```text
Kit/MoneyDisplay
Kit/MetricCard
Kit/CommitmentProgress
Kit/SpvStateTracker
Kit/DealTermsPanel
Kit/InvestorRow
Kit/DealDashboardDemo
```

Stories should:

- use realistic private-market demo data
- use domain constructors such as `euroCentsFromMinorUnits`
- exercise locale differences for `MoneyDisplay`
- show expanded and collapsed `InvestorRow`
- rely on Storybook global theme toolbar for dark mode

Do not import private story helpers from `packages/ui/src/stories`.
If helper layout components are needed, create local helpers in:

```text
packages/kit/src/stories/story-layout.tsx
```

Run:

```bash
pnpm storybook:build
```

## Milestone 6: Final Verification And Audit

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Also audit:

```bash
rg "next-intl|next/navigation|@/|trpc|prisma|data-testid|React\\.forwardRef|forwardRef\\(|\\.displayName\\s*=" packages/kit/src packages/kit/scripts
rg "#[0-9a-fA-F]{3,8}\\b|oklch\\(|\\bdark:|\\bspace-[xy]-|\\b(?:bg|border|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-(?:amber|blue|brown|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\\d{2,3}\\b" packages/kit/src packages/kit/scripts
```

The first audit must return no hits except in the contract script itself.

The second audit must return no hits except in the contract script itself if it
contains the regular expressions used to enforce the rule. If there are
contract-script matches only, record that in `STATUS.md`.

Completion audit:

- placeholder files removed
- package exports covered by test
- Storybook build passes
- no forbidden imports
- no data fetching
- no app code
- no commitment form
- no chart library added
- no changes to implemented foundation packages except expected lockfile
  dependency updates

Stop after final verification. Do not keep expanding scope.
