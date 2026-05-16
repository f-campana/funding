# Ralph Loop Prompt: Domain Package

You are Codex running inside `/Users/fabiencampana/Documents/funding`.

Your task is to implement `packages/domain` according to the domain
specification and supporting docs.

Read these documents before writing files:

1. `docs/20-specs/domain-spec.md`
2. `docs/10-architecture/domain-adrs.md`
3. `docs/30-testing/testing-domain.md`
4. `docs/10-architecture/package-boundaries.md`
5. `docs/10-architecture/monorepo-conventions.md`
6. `docs/archive/commitment-flow.schemas.ts`
7. `docs/20-specs/core-spec.md`

Treat `docs/20-specs/domain-spec.md` as the source of truth for this loop.
Treat `docs/10-architecture/domain-adrs.md` as binding architectural decisions.
Use `docs/archive/commitment-flow.schemas.ts` as the source draft for commitment-flow
schemas, but adapt it to the implemented `@repo/domain` API and the current
repo conventions.

## Objective

Implement `@repo/domain` as the pure financial/domain package for the funding
workspace.

The package must provide:

- branded domain IDs
- exact EUR money primitives based on branded `bigint` cents
- i18n-safe money parsing and formatting helpers
- investor commitment-flow Zod schemas
- submittable commitment schema that rejects non-eligible investors
- SPV lifecycle status types and transition helpers
- package-local tests with full coverage

## Non-Goals

Do not implement:

- React components
- React hooks
- Next.js code
- `next-intl` usage
- Tailwind or CSS
- Shadcn/Radix components
- design-token generation
- UI or kit components
- XState machines
- tRPC routers
- Prisma/database models
- document upload clients
- KYC provider clients
- event sourcing
- multi-currency `Money<Currency>`
- `CurrencyCode`
- FX rates or conversion helpers
- ratio multiplication, allocation, basis points, or rounding-policy helpers

## Required Package Boundary

`packages/domain` may import:

```ts
import { Result, Option } from '@repo/core'
import { z } from 'zod'
```

It must not import React, Next.js, DOM APIs, Tailwind, Shadcn/Radix, `next-intl`,
or application code.

Domain functions may accept `locale: string`, but must not read locale from any
context or provider.

Domain schemas must not own final user-facing translated copy. Use structured
error tags or stable message keys such as `money.UnsafeNumber` or
`commitment.review.wire_instructions_required`.

## Required Package Setup

Update `packages/domain/package.json`:

- add exports for:
  - `.`
  - `./money`
  - `./ids`
  - `./commitment-flow`
  - `./spv`
- add runtime dependencies:
  - `@repo/core: workspace:*`
  - `zod: ^4.4.3`
- add dev dependencies:
  - `@vitest/coverage-v8`
  - `fast-check`
- add scripts:
  - `"lint": "biome check ./src"`
  - `"typecheck": "tsc --noEmit -p tsconfig.json"`
  - `"test": "vitest run"`
  - `"test:coverage": "vitest run --coverage"`

Keep `tsconfig.json` extending `../typescript-config/node-library.json`.
Keep Vitest based on `@repo/test-config`, layering package coverage thresholds
as needed.

## Required File Layout

Create or update:

```text
packages/domain/
  src/
    index.ts
    brand.ts
    ids.ts
    ids.test.ts
    ids.test-types.ts
    money/
      euro-cents.ts
      euro-cents.test.ts
      euro-cents.test-types.ts
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

Remove the bootstrap placeholder `domainBootstrapStatus` and its placeholder
test.

## Milestone 1: Package Setup and Barrels

Implement package exports, scripts, dependencies, and empty module barrels.

Update `src/index.ts` to export the stable domain API only. Prefer subpath
barrels for focused areas.

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test
```

## Milestone 2: Brand and IDs

Implement `src/brand.ts`:

```ts
export type Brand<T, Name extends string> = T & { readonly [brand]: Name }
```

The brand symbol must not be exported as a value.

Implement `src/ids.ts`:

- `DealId`
- `InvestorId`
- `CommitmentId`
- `SpvId`
- `FundId`
- `DocumentId`
- `IdParseError = { readonly _tag: 'InvalidUuid'; readonly input: string }`
- Zod UUID schemas that transform to each branded ID
- `dealIdFromString`
- `investorIdFromString`
- `commitmentIdFromString`
- `spvIdFromString`
- `fundIdFromString`
- `documentIdFromString`

Constructors return `Result<Id, IdParseError>`.

Tests:

- valid UUIDs parse to branded IDs
- invalid strings return `Result.Error({ _tag: 'InvalidUuid', input })`
- Zod schemas transform valid UUIDs
- compile-time type test: one ID type is not assignable to another

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
```

## Milestone 3: `EuroCents`

Implement `src/money/euro-cents.ts`.

Representation:

```ts
declare const euroCentsBrand: unique symbol

export type EuroCents = bigint & {
  readonly [euroCentsBrand]: 'EuroCents'
}
```

Do not implement `EuroCents` with the generic `Brand<T, Name>` helper.

Required API:

- `MoneyParseError`
- `MoneyFormatError`
- `FormatEuroCentsOptions`
- `euroCentsFromMinorUnits`
- `euroCentsFromNumberMinorUnits`
- `parseEuroCents`
- `formatEuroCents`
- `serializeEuroCentsToNumber`
- `euroCentsToMinorUnits`
- `addEuroCents`
- `subtractEuroCents`
- `negateEuroCents`
- `compareEuroCents`
- `isZeroEuroCents`
- `isPositiveEuroCents`
- `isNegativeEuroCents`

Parsing rules:

- accept `1234`, `1234.56`, `1234,56`, `1 234,56`, `1.234,56`,
  `1_234,56`, `1 234,56 EUR`, `1 234,56 €`, `-1 234,56`
- reject empty input
- reject more than two fractional digits
- reject ambiguous inputs such as `1,234` and `12,345`
- treat comma as decimal when present
- treat dot as decimal only when unambiguous
- build cents through string-to-`bigint`, never through floating arithmetic

Formatting rules:

- default locale is `fr-FR`
- default currency display is `symbol`
- use `Intl.NumberFormat`
- return `Result<string, MoneyFormatError>`
- return `MoneyFormatError.UnsafeNumber` when the `bigint` cannot be safely
  converted to `number` for `Intl.NumberFormat`

Tests:

- unit tests for constructors, parsing, formatting, serialization, predicates
- fr-FR formatting tests normalize `\u00a0` and `\u202f`
- property tests for addition, subtraction, negation, comparison, and safe-range
  format/parse roundtrip
- compile-time type test: plain `bigint` is not assignable to `EuroCents`

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
```

## Milestone 4: Commitment Flow Schemas

Implement `src/commitment-flow/commitment-flow.ts` using
`docs/archive/commitment-flow.schemas.ts` as the source draft.

Required exports:

- `EU_EUVECA_COUNTRIES`
- `NON_EU_SUPPORTED_COUNTRIES`
- `ALL_SUPPORTED_COUNTRIES`
- `AmountStepSchema`
- `QualificationStepSchema`
- `KycStepSchema`
- `ReviewStepSchema`
- `CommitmentFormSchema`
- `SubmittableCommitmentFormSchema`
- all inferred output types listed in `docs/20-specs/domain-spec.md`

Amount schema:

- accepts JSON-compatible number cents as input
- validates integer and safe number
- transforms through `euroCentsFromNumberMinorUnits`
- output type is branded `EuroCents`
- never direct-cast `number` to `EuroCents`

Use this transform pattern:

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

Schema messages must be stable keys, not final prose.

`CommitmentFormSchema` may represent `qualificationType: 'non_eligible'` so UI
can render a blocking state.

`SubmittableCommitmentFormSchema` must reject `qualificationType: 'non_eligible'`.

Fixtures:

Create `src/commitment-flow/fixtures.ts` with deterministic test data:

- valid individual professional investor
- valid legal-entity professional investor
- valid informed investor in `FR`
- invalid informed investor in `CH`
- non-eligible investor
- valid KYC individual
- valid KYB legal entity
- invalid legal entity with no UBO
- invalid UBO below 25 percent ownership
- valid review step
- invalid review step with one missing consent

Tests:

- professional investor requires at least two of three MiFID criteria
- informed investor is restricted to EuVECA countries
- all consents require literal `true`
- document max size is 10 MB
- document MIME types are restricted
- legal entities require at least one UBO
- `SubmittableCommitmentFormSchema` rejects a complete non-eligible payload

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
```

## Milestone 5: SPV Lifecycle

Implement `src/spv/spv-status.ts`.

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
```

Required API:

- `SpvStatus`
- `SpvStatusSchema`
- `isTerminalSpvStatus`
- `canTransitionSpvStatus`

Allowed transitions:

```text
draft -> open
open -> kyc_in_progress
kyc_in_progress -> e_signatures
e_signatures -> collecting
collecting -> incorporated
incorporated -> closed
```

No reverse transitions. No same-state transitions. Terminal status is `closed`.

Tests:

- schema parses every known status
- schema rejects unknown statuses
- allowed forward transitions return `true`
- reverse transitions return `false`
- same-state transitions return `false`
- terminal status detection is exhaustive

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
```

## Milestone 6: Barrels, Type Tests, and Coverage

Finish all barrels:

- `src/index.ts`
- `src/money/index.ts`
- `src/commitment-flow/index.ts`
- `src/spv/index.ts`

Ensure `.test-types.ts` files are included by `tsconfig.json` and compile under
`pnpm --filter @repo/domain typecheck`.

Configure `vitest.config.ts` to keep using `@repo/test-config` while adding
coverage thresholds for implemented files.

Required final verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
pnpm lint
```

## Completion Criteria

Before marking the goal complete:

- all required files exist
- placeholder domain export and test are removed
- package exports work
- no React/Next/UI/Tailwind imports exist in `packages/domain`
- no `any`
- no direct `number as EuroCents` cast
- no user-facing prose in Zod issue messages
- no multi-currency or FX helpers
- all verification commands pass
- `PLAN.md` and `STATUS.md` are updated with final results

## Reporting

Final response must include:

- files changed
- implemented domain APIs
- test count and coverage result
- verification commands and pass/fail status
- any deviations from the spec, with rationale

