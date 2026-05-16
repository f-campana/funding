# Dashboard Visual QA

**Status:** Ready for discussion  
**Created:** 2026-05-09  
**Scope:** post-refinement visual QA for `DealDashboardDemo`, `@repo/kit`
stories, and the `apps/web` deal page.

This document captures the visual issues visible after the first kit visual
refinement pass. It is intentionally short and judgment-oriented: the next pass
should fix hierarchy, layout, and review quality before adding new product
scope.

## 1. Current Read

The dashboard is now structurally better than the first version:

- the lifecycle tracker no longer clips in the sidebar
- ticket distribution, investor status, and activity timeline add real
  operational texture
- investor rows read more like records than cards
- Storybook has better product-shaped review stories

But the screen still does not yet feel like a premium private-markets product.
It reads as a well-tested component composition with stronger widgets, rather
than a fully designed operations surface.

The next pass should be visual-composition work, not another component-expansion
pass.

## 2. Findings

### 2.1 Metric Cards Stretch Too Much

The primary row currently stretches metric cards to match the taller lifecycle
panel. This creates large empty card bodies and makes the dashboard feel
unfinished.

Fix direction:

- metrics should keep compact intrinsic height
- lifecycle should not force sibling cards to stretch vertically
- the dashboard grid should separate fixed-height KPI rows from taller sidebar
  modules
- large empty card interiors should be treated as a visual regression

Acceptance:

- no top-row metric card has an empty body taller than its useful content
- committed capital, investor count, and remaining amount read as compact KPIs
- lifecycle may be taller, but it should own its own row/column behavior

### 2.2 Money Typography Is Too Aggressive In Some Containers

The committed capital value is visually close to clipping at dashboard width.
Financial values must feel exact and stable, not oversized.

Fix direction:

- define a max display size for `MoneyDisplay` inside cards
- use tabular numbers and strong weight, but avoid hero-scale money inside
  compact dashboard cards
- allow large money only when the card/container is explicitly designed for it
- prefer a responsive `clamp()` or component variant over one-off text sizing

Acceptance:

- long EUR values do not clip or crowd the card
- money columns align cleanly in tables and metric lists
- the largest value is important, but not louder than the whole dashboard

### 2.3 Composition Is Still Too Card-Led

The dashboard now has better ingredients, but most information still sits in
similar bordered cards. The result is coherent but generic.

Fix direction:

- reduce the number of equally weighted panels
- use a stronger operating hierarchy:
  - deal header
  - compact KPI strip
  - main commitment/distribution area
  - investor records
  - right-rail operational context
- consider one or two open/sectioned regions instead of carding every module
- keep cards for repeated items, side panels, and framed tools only

Acceptance:

- the first viewport has one obvious primary read
- supporting context feels subordinate, not equally important
- the page no longer reads as a generic card grid

### 2.4 Storybook Review Surfaces Need Better Framing

Some stories are still centered in very large empty canvases. That is acceptable
for primitives, but product components need realistic containers.

Fix direction:

- keep centered stories for small primitives only
- product stories should use realistic widths:
  - desktop dashboard width
  - sidebar width
  - narrow/mobile width where relevant
- story titles/descriptions should not visually dominate the component
- stories should expose clipping, empty states, long labels, and long money
  values

Acceptance:

- each product story answers a visual review question
- dashboard stories resemble app usage, not isolated demos
- constrained stories catch layout issues before the app route does

### 2.5 Palette And Surface System Feel Flat

The parchment/forest palette is coherent, but the current dashboard is too
dominated by beige background, off-white cards, green accents, and similar
borders.

Do not start with a broad token redesign. The likely need is a targeted surface
and chart refinement after composition rules are clearer.

Possible token questions:

- should `card` be cleaner/less warm than the page background?
- do we need a quieter `surface-subtle` for sectioned regions?
- are border and shadow levels too uniform?
- do chart colors need a less decorative and more operational palette?
- does dark mode remain acceptable after any light-mode changes?

Acceptance:

- token changes, if any, are minimal and justified by a concrete visual issue
- shadcn compatibility stays intact
- light and dark modes remain mapped through canonical variables

## 3. Next Pass Scope

Recommended next pass: **dashboard composition v2**.

Owner can be Codex or Ralph, but the pass should be narrow:

- refine `DealDashboardDemo` layout
- refine `MetricCard` sizing/variants if needed
- refine `CommitmentProgress` container behavior if needed
- refine Storybook review stories for product components
- optionally make a minimal token adjustment only if required by the layout

Do not include:

- new domain models
- app data fetching
- tRPC or GraphQL
- auth/session
- investor commitment form
- new chart categories unless needed by the current dashboard
- broad token redesign
- new external UI libraries

## 4. Concrete Design Rules For The Next Pass

1. KPI cards must be compact.
2. No card should stretch only because a sibling panel is taller.
3. Long money values must fit comfortably at desktop and narrow widths.
4. Product Storybook stories must use realistic review containers.
5. The dashboard should have fewer equally weighted cards.
6. The right rail should feel operational, not like leftover modules.
7. Tables/record rows should stay denser than cards.
8. Charts must answer an operating question, not decorate the page.
9. Token changes must be small, explicit, and contrast-checked.
10. Dark mode parity is required for any visual-system change.

## 5. Verification Checklist

Before the next pass is considered complete:

- render the app route `/deals/northstar-energy`
- render the dashboard Storybook story
- capture desktop screenshots
- capture at least one narrower viewport
- inspect the KPI row for unwanted vertical stretch
- inspect all money values for clipping or awkward wrapping
- inspect lifecycle compact and horizontal stories
- inspect investor rows collapsed and expanded
- run existing typecheck/lint/test/build gates
- record any browser/e2e blocker with exact error text

If the browser tooling remains blocked locally, use the best available
server-render/build evidence, but do not treat that as a substitute for visual
QA once a browser is available.

