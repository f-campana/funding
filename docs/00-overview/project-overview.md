# Project Overview

This repository is a greenfield architecture and implementation exercise for a
private-markets fintech frontend. It uses a Funding-like product context
because private-market investing forces useful engineering constraints:
financial precision, jurisdiction-aware forms, strict package boundaries,
internationalization, auditability, and high-quality product surfaces.

This project is independent and is not affiliated with, endorsed by, or built
for Funding. References to Funding come from public research and are used
as product inspiration for an engineering case study.

## What To Review First

If you have five minutes:

1. Read the root [README](../../README.md) for the current repo status.
2. Read [package-boundaries.md](../10-architecture/package-boundaries.md) to understand the
   dependency architecture.
3. Read [core-adrs.md](../10-architecture/core-adrs.md) and
   [domain-adrs.md](../10-architecture/domain-adrs.md) for the main design decisions.
4. Skim the implemented package READMEs:
   [core](../../packages/core/README.md),
   [domain](../../packages/domain/README.md),
   [design-tokens](../../packages/design-tokens/README.md),
   [tailwind-config](../../packages/tailwind-config/README.md),
   [ui](../../packages/ui/README.md), and
   [kit](../../packages/kit/README.md). Then skim the implemented app README:
   [web](../../apps/web/README.md).

If you have more time, read the specs:

- [core-spec.md](../20-specs/core-spec.md)
- [domain-spec.md](../20-specs/domain-spec.md)
- [design-tokens-spec.md](../20-specs/design-tokens-spec.md)
- [ui-spec.md](../20-specs/ui-spec.md)
- [kit-spec.md](../20-specs/kit-spec.md)
- [app-shell-spec.md](../20-specs/app-shell-spec.md)
- [funding-frontend-spec.md](../50-research/funding-frontend-spec.md)

## Current Implementation

Implemented and verified:

- `@repo/core` — functional primitives for safe TypeScript:
  `Option`, `Result`, `AsyncData`, and `Future`.
- `@repo/domain` — domain-safe primitives: branded IDs, `EuroCents`,
  commitment-flow Zod schemas, and SPV lifecycle transitions.
- `@repo/design-tokens` — shadcn-compatible light/dark token source,
  generator, validator, generated CSS, and generated TypeScript exports.
- `@repo/tailwind-config` — Tailwind CSS v4 shared styles mapped to canonical
  shadcn variables.
- `@repo/ui` — generic shadcn/Radix-compatible primitives, chart
  infrastructure, shadcn monorepo configuration, Storybook stories, contract
  checks, and accessibility tests.
- `@repo/kit` — accepted product baselines: `DealCommitmentsTable`,
  `DealProgressPanel`, and their public props/state/action/label/input types.
  Older exploratory kit surfaces were removed.
- `apps/web` — Next.js App Router app shell with `next-intl`, token font/theme
  wiring, translated homepage, an app-owned Northstar operational data spine,
  a tRPC seam, route boundaries, and route work in progress under
  `/deals/northstar-energy`.
- `apps/storybook` — standalone component workspace consuming `ui` and `kit`
  stories, with locale and light/dark preview toolbar controls.

## Architectural Thesis

The repo separates computational safety, domain correctness, visual tokens, and
React components into different packages:

```text
@repo/core -> @repo/domain

@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> @repo/kit -> apps/web
```

This split keeps foundational code small and testable:

- `core` has no domain or UI knowledge.
- `domain` owns financial and regulatory vocabulary, but has no React or
  browser dependency.
- `design-tokens` owns the visual contract and emits shadcn-compatible CSS
  variables.
- `ui` stays generic and domain-free.
- `kit` composes `ui` and `domain` into product-specific surfaces.

## Key Decisions

- Financial values are represented as `EuroCents`, a branded `bigint`, not
  JavaScript floats.
- v1 is EUR-only. Multi-currency, FX, allocation, basis-point helpers, and
  rounding policies are explicitly deferred until they have dedicated ADRs.
- Forms use Zod schemas with stable message keys; user-facing copy belongs to
  the UI/i18n layer.
- The default locale is `fr-FR`.
- Design tokens expose canonical shadcn variables in both light and dark modes.
- The current token pipeline uses a small auditable generator instead of Style
  Dictionary, while preserving a DTCG-adjacent source shape for future migration.

## Verification

The implemented foundation has been verified with:

```bash
pnpm lint
pnpm turbo typecheck lint test
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
pnpm storybook:build
pnpm e2e
```

The package READMEs list package-specific verification commands.

## Next Step

The next implementation pass should wire the real Northstar route workflows to
the app-owned DTO/tRPC spine.

Why: the kit API is intentionally narrowed to accepted baselines, and the
Northstar data contract now lives in `apps/web`. The vertical should not be
called complete until the about, commitments, and documents workflows consume
that contract without reviving removed kit surfaces.

Relevant docs:

- [current-priorities-and-rationale.md](../60-planning/current-priorities-and-rationale.md)
- [closing-readiness-exception-dashboard-v1.md](../60-planning/closing-readiness-exception-dashboard-v1.md)
- [design-refinement-plan.md](../60-planning/design-refinement-plan.md)
- [kit-visual-refinement-spec.md](../60-planning/kit-visual-refinement-spec.md)
- [investor-records-mobile-v2.md](../60-planning/investor-records-mobile-v2.md)
- [private-markets-domain-roadmap.md](../60-planning/private-markets-domain-roadmap.md)
- [ui-spec.md](../20-specs/ui-spec.md)
- [kit-spec.md](../20-specs/kit-spec.md)
- [testing-ui.md](../30-testing/testing-ui.md)
- [testing-kit.md](../30-testing/testing-kit.md)
- [package-boundaries.md](../10-architecture/package-boundaries.md)
