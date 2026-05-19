# Deal Overview And Progress Baselines: All-Aspect Review

Status: Audit findings
Created: 2026-05-18
Scope: `DealOperationalOverview` and `DealProgressPanel`
Repo: `/Users/fabiencampana/Documents/funding`
External product reference: `/Users/fabiencampana/Documents/roundtable`
End goal: support Fabien's application as a frontend software developer

## 1. Scope Decision

The repo currently exposes several accepted kit baselines:

- `DealCommitmentsTable`
- `DealCommitmentInspector`
- `DealOperationalOverview`
- `DealProgressPanel`
- `DealDocumentsEvidence`

This review interprets the user's "two baseline components" as the overview
pair used together on the Northstar operator overview route:

- `DealOperationalOverview`
- `DealProgressPanel`

Reason:

- both are in `packages/kit/src/deal`
- both are visible on `/deals/northstar-energy/overview`
- both encode close readiness, capital, lifecycle, and operator action grammar
- current product planning already calls out duplication between overview and
  rail

If the intended pair was different, this file should still remain useful as the
review of the route-defining deal baselines.

## 2. Review Team

Six parallel read-only review lanes were used:

1. UI/UX, visual hierarchy, interactions, mobile order, and Roundtable product
   grammar.
2. Code simplification, maintainability, API surface, package boundaries, and
   technical debt.
3. Accessibility, keyboard behavior, i18n, copy ownership, long text, and RTL
   readiness.
4. React conventions, server/client boundaries, render performance, Storybook
   patterns, and current React guidance.
5. Roundtable domain accuracy: lifecycle, capital, reconciliation, SPV,
   visibility, compliance, and close workflow.
6. Tests, Storybook, visual evidence, fixture realism, and reviewer proof.

No code edits were made by the review agents.

## 3. Summary Verdict

The two baselines are directionally strong. They are not throwaway demo
components:

- package boundaries are mostly clean
- state is modeled with discriminated unions
- kit does not fetch data or import app, tRPC, routing, or auth concerns
- component tests include meaningful state, type, and axe coverage
- Storybook covers many fixed states
- the app has a real route integration and e2e assertions
- visual density is closer to an operator workspace than a marketing page

However, they should not be frozen as final baselines yet.

The main reason is not code style. The main reason is product and domain
semantics:

- pre-hardening overview copy could show matched capital as success before
  finance acceptance was represented
- the progress panel action model is semantically overloaded
- pre-hardening capital composition could present financially impossible economics
- lifecycle tone is driven by readiness tone
- blocker ordering can deprioritize critical close blockers
- the app declares `fr-FR` while the baselines render English copy and
  English/UK formatting

For a frontend developer application, these issues matter because the work is
meant to prove product judgment, not just component implementation.

## 4. Evidence Vs Inference

Evidence:

- component code under `packages/kit/src/deal/deal-operational-overview`
- component code under `packages/kit/src/deal/deal-progress-panel`
- app adapters under `apps/web/app/deals/[dealId]`
- Northstar DTO and fixture data under `apps/web/server/deals`
- app e2e coverage in `apps/web/tests/e2e/homepage.spec.ts`
- Storybook files under `packages/kit/src/deal`
- repo planning docs in `docs/20-specs` and `docs/60-planning`
- Roundtable product, workflow, and domain files under
  `/Users/fabiencampana/Documents/roundtable`

Inference:

- visual density and mobile priority findings are inferred from DOM order,
  Tailwind classes, Storybook states, and e2e assertions
- no fresh screenshot pass was captured during this review
- Roundtable references are used as product/domain grammar, not as permission to
  clone UI, brand, copy, or legal advice

## 5. Current Baseline Strengths

### 5.1 Package Boundaries

The kit package remains render-focused:

- no Next.js imports
- no data fetching
- no tRPC imports
- no database imports
- no auth imports
- app DTOs are mapped in `apps/web`, not imported into kit

Representative evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.tsx`
- `docs/20-specs/kit-spec.md`

### 5.2 State Modeling

Both baselines use discriminated lifecycle state:

- loading
- error
- empty or ready where applicable
- ready-state-specific data
- action-required props for actionable states

This is a good TypeScript signal for reviewers. It prevents several impossible
states at compile time.

Representative evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts`

### 5.3 Route Integration

The overview route renders `DealOperationalOverview` through an app-owned
adapter:

- `apps/web/app/deals/[dealId]/overview/page.tsx`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts`

The right rail renders `DealProgressPanel` through an app-owned adapter and
client-side action handler:

- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts`

This is the right high-level architecture for a portfolio frontend project:
package components stay reusable, app adapters own product data mapping, and
route components own navigation.

### 5.4 Test Baseline

The package has meaningful tests:

- state rendering
- retry/action callbacks
- disabled actions
- progress normalization
- semantic data attributes
- dark-mode axe checks
- type guard expectations

Agents reported these commands passed:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit test
pnpm --filter @repo/kit test -- deal-operational-overview deal-progress-panel
pnpm --filter @repo/storybook typecheck
```

## 6. P0 Blockers

### 6.1 Critical Close Blockers Are Not Guaranteed First

Finding:

`selectPriorityBlockers` prioritizes blockers with `routeHint === 'about'`
before critical severity. That means a warning or informational overview
blocker can appear before a critical KYB, wire, or document blocker.

Evidence:

- `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts:8`
- `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts:12`
- `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts:14`
- `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts:25`

Why this matters:

Roundtable-style deal operations should answer the first operator question:
"What blocks close right now?" Route relevance matters, but close-critical
severity should win before route hints.

Recommendation:

Sort unresolved blockers by:

1. unresolved only
2. close-critical severity
3. close impact or readiness dimension
4. due date
5. route hint
6. deterministic id/title fallback

Route hints should guide navigation and filtering, not override severity.

### 6.2 Matched Capital Is Treated Too Close To Reconciled Capital

Finding status:

Resolved for Northstar V1 in the capital semantic hardening pass. The model
still does not represent an aggregate finance-accepted reconciled amount, so
the app now labels matched aggregate capital as matched funds with finance
acceptance pending instead of terminal reconciliation success.

Evidence:

- `packages/domain/src/reconciliation/reconciliation.ts:13`
- `apps/web/server/deals/operational-center-dto.ts:99`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:86`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:90`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:123`

Why this matters:

Roundtable references distinguish payment matching from reconciliation. A
matched wire is not automatically deployable capital. For an operator workflow,
this is not a cosmetic wording issue; it changes close-readiness meaning.

Recommendation:

Add explicit semantics:

- received
- matched
- reconciliation pending
- reconciled or finance accepted
- deployable or investable

Do not use "matched" as the terminal success state for close readiness.

### 6.3 Capital Composition Can Display Impossible Economics

Finding status:

Resolved for Northstar V1 in the capital semantic hardening pass. The fixture
now uses one invariant: gross committed equals net investable amount plus entry
fees plus SPV fees.

Evidence:

- `apps/web/server/deals/fixtures/northstar-energy.fixture.ts:176`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:121`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:130`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:137`
- `apps/web/app/deals/[dealId]/deal-operational-capital-helpers.ts:67`
- `apps/web/app/deals/[dealId]/deal-operational-capital-helpers.ts:71`

Why this matters:

Roundtable distinguishes amount raised from investable amount after fees. If
fees are outside the SPV, the UI must say that. If fees are deducted from amount
raised, the numbers must reconcile.

Recommendation:

Before further UI polish, define one invariant:

```text
gross raised = net investable + platform/entry fees + SPV/setup fees
```

or:

```text
investor total cash = SPV subscription + external entry fees
```

Then rename the panel and overview fields to match that invariant.

### 6.4 Progress Panel CTA Is Semantically Overloaded

Finding:

`mapDealProgressActions` always returns an enabled `invite` action for active
states. When access requests exist, the label becomes "Review N access
requests", but the event kind remains `invite`. The rail handler routes
`invite` and `openForInterests` to Commitments, and every other workflow action
to Documents.

Evidence:

- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:175`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:180`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:181`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:22`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:29`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:34`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:29`

Why this matters:

The right rail should be a command center. Today it is closer to a navigation
shortcut. It exposes workflow action names like `closeDeal` and
`moveToContracting`, but the app does not map them to true workflow-specific
destinations or disabled states.

Recommendation:

Separate action intent from navigation target:

```ts
kind: 'reviewAccessRequests'
targetRoute: 'commitments'
```

or expose route-owned actions outside kit while kit renders generic action
content. Add disabled close/move actions when blockers exist.

### 6.5 App Locale And Rendered Language Conflict

Finding:

The app declares `fr-FR`, sets the document language from that locale, but these
baselines render hard-coded English copy and use fixed `en-US` money plus
`en-GB` date formatting.

Evidence:

- `apps/web/i18n/request.ts:3`
- `apps/web/messages/fr-FR.json:15`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:33`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:82`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:41`
- `apps/web/app/deals/[dealId]/deal-operational-formatting.ts:3`
- `apps/web/app/deals/[dealId]/deal-operational-formatting.ts:11`

Why this matters:

For a frontend application review, i18n coherence is part of professional
polish. It also affects screen-reader pronunciation because the HTML language
does not match most visible text.

Recommendation:

Pick one portfolio language for the product route:

- Option A: English demo, set route/app locale to `en-US` or `en-GB`.
- Option B: French demo, move adapter labels into messages and format money and
  dates through the active locale.

Do not keep `fr-FR` as the app locale while rendering an English operator
workspace.

## 7. P1 Should-Fix Before Baseline Commit

### 7.1 Lifecycle Tone Is Driven By Readiness Tone

Finding:

`progressStatusBase` maps status tone from `data.readiness.state`. A lifecycle
status such as "Closing review" can become danger-toned because readiness is
blocked.

Evidence:

- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:273`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:275`
- `apps/web/app/deals/[dealId]/deal-operational-labels.ts:41`

Why this matters:

Lifecycle status and readiness status answer different questions:

- lifecycle: where the deal is in the process
- readiness: whether the next transition is blocked

Conflating them weakens the information architecture and status semantics.

Recommendation:

Use separate status treatments:

- lifecycle badge: neutral/info/current phase tone
- readiness badge or warning: blocked/attention/ready tone

### 7.2 Mobile Order Hides The Command Center

Finding:

The app shell places main content before the rail on mobile. Inside the
overview, ready content renders readiness and capital before blockers/activity.
The e2e suite explicitly asserts overview-before-rail on mobile.

Evidence:

- `apps/web/app/deals/[dealId]/deal-app-shell.tsx:86`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.ready-content.tsx:24`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.ready-content.tsx:25`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.ready-content.tsx:29`
- `apps/web/tests/e2e/homepage.spec.ts:314`
- `apps/web/tests/e2e/homepage.spec.ts:327`
- `apps/web/tests/e2e/homepage.spec.ts:339`

Why this matters:

Roundtable-style mobile priority should put readiness, progress, blockers, and
operator actions before long financial/detail sections. The current order is
acceptable for desktop scanning but weaker on mobile.

Recommendation:

On mobile, either:

- duplicate a compact command summary above the overview body, or
- order content as readiness, blockers/actions, capital, activity, rail details

Do not simply move the full right rail above everything if it makes the page
feel repetitive. Use a compact mobile command strip.

### 7.3 Overview Blockers Are Passive

Finding:

The DTO includes `routeHint`, but the overview baseline drops it. Blockers
render as static articles. The only action event supported by
`DealOperationalOverview` is retry.

Evidence:

- `apps/web/app/deals/[dealId]/deal-operational-blocker-helpers.ts:36`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts:53`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts:96`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:62`

Why this matters:

For an operator baseline, a priority blocker should help the user act. Even in a
read-only portfolio app, it should expose target surface metadata such as:

- go to commitments
- go to documents
- inspect investor
- review wire matching

Recommendation:

Add a route-safe action model to blocker rows:

```ts
action?: {
  kind: 'openSurface'
  label: string
  surface: 'commitments' | 'documents' | 'overview'
  targetId?: string
}
```

Kit can render the action. App can decide whether it becomes a link, button, or
disabled placeholder.

### 7.4 Financial IA Is Split Across Three Places

Finding:

The overview shows received/matched exception evidence. The rail snapshot shows
net investable amount. The progress panel shows committed/target and fee
composition. The overview adapter currently sets `capital.economics: []`.

Evidence:

- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:84`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:85`
- `apps/web/app/deals/[dealId]/deal-operational-rail-adapter.ts:16`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:118`

Why this matters:

A reviewer should not have to mentally reconcile capital semantics across three
surfaces. This is especially risky in private markets, where committed, signed,
received, matched, reconciled, fees, and investable are distinct.

Recommendation:

Define a single capital hierarchy:

1. committed versus target
2. signed versus committed
3. received versus signed
4. matched versus received
5. reconciled versus matched
6. investable after defined fees

Then assign each baseline a clear role:

- `DealProgressPanel`: compact command/status version
- `DealOperationalOverview`: detailed reconciliation and exception view
- rail snapshot: only redundant high-signal facts

### 7.5 Workflow Modeling Is Duplicated Between Kit And App

Finding:

Kit defines stage/mode/status unions. The app adapter repeats much of the same
workflow type shape and maps deal lifecycle again.

Evidence:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:3`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:189`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:25`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:188`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:190`

Why this matters:

The impossible-state modeling in kit is strong, but the public API is expensive
for app adapters. When stages evolve, the adapter and kit can drift.

Recommendation:

Choose one:

1. Keep kit as pure renderer and make the app adapter own all workflow mapping,
   but reduce kit's public state to fewer display-ready concepts.
2. Export a small kit/domain helper to translate stage/mode/status combinations.
3. Move lifecycle mapping to `@repo/domain` and have both app and kit consume a
   stable presentation model.

Do not continue duplicating the full matrix manually.

### 7.6 Route IA Is Still Ambiguous

Finding:

The canonical route is `/overview`; `/about` redirects to it. Roundtable grammar
uses an `About` deal section, while the current page is really an operator
close-readiness workspace.

Evidence:

- `apps/web/app/deals/[dealId]/page.tsx:16`
- `apps/web/app/deals/[dealId]/about/page.tsx:18`
- `apps/web/app/deals/[dealId]/layout.tsx:24`

Why this matters:

If this is operator-only, "Overview" is generic. "Operations" or "Closing
readiness" would better match the implemented content. If `/about` is reserved
for investor content, docs and UI should make that split intentional.

Recommendation:

For the portfolio vertical, prefer:

- route: `/overview`
- visible tab: `Operations` or `Closing readiness`
- future route: `/about` for investor-facing deal narrative

## 8. Accessibility Review

### 8.1 Readiness Dimension State Needs Text

Finding:

Dimension state is expressed through color/icon and `data-state`, but the
visible badge contains only a number. The icon is `aria-hidden`.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:102`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:106`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:111`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:126`

Recommendation:

Add visible or screen-reader text that names the dimension state:

```text
Investor identity: blocked, 2 blockers
```

or make the badge include both state and count.

### 8.2 Blocker Fact Labels Are Screen-Reader Only

Finding:

Blocker facts use icons plus values, with labels hidden as `sr-only`.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:120`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:122`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:123`

Recommendation:

For dense operator scanning, consider visible compact labels:

```text
Owner: Legal
Surface: Documents
Due: 20 May
```

Icons can remain, but should not be the only visual label.

### 8.3 Disabled Actions Are Not Keyboard Discoverable

Finding:

Disabled progress actions use native disabled buttons. The disabled reason is
connected with `aria-describedby`, but native disabled buttons are removed from
keyboard focus order.

Evidence:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.actions.tsx:27`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.actions.tsx:30`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:106`

Recommendation:

If disabled-command discoverability matters, use one of:

- `aria-disabled` plus guarded click/key handling
- a disabled button plus a separate focusable explanation
- a visible "Why blocked" detail link

### 8.4 Axe Coverage Exists But Contrast Is Not Fully Proven

Finding:

Component tests use axe, including dark contexts, but color contrast is disabled
in the shared axe helper.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.test.tsx:293`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.test.tsx:490`
- `packages/kit/src/test/axe.ts:8`

Recommendation:

Add a deliberate contrast verification path before treating the two components
as visual baselines:

- either enable contrast where jsdom allows it
- or capture browser screenshots and inspect contrast through a browser-level
  a11y/visual workflow

## 9. I18n And Copy Review

### 9.1 Label Ownership Is Correct In Kit But Not Complete In App

Kit receives labels through props, which is correct. The issue is that the app
adapters hard-code English labels instead of sourcing them from the app message
layer or choosing an English locale.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts:118`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:288`
- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:33`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:82`

Recommendation:

For application readiness, move route labels and formatter locale to app
message/config ownership.

### 9.2 Long Text Is Truncated Without Recovery

Finding:

Several fields use `truncate`, including dimensions, blocker facts, status,
visibility, action labels, and capital breakdown labels. Overview has a
long-text story; progress panel does not.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:107`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:123`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:65`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:136`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.actions.tsx:38`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.capital.tsx:142`

Recommendation:

Add:

- progress-panel long-text story
- tooltip/title or wrap strategy for important labels
- tests for no text overflow in narrow route context

### 9.3 RTL Is Not Baseline-Ready

Finding:

Storybook sets `lang`, but not `dir`. Some component and app styles use
physical left/right borders.

Evidence:

- `apps/storybook/.storybook/preview.ts:11`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.capital-section.tsx:25`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.activity-section.tsx:23`

Recommendation:

Do not claim RTL readiness yet. Add an RTL story only if RTL is part of the
application claim. Otherwise document it as out of scope.

## 10. React And Performance Review

### 10.1 `DealOperationalOverview` Is Forced Into The Client Bundle

Finding:

`DealOperationalOverview` is marked `'use client'`, but the Next.js overview
page imports and renders it with serializable server-derived props and no
action handler.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx:1`
- `apps/web/app/deals/[dealId]/overview/page.tsx:1`
- `apps/web/app/deals/[dealId]/overview/page.tsx:19`

Why this matters:

The overview is mostly static render output. Current React and Next app-router
patterns favor keeping static UI server-renderable and isolating client islands
to actual interaction.

Recommendation:

Split the baseline:

- server-safe static overview view
- tiny client retry/action island only where needed

Keep `DealProgressPanel` client for now because it sits behind route navigation
actions, but apply the same split later if static content grows.

### 10.2 Root UI Barrel Broadens Client Graph Reasoning

Finding:

Kit client components import from `@repo/ui`, whose root barrel re-exports the
whole UI surface including chart modules.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx:3`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.tsx:3`
- `packages/ui/src/index.ts:1`
- `packages/ui/src/index.ts:17`

Recommendation:

Measure bundle output before changing. If the graph is too broad, use package
subpath exports for hot client files:

```ts
import { Button } from '@repo/ui/button'
import { Badge } from '@repo/ui/badge'
```

This is not a blocker unless bundle evidence shows harm.

### 10.3 Display Labels Are Used As React Keys

Finding:

Metric rows key on `metric.label`. Labels are display copy and can change with
localization.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.capital-section.tsx:113`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.capital.tsx:42`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts:24`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:106`

Recommendation:

Add stable metric ids:

```ts
type DealOperationalMetric = {
  readonly id: string
  readonly label: string
  readonly value: string
}
```

Use `id` as the key and keep `label` display-only.

### 10.4 Do Not Add Memoization By Reflex

Finding:

The derived arrays and maps inside these components are small. Broad
`React.memo`, `useMemo`, or `useCallback` would add noise without measured
benefit.

Recommendation:

Only memoize after profiling or after introducing expensive derived data.
Current React guidance and React Compiler direction make manual memoization a
measured optimization, not a default style rule.

## 11. API And Maintainability Review

### 11.1 `DealProgressPanelState` Is Powerful But Expensive

Finding:

The state model exposes stage, mode, and status as separate public concepts.
This gives strong impossible-state modeling, but makes app adapters verbose and
fragile.

Evidence:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:3`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:189`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:236`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:25`

Recommendation:

Reduce public complexity if the app does not need all three concepts:

- make `status` display-ready and derive visual attributes internally
- or expose a smaller `workflow` object with one discriminant
- or keep the model but move mapping helpers into a shared presentation module

### 11.2 Root Exports Omit Some Useful Types

Finding:

Component indexes expose more handler/action subtypes than the package root.
Adapters work around this by deriving types from props.

Evidence:

- `packages/kit/src/deal/deal-progress-panel/index.ts:1`
- `packages/kit/src/deal/index.ts:31`
- `packages/kit/src/index.ts:64`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:22`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:17`

Recommendation:

Either:

- intentionally keep the root small and document `NonNullable<Props['onAction']>`
  as the adapter pattern, or
- export the missing action handler and action event types from root.

Do not leave this accidental.

### 11.3 Type Contract Assertions Are In Runtime Test Files

Finding:

Negative `@ts-expect-error` checks live inside runtime Vitest files.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.test.tsx:39`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.test.tsx:43`
- `packages/kit/package.json:41`

Recommendation:

Move type-only assertions to `*.test-types.ts` or a dedicated typecheck-only
file. Runtime tests should focus on runtime behavior.

### 11.4 Simple `ts-pattern` Uses Can Be Simplified

Finding:

Some `ts-pattern` usage adds dependency/runtime weight for simple state-to-icon
or state-to-value mappings.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.model.ts:25`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.readiness-section.tsx:121`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.blockers-section.tsx:127`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.model.ts:35`

Recommendation:

Keep `ts-pattern` where it materially improves exhaustive object matching.
For simple literal state maps, prefer lookup tables or `switch`.

### 11.5 Story Cross-Coupling Is Useful But Needs Boundaries

Finding:

Overview stories import `DealProgressPanel`; progress stories import
`DealCommitmentsTable`.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.stories.tsx:1`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.stories.tsx:1`

Recommendation:

Keep route-context stories, but separate them clearly:

- component baseline stories
- route composition stories

This prevents reviewers from misreading context stories as component API
requirements.

## 12. UI/UX And Product Design Review

### 12.1 Current Overview Feels More Like A Status Report Than A Workspace

Strength:

The layout is dense and operational, with readiness, capital, blockers, and
activity. It is much closer to a work surface than a landing page.

Gap:

Blockers are static and the highest-priority action is not tightly coupled to
the blocker list.

Recommendation:

Make the top of the overview answer:

1. Can close proceed?
2. What exact blocker prevents it?
3. Who owns it?
4. Where does the operator go next?

### 12.2 Progress Panel Should Be A Command Panel, Not A Capital Card

Strength:

The visual treatment gives the rail a distinct command-surface feel.

Gap:

Capital takes substantial space, while workflow actions are not state-aware.

Recommendation:

Prioritize:

- status
- next action
- blocking reason
- close-readiness delta
- compact capital

Do not let fee composition dominate the command panel when blockers exist.

### 12.3 Overview And Progress Panel Duplicate Capital Semantics

Finding:

Both components include capital progress. The app also adds rail snapshot
metrics. The duplication is not inherently wrong, but the hierarchy is not yet
clear.

Recommendation:

Use the progress panel as the compact rail command summary. Use overview for
capital exception details. Remove or shrink rail snapshot duplication once the
progress panel is semantically correct.

### 12.4 Visible Tab Naming Should Match Persona

Finding:

`Overview` is acceptable, but generic. The current content is not investor
"About" content; it is operator close readiness.

Recommendation:

For portfolio clarity, consider visible tab copy:

- `Operations`
- `Closing`
- `Readiness`

Keep route path `/overview` if changing route URLs is unnecessary.

## 13. Roundtable Domain Review

### 13.1 Deal Lifecycle And Readiness Are Separate

Finding:

The progress badge tone is readiness-derived; app lifecycle stage mapping also
collapses some stages.

Evidence:

- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:201`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:211`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:273`

Recommendation:

Represent:

- lifecycle stage
- close readiness
- compliance readiness
- capital readiness

as separate facts. They can be visually adjacent, but should not collapse into
one status tone.

### 13.2 SPV Lifecycle Is Too Coarse

Finding:

The DTO exposes coarse vehicle setup status. Roundtable references distinguish
deal lifecycle from SPV legal/administrative lifecycle.

Evidence:

- `apps/web/server/deals/operational-center-dto.ts:69`

Recommendation:

Do not build a full SPV engine for V1. Add enough visible structure for
credibility:

- incorporated
- bank account ready
- subscription docs ready
- funds received
- investment executed
- administration active

### 13.3 Standard Vs Ongoing Closing Needs Policy

Finding:

The adapter changes the progress mode label based on closing mode, but readiness
does not become policy-aware.

Evidence:

- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:211`

Recommendation:

For standard closing:

- all KYC/KYB needed before close
- all signatures needed before close
- all funds reconciled before close

For ongoing collection:

- show ready tranche versus blocked tranche
- action should point to the next ready tranche

### 13.4 Visibility Labels Overstate Access

Finding:

`anyone_with_link` becomes "Public deal workspace". `disabled` becomes
"Admin-only deal workspace".

Evidence:

- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:278`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:281`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:285`

Recommendation:

Use access language that reflects invitation/link policy, not public web
availability:

- link sharing enabled
- request access enabled
- new link access disabled
- existing invited investors retain access

## 14. Tests, Storybook, And Reviewer Evidence

### 14.1 Missing App Adapter Unit Tests

Finding:

The heaviest logic is in app adapters, but coverage is mostly component tests
and e2e happy paths.

Evidence:

- `apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts:56`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:78`
- `apps/web/tests/e2e/homepage.spec.ts:342`

Recommendation:

Add focused tests for:

- capital labels
- matched versus reconciled terminology
- blocker ordering
- lifecycle-to-progress mapping
- action availability
- visibility labels
- stale/issue data quality

### 14.2 Storybook Is Render-Only

Finding:

Stories cover many static states, but no play functions or interaction tests.
Storybook addons include docs, not interaction/a11y tooling.

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.stories.tsx:57`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.stories.tsx:76`
- `apps/storybook/.storybook/main.ts:4`

Recommendation:

Add a small curated Storybook test layer:

- retry click
- progress action click
- disabled action explanation
- no-target progress aria text
- long text
- narrow panel

### 14.3 Visual Evidence Is Missing For These Baselines

Finding:

Playwright screenshots are configured only on failure, and current committed or
local artifacts do not prove overview/progress-panel quality.

Evidence:

- `apps/web/playwright.config.ts:10`
- `docs/30-testing/testing-app.md:98`

Recommendation:

Capture at least:

- overview desktop route
- overview mobile route
- progress panel dark story
- progress panel long-text/narrow story
- overview with progress rail context

### 14.4 Responsive Coverage Is Narrow

Finding:

The app checks 1440px desktop and 390px mobile for overview. There is no tablet
or browser/device matrix.

Evidence:

- `apps/web/tests/e2e/homepage.spec.ts:287`
- `apps/web/tests/e2e/homepage.spec.ts:314`
- `apps/web/playwright.config.ts:21`

Recommendation:

Add at least one middle viewport:

- 768 or 820 width tablet
- 1024 width constrained desktop

## 15. Safe Deletion Candidates

These are safe to inspect and likely remove or consolidate in a cleanup pass:

1. `getCapitalProgressLabel` and `getCapitalSupportingLabel`.
   Evidence: `apps/web/app/deals/[dealId]/deal-operational-capital-helpers.ts:13`.

2. `dataQualityClasses.fresh`.
   Evidence: `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.styles.ts:34`;
   fresh data does not render `DataQualityNotice`.

3. Stale negative tests for removed attributes/slots.
   Evidence:
   `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.test.tsx:109`
   and
   `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.test.tsx:207`.

4. Duplicate `NoBlockersReady` story if it renders the same state as
   `ReadyToClose`.
   Evidence:
   `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.stories.tsx:61`.

Do these only after product semantics are corrected. Cleanup should not distract
from the P0 domain and workflow fixes.

## 16. Recommended Implementation Sequence

### Phase 1: Semantic Correctness

1. Define capital invariant for committed, signed, received, matched,
   reconciled, fees, and investable.
2. Add reconciled/finance-accepted state to DTO/domain presentation model.
3. Fix fixture values so capital composition reconciles.
4. Stop presenting matched capital as terminal success.
5. Split lifecycle tone from readiness tone.

### Phase 2: Command And Blocker Workflow

1. Fix blocker ordering to prioritize critical close blockers.
2. Preserve blocker route/action metadata into overview props.
3. Add route-safe blocker actions.
4. Replace overloaded `invite` action with explicit action kinds.
5. Make progress actions state-aware and disabled when blockers prevent them.

### Phase 3: I18n And Accessibility

1. Decide English or French for the portfolio route.
2. Align `html lang`, message files, app labels, money formatting, and dates.
3. Add readiness state text per dimension.
4. Improve disabled-action discoverability.
5. Add long-text and narrow progress-panel stories.

### Phase 4: React And API Cleanup

1. Split `DealOperationalOverview` into server-safe view plus client island.
2. Add stable metric ids.
3. Move type-only assertions out of runtime tests.
4. Reduce duplicated workflow mapping.
5. Remove safe deletion candidates.

### Phase 5: Reviewer Evidence

1. Add adapter unit tests.
2. Add Storybook interaction/play tests or a documented alternative.
3. Add app-level a11y smoke for overview route.
4. Add desktop/mobile/tablet visual captures.
5. Document validation commands and results.

## 17. Baseline Acceptance Gates

Do not call these two components baseline-ready until:

- capital numbers reconcile under one documented model
- matched and reconciled are not conflated
- critical blockers sort first
- progress actions reflect lifecycle and readiness
- lifecycle and readiness statuses have separate visual semantics
- visible language matches the app locale
- readiness dimensions expose textual state
- app adapters have focused unit tests
- overview route has desktop/mobile visual evidence
- Storybook includes narrow and long-text states for the progress panel
- `pnpm --filter @repo/kit typecheck` passes
- `pnpm --filter @repo/kit test` passes
- `pnpm --filter @repo/storybook typecheck` passes
- `pnpm --filter @repo/web e2e` passes after route changes

## 18. Final Recommendation

Keep both components, but do not freeze them as the reference baseline yet.

`DealOperationalOverview` should become the detailed operator readiness and
capital-exception workspace. It needs actionable blockers, corrected capital
semantics, textual readiness state, and a server-safe render split.

`DealProgressPanel` should become the compact command panel. It needs
state-aware workflow actions, separate lifecycle/readiness semantics, less
capital ambiguity, and stronger long-text/mobile evidence.

The next pass should not be a broad redesign. It should be a semantic hardening
pass: capital model, blocker ordering, action model, locale coherence, and
adapter tests. Once those are fixed, visual refinement and portfolio evidence
will land on a much stronger foundation.
