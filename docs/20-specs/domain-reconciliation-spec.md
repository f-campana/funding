# Domain Reconciliation Specification
## `@repo/domain/reconciliation` - capital and payment reconciliation vocabulary

**Status:** Implemented
**Scope:** `packages/domain/src/reconciliation`  
**Depends on:** `@repo/core`, existing `@repo/domain` money/ID modules, `zod`  
**Must not depend on:** React, Next.js, DOM APIs, Tailwind, Shadcn, `@repo/ui`,
`@repo/kit`, Prisma, tRPC, GraphQL, database clients, banking APIs

---

## 0. Purpose

The current dashboard shows "committed capital" as a single headline number.
That is too broad for private-markets operations. A closing operator needs to
distinguish capital that is committed, signed, received, and matched.

This pass adds a small domain vocabulary and exact-money helpers for capital
reconciliation. It does not implement accounting, banking integrations,
database persistence, API routers, or legal close-readiness logic.

The output unblocks the next Closing Readiness + Exception Dashboard pass by
giving `@repo/kit` stable domain types instead of kit-local strings.

---

## 1. Package Boundary

Allowed imports:

```ts
import { Result } from '@repo/core'
import { CommitmentIdSchema, type CommitmentId } from '../ids'
import {
  addEuroCents,
  compareEuroCents,
  euroCentsFromNumberMinorUnits,
  subtractEuroCents,
  type EuroCents,
} from '../money'
import { z } from 'zod'
```

Use relative imports inside `packages/domain`. External consumers can import the
implemented module through `@repo/domain/reconciliation`.

Forbidden imports:

```ts
import type { ReactNode } from 'react'
import { Button } from '@repo/ui'
import { MoneyDisplay } from '@repo/kit'
import { prisma } from '@/db'
import { createTRPCRouter } from '@/trpc'
```

Domain reconciliation functions may return structured status tags and error
tags. They must not return translated, user-facing prose.

---

## 2. File Layout

Add:

```text
packages/domain/src/reconciliation/
  fixtures.ts
  index.ts
  reconciliation.test-types.ts
  reconciliation.test.ts
  reconciliation.ts
```

Update:

```text
packages/domain/src/index.ts
packages/domain/src/package-exports.test.ts
packages/domain/package.json
packages/domain/README.md
```

`packages/domain/package.json` should expose:

```json
{
  "exports": {
    "./reconciliation": {
      "types": "./src/reconciliation/index.ts",
      "import": "./src/reconciliation/index.ts"
    }
  }
}
```

Keep existing exports unchanged.

---

## 3. Capital Stages

Capital stages represent how far an investor's amount has moved through the
closing process.

```ts
export const CapitalStageSchema = z.enum([
  'committed',
  'signed',
  'received',
  'matched',
])

export type CapitalStage = z.infer<typeof CapitalStageSchema>
```

Meaning:

| Stage | Meaning |
|---|---|
| `committed` | Investor has an accepted commitment amount. |
| `signed` | Investor has signed the subscription package or equivalent commitment document. |
| `received` | Funds have been received by the SPV or collection account. |
| `matched` | Received funds have been matched to the expected commitment/investor. |

Rules:

- `matched <= received <= signed <= committed`
- over-target committed capital is allowed and represented explicitly
- amounts must be exact `EuroCents`
- no FX, no multi-currency, no display formatting
- do not add future states until a later spec requires them

Future states such as `cleared`, `reconciled`, `refunded`, and
`exception_pending` remain deferred.

---

## 4. Payment Status

Payment status describes the operational payment lifecycle for one expected
payment.

```ts
export const PaymentStatusSchema = z.enum([
  'not_requested',
  'instructions_released',
  'pending',
  'received',
  'matched',
  'exception_pending',
  'refunded',
])

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>
```

Meaning:

| Status | Meaning |
|---|---|
| `not_requested` | Wire/payment instructions have not been released. |
| `instructions_released` | Payment instructions are available to the investor. |
| `pending` | Payment is expected or has been initiated but not received. |
| `received` | Funds were received but not yet matched to the expected commitment. |
| `matched` | Received funds match the expected investor/commitment. |
| `exception_pending` | Amount, payer, reference, or status needs manual review. |
| `refunded` | Funds were returned or are marked as returned. |

This is not a bank-transfer state machine. It is a product/domain vocabulary
for dashboard, form, and future API contracts.

---

## 5. Payment Record

Payment records are JSON-compatible at the schema boundary and branded in the
parsed output.

```ts
export type PaymentRecord = {
  readonly commitmentId: CommitmentId
  readonly expectedAmountCents: EuroCents
  readonly receivedAmountCents: EuroCents
  readonly status: PaymentStatus
  readonly payerName: string
  readonly subscriberName: string
  readonly reference?: string
}
```

Schema:

```ts
export const PaymentRecordSchema: z.ZodType<PaymentRecord>
```

Input behavior:

- `commitmentId` accepts a UUID string through `CommitmentIdSchema`
- `expectedAmountCents` accepts JSON-safe integer minor units, then transforms
  to `EuroCents` via `euroCentsFromNumberMinorUnits`
- `receivedAmountCents` follows the same transform
- both amount inputs must be integer, safe, and non-negative
- `payerName` and `subscriberName` must be non-empty after trimming
- `reference` is optional, but if present must be non-empty after trimming
- unknown statuses are rejected by `PaymentStatusSchema`

Transform pattern:

```ts
const euroCentsJsonSchema = z.number().int().safe().nonnegative().transform(
  (value, ctx) => {
    const result = euroCentsFromNumberMinorUnits(value)

    if (result.isError()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error._tag,
      })
      return z.NEVER
    }

    return result.value
  },
)
```

The concrete implementation may extract this helper locally inside
`reconciliation.ts`. Do not export it unless another domain module needs it.

---

## 6. Capital Reconciliation Summary

The dashboard needs exact derived amounts without embedding arithmetic in React
components.

```ts
export type CapitalReconciliationInput = {
  readonly targetAmountCents: EuroCents
  readonly committedAmountCents: EuroCents
  readonly signedAmountCents: EuroCents
  readonly receivedAmountCents: EuroCents
  readonly matchedAmountCents: EuroCents
}

export type CapitalReconciliationSummary = CapitalReconciliationInput & {
  readonly remainingToTargetCents: EuroCents
  readonly overTargetCents: EuroCents
  readonly unsignedCommittedCents: EuroCents
  readonly unreceivedSignedCents: EuroCents
  readonly unmatchedReceivedCents: EuroCents
  readonly unfundedCommittedCents: EuroCents
  readonly hasUnmatchedFunds: boolean
  readonly isOverTarget: boolean
}
```

Derived values:

| Field | Formula |
|---|---|
| `remainingToTargetCents` | `max(target - committed, 0)` |
| `overTargetCents` | `max(committed - target, 0)` |
| `unsignedCommittedCents` | `committed - signed` |
| `unreceivedSignedCents` | `signed - received` |
| `unmatchedReceivedCents` | `received - matched` |
| `unfundedCommittedCents` | `committed - received` |
| `hasUnmatchedFunds` | `unmatchedReceivedCents > 0` |
| `isOverTarget` | `overTargetCents > 0` |

Public helper:

```ts
export type CapitalReconciliationAmountField =
  | 'targetAmountCents'
  | 'committedAmountCents'
  | 'signedAmountCents'
  | 'receivedAmountCents'
  | 'matchedAmountCents'

export type CapitalReconciliationError =
  | {
      readonly _tag: 'NegativeAmount'
      readonly field: CapitalReconciliationAmountField
      readonly amountCents: EuroCents
    }
  | {
      readonly _tag: 'StageOrderViolation'
      readonly earlierStage: CapitalStage
      readonly laterStage: CapitalStage
      readonly earlierAmountCents: EuroCents
      readonly laterAmountCents: EuroCents
    }

export const summarizeCapitalReconciliation: (
  input: CapitalReconciliationInput,
) => Result<CapitalReconciliationSummary, CapitalReconciliationError>
```

Validation rules:

- all five input amounts must be non-negative
- `matched <= received <= signed <= committed`
- `targetAmountCents` may be less than committed amount; this is
  over-target/oversubscribed, not invalid
- zero target is allowed for empty/not-started demo states
- invalid inputs return `Result.Error`, not thrown exceptions

Use `EuroCents` helpers for all arithmetic and comparison. Do not convert to
`number` for calculations.

---

## 7. Fixtures

Add fixtures for tests and future kit demos:

```ts
export type ReconciliationFixtures = {
  readonly onTrack: CapitalReconciliationInput
  readonly blockedUnmatchedFunds: CapitalReconciliationInput
  readonly overTarget: CapitalReconciliationInput
  readonly notStarted: CapitalReconciliationInput
  readonly invalidReceivedMoreThanSigned: CapitalReconciliationInput
}

export type PaymentRecordFixtures = {
  readonly matchedCamille: PaymentRecord
  readonly pendingElise: PaymentRecord
  readonly exceptionBelair: PaymentRecord
}

export const reconciliationFixtures: ReconciliationFixtures = { ... }
export const paymentRecordFixtures: PaymentRecordFixtures = { ... }
```

Fixtures may use `euroCentsFromMinorUnits` because they live inside domain code.

---

## 8. Non-Goals

Do not implement:

- Prisma models
- tRPC routers
- GraphQL types
- API clients
- banking integrations
- IBAN validation
- payment-provider webhooks
- actual accounting ledgers
- FX or multi-currency
- legal closing readiness
- UI copy, React components, or chart data transforms
- concentration risk calculations

This pass only creates exact domain vocabulary and helpers for the next
dashboard loop.

---

## 9. Verification

From the repo root:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

All commands must pass before the loop is complete.
