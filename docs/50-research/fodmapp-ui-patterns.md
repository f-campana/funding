# UI Patterns From Local References

## Purpose

This document distills reusable UI-system patterns from local projects inspected before scaffolding the funding monorepo.

Primary references:

- `/Users/fabiencampana/Documents/fodmapp/packages/ui`
- `/Users/fabiencampana/Documents/fodmapp/packages/design-tokens`
- `/Users/fabiencampana/Documents/fodmapp/packages/tailwind-config`

Secondary references:

- `/Users/fabiencampana/Documents/ModelsBench/hubwise`
- `/Users/fabiencampana/Documents/ModelsBench/react-ui-shared-library`
- `/Users/fabiencampana/Documents/ModelsBench/staffmatch-front-development`

The goal is not to copy implementation wholesale. The goal is to preserve the useful discipline: package boundaries, token-driven styling, accessible primitives, strict tests, and explicit contracts.

## High-Value Patterns To Reuse

### 1. Component Taxonomy

FODMAP's UI package has a useful internal taxonomy:

- `foundation`: native-ish primitives such as button, input, table, typography, spinner, dot.
- `adapter`: wrappers around Radix/Vaul primitives such as dialog, drawer, collapsible.
- `composed`: higher-level UI assemblies such as field and input group.
- `utilities`: small helper components such as visually-hidden and portal.

For this repo, the taxonomy should be split across packages:

- `packages/ui`: generic primitives and Radix/Shadcn adapters.
- `packages/kit`: product-shaped composed components and demo blocks.

`packages/ui` should stay domain-free. `packages/kit` may accept domain-shaped props but should still not fetch server data.

### 2. Stable Slot Contracts

FODMAP components use stable `data-slot` attributes as styling and testing contracts.

Recommended convention:

- Every reusable component root gets a stable `data-slot`.
- Subparts get named slots: `data-slot="button-icon"`, `data-slot="table-cell"`, etc.
- Variant state should be exposed through `data-variant`, `data-size`, `data-state`, or ARIA attributes.
- Tests may assert slot presence when the slot is part of the public component contract.

For `packages/ui`, internal slots should not be consumer-overridable. This protects the design-system contract.

For `packages/kit`, use slot stability pragmatically. Composed components may expose richer DOM for product testing and visual checks.

### 3. React 19 Ref Style

FODMAP's newer primitives follow React 19 conventions:

- no `React.forwardRef`
- no `.displayName = ...`
- `ref` is accepted as a regular prop through `React.ComponentProps<"button">`, `React.ComponentProps<"input">`, etc.

This should be a hard convention for new code.

Add a contract check that rejects:

- `React.forwardRef`
- `forwardRef(`
- `.displayName =`

### 4. CVA For Variants

Use `class-variance-authority` for primitive variants where variants are part of the component API.

Good fits:

- `Button`
- `Badge`
- `StatusDot`
- `MetricCard`
- `Callout`
- `PanelCard`

Avoid CVA for one-off layout blocks in `packages/kit`. Product blocks can use explicit class composition when the variants are not a reusable API.

### 5. Token-Only Styling

FODMAP's strongest UI pattern is semantic token usage:

- `bg-primary`
- `hover:bg-primary-hover`
- `text-muted-foreground`
- `focus-visible:ring-ring-soft`
- `border-border`

Avoid:

- hardcoded colors in component files
- opacity hacks such as `text-foreground/70` when a semantic token exists
- dark-mode overrides scattered inside components

Funding-style product surfaces need a strict semantic token layer because white-label and configurable-platform concerns are real.

### 6. Icon Slots, Not Icon Imports

FODMAP forbids icon-library imports inside the generic UI package.

Recommended rule:

- `packages/ui` accepts `ReactNode` icon slots.
- `packages/kit` may import `lucide-react` when the icon is product-specific.
- `apps/web` may import icons freely for app composition.

This keeps `packages/ui` generic, tree-shakeable, and visually unopinionated.

### 7. Accessibility-First Tests

FODMAP's component tests are contract-focused and use Testing Library role queries plus `jest-axe`.

For this repo, use the Vitest-compatible equivalent, `vitest-axe`, instead of the Jest package.

Recommended test style:

- query by role, label, text, or semantic structure
- use `vitest-axe` for reusable primitives
- assert keyboard behavior for interactive components
- assert focus restoration for drawers/dialogs
- avoid `data-testid` in reusable UI

`data-slot` is acceptable for structural contract tests, but not as the primary user-facing query.

### 8. Style Contract Script

FODMAP's `check-styles-contract.mjs` pattern is worth copying early.

The first version for this repo should check:

- no `forwardRef`
- no `.displayName =`
- no `data-testid` in `packages/ui`
- no hardcoded Google Fonts imports in package CSS
- no `dangerouslySetInnerHTML`
- no icon library imports in `packages/ui`
- generated CSS contains required token selectors
- built styles expose expected semantic classes

This complements Biome. Biome catches syntax and many correctness issues; a custom contract script catches local architectural rules.

## Design Token Patterns

FODMAP's design-token package is stronger than a static token file. It uses:

- DTCG token shape with `$value` and `$type`
- Style Dictionary
- generated CSS, JSON, JS, DTS, and native outputs
- OKLCH color output
- contrast validation
- light/dark semantic parity checks
- runtime CSS aliases

For this repo, start smaller but preserve the architecture:

- source tokens in DTCG-like JSON
- generated CSS variables
- generated TypeScript token exports
- contrast validation for semantic text/background pairs
- light theme first, dark theme later

Do not generate native outputs in the first scaffold. That is useful later, not now.

## Tailwind v4 Pattern

FODMAP's `packages/tailwind-config/shared-styles.css` was the initial Tailwind
reference. This repo has since moved to a stricter shadcn-compatible contract:
canonical variables such as `--background`, `--foreground`, `--card`,
`--primary`, `--border`, `--ring`, `--chart-1`, and sidebar tokens are generated
by `@repo/design-tokens`, then mapped through `@theme inline`.

The older `--color-bg` style shown below should now be treated as a bootstrap
compatibility alias, not the primary token naming model.

Original reference shape:

Recommended shape:

```css
@import "tailwindcss" source(none);
@import "@repo/design-tokens/css";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-background: var(--color-bg);
  --color-foreground: var(--color-text);
  --color-card: var(--color-surface);
  --color-primary: var(--color-accent);
  --radius: var(--radius-control);
  --spacing: var(--space-4);
}
```

The important point: Tailwind classes should resolve to semantic CSS variables, not fixed colors.

## Internationalization Cautions

FODMAP has a local `useLocale` hook hardcoded to `fr-FR`. Staffmatch uses local `.locales.js` files with `react-intl`.

For this repo:

- use `next-intl`
- default locale is `fr-FR`
- do not hardcode French strings inside `packages/ui`
- generic UI components should accept labels as props
- `packages/kit` may consume translated strings from the app layer or receive already translated labels
- money and dates must be formatted through domain/i18n utilities, never inline

Good reusable idea from FODMAP tests: normalize French non-breaking spaces and narrow no-break spaces when asserting formatted numbers.

## Motion And Progressive Disclosure

Staffmatch and FODMAP both contain custom portal, modal, drawer, focus, and animation lessons. The modern choice remains:

- Radix/Vaul for accessible primitives
- `motion/react` for layout and mount/unmount animation
- CSS transitions for simple state changes

Use Motion for:

- expandable investor rows
- collapsible panel bodies with unknown height
- modal/drawer enter-exit with `AnimatePresence`
- numeric count-up when it materially improves comprehension

Use CSS for:

- hover states
- focus states
- progress fill
- SVG stroke reveal

## Charts

HubWise contains financial chart/table experiments and FODMAP has no need to drive this area.

Recommended split remains:

- custom SVG for semantic product charts: commitment donut, velocity sparkline, ticket breakdown
- Shadcn/Recharts for standard informational charts
- D3 deferred until complex interactive visualization actually appears

Financial chart components should be accessible:

- explicit title/description
- screen-reader summary
- visible value labels where practical
- no color-only meaning

## Visual Testing

Staffmatch has a mature image snapshot harness using Storybook, Playwright/Puppeteer, device lists, font loading, clipped screenshots, and thresholds.

For this repo, do not copy that full complexity.

Start with:

- Storybook for isolated component states
- Playwright for app-level flows
- Playwright screenshots for selected critical states
- optional image snapshots only where visual regressions would be meaningful

Good candidates for visual tests:

- `Button` variants
- `Field` error/hint states
- `InvestorRow` expanded/collapsed states
- `CommitmentProgress` charts
- `CommitmentForm` step transitions
- mobile and desktop dashboard layouts

Avoid broad snapshot testing by default. Use snapshots when they protect an explicit contract, not as a substitute for assertions.

## Lessons From Secondary References

### HubWise

Useful:

- monorepo package decomposition
- source-only `@repo/ui` package idea
- shared TypeScript and Vitest config packages
- financial-table exploration
- explicit package scripts for typecheck/test/coverage

Do not copy:

- number-based money handling
- `any` in financial types
- broad financial table abstraction too early
- Tailwind v3 assumptions

### Financeclub Shared UI Library

Useful:

- Storybook as the main development surface
- story play functions for interaction examples
- component generator idea
- explicit README documentation for contributors

Do not copy:

- styled-components architecture
- Rollup/Babel publishing complexity
- `forwardRef`/`displayName` patterns
- `data-testid` as a primary query strategy
- snapshot-heavy tests as the default

### Staffmatch

Useful:

- granular Storybook instances per app surface
- image snapshot infrastructure as a future reference
- error boundary thinking
- focus restoration lessons in modals
- local component locale files as a reminder that copy ownership matters

Do not copy:

- legacy React 17 patterns
- Redux-era state assumptions
- custom focus traps where Radix already solves the problem
- heavy multi-app scripts in the first scaffold

## Initial Component Scope

Recommended first UI/kit component batch:

`packages/ui`:

- `Button`
- `Input`
- `Textarea`
- `Field`
- `Table`
- `Badge`
- `StatusDot`
- `Progress`
- `Card`
- `Panel`
- `VisuallyHidden`

`packages/kit`:

- `MoneyDisplay`
- `MetricCard`
- `CommitmentProgress`
- `InvestorRow`
- `SpvStateTracker`
- `DealTermsPanel`
- `CommitmentFormShell`

Do not build a generic mega table in the first pass. Build semantic, typed components for the Funding-like dashboard and extract later if duplication proves real.
