# Northstar Deal Workspace Product Design Spec

**Status:** Source of truth for the next Northstar vertical passes
**Scope:** Product design, route IA, persona model, visual grammar, and kit-to-app composition rules
**Primary references:**

- `docs/50-research/roundtable-research.md`
- `docs/50-research/funding.md`
- `docs/20-specs/kit-spec.md`
- `docs/20-specs/app-shell-spec.md`

The Roundtable screenshots and product capture used for visual reference live in
the private research archive, not in this repository. Keep this shared spec
portable by referencing repo documents here rather than local absolute file
paths.

This spec settles the product direction before the next goal/prompt pair. It
supersedes the earlier ambiguity around whether the first deal route is an
investor-facing About page or an internal operations page.

## 1. Product Decision

The Northstar vertical is an internal deal operations workspace inspired by
Roundtable's deal-page layout and private-market workflows.

It is not trying to clone Roundtable's investor-facing About page in the current
operator pass. The screenshots show a useful layout grammar, but the persona is
different:

- Roundtable reference: investor or deal-participant About page.
- Northstar V1: operator workspace for deal leads, operations, legal, finance,
  and fund administration.

The durable model is one deal workspace with persona-dependent lenses:

```text
same deal
same route family
same app shell
different persona lens
```

V1 ships the operator lens first. The investor lens is a future phase.

## 2. Persona Model

### Operator Lens

The operator lens answers:

- What is the deal state?
- Can we close?
- What blocks close?
- Which commitments, signatures, wires, documents, and exceptions need action?
- What changed recently?

Primary users:

- deal lead
- investor operations
- legal
- compliance
- finance
- fund administrator

This is the current implementation path.

### Investor Lens

The investor lens answers:

- What is this deal?
- What materials can I review?
- What is my commitment state?
- What do I need to sign, wire, or complete?
- What documents are available to me?

Primary users:

- invited investor
- investor representative
- family office user
- professional co-investor

This is deferred. It should not be partially built inside the operator pass.

## 3. Route IA

Operator routes:

```text
/deals/[dealId]/overview
/deals/[dealId]/commitments
/deals/[dealId]/documents
```

Reserved future investor routes:

```text
/deals/[dealId]/about
```

Visible operator tabs:

```text
Overview
Commitments
Documents
```

Do not label the operator entry route "About". Roundtable uses About for
investor-facing deal content. The operator route is an operational overview.

The current `/deals/[dealId]` redirect should point to `/overview` once the
rename pass is implemented.

## 4. Persona Toggle

A persona toggle is a good future product direction, but it is not part of the
operator V1.

Future placement:

```text
deal header, near settings/status controls
```

Future labels:

```text
Operator view
Investor view
```

The toggle is app-owned, not kit-owned. The app shell chooses the persona and
maps the same deal data into different kit baselines.

Do not add this toggle until the operator vertical is coherent across overview,
commitments, and documents.

## 5. Layout Grammar

The Roundtable references establish the layout grammar:

- narrow persistent left navigation
- clean deal header
- route tabs immediately below the header
- central content column
- persistent right rail
- high-trust document/material objects
- compact status and money rail
- light page background and restrained borders

Desktop layout:

```text
left nav | main route content | right rail
```

Mobile order:

```text
header
tabs
main route content
right rail
```

The right rail must not appear before primary route content on mobile.

## 6. Visual Direction

The product should feel like a private-market operating system, not a generic
admin dashboard.

Borrow from Roundtable:

- quiet white/near-white workspace
- sparse borders
- strong dark progress rail
- blue primary action
- exact financial typography
- document previews and concrete deal materials
- compact but legible cards
- restrained icons
- status pills with clear semantic meaning

Avoid:

- dashboard hero composition
- large decorative summary cards
- repeated card grids that only restate counts
- marketing-page sections
- heavy admin-panel chrome
- duplicated capital/progress data in main content and rail
- generic "mission control" language in visible UI
- internal implementation copy

## 7. Overview Route Product Shape

The operator overview route should read as a deal operations overview, but with
Roundtable's deal-page credibility and visual restraint.

It should contain one or two strong objects, not only abstract status cards.

Required hierarchy:

1. Deal header and tabs.
2. Main overview body.
3. Right progress rail.

Main overview body should prioritize:

- deal materials or closing evidence preview
- readiness and next action
- priority blockers
- recent operational movement
- only the capital exceptions that need action

The right rail owns:

- deal progression headline
- amount raised or committed against target
- progress bar
- investable amount
- fee rows
- unique viewers or participant signal when available
- primary operator actions

The main overview must not repeat the same full capital summary if the rail
already renders it. Duplicated data weakens the product.

## 8. Overview Content Rules

### Deal Materials

Use a concrete deal-material/evidence object as the visual anchor when possible.
For operator V1, this can be framed as closing evidence or deal materials rather
than investor marketing.

Acceptable content:

- management presentation
- subscription bulletin
- final close packet
- side letter package
- wire instruction package
- data-room status

Do not show an empty abstract dashboard when material objects exist in the DTO.

### Readiness

Readiness should be compact and explanatory:

- current state
- next action
- dimensions with status
- blocker total

Readiness should not dominate the whole page unless the deal is blocked.

### Blockers

Blockers should be operationally actionable:

- title
- owner
- surface
- due label when available
- affected investor/document count when available
- severity

Show the most important blockers first. Avoid showing every blocker in the
overview when the commitments and documents routes can own detailed inspection.

### Activity

Activity should explain movement:

- actor
- timestamp
- summary
- type

Do not turn activity into a decorative timeline. It should help an operator know
what changed.

## 9. Commitments Route Product Shape

The commitments route is the core operator workflow.

It should answer:

- who is committed?
- how much?
- who is blocked?
- what is missing for KYC/KYB, signature, wire, or readiness?
- which investor should be opened next?

Primary kit baseline:

```text
DealCommitmentsTable
```

The route should:

- use app-owned adapters from the Northstar DTO
- avoid kit fixture imports
- support search and workflow filters
- provide keyboard-reachable row open behavior
- preserve mobile/no-overflow behavior
- avoid duplicating the rail's aggregate capital summary

## 10. Documents Route Product Shape

The documents route should become the evidence and data-room operations route.

It should answer:

- which documents are required?
- what is missing, expired, rejected, or ready?
- which documents block close?
- which investor or workflow owns each exception?
- what material is shared with investors?

This route is where investor-facing About materials can later branch from the
same document model.

## 11. Right Rail Rules

The right rail is persistent operational context, not a second dashboard.

It should be compact, commercial, and high-trust:

- dark panel for deal progression
- exact money labels
- one main progress bar
- small secondary rows
- clear primary and secondary actions

Avoid:

- repeating every metric from main content
- oversized typography that overpowers the central route
- rail cards stacked before main content on mobile
- rail-only information that is necessary to understand the current route

## 12. Kit-To-Web Composition Rule

All reusable product surfaces are developed in kit first, then wired into
`apps/web` through app-owned adapters.

Kit owns:

- display components
- display-ready prop contracts
- label contracts
- visual states
- Storybook reference states
- component tests and accessibility checks

Apps own:

- route layout
- routing and redirects
- translations
- DTO to kit adapters
- persona selection
- data fetching
- e2e workflows

Kit must not import:

- `apps/web`
- Next.js route APIs
- tRPC
- server modules
- app data fixtures

Apps must not import:

- kit story fixtures for runtime UI

## 13. Data And Content Rules

Money:

- render exact money values
- do not approximate unless the label explicitly says approximate
- keep target, committed, signed, received, matched, and investable semantics
  distinct

Statuses:

- use domain/DTO vocabulary where it already exists
- keep `not_started`, `ready`, `attention`, and `blocked` stable for readiness
- keep closing blocker severities aligned to `critical`, `warning`, and `info`

Copy:

- visible copy should sound like product UI, not implementation notes
- avoid "mission control" in user-facing copy
- avoid "admin dashboard" framing
- use "operator" in docs and prompts, not necessarily in UI

Duplication:

- one surface owns each major fact per viewport
- the rail owns deal progression
- the commitments route owns investor readiness details
- the documents route owns document completeness details
- the overview route summarizes and links context, it does not duplicate every
  route in miniature

## 14. Visual QA Gates

Every route-level pass should verify:

- desktop around 1440px
- wide desktop around 1512px when practical
- mobile around 390px
- no horizontal overflow
- main content appears before rail on mobile
- right rail stays compact
- text does not overlap or clip
- primary actions are visually clear
- keyboard focus remains visible
- screenshots resemble a real product route, not scaffolding

Storybook should include:

- default desktop state
- mobile/narrow state when the component changes layout materially
- long text state
- empty/loading/error states when applicable
- context story with the right rail when a component is route-primary

## 15. Immediate Next Product Pass

Before wiring the commitments route, run a focused operator overview polish pass.

Name:

```text
T5D-B4 - Rename about to overview and align operator overview with Roundtable product grammar
```

Intent:

- rename visible operator route from About to Overview
- move operator path from `/about` to `/overview`
- reserve `/about` for future investor view
- refine `DealOperationalOverview` in kit first
- reduce duplicated capital/progression content between overview and rail
- make the overview less dashboard-like and more deal-workspace-like
- update app adapters and e2e after kit is settled

Non-goals:

- do not build investor persona
- do not add persona toggle
- do not wire commitments
- do not wire documents
- do not add auth
- do not expand backend data beyond what the overview polish requires

## 16. Later Sequence

After T5D-B4:

```text
T5D-C - Wire operator commitments route to DealCommitmentsTable
T5D-D - Build and wire operator documents route
T5D-E - Review operator vertical end to end
T5F-A - Persona model/design memo
T5F-B - Investor About kit baseline
T5F-C - App-owned persona toggle
```

This sequence keeps the operator workflow coherent before adding investor
variants.
