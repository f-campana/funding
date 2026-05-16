# Testing Kit

## Purpose

`packages/kit` tests protect composed product UI contracts. They verify that
domain-shaped data is rendered accurately, interaction state is accessible, and
financial display paths preserve exactness.

The tests should not duplicate all `@repo/ui` primitive tests and should not
test Tailwind itself.

## 1. Test Stack

Use:

- Vitest
- Testing Library React
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `vitest-axe` for representative accessibility checks

Do not introduce Jest.

## 2. Query Strategy

Prefer user-facing queries:

- `getByRole`
- `getByLabelText`
- `getByText`
- `getByTitle` only when there is no better accessible query

Use `data-slot` only for structural contract assertions.

Do not add `data-testid`.

## 3. MoneyDisplay Tests

Test:

- default `fr-FR` formatting
- explicit `en-US` formatting
- `currencyDisplay: 'code'`
- fallback rendering when `formatEuroCents` cannot safely serialize
- `data-state="ready"` and `data-state="error"`
- `font-mono` and `tabular-nums` classes are present

French currency formatting can contain regular spaces, no-break spaces
(`\u00a0`), or narrow no-break spaces (`\u202f`) depending on platform and ICU
version. Normalize spacing before asserting:

```ts
const normalizeFrenchNumber = (value: string) =>
  value.replace(/\u00a0|\u202f/g, ' ')
```

Do not assert against raw ICU spacing.

## 4. CommitmentProgress Tests

Test:

- committed and target amounts render through `MoneyDisplay`
- investor count renders
- progress percentage is computed from `bigint` minor units
- visual percentage clamps above 100 percent
- zero target does not divide by zero
- SVG/progress surface has an accessible label or title

Use realistic amounts with cents.

Do not do floating-point money arithmetic in test setup when domain helpers can
construct exact values.

## 5. SPV State Tracker Tests

Test:

- all statuses in `SPV_STATUSES` render in order
- current status gets `data-state="current"`
- previous statuses get `data-state="complete"`
- following statuses get `data-state="pending"`
- `labels` is exhaustive through the `Record<SpvStatus, string>` prop

Prefer a table test over scattered one-off tests.

## 6. DealTermsPanel Tests

Test:

- title renders as a heading
- each term label and value renders exactly
- optional descriptions render when provided
- empty term array renders an accessible empty structural state if the component
  supports one, or no rows if it does not

Do not hardcode domain-specific legal copy in component tests.

## 7. InvestorRow Tests

Test:

- row summary renders investor name, country, status, and amount
- disclosure button has `aria-expanded`
- click toggles open and closed state with `user-event`
- expanded content is mounted/unmounted
- status and qualification labels come from props
- accessibility check passes for closed and open states

Do not test Motion implementation details. Test the rendered state.

## 8. Dashboard Demo Tests

The dashboard demo needs a light smoke test only:

- renders the main heading/label
- renders the commitment progress
- renders at least one investor row
- has no obvious accessibility violations

Avoid brittle assertions against every demo value.

## 9. Stories As Visual Documentation

Every component in this loop needs a Storybook story.

Use stories to show:

- default/light state
- dark mode through the existing Storybook toolbar
- locale differences where relevant, especially `MoneyDisplay`
- expanded and collapsed investor rows
- a realistic dashboard demo block

Do not add image snapshot infrastructure in this loop. It is valid later when
the dashboard demo becomes stable enough to protect visually.

## 10. Contract Script

Add a small package-level contract script:

```text
packages/kit/scripts/check-kit-contract.mjs
```

It should reject at least:

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
- hardcoded Tailwind color family utilities such as `text-green-600`
- manual `dark:` overrides
- `space-x-*` and `space-y-*`

Unlike `@repo/ui`, `@repo/kit` may import `lucide-react`.

Wire the script into package tests:

```json
{
  "scripts": {
    "check:contracts": "node scripts/check-kit-contract.mjs",
    "test": "pnpm check:contracts && vitest run",
    "test:coverage": "pnpm check:contracts && vitest run --coverage"
  }
}
```

## 11. Coverage

`pnpm --filter @repo/kit test:coverage` must pass.

Use high coverage thresholds. Prefer 100 percent for implemented files unless a
Motion or DOM-environment edge case makes that counterproductive. If thresholds
are lower than 100 percent, record the reason in `STATUS.md`.

## 12. Verification Commands

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

If dependencies are added, also run the relevant install command and ensure
`pnpm-lock.yaml` changes are expected.
