# TypeScript Cheat Sheet Repo Audit

**Status:** Audit findings  
**Created:** 2026-05-19  
**Source standard:** `/Users/fabiencampana/Documents/roundtable/07_cheat_sheets/typescript.md`  
**Scope:** repo-wide TypeScript configuration, package boundaries, domain/core type design, server/runtime DTO boundaries, and React/UI public APIs

## Purpose

This note records the repo audit against the TypeScript cheat sheet. The goal is
to preserve the findings for future implementation work, including the rationale
behind each recommendation.

The audit used four parallel review lanes:

- compiler, package, and TypeScript configuration
- `@repo/core`, `@repo/domain`, `@repo/design-tokens`, and test configuration
- `apps/web` server, tRPC, DTO, runtime validation, and route data boundaries
- `@repo/ui`, `@repo/kit`, and React route adapter/component TypeScript APIs

The findings below were then cross-checked locally. No code was changed during
the audit.

## Verification Snapshot

Commands run:

```bash
pnpm typecheck
pnpm lint
```

Result:

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- No P0 or P1 issues were found.

The repo had pre-existing modified planning docs before this document was
created. Those unrelated files were not edited as part of this audit.

## Baseline Alignment

The repo is already strong against the cheat sheet's baseline TypeScript
guidance.

Positive findings:

- `strict`, `strictNullChecks`, `noImplicitAny`, `useUnknownInCatchVariables`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and
  `isolatedModules` are enabled in the shared base config.
- The repo avoids TypeScript `enum` and `const enum`; current enum-like matches
  are `z.enum(...)` schemas backed by literal arrays.
- Domain vocabulary is commonly modeled with `as const` arrays plus derived
  union types.
- Many record mappings use `satisfies Record<Union, Value>` to preserve narrow
  inference while enforcing exhaustiveness.
- `@repo/domain` uses branded types for IDs and money where nominal distinction
  matters.
- Runtime boundaries already use Zod in several important places, including
  route/service input parsing and domain schemas.
- The component and adapter code uses discriminated unions for many loading,
  error, ready, and workflow states.

This means the audit is not a general "turn strict mode on" exercise. The main
remaining risks are at runtime boundaries, public package/API boundaries, and a
few places where assertions or fallthrough defaults bypass the safety the repo
otherwise aims for.

## Priority Model

- **P0:** immediate correctness or safety issue likely to break core behavior.
- **P1:** high-risk issue likely to create production defects soon.
- **P2:** material type-safety or boundary issue that should be scheduled.
- **P3:** lower-risk hardening, consistency, or future-proofing.

No P0 or P1 issues were found.

## P2 Findings

### 1. Runtime DTO Boundaries Trust Erased TypeScript Types

Files:

- `apps/web/server/deals/operational-center-service.ts:57`
- `apps/web/server/deals/operational-center-service.ts:63`
- `apps/web/server/deals/operational-center-validation.ts:39`
- `apps/web/server/trpc/routers/deal-router.ts:58`

Current state:

`getDealOperationalCenter()` accepts `GetOperationalCenterInputDTO`, then
safe-parses the value. However, the parse-failure branch still reads
`input.dealId.trim()`. That is safe only if callers honor the TypeScript type.
If an untyped runtime caller passes `{}`, `null`, or `{ dealId: 123 }`, the DTO
annotation has already erased and the function can throw before returning the
typed error union.

`validateDealOperationalCenter()` accepts `DealOperationalCenterDTO`. It checks
important money, date, capital, and graph-reference invariants, but it starts
after trusting a compile-time-only DTO type. It is not a full parser for an
unknown payload.

The tRPC procedure validates input, but it has no `.output(...)` schema for the
`GetDealOperationalCenterOutputDTO` union.

Why this matters:

The cheat sheet's runtime-boundary rule is that TypeScript cannot validate
external data. A DTO type is useful inside trusted compiled code, but it is not
runtime evidence. Once the service is backed by database rows, provider payloads,
generated JSON, imports, or CMS data, this shape needs schema validation at the
ingress/API boundary.

Recommendation:

- Change runtime-facing service entry points to accept `unknown` where they are
  true boundaries.
- Parse first, and do not read raw input on parse failure.
- Define strict Zod schemas for `DealOperationalCenterDTO` and
  `GetDealOperationalCenterOutputDTO`.
- Derive DTO types from those schemas where practical.
- Add tRPC `.output(GetDealOperationalCenterOutputSchema)`.
- Keep the existing invariant validator, but run it after full shape parsing.

### 2. UI Status Mappers Use Non-Exhaustive Fallthrough Defaults

Files:

- `apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts:167`
- `apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts:249`
- `apps/web/app/deals/[dealId]/deal-commitments-table-adapter.ts:319`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:453`

Current state:

Several finite DTO status unions are mapped through `if` chains that end in a
default UI state. Examples include identity readiness, wire readiness, and
reconciliation readiness.

Why this matters:

If a new KYC, KYB, signature, or wire status is added to the domain union, these
mappers can still compile and silently render a default such as `Verified`,
`pending`, or `Not started`. That is exactly the class of bug the cheat sheet
recommends preventing with discriminated unions, exhaustive switches,
`never` checks, or `satisfies Record<Union, ...>` mappings.

Recommendation:

- Replace fallthrough mapper chains with exhaustive `Record<Status, Variant>`
  mappings where the logic is one-status-to-one-output.
- Use an `assertNever` default for true branching logic.
- Add type tests for representative status additions or invalid status cases
  where the component API is public.

### 3. Workspace Packages Are Source-Only, So Declaration Settings Do Not Protect Package Boundaries

Files:

- `packages/typescript-config/node-library.json:6`
- `packages/typescript-config/react-library.json:7`
- `packages/core/package.json:8`
- `packages/domain/package.json:8`
- `packages/kit/package.json:8`
- `packages/ui/package.json:8`

Current state:

The shared base config enables `declaration` and `declarationMap`, but package
configs force `noEmit`, package `build` scripts mostly run `tsc --noEmit`, and
workspace package exports point at raw `./src/*.ts` or `./src/*.tsx` files.

Why this matters:

This is workable for a source-only monorepo consumed by Next, Vite, Vitest, and
Turborepo. It does not exercise the declaration emit path that would protect
public package APIs for broader consumption. It also means package boundaries
depend on every consumer understanding TypeScript source files directly.

Recommendation:

- Decide whether packages are intentionally source-only workspace inputs or
  buildable libraries.
- If they are libraries, add separate build configs that emit `dist` JavaScript
  and `.d.ts`.
- Exclude tests, stories, fixtures, and setup files from declaration builds.
- Point `exports.types` and `exports.import` at `dist`.
- Keep `noEmit` configs for app/editor typechecking if needed.

### 4. `isolatedDeclarations` Is Missing From Library Builds

File:

- `packages/typescript-config/base.json:6`

Current state:

`declaration` and `declarationMap` are enabled in the base config, but
`isolatedDeclarations` is not enabled.

Why this matters:

The cheat sheet calls out `isolatedDeclarations` for declaration-safe public API
design. It forces explicit exported API annotations so declaration emit can be
parallelized and does not depend on whole-program checker inference. Without it,
exported APIs can accidentally rely on inference that only becomes unstable or
expensive when declaration output matters.

Recommendation:

- Enable `isolatedDeclarations` in library build configs.
- Add explicit return types for exported functions, objects, and component
  surfaces as required.
- Avoid enabling it only in a source-only app config if the repo is not ready
  to annotate every exported app helper.

### 5. Node Library Config Inherits Bundler Module Semantics

File:

- `packages/typescript-config/base.json:12`
- `packages/typescript-config/node-library.json:3`

Current state:

The base config uses `module: "ESNext"` and `moduleResolution: "bundler"`.
`node-library.json` inherits that setup.

Why this matters:

Bundler resolution is appropriate for Next, Vite, and source-only packages. It
does not model Node ESM runtime rules. If a package is meant to emit and run as
Node ESM, TypeScript may accept import/export patterns that emitted Node code
would not load.

Recommendation:

- Keep `bundler` for Next/React app and bundler-consumed library configs.
- Add a true Node build config using `module: "NodeNext"` and
  `moduleResolution: "NodeNext"` for packages/scripts that are intended to run
  directly under Node after emit.
- If all packages are intentionally source-only bundler inputs, document that
  decision clearly.

### 6. Manual Type And Schema Can Drift Under `exactOptionalPropertyTypes`

File:

- `packages/domain/src/commitments/investor-operations.ts:50`
- `packages/domain/src/commitments/investor-operations.ts:96`

Current state:

`InvestorOperationsRecord` is manually declared separately from
`InvestorOperationsRecordSchema`. Optional fields in the schema use
`.optional()`, while the manual TypeScript type uses `?:` fields.

Why this matters:

With `exactOptionalPropertyTypes`, an optional property means the key may be
absent. It does not automatically mean the key may be present with
`undefined`. Zod `.optional()` can accept explicit `undefined`. That creates a
small but real schema/type semantics gap at a domain boundary.

Recommendation:

- Derive `InvestorOperationsRecord` from the schema if the schema is canonical.
- Or transform parsed output to omit explicitly undefined optional keys.
- Or annotate the schema output intentionally if explicit `undefined` is part
  of the contract.

### 7. Generic Object Construction Uses Assertions That Overstate Runtime Shape

Files:

- `packages/core/src/option.ts:225`
- `packages/core/src/option.ts:233`
- `apps/web/server/deals/operational-center-money.ts:49`

Current state:

`Option.allFromRecord()` casts `Object.entries(record)` to typed key/value
entries and later casts the accumulated `values` object to `OptionRecord<T>`.
`Object.entries` only covers string enumerable keys, while `keyof T` may include
symbols.

`mapMoneyFields()` uses `Object.fromEntries(entries) as MoneyFieldValues<Fields>`.
That assumes the field list has unique keys and that every key survived the
runtime mapping.

Why this matters:

The cheat sheet treats assertions as explicit escapes from type checking. These
assertions are in reusable helper APIs, so a single unsound assumption can be
reused widely. The current call sites may be safe, but the public helper shape
does not encode the runtime constraints.

Recommendation:

- For `Option.allFromRecord()`, either constrain the API to string-keyed
  records or support all own keys with `Reflect.ownKeys`.
- Avoid `String(key)` if symbol keys are meant to be preserved.
- For money mapping, validate unique keys before `Object.fromEntries()` or use
  explicit mapping at call sites where DTO fields are known.
- Prefer a localized assertion only after runtime checks establish the required
  shape.

### 8. `asChild` Component APIs Do Not Model Their Runtime Branches

Files:

- `packages/ui/src/components/button.tsx:33`
- `packages/ui/src/components/badge.tsx:24`

Current state:

`ButtonProps` is based on `ComponentProps<'button'>`, and `BadgeProps` is based
on `ComponentProps<'span'>`. Both also allow `asChild?: boolean`. At runtime,
`asChild` switches rendering to Radix `Slot`, and some native props are retargeted
or dropped.

Why this matters:

The public prop type says callers are always passing button/span props, but the
runtime can render a different element. That is a public API design mismatch.
The cheat sheet recommends inference-friendly and type-safe public APIs; here a
discriminated union would better describe the native and slotted branches.

Recommendation:

- Model native and slotted variants as a discriminated union.
- For `Button`, separate `asChild?: false` native button props from
  `asChild: true` slot props.
- Add `@ts-expect-error` type tests for invalid prop combinations.
- Keep runtime disabled handling for slotted buttons, but make the API contract
  explicit.

## P3 Findings And Hardening Backlog

### Add `noImplicitOverride`

File:

- `packages/typescript-config/base.json:3`

Rationale:

The cheat sheet recommends `noImplicitOverride` to catch silent override drift.
The repo currently has very little class-based code, so the near-term risk is
low. Enabling it now is cheap future hardening.

Recommendation:

Add `"noImplicitOverride": true` to the shared base config once test mocks and
any class declarations are confirmed clean.

### Keep `noExplicitAny` Strict In Tests And Migrations

Files:

- `biome.json:147`
- `biome.json:191`

Rationale:

The cheat sheet warns that `any` is viral. Tests, migrations, and fixtures often
encode examples that future code copies. Downgrading `noExplicitAny` to `warn`
weakens that standard at the edge of the codebase.

Recommendation:

Keep `noExplicitAny` as `error` by default. Use localized suppressions with a
short rationale for genuine untyped interop.

### Add Duplicate-ID Validation For DTO Graphs

Files:

- `apps/web/server/deals/operational-center-validation.ts:302`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:182`

Rationale:

The current reference validator builds `Set`s for investor, blocker, document,
and group IDs. That checks existence but collapses duplicates. Downstream maps
and records can silently overwrite duplicate IDs.

Recommendation:

Add uniqueness validation for every ID collection before reference checks. As
the backend matures, consider branded schemas for entity-specific IDs.

### Encode Non-Empty Array Preconditions

Files:

- `packages/domain/src/money/euro-cents.ts:200`
- `packages/domain/src/money/euro-cents.ts:212`
- `packages/domain/src/money/euro-cents.ts:289`

Rationale:

`commaIndexes[0] as number`, `dotIndexes[0] as number`, and
`lastIndex(... ) as number` rely on callers having checked that arrays are
non-empty. Current callers do, but the helper signatures still accept ordinary
`readonly number[]`.

Recommendation:

Introduce a `NonEmptyReadonlyArray<T>` type such as `readonly [T, ...T[]]` after
length guards, or make index helpers return `Option<number>` or `Result`.

### Convert Boolean Subset Helpers Into Type Predicates Where Useful

Files:

- `packages/domain/src/spv/spv-status.ts:27`
- `packages/domain/src/deals/deal-lifecycle.ts:96`
- `packages/domain/src/deals/deal-lifecycle.ts:99`
- `packages/domain/src/commitments/commitment-lifecycle.ts:126`

Rationale:

Helpers like `isTerminalSpvStatus`, `isPreCloseDealLifecycleState`, and
`isTerminalCommitmentLifecycleState` return plain `boolean`. The cheat sheet
calls this out as a lost narrowing opportunity across function boundaries.

Recommendation:

Export subset types such as `TerminalSpvStatus`,
`PreCloseDealLifecycleState`, and `TerminalCommitmentLifecycleState`, then
return predicates like `state is TerminalCommitmentLifecycleState` where the
helper is meant to narrow.

### Validate Token JSON During Generation

Files:

- `packages/design-tokens/scripts/generate.mjs:139`
- `packages/design-tokens/package.json:20`

Rationale:

`readTokenSource()` returns raw `JSON.parse` output, and `buildTokensTs()` emits
TypeScript from that untyped value. A separate validation script exists, but
`build` runs only generation.

Recommendation:

Parse `tokens.source.json` through a schema inside generation, or have `build`
run validation before generation. Derive generated TypeScript types from the
validated shape.

### Avoid Widening Literal Config Just To Call `includes`

Files:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.model.ts:18`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.model.ts:20`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.model.ts:185`

Rationale:

`terminalStages` and `terminalActionKinds` are defined with `as const`, but then
cast to `readonly string[]` so `includes` accepts broader input. This loses
literal validation at the call site.

Recommendation:

Use `as const satisfies readonly DealProgressStage[]` and the action-kind
equivalent, plus a small typed `includes` helper when the searched value is a
wider union.

### Tighten Optional Field Semantics

Files:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:67`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:126`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:109`

Rationale:

Several public view-state fields use `?: T | undefined`. That opts those fields
out of the stricter absence semantics that `exactOptionalPropertyTypes` is meant
to preserve.

Recommendation:

Use `?: T` for absent-only optional fields. Reserve `?: undefined` for negative
union branches and `| undefined` only where explicit present-but-undefined is
part of the public API contract.

## Suggested Remediation Order

1. Add full tRPC output validation and change runtime service boundaries to
   parse `unknown` before reading values.
2. Replace UI status fallthrough defaults with exhaustive maps or switches.
3. Decide whether workspace packages are source-only or buildable libraries. If
   buildable, add `dist` emits and `isolatedDeclarations` in build configs.
4. Remove schema/type drift for `InvestorOperationsRecord`.
5. Tighten generic record/fromEntries helpers with string-key constraints,
   runtime uniqueness checks, or narrower APIs.
6. Add duplicate-ID validation in the operational-center DTO validator.
7. Model `Button` and `Badge` `asChild` branches with discriminated prop unions.
8. Apply the P3 hardening backlog as opportunistic cleanup.

## Notes On Non-Findings

These areas were checked and did not produce actionable findings:

- TypeScript strictness is already strong in the shared base config.
- No TypeScript `enum` or `const enum` declarations were found.
- `z.enum(...)` usage is appropriate because those are runtime schemas, not
  TypeScript enums.
- `unknown` is used for thrown values and untrusted adapter inputs in several
  places.
- Many public component state models already use discriminated unions and
  negative type tests with `@ts-expect-error`.
- Typecheck and lint passed after the audit.

