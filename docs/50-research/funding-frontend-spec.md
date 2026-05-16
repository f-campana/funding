# Funding — Frontend Architecture Specification

**Status:** Draft · v1.0  
**Scope:** Authenticated platform (app.funding.example) and entry-point surfaces  
**Audience:** Engineering team · First frontend-leaning hire · Future contributors  
**Last updated:** April 2026

---

## 0. Preamble

This document centralises the architectural decisions, their rationale, and the constraints
that should govern the Funding frontend. It is not a style guide or a component library
reference. It is the foundational contract that answers "why did we build it this way?" before
anyone asks.

Every decision recorded here was made in the context of one overriding constraint: **this
platform handles real money moving between real legal entities**. A rounding error, a missed
state, a stale UI, or a silent auth failure is not a UX bug — it is a financial or legal risk.
That constraint shapes every architectural choice below.

---

## 1. Product Surface Map

Before architecture, a precise understanding of what we are building.

### 1.1 Surfaces

| Surface | URL | Nature | Primary users |
|---|---|---|---|
| Core platform | `app.funding.example` | Authenticated SPA | Deal leads, fund managers, investors, admins |
| Investor entry | `app.funding.example/deal/:id` | Public-facing, SSR-eligible | Investors landing from a deal invitation |
| FATCA generator | `fatca.funding.example` | Standalone tool | Investors completing regulatory forms |
| Marketing / docs | `funding.example` | Static / SSG | Prospective customers |

### 1.2 Core modules (inside the authenticated platform)

- **Deal flow** — creation, commitment tracking, KYC/KYB pipeline, e-signature, fund collection, SPV incorporation
- **Community** — investment clubs, membership management, deal sharing, in-app discussions
- **Fund-as-a-Service** — LP onboarding, capital calls, distributions, valuations, investor reporting
- **Investor portfolio** — deal discovery, portfolio dashboard, secondary market
- **Cap table engine** — fractional ownership tracking across thousands of investors with cent-level precision
- **Data room** — document storage, presigned URL delivery, legal audit trail
- **Compliance** — per-jurisdiction investor qualification, FATCA/KYC status management

### 1.3 Customer segments

Seven distinct user types with significantly different UI surfaces: founders, deal leads,
fund managers, investors, family offices, investment funds, private banks (white-label).
The platform must serve all of them from one codebase — the configurable platform problem
(see §8).

---

## 2. Rendering Architecture — SPA with a targeted SSR surface

### 2.1 Decision

The authenticated platform (`app.funding.example`) is a **Single Page Application built with
Vite + React**. There is no server-side rendering of authenticated routes.

The investor entry surface (a deal invitation landing page) is an **SSR-eligible route**,
implemented separately or as a distinct Next.js surface. The marketing site is statically
generated (SSG).

### 2.2 Rationale

**Why SPA for the authenticated platform:**

All content behind the authentication wall is private, user-specific, and real-time. The two
primary value propositions of SSR — SEO and first-load performance for cold public content —
are structurally irrelevant to an authenticated dashboard. A search crawler cannot index an
investor's cap table and should not.

The interaction model is application-like, not document-like. Expanding investor rows,
watching a commitment donut animate, filtering a compliance table, watching KYC status update
in real-time — this is all client-side interaction. Rendering it on the server first produces
a stale HTML snapshot that is immediately replaced by live data. The SSR cost is incurred for
no benefit.

**Why SSR for the investor entry surface:**

A deal invitation link is shared externally — email, WhatsApp, LinkedIn. An investor landing
on it for the first time may be on a mobile device with an unpredictable connection. First
load performance matters here in a way it does not for deal leads who are on the platform
daily. The content (deal summary, terms overview) can be pre-rendered server-side.

**Precedent:** Swan (the closest architectural reference in European fintech) made the same
split: Vite SPA for the authenticated banking client, separate surface for onboarding flows.
Their own router, Chicane, was built for the SPA. No SSR inside the authenticated product.

### 2.3 Infrastructure

The SPA is served as a static bundle from GCS behind Cloud Run. The Node server layer
handles OAuth session cookie management and API proxying — it does not render HTML. Session
tokens live in HttpOnly cookies set by the server, never in localStorage.

---

## 3. Tech Stack

Every item in this stack was chosen deliberately. The rationale for each is recorded below
so that future hires understand why, not just what.

### 3.1 Full stack

| Layer | Technology | Rationale |
|---|---|---|
| Language | TypeScript (strict, no `any`) | Financial domain requires maximum type safety. `any` is a financial liability. |
| Monorepo | pnpm workspaces + Turborepo | Shared domain libraries, build caching, consistent tooling across 20+ packages. |
| Frontend framework | React + Next.js (App Router) | RSC for entry surfaces; client-only rendering for authenticated routes. |
| Bundler (SPA) | Vite | Fast dev loop, native ESM, no config overhead. |
| API layer | tRPC + Nexus | End-to-end type safety without codegen. Router types flow directly to the client. |
| Database | PostgreSQL + Prisma | Relational model with strong typing. Multi-tenant event log. |
| Queue | BullMQ + Redis | Async pipelines (KYC checks, wire confirmations, notification dispatch). |
| Styling | Tailwind CSS + custom design tokens | Token architecture enables per-client theming (see §8). |
| Components | Shadcn / Radix UI | Headless, accessible primitives. Styling is our own — not a UI kit. |
| Forms | React Hook Form | Isolated form state. Complex multi-step flows with per-step Zod validation. |
| Data grids | TanStack Table + TanStack Virtual | High-performance rendering for investor lists and cap tables at scale. |
| Testing | Vitest + Playwright + React Testing Library | Unit/integration + E2E + component-level. |
| Linting | Biome | Replaces ESLint + Prettier. Faster, opinionated. |
| Observability | Datadog + Sentry + OpenTelemetry | Browser performance, error tracking, distributed tracing from day one. |
| AI pipelines | Anthropic (Claude) | Document analysis, data extraction from uploaded KYC/KYB documents. |
| Cloud | GCP — Cloud Run + GCS | Container-based, scalable, consistent with existing infra. |

### 3.2 tRPC migration context

The platform is in active migration from GraphQL (Apollo) to tRPC. This is a live production
migration, not a greenfield decision. Both clients coexist during the transition period.

**Migration protocol:**
- New features are built on tRPC only
- Existing features migrate one bounded context at a time
- The Apollo client is removed when all queries are migrated
- During coexistence: mutations on tRPC must explicitly invalidate any Apollo cache
  entries for the same entities

**Key tradeoff — loss of normalized cache:** Apollo stored entities by `id + __typename`.
TanStack Query caches by query key. The same investor can exist in multiple cached
responses simultaneously. Discipline around query key design replaces the automatic
normalization. Bounded contexts map to query key namespaces:

```ts
// Query key conventions
['deals', dealId]                     // deal root
['deals', dealId, 'investors']        // investor list for a deal
['deals', dealId, 'investors', id]    // single investor detail
['funds', fundId, 'lps']              // LP list for a fund
['kyc', investorId]                   // KYC status
```

Mutation success handlers must invalidate all affected keys, not just the root query.

**Type safety during migration:** Apollo types are generated from the GraphQL schema. tRPC
types are inferred from the router. The coexistence period introduces two trust levels. All
tRPC procedures must have Zod validators at the boundary before the corresponding Apollo
types are removed. The schema was the contract — Zod becomes the contract.

---

## 4. State Management — Layered by Category

The wrong frame is "which state manager". The right frame is "which category of state, and
what is the right tool for each". Mixing server state into UI state stores, or letting form
state escape into global stores, is the source of most state management debt. The boundary
must be explicit and hard.

### 4.1 Layer map

```
Server state             →  tRPC + TanStack Query
Real-time event stream   →  tRPC subscriptions → XState
SPV / fund lifecycle     →  XState
Form state               →  React Hook Form
UI state                 →  Zustand
Domain rendering logic   →  ts-pattern
```

### 4.2 Server state — tRPC + TanStack Query

All data that lives on the server, changes out of band, and needs cache management flows
through TanStack Query via the tRPC adapter. This includes: deal data, investor lists, cap
table entries, KYC status, fund NAV, community membership.

Key disciplines:
- Query keys follow the namespace convention defined in §3.2
- `staleTime` should be set per query based on the expected change frequency of the data
  (deal terms: long; KYC status: short; portfolio valuations: medium)
- Optimistic updates are permitted but must be reconciled against the event stream (§5.3)
- No server-derived data ever enters Zustand

### 4.3 SPV and fund lifecycle — XState

The SPV lifecycle and fund lifecycle are not simple UI toggles. They are finite state
machines with defined states, guarded transitions, and side effects. XState makes these
machines explicit, typed, and testable without a DOM.

**SPV states:**
```
draft → open → kyc_in_progress → e_signatures → collecting → incorporated → closed
```
Guarded transitions examples:
- `open → kyc_in_progress` only if at least one investor has committed
- `kyc_in_progress → e_signatures` only if all committed investors have completed KYC
- `collecting → incorporated` only after wire confirmation received

The machine encodes the backend's aggregate invariants as guard conditions. The UI never
presents an action the backend would reject. This is not validation duplication — it is
defensive UX design.

XState is scoped to these lifecycle machines only. It does not replace Zustand for general
UI state and does not replace TanStack Query for server state.

**With tRPC subscriptions (v11+):**
```ts
trpc.deals.events.useSubscription({ dealId }, {
  onData: (event) => dealMachine.send(event),
})
```
Backend domain events drive machine transitions directly. The machine's current state is a
live projection of the event stream.

### 4.4 UI state — Zustand

Expanded table rows, collapsed sidebar sections, active tabs, open modals, filter selections,
theme preference. State that is local to the session, not persisted, not shared with the
server.

Zustand is chosen over React Context for global UI state because:
- No provider tree to maintain
- Direct store access from anywhere without component hierarchy coupling
- Minimal boilerplate
- Selective subscription prevents unnecessary re-renders

Hard rule: **no server data in Zustand**. If a piece of state could be described as "the
current value of X from the server", it belongs in TanStack Query.

### 4.5 Form state — React Hook Form

Multi-step deal creation, KYC submission, fund launch wizard, investor commitment flow.
All form state is isolated to the form component tree. It never becomes global state.

Canonical Zod schemas live in `packages/domain` so the same validation contract is shared
by the form, tRPC procedures, tests, and any future admin/import surfaces. Form components
may define local step adapters or presentation-specific refinements, but they must compose
the canonical domain schemas rather than redefine the domain contract. Submission handlers
call tRPC mutations and are responsible for invalidating relevant query keys on success.

### 4.6 Real-time strategy — per-domain latency requirements

Not all data requires a persistent connection. Running WebSocket connections for data that
changes quarterly wastes resources and complicates connection lifecycle management.

| Data category | Latency requirement | Strategy |
|---|---|---|
| New commitment received | Seconds | tRPC subscription |
| Wire confirmation | User is watching | tRPC subscription |
| KYC status update | Minutes acceptable | `refetchInterval: 30_000` |
| SPV state transitions | Seconds | tRPC subscription → XState |
| Fund NAV | Daily / on trigger | Manual invalidation |
| Deal terms | Static after creation | No polling |

---

## 5. Domain Correctness — ts-pattern

### 5.1 Decision

`ts-pattern` is used throughout the codebase for pattern matching on domain types. It is
not optional for code paths that handle SPV states, event types, investor qualification
types, KYC statuses, or instrument types.

### 5.2 Rationale

With an event-sourced backend (§6), domain events arrive as discriminated unions. Every
component that renders based on event type or entity state needs exhaustive handling.
`switch` statements do not enforce exhaustiveness at compile time. `ts-pattern` with
`.exhaustive()` does.

Adding a new SPV state or a new event type to the backend becomes a compiler error across
every frontend handler that didn't account for it. On a platform where a missed state
could show an investor incorrect information about the status of their money, this is not
ergonomics — it is correctness.

### 5.3 Usage patterns

**SPV state rendering:**
```ts
match(spv.status)
  .with('draft',           () => <DraftBanner />)
  .with('open',            () => <CommitmentProgress />)
  .with('kyc_in_progress', () => <KycTracker />)
  .with('e_signatures',    () => <SignatureTracker />)
  .with('collecting',      () => <FundCollection />)
  .with('incorporated',    () => <ClosedSummary />)
  .with('closed',          () => <ArchiveSummary />)
  .exhaustive()
```

**Frontend event projection (event sourcing):**
```ts
function applyEvent(state: DealState, event: SpvEvent): DealState {
  return match(event)
    .with({ type: 'CommitmentReceived' }, ({ payload }) =>
      addCommitment(state, payload))
    .with({ type: 'KycVerified' }, ({ payload }) =>
      markKycComplete(state, payload.investorId))
    .with({ type: 'WireReceived' }, ({ payload }) =>
      recordWire(state, payload))
    .with({ type: 'SpvIncorporated' }, ({ payload }) =>
      closeSpv(state, payload))
    .exhaustive()
}
```

**Multi-dimensional compliance rules:**
```ts
match([investor.qualification, investor.country] as const)
  .with(['professional', P.string],  () => renderProfessionalDisclaimer())
  .with(['informed', 'FR'],          () => renderFRInformedDisclaimer())
  .with(['informed', 'DE'],          () => renderDEInformedDisclaimer())
  .with(['retail', P.string],        () => renderRetailDisclaimer())
  .with(['non_eligible', P.string],  () => renderBlockedState())
  .exhaustive()
```

---

## 6. Event Sourcing — Frontend Implications

### 6.1 Backend model

The backend is event-sourced. The source of truth is an append-only log of domain events.
Current state is a projection over that log. Point-in-time queries replay events up to a
given timestamp. This is why historical reconstruction is a first-class architectural
concern, not a feature.

### 6.2 Frontend projection pattern

The frontend maintains a local projection of deal state, driven by events received via tRPC
subscriptions. The projection is a pure function from `(currentState, event)` to `nextState`.
This function is tested independently of React (§10.3).

The XState machine is the projection host. Events emitted by the backend feed directly into
machine transitions. The machine's current state is the authoritative local representation
of the deal's lifecycle.

### 6.3 Optimistic updates and reconciliation

Optimistic updates (applying expected outcome before server confirmation) must not be applied
directly to the projected event state. The pattern:

1. Apply the optimistic overlay as a transient React state layer on top of the committed machine state
2. Display the optimistic view immediately
3. When the real event arrives via subscription, discard the overlay and let the machine state take over
4. If the states agree (happy path), the visual transition is imperceptible
5. If they disagree (error, concurrency conflict), the machine state wins and the overlay is cleared with an error message

This prevents the committed event log from being corrupted by optimistic assertions that
were never confirmed.

### 6.4 Audit trail surface

The activity feed displayed in the deal page is a direct rendering of the event log, not a
derived "recent actions" table. Events are append-only, timestamped, and should be displayed
in chronological order without modification. Do not derive activity from state diffs — read
from the event log directly.

---

## 7. Money Representation

### 7.1 Decision

Financial amounts are represented as integers (eurocents or the smallest unit of the
relevant currency) at every layer boundary. **No financial arithmetic is performed on raw
JavaScript floating-point numbers.**

### 7.2 Rationale

IEEE 754 floating-point arithmetic cannot represent decimal values exactly.
`0.1 + 0.2 === 0.30000000000000004`. On a platform computing fractional ownership
percentages across thousands of investors with cent-level precision requirements, this is
not theoretical. A rounding error that propagates through a cap table calculation is a
financial error.

### 7.3 Implementation

**Type-level enforcement via `@repo/domain`:**
```ts
import {
  addEuroCents,
  euroCentsFromMinorUnits,
  euroCentsFromNumberMinorUnits,
  formatEuroCents,
  parseEuroCents,
} from '@repo/domain/money'

const amount = parseEuroCents('5 000,00 €')
const apiAmount = euroCentsFromNumberMinorUnits(500_000)

const fallback = euroCentsFromMinorUnits(0n)

const total = addEuroCents(
  amount.match({ Ok: (value) => value, Error: () => fallback }),
  apiAmount.match({ Ok: (value) => value, Error: () => fallback }),
)

const rendered = formatEuroCents(total, { locale: 'fr-FR' })
```

The branded type prevents passing a raw float where a monetary value is expected.
Money enters the system through safe constructors such as `parseEuroCents` or
`euroCentsFromNumberMinorUnits`, and exits through `formatEuroCents`. No UI code
performs monetary arithmetic directly.

**Currency scope:** v1 domain logic is EUR-only through `EuroCents`.
Multi-currency, FX conversion, and a future `Money<Currency>` generic are
explicitly deferred. If multi-currency support is introduced later, portfolio
totals that aggregate multi-currency positions require an explicit conversion
step with a declared exchange-rate source — this step must be visible in the
code and covered by a new ADR.

**API contract:** The backend sends amounts as integers or strings, never floats. If an
API response contains a float amount, the serialisation layer converts it to `EuroCents`
before the value enters the component tree.

**Rendering:** Every financial amount displayed in the UI passes through
`formatEuroCents` with an explicit locale parameter. Amounts are never rendered
as raw number strings.

---

## 8. The Configurable Platform Problem

### 8.1 The problem

The product roadmap requires transforming the platform into a fully parameterizable engine
supporting external funds with diverse structures. This means different clients — fund
managers, private banks, family offices — have:
- Different brand identities (colours, logo, typography)
- Different fee structures (carry percentages, entry fee logic)
- Different workflow step sequences (jurisdiction-specific compliance screens)
- Different feature access (not all clients have secondary market or fund administration)

This is frontend multi-tenancy. Getting the architecture wrong now means refactoring
everything when the first white-label client is signed.

### 8.2 Design token architecture — runtime injectable

Tailwind's JIT generates static CSS at build time. For per-client theming without separate
builds, the actual rendering layer must be CSS custom properties (`var(--color-primary)`),
with Tailwind tokens mapping to them.

The client configuration is fetched on authentication. It sets CSS custom properties on
`:root`. The interface re-themes without a page reload or a separate build.

```ts
// On auth success, apply client config
function applyClientTheme(config: ClientTheme) {
  const root = document.documentElement
  root.style.setProperty('--color-primary', config.brandColor)
  root.style.setProperty('--color-primary-fg', config.brandForeground)
  root.style.setProperty('--font-display', config.displayFont)
  // ...
}
```

Shadcn/Radix was chosen specifically because it is headless — components have no intrinsic
style that resists theming. The design system is ours, not the library's.

### 8.3 Feature flags — configuration over conditionals

Per-client feature availability must not appear as `if (clientType === 'private_bank')`
scattered through the codebase. Every such conditional is a future maintenance burden and
a source of untested code paths.

Feature access flows through a typed context:
```ts
const { hasFeature } = useClientConfig()

// Usage
if (!hasFeature('secondary_market')) return null
```

The feature flag set is defined in the client configuration returned by the server on auth.
Adding or removing a feature for a client is a server-side configuration change, not a
frontend deployment.

### 8.4 Workflow configuration — data-driven step sequences

Multi-step flows (KYC submission, deal creation, fund launch, investor commitment) must not
be implemented as hardcoded step arrays. Each step is a component registered by name. The
server sends the step sequence for the current client's context. The frontend renders the
sequence.

```ts
type StepConfig = {
  id: string
  component: keyof typeof stepRegistry
  validation: ZodSchema
  guard?: (context: FlowContext) => boolean
}

// The registry maps step IDs to components
const stepRegistry = {
  'kyc-identity':     KycIdentityStep,
  'kyc-address':      KycAddressStep,
  'kyc-fr-suitability': FrSuitabilityStep,  // FR-only step
  'kyc-de-qualified': DeQualifiedStep,       // DE-only step
  // ...
} satisfies Record<string, StepComponent>
```

Adding a jurisdiction-specific compliance step is a backend configuration change. No
frontend deployment required.

---

## 9. Internationalisation

### 9.1 Scope

The platform serves investors across EU member states. i18n is not just translated copy —
it has four distinct dimensions.

### 9.2 String translation

`react-i18next` with locale files. No hardcoded copy in component files. All user-facing
strings are keyed. The key namespace mirrors the bounded context structure:
`deals.commitment.status.signed`, `kyc.status.in_review`, etc.

### 9.3 Number and currency formatting

Every financial figure displayed in the UI uses `Intl.NumberFormat` with an explicit locale
parameter. The `formatEuro` function (§7.3) accepts locale as a required argument.

`482000.00` formats as:
- `482 000,00 €` in `fr-FR`
- `482.000,00 €` in `de-DE`
- `€482,000.00` in `en-GB`

The user's locale is determined on auth and stored in the client configuration context.

### 9.4 Date formatting

Dates with legal significance (closing deadlines, KYC expiry, signature timestamps) are
formatted with `Intl.DateTimeFormat` using explicit `{ day: '2-digit', month: 'long',
year: 'numeric' }` options — never numeric-only formats. `08/05/2026` is ambiguous across
locales. `8 May 2026` is not.

### 9.5 Legal and compliance copy

Investor qualification disclaimers, risk warnings, and regulatory disclosures are not
translation variants of the same string. They are different legal texts, keyed by
`(jurisdiction, qualification_type)`:

```
compliance.disclaimer.FR.professional
compliance.disclaimer.FR.informed
compliance.disclaimer.DE.professional
compliance.disclaimer.DE.informed
compliance.disclaimer.LU.professional
```

These are managed as a separate translation namespace, reviewed by legal, and never modified
by product changes to other copy.

---

## 10. Testing Strategy

### 10.1 Philosophy

The test suite reflects the financial stakes of the platform. Unit tests on components are
less valuable than correctness tests on domain logic. A test that validates a cap table
projection is worth more than ten snapshot tests.

### 10.2 Layer-by-layer approach

**XState machine tests (Vitest, no DOM):**
```ts
it('stays in kyc_in_progress if pendingKyc > 0 after KycVerified', () => {
  const nextState = dealMachine.transition(
    { value: 'kyc_in_progress', context: { pendingKyc: 2 } },
    { type: 'KycVerified', payload: { investorId: 'a' } }
  )
  expect(nextState.value).toBe('kyc_in_progress')
  expect(nextState.context.pendingKyc).toBe(1)
})
```

**Projection reducer tests (Vitest + fast-check):**
Property-based testing for financial projections. Generate arbitrary valid event sequences,
assert invariants:
- Total committed ≤ target at every state
- Ownership percentages sum to ≤ 100
- No investor appears twice in the cap table
- Wire amounts match committed amounts

**ts-pattern exhaustiveness:**
Tested at compile time. `tsc --noEmit` in CI is the test. Adding a new event type to the
union immediately surfaces every unhandled case in the pipeline.

**Component tests (Vitest + React Testing Library):**
Cover user-facing behaviour, not implementation details. Test that the commitment progress
displays correctly given a deal state, not that a specific CSS class is applied.

**E2E tests (Playwright):**
Cover full lifecycle flows, not page renders:
- Create deal → invite investors → complete KYC → verify SPV state transitions
- Investor commitment flow from landing to wire confirmation
- Fund launch wizard end-to-end

E2E tests run against a test environment with a seeded event log, not mocked data.

### 10.3 What we do not test

- Snapshot tests for component markup
- `any`-typed mock chains
- Tests that mock the thing being tested

### 10.4 Financial precision regression tests

A dedicated test suite covers the money layer specifically:
- `parseEuroCents` accepts supported investor-facing formats and rejects
  ambiguous formats
- `euroCentsFromNumberMinorUnits` rejects non-integer or unsafe numbers
- `addEuroCents` does not drift over large summations
- `formatEuroCents` produces locale-correct output for known amounts
- Cap table percentage allocations sum correctly across edge cases (fractional ownership,
  minimum ticket rounding)

---

## 11. Security

### 11.1 Authentication and session management

Session tokens live in HttpOnly, Secure, SameSite=Lax cookies set by the Node server layer.
They are never accessible to JavaScript and never stored in localStorage or sessionStorage.

The server handles the OAuth2 Authorization Code + PKCE flow. The SPA receives a session
cookie on the redirect callback — it never sees the access token directly.

### 11.2 Presigned URLs for documents

All documents (term sheets, subscription bulletins, SHA drafts, investor reports) are
stored in GCS with no public access. URLs are generated server-side on demand as short-lived
presigned URLs (TTL: 15 minutes). Document links are never stored in client state — they
are fetched fresh on each access.

### 11.3 Content Security Policy

A strict CSP header is applied to all responses. Notable directives:
- `default-src 'self'`
- `script-src 'self'` — no inline scripts, no `eval`
- `frame-src` — explicit allowlist for Yousign/DocuSign embedding
- `connect-src` — API origins only

Inline event handlers and `dangerouslySetInnerHTML` are prohibited except in the PDF
rendering surface with explicit `DOMPurify` sanitisation.

### 11.4 XSS surface

Investor-provided data (company names, addresses, UBO names) that is rendered in document
previews or deal pages passes through `DOMPurify` before rendering. The risk is low but
the consequence of a miss is high.

### 11.5 Audit trail integrity

The activity feed renders from an append-only event log. Events are not editable once
committed. The frontend never sends a "delete event" or "edit event" mutation — only new
events. The immutability is a backend guarantee; the frontend should never present UI that
implies mutability of past events.

---

## 12. Accessibility

### 12.1 Foundation

Shadcn/Radix provides accessible primitives: dialog focus trapping, dropdown keyboard
navigation, checkbox and radio ARIA states, tooltip ARIA descriptions. This is the floor,
not the ceiling.

### 12.2 Application-level patterns (our responsibility)

**Investor table with expandable rows:**
- `role="grid"` on the table, `role="row"`, `role="gridcell"` on cells
- `aria-expanded` on the expansion trigger
- Focus moves to the first interactive element inside the expanded detail on keyboard expansion
- Collapse on Escape

**Multi-step flows:**
- `aria-current="step"` on the active step indicator
- Focus moves to the first interactive element on step advance
- Previous step content is removed from the DOM, not hidden with `display: none`

**Live financial data:**
- `aria-live="polite"` on regions that update when commitment progress changes
- `role="status"` on KYC status updates
- `aria-atomic="true"` on financial figures that update as a unit

**Financial figures:**
- Abbreviated formats (`€482k`) use `aria-label="482 thousand euros"` for screen readers
- Full figures are always accessible even when abbreviated in the visual UI

**Error announcements:**
- Form validation errors use `role="alert"` or `aria-live="assertive"`
- API errors surface to a live region, not only visually

### 12.3 Target

WCAG 2.1 AA compliance. This is the minimum for a product serving EU investors under
emerging digital accessibility legislation.

---

## 13. Performance at Scale

### 13.1 Data volume context

- A Luxembourg SCSp fund can have hundreds of LPs
- A large syndicate can have 500+ investors
- A cap table view across a 20-investment portfolio can be thousands of rows
- Document libraries can grow to hundreds of files per deal

### 13.2 Virtualisation

TanStack Table + TanStack Virtual handle large lists. The DOM never contains more rows than
are visible in the viewport. Virtualisation is applied to the investor table, the cap table
view, the LP list, and the document library.

### 13.3 tRPC request batching

Multiple parallel tRPC procedure calls are batched into a single HTTP request. Without
batching, a page that initiates 5 parallel queries is 5 sequential waterfall requests in
the worst case. Batching is enabled at the tRPC client configuration level.

### 13.4 Pagination strategy

**Cursor-based pagination is preferred** over offset pagination for lists that receive
real-time insertions. A new commitment added at position 3 shifts every subsequent page
in offset pagination — investors navigating the table during a live deal would see
inconsistent pages. Cursor pagination is stable under insertions.

### 13.5 Code splitting

Seven customer segments with significantly different feature surfaces. Route-level code
splitting with `React.lazy` ensures that:
- A retail investor never loads the fund administration module
- A deal lead never loads the FATCA tool code
- The cap table engine loads only when the cap table route is accessed

Splitting granularity: per segment at the top level, per route within a segment. Below-route
splitting is applied only where bundle analysis shows a meaningful gain.

### 13.6 Bundle analysis

Bundle size is monitored in CI. A budget is set per route. Regressions that exceed the
budget block the PR. `rollup-plugin-visualizer` or equivalent provides the analysis surface.

---

## 14. Document and Signing Surface

### 14.1 Scope

The platform handles legal documents with financial and regulatory significance:
subscription bulletins, term sheets, SHA drafts, fund formation documents, investor reports,
FATCA certificates. This is not a file storage product — it is a legal document lifecycle
product.

### 14.2 Document delivery

All documents are delivered via short-lived presigned GCS URLs (§11.2). The UI displays
documents in an iframe or via PDF.js. Download is permitted but the URL itself is not
shareable — it expires before it could be meaningfully redistributed.

### 14.3 E-signature integration

Yousign (primary) or DocuSign for e-signatures. The frontend embeds the signing surface
via an iframe or a redirect flow. The critical architectural constraint: signature
completion is a backend event, not a frontend callback.

Flow:
1. Backend sends signature request to Yousign
2. Frontend renders Yousign iframe or redirect link
3. Investor signs
4. Yousign sends webhook to backend
5. Backend emits `DocumentSigned` event to the event log
6. Event arrives at the frontend via tRPC subscription
7. XState machine transitions to the next state

The frontend never assumes a signature is complete based on a UI interaction alone.
The event is the source of truth.

### 14.4 Document generation preview

Deal leads should be able to preview subscription bulletins before locking deal terms.
Preview generation is a server-side operation — the document is rendered from a template
with the current deal parameters. The frontend requests the preview, receives a presigned
URL, and displays it. Previews are non-signed, watermarked, and expire sooner than final
documents.

---

## 15. Decisions Still Open

These are areas where a decision has not been finalised and should be addressed early in
the first frontend-leaning hire's tenure.

| Decision | Context | Options |
|---|---|---|
| Money library | Branded `bigint` types vs. Dinero.js | Dinero adds serialisation helpers; branded types are lighter. Choose before any financial rendering is built. |
| Subscription transport | tRPC v11 subscriptions vs. SSE vs. WebSocket directly | tRPC v11 is preferred; validate that it handles reconnection and back-pressure for the deal commitment use case. |
| White-label delivery | Separate deployments vs. runtime config injection | Runtime config injection (§8.2) is the default; validate that CSP and font loading work correctly per client. |
| Secondary market pricing | Real-time bid/ask vs. admin-set prices | Determines whether the secondary market surface needs a WebSocket or polling is sufficient. |
| Offline / degraded state | What the UI shows when the subscription drops | Should the UI lock, show stale data with a banner, or queue mutations locally? Decide before first subscription feature ships. |

---

## 16. Architectural Invariants

These rules do not bend. They exist because violating them has produced financial or
security incidents on comparable platforms.

1. **No financial arithmetic on JS floats.** All monetary values enter as integers and exit through `formatEuro`. No exceptions.
2. **No sensitive data in localStorage or sessionStorage.** Session tokens, access tokens, and investor PII live only in HttpOnly cookies or in-memory state.
3. **No optimistic mutations to the event log.** Optimistic state is a transient overlay. The event is the source of truth.
4. **No `any` in financial domain code.** `any` in money handling, cap table calculation, or event projection is a build failure.
5. **Exhaustive pattern matching on all domain discriminated unions.** `.exhaustive()` is not optional on SPV states, event types, qualification types, or KYC statuses.
6. **Presigned URLs only for document delivery.** No permanent public document URLs.
7. **Audit trail events are append-only.** No UI surfaces a "delete event" or "edit event" action.

---

## 17. Reference Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  React UI    │  │   XState     │  │   Zustand            │  │
│  │  Components  │  │   Machines   │  │   UI Store           │  │
│  │  (Shadcn/    │  │   (SPV/Fund  │  │   (tabs, modals,     │  │
│  │   Radix)     │  │   lifecycle) │  │    filters)          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                  │ events                              │
│  ┌──────▼───────────────────▼─────────────────────────────────┐ │
│  │              TanStack Query                                 │ │
│  │     (query cache · mutations · invalidation · polling)      │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │                    tRPC Client                              │ │
│  │              (type-safe · batched · Zod)                    │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │ HTTP + WebSocket                  │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                       Node Server                                │
│   OAuth session · Cookie management · tRPC router · API proxy   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      Backend Services                            │
│                                                                 │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │  Event Store   │  │   Projections   │  │   BullMQ         │ │
│  │  (append-only) │  │   (read models) │  │   (KYC, wires,   │ │
│  │                │  │                 │  │    notifications) │ │
│  └────────────────┘  └─────────────────┘  └──────────────────┘ │
│                                                                 │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │  PostgreSQL    │  │  Redis          │  │  GCS             │ │
│  │  (event log +  │  │  (queue +       │  │  (documents,     │ │
│  │   projections) │  │   session)      │  │   presigned)     │ │
│  └────────────────┘  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

*This document should be updated when architectural decisions are revised. Every change
should record the date, the reason for the revision, and who made it. Architecture debt
starts the moment decisions are made without recording why.*
