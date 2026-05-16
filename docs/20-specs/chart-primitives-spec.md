# Chart Primitives Spec

**Status:** Implemented
**Scope:** `packages/ui` only
**Depends on:** React, Recharts, existing `@repo/ui` conventions, Storybook
**Must not depend on:** `@repo/domain`, `@repo/kit`, `next-intl`, app code

## 1. Purpose

The chart primitives pass adds shadcn-compatible chart infrastructure to
`@repo/ui` so later `@repo/kit` components can build financial dashboard
widgets without inventing chart plumbing.

This pass is generic infrastructure. It must not implement private-market
widgets such as ticket distribution, investor status breakdown, commitment
velocity, portfolio performance, or fund allocation. Those belong in a later
`@repo/kit` visual refinement loop.

## 2. Upstream Model

Follow the current shadcn/ui chart model:

- Recharts is used underneath.
- `@repo/ui` provides composition helpers, not a locked chart abstraction.
- Consumers still build charts with Recharts primitives such as `BarChart`,
  `LineChart`, `AreaChart`, `XAxis`, `YAxis`, `Bar`, `Line`, and `Area`.
- `ChartContainer` provides chart context and CSS-variable color wiring.
- `ChartTooltip` / `ChartTooltipContent` and `ChartLegend` /
  `ChartLegendContent` provide consistent presentation.

Important upstream constraints from shadcn:

- Do not wrap Recharts into a proprietary chart API.
- Use CSS variables such as `var(--chart-1)` in chart config.
- Use `var(--color-key)` inside chart marks after `ChartContainer` maps config
  keys.
- Keep a `height`, `min-h-*`, or `aspect-*` class on `ChartContainer` so
  Recharts can measure the responsive chart on first render.
- Prefer Recharts `accessibilityLayer` on chart elements where supported.

References:

- <https://ui.shadcn.com/docs/components/chart>
- <https://ui.shadcn.com/charts>
- <https://github.com/recharts/recharts/wiki/Recharts-and-accessibility>

## 3. Files To Add Or Update

Expected implementation files:

```text
packages/ui/src/components/chart.tsx
packages/ui/src/components/chart.stories.tsx
packages/ui/src/components/chart.test.tsx
packages/ui/src/index.ts
packages/ui/package.json
pnpm-lock.yaml
```

Do not modify `@repo/domain`, `@repo/kit`, `apps/web`, or app routes in this
loop.

`packages/ui/package.json` should add Recharts as needed. Prefer a normal
runtime dependency because `@repo/ui` exports components that import Recharts
types/components at runtime. Do not add D3, Chart.js, Tremor, TanStack Table, or
TanStack Virtual.

## 4. Public API

Export the following from `@repo/ui` and from the shadcn-compatible subpath
`@repo/ui/components/chart`:

```ts
export type ChartConfig = Record<
  string,
  {
    readonly label?: React.ReactNode
    readonly icon?: React.ComponentType
    readonly color?: string
    readonly theme?: Partial<Record<'light' | 'dark', string>>
  }
>

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
```

Use the exact upstream names unless there is a type-level reason not to. This
keeps the package compatible with shadcn examples and future copy/paste
updates.

## 5. Component Contracts

### `ChartContainer`

Responsibilities:

- provide chart config through context
- generate chart-scoped CSS variables from `ChartConfig`
- expose a stable chart id
- render a responsive container for Recharts children
- merge caller `className`
- expose `data-slot="chart-container"`

Rules:

- The component may be a client component.
- Do not use `React.forwardRef`.
- Do not use `.displayName`.
- Do not import icon libraries.
- Do not hardcode domain labels or French copy.
- Do not require a fixed height internally, but stories must show a
  `min-h-*`, `h-*`, or `aspect-*` class.

### `ChartStyle`

Responsibilities:

- emit scoped CSS variables for chart color keys
- support light and dark values from `theme`
- support simple `color` values
- skip style output when there are no configured colors

Rules:

- Do not use unscoped global variables for per-chart series.
- The generated CSS must be scoped to the chart id.
- Color values come from caller config; component source must not contain raw
  palette values.

### `ChartTooltip` And `ChartTooltipContent`

Responsibilities:

- re-export or wrap Recharts tooltip composition in shadcn-compatible style
- support label/name keys
- support `indicator?: 'dot' | 'line' | 'dashed'`
- support `hideLabel` and `hideIndicator`
- render stable slots:
  - `data-slot="chart-tooltip"`
  - `data-slot="chart-tooltip-content"`

Rules:

- Tooltip content must be presentational and generic.
- Formatting functions may be passed by the caller; do not import locale or
  money helpers.
- If the implementation accepts Recharts payloads, type them safely without
  `any`.

### `ChartLegend` And `ChartLegendContent`

Responsibilities:

- re-export or wrap Recharts legend composition in shadcn-compatible style
- use config labels and colors when available
- support `nameKey` when useful
- render stable slots:
  - `data-slot="chart-legend"`
  - `data-slot="chart-legend-content"`

Rules:

- No icon-library imports in `packages/ui`.
- If `ChartConfig.icon` is supported, use caller-provided icon components only.

## 6. Styling Rules

Keep the existing `@repo/ui` styling contract:

- semantic Tailwind classes only
- no hardcoded color utilities in component source
- no raw hex, HSL, or OKLCH values in component source
- no manual dark-mode color overrides in components
- no `space-x-*` or `space-y-*`; use `gap-*`
- use `cn()` for conditional classes

Chart stories may use `var(--chart-1)`, `var(--chart-2)`, etc. in chart config.
Do not use hardcoded colors in stories unless the test explicitly proves caller
provided colors are accepted. Prefer token variables.

## 7. Storybook Requirements

Add `packages/ui/src/components/chart.stories.tsx`.

Stories should be generic, not financial/private-market-specific:

- `BarChartWithTooltip`
- `LineChartWithLegend`
- `AreaChartStacked` or another simple multi-series example
- `TooltipVariants` if practical

Story rules:

- Use `ChartContainer` with explicit `className` height/min-height.
- Use Recharts chart primitives directly.
- Add `accessibilityLayer` to Recharts chart roots where supported.
- Use chart config labels like `Desktop`, `Mobile`, `Revenue`, `Visitors`, or
  other neutral examples.
- Use `var(--chart-1)` and related chart tokens.
- Do not import icons.
- Do not mention investors, SPVs, commitments, KYC, funds, or jurisdictions.

## 8. Package Boundary Audits

The existing `packages/ui/scripts/check-styles-contract.mjs` must keep passing.
If chart code introduces a new risk that Biome cannot catch, extend the script
with a clear error label.

Required forbidden imports audit:

```bash
rg -n "forwardRef|React\\.forwardRef|\\.displayName\\s*=|data-testid|lucide-react|@repo/domain|@repo/kit|next-intl" packages/ui/src
```

Required color audit:

```bash
rg -n "text-(green|red|blue|stone|slate|zinc|neutral)-|bg-(green|red|blue|stone|slate|zinc|neutral)-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/ui/src/components/chart.tsx packages/ui/src/components/chart.stories.tsx packages/ui/src/components/chart.test.tsx
```

The color audit should return no hits unless a test intentionally includes a
caller-provided color string. If such a test exists, document why.

## 9. Non-Goals

Do not implement:

- `@repo/kit` dashboard widgets
- `TicketDistribution`
- `InvestorStatusBreakdown`
- commitment velocity charts
- portfolio/fund charts
- custom SVG dashboard charts
- D3
- Tremor
- Chart.js
- TanStack Table
- app routes
- data fetching
- tRPC or GraphQL
- auth/session logic
- database code
- visual regression infrastructure

## 10. Verification

The loop is complete only when all commands pass:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Also run both package-boundary audits from section 8.
