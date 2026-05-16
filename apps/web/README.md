# @repo/web

Next.js App Router application for the funding workspace.

This app is the first browser-facing integration surface. It wires the
implemented workspace layers into a real route:

```text
@repo/domain -> @repo/kit -> apps/web
@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> @repo/kit -> apps/web
```

## Current Routes

- `/` — translated entry page for the case-study app.
- `/deals/northstar-energy` — redirects to `/deals/northstar-energy/about`.
- `/deals/northstar-energy/about` — fixture-backed deal operations overview.
- `/deals/northstar-energy/commitments` — investor operations and commitment
  inspection.
- `/deals/northstar-energy/documents` — document requirement completeness.
- `/deals/unknown` — unsupported deal route, expected to render the app
  not-found UI.
- `/deals/unknown/about`, `/deals/unknown/commitments`, and
  `/deals/unknown/documents` — unsupported nested deal routes, expected to
  render the app not-found UI.

## Integration Scope

Implemented:

- `next-intl` with default locale `fr-FR`
- `next/font` variables expected by the token system:
  `--font-geist-sans`, `--font-geist-mono`, and `--font-fraunces`
- default `data-theme="light"` on the document root
- route-level loading/error/not-found UI
- route-owned deal data adapter at `app/deals/[dealId]/data.ts`, which is the
  app boundary for fixture-backed deal operations data
- Playwright e2e tests for homepage navigation, deal route rendering,
  active tabs, disclosure interaction, not-found behavior, and screenshot
  capture

Not implemented yet:

- investor commitment form
- React Hook Form
- tRPC or GraphQL
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
