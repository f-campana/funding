# Design Refinement Plan

**Status:** Tracking  
**Created:** 2026-05-08  
**Scope:** visual quality, dashboard composition, Storybook review surfaces, and
selected token support after the app shell and first kit dashboard are working.

## 1. Current State

The repository now has a complete first vertical slice:

- `@repo/core` for functional primitives
- `@repo/domain` for exact EUR money, IDs, commitment schemas, and SPV status
  transitions
- `@repo/design-tokens` and `@repo/tailwind-config` for shadcn-compatible
  light/dark tokens
- `@repo/ui` for generic shadcn/Radix-compatible primitives and chart
  infrastructure
- `@repo/kit` for product-shaped dashboard components
- `apps/web` rendering the first real route at `/deals/northstar-energy`
- `apps/storybook` rendering `ui` and `kit` stories

The implementation is structurally sound, but the rendered product surface is
not yet strong enough visually for a public portfolio or Roundtable-facing case
study.

## 2. Problems To Address

### SPV Lifecycle Layout Bug

`SpvStateTracker` hard-codes a seven-column layout at large breakpoints. Inside
the dashboard sidebar this produces squeezed columns and clipped labels.

The component needs layout modes or a container-aware structure:

- full-width horizontal lifecycle for wide surfaces
- compact or vertical lifecycle for sidebars
- explicit tests/stories covering constrained width

### Generic Dashboard Composition

The dashboard currently reads as stacked generic cards. It proves package
integration, but it does not yet feel like a premium private-markets operations
surface.

Issues:

- too many same-weight cards
- weak information hierarchy
- little operational texture
- no activity timeline
- no ticket distribution or jurisdiction breakdown
- commitment progress is visually isolated from deal velocity
- Storybook stories are mostly centered primitive demos, not product review
  surfaces

### Token Support

The tokens are valid and contrast-checked, but a refined dashboard may need a
small targeted token pass:

- surface levels beyond `background` and `card`
- status colors for lifecycle/compliance states
- chart palette tuned for financial dashboards
- elevation and border tuning to reduce the "same card everywhere" effect
- dark mode parity after light-mode refinements

Do not start with a broad token redesign. First define the target component
language, then adjust tokens only where the implementation is blocked by the
current token set.

## 3. Reference Inputs

Use these as direction, not as copy-paste sources:

- Dribbble finance dashboard search:
  <https://dribbble.com/search/finance-dashboard>
- Shadcn UI Kit:
  <https://shadcnuikit.com/>
- ShadcnSpace dashboard widgets:
  <https://shadcnspace.com/blocks/dashboard-ui/widgets-component>
- shadcn/ui charts:
  <https://ui.shadcn.com/charts>
- Tremor:
  <https://www.tremor.so/>

Useful patterns observed:

- compact KPI widgets with supporting trend context
- charts as first-class dashboard composition, not decorative inserts
- activity timelines for operational systems
- bar lists/category bars for distribution data
- status trackers that adapt to available width
- dashboard stories rendered at page width, not only centered examples

## 4. Ownership Split

### Codex In This Thread

Use direct work for high-context, judgment-heavy, or small local changes:

1. Write the design refinement brief/spec.
2. Fix the `SpvStateTracker` constrained-layout bug.
3. Decide whether the current tokens block the target design.
4. Write Ralph loop prompts and goals.
5. Review Ralph loop output and docs drift.

Why: these steps require design judgment, architectural sequencing, and tight
review of the existing code.

### Ralph Loops

Use Ralph loops for bounded implementation passes after the target is clear:

1. Chart primitives pass in `@repo/ui`.
2. Optional targeted token refinement pass in `@repo/design-tokens` and
   `@repo/tailwind-config`.
3. Kit visual refinement pass in `@repo/kit`.
4. Investor commitment flow pass after dashboard foundations are improved.

Why: these are multi-file implementation passes with tests, stories, and
verification gates. They are well-suited to an agent once the spec is precise.

## 5. Proposed Sequence

### Pass 1 — Design Refinement Spec

Owner: Codex in this thread.

Output:

- `docs/60-planning/kit-visual-refinement-spec.md`
- optionally `docs/30-testing/testing-visual-regression.md` if snapshot
  expectations need their own guide

Decisions to freeze:

- target dashboard information architecture
- SPV tracker variants
- required new kit components
- which chart primitives belong in `@repo/ui`
- which domain charts/widgets belong in `@repo/kit`
- Storybook review surfaces
- visual testing expectations

### Pass 2 — SPV Lifecycle Fix

Owner: Codex in this thread.

Scope:

- update `SpvStateTracker`
- add constrained-width Storybook story
- add or update tests for layout mode contract
- verify web app and Storybook build

Reason:

The bug is known, local, and blocking visual trust in the dashboard.

### Pass 3 — Chart Primitives

Owner: Ralph loop.

Status: complete.

Source docs:

- [chart-primitives-spec.md](../20-specs/chart-primitives-spec.md)
- [testing-chart-primitives.md](../30-testing/testing-chart-primitives.md)
- [ralph-loop-chart-primitives-prompt.md](../40-ralph-loops/ralph-loop-chart-primitives-prompt.md)

Scope:

- add Recharts dependency if not already present
- implement shadcn-compatible chart primitives in `@repo/ui`
- support CSS-variable chart config
- add stories/tests

Reason:

Charts are generic UI infrastructure. Domain-specific chart compositions should
not be implemented here.

### Pass 4 — Targeted Token Refinement

Owner: Codex or Ralph, depending on scope after the visual spec.

Status: deferred until the kit refinement exposes a concrete token blocker.

Possible scope:

- chart palette
- status palette
- surface/elevation tokens
- dark mode parity

Reason:

Tokens should support the agreed product language, not drive it prematurely.

### Pass 5 — Kit Visual Refinement

Owner: Ralph loop.

Status: complete.

Likely scope:

- redesign `DealDashboardDemo`
- improve `MetricCard`
- refine `CommitmentProgress`
- add activity timeline
- add ticket distribution/status breakdown widgets
- integrate chart primitives
- improve dashboard and constrained-layout stories
- add visual regression where stable

Reason:

This is a coherent product-surface implementation pass with enough breadth to
justify an agent loop.

### Pass 6 — Dashboard Composition V2

Owner: Ralph loop.

Status: complete.

Source docs:

- [dashboard-visual-qa.md](./dashboard-visual-qa.md)
- [ralph-loop-dashboard-composition-v2-prompt.md](../40-ralph-loops/ralph-loop-dashboard-composition-v2-prompt.md)

Scope:

- separated compact KPI rows from right-rail modules
- bounded large money typography
- improved desktop dashboard composition
- added more realistic dashboard review stories

Reason:

This pass fixed the most obvious desktop composition issues before investing in
the investor-record and mobile/narrow details.

### Pass 7 — Investor Records V2 + Mobile/Narrow Behavior

Owner: Ralph loop.

Status: complete.

Source docs:

- [investor-records-mobile-v2.md](./investor-records-mobile-v2.md)
- [ralph-loop-investor-records-mobile-v2-prompt.md](../40-ralph-loops/ralph-loop-investor-records-mobile-v2-prompt.md)

Scope:

- refine `InvestorRow` collapsed and expanded states
- reduce repeated desktop row labels
- add useful secondary operational detail in expanded rows
- improve narrow/mobile dashboard ordering and progressive disclosure
- add focused stories/tests/browser verification

Reason:

Investor records are the longest repeated surface in the dashboard. On mobile,
they define whether the page feels usable or like a desktop module stack.

### Pass 8 — Investor Commitment Flow

Owner: Ralph loop.

Reason:

The commitment flow should build on the refined UI/kit foundation, not on the
current generic dashboard layer.

### Pass 9 — Closing Readiness + Exceptions Planning

Owner: Codex in this thread.

Status: next.

Source doc:

- [current-priorities-and-rationale.md](./current-priorities-and-rationale.md)

Reason:

The dashboard is now visually and structurally credible enough to expose a
deeper product problem: it reports status but does not yet behave like an
operator workspace for blockers, readiness, ownership, and next actions.

This pass should happen before a broad public-readiness documentation pass or
another implementation loop.

## 6. Acceptance Criteria

Before returning to the investor commitment flow:

- `SpvStateTracker` renders cleanly in both wide and sidebar contexts.
- Storybook has realistic page-width dashboard review stories.
- The dashboard no longer feels like a generic card stack.
- At least one chart/data-visualization pattern is ready for kit usage.
- Visual testing strategy is explicit.
- Public docs explain why the design refinement pass exists.
- Verification remains green:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web e2e
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

## 7. Next Immediate Action

Write the `Closing Readiness + Exception Dashboard V1` planning/spec document.

Use
[current-priorities-and-rationale.md](./current-priorities-and-rationale.md)
as the current priority stack and rationale source.
