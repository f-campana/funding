# Private Markets Domain Roadmap

**Status:** Active planning
**Created:** 2026-05-08
**Scope:** Practical product/domain expansion after the static deal dashboard.

This document translates the Roundtable research and compliance playbook into
repo work. It is the bridge between product research and implementation loops.

The goal is not to clone Roundtable. The goal is to make this private-markets
case study coherent, realistic, and easy to extend without breaking package
boundaries.

## Current Baseline

Implemented:

- `@repo/core`: `Option`, `Result`, `AsyncData`, `Future`, and adapters.
- `@repo/domain`: branded IDs, `EuroCents`, commitment-flow schemas, SPV
  statuses.
- `@repo/ui`: generic primitives and chart infrastructure.
- `@repo/kit`: money display, metrics, commitment progress, SPV tracker,
  investor rows, distributions, activity timeline, deal terms, dashboard demo.
- `apps/web`: localized Next.js route rendering the static dashboard.

The current slice is strong as a static dashboard. The next slice should make
the domain more operational before adding large UI flows.

## Product Model Direction

This repo should model four related but distinct bounded contexts:

| Context | Owns | Does not own |
|---|---|---|
| Deal/SPV | One-off opportunity, vehicle structure, commitments, signatures, funds collection, close. | Long-running fund operations or club membership. |
| Compliance | KYC/KYB, UBOs, screening, approvals, risk ratings, exceptions, audit evidence. | Legal advice, vendor integrations, or country-specific counsel conclusions in v1. |
| Community/Club | Club profile, members, invitations, access rules, discussions, voting, carry/entry-fee policy. | Investor commitment payloads for a specific deal. |
| Fund | LP onboarding, capital calls, investments, equalization, valuations, distributions, reporting. | Single-deal SPV lifecycle shortcuts. |

Do not overload the existing commitment-flow schemas to cover every context.
They should remain the investor subscription payload for a deal.

## Recommended Implementation Sequence

### Pass 1: SPV Domain Expansion

Purpose: add the missing vocabulary needed by realistic deal setup and closing
readiness.

Target package:

```text
packages/domain/src/spv/
```

Add:

```ts
export type VehicleStructure =
  | 'luxembourg_scsp'
  | 'french_sc'
  | 'french_sas'

export type InvestmentInstrument =
  | 'equity'
  | 'convertible'
  | 'safe'
  | 'fund_interest'
  | 'secondary_share_purchase'
  | 'other_private_market_asset'

export type SpvJurisdiction = 'FR' | 'LU'
```

Add schemas:

- `VehicleStructureSchema`
- `InvestmentInstrumentSchema`
- `SpvJurisdictionSchema`
- `SpvSetupSchema`

Candidate setup shape:

```ts
export type SpvSetup = {
  readonly jurisdiction: SpvJurisdiction
  readonly vehicleStructure: VehicleStructure
  readonly instrument: InvestmentInstrument
  readonly targetCompanyName: string
  readonly minimumTicketCents: EuroCents
  readonly targetAmountCents: EuroCents
}
```

Rules:

- no tax/legal copy in domain
- no broad eligibility engine in this pass
- output branded `EuroCents` where amounts enter through JSON-compatible cents
- add tests for wrapper/instrument parsing and invalid combinations only when
  the rule is unambiguous

### Pass 2: Compliance Control Model

Purpose: represent controls from the compliance playbook without integrating a
real KYC vendor.

Target package:

```text
packages/domain/src/compliance/
```

Add:

```ts
export type ComplianceRiskRating = 'low' | 'standard' | 'enhanced'

export type ScreeningStatus =
  | 'not_started'
  | 'pending'
  | 'clear'
  | 'hit_unresolved'
  | 'rejected'

export type ApprovalStatus =
  | 'not_requested'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated'
```

Add models for:

- investor screening summary
- source-of-funds review
- compliance approval note
- exception log item

Candidate shape:

```ts
export type InvestorComplianceSummary = {
  readonly riskRating: ComplianceRiskRating
  readonly sanctionsStatus: ScreeningStatus
  readonly pepStatus: ScreeningStatus
  readonly adverseMediaStatus: ScreeningStatus
  readonly sourceOfFundsStatus: ApprovalStatus
  readonly approvalStatus: ApprovalStatus
}
```

Rules:

- model statuses and evidence references, not provider APIs
- keep user-facing explanations out of domain
- use `DocumentId` where evidence is a document
- use stable error keys in schemas

### Pass 3: Payment Reconciliation Model

Purpose: make the distinction between committed, signed, wired, and reconciled
capital explicit.

Target package:

```text
packages/domain/src/payments/
```

Add:

```ts
export type PaymentStatus =
  | 'not_requested'
  | 'instructions_released'
  | 'pending'
  | 'received'
  | 'matched'
  | 'exception_pending'
  | 'refunded'
```

Add:

- `PaymentRecordSchema`
- `PaymentMatchStatusSchema`
- helpers for display totals using exact `EuroCents` addition

Candidate shape:

```ts
export type PaymentRecord = {
  readonly commitmentId: CommitmentId
  readonly expectedAmountCents: EuroCents
  readonly receivedAmountCents: EuroCents
  readonly status: PaymentStatus
  readonly payerName: string
  readonly subscriberName: string
}
```

Rules:

- no banking integration
- no IBAN validation unless a spec requires it
- no FX or multi-currency in v1
- mismatches are statuses, not silent booleans

### Pass 4: Guarded SPV Transition Helpers

Purpose: keep the existing simple lifecycle, but add optional guard evaluation
for UI readiness.

Target:

```text
packages/domain/src/spv/
```

Do not replace `canTransitionSpvStatus`. Add a separate helper:

```ts
export type SpvTransitionGuardInput = {
  readonly committedInvestorCount: number
  readonly allRequiredKycApproved: boolean
  readonly allRequiredDocumentsSigned: boolean
  readonly fundsReconciled: boolean
  readonly vehicleRegistered: boolean
  readonly targetFunded: boolean
}
```

Candidate statuses after research:

```text
draft
open
kyc_in_progress
e_signatures
collecting
incorporated
target_funded
closed
```

Open decision: whether to add `target_funded` now. The Roundtable public flow
separates SPV registration from wiring funds to the target, but adding a status
will affect kit stories and app tests. Prefer a dedicated ADR or roadmap note
before changing the existing exported `SPV_STATUSES`.

Rules:

- preserve existing public API unless a loop explicitly migrates it
- guard helpers return structured reasons, not translated strings
- UI may use reasons to disable/annotate actions

### Pass 5: Investor Commitment Flow UI

Purpose: build the first real interactive product flow on top of the domain
schemas.

Target:

```text
packages/kit/src/commitment-flow/
apps/web/app/deals/[dealId]/commit/
```

Likely steps:

1. Amount
2. Qualification
3. KYC/KYB
4. Review
5. Wire instructions
6. Submitted/blocking state

Rules:

- `@repo/kit` may render flow components but must not import `next-intl` or
  app routes
- app route owns translations and route transitions
- domain schemas remain canonical submission contract
- no real uploads; represent uploaded documents as fixture records first
- no server actions or API integration in the first loop

### Pass 6: Audit File And Closing Readiness

Purpose: turn the compliance playbook into a visible operator checklist.

Target components:

- closing readiness panel
- disclosure pack status
- compliance exception queue
- payment reconciliation summary
- audit file checklist

Candidate domain:

```ts
export type ClosingEvidenceKind =
  | 'vehicle_selection_memo'
  | 'marketing_perimeter_memo'
  | 'disclosure_pack'
  | 'kyc_aml_file'
  | 'approval_log'
  | 'payment_reconciliation'
  | 'subscription_documents'
  | 'investor_register'
  | 'closing_memo'
  | 'monitoring_calendar'
```

Rules:

- evidence items should reference `DocumentId` when applicable
- checklist state should be computed from data where possible
- avoid hardcoded legal conclusions in kit components

### Pass 7: Club And Fund Contexts

Purpose: expand beyond the single-deal dashboard only after the SPV flow is
credible.

Club modules:

- club profile
- membership
- admission criteria
- deal sharing
- voting
- carry/entry fee configuration

Fund modules:

- fund setup
- LP onboarding
- capital calls
- portfolio investments
- valuations
- distributions
- reporting

Rules:

- use new domain folders rather than extending `commitment-flow`
- keep fund lifecycle distinct from SPV lifecycle
- defer multi-currency until a dedicated ADR exists

## Package Boundary Rules

### `@repo/domain`

Owns:

- schemas
- branded IDs and amounts
- status unions
- pure transition/guard logic
- structured error tags

Must not own:

- React state
- visual labels
- `next-intl`
- provider clients
- database or API clients
- legal advice text

### `@repo/kit`

Owns:

- reusable product-shaped components
- accessible disclosure/progress/status UI
- exact money display via domain helpers
- static demo data only inside demo components

Must not own:

- route state
- data fetching
- auth/session
- real uploads
- server actions
- translated app copy

### `apps/web`

Owns:

- routes
- translations
- page composition
- app-level loading/error/not-found states
- future API/server integration

## Testing Expectations

For each domain pass:

- schema happy paths
- invalid enum/string cases
- stable error keys
- exact money transformations
- type tests where brands matter
- package export tests

For each kit pass:

- render smoke tests
- accessibility tests with `axe`
- interaction tests for disclosure/step changes
- exact money display assertions
- empty/blocking state coverage
- no app/framework imports

For app integration:

- Playwright route render
- localized headings/labels
- unsupported route behavior
- one happy-path interaction

## Documentation Updates Required Per Pass

When a pass lands, update:

- relevant spec in `docs/20-specs`
- package README
- `docs/README.md`
- `STATUS.md`
- any planning document whose "next" step has changed

If a pass changes an accepted domain decision, add a new ADR in
`docs/10-architecture/domain-adrs.md` rather than quietly editing history.

## Non-Goals Until Explicitly Specced

- production legal/tax advice
- real KYC/AML provider integration
- country-by-country private placement engine
- multi-currency accounting
- FX conversion
- carried-interest waterfall math
- cap table allocation engine
- real banking/payment rails
- authenticated app shell
- database schema
- tRPC/API layer

## Next Recommended Loop

Implement Pass 1 and Pass 2 together only if the change stays small. Otherwise:

1. SPV domain expansion.
2. Compliance control model.
3. Payment reconciliation model.
4. Guarded SPV transition helpers.
5. Investor commitment flow UI.

This sequence keeps the product vocabulary credible before adding a larger
interactive frontend flow.
