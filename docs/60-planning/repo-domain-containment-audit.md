# Repo Domain Containment Audit

**Status:** Reference audit  
**Created:** 2026-05-19  
**Scope:** `@repo/domain`, app-level deal operations code, and package boundary guardrails  
**Audit mode:** read-only review by the main thread plus four delegated audit lanes

## Purpose

This document captures the repository domain-containment audit for future
implementation work. The central question was:

```text
Is private-markets domain logic contained in the shared domain package, or is it
leaking into apps/web?
```

Short answer:

```text
packages/domain is import-contained and currently healthy.
apps/web still contains reusable private-markets semantics that should be
promoted into @repo/domain before the vertical grows.
Boundary enforcement is not strong enough to prevent regressions.
```

This document is intentionally more comprehensive than a short review comment.
It should be used as a reference before adding backend persistence, mutations,
new deal workflows, or more private-markets operational surfaces.

## Source Material

The audit used repository source and the allowed documentation corpus:

- `docs/10-architecture/package-boundaries.md`
- `docs/10-architecture/domain-adrs.md`
- `docs/20-specs/domain-spec.md`
- `docs/20-specs/domain-reconciliation-spec.md`
- `docs/20-specs/northstar-operational-center-dto-spec.md`
- `docs/60-planning/private-markets-domain-roadmap.md`
- `docs/60-planning/backend-migration-readiness.md`
- `docs/60-planning/state-management-principle-audit.md`
- `/Users/fabiencampana/Documents/roundtable/03_architecture_support_docs/PRIVATE_MARKETS_DOMAIN_MODEL.md`
- `/Users/fabiencampana/Documents/roundtable/03_architecture_support_docs/OPERATIONAL_STATE_MACHINE_ARCHITECTURE.md`
- `/Users/fabiencampana/Documents/roundtable/05_execution/DEAL_OPERATIONS_V1_IMPLEMENTATION_SPEC.md`

Line references below are from the 2026-05-19 audit snapshot and may drift as
files evolve.

## Intended Boundary Model

The intended runtime direction is:

```text
core -> domain -> kit -> apps/web
```

`packages/ui` is generic and should remain independent from domain/product
knowledge. `packages/kit` is the first render layer where product-shaped props
are allowed. `apps/web` may import all workspace packages, but it should not
become a second domain package.

### `@repo/domain` Owns

- branded identifiers
- exact money primitives such as `EuroCents`
- commitment, deal, SPV, document, blocker, reconciliation, and operational
  status vocabulary
- Zod schemas at domain/trust boundaries
- pure calculations and validation rules
- transition tables and reusable workflow predicates
- structured error/status tags

### `@repo/domain` Must Not Own

- React components or hooks
- Next.js route logic
- `next-intl` providers or locale context reads
- Tailwind, CSS, Shadcn, Radix, or UI component imports
- tRPC routers, Prisma models, database clients, provider clients, or app
  services
- route labels, translated copy, navigation, or visual grouping decisions
- Northstar-specific canonical app fixture data

### `apps/web` Owns

- routing, layouts, App Router data loading, route errors, and providers
- `next-intl` setup and app translation files
- app services and app-owned DTOs
- tRPC adapter wiring over app services
- Northstar app fixture data for the current demo vertical
- route-level view-model assembly
- serialization from domain values into JSON-safe DTOs
- labels and copy for route surfaces
- Playwright and app-level tests

### Important Distinction

It is valid for `apps/web` to own `DealOperationalCenterDTO` because that DTO is
a route/app read model. It is not valid for that DTO layer to become the
canonical source of private-markets rules.

The practical rule:

```text
If code defines reusable business meaning, workflow truth, exact-money
invariants, status semantics, or domain graph consistency, it belongs in
@repo/domain.

If code maps domain/app data into route labels, kit props, layout groupings,
or JSON-safe DTOs, it can stay in apps/web.
```

## Audit Method

The audit was split into four read-only lanes:

1. `packages/domain` self-containment: imports, dependencies, exports, tests,
   and presentation-adjacent API surface.
2. `apps/web` leakage: duplicated private-markets rules and status semantics in
   server deal code and route adapters.
3. Tooling and enforcement: package manifests, tsconfigs, lint scripts, export
   tests, and missing negative boundary checks.
4. Documentation synthesis: expected boundary model from repo docs and
   Roundtable/private-capital reference docs.

The main thread also ran local source scans and verified the domain package:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test
```

Result:

```text
typecheck: passed
lint: passed
test: passed, 12 test files, 169 tests
```

## What Is Healthy Today

### Domain Runtime Imports Are Clean

Production imports inside `packages/domain/src` are limited to internal relative
modules, `@repo/core`, and `zod`.

The audit found no production imports from:

- `apps/web`
- `@repo/ui`
- `@repo/kit`
- React
- Next.js
- `next-intl`
- Tailwind/CSS
- browser APIs
- app aliases such as `@/`

This means the domain package is not currently depending on app or presentation
code.

### Domain Manifest Is Minimal

`packages/domain/package.json` declares runtime dependencies only on:

- `@repo/core`
- `zod`

This matches the documented boundary. The package exports are explicit and
subpath-based, not wildcard-based.

### App Data Spine Is Directionally Correct

The current spine:

```text
Northstar fixture
  -> getDealOperationalCenter()
  -> DealOperationalCenterDTO
  -> route adapters
  -> kit components
```

is the right shape for a fixture-backed, read-only vertical. It gives future
backend work a replacement point behind the service without forcing `kit` to
know about Prisma, auth, tRPC, route loaders, or persistence.

The audit does not recommend refactoring React Server Component route loading
through tRPC for symmetry. The documented current boundary is service-first:
App Router routes call app services directly, and tRPC is an adapter for
client/API and future mutation boundaries.

## Findings

### 1. Reusable Readiness Logic Lives In `apps/web`

**Severity:** Medium  
**Primary file:** `apps/web/server/deals/operational-center-readiness.ts`

This file defines private-markets readiness semantics that are broader than a
route adapter:

- readiness dimensions
- blocker-type grouping
- blocker severity priority
- KYC/KYB source-state rules
- signature source-state rules
- wire source-state rules
- document source-state rules
- capital reconciliation source-state rules
- vehicle setup source-state rules
- investor-level readiness combination

Representative snapshot locations:

- `operational-center-readiness.ts:22` defines the service-facing readiness
  derivation.
- `operational-center-readiness.ts:37-80` defines the readiness dimensions and
  blocker type groupings.
- `operational-center-readiness.ts:149-208` defines reusable status-to-readiness
  maps.

#### Rationale

These rules decide workflow truth, not presentation. In private-markets
operations, readiness state affects whether a close can proceed, whether an
investor is blocked, and whether finance/compliance/legal work remains. That
meaning should be stable across:

- server DTO assembly
- route adapters
- kit stories
- future backend services
- tRPC procedures
- future mutation guards
- tests

Keeping these maps in `apps/web` makes `apps/web` a shadow domain package. It
also makes drift likely because other app adapters already re-derive related
states differently.

#### Recommended Direction

Promote a pure domain module, for example:

```text
packages/domain/src/operations/
  readiness.ts
```

or focused modules under existing contexts:

```text
packages/domain/src/deals/readiness-dimensions.ts
packages/domain/src/commitments/investor-readiness.ts
```

The promoted API should return structured states and reason tags, not route
labels:

```ts
type OperationalReadinessState =
  | 'not_started'
  | 'ready'
  | 'attention'
  | 'blocked'

type ReadinessReason =
  | { readonly _tag: 'IdentityBlocked' }
  | { readonly _tag: 'SignaturePending' }
  | { readonly _tag: 'WireUnmatched' }
  | { readonly _tag: 'RequiredDocumentRejected' }
```

`apps/web` should then map those tags into labels, summaries, and kit props.

### 2. Route Adapters Duplicate And Diverge From Domain Semantics

**Severity:** Medium  
**Primary files:**

- `apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts`

The commitments table and inspector adapters duplicate readiness semantics for:

- KYC/KYB status groupings
- signature status tones
- wire status tones
- reconciliation labels and states
- investor status summaries

Representative snapshot locations:

- `deal-commitments-table-adapter.ts:108` starts table KYC/KYB readiness mapping.
- `deal-commitments-table-adapter.ts:208` maps wire readiness.
- `deal-commitments-table-adapter.ts:258` maps reconciliation readiness.
- `deal-commitments-table-adapter.ts:422-426` defines identity status buckets.
- `deal-commitment-inspector-adapter.ts:74-108` redefines status tones.
- `deal-commitment-inspector-adapter.ts:283` starts inspector KYC/KYB readiness
  mapping.
- `deal-commitment-inspector-adapter.ts:392` maps reconciliation readiness.

There is already behavioral drift:

- server readiness treats `wireStatus: 'matched'` as attention because matched is
  not fully reconciled
- UI surfaces map `matched` as received/success in places

#### Rationale

Duplicated status interpretation creates subtle product bugs. A private-capital
workspace cannot safely show one surface as "ready" while another surface says
"attention" for the same underlying operational fact.

The route adapters are allowed to translate and format state for a specific
component. They should not decide the canonical operational meaning of a status.

#### Recommended Direction

Create domain helpers that answer questions such as:

```ts
getIdentityReadiness(...)
getSignatureReadiness(...)
getWireReadiness(...)
getCommitmentReconciliationReadiness(...)
getInvestorOperationalReadiness(...)
```

These helpers should return stable semantic results. `apps/web` can then map:

```text
domain semantic state -> kit variant/tone/label
```

This keeps route adapters render-focused while preserving one source of truth.

### 3. Capital And Economics Invariants Are Enforced In `apps/web`

**Severity:** Medium  
**Primary file:** `apps/web/server/deals/operational-center-validation.ts`

The app service validation layer currently enforces business invariants such as:

- gross committed equals net investable amount plus fees
- matched amount must not exceed received amount
- unmatched received equals received minus matched
- target-position deltas match target and committed amounts
- forbidden capital fields such as `financeAcceptedCapital` must not appear

Representative snapshot locations:

- `operational-center-validation.ts:93` starts capital validation.
- `operational-center-validation.ts:118` validates the economics invariant.
- `operational-center-validation.ts:137` validates matching.
- `operational-center-validation.ts:171` validates target position.
- `operational-center-validation.ts:415` lists forbidden finance-accepted fields.

`@repo/domain/reconciliation` already owns related capital-stage vocabulary and
stage-order calculations.

#### Rationale

Financial invariants are high-risk. If they live only in an app DTO validator,
future backend services, import tools, mutation procedures, or kit stories can
recompute or validate them differently.

The app boundary should validate that its DTO is serializable and internally
well-formed. The domain package should own reusable financial meaning and exact
money rules.

#### Recommended Direction

Split the current validation responsibilities:

Domain should own:

- capital stage ordering
- matched/received/signed/committed amount invariants
- target-position derivation
- unmatched received derivation
- finance-accepted vs matched-but-not-accepted semantic predicates
- structured financial invariant errors

`apps/web` should own:

- JSON-safe DTO shape checks
- route DTO serialization checks
- date string format checks for app-owned DTO fields
- detection that app DTOs did not accidentally expose unsafe/private fields

### 4. Finance-Acceptance Semantics Are In App Helpers

**Severity:** Medium  
**Primary file:** `apps/web/app/deals/[dealId]/deal-operational-capital-helpers.ts`

This file defines:

- `isFinanceAcceptedInvestor`
- `isMatchedPendingFinanceAcceptance`

Representative snapshot locations:

- `deal-operational-capital-helpers.ts:85`
- `deal-operational-capital-helpers.ts:88`

These predicates combine commitment lifecycle state and wire operational status.

#### Rationale

The question "is this investor finance accepted?" is not a UI formatting
question. It is a domain interpretation of multiple operational workflows.
Keeping it in an app helper makes it easy for another surface to define the same
phrase differently.

#### Recommended Direction

Move the predicates into `@repo/domain/commitments` or
`@repo/domain/reconciliation`, depending on the final naming:

```ts
isFinanceAcceptedCommitment(...)
isMatchedPendingFinanceAcceptance(...)
getCommitmentFinanceAcceptanceState(...)
```

The return value should be a semantic state, not English copy:

```ts
type FinanceAcceptanceState =
  | 'not_started'
  | 'pending_wire'
  | 'matched_pending_acceptance'
  | 'accepted'
  | 'exception'
```

### 5. Document Semantics Are Duplicated And Inconsistent

**Severity:** Medium  
**Primary files:**

- `packages/domain/src/documents/document-requirements.ts`
- `apps/web/app/deals/[dealId]/deal-documents-evidence-adapter.ts`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts`

The domain package maps document requirement statuses to tones:

- `document-requirements.ts:77`

The documents route adapter redefines status labels and tones:

- `deal-documents-evidence-adapter.ts:39`
- `deal-documents-evidence-adapter.ts:48`

The commitment inspector also redefines document labels/ranks:

- `deal-commitment-inspector-adapter.ts:110`
- `deal-commitment-inspector-adapter.ts:145`

There is already drift:

- domain maps `expired` to `danger`, while the documents evidence adapter maps it
  to `attention`
- domain maps `missing` to `attention`, while the documents evidence adapter maps
  it to `danger`

#### Rationale

Different tones may be acceptable at the component rendering layer only if they
are intentionally visual variants. They are risky if they reflect inconsistent
domain severity. Missing or expired required documents can block closing, so the
domain should expose the underlying semantic impact.

#### Recommended Direction

Keep translated labels in `apps/web`, but move reusable document semantics into
domain:

```ts
getDocumentRequirementStatusImpact(...)
isRequiredDocumentIssue(...)
summarizeDocumentCompleteness(...)
rankDocumentRequirementStatus(...)
```

The app can still map domain impact to a kit-specific tone:

```text
domain impact -> route visual tone
```

### 6. Blocker Prioritization Is Split Across Domain And App

**Severity:** Medium  
**Primary file:** `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts`

The app helper currently owns:

- selecting priority blockers
- unresolved severity counts
- blocker summary assumptions
- required-document issue counting
- due-date label selection

Representative snapshot locations:

- `deal-operational-blocker-helpers.ts:8`
- `deal-operational-blocker-helpers.ts:50`
- `deal-operational-blocker-helpers.ts:65`
- `deal-operational-blocker-helpers.ts:79`

`@repo/domain` already owns blocker severity, blocker type, owner, counts, and
unresolved blocker helpers.

#### Rationale

Some of this is route-specific and should remain in `apps/web`. For example,
"about-route blockers first" is a navigation decision because it depends on
`routeHint`.

Other parts are reusable domain semantics:

- unresolved severity counts
- severity priority
- whether a required document is an issue
- whether a blocker should block closing

If these stay in app code, other surfaces can sort or count blockers
inconsistently.

#### Recommended Direction

Split the helper:

Domain should own:

- severity rank
- unresolved counts
- close-blocking status
- required-document issue semantics

`apps/web` should own:

- route-specific ordering using `routeHint`
- copy such as "Capital and timing blockers are shown first"
- due-date label formatting

### 7. DTO Graph Integrity Is Validated Only In App Code

**Severity:** Medium  
**Primary files:**

- `apps/web/server/deals/operational-center-validation.ts`
- `apps/web/server/deals/operational-center-dto.ts`
- `packages/domain/src/ids.ts`

The app validator checks references between:

- investors
- blockers
- documents
- document groups
- activity events

Representative snapshot locations:

- `operational-center-validation.ts:203` starts dangling-reference validation.
- `operational-center-validation.ts:302` builds reference candidates.
- `operational-center-dto.ts:149` keeps many IDs as raw strings.

`@repo/domain` already owns branded UUID ID schemas, but the current
Northstar/demo data uses raw string IDs such as `inv-alba` and
`deal-northstar-energy`, not UUID-backed branded IDs.

#### Rationale

Relationship integrity is domain-shaped. It is not just a serialization detail:
a blocker that points to a missing investor or document is invalid operational
data.

However, the current fixture uses human-readable IDs, and the current DTO is an
app read model. A full promotion should be deliberate so the repo does not
prematurely force all demo IDs into production-grade UUIDs.

#### Recommended Direction

Introduce a small domain graph-validation helper that can work over branded IDs
or generic string IDs:

```ts
validateOperationalReferenceGraph(...)
```

Return structured graph errors:

```ts
type OperationalGraphError =
  | { readonly _tag: 'DanglingInvestorReference'; readonly id: string }
  | { readonly _tag: 'DanglingDocumentReference'; readonly id: string }
  | { readonly _tag: 'DanglingBlockerReference'; readonly id: string }
```

Keep app-specific DTO path reporting in `apps/web`.

### 8. Domain Public API Exposes Fixtures

**Severity:** Low  
**Primary files:**

- `packages/domain/src/reconciliation/index.ts`
- `packages/domain/src/reconciliation/fixtures.ts`
- `packages/domain/src/index.ts`

The reconciliation subpath exports:

- `PaymentRecordFixtures`
- `ReconciliationFixtures`
- `paymentRecordFixtures`
- `reconciliationFixtures`

The root barrel re-exports them too.

Representative snapshot locations:

- `reconciliation/index.ts:1`
- `reconciliation/index.ts:2`
- `reconciliation/fixtures.ts:21`
- `reconciliation/fixtures.ts:59`
- `index.ts:158-175`

#### Rationale

Fixtures are useful for tests and stories, but including them in the stable
runtime API makes sample data part of the domain contract. That can blur the
line between reusable domain rules and demo/test data.

This is a lower-risk issue than app leakage because the fixtures do not import
app code. Still, it should be cleaned up before treating `@repo/domain` as a
stable shared package.

#### Recommended Direction

Move fixtures to a test/story-only subpath or test directory:

```text
packages/domain/src/reconciliation/test-fixtures.ts
packages/domain/src/reconciliation/fixtures.test-support.ts
```

Options:

- stop exporting fixtures publicly
- expose them only under an explicit test support subpath
- move story/demo fixtures into `packages/kit` or `apps/web` where they are
  consumed

### 9. Domain Exposes Presentation-Adjacent Labels And Tones

**Severity:** Low to Medium, depending on desired strictness  
**Primary files:**

- `packages/domain/src/status-tone.ts`
- `packages/domain/src/commitments/commitment-lifecycle.ts`
- `packages/domain/src/commitments/investor-operations.ts`
- `packages/domain/src/deals/deal-lifecycle.ts`
- `packages/domain/src/deals/deal-readiness.ts`

The domain package exports:

- `StatusTone`
- lifecycle label helpers
- operational status label helpers
- readiness `nextActionLabel`

Representative snapshot locations:

- `status-tone.ts:1`
- `commitment-lifecycle.ts:79`
- `commitment-lifecycle.ts:100`
- `investor-operations.ts:111`
- `investor-operations.ts:147`
- `deal-lifecycle.ts:57`
- `deal-lifecycle.ts:74`
- `deal-readiness.ts:20`
- `deal-readiness.ts:28`

#### Rationale

Semantic tones can be an acceptable compromise if they are treated as structured
domain severity tags rather than UI component variants. English labels are more
clearly presentation-adjacent.

The domain docs say domain schemas and helpers should not own user-facing
translated copy. They should prefer stable message keys or structured tags.

The current labels are convenient, but they can conflict with i18n ownership in
`apps/web`.

#### Recommended Direction

Prefer:

```ts
getDealLifecycleMessageKey(state)
getCommitmentLifecycleMessageKey(state)
getClosingReadinessNextActionKey(state)
```

or return structured tags:

```ts
{ readonly _tag: 'ResolveCriticalBlockersBeforeClose' }
```

Then let `apps/web` translate or label them.

For tones, decide whether `StatusTone` is a domain semantic impact or a design
system concern:

- if semantic, keep it but document that it is not a UI token
- if visual, move tone mapping to `kit` or `apps/web`

### 10. Boundary Enforcement Is Too Weak

**Severity:** Medium  
**Primary files:**

- `package.json`
- `biome.json`
- `tsconfig.json`
- `packages/ui/scripts/check-styles-contract.mjs`
- `packages/kit/scripts/check-kit-contract.mjs`

Current enforcement:

- root lint runs Biome
- Biome catches general correctness/style issues
- UI has a custom contract script
- kit has a custom contract script
- domain has no equivalent contract script
- no dependency-cruiser, Nx constraints, or ESLint restricted-import policy
- root `tsconfig.json` broadly includes `apps` and `packages`

Representative snapshot locations:

- `package.json:14`
- `biome.json:58`
- `tsconfig.json:15`
- `packages/ui/scripts/check-styles-contract.mjs:19`
- `packages/kit/scripts/check-kit-contract.mjs:22`

#### Rationale

The current domain package is clean mostly because its manifest is clean and
contributors have followed the architecture. That is not enough for a growing
repo. If someone adds `@repo/ui`, React, or Next to `packages/domain`, there is
no policy-level guardrail stopping the regression.

Architecture that matters should fail in CI.

#### Recommended Direction

Add a domain contract script modeled after the existing UI/kit scripts.

It should scan `packages/domain/src` and fail on:

- `react`
- `react-dom`
- `next`
- `next-intl`
- `server-only`
- `@repo/ui`
- `@repo/kit`
- `@repo/web`
- `@/`
- `apps/`
- CSS imports
- Tailwind class/config imports
- tRPC
- Prisma/database clients
- browser globals where practical

Then wire it into the domain package:

```json
{
  "scripts": {
    "lint": "biome check ./src && node scripts/check-domain-contract.mjs"
  }
}
```

Longer-term, add a workspace-level dependency boundary tool such as
dependency-cruiser or ESLint restricted imports.

## Recommended Remediation Plan

### Phase 1: Add Guardrails First

Add `packages/domain/scripts/check-domain-contract.mjs`.

This is the highest leverage first step because it prevents new violations
while the existing leaks are being promoted deliberately.

Acceptance criteria:

- domain lint fails if `packages/domain/src` imports React, Next, app code, UI,
  kit, tRPC, Prisma, CSS, or app aliases
- CI/root lint runs the domain contract through package lint
- guardrail has one or two test fixtures or a clear failure example documented

### Phase 2: Promote Operational Readiness Semantics

Move reusable readiness maps and combination logic out of
`apps/web/server/deals/operational-center-readiness.ts`.

Acceptance criteria:

- one domain helper derives investor readiness from identity/signature/wire
  state and blockers
- one domain helper derives deal/closing readiness dimensions from blockers,
  documents, capital, investors, and vehicle setup inputs
- app code supplies route labels after domain returns structured states
- table and inspector adapters consume the same domain-derived semantic state

### Phase 3: Promote Finance And Reconciliation Predicates

Move finance acceptance, matched-pending-finance, and capital invariant helpers
into `@repo/domain`.

Acceptance criteria:

- app adapters no longer define finance acceptance semantics
- app validation delegates financial invariant checks to domain helpers
- tests cover `matched`, `reconciled`, `received`, `unmatched`, `returned`, and
  `failed` combinations
- domain returns structured errors; app maps errors into DTO output union

### Phase 4: Normalize Document And Blocker Semantics

Move reusable document issue and blocker severity/rank helpers into domain.

Acceptance criteria:

- required-document issue counting is domain-owned
- document impact/severity is domain-owned
- blocker severity rank is domain-owned
- route-specific blocker ordering by `routeHint` remains app-owned
- app labels remain in app

### Phase 5: Clean Domain Public API

Decide whether fixtures, labels, and tones belong in stable domain exports.

Acceptance criteria:

- reconciliation fixtures are no longer part of the root production API, or they
  are explicitly documented as test support
- English label helpers are replaced with message keys or structured tags, or
  an ADR explicitly accepts them as temporary convenience
- `StatusTone` is classified as either semantic domain impact or presentation
  mapping, with ownership documented

### Phase 6: Add Workspace Boundary Enforcement

Introduce an import boundary tool beyond ad hoc scripts.

Candidate rule set:

```text
packages/core:
  may not import workspace product packages

packages/domain:
  may import @repo/core and zod only
  may not import React, Next, UI, kit, app code, tRPC, Prisma, CSS

packages/ui:
  may import React and UI infrastructure
  may not import domain, kit, app code, next-intl

packages/kit:
  may import core, domain, ui, icons/motion/chart libs
  may not import app code, tRPC, route loaders, auth, database, Next routing

apps/web:
  may import all workspace packages
  should not define canonical domain status semantics when domain helpers exist
```

## What Not To Do

Do not move the Northstar app fixture into `@repo/domain`. The fixture is app
vertical data and belongs in `apps/web/server/deals/fixtures` until there is a
real shared mock-data use case.

Do not refactor RSC route loading through tRPC for symmetry. Current docs state
that App Router routes call app services directly; tRPC is an API/client
adapter over the same services.

Do not introduce a large generic repository abstraction just to clean this up.
Repository ports become useful when replacing fixture reads with persistence.
This audit is about domain semantics and package boundaries.

Do not add XState just because workflow vocabulary exists. The current next step
is pure domain reducers/validators and consistent state derivation. XState is
only justified when the app needs explicit events, guarded transitions, async
effects, replay/reconciliation, or parallel state orchestration.

Do not move route labels or translated copy into domain. Domain should return
semantic tags and stable keys; `apps/web` owns the user-facing text.

## Ownership Matrix

| Concern | Owner | Rationale |
|---|---|---|
| `EuroCents`, parsing, exact arithmetic | `@repo/domain` | Financial correctness must be shared and exact. |
| Capital stage ordering | `@repo/domain` | Reconciliation semantics are reusable beyond one route. |
| JSON-safe money DTOs | `apps/web` | Serialization is app/API boundary work. |
| Deal lifecycle state union and transitions | `@repo/domain` | Workflow truth must be shared. |
| Route tab labels | `apps/web` | Navigation copy is route presentation. |
| Northstar fixture | `apps/web` | It is canonical app vertical data, not reusable domain data. |
| Closing blocker severity/type/owner | `@repo/domain` | Shared vocabulary and validation. |
| Route-specific blocker ordering | `apps/web` | Depends on route layout and `routeHint`. |
| Required-document issue semantics | `@repo/domain` | Reusable close-readiness rule. |
| Document group descriptions | `apps/web` | Route/product copy and IA. |
| Investor readiness state | `@repo/domain` | Combines reusable workflow statuses and blockers. |
| Kit row variants | `apps/web` or `kit` | Rendering contract, not domain truth. |
| User-facing labels/translations | `apps/web` | App owns i18n and locale context. |
| tRPC routers | `apps/web` | API adapter over app services. |
| Prisma/database models | future app/backend layer | Persistence is not a domain package dependency. |

## Future Review Checklist

Use this checklist before adding a new deal/compliance/reconciliation workflow:

- Does the new code define a status union, transition, invariant, or predicate?
  If yes, start in `@repo/domain`.
- Does the new code format labels, choose route sections, or map into kit props?
  If yes, keep it in `apps/web`.
- Does the new code need React, Next, `next-intl`, tRPC, or a database client?
  If yes, it does not belong in `@repo/domain`.
- Does a route adapter re-map a status already mapped elsewhere?
  If yes, promote the semantic mapping to domain and consume it in both places.
- Does a calculation involve money, stage ordering, or reconciliation?
  If yes, keep the calculation in domain and serialize the result in app code.
- Does a fixture represent canonical app demo data?
  If yes, keep it in `apps/web`, not domain.
- Does a fixture support package tests only?
  If yes, keep it as package-local test support, not root production exports.
- Would the rule also matter to a future backend mutation guard?
  If yes, it probably belongs in domain.

## Final Assessment

The repository is pointed in the right direction. `@repo/domain` is currently
clean at the dependency/import level, and `apps/web` has a sensible app service
and DTO seam.

The main risk is semantic drift: reusable private-markets rules have started to
accumulate in `apps/web` because the Northstar vertical moved quickly and needed
route-ready behavior. That was reasonable for the first slice, but it should not
be allowed to harden into the architecture.

The next engineering move should be conservative:

1. add a domain contract guardrail
2. promote the most duplicated readiness/reconciliation predicates
3. leave app-specific DTO assembly and labels in `apps/web`
4. document any remaining presentation-adjacent domain exports as explicit
   decisions or remove them from the stable API

That will keep the shared domain package useful, small, testable, and safe
without turning it into a mock database or a UI abstraction.
