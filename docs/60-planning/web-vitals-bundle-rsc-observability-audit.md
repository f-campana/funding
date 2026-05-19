# Web Vitals, Bundle, RSC, Caching, And Observability Audit

Status: Updated audit snapshot
Created: 2026-05-18
Updated: 2026-05-19
Scope: `apps/web`, `packages/ui`, `packages/kit`, App Router route behavior, production feedback loops

## Executive Summary

The 2026-05-19 audit shows real progress since the first snapshot, but the app
is not yet protected against performance or production-diagnostics drift.

The biggest improvement is bundle size. The prior Recharts route tax has been
removed from emitted app chunks, `@repo/kit` now exposes subpath exports, app
routes use those subpaths, and server-only guards now protect the main deal data
path. Fresh first-load JS dropped materially:

- `/`: 928.9 KiB -> 591.0 KiB.
- `/deals/[dealId]/overview`: 1040.9 KiB -> 753.9 KiB.
- `/deals/[dealId]/documents`: 1040.9 KiB -> 748.9 KiB.
- `/deals/[dealId]/commitments`: 1043.9 KiB -> 784.5 KiB.

The remaining highest-risk issues are now different:

- Web Vitals are shaped and collected in the browser, but production transport
  is explicitly a no-op.
- Runtime errors render recovery UI but are not reported.
- tRPC remains publicly reachable for fixture-backed deal operations data.
- Deal routes still render dynamically even though the current data source is a
  single deterministic fixture.
- Read-only deal surfaces and the shared deal shell still hydrate broad client
  UI.
- Commitments still serializes all inspector detail before any row is opened.
- Bundle and Web Vitals checks are diagnostic-only; no CI budget fails on drift.

No P0 issue was found in the new audit. The app remains functionally healthy:

```text
pnpm --filter @repo/web build
pnpm --filter @repo/web bundle:report
pnpm --filter @repo/web test
pnpm --filter @repo/web e2e
```

All four commands passed during the 2026-05-19 local verification. `@repo/web`
unit tests passed 39/39, and the Playwright suite passed 13/13.

## Current Route Bundle Snapshot

Source: fresh `pnpm --filter @repo/web bundle:report` on 2026-05-19.

| Route | First-load uncompressed JS | Chunks | Current Budget Status |
| --- | ---: | ---: | --- |
| `/deals/[dealId]/commitments` | 784.5 KiB | 19 | Under initial 800 KiB budget |
| `/deals/[dealId]/overview` | 753.9 KiB | 18 | Over initial 650 KiB budget |
| `/deals/[dealId]/documents` | 748.9 KiB | 18 | Over initial 650 KiB budget |
| `/deals/[dealId]` | 735.6 KiB | 17 | No route-specific budget yet |
| `/deals/[dealId]/about` | 735.6 KiB | 17 | No route-specific budget yet |
| `/` | 591.0 KiB | 13 | Over initial 500 KiB budget |
| `/_not-found` | 591.0 KiB | 13 | No route-specific budget yet |

Important supporting measurements:

- `.next/static`: 1.3 MiB.
- `.next/server`: 12 MiB.
- No emitted `.next/static` client chunk currently contains `recharts`.
- The largest matched feature chunks include:
  - `0j63d239kv_bn.js`: 108.1 KiB, contains `lucide`.
  - `07lsw45ctzzx7.js`: 18.4 KiB, contains `DealOperationalOverview`.
  - `0rzevb34ov9g5.js`: 13.3 KiB, contains `DealDocumentsEvidence`.
  - `15xs8u-6if43s.js`: 13.5 KiB, contains `useReportWebVitals` and
    `web_vital`.
- All audited routes preload three font files totaling 95,820 bytes over the
  local production server response.

## Current Runtime And Cache Snapshot

Local production header probes from `next start` on 2026-05-19:

| URL | Response | Cache Behavior | HTML Size |
| --- | --- | --- | ---: |
| `/` | `200 OK` | `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=31536000` | 14,678 bytes |
| `/deals/northstar-energy/overview` | `200 OK` | `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` | 93,854 bytes |
| `/deals/northstar-energy/commitments` | `200 OK` | `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` | 125,206 bytes |

The current build prerenders only:

- `/`
- `/_global-error`
- `/_not-found`

All deal routes remain dynamic at runtime.

The public tRPC read can return the fixture-backed operational center over GET
when called with the accepted input shape:

```text
/api/trpc/deal.getOperationalCenter?input={"dealId":"northstar-energy"}
```

The response is about 11.2 KiB locally and includes fixture investor contact
data such as `closing@meridian.example`. That is acceptable only as a clearly
fixture-backed demo seam; it is not production-private-data safe.

## Reference Standards

This audit uses the Core Web Vitals model from web.dev:

- LCP: good at or below 2500 ms, poor above 4000 ms.
- INP: good at or below 200 ms, poor above 500 ms.
- CLS: good at or below 0.1, poor above 0.25.
- Classification should use the 75th percentile of page views.

Sources:

- [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Web Vitals measurement](https://web.dev/articles/vitals)
- [Next.js `generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js caching deep dive](https://nextjs.org/docs/app/deep-dive/caching)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

## Audit Method

The 2026-05-19 pass used five read-only specialist lanes plus local verification:

1. Web Vitals and runtime frontend performance.
2. Bundle size, dependency graph, and package exports.
3. App Router, RSC tradeoffs, tRPC exposure, and caching.
4. Observability, diagnostics, logs, and CI feedback loops.
5. Interactive performance and INP scalability in commitments workflows.

Local verification included:

- reading App Router files, package exports, shared package code, tests, and
  the previous audit doc,
- running `pnpm --filter @repo/web build`,
- running `pnpm --filter @repo/web bundle:report`,
- running `pnpm --filter @repo/web test`,
- running `pnpm --filter @repo/web e2e`,
- inspecting `.next/diagnostics/route-bundle-stats.json`,
- inspecting `.next/static/chunks`,
- probing production response headers from `next start`,
- sampling Playwright resource timing in a local production browser session.

## Severity Definitions

- P1: high user, data, or production feedback-loop risk; should be addressed
  before adding more feature surface on top of the current architecture.
- P2: meaningful performance, scalability, or maintainability risk; should be
  scheduled deliberately.
- P3: smaller drift or hygiene issue; fix when touching adjacent code or when
  larger bundle/RSC work is underway.

## Status Changes Since 2026-05-18

### Resolved Or Mostly Resolved

1. Recharts is no longer shipped in emitted app route chunks.
   - `packages/ui/src/index.ts` no longer re-exports chart components.
   - Chart support remains available by subpath.
   - Static chunk search found no `recharts`.

2. App route imports now use granular `@repo/kit` subpaths.
   - `packages/kit/package.json` exposes production surface subpaths.
   - App pages import examples:
     - `@repo/kit/deal-operational-overview`
     - `@repo/kit/deal-documents-evidence`
     - `@repo/kit/deal-progress-panel`
     - `@repo/kit/deal-commitments-table`
     - `@repo/kit/deal-commitment-inspector`

3. App-level UI imports are narrower.
   - Loading and error boundaries now use direct UI subpaths.
   - Deal shell and tabs use `@repo/ui/lib/utils`.

4. Server-only guards exist on the primary deal data path.
   - `apps/web/app/deals/[dealId]/data.ts` imports `server-only`.
   - `apps/web/server/deals/*` entrypoints and services import `server-only`.

5. Telemetry scaffolding now exists.
   - `WebVitalsReporter` is mounted in the root layout.
   - Web Vitals are normalized to typed telemetry events.
   - Route names are sanitized to route templates.
   - Metadata redaction tests exist.

6. Bundle diagnostics now exist as a script.
   - `apps/web/package.json` has `bundle:report`.
   - `apps/web/scripts/report-route-bundles.mjs` prints route JS sizes.

### Still Open

1. Production telemetry still drops events by default.
2. Runtime errors are not reported.
3. tRPC is public and context-free.
4. Deal routes remain dynamic despite fixture-backed data.
5. Deal data has no request memoization or invalidation model.
6. Read-only product surfaces still hydrate as client components.
7. Commitments still serializes all inspector detail up front.
8. Search/filter work is synchronous on the input path.
9. Route bundle and Web Vitals budgets do not fail CI.
10. Fonts remain globally over-provisioned.

## P1 Findings

### 1. Web Vitals Are Collected But Dropped In Production

Evidence:

- `apps/web/app/layout.tsx` mounts `WebVitalsReporter`.
- `apps/web/observability/web-vitals-reporter.tsx` uses
  `useReportWebVitals`.
- `apps/web/observability/web-vitals.ts` maps metrics into sanitized telemetry
  events.
- `apps/web/observability/telemetry-events.ts` sanitizes route templates and
  redacts sensitive metadata.
- `apps/web/observability/telemetry-transport.ts` returns
  `noopTelemetryTransport` in production.

Rationale:

This is better than the first snapshot because the event model is now in place.
However, the production feedback loop is still absent. The app cannot answer:

- what the p75 LCP/INP/CLS is in production,
- which route family regressed,
- which release introduced the regression,
- whether mobile users see worse interaction latency,
- whether the commitments workflow is causing INP pressure.

The current implementation shapes the data but intentionally does not send it
anywhere in production.

Recommendation:

- Wire the existing transport boundary to a real sink:
  - Vercel Speed Insights,
  - Datadog RUM,
  - PostHog,
  - Sentry performance,
  - or an internal `/telemetry` route using `sendBeacon` or `fetch` with
    `keepalive`.
- Include release and environment on every event.
- Keep route cardinality bounded by sanitized route templates.
- Preserve the existing redaction behavior for investor, deal, document, and
  blocker metadata.

Acceptance criteria:

- Preview or production dashboards show p75 LCP, INP, CLS, FCP, and TTFB by
  route template.
- A production smoke proves at least one metric leaves the browser.
- No raw deal ids, investor names, emails, document labels, or financial
  payloads appear in telemetry.

### 2. Runtime Errors Are Rendered But Not Reported

Evidence:

- `apps/web/app/error.tsx` accepts an `error` prop type but only uses `reset`.
- `apps/web/app/deals/[dealId]/error.tsx` accepts an `error` prop type but only
  uses `reset`.
- `apps/web/app/deals/[dealId]/data.ts` throws on non-unsupported service
  failures.
- There is no tracked `instrumentation.ts`.
- There is no tracked `global-error.tsx`.
- No Sentry, Datadog, OpenTelemetry, or equivalent server/browser error
  provider is configured.

Rationale:

Error boundaries are useful for user recovery, but they do not create
operational visibility. If an RSC render, client route, or tRPC call starts
failing in production, the repo currently lacks a durable capture path with
digest, request id, release, environment, and route template.

Recommendation:

- Report client boundary errors from `error.tsx` with digest and route
  template.
- Add `global-error.tsx` for root-layout failures.
- Add `instrumentation.ts` for server/provider startup.
- Use the same redaction policy as telemetry events.

Acceptance criteria:

- Forced client, RSC, and route-handler failures appear in the chosen error
  system.
- Error records include digest or sanitized error tag, route template, release,
  environment, and request id when available.
- Sensitive operational payloads are not captured.

### 3. `deal.getOperationalCenter` Is Publicly Reachable And Returns Operational Data

Evidence:

- `apps/web/app/api/trpc/[trpc]/route.ts` exports the tRPC handler for `GET`
  and `POST`.
- `apps/web/server/trpc/context.ts` creates an empty context.
- `apps/web/server/trpc/init.ts` exposes `publicProcedure`.
- `apps/web/server/trpc/routers/deal-router.ts` wires
  `deal.getOperationalCenter` as public, with a comment noting fixture-backed
  demo semantics.
- The DTO includes investor email, KYC/KYB, signature, and wire status fields.
- Local production GET returned the operational center and fixture email data.

Rationale:

The current data is a fixture, so this is not a live-data breach. The risk is
that the route looks like a production API boundary while having no auth,
tenant, request context, authorization, or logging. If production-private data
is later attached to the same procedure without changing the boundary, the
failure mode is severe.

Recommendation:

- If tRPC remains demo-only, document that explicitly and consider disabling it
  outside local/demo environments.
- If tRPC becomes production data access:
  - resolve user/session/tenant in `createTrpcContext`,
  - add `protectedProcedure`,
  - enforce deal-level authorization before calling services,
  - set explicit `Cache-Control: private, no-store`,
  - remove public `GET` unless it is deliberately required,
  - add request/procedure structured logs.

Acceptance criteria:

- A production-private tRPC read cannot return deal operations data without
  authorization.
- Every API call logs request id, trace id when present, route/procedure,
  method, status, duration, release, environment, and sanitized error tag.
- The fixture/demo contract is explicit if public access remains.

### 4. Read-Only Deal Surfaces Still Hydrate Broad Client UI And Miss JS Budgets

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx`
  is a client component.
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx`
  is a client component.
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.tsx` is a
  client component.
- `apps/web/app/deals/[dealId]/deal-app-shell.tsx` is a client component.
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx` is a client
  component and receives the full route DTO.
- Current route bundles still exceed the initial budgets for `/`,
  `/overview`, and `/documents`.

Rationale:

The prior package-barrel issue is improved, but the RSC tradeoff is still
unresolved. The route pages load data on the server, then hydrate large
mostly-read-only product surfaces. That keeps the app above its initial JS
budgets and consumes INP headroom.

The shared deal shell and rail also mount on redirect/legacy routes where the
full shell may not be useful.

Recommendation:

- Split static ready-state renderers into server-compatible components.
- Keep small client islands for:
  - selected nav state,
  - retry/action buttons,
  - table controls,
  - sheet/drawer behavior,
  - row selection/search/filter state.
- Compute a narrow rail view model on the server and pass only that to the
  client rail action island.
- Avoid mounting the full deal shell/rail for redirect-only routes.

Acceptance criteria:

- `/` drops below 500 KiB first-load uncompressed JS.
- `/deals/[dealId]/overview` and `/documents` drop below 650 KiB.
- Overview and document ready-state content can render without hydrating the
  full surface.
- Deal shell client code is limited to active-nav/action concerns.

## P2 Findings

### 5. Fixture-Backed Deal Routes Still Render Dynamically

Evidence:

- The server deal service supports only `northstar-energy`.
- The route data path is synchronous and fixture-backed.
- No route source defines `generateStaticParams`, `dynamicParams`, `dynamic`,
  or `revalidate`.
- Fresh build output marks deal routes as dynamic.
- `prerender-manifest.json` includes `/`, `/_global-error`, and
  `/_not-found`, but no deal routes.
- Local production responses for deal pages have
  `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.

Rationale:

For the current case-study shape, the route has a finite known parameter set
and deterministic data. Dynamic SSR adds avoidable TTFB and prevents full route
cache use for the primary product surface.

For the future live/private product, dynamic rendering may be correct. The
problem is that the route behavior and the data classification are ambiguous.

Recommendation:

- For static demo/case-study data:
  - add `generateStaticParams` for `{ dealId: 'northstar-energy' }`,
  - add `dynamicParams = false`,
  - keep unsupported deals as 404.
- For future private/live data:
  - explicitly mark the segment dynamic,
  - colocate auth checks,
  - keep response caches private or no-store,
  - document the rationale in the route loader.

Acceptance criteria:

- The route rendering mode matches the data classification.
- Static demo routes appear in the prerender manifest.
- Private live routes have explicit auth and no accidental public caching.

### 6. Deal Data Has No Request Memoization Or Invalidation Model

Evidence:

- `apps/web/app/deals/[dealId]/layout.tsx` calls `getDealOperationsData`.
- `overview/page.tsx`, `documents/page.tsx`, and `commitments/page.tsx` call it
  again.
- `apps/web/app/deals/[dealId]/data.ts` exposes a plain loader function.
- `server-reference-manifest.json` is empty, matching the absence of Server
  Actions and invalidation.
- No route data source uses React `cache()`.

Rationale:

The duplicate fixture reads are cheap today. They will matter once the same
seam reads from a database, external service, or authorization layer. The repo
also has no encoded decision about future invalidation: private no-store SSR,
tagged server cache, or static/ISR route cache.

Recommendation:

- Wrap the route loader with React `cache()` for per-request dedupe.
- Keep `server-only` on app loaders and deal services.
- When persistence/mutations arrive, choose one model:
  - private no-store SSR,
  - tagged cache with `revalidateTag`/`updateTag`,
  - static/ISR route cache for public or demo data.
- Document cache tags next to the loader if tagged caching is chosen.

Acceptance criteria:

- Layout and page reads dedupe within one RSC render.
- Cache behavior is documented next to the loader.
- Future mutations have a defined invalidation path.

### 7. Commitments Still Ships All Inspector Detail Before Row Open

Evidence:

- `apps/web/app/deals/[dealId]/commitments/page.tsx` builds and passes both
  table and inspector props up front.
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts` builds
  `propsByInvestorId` for every investor.
- The adapter repeatedly scans blockers, documents, and activity per investor.
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx` holds the
  full inspector map and selects from it only when a row opens.

Rationale:

This is acceptable for the current small fixture. It scales poorly with real
investor counts and document evidence. The initial commitments route pays RSC
payload, serialization, hydration memory, and JavaScript cost for inspector
content that may never be opened.

Recommendation:

- Initial commitments payload should contain table rows plus row-open metadata
  only.
- Load or render inspector detail on demand:
  - parallel route,
  - route handler,
  - server action,
  - or Suspense-backed client fetch.
- Pre-index blockers, documents, and activity by investor id before mapping.

Acceptance criteria:

- Initial commitments payload excludes unopened inspector details.
- Row open remains responsive under a realistic large fixture.
- Serialized payload size drops or stays within a committed budget.

### 8. Commitments Search And Filter Work Is Synchronous On The Input Path

Evidence:

- `deal-commitments-table-toolbar.tsx` calls `onSearchChange` on every
  keystroke.
- `deal-commitments-table.tsx` updates state and resets pagination on search
  changes.
- `deal-commitments-table.model.ts` recomputes the visible model from the full
  row set.
- Search rebuilds normalized joined row text per row.

Rationale:

The current fixture is small, so the UI feels fine. The implementation has an
INP risk once row counts grow because every keystroke can trigger synchronous
model recomputation and string normalization.

Recommendation:

- Add a large-row fixture or benchmark for search and filters.
- Precompute or memoize normalized search text by row identity.
- Use `useDeferredValue` or transitions if profiling shows input contention.
- Track long tasks during search in performance tests.

Acceptance criteria:

- No search/filter interaction creates a long task above the agreed threshold.
- Input remains responsive on a realistic commitments fixture.
- Search/model recomputation is covered by a performance regression test.

### 9. Web Vitals And Bundle Guardrails Are Diagnostic-Only

Evidence:

- `apps/web/scripts/report-route-bundles.mjs` prints bundle stats but does not
  enforce thresholds.
- Playwright defines only Desktop Chrome.
- E2E tests cover route behavior and overflow but not LCP, CLS, INP proxy
  metrics, long tasks, resource counts, or route JS budgets.
- No tracked CI workflow was found.

Rationale:

The repo now has enough measurement surface to start enforcing budgets, but the
checks still require a human to inspect output. This would not block a PR that
reintroduces Recharts, adds a large charting dependency to a route, or slows
the commitments input path.

Recommendation:

- Add route bundle thresholds to `bundle:report` or a sibling script.
- Add production-server Playwright performance specs for:
  - `/`,
  - `/deals/northstar-energy/overview`,
  - `/deals/northstar-energy/commitments`,
  - `/deals/northstar-energy/documents`.
- Add mobile and desktop projects.
- Add CI that runs typecheck, lint, unit tests, build, E2E, and budget checks.
- Publish Playwright traces/screenshots, coverage, and bundle summaries.

Acceptance criteria:

- CI fails when route JS, LCP proxy, CLS, long tasks, or resource counts exceed
  agreed budgets.
- A failing PR exposes test output and artifacts without rerunning locally.

### 10. Loading And Error Fallbacks Improved But Still Add Client Boundaries

Evidence:

- Root loading and deal loading are client components because they use
  `useTranslations`.
- Root error and deal error are client components, as required for reset, but
  still use translation hooks.
- They now use direct UI subpath imports, so the root-barrel issue is improved.

Rationale:

The previous root `@repo/ui` import problem is reduced. The remaining issue is
that cheap fallback UI still adds client references and translation coupling.
Loading UI should be as static and cheap as possible.

Recommendation:

- Make loading fallbacks static/server-renderable where possible.
- Use plain CSS skeletons for fallbacks if that avoids client references.
- Keep error boundaries client but minimal and instrumented.

Acceptance criteria:

- Loading fallbacks do not create unnecessary client chunks.
- Error boundaries report errors and keep client payload minimal.

## P3 Findings

### 11. Fonts Are Still Globally Over-Provisioned

Evidence:

- `apps/web/app/layout.tsx` imports Geist, Geist Mono, and Fraunces globally.
- Fraunces loads four weights.
- The font manifest shows every route preloading the same three font files.
- The local production browser session loaded 95,820 bytes of fonts for each
  audited route.
- Active app usage requires mono in some financial UI, but no active app usage
  clearly requires global Fraunces preload.

Rationale:

`display: swap` reduces CLS risk, but non-critical preloaded fonts still
compete for network and preload priority during LCP.

Recommendation:

- Remove Fraunces until it is used, or set `preload: false`.
- Scope display fonts to routes/components that actually need them.
- Keep mono where tabular financial UI needs it.

### 12. Dependency And Build Drift Remains

Evidence:

- `recharts` no longer appears in emitted app chunks, but remains a
  `@repo/ui` dependency.
- `@repo/tailwind-config` is still listed in `transpilePackages`.
- `lucide-react` remains a kit dependency and contributes a 108.1 KiB matched
  emitted chunk.
- Many `packages/kit` internals still import from root `@repo/ui`.

Rationale:

These are not the same high-impact route-tax problems as the first snapshot,
but they are drift vectors. Root `@repo/ui` imports inside `@repo/kit` can still
broaden client graphs. Optional chart support should not be a production app
dependency unless a route needs it.

Recommendation:

- Convert kit internals to direct `@repo/ui/components/*` and
  `@repo/ui/lib/utils` imports.
- Add a lint or contract rule banning root `@repo/ui` imports in production
  client code.
- Move chart support to an optional/chart package, or make `recharts` a
  peer/dev dependency if only Storybook/tests need it.
- Measure whether `@repo/tailwind-config` must be transpiled.
- Add `optimizePackageImports: ['lucide-react']` or switch to direct icon
  imports if measurement supports it.

### 13. `server-only` Boundaries Improved, But tRPC Server Modules Should Be Explicit

Evidence:

- Route data loaders and deal service modules now import `server-only`.
- tRPC context/init/root/router files do not directly import `server-only`.

Rationale:

The most important server-only path is now guarded. tRPC server modules still
represent runtime server code and should be explicit, or split shared type-only
helpers away from server runtime modules.

Recommendation:

- Add `import 'server-only'` to server-side tRPC runtime modules that must never
  enter client graphs.
- Keep shared types in type-only files when client code needs them.

### 14. Route Interaction Telemetry Is Narrow

Evidence:

- The event model includes `deal_route_viewed`.
- Current app usage emits commitment inspector open/close events.
- Route-view telemetry is not yet emitted on navigation.
- Core filters/search/actions are not yet instrumented.

Rationale:

Once production transport exists, the app should be able to answer basic
workflow questions without high-cardinality or sensitive payloads. The current
event model is a start, but coverage is narrow.

Recommendation:

- Emit route-view events once per navigation.
- Add safe interaction events for core filters, search, and major workflow
  controls.
- Keep route and metadata sanitization mandatory.

## Current Clean Areas

The audit also found several good signs:

- No production `next/image`, raw `<img>`, `next/script`, or third-party embed
  problems were found in audited app paths.
- App Router pages and layouts are server components by default.
- Route adapters keep most app data shaping outside `@repo/kit`.
- Playwright covers real route behavior and mobile overflow checks.
- `next/font` uses `display: swap`, reducing font-related CLS risk.
- The app has no global client state library drift for these performance
  concerns.
- Recharts is no longer present in emitted app route chunks.
- App imports use kit/UI subpaths more consistently than in the original
  snapshot.
- Server-only guards are present on the primary deal data path.
- Telemetry event shaping and redaction tests now exist.

## Recommended Implementation Order

1. Wire production telemetry and errors:
   - real Web Vitals/RUM transport,
   - error-boundary reporting,
   - `global-error.tsx`,
   - `instrumentation.ts`,
   - release/environment/request correlation.

2. Close the tRPC production-data gap:
   - either keep it explicitly demo/local,
   - or add auth, tenant/deal authorization, private no-store headers, and
     structured logs.

3. Decide deal route data classification:
   - static demo with `generateStaticParams` and `dynamicParams = false`, or
   - explicit private/live dynamic routes with auth and no-store rationale.

4. Split broad client surfaces:
   - server-render static overview/documents/progress content,
   - keep only small client islands for active nav, actions, table controls,
     and drawers,
   - pass narrow rail props instead of the full DTO.

5. Reduce commitments payload and INP risk:
   - load inspector detail on demand,
   - pre-index adapter lookups,
   - memoize/precompute search text,
   - add large-fixture performance tests.

6. Turn diagnostics into guardrails:
   - enforce route JS budgets,
   - add mobile/desktop performance specs,
   - publish CI artifacts.

7. Clean dependency drift:
   - direct UI imports inside kit internals,
   - optionalize or isolate chart dependencies,
   - revisit Fraunces, `lucide-react`, and `@repo/tailwind-config`.

## Proposed Guardrail Budgets

These remain starting budgets, not final product SLOs. The 2026-05-19 snapshot
is closer, but still over budget on home, overview, and documents.

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
| Search/filter long tasks on large commitments fixture | no task above 200 ms |
| Production Web Vitals transport | non-noop in preview/prod |

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
font, route-level data cache, or public API data path must include a short
rationale and measured impact from a production build.

Before finalizing frontend changes, run or update route bundle and performance
checks for the touched routes. Regressions must either be fixed or documented
with an explicit budget exception. Production telemetry must stay privacy-safe:
route templates only, bounded metadata, no raw deal ids, investor names, emails,
document labels, or financial payloads.
```

## Appendix: Local Evidence Commands

Useful commands from the audit:

```bash
pnpm --filter @repo/web build
pnpm --filter @repo/web bundle:report
pnpm --filter @repo/web test
pnpm --filter @repo/web e2e
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('apps/web/.next/diagnostics/route-bundle-stats.json','utf8')); for (const r of j) console.log(r.route, r.firstLoadUncompressedJsBytes)"
du -sh apps/web/.next/static apps/web/.next/server
find apps/web/.next/static/chunks -type f -name '*.js' -print0 | xargs -0 du -k | sort -nr | sed -n '1,40p'
curl -sS -D - -o /tmp/funding_home.html http://127.0.0.1:3000/
curl -sS -D - -o /tmp/funding_overview.html http://127.0.0.1:3000/deals/northstar-energy/overview
```
