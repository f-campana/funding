# Testing Chart Primitives

## Purpose

This document defines the testing strategy for the `@repo/ui` chart primitives
loop.

The goal is to protect the generic chart contract without testing Recharts
internals or creating brittle pixel assertions. The chart primitives should be
tested as shadcn-compatible composition helpers.

## 1. Test Stack

Use the existing `@repo/ui` stack:

- Vitest
- Testing Library React
- `@testing-library/jest-dom`
- `vitest-axe` where useful
- existing `packages/ui/src/test` helpers

Do not introduce Jest, Playwright, or screenshot tests in this loop.

## 2. What To Test

### `ChartContainer`

Test that:

- it renders children
- it exposes `data-slot="chart-container"`
- it merges `className`
- it provides scoped CSS variables for configured series
- it supports simple `color` config values
- it supports light/dark `theme` config values
- it does not emit unnecessary style output for configs with no colors

Avoid asserting every generated selector if that makes tests brittle. Assert the
public contract: chart id scoping exists and expected `--color-key` variables
are present.

### Tooltip Content

Test that:

- tooltip content renders label and payload names from config
- `hideLabel` hides the label
- `hideIndicator` hides the indicator
- `indicator="dot" | "line" | "dashed"` affects the structural output
- `labelKey` and `nameKey` are honored when provided
- root slots exist

Use typed payload fixtures. Do not use `any`.

### Legend Content

Test that:

- legend content renders configured labels
- `nameKey` is honored when provided
- root slots exist
- empty payloads render safely

### Stories

Stories act as visual documentation. They should build successfully and show:

- a bar chart with tooltip
- a line or area chart with legend
- a multi-series example using `var(--chart-*)` tokens

## 3. Accessibility

Charts are not fully validated by `axe` in jsdom, but the surrounding
composition should still avoid obvious violations.

Use focused `axe` checks on:

- `ChartContainer` with a simple chart
- tooltip content rendered as a standalone piece of UI if practical
- legend content rendered as a standalone piece of UI if practical

Stories and examples should use Recharts `accessibilityLayer` on chart roots
where supported. Recharts supports arrow-key navigation between data points
when `accessibilityLayer` is enabled; do not try to reimplement that behavior
in `@repo/ui`.

## 4. What Not To Test

Do not test:

- Recharts rendering internals
- SVG path exact `d` values
- axis tick layout
- animation frames
- pixel screenshots
- domain-specific data semantics
- money formatting
- locale formatting

Those belong to Recharts, later visual regression tests, or `@repo/kit`.

## 5. JSDOM Notes

Recharts may need browser APIs that jsdom does not provide in every context.
If a focused mock is required, keep it local to chart tests or add a small
test setup polyfill with a comment explaining why.

Allowed examples:

- `ResizeObserver` mock
- `getBoundingClientRect` fallback for chart container measurement

Do not add broad global mocks that hide real component bugs.

## 6. Contract Checks

The UI contract script must continue to run before tests:

```bash
pnpm --filter @repo/ui test:coverage
```

The chart implementation must keep these audits clean:

```bash
rg -n "forwardRef|React\\.forwardRef|\\.displayName\\s*=|data-testid|lucide-react|@repo/domain|@repo/kit|next-intl" packages/ui/src
rg -n "text-(green|red|blue|stone|slate|zinc|neutral)-|bg-(green|red|blue|stone|slate|zinc|neutral)-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/ui/src/components/chart.tsx packages/ui/src/components/chart.stories.tsx packages/ui/src/components/chart.test.tsx
```

## 7. Verification Commands

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
