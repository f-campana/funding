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
- `/deals/northstar-energy/commitments` — DTO-backed operator commitments
  workflow using `DealCommitmentsTable` and a route-owned
  `DealCommitmentInspector` Sheet drawer.
- `/deals/northstar-energy/documents` — DTO-backed operator documents and
  evidence readiness surface using `DealDocumentsEvidence`.
- `/deals/unknown` — unsupported deal route, expected to render the app
  not-found UI.
- `/deals/unknown/overview`, `/deals/unknown/about`,
  `/deals/unknown/commitments`, and `/deals/unknown/documents` — unsupported
  nested deal routes, expected to render the app not-found UI.

## Data Boundary

Server-side App Router routes call app services directly. The deal routes load
through `app/deals/[dealId]/data.ts`, which calls
`server/deals/getDealOperationalCenter()` and then route adapters map the DTO
into kit props.

tRPC is a transport/API adapter over the same service layer. The current
`deal.getOperationalCenter` procedure is fixture-backed demo/internal access,
not production-private-data-safe API behavior. Real private deal data must add
auth, protected procedures, and output validation before expanding tRPC access.

## Integration Scope

Implemented:

- `next-intl` with default locale `fr-FR`
- `next/font` variables expected by the token system:
  `--font-geist-sans`, `--font-geist-mono`, and `--font-fraunces`
- default `data-theme="light"` on the document root
- route-level loading/error/not-found UI
- app-owned Northstar operational service/DTO spine under `server/deals`
- route data loader at `app/deals/[dealId]` that calls the service directly
- fixture-backed tRPC adapter seam under `server/trpc` and
  `app/api/trpc/[trpc]/route.ts`
- app-owned Web Vitals and route-interaction telemetry event shaping under
  `observability`
- root-mounted `WebVitalsReporter` using Next.js `useReportWebVitals`
- no-op production telemetry transport and explicit local console transport
  flag for development inspection
- Playwright e2e tests for homepage navigation, the DTO-backed overview,
  commitments, and documents routes, the commitment inspector Sheet, the
  legacy `/about` redirect, active tabs, row-open keyboard behavior, selection
  separation, mobile overflow guards, and not-found behavior

Not implemented yet:

- investor `/about` lens
- persona toggle
- investor commitment form
- React Hook Form
- GraphQL
- auth/session logic
- protected tRPC procedures for production-private deal data
- database or live data fetching
- server actions or route handlers

## Observability Boundary

The current observability layer is intentionally frontend-only and
privacy-safe. Web Vitals and route interaction events use stable route patterns
such as `/deals/[dealId]/commitments`; event metadata avoids investor emails,
investor/legal names, document labels, raw blocker descriptions, and sensitive
financial values.

Production Datadog/PostHog wiring would attach at the telemetry transport
boundary in `observability/telemetry-transport.ts`. This repository does not
include vendor SDKs, credentials, tokens, endpoints, or production telemetry
environment variables.

## Commands

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
```

See [../../docs/20-specs/app-shell-spec.md](../../docs/20-specs/app-shell-spec.md),
[../../docs/30-testing/testing-app.md](../../docs/30-testing/testing-app.md), and
[../../docs/10-architecture/package-boundaries.md](../../docs/10-architecture/package-boundaries.md).
