# Backend Migration Readiness

**Status:** Reference planning  
**Created:** 2026-05-18  
**Scope:** future backend, database, auth, and mutation migration path for the
Northstar Energy Deal Operations vertical

## Purpose

This document captures the current repo-specific assessment of how the
Northstar operator vertical should evolve once the UI vertical is complete and
the missing production layer becomes a real backend and database.

The short version:

- the current architecture is pointed in the right direction
- the `DealOperationalCenterDTO` seam is doing useful work
- kit components and route adapters should not need a rewrite when Prisma or
  another persistence layer arrives
- the largest future risk is not Prisma itself, but allowing persistence,
  permissions, mutations, or screen-specific data shapes to leak into the
  wrong layer

The goal of this note is not to start backend work now. The current vertical
still intentionally avoids real auth, database persistence, uploads, provider
integrations, and fake persisted mutations. This note exists so future backend
work has a clear migration path and does not accidentally undo the boundaries
already created.

## Current Repo Truth

The repo already has the important first seam:

```text
Northstar fixture
  -> getDealOperationalCenter()
  -> DealOperationalCenterDTO
  -> route adapters
  -> kit components
```

The desired production shape is:

```text
Database, permissions, and services
  -> getDealOperationalCenter()
  -> DealOperationalCenterDTO, or route-specific DTOs
  -> route adapters
  -> kit components
```

Current implementation points:

- [DealOperationalCenterDTO](../../apps/web/server/deals/operational-center-dto.ts)
  is the app-owned, serializable read model for the operator vertical.
- [getDealOperationalCenter](../../apps/web/server/deals/operational-center-service.ts)
  assembles the DTO from the canonical Northstar fixture.
- [northstar-energy.fixture.ts](../../apps/web/server/deals/fixtures/northstar-energy.fixture.ts)
  stores the current product facts for one deal.
- [deal-router.ts](../../apps/web/server/trpc/routers/deal-router.ts)
  exposes a narrow fixture-backed `deal.getOperationalCenter` tRPC procedure
  for demo/internal API access.
- [data.ts](../../apps/web/app/deals/[dealId]/data.ts) currently loads the
  app route by calling the service directly, not by going through the tRPC
  server caller.
- Route adapters such as
  [deal-operational-overview-adapter.ts](../../apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts),
  [deal-commitments-table-adapter.ts](../../apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts),
  and
  [deal-commitment-inspector-adapter.ts](../../apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts)
  map the app DTO into kit props and route-owned view models.
- [northstar-operational-center-dto-spec.md](../20-specs/northstar-operational-center-dto-spec.md)
  explicitly says this is a fixture-backed, type-safe app data spine and not a
  Prisma/auth/mutation pass.

This is a strong shape for a later backend migration because the production
data source can change behind the service without forcing kit components to
learn about Prisma, auth, database records, provider payloads, or route loading
mechanics.

## What The Previous Assessment Got Right

The earlier architecture assessment was directionally correct:

1. A real backend is not "just add Prisma."
   Prisma would be only one implementation detail inside a broader production
   layer that also needs auth, permissions, transactions, validation, audit
   events, side effects, and operational error handling.

2. The current DTO/service seam is the right replacement point.
   The service can eventually read from repositories instead of the fixture
   while preserving the route-facing DTO contract.

3. Kit should remain display-oriented.
   `@repo/kit` should continue to receive props and labels. It should not
   import tRPC, Prisma, app services, route loaders, or database types.

4. Route adapters are doing useful anti-corruption work.
   They isolate screen-specific labels, sorting, grouping, summaries, and kit
   prop shapes from the app service and the future persistence layer.

5. Activity is not an audit trail yet.
   The existing spec already says fixture-backed activity events must not be
   overclaimed as legal/compliance audit records. A future audit trail needs
   immutable event ids, actor ids, source systems, payloads, and retention
   semantics.

6. The database should model business facts, not React screens.
   Future persistence should model deals, vehicles, investors, commitments,
   legal entities, documents, blockers, wire transfers, reconciliation records,
   access requests, and activity/audit events. It should not model
   `OverviewCard`, `CommitmentsTableRow`, or rail panel records.

## Important Corrections And Nuance

The route data boundary is now explicit.

Server-side App Router pages and layouts call app services directly. They use
`getDealOperationsData()`, which calls `getDealOperationalCenter()` without
going through a tRPC server caller.

tRPC remains a transport/API adapter over the same app services. It is the
right place for future client-facing queries, external API access, and mutation
boundaries once real auth and persistence exist. It is not the canonical
server-route loading boundary for React Server Components.

Do not refactor RSC routes to call `createServerTrpcCaller()` for architectural
symmetry. That would add internal indirection without improving the current
read-only route behavior.

The current `deal.getOperationalCenter` tRPC procedure uses `publicProcedure`
over synthetic Northstar fixture data. Treat it as demo/internal access only.
It is not production-private-data safe until real auth, protected procedures,
and output validation exist.

A second nuance: repository interfaces are useful, but only when introduced
with restraint. With one fixture and one read service, a large generic
repository abstraction would be premature. The useful version is a small set of
ports around the current service inputs, created specifically to make the
fixture-to-Prisma swap straightforward later.

## Highest-Impact Improvements Before A Real Backend

### 1. Add Minimal Repository Ports Before Prisma

Current service logic imports the Northstar fixture directly. That keeps the
first slice simple, but it means the future Prisma migration still needs to
touch the service internals.

Recommended future shape:

```text
getDealOperationalCenter(input, repositories)
  -> repositories.deals.getOperationalCenterInput(dealId)
  -> domain/service calculations
  -> DealOperationalCenterDTO
```

The first implementation can still be fixture-backed:

```text
FixtureDealOperationsRepository
  -> returns Northstar operational records
```

Later:

```text
PrismaDealOperationsRepository
  -> returns the same service input records
```

Rationale:

- It makes Prisma one data-source implementation, not a rewrite of the
  service.
- It gives tests a clean seam for alternate scenarios.
- It keeps route components and kit components unaffected by persistence.
- It prevents Prisma models from becoming route DTOs by accident.

The repository ports should be specific, not over-generalized. Avoid a broad
CRUD abstraction. Start with the exact read side the current service needs:

- deal summary and vehicle
- access metadata
- capital/reconciliation inputs
- investors and legal entity state
- blockers
- document requirements and groups
- activity feed items

### 2. Preserve The Route Data Boundary

The repo has chosen the service-first RSC path:

```text
App Router route
  -> app service directly

Client components, external API access, and future mutations
  -> tRPC
  -> app service
```

Rationale:

- React Server Components already execute on the server and can call app
  services directly.
- tRPC remains valuable as a typed transport boundary for clients, API
  consumers, and future write workflows.
- Both paths must use the same app service layer so behavior does not fork.
- Production private deal data must not remain public-readable through tRPC.

### 3. Keep DTOs Stable, But Do Not Let One DTO Grow Forever

`DealOperationalCenterDTO` was the right first read model because it established
one trusted spine for the vertical.

As documents, investor lens, permissions, and production performance become
real, the repo should split read models by route or workflow:

```text
DealOperationalCenterDTO
DealOverviewDTO
DealCommitmentsWorkspaceDTO
DealCommitmentInspectorDTO
DealDocumentsWorkspaceDTO
InvestorDealAboutDTO
```

Shared DTO fragments can remain:

```text
DealSummaryDTO
MoneyMinorUnitsDTO
ReadinessDimensionDTO
ClosingBlockerDTO
DocumentRequirementDTO
```

Rationale:

- Overview should not need to fetch all investor evidence forever.
- Commitments should not depend on document center fields that only the
  documents route needs.
- Investor routes should not receive operator-only data.
- Smaller DTOs are easier to cache, authorize, test, and evolve.

Do not split prematurely just to create files. Split when at least one of these
becomes true:

- a route fetches substantially more data than it renders
- a persona should not see part of the broad DTO
- a mutation only needs to revalidate one workflow
- tests for one route require unrelated DTO setup

### 4. Make Permission Assumptions Explicit Before Auth Exists

The current DTO is operator-oriented. It contains facts that would become
sensitive in production:

- all blockers
- investor emails
- commitment amounts
- KYC/KYB status
- wire status
- finance reconciliation state
- protected/internal document group visibility
- recent activity summaries

Before adding the investor `/about` lens or persona toggle, annotate or model
visibility assumptions.

Possible lightweight approach:

```ts
type VisibilityScope =
  | 'operator'
  | 'investor'
  | 'internal_finance'
  | 'legal'
  | 'admin'
```

Rationale:

- Persona toggles cannot be purely UI once real data exists.
- The service should eventually filter by current user, organization, deal
  access, role, and permission.
- Marking fields early reduces the risk that investor-visible routes
  accidentally receive operator-only data.

The current document group `visibility` field is a useful start, but it is not
an authorization system. Treat it as metadata until auth exists.

### 5. Keep Labels And Facts Separated More Deliberately

The current implementation carries some labels in the DTO, such as lifecycle
and operational status labels, while adapters also create display copy.

That is acceptable for the current case-study vertical. Before production
i18n, make the boundary clearer:

```text
service returns facts and stable enum/status values
adapter/i18n layer formats labels
kit renders labels
```

Rationale:

- Future locale support should not require changing persistence or domain
  services.
- Backend records should not store English UI copy as operational truth.
- Route adapters are the right place for screen-specific copy, summary labels,
  sorting labels, and helper text.

This does not mean the service can never return labels. It means any service
label should be an intentional API display contract, not a shortcut around
adapter/i18n work.

### 6. Introduce Test Factories Around The Data Spine

The canonical Northstar fixture is useful, but production backend work will
need targeted scenarios:

- no blockers
- over target
- investor with failed wire
- investor with unmatched wire
- legal entity missing KYB
- expired required document
- unsupported deal
- investor-visible subset
- finance-only reconciliation detail

Recommended direction:

```text
makeNorthstarOperationalFixture()
makeInvestorOperationFixture({ wireStatus: 'unmatched' })
makeDocumentRequirementFixture({ status: 'expired', blocksClosing: true })
makeClosingBlockerFixture({ severity: 'critical' })
```

Rationale:

- It reduces fragile edits to the canonical fixture for one-off tests.
- It prepares the same scenarios to become Prisma seed data later.
- It makes permission and mutation tests easier once auth and writes exist.

Factories should stay close to the app service until more than one package
needs them. The existing spec already argues against a shared mock-data package
until there are multiple real consumers.

### 7. Cache Or De-Duplicate Full DTO Reads In Server Routes

The current deal layout and child pages can both load the broad operational
DTO. With fixture data this is cheap. With a database, it could become
duplicated query work.

Possible future fixes:

- use React/Next `cache()` around the server service call
- load only header/rail data in layout and route-specific data in children
- keep route loaders on direct app service calls with request-level caching
- split DTOs by route as described above

Rationale:

- Production reads are slow and fallible.
- Header/rail data has different freshness and permission needs than an
  investor inspector or document workspace.
- Avoiding duplicate broad reads matters once the data source is remote or
  transactional.

### 8. Preserve The Activity Versus Audit Boundary

The current activity feed is operational context. It is useful for UI:

- recent movement
- investor context
- document events
- blocker history
- wire status changes

It is not a legal/compliance audit log.

Future production should distinguish:

```text
ActivityEventDTO
  -> route-facing operational feed item

AuditEvent
  -> immutable backend record with actor id, source system, payload, and retention semantics
```

Rationale:

- Finance and compliance workflows need auditability.
- UI activity feeds often omit details, aggregate events, or change wording.
- Audit events should be durable facts, not display summaries.

### 9. Avoid Fake Mutations

The current route should keep non-persistent actions disabled, navigational, or
clearly local until the backend boundary exists.

Future mutation contracts can be named early without pretending to persist:

```ts
type ResolveBlockerInput = {
  readonly blockerId: string
  readonly resolutionNote: string
}

type MatchWireInput = {
  readonly wireTransferId: string
  readonly commitmentId: string
}
```

Rationale:

- Real mutations need validation, permissions, transactions, side effects, and
  audit events.
- Fake persisted UI actions are easy to demo and hard to unwind.
- A clear read-only vertical is more honest than simulated backend behavior.

### 10. Name Records, DTOs, And Props Separately

Use naming to protect boundaries:

```text
Record = persistence/service input shape
DTO = route/API output shape
Props/ViewModel = kit or route rendering shape
```

Examples:

```text
InvestorOperationRecord
InvestorOperationDTO
CommitmentInvestorRow

DocumentRequirementRecord
DocumentRequirementDTO
DealCommitmentEvidenceItem
```

Rationale:

- Prisma models should not leak into route DTOs.
- DTOs should not become kit props.
- Kit props should not become database tables.

The repo already has this pattern in places, especially through domain
`Record` types and app `DTO` types. Future backend work should preserve it
consistently.

## Suggested Backend Migration Phases

### Phase 0: Finish The Read-Only Vertical

Complete the current operator vertical without adding persistence:

- overview remains DTO-backed
- commitments table and inspector remain DTO-backed
- documents route gets its own accepted kit baseline and route adapter
- unsupported deal behavior remains explicit
- no fake persisted mutations

Rationale:

- The frontend contract should be clear before persistence enters.
- Backend work should not compensate for unfinished route composition.

### Phase 1: Add Repository Ports, Still Fixture-Backed

Introduce minimal app/server repository interfaces and implement them with the
existing Northstar fixture.

The service still returns the same DTO.

Rationale:

- This creates the persistence replacement point without changing UI behavior.
- Tests should still pass without a database.
- This is the safest moment to clarify `Record` versus `DTO` naming.

### Phase 2: Add Prisma Schema And Seed Northstar

Add Prisma models for business entities:

- Deal
- DealVehicle
- Investor
- InvestorEntity
- Commitment
- KycCheck
- KybCheck
- SignaturePackage
- WireTransfer
- CapitalReconciliationRecord
- ClosingBlocker
- DocumentRequirement
- DocumentFile or DocumentVersion
- ActivityEvent
- AccessRequest

Seed Northstar into the database.

Rationale:

- The fixture remains useful as the source scenario.
- The UI should not change in this phase.
- A seeded Northstar case keeps demo/e2e behavior deterministic.

### Phase 3: Swap Fixture Repositories For Prisma Repositories

Keep service and DTO outputs stable while the repository implementation changes
from fixture reads to Prisma reads.

Rationale:

- This is the proof that the seam works.
- Route adapters and kit should not need Prisma-specific changes.
- Service tests can compare fixture-backed and Prisma-backed outputs for the
  seeded case.

### Phase 4: Add Auth, Identity, And Permission Filtering

Introduce:

- current user
- organization/workspace
- deal access
- roles such as operator, deal lead, investor, finance, legal, admin
- field/workflow-level visibility

Rationale:

- The investor lens and operator lens cannot safely share one unfiltered broad
  DTO.
- Permissions should affect what the service returns, not only what the UI
  hides.

### Phase 5: Split Route Queries Where Needed

Split the broad operational DTO into route/workflow read models when justified
by performance, permissions, or mutation revalidation.

Rationale:

- Smaller read models reduce overfetching.
- They make route-specific tests easier.
- They align backend query cost with user workflows.

### Phase 6: Add Mutations One Workflow At A Time

Start with small operator mutations:

- resolve blocker note
- mark document reviewed
- request evidence
- send reminder
- match wire
- update commitment amount

Each mutation should:

- validate input
- check permission
- run in a service transaction where needed
- update canonical records
- create activity and/or audit events
- return a typed output
- revalidate the affected read model

Rationale:

- Private-markets operations are not simple row edits.
- Mutation logic belongs in services, not route components or kit callbacks.

## Example Transaction Boundary

Resolving a wire/reconciliation blocker may require:

1. match the wire transfer to a commitment
2. update commitment wire status
3. update capital reconciliation state
4. resolve the blocker
5. create an activity event
6. create an immutable audit event
7. update or invalidate readiness summaries

That should be a service transaction.

Rationale:

- Finance workflows need consistency.
- If any step fails, the operator should not see a half-resolved close.
- Route components should trigger a command, not orchestrate business state.

## Biggest Future Risks

### Screen-Shaped Persistence

Bad direction:

```text
OverviewCard
CommitmentsTableRow
RailPanelRecord
InspectorPanelRecord
```

Good direction:

```text
Deal
Commitment
Investor
DocumentRequirement
WireTransfer
ClosingBlocker
ActivityEvent
AuditEvent
```

Rationale:

- Database records should represent business facts.
- Services assemble screen read models.
- UI changes should not require schema churn.

### Permission Leakage

If the broad operator DTO is reused for investor views, sensitive information
could leak before the UI filters it.

Rationale:

- Backend services should return only what the current actor may see.
- UI hiding is not access control.

### Accidental DTO Churn

As each route grows, contributors may keep adding screen-specific fields to
`DealOperationalCenterDTO`.

Rationale:

- DTO churn makes Prisma migration harder.
- It also makes route permissions and caching harder.
- Route-specific DTOs should appear once the broad DTO becomes too heavy.

### Fake Production Behavior

Clickable actions that appear to persist but only mutate local state would
create a misleading demo and future cleanup burden.

Rationale:

- The current project is stronger when it is honest about read-only scope.
- Real writes require backend guarantees.

## Recommended Near-Term Actions

Do not start all of this immediately. The highest-value sequence is:

1. Keep the route data boundary documented: RSC route loaders call app services
   directly, and tRPC adapts those services for client/API/future mutation
   boundaries.
2. Keep the current tRPC deal read fixture-backed/demo-only until real auth,
   protected procedures, and output validation exist.
3. Add lightweight repository ports once the read-only vertical is stable.
4. Add focused test factories for service scenarios.
5. Annotate operator-only and future investor-visible data before building the
   investor `/about` lens.

This order protects current momentum while making the future backend migration
natural instead of disruptive.

## Summary

The current architecture is not a dead-end mock. It already has the correct
direction:

```text
domain rules
  -> app service and DTO
  -> route adapters
  -> kit display components
```

The future backend work should preserve that direction. Prisma, auth, and
mutations should enter behind app services and repository ports. They should
not leak into kit components, route adapters, or database schemas shaped around
React screens.
