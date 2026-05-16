# Kit Visual Refinement Spec

**Status:** Ready for Ralph loop
**Created:** 2026-05-08
**Scope:** `@repo/kit`, Storybook review surfaces, and app-shell verification.

This document turns the visual audit and reference research into a concrete
design and implementation target. It does not authorize broad app, auth, data,
form, or API work.

## 1. Purpose

The first `@repo/kit` loop proved that domain-shaped components can compose
cleanly inside Storybook and the Next.js app shell. The result is structurally
correct, accessible, and well tested, but the visual surface is not yet strong
enough for a public engineering case study.

This pass should move the dashboard from "generic shadcn cards assembled
together" toward a premium private-markets operations interface:

- denser but still legible
- more financial and operational
- less uniformly card-based
- clearer about deal state and investor movement
- chart-aware without becoming decorative
- robust in both wide and constrained dashboard contexts

## 2. Current Problems

### 2.1 SPV Lifecycle Needed Sidebar-Safe Variants

`SpvStateTracker` previously hard-coded a seven-column grid at large
breakpoints. That sidebar clipping bug has been fixed with `horizontal` and
`compact` variants.

The refinement loop must preserve and improve that contract:

- keep `horizontal` and `compact` display modes
- keep the dashboard sidebar on compact mode unless a stronger compact design
  replaces it
- maintain Storybook coverage for constrained-width contexts
- do not regress into clipped labels

### 2.2 Dashboard Has Weak Information Architecture

The current dashboard layout is easy to understand but too flat:

- KPI cards, progress card, lifecycle card, terms card, and investor rows all
  carry similar visual weight
- commitment progress is isolated from deal velocity
- no operational timeline exists
- no distribution view exists for ticket size, jurisdiction, investor type, or
  status
- investor rows feel like simple cards rather than a financial records surface

### 2.3 Storybook Does Not Review Product Surfaces Well Enough

Storybook currently uses centered component examples. That is useful for
primitive checks, but it hides layout problems and makes product components
feel like isolated UI samples.

Required correction:

- keep centered stories for small primitives
- add page-width review stories for `@repo/kit` dashboard blocks
- add constrained-width stories for sidebar and compact variants
- add visual regression checks only for stable surfaces

### 2.4 Tokens Are Valid But May Need More Semantics

The current tokens are contrast-checked and shadcn-compatible. They should not
be redesigned before the component direction is frozen.

Potential gaps after the visual direction is implemented:

- no explicit status palette for lifecycle/compliance states
- chart palette exists but is not yet tested in composed financial widgets
- card surface/elevation may make every panel feel equally important
- dark mode parity must be preserved if light-mode surfaces are refined

## 3. Reference Inputs

Use these as direction only. Do not copy source code or visual details blindly.

- Dribbble finance dashboards:
  <https://dribbble.com/search/finance-dashboard>
- Shadcn UI Kit:
  <https://shadcnuikit.com/>
- ShadcnSpace dashboard widgets:
  <https://shadcnspace.com/blocks/dashboard-ui/widgets-component>
- shadcn/ui charts:
  <https://ui.shadcn.com/charts>
- Tremor:
  <https://www.tremor.so/>

Observed useful patterns:

- KPI rows that combine value, delta, supporting context, and a small visual
  signal
- main dashboard charts that explain the current operating state
- compact bar lists for category distribution
- timelines/activity feeds for recent operational changes
- status trackers that adapt to the available width
- dashboard stories rendered in realistic page containers

Rejected or deferred patterns:

- decorative Dribbble-only gradients or marketing-like visual effects
- generic card grids with fake activity
- full Tremor adoption as a dependency
- D3 for this pass
- chart work that leaks domain concepts into `@repo/ui`

## 4. Design Principles

### 4.1 Product Register

The dashboard should feel like a private-market operations cockpit, not a
generic SaaS demo.

Use:

- calm financial typography
- exact money rendering
- compact and aligned metadata
- strong distinction between primary state, secondary context, and supporting
  detail
- restrained color usage
- subtle density increases where information is tabular or operational

Avoid:

- uniformly large cards
- decorative badges everywhere
- chart decoration without decision value
- empty whitespace that makes the page feel unfinished
- bright fintech/neobank styling
- dark-mode-first styling in the light dashboard

### 4.2 Data Visualizations Must Explain Work

Charts should answer operational questions:

- How close is the deal to target?
- Is commitment velocity improving?
- Are tickets concentrated in a few investors?
- Which jurisdictions or investor types dominate?
- What status is blocking closing?

Do not add charts only because dashboards conventionally contain charts.

### 4.3 Progressive Disclosure Should Reduce Noise

The dashboard should show summary state by default, then expose detail on
intent:

- investor row details
- terms detail
- lifecycle explanation
- activity item metadata

Disclosure should be handled by real accessible controls and should avoid
layout jumps where practical.

### 4.4 Visual Refinement Must Respect Package Boundaries

No visual improvement may break the architecture:

- `@repo/ui` stays domain-free
- `@repo/kit` may depend on `@repo/domain` and `@repo/ui`
- `apps/web` only integrates the product surface
- no tRPC, GraphQL, auth, database, or live data in this pass
- no `next-intl` inside `@repo/kit`

## 5. Target Dashboard Information Architecture

The refined dashboard should use this page-level structure.

### 5.1 Deal Header

Purpose: orient the user quickly.

Content:

- deal name
- short descriptor
- current SPV status
- closing date or simulated deadline, if included as static demo data
- compact action area reserved for future app-level actions, if needed

Implementation:

- may stay inside `DealDashboardDemo`
- no app routing or real actions
- no fake destructive/action-heavy controls

### 5.2 Primary Operating Row

Purpose: answer "where does this deal stand right now?"

Recommended composition:

- committed capital KPI
- target progress and remaining amount
- investor count or active investors
- SPV status/current stage

Visual direction:

- one primary metric may be larger
- supporting metrics should be compact
- avoid three identical equal-weight cards if a stronger hierarchy is possible

### 5.3 Commitment Overview

Purpose: combine progress, money, and velocity.

Content:

- radial or linear progress
- committed amount
- target amount
- remaining amount
- investor count
- optional static velocity sparkline once chart primitives exist

Dependency: chart primitives are now implemented in `@repo/ui`. Use them for
distribution and trend widgets when useful, while keeping custom SVG/radial
progress where it better matches the component's semantics.

### 5.4 SPV Lifecycle

Purpose: show status progression without overwhelming the sidebar.

Required modes:

```ts
type SpvStateTrackerVariant = 'horizontal' | 'compact'
```

`horizontal`:

- for full-width stories or page sections
- can show all statuses side by side when space allows
- should wrap gracefully before clipping

`compact`:

- for sidebars or narrow panels
- should prioritize current status and ordered progression
- can use a vertical timeline, segmented stack, or compact step list
- must not clip status labels

Optional later:

```ts
type SpvStateTrackerVariant = 'horizontal' | 'compact' | 'rail'
```

Do not introduce this third variant unless it has a real dashboard use.

### 5.5 Investor Commitments

Purpose: show investor movement and exposure.

Current row cards are acceptable as a starting point, but the refined surface
should feel more like financial records:

- stronger alignment of name, status, country, qualification, and amount
- less card-within-card feel
- clear row affordance for disclosure
- exact money alignment
- accessible expand/collapse

Possible direction:

- a table-like list using card boundaries only for the outer container
- compact rows with subtle separators
- detail drawer below the row when expanded

Do not add TanStack Table in this pass unless a later spec explicitly asks for
it.

### 5.6 Distribution Widgets

Purpose: replace generic empty space with useful operating context.

Candidate widgets:

- ticket size distribution
- investor status distribution
- jurisdiction distribution
- investor type distribution

Preferred first implementation:

- `TicketDistribution`
- `InvestorStatusBreakdown`

Why: both are directly useful to a deal lead and easy to express with static
demo data.

### 5.7 Activity Timeline

Purpose: make the dashboard feel operational.

Candidate activity items:

- wire received
- KYC submitted
- document signed
- investor invited
- reminder sent

Component:

```ts
type ActivityTimelineItem = {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly timestamp: string
  readonly tone?: 'neutral' | 'success' | 'warning'
}
```

Rules:

- visible labels are passed as props
- timestamps may be static strings in the demo block
- no real date parsing requirement in the first refinement
- no notification system

## 6. Component Scope

### 6.1 `@repo/ui`

Available chart primitives:

- `ChartContainer`
- `ChartTooltip`
- `ChartTooltipContent`
- `ChartLegend`
- `ChartLegendContent`

These are implemented and should be consumed from `@repo/ui`. Do not modify
`@repo/ui` in the kit visual refinement loop unless a verified bug blocks kit
usage and the change is narrowly documented in `STATUS.md`.

### 6.2 `@repo/kit`

Candidate components for the visual refinement loop:

- `SpvStateTracker` variants
- `CommitmentOverview` or refined `CommitmentProgress`
- `TicketDistribution`
- `InvestorStatusBreakdown`
- `ActivityTimeline`
- refined `InvestorRow`
- refined `MetricCard`
- refined `DealDashboardDemo`

Keep `MoneyDisplay` as a small exact formatting primitive.

### 6.3 `apps/web`

Only integration should change:

- if `DealDashboardDemo` API changes, update the deal route import/render
- keep route structure unchanged
- no new app-level flows in this pass

## 7. Visual Testing And Storybook Requirements

### 7.1 Storybook Stories

Required new or updated stories:

- `Kit/SpvStateTracker`:
  - horizontal/wide
  - compact/sidebar constrained width
- `Kit/DealDashboardDemo`:
  - page-width desktop review surface
  - optional narrow viewport wrapper if practical
- `Kit/CommitmentProgress` or `Kit/CommitmentOverview`:
  - under target
  - over target
  - zero target
- distribution widgets:
  - normal data
  - empty or low-data state if component supports it
- `Kit/ActivityTimeline`:
  - representative static activity list

Avoid only centered primitive stories for product components.

### 7.2 Visual Regression

Visual regression is now allowed where stable and useful.

Recommended first screenshots:

- full dashboard desktop
- SPV tracker compact/sidebar
- SPV tracker horizontal/wide

Use Playwright screenshot assertions or image snapshots only when the rendered
surface is stable enough not to create noisy churn.

### 7.3 E2E Coverage

The app E2E should continue to cover:

- homepage link to deal route
- deal route render
- investor row disclosure
- unsupported deal route

After visual refinement, add a targeted assertion that the lifecycle tracker is
not clipped only if there is a reliable DOM-level signal. Do not fake layout
coverage with brittle text checks.

## 8. Token Refinement Criteria

Do not change tokens just because the dashboard feels generic. First improve
layout and composition.

Open a targeted token pass only if one of these is true:

- chart colors cannot express multiple financial series clearly
- lifecycle/compliance statuses need semantic tones beyond primary/muted
- cards and panels cannot establish hierarchy using current border/elevation
  values
- dark mode becomes visually inconsistent after light-mode component changes

Potential additions:

```text
--status-success
--status-success-foreground
--status-warning
--status-warning-foreground
--status-info
--status-info-foreground
--surface-subtle
--surface-raised
--border-subtle
```

Any token addition must preserve shadcn compatibility and pass contrast
validation.

## 9. Non-Goals

Do not implement in the visual refinement passes:

- investor commitment form
- React Hook Form
- Zod resolver integration
- tRPC
- GraphQL
- auth/session logic
- database or API clients
- server actions
- route handlers
- TanStack Table
- TanStack Virtual
- D3
- XState
- real-time data

## 10. Recommended Implementation Sequence

### Step 1 — Fix `SpvStateTracker`

Owner: Codex in this thread.

Scope:

- add explicit variant or layout mode
- update dashboard usage to compact/sidebar-safe mode
- add constrained Storybook story
- add unit tests for variant contract
- run kit/web/storybook verification

### Step 2 — Chart Primitives Ralph Loop

Owner: Ralph loop.

Status: complete.

Scope:

- implement shadcn-compatible chart primitives in `@repo/ui`
- add Recharts dependency if needed
- add stories and tests
- do not add domain widgets

### Step 3 — Decide Token Support

Owner: Codex in this thread.

Status: no token pass before kit visual refinement. Revisit only if the kit
implementation exposes a concrete blocker.

Input:

- rendered result after lifecycle fix
- chart primitive API
- target dashboard composition

Output:

- no token changes, or
- a small token refinement prompt

### Step 4 — Kit Visual Refinement Ralph Loop

Owner: Ralph loop.

Scope:

- improve `DealDashboardDemo`
- refine metrics/progress/investor rows
- add distribution widgets and activity timeline
- use chart primitives where valuable
- improve Storybook review surfaces
- add visual regression where stable

### Step 5 — Return To Investor Commitment Flow

Only after the dashboard foundation is visually stronger.

## 11. Acceptance Criteria

The refinement work is successful when:

- `SpvStateTracker` has no visible clipping in dashboard/sidebar contexts
- the dashboard reads as an operational private-markets surface, not a generic
  card stack
- Storybook includes realistic dashboard review surfaces
- at least one distribution or activity widget adds real operational context
- chart primitives are available and consumed where they add operational value
- tests still protect accessibility, exact money rendering, and interaction
  state
- visual regression strategy is explicit and not noisy
- docs explain the package boundaries and why each pass exists

Verification baseline:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web e2e
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

## 12. Resolved Defaults

The defaults below are now frozen for the kit visual refinement Ralph loop:

1. The written spec is enough for the first Ralph loop. Add a fresh mockup only
   if the loop output still lacks visual direction.
2. Chart primitives have been added before kit refinement.
3. Visual regression is allowed but not mandatory. Add Playwright screenshots
   only for stable dashboard/lifecycle surfaces and document any browser
   environment blocker.
4. Token additions are deferred until after kit layout and chart usage expose a
   concrete need.
