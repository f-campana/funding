# Security Risk Analysis - 2026-05-19

## Status

Read-only audit completed on 2026-05-19.

No files were edited during the audit itself. This document records the findings
for future reference and remediation planning.

## Scope

The review covered the whole `/Users/fabiencampana/Documents/funding`
repository, with additional product and domain context from:

- `/Users/fabiencampana/Documents/funding/docs`
- `/Users/fabiencampana/Documents/roundtable`

The requested mode was read-only. The review therefore focused on risk
identification, evidence, rationale, and remediation sequencing rather than code
changes.

## Methodology

The audit used a small team of focused sub-agents, then consolidated their
results with local verification. The workstreams were:

- Architecture and threat model
- Authentication, authorization, routing, and API exposure
- Input validation, data modeling, and business logic integrity
- Supply chain, package manager, build, and CI configuration
- Secrets, privacy, telemetry, and data exposure
- Agentic and AI-instruction risk, mapped against OWASP Agentic Skills Top 10

Local verification included:

```bash
pnpm audit --audit-level low
pnpm audit --prod --audit-level low
pnpm lint
pnpm test
pnpm --filter @repo/web typecheck
pnpm --filter @repo/kit build
pnpm --filter @repo/design-tokens check
rg-based scans for secrets and risky APIs
```

The audit used OWASP-style secure review reasoning:

- Identify trust boundaries.
- Identify sensitive data classes.
- Check whether code enforces the intended boundary.
- Separate display metadata from security controls.
- Treat future production migration risk as material where the code shape makes
  unsafe migration easy.
- Treat agent prompts, local skills, and repo instructions as part of the
  execution surface, not passive documentation.

## Executive Summary

The repository is currently appropriate as a fixture-backed frontend case study.
It is not production-private-data ready.

The central risk is that private-market operational data has a production-shaped
API and route surface, but no authentication, authorization, tenant context, or
permission filtering. The code and docs repeatedly describe the current data as
fixture-backed and not production-private-data safe. That is good awareness, but
it is not a hard control. If live data is attached to the existing seams before
auth and least-privilege read models are implemented, the failure mode is direct
data exposure.

The second major risk is client serialization. Several paths pass broad
operator DTOs into client components. In React Server Components and Next.js App
Router, anything passed to a client component can be serialized to the browser,
even if a user does not visibly see it. Hidden drawers, tabs, rows, and rails are
not security boundaries.

The third major risk is supply-chain hygiene. Current dependency audit results
show vulnerable packages, including a high-severity Next.js advisory. The repo
also lacks tracked CI configuration to enforce frozen lockfile installs, audits,
lint, typecheck, tests, and Storybook build.

Finally, the repo has agentic security risks. Some agent runbooks execute
mutable remote CLIs with `@latest`, and repo-local skills lack security
manifests, permission declarations, risk tiers, hashes, signatures, or scan
status. This maps directly to OWASP Agentic Skills Top 10 risks around supply
chain compromise, over-privileged skills, update drift, poor scanning, and no
governance.

## Sensitive Data Classes

The reviewed product context includes sensitive private-market and financial
operations data:

- Investor names and emails
- Legal entity names
- Commitment amounts
- KYC/KYB status
- UBO evidence status
- Proof-of-address and source-of-funds document status
- Signature status
- Wire and reconciliation status
- Protected/internal document groups
- Activity and audit-event-like records
- Deal sharing and access request state
- Delegation, impersonation, and representative authority concepts
- Bank/payment context from Roundtable reference material

These data classes should be treated as private by default. Some are regulated
or compliance-sensitive. Even when current examples are synthetic fixtures, the
shape of the DTOs and routes is close enough to production that migration risk
is real.

## Severity Convention

- Critical: likely direct compromise or exposure in current production use.
- High: production blocker, direct exposure if used with live data, or serious
  supply-chain risk.
- Medium: material weakness that can become exploitable when production features
  are added or when combined with other weaknesses.
- Low: hygiene, hardening, or maintainability issue with security relevance.

## Findings

### 1. High - Public tRPC seam can expose private deal data

Evidence:

- `apps/web/server/trpc/context.ts:1` defines `TrpcContext` as
  `Record<string, never>`.
- `apps/web/server/trpc/context.ts:3` returns an empty context.
- `apps/web/server/trpc/init.ts:9` exports `publicProcedure`.
- `apps/web/server/trpc/routers/deal-router.ts:62` wires the deal router.
- `apps/web/server/trpc/routers/deal-router.ts:64` exposes
  `getOperationalCenter` as a public procedure.
- `apps/web/app/api/trpc/[trpc]/route.ts:14` exports both `GET` and `POST`.
- `apps/web/server/deals/operational-center-dto.ts:178` defines investor
  operation fields including `investorName`, `investorEmail`,
  `commitmentAmount`, KYC/KYB, signature, and wire state.

Rationale:

tRPC is a production-shaped API boundary. Even though the current data source is
a fixture, the exposed procedure returns data that has the structure and
sensitivity of real private-market deal operations. Direct HTTP clients can call
the API without a session, tenant, role, or deal-access check. The current
comment in `deal-router.ts` is useful documentation, but comments do not prevent
accidental production attachment.

Impact:

If live data is connected to this procedure, any unauthenticated requester could
retrieve deal operations data.

Recommended remediation:

- Disable `/api/trpc` outside local/demo environments until auth exists, or
  gate the demo route behind an explicit fixture/demo flag.
- Make `createTrpcContext` request-aware.
- Resolve session, actor, tenant/org, roles, and request ID in context.
- Add `protectedProcedure`.
- Enforce per-deal authorization before service calls.
- Return permission-filtered DTOs.
- Consider removing `GET` for private reads unless deliberately required.
- Set private/no-store cache behavior for private API responses.
- Add HTTP tests for unauthenticated, unauthorized, and authorized callers.

### 2. High - RSC route loaders bypass any future tRPC-only auth

Evidence:

- `apps/web/app/deals/[dealId]/overview/page.tsx:11` calls
  `getDealOperationsData`.
- `apps/web/app/deals/[dealId]/commitments/page.tsx:12` calls
  `getDealOperationsData`.
- `apps/web/app/deals/[dealId]/documents/page.tsx:11` calls
  `getDealOperationsData`.
- `apps/web/app/deals/[dealId]/data.ts:34` calls
  `getDealOperationalCenter`.
- `docs/60-planning/backend-migration-readiness.md:100` states that no live
  private data may be reachable until auth, request context, protected
  procedures, per-deal authorization, permission filtering, private caching, and
  output validation are resolved.

Rationale:

In this app, server components and route loaders call the service layer
directly. That is a good architecture for avoiding unnecessary network hops, but
it means tRPC auth would not protect the app-rendered pages. The security
boundary must live at the service/read-model layer and be used by both RSC and
tRPC paths.

Impact:

If auth is implemented only in tRPC, private data can still be rendered by route
loaders.

Recommended remediation:

- Introduce a request-aware app service boundary.
- Require actor, tenant/org, role, and deal-access inputs for all live-data
  service reads.
- Make `getDealOperationsData` either fixture-only or request-aware.
- Add route tests for unauthenticated and unauthorized requests.
- Keep the hard rule from `backend-migration-readiness.md` as a blocking
  migration gate.

### 3. High - Broad operational DTO crosses client boundaries

Evidence:

- `apps/web/app/deals/[dealId]/layout.tsx:63` passes full route data into the
  operational rail.
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:1` is a client
  component.
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:13` accepts
  `DealOperationsRouteData`.
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:182`
  builds inspector props by investor.
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:225`
  includes investor contact data.
- `docs/60-planning/backend-migration-readiness.md:86` already calls out that
  the full operator DTO crosses a client boundary.

Rationale:

Client component props are not private. If a full DTO is passed to a client
component, the browser can receive fields that the UI island does not need. This
is especially risky for rails, tabs, drawers, and inspectors, because those UI
patterns commonly preload more data than the visible area shows.

Impact:

With live data, investor emails, document metadata, blocker details, and
activity state may be serialized to the browser for users who only need
aggregate status.

Recommended remediation:

- Split broad service DTOs from client view models.
- Build minimal rail props server-side.
- Build per-route and per-role read models.
- Avoid precomputing all investor inspector details unless the current viewer is
  allowed to receive them.
- Add serialization tests that assert protected/internal fields are absent from
  unauthorized client payloads.

### 4. High - Vulnerable Next.js version is locked

Evidence:

- `apps/web/package.json:13` declares `next` as `^16.2.5`.
- `apps/storybook/package.json:10` declares `next` as `^16.2.5`.
- `pnpm-lock.yaml:2703` locks `next@16.2.5`.
- `pnpm audit --audit-level low` reports a high-severity Next.js advisory,
  patched in `next >=16.2.6`.

Rationale:

The audit did not find middleware/proxy files, which lowers exploitability for
the specific bypass class in the current tree. However, the vulnerable package
is still in the web app and Storybook dependency graph. Security posture should
not rely on "we do not currently use the affected feature" when a patched
version exists.

Recommended remediation:

- Upgrade Next.js to `>=16.2.6` in both Next consumers.
- Refresh `pnpm-lock.yaml`.
- Run build, typecheck, e2e, Storybook build, and `pnpm audit`.

### 5. Medium - Transitive dependency advisories remain

Evidence from `pnpm audit --audit-level low`:

- `postcss@8.4.31` is pulled transitively by Next and is vulnerable to a
  moderate advisory, patched in `postcss >=8.5.10`.
- `ws@8.20.0` is pulled by Storybook and is patched in `ws@8.20.1`.
- `brace-expansion@5.0.5` is pulled through Storybook/docgen tooling and is
  patched in `brace-expansion@5.0.6`.

Rationale:

Some affected packages are dev-tooling-only, which lowers production runtime
risk. They still matter because developer tooling runs locally with repo access,
can parse untrusted project files, and can be exposed during local Storybook
development.

Recommended remediation:

- Add targeted `pnpm.overrides` where upstreams lag.
- Refresh Storybook-related packages.
- Re-run `pnpm audit --audit-level low`.
- Verify `pnpm --filter @repo/storybook storybook:build`.

### 6. Medium - Display metadata is not access control

Evidence:

- `apps/web/server/deals/operational-center-dto.ts:258` defines document group
  visibility values: `internal`, `investor_visible`, and `protected`.
- `apps/web/server/deals/operational-center-dto.ts:97` defines deal access
  metadata such as sharing mode and pending request count.
- `docs/20-specs/northstar-operational-center-dto-spec.md:483` says access mode
  is contextual metadata, not permissions.
- `docs/20-specs/northstar-operational-center-dto-spec.md:695` says ACL
  enforcement, watermarking, and NDA controls are not implemented.

Rationale:

Labels such as `protected` and `internal` are useful for UI presentation, but
they are not security controls. In live systems, access control needs durable
grants, policies, subjects, resources, and enforcement at every retrieval path.

Recommended remediation:

- Model document ACLs separately from display labels.
- Enforce permissions server-side before document metadata or links are
  returned.
- Generate short-lived signed URLs server-side.
- Audit previews and downloads.
- Add policy snapshots for sharing/access flows.

### 7. Medium - Activity timeline is not an audit log

Evidence:

- `apps/web/server/deals/operational-center-dto.ts:265` defines activity events
  with display-oriented fields such as `actorLabel`, `summary`, timestamps, and
  related IDs.
- `docs/60-planning/backend-migration-readiness.md:541` calls for richer audit
  records including actor ID, source system, request ID, payload, and append-only
  semantics.
- Roundtable context docs describe KYC, signing, wire matching, and document
  activity as audit-sensitive workflows.

Rationale:

Display activity is not an audit log. Audit logs need identity, source,
immutability, request correlation, policy context, and before/after state. The
current model is fine for a dashboard fixture, but it should not be promoted to
an audit system.

Recommended remediation:

- Define append-only audit records separately from display activity.
- Include actor ID, impersonator/delegate ID, source system, request ID,
  policy snapshot, before/after state, and provider references.
- Treat audit persistence as a backend guarantee.

### 8. Medium - Output validation is defined but not enforced at the public boundary

Evidence:

- `apps/web/server/deals/operational-center-dto.ts:717` defines
  `DealOperationalCenterSchema`.
- `apps/web/server/deals/operational-center-dto.ts:798` defines output schema.
- `apps/web/server/trpc/routers/deal-router.ts:64` uses `.input(...)` and
  `.query(...)`, but no `.output(...)`.
- `apps/web/server/deals/operational-center-service.ts:135` returns the custom
  `validateDealOperationalCenter(dto)` result.

Rationale:

The custom validator checks important invariants, but it is not the same as a
strict output contract. Future mapper or database changes could accidentally add
or alter fields. Transport boundaries should enforce explicit output schemas.

Recommended remediation:

- Parse service output through `DealOperationalCenterSchema`.
- Add `.output(GetDealOperationalCenterOutputSchema)` to tRPC procedures.
- Add negative tests for invalid enum values, extra fields, invalid
  discriminators, and invalid date/money values.

### 9. Medium - Commitment submission schemas can accept cross-step identity mismatch

Evidence:

- `packages/domain/src/commitment-flow/commitment-flow.ts:233` composes
  submittable form schemas independently.
- `packages/domain/src/commitment-flow/commitment-flow.ts:96` defines
  qualification `entityType`.
- `packages/domain/src/commitment-flow/commitment-flow.ts:201` defines KYC/KYB
  `entityType`.

Rationale:

Independent schemas can each be valid while contradicting each other at the
full-form level. For example, individual qualification with legal-entity KYB can
pass unless the full object is refined.

Recommended remediation:

- Add a top-level `.superRefine` tying qualification and KYC/KYB entity type.
- Consider a full-form discriminated union.
- Add mismatch tests.

### 10. Medium - Commitment amount is not bound to deal terms

Evidence:

- `packages/domain/src/commitment-flow/commitment-flow.ts:68` only requires a
  positive safe integer amount.
- `packages/domain/src/commitment-flow/commitment-flow.ts:233` has no deal ID
  or deal-term context.
- `docs/archive/commitment-flow.schemas.ts:379` previously modeled a deal ID
  submission boundary.

Rationale:

Amount validity is contextual. A positive amount can still violate minimum
ticket size, maximum allocation, capacity, currency, or deal lifecycle rules.

Recommended remediation:

- Validate submitted amounts server-side against deal terms.
- Include deal ID and version/policy context in the submission boundary.
- Check min/max, remaining capacity, currency, and lifecycle state.

### 11. Medium - Telemetry metadata redaction is denylist-based

Evidence:

- `apps/web/observability/telemetry-events.ts:5` allows string, number, and
  boolean metadata values.
- `apps/web/observability/telemetry-events.ts:37` blocks selected sensitive key
  patterns.
- `apps/web/observability/telemetry-events.ts:126` allows non-string values.

Rationale:

Denylist redaction is fragile. Future event authors can use a new key name, an
ID, a numeric amount, or a short string that is still sensitive. Current
production transport is no-op, but vendor wiring would turn this into an
exfiltration path.

Recommended remediation:

- Use event-specific metadata allowlists.
- Reject IDs, emails, names, document labels, descriptions, free text, and
  financial amounts by default.
- Keep route patterns sanitized, as the current implementation already does.

### 12. Medium - API errors can expose internal data-shape details

Evidence:

- `apps/web/server/trpc/routers/deal-router.ts:29` maps service errors directly
  to API output variants.
- `apps/web/server/deals/operational-center-validation.ts:327` and nearby
  validation paths can include internal object paths and reference targets.

Rationale:

Detailed validation paths are useful for server logs and test failures. They are
less appropriate for public API responses, especially once IDs and internal
graph relationships map to real entities.

Recommended remediation:

- Return coarse public error codes at the transport boundary.
- Log detailed validation errors server-side only.
- Add request IDs so public errors can be correlated with internal logs.

### 13. Medium - Security headers and CSP are absent from app config

Evidence:

- `apps/web/next.config.ts:4` only configures `transpilePackages`.
- `docs/50-research/funding-frontend-spec.md:654` expects strict CSP,
  no inline scripts, explicit frame/connect allowlists, and sanitized HTML
  exceptions.

Rationale:

Security headers are defense-in-depth. They become more important when the app
starts rendering investor-provided or provider-provided content, embedding
signature/document providers, or operating with production auth cookies.

Recommended remediation:

- Add `poweredByHeader: false`.
- Add CSP at Next or deployment edge.
- Add `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS where deployment supports HTTPS.
- Keep `frame-src` and `connect-src` allowlists explicit.

### 14. Medium - Agent prompts execute mutable remote CLIs

Evidence:

- `docs/40-ralph-loops/ralph-loop-ui-prompt.md:121` runs
  `pnpm dlx shadcn@latest`.
- `docs/40-ralph-loops/ralph-loop-ui-prompt.md:166` runs
  `pnpm dlx shadcn@latest add ...`.
- `docs/40-ralph-loops/ralph-loop-ui-prompt.md:174` repeats `@latest`.

Rationale:

Agent runbooks are executable operational instructions. `pnpm dlx ...@latest`
fetches mutable remote code and executes it with workspace access. That maps to
OWASP Agentic Skills Top 10 risks AST02 supply-chain compromise and AST07 update
drift.

Recommended remediation:

- Pin exact CLI versions.
- Prefer lockfile-managed dev dependencies over `dlx` for repeatable tooling.
- Require explicit approval for network install/update commands.
- Add a policy forbidding `@latest` in agent runbooks.

### 15. Medium - Repo-local skills lack permission manifests and governance

Evidence:

- `.agents/skills/baseline-review/SKILL.md:1` declares only name/description
  style metadata.
- `.agents/skills/simplify-component/SKILL.md:1` does the same.
- `.agents/skills/simplify-component/SKILL.md:67` can drive edits and
  verification commands.

Rationale:

Local agent skills are behavior-layer code. They should have declared risk,
allowed paths, denied paths, shell/network policy, ownership, and review
metadata. Without that, future users cannot reason about blast radius.

Recommended remediation:

- Add a signed skill inventory or manifest.
- Include `risk_tier`, `content_hash`, allowed path scopes, denied sensitive
  paths, network policy, shell policy, and review status.
- Require review for `.agents/**` changes.
- Map this to OWASP AST03, AST04, AST08, and AST09.

### 16. Medium - Persistent PLAN/STATUS files can act as writable agent memory

Evidence:

- Several prompts instruct agents to maintain `PLAN.md` and `STATUS.md`.
- `PLAN.md` currently exists as writable project memory.

Rationale:

Persistent status files are useful coordination tools, but they can become
instruction-persistence channels. A compromised or careless agent could plant
future instructions that another agent later treats as authoritative.

Recommended remediation:

- Add a root `AGENTS.md` or equivalent policy stating that `PLAN.md` and
  `STATUS.md` are non-authoritative status only.
- Require current user/task confirmation before executing commands found in
  these files.
- Treat docs and research content as data unless explicitly promoted by the
  current user.

### 17. Low/Medium - Tracked docs contain sensitive-looking mock data

Evidence:

- `docs/50-research/funding-mockup-v3.html:787` includes full names.
- `docs/50-research/funding-mockup-v3.html:788` includes dates of birth.
- `docs/50-research/funding-mockup-v3.html:800` includes IBAN-like prefixes.
- `docs/50-research/funding-mockup-v3.html:886` includes a SIREN-like
  identifier.

Rationale:

The audit did not verify whether these are real. Even if synthetic, realistic
DOBs, IBAN-like values, and registry numbers can create compliance and review
noise. They also train future contributors to accept realistic PII in tracked
docs.

Recommended remediation:

- Scrub DOBs, IBAN-like values, and registry numbers.
- Use obviously synthetic placeholders.
- If `.local` is expected to hold private reference material, add it to a
  committed `.gitignore`, not only local git exclude.

### 18. Low - Domain fixtures are exported through runtime package surfaces

Evidence:

- `packages/domain/src/reconciliation/index.ts:1` exports fixture values/types.
- `packages/domain/src/index.ts:158` re-exports them from the root package.
- `packages/domain/src/reconciliation/fixtures.ts:59` includes payer/subscriber
  names, wire references, and amounts.

Rationale:

Fixtures are useful for tests and stories, but root runtime exports blur the
line between production domain API and test data. That increases the chance of
fixtures leaking into runtime paths.

Recommended remediation:

- Move fixtures to test/story-only modules.
- Or expose them only through an explicit `test-support` subpath.
- Validate fixture IDs through the same schemas as production data.

### 19. Low - Invalid service input can throw before typed errors

Evidence:

- `apps/web/server/deals/operational-center-service.ts:58` maps parse errors by
  calling `input.dealId.trim()`.

Rationale:

The current caller path passes typed input. Future runtime callers could pass
malformed data, causing a `TypeError` instead of a typed `UnsupportedDeal`
result. This is a robustness issue more than an immediate exploit.

Recommended remediation:

- Accept `unknown` at trust boundaries.
- Safely extract a display-safe candidate value.
- Never dereference unvalidated fields in error paths.

### 20. Low - CI gates are absent

Evidence:

- No tracked `.github` CI files were found.
- Root scripts exist in `package.json`.
- Turborepo task wiring exists in `turbo.json`.

Rationale:

Security posture depends on gates being run consistently. Local scripts are not
enough unless CI enforces them.

Recommended remediation:

- Add CI with `corepack`.
- Run `pnpm install --frozen-lockfile`.
- Run audit, lint, typecheck, tests, Storybook build, and e2e where practical.
- Add Dependabot or Renovate for security updates.

### 21. Low - pnpm peer resolution is permissive

Evidence:

- `.npmrc:1` enables `auto-install-peers=true`.
- `.npmrc:6` sets `strict-peer-dependencies=false`.

Rationale:

Permissive peer resolution can mask dependency graph problems. It is not an
immediate vulnerability by itself, but it weakens reproducibility and can hide
unexpected package introductions.

Recommended remediation:

- Prefer `strict-peer-dependencies=true` and `auto-install-peers=false` in CI.
- Explicitly declare required peers per package.

## Verification Results

### Secret and risky API scan

No obvious committed `.env` files or hard-coded vendor/API secrets were found in
the repository scan. No active app-level `eval`, `new Function`, SQL string
construction, or `dangerouslySetInnerHTML` usage was found in the audited paths.

### `pnpm audit --audit-level low`

Failed with 4 vulnerabilities:

- 1 high
- 3 moderate

The high finding was Next.js. Moderate findings covered PostCSS, `ws`, and
`brace-expansion`.

### `pnpm audit --prod --audit-level low`

Failed with 2 vulnerabilities:

- high Next.js advisory
- moderate PostCSS advisory

### `pnpm lint`

Failed. Biome reported import ordering, type-only import, format, and unused
import issues, including:

- `apps/web/server/deals/operational-center-dto.ts`
- `apps/web/server/deals/operational-center-validation.ts`
- `packages/kit/src/commitment/commitment-readiness.model.ts`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts`
- `packages/kit/src/status/document-status.ts`

### `pnpm test`

Failed because `@repo/kit` build failed during the Turborepo test graph.

### `pnpm --filter @repo/web typecheck`

Failed with type drift around:

- Removed/renamed `activeRowId` and `drawerOpenRowId` properties.
- DTO/document type mismatch around `blocksClosing` and `required`.
- `DocumentEvidenceStatus.tone` type mismatch.
- Type-only import requirements in `operational-center-dto.ts`.
- Money DTO currency widening from `EUR` to `string`.

### `pnpm --filter @repo/kit build`

Failed with similar type drift:

- `activeRowId` and `drawerOpenRowId` no longer exist on the table state type.
- `DocumentEvidenceStatus` no longer has `tone`, while fixtures and rendering
  still use it.

### `pnpm --filter @repo/design-tokens check`

Passed.

## Remediation Sequence

### Phase 0 - Stop the bleeding

1. Patch dependency advisories.
2. Repair lint, typecheck, and test failures.
3. Add a CI job that runs frozen install, audit, lint, typecheck, and tests.

Rationale:

Security fixes are difficult to trust while the baseline is red. The first goal
is a working verification floor.

### Phase 1 - Prevent accidental production exposure

1. Disable or explicitly gate the public tRPC route outside local/demo.
2. Add a hard fixture/demo flag for `deal.getOperationalCenter`.
3. Add failing tests that prove unauthenticated access cannot receive private
   data once live data is enabled.

Rationale:

The current public API is acceptable only because the data is a fixture. That
assumption should be encoded, not remembered.

### Phase 2 - Design the real auth boundary once

1. Define request context: actor, tenant/org, roles, request ID, impersonator or
   delegate, and session assurance level.
2. Use the same security boundary for RSC route loaders and tRPC handlers.
3. Add per-deal authorization before any service returns data.

Rationale:

Securing tRPC alone leaves RSC route loaders exposed. The service/read-model
layer is the correct shared boundary.

### Phase 3 - Split read models by permission

1. Create server-side view models per route and client island.
2. Pass aggregate-only props to the operational rail.
3. Gate investor detail, document detail, and finance/reconciliation fields by
   permission.
4. Add serialization tests.

Rationale:

UI visibility is not a security boundary. The browser should never receive data
the current user is not allowed to know.

### Phase 4 - Harden documents, sharing, and audit

1. Implement document ACLs separately from display visibility.
2. Model durable invite/access grants.
3. Implement signed document URL generation server-side.
4. Create append-only audit records distinct from display activity.

Rationale:

Private-market workflows are compliance-heavy. Document access, sharing, and
auditability are core security surfaces, not later polish.

### Phase 5 - Harden agentic operations

1. Remove `@latest` from agent runbooks.
2. Add a root agent policy defining instruction hierarchy and trust boundaries.
3. Add manifests for local skills.
4. Move dependency caches outside the repo or require scanner exclusions.

Rationale:

Agent prompts and local skills are an execution layer. They need supply-chain
and permission governance just like scripts and dependencies.

## Recommended Security Acceptance Criteria

Before any live private data is attached:

- Unauthenticated route and tRPC requests cannot obtain deal data.
- Unauthorized users receive uniform not-found or forbidden responses that do
  not reveal deal existence.
- Every service read receives actor, tenant/org, role, and deal context.
- Every private response is permission-filtered.
- Client payloads omit fields outside the current user's permissions.
- tRPC procedures enforce both input and output schemas.
- Private responses use private/no-store caching.
- Security headers are configured.
- Audit events are append-only and separate from display activity.
- Dependency audit has no high or moderate production findings, or accepted
  exceptions are documented.
- CI enforces install, audit, lint, typecheck, tests, and relevant builds.
- Agent runbooks are pinned and local skills have manifests.

## Non-Findings

The audit did not find:

- Committed `.env` files.
- Obvious hard-coded vendor/API secrets in tracked source.
- Active app-level `eval`.
- Active `new Function`.
- Active SQL string construction.
- App-level `dangerouslySetInnerHTML` in audited source paths.

These non-findings do not prove absence across all future changes. They only
describe the current reviewed tree.

## Final Assessment

The codebase has strong architectural discipline for a frontend case study:
clear package boundaries, explicit DTOs, Zod usage, server-only guards in key
places, design-token validation, and good documentation of current limitations.

The main security issue is not a hidden bug. It is an unfinished boundary. The
repo has production-shaped surfaces for private-market operations before the
production security controls exist. That is manageable if treated as a hard
migration gate. It becomes severe only if live private data is connected before
auth, authorization, least-privilege DTOs, output validation, document ACLs, and
audit provenance are implemented.

