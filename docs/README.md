# Docs Index

This directory contains current specifications, architectural decisions,
testing guidance, Ralph loop history, research notes, planning documents, and
archived drafts.

When in doubt, prefer the current source-of-truth documents over historical
prompts or archived drafts.

## Directory Map

```text
docs/
  00-overview/       public-facing project orientation
  10-architecture/   package boundaries, ADRs, repo conventions
  20-specs/          implemented package and app specifications
  30-testing/        testing strategies by layer
  40-ralph-loops/    historical agent prompts and /goal texts
  50-research/       product, UI, and local-project research
  60-planning/       active plans for upcoming implementation passes
  archive/           superseded templates and drafts
```

## Current Source Of Truth

- [Project overview](./00-overview/project-overview.md) — public-facing
  overview, current implementation status, review path, and next step.
- [Package boundaries](./10-architecture/package-boundaries.md) — workspace
  dependency boundaries and allowed imports.
- [Monorepo conventions](./10-architecture/monorepo-conventions.md) — repo
  structure, TypeScript conventions, scripts, and verification commands.
- [Core ADRs](./10-architecture/core-adrs.md) — architectural decisions for
  `@repo/core`.
- [Domain ADRs](./10-architecture/domain-adrs.md) — architectural decisions for
  `@repo/domain`.
- [TypeScript patterns for core](./10-architecture/ts-patterns-for-core.md) —
  implementation patterns used by the core package.

## Implemented Specs

- [Core spec](./20-specs/core-spec.md) — implemented `@repo/core` API and
  invariants.
- [Domain spec](./20-specs/domain-spec.md) — implemented `@repo/domain` API and
  invariants.
- [Domain reconciliation spec](./20-specs/domain-reconciliation-spec.md) —
  implemented `@repo/domain/reconciliation` capital/payment reconciliation
  vocabulary and exact-money summary helpers.
- [Design tokens spec](./20-specs/design-tokens-spec.md) — implemented
  `@repo/design-tokens` source shape, generation, validation, and Tailwind v4
  mapping.
- [Status tokens spec](./20-specs/status-tokens-spec.md) — implemented
  semantic status/readiness token contract for the closing-readiness dashboard.
- [UI spec](./20-specs/ui-spec.md) — implemented `@repo/ui` API, boundaries,
  shadcn compatibility requirements, and verification gates.
- [Chart primitives spec](./20-specs/chart-primitives-spec.md) — implemented
  Recharts/shadcn-compatible generic chart infrastructure for `@repo/ui`.
- [Kit spec](./20-specs/kit-spec.md) — current narrowed `@repo/kit` API,
  package boundary, and accepted `DealCommitmentsTable`,
  `DealOperationalOverview`, and `DealProgressPanel` baselines.
- [Closing readiness dashboard V1 spec](./20-specs/closing-readiness-dashboard-v1-spec.md) —
  historical kit-level readiness implementation spec. Its deleted component
  surfaces are no longer current kit API.
- [App shell spec](./20-specs/app-shell-spec.md) — implemented `apps/web`
  integration shell, route structure, font/theme wiring, and app-level
  boundaries.

## Proposed Specs

- [Northstar deal workspace product design spec](./20-specs/northstar-deal-workspace-product-design-spec.md) —
  source-of-truth product design spec for the operator-first Northstar vertical,
  route IA, persona model, Roundtable-inspired visual grammar, and kit-to-app
  composition rules.
- [tRPC core readiness slice spec](./20-specs/trpc-core-readiness-slice-spec.md) —
  proposed single vertical slice for proving `tRPC`, `@repo/core`, domain
  reconciliation, and `ts-pattern` inside `apps/web`.

## Testing Guidance

- [Testing core](./30-testing/testing-core.md) — core package testing
  philosophy.
- [Testing domain](./30-testing/testing-domain.md) — domain package testing
  philosophy.
- [Testing domain reconciliation](./30-testing/testing-domain-reconciliation.md) —
  testing guide for committed/signed/received/matched capital reconciliation.
- [Testing UI](./30-testing/testing-ui.md) — UI primitive testing strategy.
- [Testing chart primitives](./30-testing/testing-chart-primitives.md) —
  generic chart primitive testing strategy.
- [Testing status tokens](./30-testing/testing-status-tokens.md) — testing and
  validation guide for the targeted status/readiness token pass.
- [Testing kit](./30-testing/testing-kit.md) — composed product component
  testing strategy.
- [Testing closing readiness dashboard](./30-testing/testing-closing-readiness-dashboard.md) —
  testing guide for readiness states, local blocker interactions,
  reconciliation rendering, mobile behavior, and app e2e assertions.
- [Testing app](./30-testing/testing-app.md) — app-shell and Playwright testing
  strategy for the first Next.js surface.

## Active Planning

- [Current priorities and rationale](./60-planning/current-priorities-and-rationale.md) —
  short-term priority stack, rationale, deferred findings, and the current next
  action.
- [Closing readiness and exception dashboard V1](./60-planning/closing-readiness-exception-dashboard-v1.md) —
  product model and scope guard for turning the static dashboard into a
  private-markets operator workspace.
- [Design refinement plan](./60-planning/design-refinement-plan.md) — tracking
  plan for the dashboard, Storybook, chart, token, and kit visual refinement
  sequence.
- [Kit visual refinement spec](./60-planning/kit-visual-refinement-spec.md) —
  target specification for improving the current `@repo/kit` product surface.
- [Dashboard visual QA](./60-planning/dashboard-visual-qa.md) —
  post-refinement visual audit and scope guard for the next dashboard
  composition pass.
- [Investor records and mobile/narrow QA](./60-planning/investor-records-mobile-v2.md) —
  current scope guard for the next investor-record and narrow-dashboard pass,
  including deferred findings outside that loop.
- [Private markets domain roadmap](./60-planning/private-markets-domain-roadmap.md) —
  practical implementation sequence for SPV, compliance, payment, commitment,
  club, and fund domain expansion.

## Ralph Loop History

These files are useful for audit and repeatability. They are not the best place
to discover the current API after a loop has completed.

- [Repo bootstrap prompt](./40-ralph-loops/repo-bootstrap-prompt.md)
- [Repo bootstrap spec](./40-ralph-loops/repo-bootstrap-spec.md)
- [Core loop prompt](./40-ralph-loops/ralph-loop-1-prompt.md)
- [Domain loop prompt](./40-ralph-loops/ralph-loop-domain-prompt.md)
- [Domain loop goal](./40-ralph-loops/ralph-loop-domain-goal.md)
- [Domain reconciliation loop prompt](./40-ralph-loops/ralph-loop-domain-reconciliation-prompt.md)
- [Design tokens loop prompt](./40-ralph-loops/ralph-loop-design-tokens-prompt.md)
- [Design tokens loop goal](./40-ralph-loops/ralph-loop-design-tokens-goal.md)
- [Status tokens loop prompt](./40-ralph-loops/ralph-loop-status-tokens-prompt.md)
- [Status tokens loop goal](./40-ralph-loops/ralph-loop-status-tokens-goal.md)
- [UI loop prompt](./40-ralph-loops/ralph-loop-ui-prompt.md)
- [UI loop goal](./40-ralph-loops/ralph-loop-ui-goal.md)
- [Kit loop prompt](./40-ralph-loops/ralph-loop-kit-prompt.md)
- [Kit loop goal](./40-ralph-loops/ralph-loop-kit-goal.md)
- [App shell loop prompt](./40-ralph-loops/ralph-loop-app-shell-prompt.md)
- [App shell loop goal](./40-ralph-loops/ralph-loop-app-shell-goal.md)
- [Chart primitives loop prompt](./40-ralph-loops/ralph-loop-chart-primitives-prompt.md)
- [Chart primitives loop goal](./40-ralph-loops/ralph-loop-chart-primitives-goal.md)
- [Kit visual refinement loop prompt](./40-ralph-loops/ralph-loop-kit-visual-refinement-prompt.md)
- [Kit visual refinement loop goal](./40-ralph-loops/ralph-loop-kit-visual-refinement-goal.md)
- [Dashboard composition v2 loop prompt](./40-ralph-loops/ralph-loop-dashboard-composition-v2-prompt.md)
- [Dashboard composition v2 loop goal](./40-ralph-loops/ralph-loop-dashboard-composition-v2-goal.md)
- [Investor records mobile v2 loop prompt](./40-ralph-loops/ralph-loop-investor-records-mobile-v2-prompt.md)
- [Investor records mobile v2 loop goal](./40-ralph-loops/ralph-loop-investor-records-mobile-v2-goal.md)
- [Closing readiness dashboard v1 loop prompt](./40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-prompt.md)
- [Closing readiness dashboard v1 loop goal](./40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-goal.md)

## Reference And Research

These documents inform direction and product thinking. They may contain
illustrative examples that predate the implemented package APIs.

- [Funding product notes](./50-research/funding.md)
- [Funding frontend spec](./50-research/funding-frontend-spec.md)
- [Roundtable research](./50-research/roundtable-research.md)
- [Funding mockup v3](./50-research/funding-mockup-v3.html)
- [FODMAP UI patterns](./50-research/fodmapp-ui-patterns.md)

## Archive

- [Biome template](./archive/biome.json) — historical Biome configuration
  template. The live configuration is the root [biome.json](../biome.json).
- [Commitment flow schema draft](./archive/commitment-flow.schemas.ts) —
  historical draft used to design the domain schemas. The implemented source of
  truth is
  [packages/domain/src/commitment-flow/commitment-flow.ts](../packages/domain/src/commitment-flow/commitment-flow.ts).

## Implemented READMEs

- [apps/web](../apps/web/README.md)
- [packages/core](../packages/core/README.md)
- [packages/domain](../packages/domain/README.md)
- [packages/design-tokens](../packages/design-tokens/README.md)
- [packages/tailwind-config](../packages/tailwind-config/README.md)
- [packages/ui](../packages/ui/README.md)
- [packages/kit](../packages/kit/README.md)
