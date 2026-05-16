# Testing Kit

## Purpose

`packages/kit` tests protect the accepted baseline component contracts. They
verify accessible interaction state, label/copy injection, package boundaries,
and layout-safe rendering for the current exported kit components.

The current kit baseline contains only:

- `DealCommitmentsTable`
- `DealProgressPanel`

Tests for older deleted kit surfaces are historical and should not be revived
unless a future pass explicitly reintroduces a surface.

## Test Stack

Use:

- Vitest
- Testing Library React
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `vitest-axe` for representative accessibility checks

Do not introduce Jest.

## Query Strategy

Prefer user-facing queries:

- `getByRole`
- `getByLabelText`
- `getByText`

Use `data-slot` only for structural contract assertions.

Do not add `data-testid`.

## DealCommitmentsTable Tests

Cover:

- title, subtitle, workflow filters, export actions, footer labels, and table
  columns render from props
- label overrides render without relying on component-internal English copy
- row click opens as a pointer convenience
- the row opener button opens with mouse, Enter, and Space
- disabled row openers and checkboxes are inert
- batch selection stays separate from active/drawer state
- header selection operates on visible enabled rows
- search, filter, pagination, empty, loading, and error states
- long text remains truncated with accessible tooltip behavior
- representative accessibility checks in light and dark contexts

## DealProgressPanel Tests

Cover:

- ready, loading, error, stale/data-quality, no-target, over-target, disabled,
  readonly, terminal, and dark-mode contexts
- progress semantics expose one progressbar and correct aria state
- labels and locale can override static section copy and progress aria text
- action buttons emit stable action kinds and disabled reasons are accessible
- composition segments normalize visually without becoming public API
- package boundary checks reject app imports, console calls, and raw palette
  classes

## Contract Script

`packages/kit/scripts/check-kit-contract.mjs` rejects at least:

- `React.forwardRef`
- imported `forwardRef`
- `.displayName =`
- `data-testid`
- `dangerouslySetInnerHTML`
- imports from `next-intl`
- imports from `next/navigation`
- imports from app code
- imports from tRPC/database/server paths
- raw hex colors
- raw `oklch(...)`
- hardcoded Tailwind color family utilities
- manual `dark:` overrides
- `space-x-*` and `space-y-*`

Unlike `@repo/ui`, `@repo/kit` may import `lucide-react`.

## Coverage

`pnpm --filter @repo/kit test:coverage` must pass. Keep coverage focused on
accepted baseline files and avoid restoring deleted-surface tests.

## Verification Commands

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm storybook:build
pnpm lint
git diff --check
```
