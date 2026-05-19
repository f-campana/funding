# One Vertical Done Right: Exhaustive Gap Analysis

Status: Active planning
Created: 2026-05-18
Scope: `Northstar Energy` operator vertical in `/Users/fabiencampana/Documents/funding`
External evidence: `/Users/fabiencampana/Documents/roundtable`
End goal: support Fabien's application as a frontend software developer

## 1. Executive Summary

The right "one vertical done right" target is the `Northstar Energy Deal Operations Workspace`.

This should be a narrow, polished, route-complete frontend product slice for an internal operator preparing a private-market/SPV deal for close. It should not try to become a full Roundtable clone, a backend platform, a legal engine, or an investor checkout product before the operator vertical is genuinely reviewer-ready.

The repo is no longer at the placeholder stage. The current worktree has a real operator route family:

```text
/deals/northstar-energy/overview
/deals/northstar-energy/commitments
/deals/northstar-energy/documents
```

The vertical has meaningful foundations:

- app-owned Northstar operational data under `apps/web/server/deals`
- route adapters under `apps/web/app/deals/[dealId]`
- accepted kit surfaces for overview, progression, commitments, inspector, and documents
- exact money and lifecycle/domain primitives in `@repo/domain`
- Playwright coverage for routing, no-overflow, keyboard row opening, Sheet inspection, documents evidence, and not-found behavior

The remaining gap is not "wire the route." The remaining gap is "make the wired route product-coherent, semantically correct, visually polished, architecturally defensible, and easy for a hiring reviewer to evaluate."

The most important gaps are:

1. Capital and reconciliation semantics need tightening before they are used as portfolio evidence.
2. The commitments route needs a real triage layer: state cards, pending access queue, row actions, and export/bulk affordances.
3. The documents route needs to feel like a data-room/evidence workspace, not a long static inventory.
4. The API boundary is distinct from the route boundary: tRPC is present as a demo/internal adapter, while route data intentionally calls the app service directly.
5. Compliance is represented as status labels, not as realistic control surfaces like screening summary, source-of-funds review, disclosure pack version, and audit-file checklist.
6. The app is credible, but the portfolio-review path is still too internal: docs, screenshots, Storybook curation, CI/validation proof, and first-run instructions need to tell one clean story.

## 2. Current Baseline

### 2.1 Implemented Product Surface

The live vertical currently includes:

- `/deals/northstar-energy` redirecting to `/overview`
- `/overview` rendering `DealOperationalOverview`
- `/commitments` rendering `DealCommitmentsTable` and route-composed `DealCommitmentInspector` content inside a Sheet driven by table detail state
- `/documents` rendering `DealDocumentsEvidence`
- persistent app shell, entity header, route tabs, left navigation, and right operational rail
- unsupported deal handling through app not-found UI

Representative files:

```text
apps/web/app/deals/[dealId]/layout.tsx
apps/web/app/deals/[dealId]/overview/page.tsx
apps/web/app/deals/[dealId]/commitments/page.tsx
apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx
apps/web/app/deals/[dealId]/documents/page.tsx
apps/web/app/deals/[dealId]/deal-operational-rail.tsx
apps/web/tests/e2e/homepage.spec.ts
```

### 2.2 Implemented Data Spine

The Northstar route is powered by a fixture-backed service:

```text
apps/web/server/deals/fixtures/northstar-energy.fixture.ts
apps/web/server/deals/operational-center-service.ts
apps/web/server/deals/operational-center-dto.ts
apps/web/server/trpc/routers/deal-router.ts
```

This is directionally correct for a portfolio frontend project: one route consumes an app-owned DTO rather than importing kit fixtures.

### 2.3 Implemented Domain Foundation

The domain package already provides valuable primitives:

- `EuroCents`
- branded IDs
- deal lifecycle
- commitment lifecycle
- KYC/KYB, signature, and wire operational statuses
- closing blockers
- closing readiness
- document requirements
- capital reconciliation
- SPV status helper

Representative files:

```text
packages/domain/src/money/euro-cents.ts
packages/domain/src/deals/deal-lifecycle.ts
packages/domain/src/deals/deal-readiness.ts
packages/domain/src/deals/closing-blocker.ts
packages/domain/src/commitments/commitment-lifecycle.ts
packages/domain/src/commitments/investor-operations.ts
packages/domain/src/documents/document-requirements.ts
packages/domain/src/reconciliation/reconciliation.ts
packages/domain/src/spv/spv-status.ts
```

### 2.4 Implemented Kit Surfaces

The accepted kit surfaces are:

```text
DealOperationalOverview
DealProgressPanel
DealCommitmentsTable
DealCommitmentInspector
DealDocumentsEvidence
```

They demonstrate a serious component layer, but they also expose the largest React composition concern: most are currently exported as `state + labels` configured widgets rather than composable compound surfaces.

## 3. Evidence Hierarchy

Use evidence in this order when deciding what to build next:

1. Actual app code and tests in the current worktree.
2. Current status docs updated around 2026-05-18.
3. `docs/20-specs/northstar-deal-workspace-product-design-spec.md`.
4. Package boundary/spec docs in `docs/10-architecture` and `docs/20-specs`.
5. The previous local gap analysis, only where it is not stale.
6. Roundtable raw text captures in `/Users/fabiencampana/Documents/roundtable/06_content`.
7. Roundtable public research synthesis in `/Users/fabiencampana/Documents/roundtable/02_roundtable_public_research_docs`.
8. Roundtable UX screenshots and teardown notes.
9. Generated or prompt-like mockup images as design inspiration only.

Important qualification:

The Roundtable corpus should guide product primitives, workflow grammar, and realism. It should not be treated as permission to copy page layouts, copy, brand, visual assets, or legal/tax advice.

## 4. Vertical Definition

### 4.1 Product

Name:

```text
Northstar Energy Deal Operations Workspace
```

Primary user:

```text
Internal operator: deal lead, investor operations, finance, compliance, legal, or fund administrator.
```

Primary workflow:

```text
Prepare one SPV-style private-market deal for close.
```

Primary questions answered:

1. What deal is this?
2. What stage is it in?
3. Can it close?
4. What blocks close?
5. Which investors need attention?
6. Which KYC/KYB, signature, wire, and document items are incomplete?
7. How do committed, signed, received, matched, reconciled, fees, and investable capital relate?
8. What changed recently?

### 4.2 Routes

Canonical operator routes:

```text
/deals/northstar-energy/overview
/deals/northstar-energy/commitments
/deals/northstar-energy/documents
```

Reserved future route:

```text
/deals/northstar-energy/about
```

`/about` should remain a future investor-facing lens, not a partially built operator route.

### 4.3 V1 Scope

Include:

- one concrete deal
- operator lens only
- exact EUR fixture values for V1
- app-owned DTO and route adapters
- read-only interactions that are honest and local
- overview, commitments, documents, right rail, and inspector
- route tests for critical behavior
- empty/loading/error/not-found paths

Exclude:

- real auth
- real database
- live tRPC client mutations
- payment rails
- KYC/KYB vendor integrations
- real uploads
- fake approvals or fake reminders
- investor checkout
- persona toggle
- fund operations
- community management
- capital calls
- legal/tax advice
- multi-deal search
- notifications/background jobs

## 5. Definition Of Done

The vertical is done right when it satisfies these conditions.

### 5.1 Product Done

- A reviewer opening `/deals/northstar-energy` lands on a real operator workspace.
- No visible UI copy references rebuilds, scaffolds, Storybook, placeholders, fake behavior, or implementation status.
- The route family tells one coherent story: overview to commitments to documents.
- The right rail gives a compact progression and capital command center.
- Commitments can be searched, filtered, inspected, and triaged.
- Documents show evidence state, ownership, visibility, due dates, closing impact, and related investors.
- The app is honest about read-only fixture behavior.

### 5.2 Semantic Done

- Matched is not presented as reconciled.
- Gross amount raised, fees, net investable amount, signed, received, matched, and reconciled capital reconcile mathematically.
- Standard closing policy blocks on incomplete KYC/KYB, signatures, unreconciled wires, and required closing documents.
- SPV legal lifecycle is not conflated with deal/subscription workflow.
- Status vocabularies are canonical and mapped in one place per layer.
- Activity is not called audit unless immutable audit behavior exists.

### 5.3 Frontend Done

- Desktop layout is dense and readable without card competition.
- Mobile layout exposes progress, blockers, and key actions before long tables or document lists.
- Tables are accessible, keyboard usable, and responsive without simply squeezing desktop into horizontal scroll where a summary view is needed.
- Inspector preserves workflow context and is keyboard reachable.
- App copy is consistent in language and product vocabulary.
- Route labels and tabs are count-aware where counts matter.

### 5.4 Architecture Done

- `@repo/domain` owns reusable domain rules, not route view models.
- `@repo/kit` owns render-focused product components, not data fetching or routing.
- `apps/web` owns route composition, DTO mapping, and i18n.
- Route data uses the service-first server route pattern intentionally; tRPC is an adapter for client/API/future mutation boundaries over the same services.
- tRPC outputs have runtime schemas if the route/API seam is presented as a real contract.
- Sensitive DTOs are not casually public without an explicit read-only/portfolio caveat.

### 5.5 Portfolio Done

- README gives a clean reviewer path: install, run, open route, inspect surfaces, run tests.
- Screenshots or visual QA artifacts exist for desktop, mobile, inspector, documents, and Storybook states.
- Storybook has a curated "Start Here" path for the key kit surfaces.
- Validation commands are documented and current.
- The project explains what it proves as a frontend application: product judgment, React, TypeScript, design systems, accessibility, routing, testing, and architecture.

## 6. What Already Works

### 6.1 Product And UX Strengths

- The route family exists and is coherent at a high level.
- The app shell has the right grammar: left rail, entity header, tabs, main route content, right rail.
- `DealProgressPanel` is a strong signature primitive.
- Commitments table covers investor identity, amount, KYC/KYB, signature, wire, readiness, search, filters, selection, and row opening.
- The inspector gives meaningful per-investor details.
- Documents are grouped into generated closing documents, investor evidence, and vehicle/target setup.
- Playwright coverage checks mobile no-overflow and main-before-rail order.

### 6.2 Engineering Strengths

- Strict TypeScript posture.
- Exact money primitive.
- Typed domain package.
- App-owned DTO boundary.
- Package boundaries.
- Component-level tests and accessibility checks.
- Storybook orientation.
- Route-level E2E coverage.
- Boundary contract scripts for kit and UI.

### 6.3 Portfolio Strengths To Surface

- This is not a toy landing page.
- It demonstrates dense financial workflow UI.
- It shows how app routes consume a typed data spine.
- It handles status-heavy UI and exact financial display.
- It has real tests for keyboard and mobile behavior.
- It has a meaningful design system and component layer.

## 7. P0 Gaps

P0 means the gap directly undermines "one vertical done right" as a reviewer-ready frontend application.

### 7.1 Capital Economics Were Inconsistent

Status:

Resolved for Northstar V1 in the capital semantic hardening pass. The fixture
now uses `grossCommitted = netInvestable + entryFees + spvFee`, and the
progress panel labels the composition as a gross committed breakdown.

Why it matters:

Financial software credibility depends on exact, explainable amounts. A reviewer may not audit the math deeply, but if they do, this becomes a trust failure.

Future work:

- Replace `carryPercent: number` with `carryBps` or explicitly explain why percent is display-only.
- Promote the economics calculation out of the fixture when a repository-backed
  data source exists.

Acceptance criteria:

- A test proves gross, fees, and net values reconcile.
- Progress rail and overview use the same economic model.
- No route presents more capital composition than the gross amount unless explicitly labelled.

### 7.2 Matched Was Presented As Reconciled

Status:

Resolved for Northstar V1 in the capital semantic hardening pass. Matched-only
investor wires now render as "Matched, finance pending" in the commitment table
and inspector, while explicit reconciled investor states render as
"Finance accepted".

Why it matters:

Roundtable workflow evidence separates:

```text
received -> matched -> reconciled
```

Matched means a wire has been associated with a commitment. Reconciled means finance/operations accepted the match and resolved discrepancies.

Future work:

- Add explicit `reconciledAmount` or `reconciliationStatus`.
- Add aggregate finance-accepted/deployable capital only when the source model
  can prove it.

Acceptance criteria:

- `wire_matched` no longer renders as "Reconciled".
- Ready-for-closing logic requires reconciled state where policy requires it.
- The overview and rail distinguish matched capital from reconciled/deployable capital.

### 7.3 Commitments Route Lacks Triage Layer

Current issue:

The commitments route jumps directly into the table. It lacks the Roundtable-like workflow stack:

```text
state cards -> pending access/review queue -> searchable investor table -> inspector
```

Current fixture has `pendingAccessRequestCount: 3`, and the rail CTA says "Review 3 access requests", but no pending request queue exists.

Needed work:

- Add commitment state summary cards tied to filters:
  - invited
  - investing / committed
  - not investing / withdrawn
  - needs attention
  - ready for closing
- Add a pending access/review queue above the table.
- Add row action menu or action cell for safe, non-mutating actions:
  - open details
  - view documents
  - view blockers
  - copy contact
  - route to filtered evidence
- Add export/bulk affordance only if it is honest and local.

Acceptance criteria:

- Rail CTA lands on a visible queue or filtered section, not just the table.
- State cards update table filters.
- The route shows the operator what to do next before requiring row-by-row table scanning.

### 7.4 Documents Route Is Not Yet A Data Room

Current issue:

The documents route is a credible evidence checklist, but not a document/data-room workspace.

Missing:

- primary document preview
- selected document details
- search/filter by status/owner/group
- version/superseded state
- confidentiality metadata
- NDA/watermark/download flags as read-only metadata
- activity log
- document action affordances routed to safe read-only states

Needed work:

- Reframe Documents as a data-room/evidence workspace.
- Add a selected document panel or preview placeholder with concrete metadata.
- Show folder visibility and controls:
  - protected
  - internal
  - investor visible
  - NDA required
  - watermark enabled
  - downloads allowed/disabled
- Keep uploads/mutations deferred.

Acceptance criteria:

- Documents page reads as a workspace, not a long checklist.
- The user can inspect a document group and one document in detail.
- Read-only data-room controls are visible without implying enforcement.

### 7.5 Mobile Order Hides The Command Center

Current issue:

The current test locks main content before rail on mobile. That avoids the rail dominating the route, but for long documents and wide tables, it pushes progress and blockers too far down.

Needed work:

- Create mobile-specific summaries above the long content:
  - readiness
  - top blockers
  - capital exception
  - primary route action
- Keep full rail after content if needed, but expose its critical data earlier.
- For commitments, provide mobile cards or a compact mobile summary before the horizontal table.
- For documents, show a compact evidence summary and selected blocker/doc before the full list.

Acceptance criteria:

- On a 390px viewport, readiness/progress/blocker state is visible before long table/list content.
- No page-level horizontal overflow.
- The desktop table can remain, but mobile is not only desktop table scroll.

## 8. P1 Gaps

P1 means important for a polished, defensible vertical, but not necessarily blocking the immediate route.

### 8.1 Route Data Boundary Must Stay Explicit

Current issue:

The app route loader calls `getDealOperationalCenter` directly through
`getDealOperationsData`. tRPC exists, but it is not the App Router route-loader
boundary.

Recommended:

Keep direct service calls for React Server Components and document tRPC as an
API seam prepared for future client/API usage and mutations over the same app
services. Do not route through `createServerTrpcCaller()` just for symmetry.

Acceptance criteria:

- README and architecture docs do not overstate tRPC usage.
- The critical path clearly explains the service-first route boundary.

### 8.2 No Runtime Output Schema

Current issue:

`GetOperationalCenterInputSchema` uses Zod, but `DealOperationalCenterDTO` output is TypeScript-only. The tRPC procedure has `.input(...)` but no `.output(...)`.

Needed work:

- Add Zod output schemas for:
  - money minor units
  - deal summary
  - readiness dimensions
  - capital reconciliation
  - blockers
  - investors
  - documents
  - activity
  - result union
- Use `.output(...)` on the tRPC procedure.

Acceptance criteria:

- Invalid fixture output fails at runtime in tests.
- The route/API contract is demonstrably typed and validated.

### 8.3 Permissions Are Only Display Metadata

Current issue:

`TrpcContext` is empty and `deal.getOperationalCenter` is public. That is acceptable only as a read-only portfolio fixture, but the DTO contains sensitive-looking fields: investor emails, commitment amounts, KYC/KYB, wire, and document state.

Needed work:

- Add an explicit `DemoActor` or `ReadOnlyOperatorContext`.
- Add permission/read-only caveat in docs.
- Before using tRPC for production-private deal data, add real auth,
  protected procedures, and output validation.
- Do not build fake production auth.

Acceptance criteria:

- Sensitive operational data is not presented as production-secure.
- The code makes clear this is a read-only operator demo context.

### 8.4 SPV Lifecycle Is Semantically Wrong

Current issue:

`SpvStatus` includes states like `open`, `kyc_in_progress`, and `e_signatures`, which are more like deal/subscription workflow states than legal vehicle lifecycle states.

Needed work:

- Split:
  - `SpvLegalStatus`
  - `DealClosingWorkflowStatus`
  - `InvestorComplianceStatus`
- Keep current status only if renamed/scoped as a closing workflow status.

Acceptance criteria:

- SPV lifecycle describes legal vehicle setup and operation.
- Deal lifecycle describes deal progression.
- Investor statuses describe subscription/compliance/payment progression.

### 8.5 Standard Closing Readiness Is Too Soft

Current issue:

Current readiness is mostly derived from status/blocker counts. For standard closing, Roundtable-style operations require all relevant KYC/KYB, signatures, wires, and required closing documents to be complete before closing.

Needed work:

- Pass `closingMode` into readiness derivation.
- Make standard closing stricter than ongoing collection.
- Add structured guard reasons:
  - missing KYB
  - signature incomplete
  - wire not received
  - wire matched but not reconciled
  - required document missing/rejected/expired
  - vehicle setup incomplete

Acceptance criteria:

- Readiness is policy-aware.
- Tests cover at least one standard-closing blocker generated by data, not only manually listed fixture blockers.

### 8.6 Product Copy And I18n Are Inconsistent

Current issue:

The app declares `fr-FR`, the homepage is French-ish ASCII, but the deal workflow copy is mostly hardcoded English inside adapters/components.

Needed work:

- Choose review language.
- Recommended for applications: use English for the product demo unless the application target is explicitly French.
- Move app-facing route copy into `apps/web/messages/fr-FR.json` or introduce an `en-US` route.
- Keep kit components label-driven.

Acceptance criteria:

- Homepage, metadata, route copy, and README align.
- No important route copy is stranded in adapters unless intentionally local.

### 8.7 Inspector Is Modal, Not Contextual

Current issue:

The commitment inspector opens in a modal Sheet. It is accessible and useful, but the Roundtable-like pattern is more like contextual side inspection that preserves the table workflow.

Needed work:

- Keep Sheet for mobile.
- Consider persistent side inspector on desktop inside the commitments route.
- Add richer operator actions as safe route actions or read-only action descriptors.

Acceptance criteria:

- Desktop operator can inspect without losing table context.
- Mobile still gets a proper modal/drawer.

### 8.8 App Adapters Duplicate Status Logic

Current issue:

Several route adapters map statuses, labels, tones, owner labels, document categories, and readiness labels. Duplication is still manageable, but it is the likely source of drift.

Needed work:

- Consolidate shared route label/status mapping into app helper modules.
- Keep domain labels out of `@repo/domain` if they are presentation copy.
- Add tests for adapter mappings.

Acceptance criteria:

- Same status renders consistently in overview, table, inspector, documents, and rail.

## 9. P2 Gaps

P2 means important for long-term maintainability or stronger portfolio proof.

### 9.1 Kit APIs Are Over-Configured

Current issue:

`DealCommitmentsTable`, `DealCommitmentInspector`, `DealOperationalOverview`, and `DealDocumentsEvidence` are large `state + labels` renderers.

Risk:

They can look less like idiomatic senior React composition and more like configured widgets.

Options:

1. Refactor one newest surface, likely `DealDocumentsEvidence`, into compound parts.
2. Add an ADR explaining why these are intentional workflow widgets and how app composition is preserved at route level.

Recommended:

Do both over time:

- short term: ADR
- medium term: compound API for new or revised surfaces

### 9.2 Storybook Is Not Curated For Hiring Review

Current issue:

Storybook has package stories, but no "start here" portfolio path.

Needed work:

- Add a curated story index:
  - Progress rail: blocked, ready, closed
  - Commitments table: ready, empty, loading, long text, mobile
  - Inspector: blocked investor, ready investor
  - Documents: blocked evidence, empty, long labels
  - UI primitives: table, sheet, badge, progress, chart
- Add viewport/a11y addon or document why current tests cover a11y.

Acceptance criteria:

- A reviewer can inspect the design system in 5-10 minutes.

### 9.3 Visual Evidence Is Missing

Current issue:

Playwright screenshots are captured only on failure, and no committed visual evidence set exists.

Needed work:

- Capture and track a small visual evidence set:
  - desktop overview
  - desktop commitments
  - inspector open
  - documents route
  - mobile overview
  - mobile commitments
  - Storybook dark component state
- Add a README section that links to them.

Acceptance criteria:

- The application can be evaluated without the reviewer running the app immediately.

### 9.4 E2E Tests Are Broad But Selector-Heavy

Current issue:

The E2E suite is strong but relies heavily on `data-slot` locators. That is acceptable for structural assertions, but product behavior should be asserted through roles and visible names where possible.

Needed work:

- Keep `data-slot` for stable structural boundaries.
- Prefer roles/names for user-facing assertions.
- Add screenshot artifact checks for key route states.
- Add at least one app-level accessibility smoke check if feasible.

Acceptance criteria:

- Tests read like user workflows, not implementation snapshots.

### 9.5 Docs Drift

Current issue:

Several docs are out of sync:

- older gap analysis still references `/about` as operator entry
- project overview may still say route work is in progress
- testing docs may still reference older route expectations
- package READMEs may omit current accepted surfaces

Needed work:

- Update current source-of-truth docs only.
- Mark older docs historical if not updated.
- Add "Current reviewer path" to root README and apps/web README.

Acceptance criteria:

- A reviewer does not encounter contradictory route scope.

### 9.6 CI And Validation Proof

Current issue:

Scripts exist, but there is no visible CI workflow or validation badge/transcript.

Needed work:

- Add CI workflow or local validation transcript.
- Include commands:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
  - `pnpm storybook:build`
  - `pnpm e2e`
- Add package-specific commands where relevant.

Acceptance criteria:

- Portfolio reviewer sees that quality gates are current and reproducible.

## 10. Compliance And Regulated Workflow Gaps

For this portfolio vertical, do not build legal/tax engines. Instead, show realistic operational control surfaces.

### 10.1 Compliance Screening Summary

Current:

KYC/KYB status exists.

Missing:

- sanctions status
- PEP status
- adverse media status
- source-of-funds status
- source-of-wealth status
- risk rating
- approval authority
- exception log
- evidence document refs

Recommended:

Add a read-only compliance summary panel or inspector section.

### 10.2 Private Offer / Eligibility Perimeter

Current:

`sharingMode` exists and `commitment-flow` has qualification schemas, but the live deal DTO does not show distribution/eligibility perimeter.

Missing:

- residence country
- qualification type
- eligibility state
- marketing perimeter status
- invitation count by country
- distribution list locked status
- UK certification where relevant
- US investor restrictions as status, not legal advice

Recommended:

Represent this as an operator control surface:

```text
Eligibility and distribution perimeter
```

### 10.3 Disclosure Pack

Missing:

- disclosure pack version
- risk disclosure status
- tax disclaimer acknowledgement status
- legal disclaimer acknowledgement status
- conflicts disclosure status
- privacy notice status
- AML/KYC notice status

Recommended:

Add a read-only disclosure pack row or card in Documents/Overview.

### 10.4 Data Room Controls

Current:

Groups have visibility labels.

Missing:

- NDA required
- watermark enabled
- download disabled/enabled
- folder type
- document version
- superseded state
- access scope
- view/download activity counts

Recommended:

Add these as read-only metadata in the data-room surface.

### 10.5 Audit File

Current:

Activity events exist.

Missing:

- closing memo
- investor register
- exception log
- approval log
- payment exception log
- marketing memo
- vehicle memo
- monitoring calendar
- immutable audit event distinction

Recommended:

Do not overbuild audit. Add an "Audit file readiness" checklist as a route surface.

## 11. Route-Specific Gap Analysis

### 11.1 Overview

What works:

- clear readiness state
- blocker counts
- capital reconciliation exception evidence
- priority blockers
- latest activity

Gaps:

- no concrete deal material anchor
- no selected document/deck/closing pack preview
- no key terms grid
- capital and readiness can compete with the right rail
- not clearly enough differentiated from rail

Recommended:

- Make overview the operator summary, not a generic dashboard.
- Add one concrete object:
  - closing pack preview
  - deal materials object
  - audit file readiness object
  - disclosure pack version object
- Keep capital exceptions in overview, but keep full capital progression in rail.

### 11.2 Commitments

What works:

- table is useful
- search/filter present
- KYC/KYB, signature, wire columns present
- inspector opens with keyboard
- selection is separate from row open

Gaps:

- no state cards
- no pending access/review queue
- no export/bulk actions wired
- no row action menu
- entity folded into investor metadata
- reconciliation underexposed
- carry/custom terms absent
- URL does not preserve filters/search

Recommended:

- Add triage layer.
- Add visible entity column or density mode.
- Add route-state filters in URL for shareability.
- Add "matched not reconciled" status.
- Add read-only action menu.

### 11.3 Commitment Inspector

What works:

- investor identity
- commitment amount
- readiness
- blockers
- documents
- activity

Gaps:

- modal Sheet blocks context on desktop
- actions are not meaningful beyond retry type
- no compliance screening detail
- no payment exception detail
- no disclosure/acknowledgement history

Recommended:

- Desktop side inspector.
- Add compliance/payment/detail sections.
- Add safe action descriptors, not fake mutations.

### 11.4 Documents

What works:

- evidence groups
- document statuses
- due dates
- closing impact
- related investor
- visibility labels

Gaps:

- no preview
- no selected document detail
- no filters/search
- no activity log
- no data-room controls
- no versioning
- long vertical list on mobile/desktop

Recommended:

- Rework into a data-room layout:

```text
folder list / filter rail
document list
selected document preview/details
evidence/audit metadata
```

### 11.5 Right Rail

What works:

- strong `DealProgressPanel`
- committed/target headline
- capital breakdown
- readiness snapshot
- exception queue
- primary CTA routes to commitments

Gaps:

- one CTA path only
- metrics are not interactive filters
- rail is buried on mobile
- some data duplicates overview

Recommended:

- Make rail metrics link to filtered route states.
- Add CTA variants based on stage and readiness.
- Add mobile summary card before long content.

## 12. Architecture Gap Analysis

### 12.1 DTO Contract

Current:

`DealOperationalCenterDTO` is useful but differs from the accepted spec.

Needed:

- Either update the spec to match the implementation or implement the omitted fields.
- Add output schemas.
- Stop tests from codifying accidental omissions unless omissions are intentional.

### 12.2 Route Data Boundary

Current:

Routes call service directly.

Needed:

- Decide route-through-tRPC vs service-first RSC pattern.
- Document the decision.

### 12.3 Fixture Injection

Current:

Service imports singleton fixture.

Needed:

- Add fixture factory or repository interface for tests.
- Exercise error branches.

### 12.4 Permission Modeling

Current:

Public procedure, empty context.

Needed:

- For V1: explicit demo operator context.
- Later: protected procedure and permission snapshots.

### 12.5 App Adapter Tests

Current:

Document adapter has a focused test; other adapters rely mainly on E2E.

Needed:

- Unit tests for:
  - overview adapter
  - commitments table adapter
  - inspector adapter
  - progress panel adapter
  - rail adapter
  - route data loader

## 13. Component And React Composition Gaps

### 13.1 Current Risk

Kit components are powerful but prop-heavy. They accept large `state` and `labels` objects and render full workflow panels internally.

This is useful for controlled product baselines, but it can look over-configured to senior React reviewers.

### 13.2 Recommended Strategy

Short term:

- Keep current APIs stable.
- Add an ADR explaining that accepted kit surfaces are workflow baselines and route composition happens in `apps/web`.

Medium term:

- Refactor `DealDocumentsEvidence` first into compound parts because it is the newest and most likely to evolve.
- Expose:

```text
DealDocumentsEvidence.Root
DealDocumentsEvidence.Header
DealDocumentsEvidence.Summary
DealDocumentsEvidence.Group
DealDocumentsEvidence.DocumentList
DealDocumentsEvidence.DocumentPreview
DealDocumentsEvidence.Empty
DealDocumentsEvidence.Error
```

Long term:

- Move table/inspector/overview toward composable subparts while keeping convenience wrappers.

## 14. Testing And Verification Gaps

### 14.1 What Exists

- Playwright route tests
- package unit tests
- component accessibility tests in UI/kit
- Storybook build
- typecheck/lint scripts

### 14.2 Missing Or Weak

- app-level accessibility smoke test
- screenshot QA artifacts
- route-level visual regression or saved screenshots
- CI workflow
- output schema tests
- route loader tests
- adapter unit tests beyond documents
- failure branch tests for service errors
- mobile-specific component stories

### 14.3 Recommended Verification Matrix

Minimum reviewer-ready validation:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm storybook:build
pnpm e2e
```

Targeted:

```bash
pnpm --filter @repo/domain test:coverage
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/ui test:coverage
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
```

Visual QA:

```text
desktop overview
desktop commitments
desktop commitments inspector
desktop documents
mobile overview
mobile commitments
mobile documents
storybook dark component state
```

## 15. Documentation And Portfolio Gaps

### 15.1 First-Run Path

Current README is architecture-heavy. It should also include a portfolio reviewer path.

Needed section:

```text
Portfolio Review Path
1. pnpm install
2. pnpm --filter @repo/web dev
3. open /deals/northstar-energy
4. inspect Overview, Commitments, Documents
5. run pnpm e2e
6. run pnpm storybook
```

### 15.2 Screenshots

Add a small `docs/assets` set and link it from README.

### 15.3 Storybook Curation

Add "Start Here" story group:

- Deal Progress Panel
- Deal Operational Overview
- Deal Commitments Table
- Deal Commitment Inspector
- Deal Documents Evidence
- UI Table
- UI Sheet
- UI Badge/Progress

### 15.4 Docs Consistency

Current docs should all agree:

- route entry is `/overview`
- `/about` is future investor lens
- documents route is wired
- tRPC is either route path or prepared seam
- backend/database/mutations are deferred

## 16. Recommended Implementation Plan

### Phase 0: Lock Current Truth

Goal:

Make documentation, README, route scope, and portfolio review path consistent.

Tasks:

- update current docs around `/overview`
- mark older gap analysis stale where it mentions `/about`
- add reviewer path to README
- update package READMEs for current exports
- decide English vs French route language

Exit criteria:

- no reviewer-facing doc contradicts the current route structure

### Phase 1: Fix Semantic Credibility

Goal:

Remove the most damaging financial/workflow inconsistencies.

Tasks:

- fix gross/fees/net investable invariant
- add `carryBps`
- stop showing matched as reconciled
- add reconciliation status or reconciled amount
- make standard closing readiness policy-aware
- split or rename SPV status
- fix progress state mapping for `awaiting_wires` and `open_for_preview`

Exit criteria:

- capital and readiness tests prove the semantics

### Phase 2: Add Operator Triage Depth

Goal:

Make Commitments the central operator workflow.

Tasks:

- add state cards
- add pending access/review queue
- add safe row action menu
- add visible entity/reconciliation treatment
- add URL-addressable filters if feasible
- add export/bulk affordance only if honest

Exit criteria:

- operator sees the next workload before scanning table rows

### Phase 3: Upgrade Documents Into Data Room

Goal:

Make documents route a credible data-room/evidence workspace.

Tasks:

- add document search/filter
- add selected document preview/details
- add data-room controls as read-only metadata
- add version/superseded metadata
- add document activity
- add disclosure pack/audit file readiness

Exit criteria:

- page feels like document operations, not static evidence inventory

### Phase 4: API And Permission Hardening

Goal:

Make the data boundary defensible.

Tasks:

- add output schemas
- preserve the documented service-first RSC route boundary
- add demo operator context
- add tests for unsupported/error branches
- add fixture factory/repository seam

Exit criteria:

- API/route boundary is explicit, tested, and not overstated

### Phase 5: Portfolio Proof

Goal:

Make the project easy to evaluate in a job application.

Tasks:

- visual QA screenshots
- Storybook "Start Here"
- CI workflow or validation transcript
- app-level accessibility smoke
- keyboard checklist
- one composition ADR or refactor

Exit criteria:

- reviewer can understand the product, run it, inspect it, and trust the engineering evidence quickly

## 17. Deferred Work

Do not start these until the operator vertical is reviewer-ready:

- investor `/about` lens
- persona toggle
- real auth
- Prisma/database/repository persistence
- real uploads
- real reminders
- real approvals
- banking integrations
- KYC/KYB provider integration
- DocuSign/signature provider integration
- real data-room permission enforcement
- capital calls
- funds
- communities
- portfolio analytics
- global search
- notifications
- tax/legal eligibility engine

## 18. Open Decisions

1. Should the portfolio demo be English-first or French-first?
2. How should future client/API tRPC reads stay aligned with the direct service-call RSC route boundary?
3. Should `DealDocumentsEvidence` be refactored into compound parts before or after data-room upgrade?
4. Should mobile prioritize rail summary before content, or duplicate only critical rail facts above content?
5. Should the next product-depth pass focus first on commitments triage or documents/data room?
6. Should visual QA artifacts be committed, or generated into a documented temporary path?
7. Should status labels live in app i18n, app adapter maps, or kit label bundles?

## 19. Application Positioning

This repo should support a frontend software developer application by proving the following:

- product sense: one narrow workflow built deeply instead of many shallow pages
- information architecture: route family, tabs, rails, tables, inspectors
- React skill: reusable components, app composition, stateful client interactions
- TypeScript skill: branded money, DTOs, strict configs, exhaustive unions
- design system skill: tokens, shadcn-compatible primitives, status systems
- UX skill: dense but readable financial workflows
- accessibility skill: semantic tables, dialogs, keyboard interaction, labels
- testing skill: unit, type, component, accessibility, Storybook, E2E
- architecture skill: package boundaries, app-owned adapters, domain separation

The strongest final reviewer narrative:

```text
I built a private-markets deal operations vertical as a frontend case study.
It shows how I turn domain research into a typed product surface: exact money,
workflow states, readiness, commitments, document evidence, responsive layout,
keyboard-accessible inspection, and tests that protect the real user path.
```

## 20. Final Recommendation

Do not broaden the app yet.

The next work should be:

1. fix capital/reconciliation semantics
2. align docs and reviewer path
3. add commitments triage
4. upgrade documents into a data-room surface
5. harden the API/permission story
6. create portfolio evidence

Only after that should the repo move to investor `/about`, persona toggle, backend persistence, or additional private-capital modules.
