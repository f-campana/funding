# Testing Domain Reconciliation

## Purpose

The reconciliation module protects the distinction between committed, signed,
received, and matched capital. Tests should prove that exact money arithmetic
stays in `EuroCents`, invalid stage totals are rejected, and JSON schema inputs
are safely branded before use.

This guide extends [Testing domain](./testing-domain.md).

---

## Required Commands

From the repo root:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Domain reconciliation tests remain pure Node/Vitest tests. Do not use React
Testing Library, Playwright, Storybook, snapshots, or image snapshots.

---

## Unit Tests

### Status Schemas

Test that:

- every `CapitalStage` value parses through `CapitalStageSchema`
- unknown capital stages are rejected
- every `PaymentStatus` value parses through `PaymentStatusSchema`
- unknown payment statuses are rejected

Use explicit arrays so added/removed statuses force test updates.

### Payment Record Schema

Test valid parsing:

- JSON-safe `expectedAmountCents` transforms to `EuroCents`
- JSON-safe `receivedAmountCents` transforms to `EuroCents`
- valid status parses
- optional `reference` is preserved when present
- output works with `euroCentsToMinorUnits`

Test invalid parsing:

- non-integer amount
- unsafe integer amount
- negative amount
- empty `payerName`
- empty `subscriberName`
- empty optional `reference`
- unknown payment status

Tests should assert schema failure, not user-facing copy.

### Summary Helper

Use exact examples:

- on-track summary:
  - target `2_500_000_00`
  - committed `1_875_000_00`
  - signed `1_500_000_00`
  - received `750_000_00`
  - matched `750_000_00`
  - remaining to target `625_000_00`
  - unsigned committed `375_000_00`
  - unreceived signed `750_000_00`
  - unmatched received `0`
  - unfunded committed `1_125_000_00`

- blocked unmatched funds:
  - received greater than matched
  - `hasUnmatchedFunds === true`
  - `unmatchedReceivedCents` is exact

- over-target summary:
  - committed greater than target
  - `remainingToTargetCents === 0`
  - `isOverTarget === true`
  - `overTargetCents` is exact

- not-started summary:
  - all amounts zero
  - all derived amounts zero
  - `isOverTarget === false`
  - `hasUnmatchedFunds === false`

Invalid input tests:

- negative target amount returns `NegativeAmount`
- negative committed amount returns `NegativeAmount`
- signed greater than committed returns `StageOrderViolation`
- received greater than signed returns `StageOrderViolation`
- matched greater than received returns `StageOrderViolation`

Do not throw on invalid inputs. Assert `Result.Error`.

---

## Property Tests

Use `fast-check` over bounded realistic `bigint` values. Generate monotonic
amounts by construction:

```ts
matched <= received <= signed <= committed
```

Suggested generation strategy:

- generate non-negative deltas:
  - `matched`
  - `unmatchedReceived`
  - `unreceivedSigned`
  - `unsignedCommitted`
- derive:
  - `received = matched + unmatchedReceived`
  - `signed = received + unreceivedSigned`
  - `committed = signed + unsignedCommitted`
- generate `target` independently

Required properties:

- valid monotonic inputs always return `Result.Ok`
- all derived values are non-negative
- `committed = signed + unsignedCommitted`
- `signed = received + unreceivedSigned`
- `received = matched + unmatchedReceived`
- `committed = received + unfundedCommitted`
- `remainingToTarget` and `overTarget` are never both positive
- `hasUnmatchedFunds` agrees with `unmatchedReceivedCents > 0`
- `isOverTarget` agrees with `overTargetCents > 0`

Keep ranges inspectable. EUR 0 to EUR 100 million in cents is enough for this
pass.

---

## Type Tests

Add `reconciliation.test-types.ts` and ensure it is included by the domain
`tsconfig.json`.

Compile-time expectations:

- `CapitalReconciliationInput` rejects plain `number` amounts
- `CapitalReconciliationInput` rejects plain `bigint` amounts
- `PaymentRecord` rejects plain string commitment IDs
- valid branded `EuroCents` values typecheck
- parsed `PaymentRecordSchema` output exposes `EuroCents`

Prefer `// @ts-expect-error` for negative cases.

---

## Boundary Audits

After implementation, run these source audits from the repo root:

```bash
rg "from ['\\\"](react|next|@repo/ui|@repo/kit|@repo/tailwind-config|@repo/design-tokens)" packages/domain/src/reconciliation
rg "trpc|graphql|prisma|database|iban|swift|fx|currencyCode" packages/domain/src/reconciliation
rg "Number\\(|parseFloat|parseInt|\\.toFixed\\(" packages/domain/src/reconciliation
```

Expected result: no hits, unless a hit is inside a test name explaining a
forbidden non-goal. If there is an intentional test-name hit, document it in
`STATUS.md`.

---

## Completion Criteria

The pass is complete when:

- `@repo/domain/reconciliation` exports the new public API
- root domain exports include reconciliation APIs
- package export smoke tests cover the subpath
- unit, property, and type tests pass
- all verification commands pass
- no forbidden imports or non-goal features were added
