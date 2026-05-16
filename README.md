# Funding Monorepo

Greenfield pnpm/Turbo workspace for a Funding-inspired private-markets
frontend and domain system.

This project is independent and is not affiliated with, endorsed by, or built
for Funding. References to Funding are based on public research and used
as product inspiration for an engineering case study.

The repo is built in layers. The foundation packages, generic UI primitive
layer, first product-shaped kit layer, and first Next.js app surface are now
implemented.

## For Reviewers

Start here:

- [Project overview](./docs/00-overview/project-overview.md) — purpose, current
  implementation, decisions, and review path.
- [Package boundaries](./docs/10-architecture/package-boundaries.md) — dependency rules and
  allowed imports.
- [Core ADRs](./docs/10-architecture/core-adrs.md) and
  [Domain ADRs](./docs/10-architecture/domain-adrs.md) — why the foundational choices were
  made.
- Implemented package READMEs:
  [core](./packages/core/README.md),
  [domain](./packages/domain/README.md),
  [design-tokens](./packages/design-tokens/README.md),
  [tailwind-config](./packages/tailwind-config/README.md),
  [ui](./packages/ui/README.md), and
  [kit](./packages/kit/README.md).
- Implemented app README:
  [web](./apps/web/README.md).

## Current Status

Implemented:

- `@repo/core` — functional primitives: `Option`, `Result`, `AsyncData`, and
  `Future`.
- `@repo/domain` — branded IDs, exact EUR money primitives, commitment-flow
  schemas, and SPV lifecycle helpers.
- `@repo/design-tokens` — shadcn-compatible light/dark token pipeline with
  generated CSS/TypeScript artifacts and contrast validation.
- `@repo/tailwind-config` — Tailwind CSS v4 shared styles mapped to the design
  token CSS variables.
- `@repo/ui` — generic shadcn/Radix-compatible UI primitives, chart
  infrastructure, shadcn monorepo configuration, Storybook stories, contract
  checks, and accessibility tests.
- `@repo/kit` — product-shaped composed components: money display, metrics,
  commitment progress, SPV state tracking, deal terms, investor disclosure rows,
  and a dashboard demo block.
- `apps/web` — Next.js App Router shell with `next-intl`, token font/theme
  wiring, translated homepage, Deal Operations V1 routes under
  `/deals/northstar-energy`, route-owned fixture data adapter, route
  boundaries, and Playwright e2e coverage.
- `apps/storybook` — standalone Storybook workspace consuming `ui` and `kit`
  stories, with locale and light/dark preview toolbar controls.

## Architecture

```text
@repo/core -> @repo/domain

@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> @repo/kit -> apps/web
```

Package boundaries matter:

- `core` has no domain or UI knowledge.
- `domain` may depend on `core` and `zod`, but not React, Next.js, Tailwind, or
  UI packages.
- `design-tokens` owns token source, generated CSS, generated TypeScript, and
  token validation.
- `tailwind-config` maps token CSS variables into Tailwind v4 semantic classes.
- `ui` should remain generic and domain-free.
- `kit` is where domain-aware composed product components belong.

## Workspace

- `apps/web`: Next.js App Router application, `next-intl`, default locale
  `fr-FR`.
- `apps/storybook`: standalone Storybook package.
- `packages/core`: functional algebraic data types and adapters.
- `packages/domain`: financial/domain primitives and schemas.
- `packages/design-tokens`: token source, generator, validator, generated CSS,
  and generated TypeScript.
- `packages/tailwind-config`: shared Tailwind v4 CSS-first configuration.
- `packages/ui`: generic reusable React primitives.
- `packages/kit`: composed product component layer.
- `packages/typescript-config`: shared strict TypeScript configs.
- `packages/test-config`: shared Vitest config helpers.

## Commands

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm storybook:build
pnpm e2e
```

Useful package checks:

```bash
pnpm --filter @repo/core test:coverage
pnpm --filter @repo/domain test:coverage
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens test:coverage
pnpm --filter @repo/tailwind-config typecheck
pnpm --filter @repo/ui test:coverage
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
```

Full baseline:

```bash
pnpm turbo typecheck lint test
pnpm lint
pnpm e2e
```

## Source Of Truth

Start with [docs/README.md](./docs/README.md). It classifies current specs,
historical Ralph loop prompts, research references, and superseded drafts.

Current high-authority docs:

- [Core spec](./docs/20-specs/core-spec.md)
- [Domain spec](./docs/20-specs/domain-spec.md)
- [Design tokens spec](./docs/20-specs/design-tokens-spec.md)
- [UI spec](./docs/20-specs/ui-spec.md)
- [Kit spec](./docs/20-specs/kit-spec.md)
- [App shell spec](./docs/20-specs/app-shell-spec.md)
- [Package boundaries](./docs/10-architecture/package-boundaries.md)
- [Monorepo conventions](./docs/10-architecture/monorepo-conventions.md)
- [Current priorities and rationale](./docs/60-planning/current-priorities-and-rationale.md)

## Next Work

Next planning pass: closing readiness and exception handling.

Why: the first dashboard route is now structurally credible, but the latest
UX/domain reviews exposed a deeper product-model gap. The surface still reads
more like a status report than an operator workspace. Before adding API wiring,
forms, or another broad UI pass, the repo should define closing blockers, next
actions, capital reconciliation, document completeness, ownership, and deadline
risk.

Public-readiness documentation remains important because this project may be
shared externally. It should happen after the current product thesis is captured
so the public docs explain the right next direction instead of documenting a
stale visual-refinement phase.

Relevant docs:

- [Current priorities and rationale](./docs/60-planning/current-priorities-and-rationale.md)
- [Closing readiness and exception dashboard V1](./docs/60-planning/closing-readiness-exception-dashboard-v1.md)
- [Design refinement plan](./docs/60-planning/design-refinement-plan.md)
- [Kit visual refinement spec](./docs/60-planning/kit-visual-refinement-spec.md)
- [Investor records and mobile/narrow QA](./docs/60-planning/investor-records-mobile-v2.md)
- [Private markets domain roadmap](./docs/60-planning/private-markets-domain-roadmap.md)
- [UI spec](./docs/20-specs/ui-spec.md)
- [Kit spec](./docs/20-specs/kit-spec.md)
- [Testing UI](./docs/30-testing/testing-ui.md)
- [Testing Kit](./docs/30-testing/testing-kit.md)
- [Package boundaries](./docs/10-architecture/package-boundaries.md)
