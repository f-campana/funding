# Web Vitals, Bundle, RSC, Caching, And Observability Audit

Status: Audit findings
Created: 2026-05-18
Scope: `apps/web`, `packages/ui`, `packages/kit`, App Router route behavior, production feedback loops

## Executive Summary

The current app is functionally healthy but performance and production
operability have started to drift. The highest-risk issues are not images,
third-party scripts, or obvious layout instability. They are:

- client JavaScript pulled into every route through root package barrels,
- read-only product surfaces implemented as broad client components,
- fixture-backed routes rendered dynamically with private no-store headers,
- a fixture-backed public tRPC demo seam that is not production-private-data safe,
- no production telemetry or Web Vitals feedback loop.

Fresh local verification passed:

```text
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
```

The production build passed, and the Playwright suite passed 13/13 tests.
That is good coverage for route behavior and overflow regressions, but it does
not currently protect Core Web Vitals, route bundle budgets, caching behavior,
or production diagnostics.

The fresh build produced this route JavaScript baseline from
`.next/diagnostics/route-bundle-stats.json`:

| Route | First-load uncompressed JS | Chunks |
| --- | ---: | ---: |
| `/` | 928.9 KiB | 12 |
| `/_not-found` | 928.9 KiB | 12 |
| `/deals/[dealId]` | 1040.9 KiB | 16 |
| `/deals/[dealId]/about` | 1040.9 KiB | 16 |
| `/deals/[dealId]/overview` | 1040.9 KiB | 16 |
| `/deals/[dealId]/documents` | 1040.9 KiB | 16 |
| `/deals/[dealId]/commitments` | 1043.9 KiB | 17 |

The largest single cause is unused `recharts` reaching every route through the
root `@repo/ui` export. The Recharts chunk is about 378.6 KiB raw. Every route,
including `/`, currently includes it even though no production app path renders
a chart.

## Reference Standards

This audit uses the current Core Web Vitals model from web.dev:

- LCP: good at or below 2500 ms, poor above 4000 ms.
- INP: good at or below 200 ms, poor above 500 ms.
- CLS: good at or below 0.1, poor above 0.25.
- Classification should be based on the 75th percentile of page views.

Sources:

- [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Web Vitals measurement](https://web.dev/articles/vitals)
- [Next.js `generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js caching deep dive](https://nextjs.org/docs/app/deep-dive/caching)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## Audit Method

The work was split across four review lanes, then consolidated with a local
verification pass:

1. Web Vitals and frontend runtime performance.
2. Bundle size and dependency footprint.
3. App Router, RSC tradeoffs, data fetching, and caching.
4. Observability, diagnostics, CI, and measurement.

Local verification included:

- reading App Router files, package exports, shared package code, and tests,
- running a fresh `@repo/web` production build,
- reading `.next/diagnostics/route-bundle-stats.json`,
- inspecting `.next/static/chunks`,
- probing production response headers from `next start`,
- running the production Playwright suite.

No source files were changed during the audit before this document was written.

## Severity Definitions

- P1: high user or production risk; should be addressed before adding more
  feature surface on top of the current architecture.
- P2: meaningful performance, scalability, or maintainability risk; should be
  scheduled deliberately.
- P3: smaller drift or hygiene issue; fix when touching adjacent code or when
  the larger bundle/RSC work is underway.

## P1 Findings

### 1. Unused Recharts Ships On Every Route Through `@repo/ui`

Evidence:

- `packages/ui/src/index.ts` re-exports chart components from the root package
  export.
- `packages/ui/src/components/chart.tsx` imports `recharts`.
- App files that only need simple UI helpers import from the root barrel:
  - `apps/web/app/loading.tsx`
  - `apps/web/app/error.tsx`
  - `apps/web/app/deals/[dealId]/deal-app-shell.tsx`
  - `apps/web/app/deals/[dealId]/deal-tabs.tsx`
  - `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- Production chunk inspection found
  `.next/static/chunks/16aod5l2.bkf_.js` at about 378.6 KiB raw, containing
  Recharts.
- Every route includes that chunk.

Rationale:

This is the largest concrete bundle problem found. It hurts all three user
experience axes that matter for this app:

- LCP: extra JavaScript competes with CSS, fonts, and main content parsing.
- INP: hydration and script evaluation consume main-thread time before and
  during early interaction.
- Operational confidence: future changes can silently import heavier UI code
  through the same root barrel without a visible diff in app routes.

This is especially costly because charts are not currently used in production
app paths. The app pays the cost for a capability it does not display.

Recommendation:

- Stop exporting chart components from the root `@repo/ui` barrel, or stop
  importing root `@repo/ui` from client files.
- Use direct subpath imports for client files:
  - `@repo/ui/components/button`
  - `@repo/ui/components/skeleton`
  - `@repo/ui/components/sheet`
  - `@repo/ui/lib/utils`
- Keep chart components available only through an explicit chart entrypoint.
- If charts become route-visible later, lazy-load them or isolate them to the
  route that actually needs them.

Acceptance criteria:

- `/` no longer includes the Recharts chunk.
- Route bundle stats drop by at least the raw Recharts chunk amount or an
  equivalent measured amount.
- CI has a route bundle budget that would catch this regression.

### 2. The `@repo/kit` Root Barrel Collapses Deal Widgets Into Shared Client JS

Evidence:

- `packages/kit/package.json` exposes only `"."`.
- `packages/kit/src/index.ts` re-exports commitments, deal overview, progress
  panel, and document evidence together.
- App routes import from `@repo/kit` at:
  - `apps/web/app/deals/[dealId]/overview/page.tsx`
  - `apps/web/app/deals/[dealId]/documents/page.tsx`
  - `apps/web/app/deals/[dealId]/deal-operational-rail.tsx`
  - `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- All non-commitment deal routes report the same first-load JS size, about
  1040.9 KiB uncompressed.
- Client manifests map commitments table, commitment inspector, operational
  overview, progress panel, and document evidence into the same route client
  graph.

Rationale:

The deal routes should not all pay for every deal widget. Overview, documents,
commitments, progress rail, and inspector surfaces have different interaction
needs and different route visibility. The root barrel makes those boundaries
hard for the bundler to preserve once any client component crosses the package
boundary.

This also weakens RSC. The App Router pages are server components, but the
moment they import broad client package entrypoints, route-level static work
turns into a large shared hydration surface.

Recommendation:

- Add kit subpath exports for production surfaces, for example:
  - `@repo/kit/deal-progress-panel`
  - `@repo/kit/deal-operational-overview`
  - `@repo/kit/deal-documents-evidence`
  - `@repo/kit/deal-commitments-table`
  - `@repo/kit/deal-commitment-inspector`
- Update app imports to use only the specific surface required by each route.
- Consider dynamically loading the commitment inspector drawer because it is
  only needed after a row-open interaction.

Acceptance criteria:

- `/deals/[dealId]/overview` does not include commitments table or inspector
  modules in its client graph.
- `/deals/[dealId]/documents` does not include commitments table or overview
  modules unless explicitly needed.
- Route-level bundle stats differ according to actual route surface area.

### 3. The Public tRPC Demo Seam Must Not Become Production Private Data

Evidence:

- `apps/web/app/api/trpc/[trpc]/route.ts` exports both `GET` and `POST`.
- `apps/web/server/trpc/context.ts` returns an empty context.
- `apps/web/server/trpc/routers/deal-router.ts` uses `publicProcedure`.
- The deal operational DTO includes investor and operational data.
- The current fixture includes investor contact details.

Rationale:

This is a production-readiness issue and a caching issue. The RSC app path
already reads server data directly, so tRPC is not needed for the current
visible app route behavior. Keeping the fixture-backed procedure is acceptable
only when it is clearly treated as demo/internal API access over synthetic data.

Private deal operations data should not be publicly queryable, and API logs
should be correlated and redacted before this becomes a production data path.

Recommendation:

- Keep the RSC direct service read for route loading.
- Treat `deal.getOperationalCenter` as fixture-backed demo/internal access.
- Before exposing production-private deal data through tRPC, add real auth in
  `createTrpcContext`, convert the deal procedure to a protected procedure,
  attach request ids, validate outputs, and set explicit private/no-store
  behavior.

Acceptance criteria:

- Architecture docs state that RSC routes call app services directly and tRPC is
  a client/API/future-mutation adapter over those services.
- The current public deal tRPC read is documented as fixture-backed demo access,
  not production-private-data safe.
- Server logs include route/procedure, request id, duration, status, and
  sanitized error metadata.
- A future request to a production-private deal tRPC endpoint cannot read
  operational data without authorization.

### 4. Production Observability Is Essentially Absent

Evidence:

- `apps/web/package.json` has no Sentry, Datadog, OpenTelemetry, Vercel
  Analytics, Speed Insights, or `web-vitals` dependency.
- There is no `instrumentation.ts`.
- `apps/web/app/layout.tsx` renders fonts, `NextIntlClientProvider`, and
  children, but no RUM or analytics component.
- Error boundaries receive an `error` type but only use `reset`:
  - `apps/web/app/error.tsx`
  - `apps/web/app/deals/[dealId]/error.tsx`
- `apps/web/app/api/trpc/[trpc]/route.ts` delegates directly to
  `fetchRequestHandler` with no structured start/done/error logging.

Rationale:

The repo cannot currently answer basic production questions:

- Which route regressed LCP or INP?
- Which release introduced an error?
- Which procedure failed and how long did it run?
- Did an error happen in the browser, the RSC render, or the API route?
- Are users seeing slow hydration on mobile?

Without telemetry, performance and reliability problems will be found late,
usually by manual testing or user reports. That is exactly the feedback loop
the app should avoid before adding live private-market workflows.

Recommendation:

- Add a minimal observability baseline:
  - `instrumentation.ts` for server-side startup instrumentation,
  - browser error capture from error boundaries,
  - route/procedure structured logs,
  - release/environment tags,
  - request ids from platform headers where available,
  - PII redaction rules for deal, investor, and document data.
- Add either Vercel Speed Insights/Web Analytics or an equivalent RUM provider.
- Track Web Vitals by route template, not raw private ids.

Acceptance criteria:

- Browser and server errors are reported with release/environment and route
  context.
- tRPC or route-handler failures emit structured logs.
- Web Vitals are visible per route family in preview and production.
- Sensitive investor/deal payloads are not logged.

## P2 Findings

### 5. Fixture-Backed Deal Pages Render Dynamically Instead Of Being Statically Constrained

Evidence:

- `apps/web/server/deals/operational-center-service.ts` only supports
  `northstar-energy`.
- The route data path is synchronous and fixture-backed through
  `apps/web/app/deals/[dealId]/data.ts`.
- Fresh `next build` output marks deal routes as dynamic.
- `.next/prerender-manifest.json` contains `/` and `/_not-found`, but no deal
  routes.
- Production header probe for `/deals/northstar-energy/overview` returned:
  `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.

Rationale:

For the current case-study app, the deal route has a known finite parameter
set and deterministic data. Dynamic SSR adds avoidable TTFB and prevents full
route cache use for the primary product surface. That matters for LCP because
server response time is part of the user-visible load path.

There is one important nuance: if these routes are about to become private and
live, then dynamic rendering can be the right choice. The problem is ambiguity.
The current implementation behaves like private live data, while the current
data source behaves like static demo data.

Recommendation:

- For the current demo/case-study shape:
  - add `generateStaticParams` for `{ dealId: 'northstar-energy' }`,
  - add `dynamicParams = false`,
  - keep unsupported deals as 404.
- For the future private/live shape:
  - explicitly set the route to dynamic,
  - colocate auth checks,
  - keep response caches private or no-store as appropriate.

Acceptance criteria:

- The route rendering mode matches the data classification.
- Static demo routes show up in the prerender manifest.
- Private live routes have explicit auth and no accidental public caching.

### 6. Deal Data Is Loaded Repeatedly Without Request Memoization Or Invalidation Strategy

Evidence:

- `apps/web/app/deals/[dealId]/layout.tsx` calls `getDealOperationsData`.
- Each page calls it again:
  - `overview/page.tsx`
  - `commitments/page.tsx`
  - `documents/page.tsx`
- `apps/web/app/deals/[dealId]/data.ts` calls the service directly.
- No source file uses React `cache()`, `server-only`, `revalidateTag`,
  `cacheTag`, or `cacheLife`.

Rationale:

Today this is cheap because the service reads a fixture. Once the same seam
backs real persistence, repeated route/layout reads will duplicate database or
service work unless request memoization is added. More importantly, the repo
does not yet encode the intended invalidation model for live deal operations.

There are three valid future strategies, but the code should choose one:

1. Per-request memoization only, with private no-store SSR.
2. Tagged server cache with explicit invalidation after mutations.
3. Static/ISR route cache for public or demo data.

Recommendation:

- Add `import 'server-only'` to server loaders and services that must never
  cross into client code.
- Wrap `getDealOperationsData` in React `cache()` for request dedupe.
- When mutations land, choose either no-store private SSR or tagged
  invalidation with route-specific cache tags.

Acceptance criteria:

- Layout and page reads dedupe within one RSC render.
- Server-only imports fail fast if a client component imports server code.
- Cache behavior is documented next to the loader.

### 7. Read-Only Product Surfaces Are Hydrated As Broad Client Components

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx`
  is a client component.
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx`
  is a client component.
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.tsx` is a
  client component.
- These surfaces are mostly deterministic rendering of props.
- The commitments table genuinely needs client state, but overview,
  documents, and much of the progress rail do not.

Rationale:

RSC is currently helping at route boundaries: route pages load data on the
server and pass props down. The underuse is inside the shared product surfaces.
Large read-only views are hydrated even when their content could be rendered as
server HTML with small client islands for the few interactive controls.

This has a direct Web Vitals effect. Less hydration generally means less
main-thread work before interaction, better INP headroom, and fewer bundle
dependencies in first-load JS.

Recommendation:

- Split static ready-state renderers into server-compatible components.
- Keep client islands for:
  - active tabs,
  - retry/action buttons,
  - table controls,
  - sheet/drawer behavior,
  - row selection/search/filter state.
- Avoid package-root client imports from server components.

Acceptance criteria:

- Overview and document evidence routes can render their static content
  without hydrating the full surface.
- Client boundaries are visible and intentionally small.
- Route bundle stats drop for overview and documents.

### 8. Commitments Hydrates Inspector Detail Before Any Row Is Opened

Evidence:

- `apps/web/app/deals/[dealId]/commitments/page.tsx` builds table and
  inspector view models up front.
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts` creates
  `propsByInvestorId` for every investor.
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx` keeps
  that full map in the client workspace and selects from it on row open.

Rationale:

This is acceptable for the current small fixture. It will not scale well when
investor counts and document evidence grow. The initial commitments route pays
the RSC payload, serialization, hydration memory, and JavaScript cost for
inspector content that may never be opened.

Recommendation:

- Send only table rows and the minimum row-open metadata in the initial route.
- Fetch or server-render inspector detail on demand:
  - route segment,
  - parallel route,
  - server action,
  - route handler,
  - or suspense-backed client fetch, depending on the chosen architecture.
- Add `useDeferredValue` or transitions for search/filter interactions before
  scaling row counts.

Acceptance criteria:

- Initial commitments payload does not include full inspector props for every
  investor.
- Opening a row still feels responsive.
- Search/filter INP remains within budget on realistic row counts.

### 9. Loading And Error Boundaries Participate In First-Load JS

Evidence:

- `apps/web/app/loading.tsx` and
  `apps/web/app/deals/[dealId]/loading.tsx` are client components only to call
  `useTranslations`.
- Both import `Skeleton` from root `@repo/ui`.
- Error boundaries must be client components, but they import `Button` from
  root `@repo/ui`.

Rationale:

Loading UI and error UI are supposed to be cheap guardrails. Here they
participate in the same barrel-driven client graph that pulls in large shared
dependencies. That increases first-load JS even for simple routes.

Recommendation:

- Make loading states server/static where possible.
- Use plain CSS skeletons or direct `Skeleton` subpath imports.
- Keep error boundaries client, but use direct `Button` subpath imports.
- Consider route-local fallback text instead of client translations for
  loading states if it avoids a provider dependency.

Acceptance criteria:

- Loading/error fallbacks do not import root `@repo/ui`.
- `/` no longer includes heavy UI chunks only because of fallback components.

### 10. Performance Measurement Is Functional, Not Web Vitals-Oriented

Evidence:

- `apps/web/tests/e2e/homepage.spec.ts` has useful route behavior and
  horizontal overflow checks.
- `apps/web/playwright.config.ts` runs only Desktop Chrome.
- There are no tests for:
  - LCP,
  - CLS,
  - INP proxy metrics,
  - long tasks,
  - navigation timing,
  - resource count,
  - route bundle budget.
- There is no CI workflow in the repo to run and publish these checks.

Rationale:

The current tests would not catch the Recharts regression, a route bundle size
jump, a font preload regression, a mobile-only CLS issue, or a slow hydration
path. Functional correctness is necessary but insufficient for a product UI
that should stay fast while the surface area grows.

Recommendation:

- Add a production-server performance spec for:
  - `/`,
  - `/deals/northstar-energy/overview`,
  - `/deals/northstar-energy/commitments`,
  - `/deals/northstar-energy/documents`.
- Record:
  - navigation timing,
  - LCP,
  - CLS,
  - long task count/duration,
  - script/font resource counts,
  - total JS transfer and uncompressed route JS.
- Add mobile and desktop projects.
- Add CI reporters that preserve Playwright traces/screenshots and a machine
  readable budget report.

Acceptance criteria:

- A route bundle increase fails CI when it exceeds the agreed budget.
- Performance specs run against `next build` + `next start`, not only dev.
- Mobile viewport is covered.

## P3 Findings

### 11. Fonts Are Slightly Over-Provisioned

Evidence:

- `apps/web/app/layout.tsx` imports Geist, Geist Mono, and Fraunces globally.
- Fraunces loads four weights.
- Production search did not find active `font-serif` usage in app code.
- `.next/static/media` contains about 229.4 KiB of font files.
- The homepage preloads three font files.

Rationale:

`next/font` with `display: swap` reduces CLS risk, but non-critical preloaded
fonts still compete for network and preload priority during LCP. The current
homepage appears to need the sans font, not the global serif family.

Recommendation:

- Remove Fraunces until it is used, or set it to `preload: false`.
- Scope display/mono fonts to the routes or components that need them.

### 12. Dependency Footprint Has Avoidable Drift

Evidence:

- `lucide-react` is a `@repo/kit` dependency and is imported across many kit
  files.
- `@repo/tailwind-config` is included in `transpilePackages` even though it is
  CSS-oriented for the web app.

Rationale:

These are not the primary route-size drivers today, but they are easy places
for future drift. Icon packages and CSS config packages should not become
hidden reasons for route bundles or build work to grow.

Recommendation:

- Add `optimizePackageImports: ['lucide-react']` in `next.config.ts`, or switch
  to explicit direct icon imports if preferred.
- Remove `@repo/tailwind-config` from `transpilePackages` unless there is a
  measured reason it must be transpiled.

### 13. `server-only` Boundaries Need To Stay In Place

Evidence:

- Route data loaders and server deal entrypoints should import `server-only`.
- `apps/web/app/deals/[dealId]/data.ts` imports the server deal service.
- Server deal modules are app-private and should not be imported by client
  components.

Rationale:

The current code is mostly correct by convention, but conventions weaken under
feature pressure. `server-only` provides a build-time guardrail that prevents
future client imports from pulling server data loaders or sensitive code into
the client graph.

Recommendation:

- Keep `import 'server-only'` on route data loaders and server deal entrypoints.
- Keep app services out of `@repo/kit` and `@repo/ui`.

### 14. Analytics Dimensions Need Canonical Route Params

Evidence:

- Deal links and redirects use the raw `dealId` param.
- Existing planning docs already flag canonical slug risks for permissions,
  cache keys, and analytics.

Rationale:

Once telemetry is added, raw route params can create high-cardinality or
duplicated dimensions. For private-market data, raw ids can also leak customer
or investor context into logs and analytics.

Recommendation:

- Add an app-local slug schema/canonicalizer.
- Use canonical route templates and safe ids for logs, analytics, cache tags,
  and redirects.

## Current Clean Areas

The audit also found several good signs:

- No production `next/image`, raw `<img>`, `next/script`, or third-party embed
  problems were found in the audited app paths.
- The App Router pages and layouts are server components by default.
- The route adapters keep most app data shaping outside `@repo/kit`.
- The Playwright suite covers real route behavior and mobile overflow checks.
- `next/font` uses `display: swap`, reducing font-related CLS risk.
- The app has no global client state library drift for these performance
  concerns.

## Recommended Implementation Order

1. Remove the Recharts route tax:
   - stop root `@repo/ui` client imports,
   - isolate chart exports,
   - verify `/` no longer loads the chart chunk.

2. Add granular `@repo/kit` exports:
   - update route imports,
   - verify overview/documents/commitments have different client graphs.

3. Decide route data classification:
   - static demo with `generateStaticParams` and `dynamicParams = false`, or
   - private live dynamic routes with auth and no-store.

4. Add observability baseline:
   - error reporting,
   - structured server logs,
   - Web Vitals/RUM,
   - request correlation,
   - redaction policy.

5. Split RSC/client surfaces:
   - convert read-only overview/documents sections to server-compatible
     renderers,
   - keep small client islands for actions and controls.

6. Add guardrails:
   - route bundle budgets,
   - mobile performance specs,
   - CI artifacts,
   - server-only imports.

## Proposed Guardrail Budgets

These are starting budgets, not final product SLOs. They should be tightened
after the barrel fixes land.

| Area | Initial Budget |
| --- | --- |
| Home first-load uncompressed JS | below 500 KiB |
| Deal overview first-load uncompressed JS | below 650 KiB |
| Deal documents first-load uncompressed JS | below 650 KiB |
| Deal commitments first-load uncompressed JS | below 800 KiB |
| Recharts on non-chart routes | 0 bytes |
| LCP lab proxy on local production desktop | below 2500 ms |
| CLS lab proxy | below 0.1 |
| Long tasks before first interaction | no task above 200 ms |

The JS budgets are intentionally above the ideal because the current baseline
is near or above 1 MiB. The first step is to make regressions impossible while
the app works the numbers down.

## Proposed `AGENT.md` Addition

No repo-level `AGENT.md` or `AGENTS.md` file exists today. If one is added,
use this short rule to prevent future drift:

```md
## Frontend Performance And RSC Guardrails

For `apps/web` and shared React packages, preserve route-level performance
boundaries. Do not import root `@repo/ui` or root `@repo/kit` from client
components when a narrower subpath export can be used. Keep read-only UI as
Server Components by default and introduce `'use client'` only for actual
browser state, effects, refs, or event handling. Any change that adds a new
client boundary, package barrel export, charting dependency, analytics script,
font, or route-level data cache must include a short rationale and a measured
bundle/cache/Web Vitals impact from a production build.

Before finalizing frontend changes, run or update the route bundle/performance
checks for the touched routes. Regressions must either be fixed or documented
with an explicit budget exception.
```

## Appendix: Local Evidence Commands

Useful commands from the audit:

```bash
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('apps/web/.next/diagnostics/route-bundle-stats.json','utf8')); for (const r of j) console.log(r.route, r.firstLoadUncompressedJsBytes)"
du -sh apps/web/.next/static apps/web/.next/server
find apps/web/.next/static/chunks -type f -name '*.js' -print0 | xargs -0 du -k | sort -nr | sed -n '1,40p'
```
