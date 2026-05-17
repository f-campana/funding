# @repo/web

Next.js App Router application for the funding workspace.

This app is the first browser-facing integration surface. It wires the
implemented workspace layers into a real route:

```text
@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> @repo/kit -> apps/web
```

## Current Routes

- `/` — translated entry page for the case-study app.
- `/deals/northstar-energy` — redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` — DTO-backed operator overview using
  `DealOperationalOverview` with the accepted progress panel rail.
- `/deals/northstar-energy/about` — compatibility redirect to `/overview`;
  reserved for a future investor lens.
- `/deals/northstar-energy/commitments` — pending until T5D-C route wiring.
- `/deals/northstar-energy/documents` — pending until the documents route pass.
- `/deals/unknown` — unsupported deal route, expected to render the app
  not-found UI.
- `/deals/unknown/overview`, `/deals/unknown/about`,
  `/deals/unknown/commitments`, and `/deals/unknown/documents` — unsupported
  nested deal routes, expected to render the app not-found UI.

## Integration Scope

Implemented:

- `next-intl` with default locale `fr-FR`
- `next/font` variables expected by the token system:
  `--font-geist-sans`, `--font-geist-mono`, and `--font-fraunces`
- default `data-theme="light"` on the document root
- route-level loading/error/not-found UI
- app-owned Northstar operational data spine under `server/deals`
- tRPC seam under `server/trpc` and `app/api/trpc/[trpc]/route.ts`
- route data loader at `app/deals/[dealId]`
- Playwright e2e tests for homepage navigation, the DTO-backed overview route,
  the legacy `/about` redirect, active tabs, and not-found behavior

Not implemented yet:

- investor `/about` lens
- commitments and documents route workflows
- persona toggle
- investor commitment form
- React Hook Form
- GraphQL
- auth/session logic
- database or live data fetching
- server actions or route handlers

## Commands

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
```

See [../../docs/20-specs/app-shell-spec.md](../../docs/20-specs/app-shell-spec.md),
[../../docs/30-testing/testing-app.md](../../docs/30-testing/testing-app.md), and
[../../docs/10-architecture/package-boundaries.md](../../docs/10-architecture/package-boundaries.md).
