# Investor Records V2 And Mobile/Narrow QA

**Status:** Ready for Ralph loop
**Created:** 2026-05-09
**Scope:** investor records, investor-row disclosure behavior, and
mobile/narrow dashboard composition after the dashboard composition v2 pass.

This document captures the next bounded visual/product refinement pass for
`@repo/kit`. It is intentionally narrower than a full dashboard redesign: fix
the investor-record surface and make the dashboard more usable on narrow
viewports without changing domain models, tokens, app data, or package
boundaries.

## 1. Current Read

The latest dashboard composition pass improved the desktop surface:

- KPI cards no longer stretch to the right rail height.
- Large EUR values fit inside metric cards.
- The lifecycle panel now works as a compact right-rail module.
- The dashboard reads more like an operating surface than a generic card stack.

The remaining issues are now concentrated in two places:

1. investor records, especially expanded rows
2. narrow/mobile dashboard behavior

These are related. Investor records are the longest repeated surface on the
page, and on mobile they dominate the experience. If they stay noisy, the whole
mobile page feels like a long dump of every available module.

## 2. Findings To Address In This Loop

### 2.1 Expanded Investor Rows Repeat Visible Fields

The current expanded state mostly repeats information already visible in the
row summary: country, qualification, and commitment amount. This makes expansion
feel like a mechanical disclosure demo rather than an operational detail view.

Fix direction:

- collapsed rows should show the durable record identity:
  - investor name
  - status
  - country
  - qualification
  - commitment amount
- expanded rows should reveal secondary operational detail:
  - entity type
  - KYC/document state
  - wire/subscription state
  - last event or next action
  - optional internal reference or closing note
- avoid repeating country, qualification, and amount in expanded content unless
  needed for mobile accessibility or a missing desktop header

Acceptance:

- opening a row gives the reviewer new useful information
- the expanded panel is visually lighter than a full nested card
- no expanded row looks like the summary duplicated into a muted block

### 2.2 Desktop Record Rows Still Carry Too Much Label Noise

In the dashboard table context, the header already names the columns. Repeating
"Country", "Qualification", and "Commitment" inside every desktop row creates
unnecessary noise.

Fix direction:

- keep visible field labels on narrow layouts where rows stack
- hide repeated field labels at desktop/table widths
- preserve accessible labels for screen readers
- keep money aligned and stable
- keep row height compact enough for six investors to scan quickly

Acceptance:

- desktop investor rows read as records, not cards
- mobile rows remain understandable without relying on a table header
- labels do not disappear from the accessibility tree

### 2.3 Narrow Viewports Show Too Much At Once

The current narrow/mobile page technically responds, but it remains exhaustive:
every module appears fully expanded in one long sequence. The page works, but it
asks the user to process too much before reaching the bottom.

Fix direction:

- keep the primary path visible:
  - deal header
  - KPI summary
  - commitment progress
  - investor status summary
  - investor records
- treat secondary context as progressive disclosure on narrow viewports:
  - SPV lifecycle
  - ticket distribution
  - activity timeline
  - deal terms
- desktop right rail should remain visible; the mobile treatment should not
  degrade desktop hierarchy
- use native semantics where possible (`details`/`summary` is acceptable inside
  `DealDashboardDemo` for this pass)

Acceptance:

- narrow pages no longer feel like every desktop module stacked open
- secondary modules remain discoverable
- the investor records section is reachable without excessive scrolling
- no content clips horizontally at common mobile widths

### 2.4 Storybook Needs Investor And Narrow Review Surfaces

The current stories are useful, but the next pass needs review surfaces focused
on investor records and narrow behavior.

Fix direction:

- add or refine `InvestorRow` stories:
  - collapsed record row
  - expanded row with secondary details
  - narrow/mobile record row
- add or refine `DealDashboardDemo` stories:
  - desktop review
  - narrow review
  - investor-record-focused review if useful
- stories should use realistic widths and not center large product surfaces in
  empty canvases

Acceptance:

- Storybook reveals the repeated-label problem
- Storybook reveals the mobile long-page problem
- visual QA can be done without relying only on the app route

## 3. Findings Not Addressed By This Loop

### 3.1 Broad Token And Palette Refinement

The palette is coherent but still a little flat: parchment background,
off-white cards, forest accents, similar borders, and muted shadows dominate
the UI.

Deferred because:

- current tokens are shadcn-compatible and contrast-checked
- this loop can improve hierarchy through composition first
- token changes should answer concrete failures, not general taste concerns

Future pass:

- targeted surface/elevation refinement
- chart palette refinement
- dark-mode parity review

### 3.2 Full Product Information Architecture

The mobile dashboard may eventually need a proper product IA pass: navigation,
section tabs, sticky summaries, user role differences, and task prioritization.

Deferred because:

- current app is a static review surface
- no real user roles, permissions, or data fetching exist yet
- this loop should only make the existing demo responsibly responsive

Future pass:

- role-aware dashboard IA
- mobile-first information hierarchy
- operational task prioritization

### 3.3 Commitment Form And Investor Onboarding

The investor commitment flow remains a separate product surface.

Deferred because:

- React Hook Form and Zod resolver wiring are out of scope here
- the dashboard should stabilize before form surfaces reuse its components

Future pass:

- commitment form
- progressive disclosure
- jurisdiction-aware validation
- upload states

### 3.4 tRPC, GraphQL, Data Fetching, Auth, And Persistence

The dashboard still uses static demo data.

Deferred because:

- current goal is visual/product-surface readiness
- backend/API architecture deserves its own spec and loop
- `@repo/kit` must remain framework-neutral and data-fetching-free

Future pass:

- app data boundary
- API choice and adapters
- typed fixtures/server state
- auth/session model

### 3.5 Visual Regression Infrastructure

Snapshots, imageshot testing, or Chromatic-style review remain valuable later.

Deferred because:

- the dashboard surface is still changing
- freezing screenshots too early protects churn
- browser verification and Storybook review are enough for this pass

Future pass:

- stable visual-regression gates after the investor/mobile pass
- screenshots for desktop, narrow, and key Storybook stories

### 3.6 Development Overlay Artifacts

The black floating "N" controls visible in screenshots are development overlay
artifacts, not product UI.

Deferred because:

- they do not come from `@repo/kit`
- they should not influence component implementation
- production screenshots should be taken without dev overlays when needed

## 4. Loop Scope

Recommended next loop: **Investor Records V2 + mobile/narrow behavior**.

Allowed focus:

- `InvestorRow`
- investor-record section inside `DealDashboardDemo`
- `DealDashboardDemo` narrow/mobile composition
- stories and tests for the above
- app e2e assertions if the public route needs narrow-viewport coverage

Do not include:

- new domain package types
- token changes
- new generic `@repo/ui` primitives
- new external UI libraries
- tRPC, GraphQL, auth, database, server actions, or route handlers
- commitment form work
- broad dashboard redesign unrelated to investor records and narrow behavior

## 5. Concrete Design Rules

1. Expanded rows must reveal new operational detail.
2. Desktop investor rows must not repeat visible column labels.
3. Mobile investor rows must remain self-explanatory without a table header.
4. Secondary dashboard modules should be collapsible or subordinate on narrow
   viewports.
5. Desktop right-rail hierarchy must remain intact.
6. Money values must not clip or wrap awkwardly.
7. No wide-only layout should create horizontal scrolling on mobile.
8. Storybook must include both investor-row and narrow-dashboard review
   stories.
9. Use existing tokens and primitives.
10. Preserve all package boundaries.

## 6. Verification Checklist

Before the loop is complete:

- render `/deals/northstar-energy` at desktop width
- render `/deals/northstar-energy` at a narrow/mobile width
- inspect investor rows closed and open
- inspect the dashboard Storybook desktop review story
- inspect the dashboard Storybook narrow review story
- run `pnpm --filter @repo/kit typecheck`
- run `pnpm --filter @repo/kit lint`
- run `pnpm --filter @repo/kit test:coverage`
- run `pnpm --filter @repo/web build`
- run `pnpm --filter @repo/web e2e`
- run `pnpm storybook:build`
- run `pnpm turbo typecheck lint test`
- run `pnpm lint`
- run `git diff --check`

If browser automation is unavailable, record the exact blocker in `STATUS.md`.
If browser automation is available, this pass should not be marked complete
without desktop and narrow rendered inspection.
