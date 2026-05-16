# @repo/domain

Pure domain and financial primitives for the funding workspace.

This package depends on `@repo/core` and `zod`. It must not depend on React,
Next.js, Tailwind, UI packages, app code, or browser APIs.

## Exports

Root export:

```ts
import {
  AmountStepSchema,
  CommitmentFormSchema,
} from '@repo/domain'
```

Focused exports:

```ts
import { parseEuroCents, formatEuroCents } from '@repo/domain/money'
import { DealIdSchema, dealIdFromString } from '@repo/domain/ids'
import { SubmittableCommitmentFormSchema } from '@repo/domain/commitment-flow'
import { summarizeCapitalReconciliation } from '@repo/domain/reconciliation'
import { canTransitionSpvStatus } from '@repo/domain/spv'
```

## Modules

- `money` — `EuroCents`, safe parsing/formatting, exact `bigint` arithmetic.
- `ids` — branded UUID domain IDs.
- `commitment-flow` — Zod schemas for amount, qualification, KYC/KYB, review,
  and final submittable commitment payloads.
- `reconciliation` — capital stage/payment status vocabulary, payment record
  schema branding, exact capital reconciliation summaries, and fixtures.
- `spv` — SPV lifecycle status and allowed transition helpers.

## Money Example

```ts
import {
  addEuroCents,
  formatEuroCents,
  parseEuroCents,
} from '@repo/domain/money'

const first = parseEuroCents('5 000,00 €')
const second = parseEuroCents('2 500,00 €')

if (first.isOk() && second.isOk()) {
  const total = addEuroCents(first.value, second.value)
  const rendered = formatEuroCents(total, { locale: 'fr-FR' })

  void rendered
}
```

Money is EUR-only in v1. Multi-currency, FX, allocation, basis points, and
rounding-policy helpers are intentionally deferred.

## Commitment Flow Example

```ts
const parsed = SubmittableCommitmentFormSchema.safeParse(payload)

if (!parsed.success) {
  // UI layer translates stable Zod message keys.
}
```

`CommitmentFormSchema` may represent `qualificationType: 'non_eligible'` so the
UI can render a blocking state. `SubmittableCommitmentFormSchema` rejects that
state.

## Reconciliation Example

```ts
import {
  reconciliationFixtures,
  summarizeCapitalReconciliation,
} from '@repo/domain/reconciliation'

const summary = summarizeCapitalReconciliation(reconciliationFixtures.onTrack)

if (summary.isOk()) {
  void summary.value.unfundedCommittedCents
}
```

Reconciliation helpers distinguish committed, signed, received, and matched
capital. They return structured domain results and exact `EuroCents` amounts,
not display copy or accounting ledger entries.

## Commands

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
```

## Non-Goals

- React components or hooks
- `next-intl` usage
- Tailwind or CSS
- API clients, KYC provider clients, or document upload clients
- Banking integrations, IBAN/SWIFT validation, or payment-provider webhooks
- Multi-currency or FX conversion
- Legal close-readiness computation or concentration risk helpers
- Ratio/allocation/basis-point helpers

See [../../docs/20-specs/domain-spec.md](../../docs/20-specs/domain-spec.md),
[../../docs/10-architecture/domain-adrs.md](../../docs/10-architecture/domain-adrs.md), and
[../../docs/30-testing/testing-domain.md](../../docs/30-testing/testing-domain.md).
