# Domain Package Specification
## `@repo/domain` - Financial domain types, schemas, and pure utilities

**Status:** Implemented v1.0
**Scope:** `packages/domain`
**Depends on:** `@repo/core`, `zod`
**Must not depend on:** React, Next.js, DOM APIs, Tailwind, Shadcn, `next-intl`

---

## 0. Purpose

`@repo/domain` owns the business vocabulary that sits above `@repo/core` and
below UI/application code. It provides branded primitives, financial utilities,
runtime schemas, and small domain state models.

The package exists so that financial and regulatory rules are not redefined in
React components, tRPC handlers, form adapters, or demo blocks.

---

## 1. Package Boundary

Allowed imports:

```ts
import { Result, Option } from '@repo/core'
import { z } from 'zod'
```

Forbidden imports:

```ts
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@repo/ui'
import { cn } from '@repo/ui'
```

Domain functions may accept `locale: string`, but they must never read locale
from context. Formatting is pure and deterministic.

Domain schemas and helpers must not own user-facing translated copy. When a
runtime schema needs a message, prefer a stable message key or structured error
tag that UI/app code can translate:

```ts
// Good
{ readonly _tag: 'MissingWireInstructionsAcknowledgement' }

// Acceptable for Zod issue messages
'commitment.review.wire_instructions_required'

// Avoid in domain code
'You must acknowledge the wire transfer instructions'
```

Locale is a presentation concern. Currency is a domain/accounting concern. A
`fr-FR` locale does not imply EUR, and formatting an amount in `en-US` does not
convert it to USD.

---

## 2. File Layout

Target structure:

```text
packages/domain/
  src/
    index.ts
    brand.ts
    ids.ts
    money/
      euro-cents.ts
      euro-cents.test.ts
      index.ts
    commitment-flow/
      commitment-flow.ts
      commitment-flow.test.ts
      fixtures.ts
      index.ts
    spv/
      spv-status.ts
      spv-status.test.ts
      index.ts
```

The bootstrap `domainBootstrapStatus` placeholder has been removed.

---

## 3. Package Exports

`packages/domain/package.json` should expose the root and focused subpaths:

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./money": {
      "types": "./src/money/index.ts",
      "import": "./src/money/index.ts"
    },
    "./ids": {
      "types": "./src/ids.ts",
      "import": "./src/ids.ts"
    },
    "./commitment-flow": {
      "types": "./src/commitment-flow/index.ts",
      "import": "./src/commitment-flow/index.ts"
    },
    "./spv": {
      "types": "./src/spv/index.ts",
      "import": "./src/spv/index.ts"
    }
  }
}
```

The root barrel may re-export all stable domain APIs. UI and kit code should
prefer focused subpath imports when only one domain area is needed.

Package dependencies:

```json
{
  "dependencies": {
    "@repo/core": "workspace:*",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@repo/test-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@vitest/coverage-v8": "^4.1.5",
    "fast-check": "^4.7.0",
    "vitest": "^4.1.5"
  }
}
```

`@repo/core` and `zod` are runtime dependencies because exported domain
functions and schemas use them. Test-only libraries remain dev dependencies.

---

## 4. Money: `EuroCents`

### 4.1 Representation

Money is represented as branded integer minor units:

```ts
declare const euroCentsBrand: unique symbol

export type EuroCents = bigint & {
  readonly [euroCentsBrand]: 'EuroCents'
}
```

Rules:

- no floats in domain logic
- no `number` arithmetic for money
- no generic multi-currency `Money<C>` in v1
- no implicit conversion between currencies
- no multiplication by floating ratios in v1

`EuroCents` is signed. Commitment schemas enforce positive values where needed.
Signed values are useful for adjustments, deltas, refunds, and accounting views.

`EuroCents` intentionally uses its own `unique symbol` brand instead of the
generic `Brand<T, Name>` helper. Money is the highest-risk primitive in this
package and should remain nominally distinct from any structurally similar
integer brand. `Brand<T, Name>` is reserved for string IDs.

### 4.2 Public API

```ts
export type MoneyParseError =
  | { readonly _tag: 'EmptyInput' }
  | { readonly _tag: 'InvalidFormat'; readonly input: string }
  | { readonly _tag: 'TooManyFractionDigits'; readonly input: string }
  | { readonly _tag: 'UnsafeNumber'; readonly value: number }

export type MoneyFormatError =
  | { readonly _tag: 'UnsafeNumber'; readonly value: bigint }

export type FormatEuroCentsOptions = {
  readonly locale?: string
  readonly currencyDisplay?: 'symbol' | 'code' | 'name'
}

export const euroCentsFromMinorUnits: (value: bigint) => EuroCents

export const euroCentsFromNumberMinorUnits: (
  value: number,
) => Result<EuroCents, MoneyParseError>

export const parseEuroCents: (
  input: string,
) => Result<EuroCents, MoneyParseError>

export const formatEuroCents: (
  value: EuroCents,
  options?: FormatEuroCentsOptions,
) => Result<string, MoneyFormatError>

export const serializeEuroCentsToNumber: (
  value: EuroCents,
) => Result<number, MoneyFormatError>

export const euroCentsToMinorUnits: (value: EuroCents) => bigint

export const addEuroCents: (left: EuroCents, right: EuroCents) => EuroCents
export const subtractEuroCents: (left: EuroCents, right: EuroCents) => EuroCents
export const negateEuroCents: (value: EuroCents) => EuroCents
export const compareEuroCents: (left: EuroCents, right: EuroCents) => -1 | 0 | 1
export const isZeroEuroCents: (value: EuroCents) => boolean
export const isPositiveEuroCents: (value: EuroCents) => boolean
export const isNegativeEuroCents: (value: EuroCents) => boolean
```

### 4.3 Parsing

`parseEuroCents` accepts common investor-facing formats:

```text
1234
1234.56
1234,56
1 234,56
1.234,56
1_234,56
1 234,56 EUR
1 234,56 €
-1 234,56
```

Rules:

- trim outer whitespace
- accept regular spaces, no-break spaces, and narrow no-break spaces
- accept comma or dot decimal separator
- reject more than two fractional digits
- reject ambiguous mixed separators that cannot be interpreted deterministically
- reject an empty string
- preserve exact cents

Parser algorithm:

1. Trim input and remove a trailing `€` or `EUR` marker if present.
2. Preserve a leading `-` sign, then parse the absolute value.
3. Normalize grouping whitespace: regular space, `_`, `\u00a0`, and `\u202f`
   are grouping separators and may be stripped.
4. Identify decimal separator before stripping dot/comma grouping separators.
5. If both `,` and `.` appear, the last occurrence is the decimal separator.
   Earlier occurrences of the other separator are grouping separators.
6. If only `,` appears, treat it as the decimal separator. Comma is never a
   thousands separator in v1.
7. If only `.` appears, treat it as the decimal separator only when the suffix
   length is one or two digits. Otherwise reject as ambiguous.
8. Reject a decimal suffix longer than two digits.
9. Reject malformed grouping, repeated decimal separators, or any non-digit
   characters after normalization.
10. Build cents using string-to-`bigint` conversion:
    `major * 100n + paddedMinor`.

This deliberately rejects inputs such as `1,234` and `12,345` instead of
guessing whether they mean one euro and cents or a thousands grouping.

### 4.4 Formatting

`formatEuroCents` defaults to `fr-FR` and `symbol`.

Expected examples:

```ts
formatEuroCents(euroCentsFromMinorUnits(123456n))
// Ok("1\u202f234,56\u00a0€") or an Intl-equivalent fr-FR spacing variant

formatEuroCents(euroCentsFromMinorUnits(-123456n))
// Ok("-1\u202f234,56\u00a0€") or an Intl-equivalent fr-FR spacing variant
```

Tests must normalize `\u00a0` and `\u202f` before string comparison when the
assertion only cares about human-visible spacing.

### 4.5 Deferred Money Features

Do not implement in this loop:

- generic `Money<Currency>`
- FX conversion
- ratio multiplication
- basis-point calculation helpers
- allocation/remainder algorithms
- rounding modes

These require separate ADRs because they encode financial policy.

### 4.6 Future multi-currency boundary

V1 models committed investment amounts in EUR only. Multi-currency portfolio
valuation is a separate future domain requiring:

- `CurrencyCode`
- exchange-rate source
- valuation date
- rounding policy
- audit trail for conversion inputs

No implicit currency conversion is allowed. Do not add `Money<Currency>`,
`CurrencyCode`, FX rates, or conversion helpers in this loop.

---

## 5. Branded IDs

Create a shared brand helper:

```ts
declare const brand: unique symbol

export type Brand<T, Name extends string> = T & {
  readonly [brand]: Name
}
```

Domain IDs:

```ts
export type DealId = Brand<string, 'DealId'>
export type InvestorId = Brand<string, 'InvestorId'>
export type CommitmentId = Brand<string, 'CommitmentId'>
export type SpvId = Brand<string, 'SpvId'>
export type FundId = Brand<string, 'FundId'>
export type DocumentId = Brand<string, 'DocumentId'>
```

For each ID, expose:

- a Zod UUID schema that transforms to the branded type
- a `fromString` constructor returning `Result<Id, IdParseError>`

The shared ID parse error is:

```ts
export type IdParseError = {
  readonly _tag: 'InvalidUuid'
  readonly input: string
}
```

Do not generate IDs in `@repo/domain`. ID generation belongs to app/backend code.

---

## 6. Commitment Flow Schemas

Use `docs/archive/commitment-flow.schemas.ts` as the source draft, but adapt it to the
implemented domain package.

Target module:

```text
packages/domain/src/commitment-flow/commitment-flow.ts
```

The flow has four steps:

1. amount
2. qualification
3. KYC/KYB
4. review

Required exports:

```ts
export const EU_EUVECA_COUNTRIES: readonly string[]
export const NON_EU_SUPPORTED_COUNTRIES: readonly string[]
export const ALL_SUPPORTED_COUNTRIES: readonly string[]

export const AmountStepSchema: z.ZodType<AmountStep>
export const QualificationStepSchema: z.ZodType<QualificationStep>
export const KycStepSchema: z.ZodType<KycStep>
export const ReviewStepSchema: z.ZodType<ReviewStep>
export const CommitmentFormSchema: z.ZodType<CommitmentFormData>
export const SubmittableCommitmentFormSchema: z.ZodType<SubmittableCommitmentFormData>

export type AmountStep = ...
export type QualificationStep = ...
export type ProfessionalQualification = ...
export type InformedQualification = ...
export type KycStep = ...
export type IndividualKyc = ...
export type LegalEntityKyb = ...
export type UploadedDocument = ...
export type Ubo = ...
export type ReviewStep = ...
export type CommitmentFormData = ...
export type SubmittableCommitmentFormData = ...
```

Amount handling:

- `AmountStepSchema` accepts JSON-compatible number cents as input
- output should be branded `EuroCents`
- enforce integer and safe-number input before branding
- transform via `euroCentsFromNumberMinorUnits`, never by direct cast
- deal-specific minimum ticket is not hardcoded in the base schema

Required transform pattern:

```ts
const AmountCentsSchema = z
  .number()
  .int()
  .safe()
  .transform((value, ctx) => {
    const result = euroCentsFromNumberMinorUnits(value)

    if (result.isError()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `money.${result.error._tag}`,
      })

      return z.NEVER
    }

    return result.value
  })
```

The Zod `message` above is a stable key, not final user-facing copy. UI/app code
owns translation.

Qualification rules:

- professional investor requires at least two of three MiFID II criteria
- informed investor is restricted to EuVECA countries
- non-eligible is explicit, so UI can render a blocking state
- all legal/regulatory acknowledgements use `z.literal(true)`
- Zod messages use stable keys, not translated prose

KYC/KYB rules:

- uploaded documents are server-returned metadata, not raw `File` objects
- document size max is 10 MB
- legal entities require at least one UBO
- each UBO has ownership percentage between 25 and 100
- UBO completeness is an explicit `z.literal(true)` consent
- Zod messages use stable keys, not translated prose

Review rules:

- all required confirmations are `z.literal(true)`
- wire confirmation email is validated
- Zod messages use stable keys, not translated prose

Submission distinction:

- `CommitmentFormSchema` may represent all form states, including
  `qualificationType: 'non_eligible'`, so UI can render a blocking step
- `SubmittableCommitmentFormSchema` must reject `non_eligible`
- final submission code should use `SubmittableCommitmentFormSchema`

---

## 7. SPV Lifecycle

`@repo/domain` owns the string states and legal transition table. It does not
own XState machines.

Target module:

```text
packages/domain/src/spv/spv-status.ts
```

Statuses:

```ts
export const SPV_STATUSES = [
  'draft',
  'open',
  'kyc_in_progress',
  'e_signatures',
  'collecting',
  'incorporated',
  'closed',
] as const

export type SpvStatus = (typeof SPV_STATUSES)[number]
```

Required helpers:

```ts
export const SpvStatusSchema: z.ZodEnum<...>
export const isTerminalSpvStatus: (status: SpvStatus) => boolean
export const canTransitionSpvStatus: (from: SpvStatus, to: SpvStatus) => boolean
```

Allowed transitions:

```text
draft -> open
open -> kyc_in_progress
kyc_in_progress -> e_signatures
e_signatures -> collecting
collecting -> incorporated
incorporated -> closed
```

No reverse transitions in v1. Exceptional operations such as cancellation,
rollback, legal dispute, or reopening require a separate ADR.

---

## 8. Testing and Coverage

`packages/domain` should use:

- Vitest
- fast-check
- Zod schema fixtures
- 100 percent coverage thresholds for implemented domain files

No React Testing Library. No DOM. No snapshots.

See `docs/30-testing/testing-domain.md`.

---

## 9. Verification

Required commands:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
```

The package should add a `lint` script if missing:

```json
"lint": "biome check ./src"
```

---

## 10. Non-Goals

Do not implement:

- React hooks
- UI components
- tRPC routers
- Prisma models
- XState machines
- generic multi-currency money
- FX conversion
- document upload clients
- KYC provider clients
- event sourcing engine
- backend persistence
