# @repo/web

Next.js App Router application for the funding workspace.

This app is the first browser-facing integration surface. It wires the
implemented workspace layers into a real route:

```text
@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> apps/web
```

## Current Routes

- `/` — translated entry page for the case-study app.
- `/deals/northstar-energy` — redirects to `/deals/northstar-energy/about`.
- `/deals/northstar-energy/about` — temporary deal workspace placeholder.
- `/deals/northstar-energy/commitments` — temporary commitment placeholder.
- `/deals/northstar-energy/documents` — temporary document placeholder.
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
- route-owned deal support registry at `app/deals/[dealId]/data.ts`
- Playwright e2e tests for homepage navigation, temporary deal route rendering,
  active tabs, and not-found behavior

Not implemented yet:

- rebuilt deal workspace components
- app-owned deal adapter or live data shape
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
