# Testing UI

## Purpose

This document defines the first testing strategy for `packages/ui`.

The goal is not to test Tailwind itself or reproduce every CSS class in
assertions. The goal is to verify public component contracts: accessibility,
variant APIs, slots, keyboard/focus behavior where relevant, and compatibility
with the repo's architectural constraints.

## 1. Test Stack

Use:

- Vitest
- Testing Library React
- `@testing-library/jest-dom`
- `vitest-axe` for accessibility checks on reusable primitives

Do not introduce Jest.

## 2. Query Strategy

Prefer user-facing queries:

- `getByRole`
- `getByLabelText`
- `getByText`
- `getByPlaceholderText`

Use `data-slot` only for structural contract assertions. Do not add
`data-testid` to `packages/ui`.

Good:

```ts
const button = screen.getByRole('button', { name: 'Continue' })
expect(button).toHaveAttribute('data-slot', 'button')
```

Bad:

```ts
screen.getByTestId('continue-button')
```

## 3. Accessibility Checks

Run `axe` on representative component states:

- default state
- disabled state when relevant
- invalid/error state for fields
- table with headers and rows
- progress with accessible label/value

Example:

```ts
const { container } = render(<Button>Continue</Button>)
expect(await axe(container)).toHaveNoViolations()
```

Keep accessibility tests focused. One strong `axe` test per component is better
than noisy repetition across every variant.

## 4. Component Contract Tests

Each component should test:

- it renders with the expected accessible role or semantic element
- it forwards native props such as `disabled`, `aria-*`, `id`, and `name`
- root `data-slot` exists
- public variants affect `data-*` or class contract where relevant
- `className` is merged rather than replacing base classes

Variant components should cover all public variants at least once.

## 5. Field Tests

Field-related components should verify:

- labels associate with controls
- `aria-invalid` is supported on controls
- invalid state can be expressed through `data-invalid`
- description and error text can be rendered without layout-specific wrappers
- field groups preserve accessible grouping semantics where applicable

Do not hardcode translated error prose. Use generic example strings in tests.

## 6. Table Tests

Table primitives should verify:

- `table`, `thead`, `tbody`, `tr`, `th`, `td`, and caption semantics
- header cells are discoverable by role
- row/cell content renders predictably
- `data-slot` is present on public subparts

Do not build sorting, filtering, pagination, or generic data-table behavior in
this package loop.

## 7. Progress Tests

Progress should verify:

- accessible progress role
- value attributes when a value is provided
- indicator transform or style reflects the value
- value is clamped or handled safely if the implementation supports that

## 8. Storybook As Visual Documentation

Every component in this loop needs stories.

Use stories to show:

- default state
- variants
- disabled state
- invalid/error state where relevant
- dark mode only if it can be shown without adding custom theme infrastructure

Storybook build is part of verification:

```bash
pnpm storybook:build
```

Do not add image snapshot infrastructure in this loop. Playwright screenshot
tests can be added later when `packages/kit` has product-shaped states worth
protecting visually.

## 9. Coverage

`pnpm --filter @repo/ui test:coverage` must pass.

The agent may set package-level coverage thresholds, but should avoid gaming
coverage with brittle implementation assertions. Tests should protect behavior
and public contracts.

## 10. Contract Script

`packages/ui/scripts/check-styles-contract.mjs` runs before tests and must
continue to reject:

- `React.forwardRef`
- imported `forwardRef`
- `.displayName =`
- `data-testid`
- direct icon-library imports
- Google Fonts imports
- dangerous HTML injection

If new architectural rules are needed, add them to the contract script and
cover them with clear error labels.

## 11. Verification Commands

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
