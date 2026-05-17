# Northstar Operational Center DTO Spec

Status: Accepted for implementation
Created: 2026-05-17
Scope: first safe data-spine slice for the Northstar Energy Deal Operations vertical

## 1. Purpose

This spec defines the app-owned operational data spine for the one-vertical-done-right pass.

The next implementation pass should create a single, serializable DTO that can eventually drive:

- `/deals/northstar-energy/overview`
- `/deals/northstar-energy/commitments`
- `/deals/northstar-energy/documents`
- the deal entity header
- the right operational rail
- closing readiness summary
- blocker queue
- capital reconciliation
- investor commitments table
- investor inspector
- document readiness and data-room-adjacent evidence views

The goal is not to build all UI in this slice. The goal is to establish the typed data contract that the UI can trust.

## 2. Product Decision

The vertical is:

```text
Northstar Energy Deal Operations Workspace
```

The primary DTO is:

```text
DealOperationalCenterDTO
```

This name is intentional. `DealClosingReadinessDTO` is too narrow because the data will drive readiness, commitments, documents, capital, activity, and rail state. Closing readiness remains one section inside the broader operational center.

## 3. Non-Goals

Do not implement:

- real auth
- database persistence
- Prisma
- uploads
- banking integration
- KYC/KYB provider integration
- signature provider integration
- email/reminder delivery
- realtime subscriptions
- optimistic mutations
- fake persisted mutations
- broad CRUD
- investor-facing checkout
- funds, capital calls, distributions, or community workflows
- a new mock-data package
- a new design system

This pass should be a server-side, fixture-backed, type-safe app data spine.

## 4. Package Boundary Decision

### `@repo/domain`

Owns reusable rules, states, value objects, schemas, and calculations.

Belongs here:

- exact money primitives such as `EuroCents`
- deal lifecycle vocabulary
- commitment lifecycle vocabulary
- KYC/KYB, signature, and wire operational status vocabulary
- closing blocker severity/type/owner vocabulary
- closing readiness summary rules
- capital reconciliation rules
- document requirement state vocabulary
- SPV status vocabulary

Does not belong here:

- Northstar fixture data
- DTOs shaped for Next.js routes
- route labels
- translated copy
- tRPC routers
- React props
- component state
- app navigation
- visual grouping decisions

Decision:

- Use the existing domain package now.
- Do not modify it in the first safe slice unless compilation exposes a missing export or a true reusable invariant.
- Record future domain updates in this spec instead of expanding domain prematurely.

Why:

- The existing package already covers most of the relevant rules.
- The app needs a boundary first, not more domain abstraction.
- Domain should stay generic enough to support more than Northstar.

### `@repo/kit`

Owns reusable rendering components only.

Belongs here:

- readiness summary component
- blocker queue component
- capital reconciliation panel
- commitments table
- investor inspector
- document completeness card
- activity timeline
- reusable status and money display components

Does not belong here:

- tRPC
- Next.js route logic
- app service calls
- canonical Northstar fixture for the web app
- route-level DTOs
- database or persistence assumptions
- auth/session assumptions

Decision:

- Do not change kit in the first safe slice.
- Keep its existing fixtures for stories and component tests.
- Add `@repo/kit` to `apps/web` only when the route composition pass starts.

Why:

- The current slice is data spine and API seam, not UI integration.
- Kit fixtures are useful demo data but should not be the canonical web-app data source.

### `apps/web/server/deals`

Owns app-level deal data assembly.

Belongs here:

- Northstar canonical app fixture
- `DealOperationalCenterDTO` types
- DTO schemas where useful
- mappers from domain values to DTOs
- serialization of money and dates
- app service that supports `northstar-energy`
- app-level error types
- route-ready view model assembly

Decision:

- Create this folder now.
- It becomes the replacement point for a database later.

Why:

- The vertical data exists to power `apps/web`.
- Keeping it app-owned prevents `@repo/domain` and `@repo/kit` from becoming mock databases.
- It gives the route one source of truth.

### `apps/web/server/trpc`

Owns the narrow typed API seam.

Belongs here:

- tRPC context
- tRPC init helpers
- root router
- deal router
- server caller factory

Decision:

- Create this folder now.
- Expose one procedure first:

```text
deal.getOperationalCenter
```

Why:

- The DTO is broader than closing readiness.
- A narrow tRPC seam demonstrates typed frontend/backend architecture without pretending there is a real backend.
- The route can use a server caller first. Client-side query state can be deferred.

### `apps/web/app/api/trpc/[trpc]`

Owns the Next.js route handler for tRPC.

Decision:

- Create the handler skeleton now.
- It should use `fetchRequestHandler`.
- It should not depend on auth/session state.

Why:

- This proves the API surface exists and can be exercised by tests or future client code.
- It keeps the App Router integration conventional.

### `apps/web/app/deals/[dealId]`

Owns route composition.

Belongs here in later passes:

- server route pages
- route-specific client components for filters and inspectors
- calls into the app service or tRPC server caller
- mapping DTO sections to kit component props when necessary

Decision:

- Do not replace route placeholders in the first safe slice.
- The route pass should happen after DTO/service/tRPC tests pass.

Why:

- It is safer to stabilize the data contract first.
- The current route tests protect placeholder behavior and need a deliberate route-test rewrite later.

## 5. Mock Data Package Decision

Do not create `@repo/mock-data` now.

Use:

```text
apps/web/server/deals/fixtures/northstar-energy.fixture.ts
```

Why:

- The canonical Northstar data is app vertical data.
- It should be easy to replace with persistence later.
- A shared mock-data package would introduce package ownership questions before there is more than one real consumer.
- Kit stories can keep private fixtures.

Reconsider a dedicated mock-data package only when at least two of these become true:

- `apps/web` and Storybook need the exact same canonical fixture.
- screenshot generation needs a stable shared dataset outside the app.
- another app package needs the same Northstar fixture.
- fixtures become large enough to require their own test and ownership boundary.
- docs generation or seed scripts need the same data.

## 6. Dependency Decision

Add to `apps/web` dependencies:

```json
{
  "@repo/core": "workspace:*",
  "@repo/domain": "workspace:*",
  "@trpc/server": "<package-manager-selected-compatible-version>",
  "zod": "^4.4.3"
}
```

Add to `apps/web` dev dependencies:

```json
{
  "@repo/test-config": "workspace:*",
  "vitest": "^4.1.5"
}
```

Do not add yet:

- `@repo/kit`
- `@trpc/client`
- `@tanstack/react-query`
- `@trpc/tanstack-react-query`
- `ts-pattern`

Why:

- The first slice is server-side DTO/service/tRPC.
- There is no client query state yet.
- The route composition pass can add `@repo/kit`.
- Adding unused client packages weakens the signal that dependencies are deliberate.

## 7. File-by-File Implementation Plan

Create:

```text
docs/20-specs/northstar-operational-center-dto-spec.md
apps/web/server/deals/operational-center-dto.ts
apps/web/server/deals/operational-center-service.ts
apps/web/server/deals/operational-center-service.test.ts
apps/web/server/deals/fixtures/northstar-energy.fixture.ts
apps/web/server/deals/index.ts
apps/web/server/trpc/context.ts
apps/web/server/trpc/init.ts
apps/web/server/trpc/root.ts
apps/web/server/trpc/routers/deal-router.ts
apps/web/server/trpc/routers/deal-router.test.ts
apps/web/server/trpc/server.ts
apps/web/app/api/trpc/[trpc]/route.ts
apps/web/vitest.config.ts
```

Update:

```text
apps/web/package.json
apps/web/tsconfig.json
pnpm-lock.yaml
```

Do not update in this first slice:

```text
packages/domain/**
packages/kit/**
apps/web/app/deals/[dealId]/**
apps/web/tests/e2e/**
```

## 8. DTO Contract

### Money

All money crossing the app boundary must be JSON-safe.

```ts
export type CurrencyCodeDTO = 'EUR'

export type MoneyMinorUnitsDTO = {
  readonly amountMinor: number
  readonly currency: CurrencyCodeDTO
}
```

Rules:

- `amountMinor` is integer minor units.
- For EUR, minor units are cents.
- This pass may use `number` because fixtures stay inside `Number.MAX_SAFE_INTEGER`.
- If future data can exceed safe integer bounds, change the DTO to decimal strings in one explicit migration.

### Status Tone

DTOs may carry semantic tones for app rendering.

```ts
export type StatusToneDTO =
  | 'neutral'
  | 'info'
  | 'pending'
  | 'attention'
  | 'success'
  | 'danger'
```

Rules:

- Tones are semantic only.
- The DTO should not carry CSS class names.
- App/kit rendering decides final styling.

### Procedure Output

The tRPC output should be a serializable discriminated union.

```ts
export type GetDealOperationalCenterOutputDTO =
  | {
      readonly _tag: 'Ok'
      readonly data: DealOperationalCenterDTO
    }
  | {
      readonly _tag: 'UnsupportedDeal'
      readonly dealId: string
    }
  | {
      readonly _tag: 'ReconciliationError'
      readonly error: CapitalReconciliationErrorDTO
    }
  | {
      readonly _tag: 'MoneySerializationError'
      readonly error: MoneySerializationErrorDTO
    }
```

Rules:

- Do not return `@repo/core` `Result` from tRPC.
- `Result` has methods and is an internal service abstraction.
- The tRPC result must be plain JSON data.

### Top-Level DTO

```ts
export type DealOperationalCenterDTO = {
  readonly _tag: 'DealOperationalCenter'
  readonly generatedAt: string
  readonly deal: DealSummaryDTO
  readonly readiness: ClosingReadinessDTO
  readonly capital: CapitalReconciliationDTO
  readonly blockers: readonly ClosingBlockerDTO[]
  readonly investors: readonly InvestorOperationDTO[]
  readonly documents: DocumentCenterDTO
  readonly activity: readonly ActivityEventDTO[]
  readonly rail: OperationalRailDTO
  readonly routes: DealRoutesDTO
}
```

Rules:

- `generatedAt` is an ISO string.
- The DTO is route-ready, not database-shaped.
- It should contain enough data for all three target routes without requiring each route to reassemble core facts.

### Deal Summary

```ts
export type DealSummaryDTO = {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly companyName: string
  readonly stage: string
  readonly stageLabel: string
  readonly closingMode: 'standard' | 'ongoing'
  readonly currency: CurrencyCodeDTO
  readonly vehicle: DealVehicleDTO
  readonly access: DealAccessDTO
  readonly targetCloseDate: string
  readonly lastUpdatedAt: string
}
```

```ts
export type DealVehicleDTO = {
  readonly name: string
  readonly type: 'luxembourg_scsp' | 'french_sc' | 'french_sas'
  readonly jurisdiction: string
  readonly setupStatus: 'not_started' | 'in_progress' | 'ready' | 'blocked'
}
```

```ts
export type DealAccessDTO = {
  readonly sharingMode: 'disabled' | 'request_access' | 'anyone_with_link'
  readonly pendingAccessRequestCount: number
}
```

Rules:

- Vehicle is display metadata in V1.
- Do not model legal/tax rules now.
- Access mode is contextual metadata; do not implement permissions now.

### Readiness

```ts
export type ClosingReadinessDTO = {
  readonly state: 'not_started' | 'ready' | 'attention' | 'blocked'
  readonly unresolvedBlockerCount: number
  readonly criticalBlockerCount: number
  readonly warningBlockerCount: number
  readonly infoBlockerCount: number
  readonly nextActionLabel: string
  readonly dimensions: readonly ReadinessDimensionDTO[]
}
```

```ts
export type ReadinessDimensionDTO = {
  readonly id:
    | 'investor_identity'
    | 'signatures'
    | 'wires'
    | 'documents'
    | 'capital_reconciliation'
    | 'vehicle_setup'
  readonly label: string
  readonly state: 'ready' | 'attention' | 'blocked' | 'not_started'
  readonly blockerCount: number
}
```

Rules:

- Top-level state comes from `summarizeClosingReadiness`.
- Dimensions are app-level grouping for the operational center.
- Dimension logic can be simple in the first slice and refined during route integration.

### Capital

```ts
export type CapitalReconciliationDTO = {
  readonly targetAmount: MoneyMinorUnitsDTO
  readonly committedAmount: MoneyMinorUnitsDTO
  readonly signedAmount: MoneyMinorUnitsDTO
  readonly receivedAmount: MoneyMinorUnitsDTO
  readonly matchedAmount: MoneyMinorUnitsDTO
  readonly remainingToTarget: MoneyMinorUnitsDTO
  readonly overTarget: MoneyMinorUnitsDTO
  readonly unsignedCommitted: MoneyMinorUnitsDTO
  readonly unreceivedSigned: MoneyMinorUnitsDTO
  readonly unmatchedReceived: MoneyMinorUnitsDTO
  readonly unfundedCommitted: MoneyMinorUnitsDTO
  readonly hasUnmatchedFunds: boolean
  readonly isOverTarget: boolean
  readonly economics: DealEconomicsDTO
}
```

```ts
export type DealEconomicsDTO = {
  readonly grossCommitted: MoneyMinorUnitsDTO
  readonly entryFees: MoneyMinorUnitsDTO
  readonly spvFee: MoneyMinorUnitsDTO
  readonly netInvestableAmount: MoneyMinorUnitsDTO
  readonly carryPercent: number
}
```

Rules:

- Reconciliation numbers come from `@repo/domain`.
- Economics fields can be fixture-backed in the first slice.
- The DTO must not conflate gross committed and net investable amount.

### Blockers

```ts
export type ClosingBlockerDTO = {
  readonly id: string
  readonly severity: 'critical' | 'warning' | 'info'
  readonly type:
    | 'kyc'
    | 'kyb'
    | 'signature'
    | 'wire'
    | 'reconciliation'
    | 'document'
    | 'allocation'
    | 'compliance'
    | 'deadline'
  readonly title: string
  readonly description: string
  readonly owner:
    | 'operations'
    | 'legal'
    | 'compliance'
    | 'finance'
    | 'investor'
    | 'deal_lead'
    | 'system'
  readonly resolved: boolean
  readonly tone: StatusToneDTO
  readonly routeHint: 'about' | 'commitments' | 'documents'
  readonly relatedInvestorIds: readonly string[]
  readonly relatedDocumentIds: readonly string[]
}
```

Rules:

- Core blocker fields map from `@repo/domain`.
- `routeHint`, related investor ids, and related document ids are app-level navigation affordances.
- Do not add action mutations in this pass.

### Investors

```ts
export type InvestorOperationDTO = {
  readonly id: string
  readonly investorName: string
  readonly investorEmail?: string
  readonly legalEntityName?: string
  readonly commitmentAmount: MoneyMinorUnitsDTO
  readonly commitmentStatus: string
  readonly commitmentStatusLabel: string
  readonly kycStatus: string
  readonly kycStatusLabel: string
  readonly kybStatus?: string
  readonly kybStatusLabel?: string
  readonly signatureStatus: string
  readonly signatureStatusLabel: string
  readonly wireStatus: string
  readonly wireStatusLabel: string
  readonly readinessState: 'ready' | 'attention' | 'blocked' | 'not_started'
  readonly blockerIds: readonly string[]
  readonly documentIds: readonly string[]
  readonly lastActivityAt?: string
}
```

Rules:

- Status labels may use current domain label helpers for the first pass.
- Longer term, app-owned i18n should replace visible English labels.
- The DTO includes labels so route tests can validate output before UI translation integration.

### Documents

```ts
export type DocumentCenterDTO = {
  readonly summary: DocumentCompletenessDTO
  readonly requirements: readonly DocumentRequirementDTO[]
  readonly groups: readonly DocumentGroupDTO[]
}
```

```ts
export type DocumentCompletenessDTO = {
  readonly totalCount: number
  readonly requiredCount: number
  readonly optionalCount: number
  readonly approvedCount: number
  readonly uploadedCount: number
  readonly underReviewCount: number
  readonly missingCount: number
  readonly rejectedCount: number
  readonly expiredCount: number
  readonly requiredMissingCount: number
  readonly requiredRejectedCount: number
  readonly requiredExpiredCount: number
  readonly isComplete: boolean
}
```

```ts
export type DocumentRequirementDTO = {
  readonly id: string
  readonly category: string
  readonly label: string
  readonly required: boolean
  readonly status: 'missing' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'expired'
  readonly owner: 'deal' | 'investor' | 'legal_entity' | 'spv' | 'fund'
  readonly tone: StatusToneDTO
  readonly blocksClosing: boolean
  readonly relatedInvestorId?: string
  readonly groupId: string
  readonly dueDate?: string
  readonly lastActivityAt?: string
}
```

```ts
export type DocumentGroupDTO = {
  readonly id: string
  readonly label: string
  readonly visibility: 'internal' | 'investor_visible' | 'protected'
  readonly documentIds: readonly string[]
}
```

Rules:

- Document status counts come from `@repo/domain`.
- Data-room concepts are metadata only in this pass.
- No uploads, file URLs, ACL enforcement, watermarking, or NDA controls are implemented.

### Activity

```ts
export type ActivityEventDTO = {
  readonly id: string
  readonly occurredAt: string
  readonly actorLabel: string
  readonly eventType:
    | 'commitment_updated'
    | 'document_uploaded'
    | 'document_rejected'
    | 'signature_sent'
    | 'signature_completed'
    | 'wire_flagged'
    | 'wire_matched'
    | 'blocker_created'
    | 'blocker_resolved'
  readonly summary: string
  readonly relatedInvestorId?: string
  readonly relatedDocumentId?: string
  readonly relatedBlockerId?: string
}
```

Rules:

- These are fixture-backed activity events.
- Do not call them an audit trail yet.
- A future audit trail needs immutable event ids, source system, actor id, and event payloads.

### Rail

```ts
export type OperationalRailDTO = {
  readonly readinessState: ClosingReadinessDTO['state']
  readonly nextActionLabel: string
  readonly criticalBlockerCount: number
  readonly warningBlockerCount: number
  readonly documentIssueCount: number
  readonly investorsBlockedCount: number
  readonly targetCloseDate: string
  readonly capitalCallout: {
    readonly label: string
    readonly value: MoneyMinorUnitsDTO
  }
}
```

Rules:

- The rail DTO is derived from the same data as the main DTO.
- It exists so route composition does not recalculate summary facts.

### Routes

```ts
export type DealRoutesDTO = {
  readonly about: string
  readonly commitments: string
  readonly documents: string
}
```

Rules:

- Route strings are app concerns.
- Keeping them in the DTO lets the rail, tabs, blockers, and inspector share one route map later.

## 9. App Service Contract

Create:

```ts
export type GetDealOperationalCenterInput = {
  readonly dealId: string
}

export type GetDealOperationalCenterError =
  | {
      readonly _tag: 'UnsupportedDeal'
      readonly dealId: string
    }
  | {
      readonly _tag: 'ReconciliationError'
      readonly error: CapitalReconciliationErrorDTO
    }
  | {
      readonly _tag: 'MoneySerializationError'
      readonly error: MoneySerializationErrorDTO
    }

export const getDealOperationalCenter = (
  input: GetDealOperationalCenterInput,
): Result<DealOperationalCenterDTO, GetDealOperationalCenterError>
```

Rules:

- Only `northstar-energy` is supported.
- Unsupported deals return a typed error.
- Domain `summarizeClosingReadiness` computes top-level readiness.
- Domain `summarizeCapitalReconciliation` computes reconciliation.
- Domain `summarizeDocumentCompleteness` computes document summary.
- Domain status label/tone helpers may be used for the first pass.
- All output is serializable.

## 10. tRPC Contract

Create input schema:

```ts
export const GetOperationalCenterInputSchema = z.object({
  dealId: z.string().trim().min(1),
})
```

Create procedure:

```ts
deal.getOperationalCenter
```

Input:

```ts
{
  dealId: string
}
```

Output:

```ts
GetDealOperationalCenterOutputDTO
```

Mapping:

```text
Result.Ok(data)
  -> { _tag: 'Ok', data }

Result.Error({ _tag: 'UnsupportedDeal', dealId })
  -> { _tag: 'UnsupportedDeal', dealId }

Result.Error({ _tag: 'ReconciliationError', error })
  -> { _tag: 'ReconciliationError', error }

Result.Error({ _tag: 'MoneySerializationError', error })
  -> { _tag: 'MoneySerializationError', error }
```

Rules:

- Do not throw `TRPCError` for supported business outcomes in this procedure.
- Let invalid input remain a tRPC validation error.
- Keep context empty for now.
- No auth/session checks in this pass.

## 11. Domain Update Recommendations

Do not update domain in the first safe slice.

Potential future domain updates:

1. `ClosingMode`
   - Values: `standard`, `ongoing`.
   - Why: Roundtable distinguishes batch/standard close from ongoing collection.
   - Defer because first DTO can carry this as app metadata.

2. `DealVehicleType`
   - Values: `luxembourg_scsp`, `french_sc`, `french_sas`.
   - Why: vehicle type is a reusable private-markets concept.
   - Defer because V1 only displays vehicle context and does not apply rules.

3. `DealAccessMode`
   - Values: `disabled`, `request_access`, `anyone_with_link`.
   - Why: sharing/access is a reusable product concept.
   - Defer because V1 does not implement access flows.

4. Fee/economics calculation helpers
   - Values: entry fees, SPV fee, carry, net investable amount.
   - Why: amount semantics matter.
   - Defer because V1 can use fixture-backed economics while reconciliation remains domain-computed.

5. Audit event model
   - Why: Roundtable-like workflows need auditability.
   - Defer because current fixture activity is not a persisted audit trail.

Decision rule:

- Promote app metadata into domain only after at least two app surfaces need the same invariant or calculation.

## 12. Testing Plan

### Service Tests

Create `apps/web/server/deals/operational-center-service.test.ts`.

Assert:

- `northstar-energy` returns `_tag: 'Ok'`.
- unsupported deal returns `_tag: 'UnsupportedDeal'`.
- top-level DTO `_tag` is `DealOperationalCenter`.
- money fields are numbers and currency is `EUR`.
- readiness has at least one critical blocker in the fixture.
- capital reconciliation separates gross committed and net investable amount.
- document summary counts missing/rejected/expired requirements.
- blocker route hints point to `about`, `commitments`, or `documents`.
- investor DTOs include commitment, KYC/KYB, signature, and wire statuses.

### tRPC Tests

Create `apps/web/server/trpc/routers/deal-router.test.ts`.

Assert:

- server caller returns `Ok` for `northstar-energy`.
- server caller returns `UnsupportedDeal` for another id.
- invalid empty `dealId` rejects through input validation.

### Typecheck

Update `apps/web/tsconfig.json` to include:

```json
"server/**/*.ts",
"vitest.config.ts"
```

### Commands

Run:

```bash
pnpm --filter @repo/web test
pnpm --filter @repo/web typecheck
```

If package dependency changes affect workspace linking, also run:

```bash
pnpm install
```

## 13. Acceptance Criteria

The first safe slice is accepted when:

- the spec exists
- `apps/web` has a canonical Northstar app fixture
- `DealOperationalCenterDTO` exists
- `getDealOperationalCenter({ dealId: 'northstar-energy' })` returns `Ok`
- unsupported deal ids return typed output, not `null`
- tRPC exposes `deal.getOperationalCenter`
- the tRPC route handler exists
- service and tRPC tests pass
- `@repo/web` typecheck passes
- `@repo/domain` and `@repo/kit` source remain unchanged
- there is no dedicated mock-data package
- there are no fake mutations

## 14. Follow-Up Slices

After this spec and first implementation slice:

1. Wire `/deals/[dealId]/overview` to the DTO.
2. Add `@repo/kit` to `apps/web`.
3. Reserve `/deals/[dealId]/about` for the future investor lens.
4. Map DTO sections to kit readiness, blocker, reconciliation, document, and activity components.
5. Replace placeholder e2e assertions with product assertions.
6. Wire `/commitments`.
7. Wire `/documents`.
8. Add responsive and accessibility verification.

Do not start a second vertical before those steps are done.
