# Funding Monorepo

Greenfield pnpm/Turbo workspace for a Funding-inspired private-markets
frontend and domain system.

This project is independent and is not affiliated with, endorsed by, or built
for Funding. References to Funding are based on public research and used
as product inspiration for an engineering case study.

The repo is built in layers. The foundation packages, generic UI primitive
layer, narrowed product-shaped kit baselines, and an app-owned Northstar
operational data spine are now implemented.

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
- `@repo/kit` — accepted product baselines only: `DealOperationalOverview`,
  `DealProgressPanel`, `DealCommitmentsTable`, `DealCommitmentInspector`, and
  their public props/state/action/label/input types. Legacy exploratory kit
  surfaces were removed.
- `apps/web` — Next.js App Router shell with `next-intl`, token font/theme
  wiring, translated homepage, an app-owned Northstar operational data spine,
  a tRPC seam, route boundaries, and route work in progress under
  `/deals/northstar-energy`.
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

Next implementation pass: T5D-C2 — wire `DealCommitmentInspector` into the
commitments route.

Why: the accepted kit baselines and app-owned Northstar DTO/tRPC spine are the
trust boundary. The operator entry route is `/deals/northstar-energy/overview`,
with `/about` reserved for a future investor lens. The commitments route now
uses `DealCommitmentsTable`, and `DealCommitmentInspector` is the accepted
kit-first inspection surface. The next useful step is a route-owned wiring pass
that composes the inspector from app-owned commitment data without starting the
documents route or investor lens.

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
