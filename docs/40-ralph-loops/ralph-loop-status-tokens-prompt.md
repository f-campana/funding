# Ralph Loop Prompt - Status Tokens

You are working in `/Users/fabiencampana/Documents/funding`.

Read these documents before editing:

- `docs/20-specs/status-tokens-spec.md`
- `docs/30-testing/testing-status-tokens.md`
- `docs/20-specs/design-tokens-spec.md`
- `docs/10-architecture/package-boundaries.md`
- `docs/10-architecture/monorepo-conventions.md`
- `docs/60-planning/closing-readiness-exception-dashboard-v1.md`

## Objective

Implement the targeted status-token pass for `@repo/design-tokens` and
`@repo/tailwind-config`.

The goal is to add semantic status and readiness tokens that future
closing-readiness dashboard components can use without hard-coded colors.

## Scope

Allowed files:

- `packages/design-tokens/src/tokens.source.json`
- `packages/design-tokens/scripts/generate.mjs`
- `packages/design-tokens/scripts/validate.mjs`
- `packages/design-tokens/css/tokens.css`
- `packages/design-tokens/src/tokens.generated.ts`
- `packages/design-tokens/src/index.test.ts`
- `packages/design-tokens/README.md`
- `packages/tailwind-config/shared-styles.css`
- `packages/tailwind-config/README.md`
- `PLAN.md`
- `STATUS.md`
- `pnpm-lock.yaml`, only if a command legitimately updates it

Do not edit:

- `packages/core`
- `packages/domain`
- `packages/ui`
- `packages/kit`
- `apps/web`
- `apps/storybook`

## Hard Constraints

- Preserve all canonical shadcn variables.
- Preserve Tailwind v4 CSS-first setup.
- Do not introduce `tailwind.config.*`.
- Do not introduce Style Dictionary.
- Do not implement UI components or dashboard changes.
- Do not change chart primitives.
- Do not change domain reconciliation.
- Do not add broad palette redesign.
- Do not hand-edit generated output without updating the generator/source.
- Keep light and dark themes in parity.

## Implementation Requirements

1. Add required `status-*` tokens to both light and dark themes.
2. Add required `readiness-*` aliases to both light and dark themes.
3. Update the generator so generated CSS includes status/readiness variables.
4. Update generated TypeScript so `SemanticColorToken` includes the new tokens.
5. Update validation so missing tokens, stale generated output, insufficient
   contrast, and readiness alias drift fail.
6. Update `packages/tailwind-config/shared-styles.css` with `@theme inline`
   mappings for the new tokens.
7. Update tests for the generated exports and CSS contract.
8. Update package README content if needed so the new token families are
   discoverable.

Use the exact token contract and recommended values from
`docs/20-specs/status-tokens-spec.md`, unless contrast validation requires a
small adjustment. If you adjust a value, record the reason in `STATUS.md`.

## Milestones

Maintain `PLAN.md` and `STATUS.md`.

Suggested milestones:

1. Read docs and record the plan.
2. Add source tokens and generator support.
3. Add validation and tests.
4. Add Tailwind mappings.
5. Regenerate token artifacts.
6. Run verification and audits.
7. Record completion status and any deviations.

Do not proceed to the next milestone while the current milestone has unresolved
type, lint, test, or validation failures unless the failure is an environment
blocker. If blocked, record it clearly in `STATUS.md`.

## Verification

Run:

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test:coverage
pnpm --filter @repo/tailwind-config typecheck
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run boundary audits:

```bash
git diff --name-only
rg "status-|readiness-" packages/core packages/domain packages/ui packages/kit apps || true
rg "tailwind.config" . || true
```

Expected audit result:

- only allowed token/Tailwind files plus `PLAN.md` and `STATUS.md` changed
- no status/readiness implementation usage appears in core/domain/ui/kit/apps
- no Tailwind v3 config appears

## Stop Condition

Stop after verification and audit. Report:

- changed files
- verification results
- any contrast value deviations
- audit result
- whether the goal is complete
