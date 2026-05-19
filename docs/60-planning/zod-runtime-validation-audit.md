# Zod Runtime Validation Audit

**Status:** Audit findings  
**Created:** 2026-05-18  
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
- design token scripts, generated data, config, and contract scripts

## Current Repo Truth

The repo already has the right high-level direction:

- `@repo/domain` may depend on `zod` and already exports canonical domain
  schemas.
- `@repo/core` keeps Zod optional through the `@repo/core/adapters/zod` adapter.
- `apps/web` depends on Zod and already validates the tRPC input for
  `deal.getOperationalCenter`.
- `@repo/ui` and `@repo/kit` do not depend on Zod, which is mostly correct.

The current read path is:

```text
Northstar fixture
  -> getDealOperationalCenter()
  -> DealOperationalCenterDTO
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
leaves a trusted compile-time context.

## Decision Rule

Add Zod, JSON Schema, or a similar validator when at least one of these is true:

- Data came from URL params, search params, request bodies, headers, cookies,
  environment variables, local storage, generated JSON, imported JSON, provider
  APIs, CMS, database records, CSV/XLSX imports, or user forms.
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

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [data.ts](../../apps/web/app/deals/[dealId]/data.ts)
- [page.tsx](../../apps/web/app/deals/[dealId]/page.tsx)
- [layout.tsx](../../apps/web/app/deals/[dealId]/layout.tsx)

Current state:

`GetOperationalCenterInputSchema` validates `dealId` with `z.string().trim().min(1)`.
The service trims again before comparing against `northstar-energy`, but route
code reuses the raw route param when building redirects and links.

Why this matters:

A route like `/deals/%20northstar-energy%20` can be treated as supported by the
service while still producing redirects or links containing the non-canonical raw
value. This is a small bug today and a larger drift risk once more route slugs,
permissions, cache keys, or analytics events exist.

Recommended change:

Add an app-local slug schema, for example:

```ts
const DealSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const DealRouteParamsSchema = z.object({
  dealId: DealSlugSchema,
})
```

Parse route params once near `getDealOperationsData` or a route helper, then use
the parsed canonical slug everywhere. Do not use `DealIdSchema` for this route
unless the URL changes from human-readable slugs to UUID-backed domain IDs.

### P0 - Add tRPC Output DTO Validation

Files:

- [deal-router.ts](../../apps/web/server/trpc/routers/deal-router.ts)
- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [northstar-operational-center-dto-spec.md](../20-specs/northstar-operational-center-dto-spec.md)

Current state:

The tRPC procedure validates input with `GetOperationalCenterInputSchema`, but
the large `GetDealOperationalCenterOutputDTO` union is type-only. That means
mapper, fixture, or future repository drift can reach `/api/trpc` without a
runtime check.

Why this matters:

The DTO is the app-owned serialized API contract. It contains money, dates,
status enums, readiness dimensions, blockers, documents, investors, and activity
events. A bad enum or date can break UI formatting. A missing blocker reference
can understate operational risk. TypeScript catches compile-time code drift, but
it will not catch database rows, imported JSON, CMS payloads, provider payloads,
or generated data.

Recommended change:

Create `GetDealOperationalCenterOutputSchema` and add `.output(...)` to the tRPC
procedure. Compose it from:

- existing domain schemas for deal lifecycle, commitment lifecycle, readiness,
  blocker, document, KYC/KYB, signature, wire, and capital statuses
- app-local DTO schemas for route hints, vehicle/access modes, money DTOs, date
  strings, document groups, activity events, and result union tags
- graph-level `superRefine` checks for references between investors, blockers,
  documents, groups, and activity events

Keep the DTO schema app-owned. Do not move app route shape, route hints, or
rendering-specific grouping into `@repo/domain`.

### P0 - Validate Design Token Source Before Generation

Files:

- [generate.mjs](../../packages/design-tokens/scripts/generate.mjs)
- [validate.mjs](../../packages/design-tokens/scripts/validate.mjs)
- [tokens.source.json](../../packages/design-tokens/src/tokens.source.json)
- [design-tokens-spec.md](../20-specs/design-tokens-spec.md)

Current state:

`readTokenSource()` calls `JSON.parse` and returns unchecked data. The generator
then emits CSS and a TypeScript module from that data. The validator checks many
required paths and contrast pairs, but it does not validate the full source
shape, `$schemaVersion`, token `$type`, top-level sections, or all OKLCH color
values before semantic checks run.

Why this matters:

Design tokens are generated package output. A malformed source file can produce
stale, invalid, or misleading runtime exports. The current validator can also
throw during contrast validation instead of reporting all schema issues together.

Recommended change:

Add a `DesignTokenSourceSchema` using Zod or JSON Schema. It should validate:

- `$schemaVersion: "funding.design-tokens.v1"`
- `meta.name` and `meta.description`
- `themes.light.color` and `themes.dark.color`
- required semantic token names
- token objects with `$type` and `$value`
- base token groups such as radius, font, space, shadow, and motion
- OKLCH syntax for color token values

Keep the existing manual checks for generated-file freshness, placeholder
removal, readiness alias equivalence, and WCAG contrast math. Those checks are
semantic or file-system validations, not schema-shape validations.

If Zod is used here, keep it in `@repo/design-tokens` `devDependencies`. The
package exports generated CSS and generated TypeScript, not runtime validators.

### P1 - Centralize Domain Money JSON Schemas

Files:

- [commitment-flow.ts](../../packages/domain/src/commitment-flow/commitment-flow.ts)
- [reconciliation.ts](../../packages/domain/src/reconciliation/reconciliation.ts)
- [investor-operations.ts](../../packages/domain/src/commitments/investor-operations.ts)
- [euro-cents.ts](../../packages/domain/src/money/euro-cents.ts)

Current state:

Several domain modules define local Zod number-to-`EuroCents` schemas. They are
similar but not identical. For example, commitment flow prefixes some parse
messages with `money.`, while reconciliation and investor operations use raw
error tags in the transform guard.

Why this matters:

Money parsing is a domain invariant. Duplicated schemas increase the chance that
one form, fixture, API input, or future repository path accepts a different
shape or produces different stable error keys.

Recommended change:

Export canonical money schemas from `@repo/domain/money`, for example:

- `EuroCentsFromJsonNumberSchema`
- `NonNegativeEuroCentsFromJsonNumberSchema`
- `PositiveEuroCentsFromJsonNumberSchema`

Use these in commitment flow, reconciliation, investor operations, and future
DTO ingress paths.

### P1 - Tighten Commitment Flow Required Text

File:

- [commitment-flow.ts](../../packages/domain/src/commitment-flow/commitment-flow.ts)

Current state:

`RequiredTextSchema` uses `z.string().min(1)`, so whitespace-only input passes.
Other domain schemas use trimmed required strings for documents, blockers,
reconciliation, and investor operations.

Why this matters:

The commitment flow is user-facing and will eventually be a form boundary.
Whitespace-only names, filenames, registration numbers, or tax identifiers
should not satisfy required business fields.

Recommended change:

Change the helper to trim before `min(1)`, unless the raw value must be preserved
for a specific display reason:

```ts
const RequiredTextSchema = z
  .string()
  .trim()
  .min(1, { error: 'commitment.text.required' })
```

If raw display text must be preserved, use separate raw form state and parse into
canonical domain data before submission.

### P1 - Validate Date Strings In App DTOs

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [deal-operational-formatting.ts](../../apps/web/app/deals/[dealId]/deal-operational-formatting.ts)
- [deal-operational-overview-adapter.ts](../../apps/web/app/deals/[dealId]/deal-operational-overview-adapter.ts)

Current state:

The DTO uses plain `string` fields for dates such as `generatedAt`,
`targetCloseDate`, `lastUpdatedAt`, activity `occurredAt`, document `dueDate`,
and `lastActivityAt`. Later route code formats dates with `new Date(value)` and
sorts activity-like values lexically.

Why this matters:

Invalid date strings can create invalid display output or runtime formatting
errors. Non-ISO date strings can sort incorrectly while still looking like
strings to TypeScript.

Recommended change:

Use local DTO schemas with `z.iso.datetime()` for serialized date fields. Reuse
domain schemas where they already cover a record, such as investor
`lastActivityAt`, but keep app-only activity and route fields in the web DTO
schema.

### P1 - Validate Cross-Record References

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [operational-center-investor-mapper.ts](../../apps/web/server/deals/operational-center-investor-mapper.ts)
- [deal-commitment-inspector-adapter.ts](../../apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts)

Current state:

IDs such as `relatedInvestorIds`, `relatedDocumentIds`, `blockerIds`,
`documentIds`, and group document IDs are plain strings. Some mapper code drops
missing references silently.

Why this matters:

Silently missing references can hide blockers, make document counts wrong, or
understate readiness. That is a business-risk issue, not just a display issue.

Recommended change:

Add graph-level validation with `superRefine` on the app DTO or source fixture
schema:

- every blocker investor reference points to an existing investor
- every blocker document reference points to an existing document
- every investor blocker/document reference points to an existing blocker or
  document
- every document group contains existing documents
- every activity event references existing records appropriate to its event type

Use domain ID schemas only if these become UUID-backed domain IDs. Today these
are app/local fixture identifiers.

### P2 - Validate Fixture Data When It Becomes External Or Canonical

File:

- [northstar-energy.fixture.ts](../../apps/web/server/deals/fixtures/northstar-energy.fixture.ts)

Current state:

The Northstar fixture uses `satisfies`, which is compile-time only. This is
acceptable while the fixture is TypeScript source owned by the repo, but it is
already the canonical app data source for the current vertical.

Why this matters:

The fixture is the future replacement point for database, CMS, import, or
provider-backed data. If it moves to JSON or another external format, TypeScript
will no longer protect it.

Recommended change:

When the fixture becomes external, validate it at load time using:

- domain schemas for core domain records
- app-local schemas for route hints, activity, groups, vehicle setup, access,
  dates, and graph references

Until then, static TypeScript plus targeted service tests is acceptable.

### P2 - Add App Money DTO Schema

Files:

- [operational-center-dto.ts](../../apps/web/server/deals/operational-center-dto.ts)
- [operational-center-money.ts](../../apps/web/server/deals/operational-center-money.ts)
- [deal-operational-formatting.ts](../../apps/web/app/deals/[dealId]/deal-operational-formatting.ts)

Current state:

Domain money is serialized through `serializeEuroCentsToNumber`, which checks
safe integer conversion. The resulting DTO is a plain object:

```ts
{
  amountMinor: number
  currency: 'EUR'
}
```

Why this matters:

The production path is currently safe, but DTO consumers still trust
`amountMinor` and `currency`. Output validation should prove the serialized API
contract remains JSON-safe and EUR-only.

Recommended change:

Add an app-local `MoneyMinorUnitsDTOSchema` with:

- `amountMinor`: integer, safe number
- `currency`: literal `"EUR"`

Keep raw money parsing and branding in `@repo/domain`.

### P2 - Add Schemas For Exported Domain Helper Inputs

Files:

- [reconciliation.ts](../../packages/domain/src/reconciliation/reconciliation.ts)
- [deal-readiness.ts](../../packages/domain/src/deals/deal-readiness.ts)
- [commitment-lifecycle.ts](../../packages/domain/src/commitments/commitment-lifecycle.ts)

Current state:

Several exported helper input types are plausible app/API boundary shapes but do
not have matching schemas:

- `CapitalReconciliationInput`
- `ClosingReadinessInput`
- commitment operational activity input

Why this matters:

These helpers compute business summaries. If future API handlers or repository
adapters accept raw records and call these helpers directly, schema drift can
enter before the domain logic runs.

Recommended change:

Add schemas where raw JSON input is expected:

- `CapitalReconciliationInputSchema` using shared money schemas
- `ClosingReadinessInputSchema` using `ClosingBlockerSchema`
- activity input schemas using lifecycle/status schemas and booleans

Do not parse inside the pure helper on every call. Parse once at the boundary,
then pass branded or schema-validated values into the helper.

### P2 - Export Commitment Sub-Schemas When Needed

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

### P3 - Kit View Models Should Be Validated Upstream

Files:

- [deal-commitments-table.types.ts](../../packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts)
- [deal-progress-panel.types.ts](../../packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts)
- [deal-operational-overview.types.ts](../../packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts)
- [deal-commitment-inspector.types.ts](../../packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.types.ts)
- [deal-documents-evidence.types.ts](../../packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts)

Current state:

Kit exports rich view-model types. These include table controls, readiness
records, pagination, sort state, progress segments, activity items, document
groups, blockers, and discriminated UI state unions.

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

### P3 - Documentation And Export Drift

Files:

- [packages/domain/README.md](../../packages/domain/README.md)
- [package-exports.test.ts](../../packages/domain/src/package-exports.test.ts)
- [packages/domain/package.json](../../packages/domain/package.json)

Current state:

The domain README export list is stale compared with `package.json`; the package
now also exports `deals`, `commitments`, `documents`, and `status-tone`.
Package-export tests smoke-test only a subset of exported schemas.

Why this matters:

This is not primarily a Zod issue, but it affects schema discoverability. If the
canonical schema surface is unclear, app code is more likely to redefine
contracts locally.

Recommended change:

Update docs and expand export smoke tests when schema work lands.

## Things That Should Not Get Zod Now

### Generic UI Primitives

Files:

- [button.tsx](../../packages/ui/src/components/button.tsx)
- [badge.tsx](../../packages/ui/src/components/badge.tsx)
- [field.tsx](../../packages/ui/src/components/field.tsx)
- [progress.tsx](../../packages/ui/src/components/progress.tsx)

These are typed React/Radix/CVA component props. Adding schemas would duplicate
TypeScript, add runtime cost, and make generic UI primitives aware of validation
concerns they should not own.

### Recharts Payload Guards

File:

- [chart.tsx](../../packages/ui/src/components/chart.tsx)

The chart component already treats third-party Recharts payloads as `unknown`
and uses small defensive guards. That is the right level of validation for this
boundary. Zod would only be relevant if `ChartConfig` starts coming from
external JSON or CMS data.

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

## Suggested Implementation Order

1. Add route-param schema and canonical slug handling for `/deals/[dealId]`.
2. Add `GetDealOperationalCenterOutputSchema` and tRPC `.output(...)`.
3. Add app DTO schemas for money, dates, activity, document groups, vehicle,
   access, and result unions.
4. Add graph-level reference validation with `superRefine`.
5. Centralize domain money JSON schemas.
6. Tighten commitment-flow required text.
7. Add design-token source schema before generation and before semantic
   validation.
8. Add helper input schemas in `@repo/domain` when those helpers receive raw
   JSON or repository data.
9. Update schema docs and export smoke tests.

## Proposed AGENT.md Addition

No `AGENT.md` or `AGENTS.md` file was found during this audit. If the repo adds
one, or if this guidance belongs in an existing agent instruction file, use a
short rule like this:

```md
## Runtime Validation

Before adding or changing a data boundary, decide whether the value is trusted
compiled code or untrusted runtime data. Use canonical `@repo/domain` schemas
for business/domain invariants, app-local DTO schemas for serialized route/API
shapes, and schema validation at URL, request, import, generated JSON, provider,
database, environment, form-submission, and storage boundaries. Do not add Zod
inside ordinary React render components or generic UI primitives just to
duplicate TypeScript props. When introducing a new DTO or external data source,
add or reuse a schema in the owning layer and document why validation lives
there.
```

## Enforcement Checklist For Future Work

When adding a new feature or refactoring a data path, answer these questions in
the PR or implementation note:

- Does this code accept URL params, search params, request bodies, headers,
  cookies, environment variables, imported/generated JSON, external API data,
  database records, local storage, or submitted form data?
- If yes, which schema validates it, and where is that schema owned?
- If the data is a domain concept, does it reuse `@repo/domain` rather than
  redefining states, money, IDs, or business rules locally?
- If the data is an app DTO, does the schema check serialized money, dates,
  discriminated unions, result tags, and cross-record references?
- If validation was intentionally not added, is the value produced by trusted
  compiled code in the same layer?

