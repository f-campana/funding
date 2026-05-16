# Testing Closing Readiness Dashboard V1

**Status:** Historical implemented pass; superseded as current kit API
**Scope:** focused testing guidance for the Closing Readiness / Exception
Dashboard V1 kit pass.

Current status note: the kit components covered by this historical guide were
removed during baseline cleanup. Current kit testing guidance lives in
[testing-kit.md](./testing-kit.md) and covers only `DealCommitmentsTable` and
`DealProgressPanel`.

## 1. Purpose

This testing pass protects the product shift from a passive status dashboard to
an operational exception workspace.

Tests should prove that:

- readiness is visible and stateful
- blockers are sorted and actionable
- local interactions are accessible
- capital reconciliation preserves exact money semantics
- mobile keeps the primary operational path visible
- existing investor-row behavior is preserved

Do not test Tailwind itself, chart-library internals, or Motion implementation
details.

## 2. Test Stack

Use the existing stack:

- Vitest
- Testing Library React
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `vitest-axe`
- Playwright for app integration where needed

Do not introduce Jest, Cypress, Chromatic, Percy, or new visual services in
this loop.

## 3. Query Strategy

Prefer:

- `getByRole`
- accessible names
- visible headings
- button names
- `aria-expanded`
- `data-slot` only for structural contract assertions
- `data-state` for semantic state assertions

Avoid:

- `data-testid`
- raw CSS selectors
- full HTML snapshots
- brittle assertions against every demo paragraph

## 4. Readiness Summary Tests

Test:

- all four readiness states render:
  - `ready`
  - `attention`
  - `blocked`
  - `not_started`
- each state exposes the correct `data-state`
- heading/title renders
- blocker count renders
- closing date label renders
- deadline label renders
- last updated label renders
- remaining amount renders through `MoneyDisplay`
- representative accessibility check passes

Do not assert raw color values. If classes are asserted, assert semantic token
classes such as `bg-readiness-blocked-muted`, not hardcoded color families.

## 5. Blocker Queue Tests

Test sorting:

- critical before warning
- warning before info
- overdue / due today / due soon before on-track / no due date inside the same
  severity

Test interaction:

- detail button toggles expanded/collapsed state
- acknowledgement button toggles local acknowledged state
- acknowledgement is reversible if the component supports it
- keyboard users can tab to action buttons and activate them
- selected/focused blocker state is exposed accessibly if implemented

Test content:

- owner label renders
- next action renders
- due state renders
- related investor renders when present
- reference renders when present
- empty state renders when blockers are empty

Do not mock network calls. There should be no async persistence behavior to
test.

## 6. Capital Reconciliation Tests

Use `@repo/domain/reconciliation` fixtures and helpers.

Test:

- `summarizeCapitalReconciliation` result is accepted by the panel
- target amount renders
- committed amount renders
- signed amount renders
- received amount renders
- matched amount renders
- remaining amount renders
- unmatched received funds render when present
- unfunded committed capital renders
- over-target state renders when present
- high committed / low matched case is visually distinguishable through labels
  and status semantics

Money assertions must normalize French spacing:

```ts
const normalizeFrenchSpacing = (value: string) =>
  value.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ')
```

Do not use `Number(...)`, `parseFloat`, `parseInt`, or `.toFixed(...)` for money
setup or assertions. Use domain helpers and `MoneyDisplay`.

## 7. Dashboard Demo Tests

Test:

- readiness summary appears before secondary modules
- critical blocker is visible without expanding investor rows
- blocker queue renders at least one actionable button
- capital reconciliation panel renders committed/signed/received/matched labels
- investor rows still render and expand
- mobile/narrow view keeps blockers visible before collapsed secondary modules
- no obvious accessibility violations on the dashboard surface

The dashboard test should remain a smoke/contract test. Do not assert every
fixture value unless the value is central to the contract.

## 8. App E2E Tests

If app e2e needs updates, cover:

- `/deals/northstar-energy` renders readiness summary
- a critical blocker is visible on first render
- action queue button can be focused and activated
- first investor row expands after the dashboard changes
- mobile viewport has no horizontal overflow
- mobile viewport shows readiness and blockers before collapsed secondary
  disclosures

Use Playwright screenshots as output artifacts for review. Do not add image
snapshot assertions unless they are stable and require no broad tooling change.

## 9. Accessibility

Use `vitest-axe` for representative component surfaces:

- readiness summary
- populated blocker queue
- empty blocker queue
- capital reconciliation panel
- dashboard demo

Interactive controls must be real buttons with stable accessible names. A
clickable div is not acceptable.

## 10. Contract Script Expectations

The existing `packages/kit/scripts/check-kit-contract.mjs` must continue to
pass.

The new code must not include:

- `React.forwardRef`
- imported `forwardRef`
- `.displayName =`
- `data-testid`
- `dangerouslySetInnerHTML`
- `next-intl`
- `next/navigation`
- app imports
- server/database/tRPC imports
- raw hex colors
- raw `oklch(...)`
- hardcoded Tailwind color-family utilities
- manual `dark:` overrides
- `space-x-*` or `space-y-*`

Semantic classes like `bg-readiness-blocked-muted` and
`text-status-attention` are allowed.

## 11. Verification Commands

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

If browser launch is blocked locally, record the exact blocker in `STATUS.md`
and still complete all non-browser verification.

## 12. Coverage

`pnpm --filter @repo/kit test:coverage` must pass with the existing package
thresholds.

If coverage drops because of a DOM/browser edge case, prefer a small component
test over lowering thresholds. If thresholds must change, record the exact
reason in `STATUS.md`.
