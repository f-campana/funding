# JavaScript Runtime Semantics Audit

Status: Audit findings
Created: 2026-05-19
Updated: 2026-05-19
Scope: repo-wide review against
`/Users/fabiencampana/Documents/roundtable/07_cheat_sheets/javascript.md`

## Purpose

This document records the 2026-05-19 repo audit against the JavaScript cheat
sheet. The goal is not to turn the repo into a catalog of low-level JavaScript
micro-optimizations. The goal is to identify places where the language model in
the cheat sheet materially affects correctness, production safety, API
boundaries, React behavior, or maintainability.

The source standard covers:

- primitives, objects, pass-by-sharing, prototypes, coercion, closures, and the
  event loop;
- execution internals such as hoisting, temporal dead zones, and `this`
  resolution;
- Promise, async/await, microtask, and module-evaluation behavior;
- V8 hidden classes, inline caches, speculative optimization, and garbage
  collection;
- TypeScript erasure and the need for runtime-visible discriminators and
  runtime validation at trust boundaries.

The audit treats findings as actionable only when the JavaScript principle maps
to a real repo risk. For example, a runtime validation gap at a tRPC boundary is
included because TypeScript types are erased. A security/auth gap is included
when it is exposed by a JavaScript runtime boundary. Minor stylistic issues are
not included unless they could plausibly affect runtime behavior.

## Audit Method

The audit used four read-only agent lanes plus local verification:

1. Core/domain/server language semantics:
   pass-by-sharing, mutation, equality, coercion, nullish handling, closures,
   hoisting, `this`, and iterators.
2. Async, event-loop, tRPC, observability, server/client, and module-boundary
   behavior.
3. React/Next UI behavior:
   client/server boundaries, referential identity, object allocation in render,
   closure retention, stable keys, and hidden-class risk in repeated lists.
4. Repo-level tooling and architecture:
   TypeScript erasure, ESM/package export maps, generated-code contracts,
   runtime JSON parsing, lint/test coverage, and package scripts.

Local verification included:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @repo/design-tokens check
```

All commands passed on 2026-05-19.

The worktree already had unrelated modified planning documents during the
audit. Those files were not reverted or normalized as part of this review.

## Severity Definitions

- P1: high production, data, security, or API-contract risk. Address before
  building more feature surface on the same boundary.
- P2: meaningful correctness, performance, hydration, or maintainability risk.
  Schedule deliberately.
- P3: smaller drift, portability, or hygiene issue. Fix when touching adjacent
  code or when formalizing the relevant package boundary.

## Executive Summary

The repo is in good shape on basic JavaScript hazards. The audit found no
material loose equality, `NaN`, `var` loop, hoisting, TDZ, custom iterator, or
prototype-chain issue in the reviewed source. The root Biome config already
enforces several important semantic rules, including no loose equality, no
implicit global variables, no unsafe `finally`, no `delete`, and top-level
regular expressions.

The important risks are concentrated elsewhere:

- Runtime boundaries still rely too heavily on erased TypeScript types.
- The tRPC operational-center read is publicly exposed.
- Some server DTOs reuse fixture references, so `readonly` gives a false sense
  of runtime immutability.
- Some React client boundaries hydrate more data than they need.
- A few hot UI paths defeat memoization or produce heterogeneous object shapes.
- Tooling does not yet enforce all generated-code, package-runtime, async, and
  dynamic-JSON contracts.

## Priority Findings

### P1 - tRPC Deal Data Is Public

Files:

- [route.ts](../../apps/web/app/api/trpc/[trpc]/route.ts)
- [context.ts](../../apps/web/server/trpc/context.ts)
- [init.ts](../../apps/web/server/trpc/init.ts)
- [deal-router.ts](../../apps/web/server/trpc/routers/deal-router.ts)

Current state:

`apps/web/app/api/trpc/[trpc]/route.ts` passes the real `Request` to
`fetchRequestHandler`, but `createTrpcContext()` ignores the request and returns
an empty object. `deal.getOperationalCenter` is built with `publicProcedure`,
so any caller who knows the accepted input shape can request the fixture-backed
operational-center payload.

Cheat-sheet principle:

Environment APIs and async request handlers are not magic JavaScript. They are
runtime boundaries. A `Request` object arriving from the network is outside the
trusted compile-time world and must be modeled explicitly. TypeScript cannot
invent auth, tenant, or deal-access state after the fact.

Rationale:

This is not only a product/auth finding. It is a runtime-boundary finding. The
JavaScript code currently receives a request, discards all runtime context, and
then executes private-deal read logic as a public procedure. That means the
server-side type signatures look tidy while the actual executable module graph
has no access-control branch.

Recommended change:

- Make `createTrpcContext()` request-aware.
- Derive session, user, tenant, and deal-access facts from the request.
- Add a `protectedProcedure` middleware.
- Move `deal.getOperationalCenter` to the protected path.
- Add API-level tests for unauthenticated, authenticated-without-access, and
  authenticated-with-access callers.

### P1 - Operational-Center DTO Output Relies On Erased Types

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [operational-center-validation.ts](../../apps/web/server/deals/operational-center-validation.ts)
- [operational-center-service.ts](../../apps/web/server/deals/operational-center-service.ts)
- [deal-router.ts](../../apps/web/server/trpc/routers/deal-router.ts)

Current state:

`DealOperationalCenterDTO` and nested DTOs are TypeScript type aliases.
`validateDealOperationalCenter()` verifies important invariants: money shape,
non-EUR currency, ISO date-time strings, capital math, forbidden finance fields,
and dangling graph references. The tRPC input is validated with
`GetOperationalCenterInputSchema`.

The remaining gap is that the serialized output shape is not parsed as unknown
runtime data. The tRPC procedure does not declare `.output(...)`, and the
service validator does not validate the full DTO shape, enum vocabularies,
required strings, arrays, or discriminated unions.

Cheat-sheet principle:

TypeScript has complete type erasure. `as`, `interface`, type aliases, generic
parameters, and `satisfies` do not exist at runtime. Runtime-facing contracts
need runtime-visible discriminators and schemas.

Rationale:

This is the highest-value JavaScript semantics finding. While the current data
source is a compiled fixture, the DTO is already treated as an API contract and
server/client payload. Once database records, provider payloads, imported JSON,
CMS data, or generated data feed this service, TypeScript cannot protect the
wire format. Downstream mappers also index label/tone tables by values such as
`document.status`, `document.category`, `document.owner`, and `group.visibility`.
A malformed runtime value can silently produce `undefined` labels or invalid UI
props even though TypeScript compiles.

Recommended change:

- Create strict Zod schemas for the full `DealOperationalCenterDTO` and the
  full `GetDealOperationalCenterOutputDTO` union.
- Use discriminated unions for `_tag`, `kind`, and event variants.
- Reuse existing domain schemas where possible.
- Parse the service output before returning it.
- Attach `.output(GetDealOperationalCenterOutputSchema)` to the tRPC procedure.
- Add regression tests for invalid document status/category/owner, invalid
  group visibility, missing required fields, and malformed activity variants.

### P2 - DTO Construction Reuses Shared Fixture References

Files:

- [operational-center-service.ts](../../apps/web/server/deals/operational-center-service.ts)
- [operational-center-blocker-mapper.ts](../../apps/web/server/deals/operational-center-blocker-mapper.ts)
- [operational-center-investor-mapper.ts](../../apps/web/server/deals/operational-center-investor-mapper.ts)
- [northstar-energy.fixture.ts](../../apps/web/server/deals/fixtures/northstar-energy.fixture.ts)

Current state:

DTO construction reuses several fixture references:

- `documents.groups` points at `northstarOperationalFixture.documentGroups`.
- `activity` points at `northstarOperationalFixture.activity`.
- `deal.vehicle` and `deal.access` are spread through the deal object but nested
  objects remain shared unless explicitly copied.
- blocker `relatedInvestorIds` and `relatedDocumentIds` arrays are passed
  through.
- investor `blockerIds` and `documentIds` arrays are passed through.

Cheat-sheet principle:

Objects are passed by sharing. A variable holds a reference. Passing an object
or array copies the reference, not the object. `readonly` is a TypeScript-only
compile-time promise and does not freeze the runtime value.

Rationale:

The service returns a DTO that looks immutable in TypeScript, but consumers can
still mutate object and array references at runtime. If any test, route adapter,
future tRPC caller, or future server transform mutates the returned DTO, it can
mutate shared fixture state and affect later calls in the same process. This is
especially easy to miss because the source fixture is module-scoped and long
lived.

Recommended change:

Clone at DTO boundaries:

```ts
groups: fixture.documentGroups.map((group) => ({
  ...group,
  documentIds: [...group.documentIds],
}))
```

Apply the same rule to activity objects, nested deal objects, blocker related-id
arrays, and investor id arrays. If mutation protection becomes important, add a
test that mutates one returned DTO and proves a second service call is
unchanged.

### P2 - Full Server DTO Is Hydrated Into A Client Rail

Files:

- [layout.tsx](../../apps/web/app/deals/[dealId]/layout.tsx)
- [deal-operational-rail.tsx](../../apps/web/app/deals/[dealId]/deal-operational-rail.tsx)
- [deal-operational-adapters.ts](../../apps/web/app/deals/[dealId]/deal-operational-adapters.ts)

Current state:

The server layout passes the entire `DealOperationsRouteData` object into the
client-only `DealOperationalRail`. The client rail derives a small rail view
model and progress-panel props in the browser.

Cheat-sheet principle:

Reachability keeps objects alive, and object references matter. In React Server
Components, crossing a server/client boundary serializes and hydrates data that
could otherwise remain server-side. JavaScript garbage collection can free only
objects that are unreachable; sending a large DTO to a client component makes it
reachable in the browser for as long as React keeps it.

Rationale:

The rail needs labels, counts, progress panel props, the deal slug, and action
targets. It does not need the full capital, blocker, document, investor, and
activity graph. Hydrating the full DTO increases payload size, browser memory,
and client-side object allocation. It also makes it easier for private data to
cross a boundary without deliberate review.

Recommended change:

- Compute `rail` and `DealProgressPanel` props in the server layout.
- Pass only a minimal serializable view model to the client wrapper.
- Pass explicit action hrefs or the canonical deal slug for router actions.
- Keep the client component focused on `router.push()` and `router.refresh()`.

### P2 - Commitment Table Model Memoization Is Defeated By Reference Identity

Files:

- [deal-commitments-table.tsx](../../packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx)
- [deal-commitments-table.model.ts](../../packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts)

Current state:

`DealCommitmentsTable` creates a fresh `controls` object on every render by
calling `getReadyControls(...)`. It then uses that object as a `useMemo`
dependency for `getCommitmentTableModel(...)`. Because objects compare by
reference, the dependency changes on every render even when the logical control
values are unchanged.

Cheat-sheet principle:

Objects are compared by reference, not by value. React dependency arrays use
reference identity. Recreating an object defeats memoization even when the
object's fields are equal.

Rationale:

`getCommitmentTableModel()` does meaningful work: search filtering, view
filtering, filter matching, sorting, pagination, `Map` allocation, and `Set`
allocation. The current memo shape does not protect this work from unrelated
parent renders. This is not a correctness bug today, but it matters for a table
that is expected to scale with investor records and repeated UI interaction.

Recommended change:

- Memoize `controls` from its primitive and array dependencies, or
- fold control construction into the model memo and depend on the actual state
  fields rather than on a wrapper object.

When doing this, be careful with controlled/uncontrolled state behavior. The
existing comments explain an intentional design: provided values seed local
state unless the matching callback is present.

### P2 - Commitment Export Action Recreates A Closure Each Render

Files:

- [deal-commitments-table.tsx](../../packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx)

Current state:

`exportAction` and its `onExport` callback are created during render. The
closure captures `model` and `props`, so downstream toolbar props receive a new
object and function identity every render.

Cheat-sheet principle:

Closures retain lexical environments. New function and object references can
defeat memoized child components and increase young-generation allocation churn.

Rationale:

This is smaller than the model memo issue because the current toolbar may not be
memoized. It becomes more important if the table grows, if toolbar children
become memoized, or if export state is passed deeper.

Recommended change:

- Memoize `exportAction` with `useMemo`, or
- memoize the export callback with `useCallback` and pass export labels and
  disabled state separately.

Dependencies should be explicit: selected visible row ids, visible export row
ids, the two export callbacks, labels, and availability state.

### P2 - Repeated View-Model Mappers Produce Heterogeneous Object Shapes

Files:

- [deal-commitments-table-adapter.ts](../../apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts)
- [deal-documents-evidence-adapter.ts](../../apps/web/app/deals/[dealId]/deal-documents-evidence-adapter.ts)
- [deal-commitment-inspector-adapter.ts](../../apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts)

Current state:

Several mappers build arrays of repeated objects with conditional spreads:

- `dataIssue` is omitted when absent from commitment rows.
- document due and activity labels are omitted when absent.
- blocker due, related document, and related investor labels are omitted when
  absent.

Cheat-sheet principle:

V8 hidden classes and inline caches favor stable object shapes. Objects of the
same conceptual type should initialize the same fields in the same order in hot
paths. Conditional property addition can make a property access site
polymorphic or megamorphic.

Rationale:

This is a performance and maintainability concern, not a current production
incident. These objects are consumed in repeated UI lists. Access sites such as
`row.dataIssue`, `document.dueLabel`, and `blocker.relatedDocumentLabel` see
mixed shapes. That is acceptable at current scale, but it can become noisy as
the route grows and record counts increase.

Recommended change:

Normalize repeated row/item shapes before they enter list rendering:

- include optional fields as `undefined` in a consistent order, or
- introduce small constructors that always initialize the full conceptual shape.

Do this when touching the adapters for other reasons or when increasing the
route's data volume.

### P2 - Production Web Vitals Transport Is A No-Op

Files:

- [web-vitals-reporter.tsx](../../apps/web/observability/web-vitals-reporter.tsx)
- [telemetry-transport.ts](../../apps/web/observability/telemetry-transport.ts)

Current state:

`useReportWebVitals` maps browser metrics into telemetry events, but
`createBrowserTelemetryTransport()` returns `noopTelemetryTransport` in
production.

Cheat-sheet principle:

Browser callbacks from environment APIs run later through the event loop.
Production side effects from those callbacks must be deliberate. A callback that
appears to report telemetry but silently no-ops in production creates a false
feedback loop.

Rationale:

The app appears instrumented, but production metrics are dropped. That matters
because several of the audit findings are performance and hydration related;
without production collection, regressions can pass local tests and remain
invisible.

Recommended change:

- Add a production transport using `navigator.sendBeacon()` or
  `fetch(..., { keepalive: true })`.
- Send to a small API route that sanitizes and validates event payloads.
- Keep console telemetry as a development-only implementation.
- Swallow transport errors safely so telemetry cannot break navigation.

### P3 - Chart Style Rules Still Allocate On Every Render

Files:

- [chart.tsx](../../packages/ui/src/components/chart.tsx)

Current state:

`ChartContainer` now memoizes the `ChartContext.Provider` value.
`ChartStyle` still recomputes CSS style rules on every render.

Cheat-sheet principle:

Object reference identity controls React context propagation, and repeated string
rule construction can still add small render cost if charts become dense.

Rationale:

This is lower priority because chart usage is currently isolated and the repo
has already reduced accidental Recharts route cost. It is still an easy place to
lose memoization if charts become denser.

Recommended change:

- Memoize the provider value with `useMemo(() => ({ config }), [config])`.
- Memoize `getStyleRules(id, config)` inside `ChartStyle`.
- Keep the current API shape unless profiling shows a larger chart redesign is
  warranted.

### P3 - Package Export Maps Point At TypeScript Source With No Emitted JS

Files:

- [packages/core/package.json](../../packages/core/package.json)
- [packages/domain/package.json](../../packages/domain/package.json)
- [packages/kit/package.json](../../packages/kit/package.json)
- [packages/ui/package.json](../../packages/ui/package.json)
- [packages/design-tokens/package.json](../../packages/design-tokens/package.json)

Current state:

Workspace packages export `.ts` or `.tsx` source files and most package
`build` scripts run `tsc --noEmit`. This works under Next, Vite, and monorepo
source-transpilation assumptions. It does not describe executable JavaScript
targets for plain Node ESM consumers.

Cheat-sheet principle:

The ES module graph is a runtime graph. Package export maps should describe
what the runtime can execute, not only what TypeScript can typecheck.

Rationale:

The current setup may be intentional for a private monorepo. The risk is that
package export tests running under Vitest/Vite can hide the fact that plain Node
cannot execute these exports without a TypeScript loader or bundler. That is a
portability and boundary-documentation issue.

Recommended change:

Choose one direction explicitly:

- document these as monorepo-only source packages and add a contract test that
  enforces that assumption, or
- emit `dist/*.js` and `.d.ts` files and point `exports.import` and
  `exports.types` at `dist`.

Avoid root path aliases masking package export problems in release-like checks.

### P3 - Generated-Code Validation Is Not Part Of The Main Gates

Files:

- [biome.json](../../biome.json)
- [packages/design-tokens/package.json](../../packages/design-tokens/package.json)
- [validate.mjs](../../packages/design-tokens/scripts/validate.mjs)

Current state:

`packages/design-tokens` has a strong `check` script that verifies generated
CSS and TypeScript output against `tokens.source.json`. That check passed during
this audit. The root `pnpm test` path does not run it, and Biome intentionally
excludes `*.generated.ts`.

Cheat-sheet principle:

Generated runtime artifacts need an enforceable source-of-truth policy.
TypeScript tooling alone does not protect runtime output once generated files
are committed and consumed.

Rationale:

If `tokens.source.json`, `css/tokens.css`, and `src/tokens.generated.ts` drift,
the repo can still pass the main test command. Design tokens are runtime input
to styling, so stale generated output is not merely a formatting issue.

Recommended change:

- Wire `pnpm --filter @repo/design-tokens check` into package `test`, root
  `test`, or a root `check`/CI command.
- Keep generated formatting exclusions if desired, but preserve exact-output
  validation.

### P3 - Runtime JavaScript Scripts Parse Dynamic JSON Without Schemas

Files:

- [generate.mjs](../../packages/design-tokens/scripts/generate.mjs)
- [report-route-bundles.mjs](../../apps/web/scripts/report-route-bundles.mjs)
- [next.json](../../packages/typescript-config/next.json)

Current state:

Runtime `.mjs` scripts use `JSON.parse` and then immediately access expected
properties. `allowJs` is enabled in the Next TypeScript config, but these
scripts are not typechecked as strict TypeScript modules.

Cheat-sheet principle:

`JSON.parse` returns an untrusted runtime value. TypeScript types are erased,
and the runtime does not know the intended shape unless code checks it.

Rationale:

`tokens.source.json` and `.next/diagnostics/route-bundle-stats.json` are dynamic
inputs to runtime scripts. A malformed or version-shifted file can produce
unclear errors or misleading output.

Recommended change:

- Add `// @ts-check` plus JSDoc typedefs to `.mjs` scripts, or convert scripts
  to TypeScript.
- Schema-parse `tokens.source.json`.
- Schema-parse route bundle stats before reading `route`,
  `firstLoadUncompressedJsBytes`, and `firstLoadChunkPaths`.

### P3 - Async Safety Is Not Fully Enforced At Lint Level

Files:

- [biome.json](../../biome.json)
- [packages/test-config/src/index.ts](../../packages/test-config/src/index.ts)
- [apps/web/vitest.config.ts](../../apps/web/vitest.config.ts)

Current state:

The repo lint config covers many JavaScript hazards well. It does not visibly
enforce type-aware async rules such as floating promises, misused async
callbacks, or explicit marking for intentionally detached promises.

Cheat-sheet principle:

`await` is a yield point, Promise continuations run as microtasks, and
independent async chains can interleave. Dropped promises and async callback
mistakes are runtime behavior issues, not just style issues.

Rationale:

This repo already has a `Future` abstraction and several async/web boundaries.
No specific floating-promise bug was found in this pass, but the tooling does
not make the class of bug hard to introduce.

Recommended change:

- Add Biome async-safety rules where available, or add a narrow type-aware
  ESLint pass for `no-floating-promises` and misused promises.
- Require explicit `void` for intentionally detached promises.
- Add focused tests for cancellation and race-sensitive service/UI flows.
- Consider package-appropriate coverage thresholds for app/UI/kit, not just
  core/domain.

### P3 - Method-Based Type Guards Can Lie When Borrowed

Files:

- [option.ts](../../packages/core/src/option.ts)
- [result.ts](../../packages/core/src/result.ts)
- [async-data.ts](../../packages/core/src/async-data.ts)

Current state:

`Option`, `Result`, and `AsyncData` variants expose methods such as `isOk()`,
`isError()`, `isSome()`, `isNone()`, and `isDone()`. The current factory-created
methods return hardcoded booleans for their variant.

Cheat-sheet principle:

`this` is resolved from the call site. A method that advertises a `this is ...`
type predicate should describe the call-time receiver, not only the object the
factory originally closed over.

Rationale:

Normal usage is safe because callers invoke the guard on the object that owns
the method. If a method is borrowed or called with `.call(...)`, the hardcoded
boolean can describe the wrong receiver. This is a low-risk edge case in the
current code, but it is worth knowing because these are core package primitives.

Recommended change:

Either:

- implement guards from the call-time receiver, for example
  `return this._tag === 'Ok'`, or
- move guard logic to standalone functions that do not depend on method `this`.

This does not need to preempt higher-priority API boundary work.

### P3 - Package-Level Tooling Is Uneven

Files:

- [packages/tailwind-config/package.json](../../packages/tailwind-config/package.json)
- [packages/test-config/package.json](../../packages/test-config/package.json)
- [packages/typescript-config/package.json](../../packages/typescript-config/package.json)
- [package.json](../../package.json)

Current state:

Root `pnpm lint` scans `apps` and `packages`, but package-local scripts are not
uniform. Some config packages have limited or no local `lint`/`test` scripts.

Cheat-sheet principle:

Runtime and configuration contracts are only enforceable when the repo's script
graph actually runs the relevant checks. A passing root command should not rely
on implicit knowledge of which packages have scripts.

Rationale:

This is a repo-hygiene issue rather than a direct runtime bug. It matters as the
workspace grows because developers will naturally reach for package-local and
Turbo commands.

Recommended change:

- Add minimal `lint` scripts to all packages.
- Add contract tests for packages that export runtime/config assets.
- Document the split between root Biome sweep and `turbo run lint`, or make the
  two paths converge.

## Non-Issues And Positive Signals

The audit did not find material problems in these areas:

- Loose equality or accidental coercive comparison.
- `NaN` comparison misuse.
- `var` loop closure traps.
- Hoisting or temporal dead-zone misuse.
- Custom iterator protocol misuse.
- Meaningful state or prop mutation in the reviewed React paths.
- Unstable React keys in the reviewed repeated lists.

Existing guardrails worth preserving:

- `biome.json` rejects loose equality, unused variables/imports, undeclared
  variables, unsafe `finally`, `debugger`, dangerous HTML injection, and
  `delete` usage.
- Money parsing and formatting use branded `bigint` values and safe
  serialization checks.
- Domain code already uses runtime schemas where external JSON-like domain
  records are accepted.
- The operational-center service already validates important invariants even
  before full DTO output parsing exists.

## Suggested Implementation Order

1. Protect the tRPC operational-center read with request-aware context and
   authorization.
2. Add strict DTO output schemas and tRPC `.output(...)` validation.
3. Clone shared fixture references at DTO boundaries.
4. Move rail/progress derivation back to the server and hydrate only a small
   client wrapper.
5. Fix commitment table memo dependencies and export-action identity.
6. Wire design-token generated-output validation into the main verification
   gate.
7. Add schema checks or `@ts-check` to runtime `.mjs` scripts.
8. Normalize repeated list item shapes when touching the app adapters.
9. Decide whether workspace packages are source-only or should emit runtime JS.
10. Add async-safety lint coverage and package-local script consistency.

## Verification Snapshot

Commands run on 2026-05-19:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @repo/design-tokens check
```

Results:

- Biome checked 294 files with no fixes applied.
- Turbo typecheck completed successfully across 9 tasks.
- Turbo test completed successfully across 11 tasks.
- Design token validation passed.

## Relationship To Other Planning Documents

This audit overlaps with, but does not replace:

- [Zod Runtime Validation Audit](./zod-runtime-validation-audit.md), which has
  deeper guidance for where runtime schemas belong.
- [Web Vitals, Bundle, RSC, Caching, And Observability Audit](./web-vitals-bundle-rsc-observability-audit.md),
  which has deeper route bundle and telemetry details.
- [React Composition Audit](./react-composition-audit.md), which has broader
  component API guidance.
- [Backend Migration Readiness](./backend-migration-readiness.md), which covers
  future auth, repositories, permissions, mutations, and persistence.

Use this document when a future task asks whether a change respects JavaScript's
runtime semantics, TypeScript erasure, async behavior, object identity,
server/client boundaries, or package module-graph assumptions.
