# Closing Readiness And Exception Dashboard V1

**Status:** Implemented as the Closing Readiness / Exception Dashboard V1 pass
**Created:** 2026-05-09  
**Scope:** product model, UI direction, package boundaries, and future Ralph
loop scope that turned the static deal dashboard into a first operator
workspace.

This document captures the product thesis behind the implemented dashboard pass.
It should be read before extending readiness, reconciliation, blockers, or
operator workflows further.

## 1. Why This Pass Exists

The current dashboard is structurally credible:

- it renders a real app route
- it uses domain-safe money formatting
- it shows commitment progress, lifecycle state, ticket distribution, investor
  records, activity, and deal terms
- it has desktop and narrow behavior
- it has Storybook coverage and browser verification

The remaining issue is not only visual polish. The dashboard still behaves like
a status report. A private-markets operator needs an exception workspace.

The product surface should make the most important operational questions
obvious:

- What is blocking the close?
- Who owns each blocker?
- What needs attention today?
- Are we on track for the closing date?
- Which capital is committed, signed, wired, received, matched, or reconciled?
- Which documents or compliance checks are incomplete?
- Which investors create concentration, deadline, or eligibility risk?

The next useful pass is therefore a product-model pass before another broad UI
pass, API pass, or form pass.

## 2. Target User And Job

Primary user for this dashboard:

- deal operator
- fund operations manager
- investment club / syndicate lead with operational responsibility
- internal private-markets team member preparing a close

Primary job:

> Close the SPV safely by the target date without missing investor, compliance,
> document, payment, or audit requirements.

Secondary jobs:

- understand the health of the closing process at a glance
- identify which investor or document blocks the next state transition
- prioritize follow-up work
- explain the current state to a founder, deal lead, or internal reviewer
- preserve an audit trail of what changed, when, and why

## 3. Current Dashboard Critique To Preserve

### UX/UI Critique

- The page lacks a clear primary task.
- Cards still have similar visual weight, so the eye has to work to distinguish
  overview, risk, progress, and detail.
- The right rail contains critical context but visually reads as secondary.
- Chart vocabulary uses several forms without a strong semantic system.
- Green carries too many meanings: success, progress, current state, completed
  lifecycle, and chart category.
- Microcopy is mostly descriptive rather than diagnostic.
- The surface feels more like a polished report than a daily workspace.

### Domain Critique

- Committed capital, signed subscriptions, wire receipt, bank matching, cleared
  funds, and final reconciliation are not distinguished enough.
- The lifecycle is too linear to express dependency blockers.
- KYC/KYB and document completeness are present but not elevated as closing
  risks.
- The dashboard lacks a closing readiness summary.
- Timeline events do not expose responsible party, source, document reference,
  or whether an event is system-generated or manual.
- Concentration risk is implied by large investor tickets but not analyzed.
- Deal terms are reference data, while blockers and next actions should be
  operationally dominant.

### End-User Critique

- It is not obvious what the user should do next.
- Urgent problems are discoverable only after reading several sections.
- The user must manually connect related facts across investor rows, status
  widgets, and the timeline.
- Investor rows are readable but not action-oriented.
- The page lacks explicit "on track", "at risk", "blocked", or "ready for
  review" cues.
- There is no visible last-updated timestamp or data freshness cue.

## 4. Product Principle

The dashboard should lead with exceptions, readiness, and next actions.

The main page hierarchy should be:

1. closing readiness
2. blockers / next actions
3. capital reconciliation
4. investor records
5. lifecycle and audit context
6. reference terms

Reference data should not compete visually with operational risk.

## 5. Core Concepts

### 5.1 Closing Readiness

Closing readiness is a summary of whether the deal can progress toward the
target close.

Candidate display states:

```ts
export type ClosingReadinessState =
  | 'ready'
  | 'attention'
  | 'blocked'
  | 'not_started'
```

Meaning:

| State | Meaning |
|---|---|
| `ready` | No known blocking issue for the next closing action. |
| `attention` | Work remains, but no critical blocker is known. |
| `blocked` | At least one critical dependency blocks closing progress. |
| `not_started` | Insufficient operational data to compute readiness. |

V1 should not pretend to compute legal readiness. It should display a
presentation-level readiness result from fixture data.

Decision for V1: keep all four states. They are useful review fixtures:

- `blocked` for critical unresolved close dependencies
- `attention` for non-critical work remaining
- `ready` for no visible blocker
- `not_started` for incomplete or absent operational data

### 5.2 Capital Reconciliation

The current `Committed capital` label is too broad. V1 should distinguish at
least four states:

| State | Meaning |
|---|---|
| `committed` | Investor has an accepted commitment amount. |
| `signed` | Subscription package or equivalent commitment document is signed. |
| `received` | Funds have been received by the SPV or collection account. |
| `matched` | Received funds have been matched to the expected investor/commitment. |

Future states may include:

- `cleared`
- `reconciled`
- `refunded`
- `exception_pending`

V1 dashboard language should avoid implying that all committed capital is
funded capital.

Decision for V1: add a small domain pass for payment/capital reconciliation
vocabulary. The UI should not keep these states as kit-only strings because the
committed/signed/received/matched distinction is domain-critical and will be
reused by future dashboards, forms, and API contracts.

Recommended V1 metrics:

- target amount
- committed amount
- signed amount
- received amount
- matched amount
- remaining to target
- unreconciled amount, if any

All money remains `EuroCents`; no JavaScript float arithmetic.

### 5.3 Closing Blocker

A blocker is a specific reason the close needs attention.

Candidate presentation type:

```ts
export type ClosingBlockerSeverity = 'critical' | 'warning' | 'info'

export type ClosingBlockerKind =
  | 'kyc'
  | 'kyb'
  | 'subscription_document'
  | 'wire'
  | 'payment_match'
  | 'qualification'
  | 'deadline'
  | 'concentration'
  | 'lifecycle'
  | 'audit_file'

export type ClosingBlocker = {
  readonly id: string
  readonly severity: ClosingBlockerSeverity
  readonly kind: ClosingBlockerKind
  readonly title: string
  readonly detail: string
  readonly owner: ClosingOwner
  readonly dueState: ClosingDueState
  readonly investorName?: string
  readonly reference?: string
}
```

These types are deliberately shown as presentation candidates. A future domain
pass should decide which of them belong in `@repo/domain`.

### 5.4 Owner

Ownership should be visible. A blocker without an owner is not actionable.

Candidate owners:

```ts
export type ClosingOwner =
  | 'operations'
  | 'compliance'
  | 'finance'
  | 'legal'
  | 'deal_lead'
  | 'investor'
  | 'system'
```

V1 can render labels from fixture data. It should not implement assignment or
permissions.

### 5.5 Due State

Deadline context should be diagnostic, not only a date.

Candidate states:

```ts
export type ClosingDueState =
  | 'overdue'
  | 'due_today'
  | 'due_soon'
  | 'on_track'
  | 'no_due_date'
```

Use this to prioritize blocker display. Avoid hardcoding date math into
reusable components unless a future spec defines it.

### 5.6 Document Completeness

Document state should be visible as an operational dependency.

Candidate categories:

- identity document
- proof of address
- UBO / beneficial owner evidence
- subscription package
- wire confirmation
- source-of-funds evidence
- approval note
- closing memo

Candidate display states:

```ts
export type EvidenceStatus =
  | 'missing'
  | 'requested'
  | 'received'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
```

V1 can represent these as fixture details in `@repo/kit`. The domain roadmap
already has a broader compliance model candidate; do not rush a domain API
until the UI has proven which fields matter.

## 6. Proposed Dashboard Shape

### 6.1 Readiness Header

Replace or augment the current broad deal header with a diagnostic readiness
summary.

Should show:

- readiness state: ready / attention / blocked / not started
- closing date or closing review date
- countdown or deadline state
- blocker count
- amount remaining to target
- last updated timestamp

Possible layout:

```text
Northstar Energy SPV                         Closing review
Blocked by 3 open items                      24 May 2026

[Blocked] 3 blockers  |  EUR 625,000 remaining  |  Last updated 09:42
```

Purpose:

- make the first screen answer "are we okay?"
- avoid burying deadline and blocker health in separate widgets

### 6.2 Action / Exception Queue

This is the main new product surface.

Should show:

- top blockers sorted by severity and due state
- owner
- related investor, if any
- next action
- due state
- reference or document pointer

Example rows:

```text
Critical  Elise Martin       KYC evidence requested      Compliance  Due today
Warning   Belair Capital     UBO chain incomplete        Operations  Due soon
Warning   Remaining capital  EUR 625,000 below target    Deal lead   On track
```

Decision for V1: use real interactive affordances with local UI state only.

Acceptable interactions:

- mark a blocker as selected or focused
- expand blocker details
- acknowledge a blocker locally
- filter or sort by severity/owner
- open a related investor row

Do not implement side effects:

- no real reminder sending
- no document upload
- no status mutation persisted outside component state
- no server action
- no fake network call

### 6.3 Capital Reconciliation Panel

Replace a single "Committed capital" interpretation with a compact
reconciliation view.

Should show:

- target
- committed
- signed
- received
- matched
- remaining

Recommended visualization:

- horizontal stacked or stepped bars
- exact EUR values as text
- no pie/donut for reconciliation because sequence matters

Important:

- Do not conflate received and matched funds.
- Do not call the close healthy only because committed capital is high.

### 6.4 Investor Records With Action Context

Investor rows should remain compact, but each row should expose scan-level
operational state.

Collapsed row candidates:

- investor name
- status badge
- country
- qualification
- commitment amount
- next action / blocker summary
- due state if relevant

Expanded row candidates:

- KYC/KYB detail
- subscription package detail
- wire/payment detail
- owner
- last event
- document reference

This builds on the Investor Records V2 work. Do not undo the desktop/mobile row
behavior.

### 6.5 Lifecycle As Dependency Context

The lifecycle should remain visible, but V1 should clarify why the current
state cannot progress.

For example:

- current state: collecting
- next state: incorporated
- blockers: 1 KYC, 1 wire match, 1 subscription package

Avoid making lifecycle the only readiness signal. Real closing work overlaps
across KYC, signing, wires, and incorporation.

### 6.6 Timeline As Audit Context

The activity timeline should stay, but not be the primary action surface.

V1 should distinguish:

- recent events
- current blockers
- next actions

The timeline may show source metadata later:

- system-generated vs manual
- actor
- timestamp
- document reference

Do not implement a full audit log yet.

### 6.7 Deal Terms As Reference

Deal terms are important but mostly static. They should remain lower priority
than readiness, blockers, and reconciliation.

On desktop:

- reference terms can stay in the right rail, below operational modules

On mobile:

- terms can remain behind collapsed disclosure

## 7. Visual Direction

The next visual improvement should follow semantic priority, not decoration.

### 7.1 Color Semantics

Current issue: green means too many things.

Recommended semantic direction:

| Meaning | Visual role |
|---|---|
| healthy / complete | restrained green |
| current / active | strong outline or foreground, not always green fill |
| attention / due soon | amber |
| blocked / critical | red or strong destructive token |
| informational / neutral work | blue or slate |
| pending / unavailable | muted neutral |

Do not start with a broad token redesign. If existing tokens cannot express
these states cleanly, record a targeted token blocker and propose a small token
pass.

Decision for V1: include a targeted status-token pass before the dashboard
implementation sequence. The goal is not a new theme; it is enough semantic
color vocabulary to avoid overloading green.

### 7.2 Hierarchy Rules

- Readiness and blockers should visually outrank reference terms.
- The most urgent number should not look identical to the least urgent number.
- Microcopy should say what the state means, not only what the card contains.
- Cards should not all have the same density and elevation.
- Chart components should use one semantic legend system across the dashboard.

### 7.3 Mobile Rules

Primary mobile path:

1. readiness summary
2. top blockers / next actions
3. capital reconciliation
4. investor records
5. secondary context in disclosure

Do not hide blockers behind collapsed sections on mobile.

## 8. Package Boundary Recommendation

### Immediate V1 Implementation

The implementation sequence is split into small enabling passes before the
final kit dashboard pass.

Why:

- capital reconciliation/payment states are domain-critical
- readiness color semantics need token support before visual implementation
- blocker/action composition can still stay mostly in `@repo/kit` until proven
  stable

Current state:

- the domain reconciliation pass is complete in `@repo/domain/reconciliation`
- the targeted status-token pass is complete in `@repo/design-tokens` and
  `@repo/tailwind-config`

Allowed in `@repo/kit`:

- presentation fixture types
- static readiness/blocker data
- composed dashboard widgets
- Storybook review states
- tests for rendering, ordering, accessibility, and mobile behavior

Forbidden in `@repo/kit`:

- tRPC clients or routers
- GraphQL clients
- auth/session logic
- database code
- server actions
- route handlers
- real document upload/download clients
- real date mutation or workflow side effects

### V1 Domain Pass

Add only the durable vocabulary needed by the readiness dashboard:

- payment/reconciliation statuses
- capital reconciliation summary shape
- exact money aggregation helpers for reconciliation totals

Do not add yet:

- compliance vendor models
- broad evidence/document lifecycle
- closing readiness legal rules
- assignment/owner workflow
- concentration-risk calculators

### V1 Token Pass

Add a targeted semantic status palette to `@repo/design-tokens` and
`@repo/tailwind-config`.

Minimum semantic meanings:

- success / complete
- attention / due soon
- danger / blocked
- info / neutral work
- pending / unavailable

The pass must preserve shadcn compatibility and light/dark support. It should
not redesign the full palette.

The existing
[private-markets-domain-roadmap.md](./private-markets-domain-roadmap.md)
already points in this direction.

## 9. Suggested Ralph Loop Scope

Name:

```text
Closing Readiness + Exception Dashboard V1
```

Likely owner: Ralph loops after this document is reviewed.

Recommended split:

1. Domain reconciliation enabling loop - completed.
2. Targeted status-token enabling loop - completed.
3. Kit dashboard implementation loop - next prompt to write.

Reason:

- the domain/token changes are foundational and easy to verify independently
- the kit dashboard pass will already be large enough with interactions,
  stories, tests, and rendered QA
- splitting reduces the chance that an agent mixes domain semantics with visual
  composition shortcuts

Allowed files:

- `packages/design-tokens/**` and `packages/tailwind-config/**` for the
  targeted token pass
- `packages/kit/src/**`
- `packages/kit/*.json` only if scripts need narrow updates
- `apps/web/tests/e2e/**` only for public route assertions
- `PLAN.md`
- `STATUS.md`

Possible components:

```text
packages/kit/src/readiness/
  closing-readiness-summary.tsx
  closing-blocker-list.tsx
  capital-reconciliation.tsx
  index.ts
```

Possible dashboard changes:

- update `DealDashboardDemo` to lead with readiness
- introduce an exception queue near the top
- make capital reconciliation more precise than one committed headline
- keep investor records but add next-action scan context
- keep lifecycle/timeline/deal terms as supporting context

Do not include:

- broad domain package redesign
- broad token redesign
- API/data fetching
- commitment form
- auth
- persistence
- persisted task actions
- new external UI libraries

## 10. Testing Expectations

Unit/component tests should cover:

- blocker sorting by severity and due state
- empty blocker state
- readiness states render distinct labels/states
- capital reconciliation renders all money values through `MoneyDisplay`
- no JavaScript float arithmetic for money display
- investor rows keep mobile/desktop behavior from the previous pass
- action/exception queue remains accessible by role/name

Storybook should include:

- dashboard with critical blockers
- dashboard with no blockers / ready state
- dashboard with attention state
- capital reconciliation edge case where committed is high but matched funds are
  low
- action queue interaction: focusing or acknowledging a blocker changes local UI
  state without implying persistence
- mobile/narrow dashboard review

E2E/browser checks should cover:

- `/deals/northstar-energy` renders readiness summary
- critical blocker is visible without expanding investor rows
- mobile viewport has no horizontal overflow
- mobile viewport does not hide top blockers behind collapsed disclosure
- first investor row can still expand and show operational detail
- action queue interaction is keyboard-accessible

Full verification should include:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Rendered verification should use the Codex in-app browser or local Playwright.
Record any environment blocker in `STATUS.md` with exact error text.

## 11. Acceptance Criteria

The pass is successful when:

- the first screen answers whether closing is ready, at risk, or blocked
- top blockers are visible without reading the full table
- each blocker has an owner or responsible party
- capital states no longer imply all committed capital is funded
- real interactive affordances exist for blocker focus/acknowledgement, but no
  persistence or fake side effect is implied
- investor rows show next-action context without becoming noisy
- lifecycle remains useful but is not the only readiness model
- mobile keeps readiness and blockers visible before secondary reference modules
- no package boundary is weakened
- all required verification commands pass

## 12. Decisions

Settled decisions before writing Ralph prompts:

1. V1 includes a small domain pass for capital reconciliation/payment statuses.
2. V1 keeps all readiness states: `ready`, `attention`, `blocked`, and
   `not_started`.
3. V1 includes a targeted status-token pass.
4. The action queue uses real local interactions, not merely static labels.
5. `last updated` is a static fixture for now.
6. Concentration risk is deferred unless implemented as clearly labelled
   prototype/demo context.

## 13. Remaining Questions

These have been settled:

1. Domain and status tokens are separate enabling loops.
2. Domain reconciliation export names are implemented in
   `@repo/domain/reconciliation`.
3. Status token names are specified in
   [status-tokens-spec.md](../20-specs/status-tokens-spec.md).
4. Concentration risk is deferred unless it appears as clearly labelled
   prototype/demo context.

## 14. Implementation Result

The final closing-readiness dashboard implementation prompt has been written
and run.

The relevant artifacts are:

```text
docs/20-specs/closing-readiness-dashboard-v1-spec.md
docs/30-testing/testing-closing-readiness-dashboard.md
docs/40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-prompt.md
docs/40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-goal.md
```

The enabling domain and token loops landed first, then the kit-scoped dashboard
loop implemented the readiness summary, blocker queue, and capital
reconciliation surface.
