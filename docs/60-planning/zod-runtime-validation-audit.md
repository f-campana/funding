# Zod Runtime Validation Audit

**Status:** Audit findings  
**Created:** 2026-05-18  
**Updated:** 2026-05-19
**Scope:** repo-wide review of where Zod, JSON Schema, or similar runtime
validation belongs, where it is already used well, and where adding it would be
drift or unnecessary runtime cost

## Purpose

This note captures the findings from a repo-wide audit of runtime validation
needs. The goal is not to add schemas everywhere. The goal is to keep TypeScript
and runtime validation in their proper roles:

- TypeScript protects code we compile and own.
- Runtime schemas protect data that crosses a trust boundary.
- Domain schemas own business invariants that must not drift across app, API,
  form, test, fixture, and future persistence layers.
- Component props and pure internal helpers should stay type-only unless they
  receive untrusted data directly.

The audit covered:

- `@repo/domain` schemas and exported domain contracts
- `apps/web` route params, tRPC, DTOs, fixtures, adapters, and server data spine
- `@repo/kit` and `@repo/ui` component surfaces
- design token scripts, generated data, config, i18n, package manifests, and
  contract scripts

The 2026-05-19 refresh used a four-agent split across domain contracts, web/API
boundaries, kit/UI surfaces, and scripts/config. The refreshed snapshot below
incorporates both those findings and local verification.

## Current Repo Truth

The repo has the right high-level direction:

- `@repo/domain` may depend on `zod` and already exports canonical domain
  schemas.
- `@repo/core` keeps Zod optional through the `@repo/core/adapters/zod` adapter.
- `apps/web` depends on Zod and now validates both the tRPC input for
  `deal.getOperationalCenter` and the `/deals/[dealId]` route param before route
  adapters build links or redirects.
- `apps/web` validates operational-center output with a strict tRPC output
  schema plus service-level invariant checks for money, date strings, capital
  math, forbidden finance fields, and cross-record graph references.
- `@repo/domain` exports reusable money JSON schemas and helper input schemas
  for raw boundary data that feeds domain summary helpers.
- Generated JSON boundaries now have local validators for design-token source
  data and route bundle diagnostics.
- `@repo/ui` and `@repo/kit` do not depend on Zod, which remains correct.

The current read path is:

```text
Northstar TypeScript fixture
  -> getDealOperationalCenter()
  -> DealOperationalCenterDTO
  -> service-level invariant validation
  -> tRPC output schema
  -> route adapters
  -> kit components
```

The production target should be:

```text
database, provider payloads, imports, auth/session context, or CMS
  -> validation at ingress
  -> domain/app service
  -> serializable DTO schema at API boundary
  -> route adapter
  -> kit component props
```

The important rule is that validation should sit at the first point where data
leaves a trusted compile-time context. The latest remediation moved route slugs,
service DTOs, tRPC output, generated JSON, and domain helper inputs in that
direction. Remaining validation work is conditional on future external sources,
such as replacing the TypeScript fixture with DB/CMS/provider data or adding
additional locale message files.

## Decision Rule

Add Zod, JSON Schema, or a similar validator when at least one of these is true:

- Data came from URL params, search params, request bodies, headers, cookies,
  environment variables, local storage, generated JSON, imported JSON, provider
  APIs, CMS, database records, CSV/XLSX imports, user forms, package manifests,
  or generated diagnostics files.
- A TypeScript type describes a serialized DTO crossing an API or server/client
  boundary.
- A package exports a reusable business contract that should not be redefined by
  app or UI layers.
- A static fixture is standing in for a future external source and is already
  treated as canonical app data.
- A malformed value can silently understate risk, hide readiness blockers,
  break formatting, or produce non-canonical navigation.

Do not add runtime schemas when:

- The value is an ordinary typed React prop produced inside the same compiled
  app.
- A helper operates only on branded values that were already validated at the
  boundary.
- A small custom type guard is clearer for a third-party UI callback payload.
- A contract script is scanning source text or computing derived facts that Zod
  cannot express cleanly.

## Priority Findings

### P0 - Normalize And Validate Deal Route Params

**Status:** Fixed on 2026-05-19.

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [data.ts](../../apps/web/app/deals/[dealId]/data.ts)
- [page.tsx](../../apps/web/app/deals/[dealId]/page.tsx)
- [layout.tsx](../../apps/web/app/deals/[dealId]/layout.tsx)
- [about/page.tsx](../../apps/web/app/deals/[dealId]/about/page.tsx)

Current state:

`DealSlugSchema` trims and validates the URL slug with a slug regex, and
`GetOperationalCenterInputSchema` composes it. `normalizeDealId()` safe-parses
route params before `getDealOperationsData()` calls the service. The deal route
now builds redirects and shell links from `data.deal.slug`, not the raw route
param.

Why this matters:

The previous path could treat `/deals/%20northstar-energy%20` as supported while
still generating non-canonical redirects or links. That drift point is now
closed for the current deal route.

Follow-up:

Keep this pattern for future route params: parse once at the route/data helper
boundary, then pass only the canonical value downstream. Do not use
`DealIdSchema` for this route unless the URL changes from human-readable slugs
to UUID-backed domain IDs.

### P0 - Add Strict tRPC Output DTO Validation

**Status:** Fixed on 2026-05-19.

Files:

- [deal-router.ts](../../apps/web/server/trpc/routers/deal-router.ts)
- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [operational-center-service.ts](../../apps/web/server/deals/operational-center-service.ts)
- [operational-center-validation.ts](../../apps/web/server/deals/operational-center-validation.ts)
- [northstar-operational-center-dto-spec.md](../20-specs/northstar-operational-center-dto-spec.md)

Current state:

The tRPC procedure validates input with `GetOperationalCenterInputSchema`.
`getDealOperationalCenter()` then validates the generated DTO with
`validateDealOperationalCenter()` before returning. That validation catches
money shape, non-EUR currency, invalid ISO date-time strings, capital invariant
failures, forbidden finance fields, and dangling graph references.

`GetDealOperationalCenterOutputSchema` now parses the full output union,
including `Ok`, `UnsupportedDeal`, `ReconciliationError`,
`MoneySerializationError`, and `ValidationError`. `deal.getOperationalCenter`
declares `.output(GetDealOperationalCenterOutputSchema)` and parses the mapped
result before returning it.

Why this matters:

The DTO is the app-owned serialized API contract. It contains money, dates,
status enums, readiness dimensions, blockers, documents, investors, and activity
events. The current path now has both structure validation at the API boundary
and business invariant validation in the service.

Follow-up:

Keep the DTO schema app-owned. Do not move app route shape, route hints, or
rendering-specific grouping into `@repo/domain`. If source data later comes from
DB/CMS/provider/import JSON, add source-record ingress schemas before mapper
logic runs; do not rely only on post-mapping DTO validation.

### P0 - Validate Design Token Source Before Generation

**Status:** Fixed on 2026-05-19.

Files:

- [generate.mjs](../../packages/design-tokens/scripts/generate.mjs)
- [validate.mjs](../../packages/design-tokens/scripts/validate.mjs)
- [tokens.source.json](../../packages/design-tokens/src/tokens.source.json)
- [design-tokens-spec.md](../20-specs/design-tokens-spec.md)

Current state:

`readTokenSource()` now parses JSON and then validates the token source shape
before generation. The validator checks `$schemaVersion`, `meta.name`,
`meta.description`, light/dark theme color maps, every required semantic color
token, token `$type`/`$value`, base token groups, and OKLCH syntax for color
values. Focused tests cover missing theme records, invalid token values,
metadata/schema-version drift, wrong token types, and invalid OKLCH values.

Why this matters:

Design tokens are generated package output. A malformed source file can produce
stale, invalid, or misleading runtime exports. This is generated JSON-to-code
ingress, so TypeScript alone is not the right protection.

Implemented shape checks:

- `$schemaVersion: "funding.design-tokens.v1"`
- `meta.name` and `meta.description`
- `themes.light.color` and `themes.dark.color`
- required semantic token names
- token objects with exact `$type` and string `$value`
- base token groups such as radius, font, space, shadow, and motion
- OKLCH syntax for every color token value

Keep the existing manual checks for generated-file freshness, placeholder
removal, readiness alias equivalence, and WCAG contrast math. Those checks are
semantic or file-system validations, not schema-shape validations.

The implementation uses a local structured guard instead of adding Zod to
`@repo/design-tokens`, which is acceptable because the package exports generated
CSS and generated TypeScript, not runtime validators.

### P1 - Centralize Domain Money JSON Schemas

**Status:** Fixed on 2026-05-19.

Files:

- [commitment-flow.ts](../../packages/domain/src/commitment-flow/commitment-flow.ts)
- [reconciliation.ts](../../packages/domain/src/reconciliation/reconciliation.ts)
- [investor-operations.ts](../../packages/domain/src/commitments/investor-operations.ts)
- [euro-cents.ts](../../packages/domain/src/money/euro-cents.ts)
- [index.ts](../../packages/domain/src/money/index.ts)

Current state:

`@repo/domain/money` now exports `createEuroCentsJsonSchema`,
`EuroCentsJsonSchema`, `NonNegativeEuroCentsJsonSchema`, and
`PositiveEuroCentsJsonSchema`. Commitment flow, reconciliation, and investor
operations reuse those schemas instead of defining local number-to-`EuroCents`
transforms.

Why this matters:

Money parsing is a domain invariant. Duplicated schemas increase the chance that
one form, fixture, API input, or future repository path accepts a different
shape or produces different stable error keys.

Follow-up:

Use these schemas for future money-bearing JSON ingress paths rather than adding
new local transforms.

### P1 - Tighten Commitment Flow Required Text

**Status:** Fixed on 2026-05-19.

File:

- [commitment-flow.ts](../../packages/domain/src/commitment-flow/commitment-flow.ts)

Current state:

`RequiredTextSchema` now trims before requiring non-empty text. `amountRaw` also
trims before `min(1)`, and UBO `fullName` trims before `min(2)`. Tests cover
trimmed display amount text and whitespace-only UBO names.

Why this matters:

The commitment flow is user-facing and will eventually be a form boundary.
Whitespace-only names, filenames, registration numbers, tax identifiers, or raw
amounts should not satisfy required business fields.

Follow-up:

If future UI needs to preserve untrimmed display text, keep that as raw form
state and parse into canonical domain data before submission.

### P1 - Validate App DTO Money, Dates, And Graph References

**Status:** Fixed for the current service and tRPC output path.

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [operational-center-validation.ts](../../apps/web/server/deals/operational-center-validation.ts)
- [operational-center-service.ts](../../apps/web/server/deals/operational-center-service.ts)
- [operational-center-validation.test.ts](../../apps/web/server/deals/operational-center-validation.test.ts)

Current state:

The service now validates serialized money with `MoneyMinorUnitsSchema`, date
strings with `IsoDateTimeStringSchema`, capital math invariants, forbidden
finance fields, and cross-record references before returning a successful DTO.
Tests cover valid DTOs, invalid money, non-EUR money, invalid dates, capital
invariant failures, and dangling references.

Why this matters:

This closes the highest-risk runtime drift in the current Northstar operational
center path. Bad values are turned into a typed `ValidationError` result instead
of silently reaching route adapters and kit components.

Follow-up:

Do not duplicate this validation inside kit components. If the source becomes
external, add source-record schemas before mapper logic.

### P2 - Validate Fixture Data When It Becomes External Or Canonical

**Status:** Conditional. Static TypeScript fixture is acceptable today; validate
at load time when it moves outside compiled source.

File:

- [northstar-energy.fixture.ts](../../apps/web/server/deals/fixtures/northstar-energy.fixture.ts)

Current state:

The Northstar fixture uses `satisfies`, which is compile-time only. This is
acceptable while the fixture is TypeScript source owned by the repo, and the
service now validates the generated DTO before returning success. The fixture is
still the canonical app data source for the current vertical and is the likely
replacement point for database, CMS, import, or provider-backed data.

Why this matters:

If the fixture moves to JSON or another external format, TypeScript will no
longer protect it. At that point source records should be parsed before mapper
logic runs, not only after DTO construction.

Recommended change:

When the fixture becomes external, validate it at load time using:

- domain schemas for core domain records
- app-local schemas for route hints, activity, groups, vehicle setup, access,
  dates, and graph references

Until then, static TypeScript plus targeted service tests is acceptable.

### P2 - Add Schemas For Exported Domain Helper Inputs

**Status:** Fixed on 2026-05-19.

Files:

- [reconciliation.ts](../../packages/domain/src/reconciliation/reconciliation.ts)
- [deal-readiness.ts](../../packages/domain/src/deals/deal-readiness.ts)
- [commitment-lifecycle.ts](../../packages/domain/src/commitments/commitment-lifecycle.ts)

Current state:

Several exported helper input types are plausible app/API boundary shapes and
now have matching schemas:

- `CapitalReconciliationInputSchema`
- `ClosingReadinessInputSchema`
- `CommitmentOperationalActivityInputSchema`

Why this matters:

These helpers compute business summaries. If future API handlers or repository
adapters accept raw records and call these helpers directly, schema drift can
enter before the domain logic runs.

Implemented schemas:

- `CapitalReconciliationInputSchema` uses shared non-negative money schemas
- `ClosingReadinessInputSchema` uses `ClosingBlockerSchema`
- `CommitmentOperationalActivityInputSchema` uses lifecycle/status schemas and
  booleans

Do not parse inside the pure helper on every call. Parse once at the boundary,
then pass branded or schema-validated values into the helper.

### P2 - Export Commitment Sub-Schemas When Needed

**Status:** Conditional.

File:

- [commitment-flow.ts](../../packages/domain/src/commitment-flow/commitment-flow.ts)

Current state:

The module exports types such as `UploadedDocument`, `Ubo`, `IndividualKyc`, and
qualification variants, but some corresponding schemas are private implementation
details.

Why this matters:

If app code validates subforms, upload responses, UBO rows, or progressive
commitment steps independently, it should compose canonical domain schemas
instead of redefining them locally.

Recommended change:

Export the component schemas once there is a real consumer. Avoid exporting
every private schema preemptively if it would create unnecessary public API
surface.

### P2 - Validate Route Bundle Diagnostics JSON

**Status:** Fixed on 2026-05-19.

File:

- [report-route-bundles.mjs](../../apps/web/scripts/report-route-bundles.mjs)

Current state:

The script now parses `.next/diagnostics/route-bundle-stats.json` through a
local structured guard. It requires an array of route entries, a non-empty route
string, a non-negative integer `firstLoadUncompressedJsBytes`, and optional
string chunk paths. Focused tests cover invalid JSON, non-array input, missing
byte counts, fractional byte counts, and non-string chunk paths.

Why this matters:

This is generated diagnostics JSON outside the TypeScript compiler. A changed
Next.js diagnostics format could make bundle reports misleading or crash with a
low-signal error.

The report output shape is unchanged.

### P3 - Kit View Models Should Be Validated Upstream

**Status:** No Zod needed in kit today.

Files:

- [deal-commitments-table.types.ts](../../packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts)
- [deal-progress-panel.types.ts](../../packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts)
- [deal-operational-overview.types.ts](../../packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts)
- [deal-commitment-inspector.types.ts](../../packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.types.ts)
- [deal-documents-evidence.types.ts](../../packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts)

Current state:

Kit exports rich view-model types. These include table controls, readiness
records, pagination, sort state, progress segments, activity items, document
groups, blockers, evidence rows, and discriminated UI state unions. Current app
routes validate upstream before feeding these models.

Why this matters:

Bad values can break model functions, class maps, pattern matching, filtering,
sorting, or pagination. But kit is not the right package to parse untrusted data:
kit should remain a typed, domain-aware component layer, not an API validation
layer.

Recommended change:

Validate DTOs and route-adapter inputs before building kit props. If kit state is
ever hydrated directly from URL search params, local storage, CMS, or API JSON,
validate at that adapter boundary. Do not import Zod into normal render
components just to re-check props every render.

### P3 - Documentation, Export, And Package Drift

**Status:** Fixed on 2026-05-19.

Files:

- [packages/domain/README.md](../../packages/domain/README.md)
- [package-exports.test.ts](../../packages/domain/src/package-exports.test.ts)
- [packages/domain/package.json](../../packages/domain/package.json)
- [packages/domain/src/index.ts](../../packages/domain/src/index.ts)
- [packages/domain/src/commitment-flow/index.ts](../../packages/domain/src/commitment-flow/index.ts)
- [packages/ui/package.json](../../packages/ui/package.json)
- [globals.css](../../packages/ui/src/styles/globals.css)
- [package-boundaries.md](../10-architecture/package-boundaries.md)

Current state:

Package export smoke tests exercise a broader set of domain subpaths, including
commitment flow, commitments, deals, documents, IDs, money, reconciliation, SPV,
and status tone. The domain README now calls out reusable money JSON schemas.

The root package now exports the `AmountStep` type alongside
`AmountStepSchema`, with a type-only export assertion covering the root surface.

`packages/ui/package.json` now declares the intentional
`@repo/tailwind-config` dependency used by `packages/ui/src/styles/globals.css`.

Why this matters:

This is not primarily a Zod issue, but it affects schema discoverability and
package-boundary correctness. If canonical schema surfaces and package
dependencies are unclear, app code is more likely to redefine contracts locally
or depend on undeclared workspace packages.

Follow-up:

Keep package export tests and README examples current whenever a new canonical
schema surface is added.

### P3 - I18n Message Shape

**Status:** Low-risk follow-up; Zod optional.

File:

- [request.ts](../../apps/web/i18n/request.ts)

Current state:

`apps/web/i18n/request.ts` imports `fr-FR.json`. TypeScript
`resolveJsonModule` proves the file can be imported, but it does not prove key
completeness if more locales are added.

Why this matters:

This becomes a runtime drift issue when multiple locale files or externalized
messages exist. A missing key can show up only at render time.

Recommended change:

Prefer a lightweight message-key completeness test if another locale is added.
Use a schema only if messages move to externally loaded JSON or need richer
metadata validation.

## Things That Should Not Get Zod Now

### Generic UI Primitives

Files:

- [button.tsx](../../packages/ui/src/components/button.tsx)
- [badge.tsx](../../packages/ui/src/components/badge.tsx)
- [field.tsx](../../packages/ui/src/components/field.tsx)
- [input.tsx](../../packages/ui/src/components/input.tsx)
- [textarea.tsx](../../packages/ui/src/components/textarea.tsx)
- [checkbox.tsx](../../packages/ui/src/components/checkbox.tsx)
- [progress.tsx](../../packages/ui/src/components/progress.tsx)

These are typed React/Radix/CVA component props. Adding schemas would duplicate
TypeScript, add runtime cost, and make generic UI primitives aware of validation
concerns they should not own.

### Recharts Payload Guards

File:

- [chart.tsx](../../packages/ui/src/components/chart.tsx)

The chart component treats third-party Recharts payloads as `unknown` and uses
small defensive guards. That is the right level of validation for this boundary.
Zod would only be relevant if `ChartConfig` starts coming from external JSON or
CMS data.

### Observability Dev Flag And Telemetry Guards

Files:

- [telemetry-transport.ts](../../apps/web/observability/telemetry-transport.ts)
- [web-vitals.ts](../../apps/web/observability/web-vitals.ts)
- [telemetry-events.ts](../../apps/web/observability/telemetry-events.ts)

The local storage development flag is guarded with `try/catch` and an exact
`"true"` check, and the telemetry helpers use small explicit guards or
sanitizers. That is clearer than adding Zod today. Schemas become relevant only
if telemetry config, vendor payloads, or persisted settings move to JSON-backed
runtime inputs.

### Pure Branded-Value Helpers

Files:

- [euro-cents.ts](../../packages/domain/src/money/euro-cents.ts)
- [spv-status.ts](../../packages/domain/src/spv/spv-status.ts)
- [deal-lifecycle.ts](../../packages/domain/src/deals/deal-lifecycle.ts)
- [commitment-lifecycle.ts](../../packages/domain/src/commitments/commitment-lifecycle.ts)

Helpers that operate on already-branded `EuroCents` or already-validated status
unions should not parse on every call. Parse at ingress, then keep the pure
helpers simple.

### Source-Scanning Contract Scripts

Files:

- [check-styles-contract.mjs](../../packages/ui/scripts/check-styles-contract.mjs)
- [check-kit-contract.mjs](../../packages/kit/scripts/check-kit-contract.mjs)

These scripts scan source text for forbidden patterns. Regex-based manual logic
is appropriate. Zod would only help if the rule list moved to external JSON
configuration.

### Tool-Owned Config Files

Files:

- [biome.json](../../biome.json)
- [turbo.json](../../turbo.json)
- [components.json](../../packages/ui/components.json)

These files already reference tool schemas and are parsed by their owning tools.
Do not add bespoke repo validators unless local scripts start reading and
interpreting these configs directly.

## Remediation Status

Completed on 2026-05-19:

1. Strict `GetDealOperationalCenterOutputSchema` and tRPC `.output(...)`.
2. Local structured guard for route bundle diagnostics JSON.
3. Design-token source validation before generation and semantic validation.
4. Centralized domain money JSON schemas in `@repo/domain/money`.
5. Commitment-flow required text trimming, including `amountRaw` and UBO
   `fullName`.
6. Helper input schemas in `@repo/domain` for raw JSON/repository boundaries.
7. Domain documentation/export drift fixes and type-only root export coverage.
8. `@repo/ui` package dependency declaration for `@repo/tailwind-config`.
9. Runtime validation guardrail added to [AGENT.md](../../AGENT.md).

Still conditional:

- Keep fixture validation conditional until the source moves outside compiled
  TypeScript; add source-record schemas before replacing the fixture with DB,
  CMS, import, or provider data.
- Add locale message key completeness tests if additional locale files are
  introduced.

## Enforcement Checklist For Future Work

When adding a new feature or refactoring a data path, answer these questions in
the PR or implementation note:

- Does this code accept URL params, search params, request bodies, headers,
  cookies, environment variables, imported/generated JSON, external API data,
  database records, local storage, submitted form data, package manifests, or
  generated diagnostics?
- If yes, which schema validates it, and where is that schema owned?
- If the data is a domain concept, does it reuse `@repo/domain` rather than
  redefining states, money, IDs, or business rules locally?
- If the data is an app DTO, does the schema check serialized money, dates,
  discriminated unions, result tags, and cross-record references?
- If validation was intentionally not added, is the value produced by trusted
  compiled code in the same layer?
