# Backend Migration Readiness

**Status:** Reference planning  
**Created:** 2026-05-18  
**Last audited:** 2026-05-19 by four read-only audit agents
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

## 2026-05-19 Agent Audit Snapshot

Four read-only audit lanes reviewed the backend migration readiness from
different angles:

- server data spine, DTOs, service assembly, mappers, fixture shape, and tests
- route loading, tRPC usage, route adapters, client/server boundaries, and kit
  isolation
- docs/spec consistency around the backend migration path
- tests, fixtures, auth/visibility, mutation readiness, and activity/audit
  boundaries

The consolidated finding:

```text
Frontend/DTO boundary readiness: strong for a read-only demo vertical
Backend migration readiness: partially prepared, not yet safe for live private data
Production data exposure readiness: not ready until auth, protected procedures,
permission filtering, and client-serialization boundaries are added
```

What is ready:

- The operator vertical is route-complete for the current read-only IA:
  overview, commitments, and documents are DTO-backed.
- `DealOperationalCenterDTO` is a useful app-owned read model and is not a
  Prisma model or kit prop shape.
- `getDealOperationalCenter()` returns a typed `Result` and maps recoverable
  business failures into explicit error variants.
- Runtime validation now exists at the app service boundary for JSON-safe EUR
  money, ISO date-time strings, selected capital invariants, forbidden
  finance-accepted capital fields, and dangling references.
- The App Router data boundary is explicit: RSC routes call app services
  directly; tRPC is a typed transport adapter over the same services.
- Route adapters keep `@repo/kit` backend-agnostic.
- The current tRPC read is documented as fixture-backed demo/internal access,
  not production-private-data-safe behavior.

What is not ready:

- There is no repository/source abstraction yet. The service imports the
  Northstar fixture directly and rejects every non-Northstar slug.
- The service and route loader are synchronous. Prisma or any remote data
  source will force async boundaries.
- Mapper inputs are still tied to `Northstar*` fixture types in several places,
  so a Prisma migration would touch mapper signatures unless a source record
  layer is introduced first.
- The fixture partially mixes source data with DTO-ready data, especially
  activity, access, vehicle, document group, and closing-mode fields.
- The public tRPC read has empty context and uses `publicProcedure`. Live
  private deal data must not be exposed through this seam before auth and
  protected procedures exist.
- The layout and child routes each load the broad DTO. With fixture data this
  is harmless; with a database it can duplicate query work and create
  inconsistent shell/page snapshots.
- The full operator DTO currently crosses a client boundary through the
  operational rail. That can serialize investor emails, document metadata,
  blockers, and activity to the browser even when the rail only needs
  aggregates.
- Runtime validation is meaningful but partial. It does not yet validate a full
  strict DTO output schema, duplicate ids, or all bidirectional graph
  consistency rules.
- Visibility fields are presentation metadata, not access control.
- Domain `Record` types are lightweight operational records, not persistence or
  mutation records. They lack tenant/deal scope, versioning, timestamps, and
  actor/source metadata.
- Several docs/specs are stale against the route-complete implementation and
  should not be treated as migration source of truth without refresh.

Hard rule for backend work:

```text
No live/private Prisma-backed deal data may be reachable through
deal.getOperationalCenter, route loaders, or any future query until auth,
request context, protected procedures, per-deal authorization, permission
filtering, private caching/no-store policy, and output validation are resolved.
```

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
  assembles the DTO from the canonical Northstar fixture and validates the
  assembled DTO before returning `Result.Ok`.
- [operational-center-validation.ts](../../apps/web/server/deals/operational-center-validation.ts)
  validates selected DTO trust-boundary invariants, including money, dates,
  capital semantics, and dangling references.
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
  [deal-documents-evidence-adapter.ts](../../apps/web/app/deals/[dealId]/deal-documents-evidence-adapter.ts),
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

The recommended shape is:

```text
DealOperationalCenterSource
  -> source records for app service assembly

DealOperationalCenterRepository
  -> findOperationalCenterBySlug(slug)

buildDealOperationalCenter(source)
  -> pure DTO assembly and validation
```

Rationale:

- The Northstar fixture can become one `DealOperationalCenterSource`.
- Prisma can later normalize database rows into the same source shape.
- Mapper signatures can depend on generic source subtypes instead of
  `Northstar*` fixture types.
- The DTO builder can stay mostly stable when persistence changes.

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
- Auth, tenancy, and permission checks must live below both route loading and
  tRPC, or route loading must deliberately move to the tRPC server caller.

Do not add auth only inside tRPC while App Router routes keep direct service
access. That would create two security paths and let server routes bypass the
policy layer.

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
duplicated query work and can create inconsistent snapshots between the shell
and the page content.

Possible future fixes:

- use React/Next `cache()` around the server service call
- load only header/rail data in layout and route-specific data in children
- keep route loaders on direct app service calls with request-level caching
- split DTOs by route as described above
- make the service async while it is still fixture-backed, so the future Prisma
  diff does not combine async migration with persistence migration

Rationale:

- Production reads are slow and fallible.
- Header/rail data has different freshness and permission needs than an
  investor inspector or document workspace.
- Avoiding duplicate broad reads matters once the data source is remote or
  transactional.

### 8. Stop Passing The Full Operator DTO To Client-Only Chrome

The operational rail is client-rendered route chrome, but it only needs
aggregate rail/progress props and navigation metadata. Passing the full
operator DTO to client components can serialize private deal data to the
browser before a user workflow actually needs it.

Future direction:

```text
server layout
  -> compute rail/progress view models
  -> pass minimal client-safe props to rail/chrome components
```

Rationale:

- Investor emails, document groups, blockers, and activity should not cross a
  client boundary just because the rail needs aggregate counts.
- This will matter more once visibility filtering and investor lenses exist.
- It also reduces payload size for every nested deal route.

### 9. Preserve The Activity Versus Audit Boundary

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

Add future tests that make this distinction explicit:

- activity can be redacted or derived from audit
- activity is not accepted as immutable audit evidence
- audit records include actor id, source system, request id, payload, and
  append-only semantics

### 10. Tighten DTO Validation Before External Data Enters

The current validation is a useful boundary, not a full schema. Before Prisma,
provider payloads, uploads, or external API data feed the service, add stricter
validation around:

- full DTO output shape or a full source-record schema
- duplicate ids in investors, blockers, documents, groups, and activity
- document/group bidirectional consistency
- duplicate group membership
- blocker/investor/document relationship symmetry where required
- enum values before adapter map indexing
- route-handler HTTP serialization and cache headers

Rationale:

- The current fixture is trusted source code. A database or provider payload is
  runtime data.
- Adapter `Record<Enum, Label>` maps assume valid enum values.
- `Set`-based reference checks catch dangling references but can hide
  duplicate ids.

### 11. Avoid Fake Mutations

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

### 12. Name Records, DTOs, And Props Separately

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

### Phase 0: Preserve The Route-Complete Read-Only Vertical

The operator vertical is now route-complete for the current IA. Preserve that
state while backend work is planned:

- overview remains DTO-backed
- commitments table and inspector remain DTO-backed
- documents remains DTO-backed through `DealDocumentsEvidence`
- unsupported deal behavior remains explicit
- no fake persisted mutations
- tRPC remains fixture-backed demo/internal access only

Rationale:

- The frontend contract should be clear before persistence enters.
- Backend work should not compensate for route composition.

### Phase 1: Add Source Records, Repository Ports, Async Service, And Request Memoization

Introduce minimal app/server source records and repository interfaces. Implement
them with the existing Northstar fixture first.

At the same time, make the service and route loader async and request-memoized
while the data is still fixture-backed.

Rationale:

- This creates the persistence replacement point without changing UI behavior.
- Tests should still pass without a database.
- This is the safest moment to clarify `Record` versus `DTO` naming.
- Async and caching changes are easier to review before Prisma enters.

### Phase 2: Add Auth/API Safety Gate Before Live Data

Before any live/private data is reachable, add or explicitly design:

- authenticated request context
- protected tRPC procedures
- per-deal authorization checks below both RSC service calls and tRPC
- viewer role/scope modeling
- permission-filtered DTO/source output
- private caching or no-store policy
- tRPC HTTP/route-handler integration tests
- output validation policy for the transport boundary

Rationale:

- The current `publicProcedure` is acceptable only for fixture-backed demo data.
- Auth only inside tRPC would not protect direct RSC service calls.
- Visibility labels are not authorization.

### Phase 3: Add Prisma Schema And Seed Northstar Locally

Add Prisma models for business entities, initially for local/demo seed parity:

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

This phase must stay local/demo-only unless Phase 2 has been implemented.

Rationale:

- The fixture remains useful as the source scenario.
- The UI should not change in this phase.
- A seeded Northstar case keeps demo/e2e behavior deterministic.

### Phase 4: Swap Fixture Repositories For Prisma Repositories

Keep service and DTO outputs stable while the repository implementation changes
from fixture reads to Prisma reads.

Do not expose the Prisma-backed read through public tRPC or unauthenticated
routes. If Phase 2 is not done, keep this swap behind local-only/demo-only
execution.

Rationale:

- This is the proof that the seam works.
- Route adapters and kit should not need Prisma-specific changes.
- Service tests can compare fixture-backed and Prisma-backed outputs for the
  seeded case.

### Phase 5: Split Permission-Filtered Read Models

Split the broad operational DTO into route/workflow/persona read models when
justified by performance, permissions, or mutation revalidation.

Examples:

- operator overview
- operator commitments workspace
- operator commitment inspector
- operator documents workspace
- investor deal about
- finance reconciliation detail

Rationale:

- The investor lens and operator lens cannot safely share one unfiltered broad
  DTO.
- Permissions should affect what the service returns, not only what the UI
  hides.
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

### Public Transport Before Auth

The current tRPC read is public and has empty context. That is acceptable only
while it returns synthetic fixture data. It becomes a production blocker the
moment live private data is attached.

Rationale:

- Private deal data includes investor contact, document, blocker, activity, and
  financial state.
- GET/POST route-handler behavior, cache headers, auth headers, and HTTP
  serialization are not covered by current caller-only tRPC tests.

### Client Serialization Of Private DTOs

Client components should not receive broad operator DTOs when they only need
aggregates or display props.

Rationale:

- Server/client boundaries are data exposure boundaries.
- Payload minimization matters for privacy and performance.

### Duplicate Reads And Snapshot Drift

The layout and nested pages can load the DTO independently.

Rationale:

- With a database, duplicate reads increase query cost.
- Without request memoization, shell and page content could observe different
  snapshots after mutations or revalidation.

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

### Stale Planning Docs

Some older planning/spec documents still describe pre-route-complete behavior
or stale DTO shapes. Treat the implemented code, current status, and this
backend migration snapshot as the migration path until those specs are
refreshed.

Rationale:

- Stale specs can send backend work toward removed fields such as route/rail
  DTO members or old `/about` operator routing.
- Kit docs should include `DealDocumentsEvidence` so documents are not treated
  as unfinished app-only work.

## Recommended Near-Term Actions

Do not start all of this immediately. The highest-value sequence is:

1. Keep the route data boundary documented: RSC route loaders call app services
   directly, and tRPC adapts those services for client/API/future mutation
   boundaries.
2. Keep the current tRPC deal read fixture-backed/demo-only until real auth,
   protected procedures, authorization checks, private caching policy, and
   transport output validation policy exist.
3. Introduce `DealOperationalCenterSource` and a fixture-backed repository
   before Prisma.
4. Make the service and route loader async and request-memoized before Prisma.
5. Stop passing the full operator DTO into client-only rail/chrome components.
6. Add duplicate-id and graph-consistency validation tests.
7. Add focused test factories for service and visibility scenarios.
8. Add a future auth matrix for unauthenticated, unauthorized, operator/admin,
   finance/legal, and investor-scoped callers.
9. Split demo-public e2e assumptions from future private-auth e2e coverage.
10. Clean up stale docs/spec references: Northstar DTO spec, kit docs for
    `DealDocumentsEvidence`, route-handler wording, and older active planning
    files that still describe `/about` as the operator route.

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
