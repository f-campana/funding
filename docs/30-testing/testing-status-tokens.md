# Testing Status Tokens

**Status:** Implemented guidance  
**Created:** 2026-05-09  
**Scope:** tests and audits for the targeted status-token pass.

This guide complements
[Status Tokens Spec](../20-specs/status-tokens-spec.md).

## 1. Test Goals

The status-token pass is small but important. Tests should prove:

- all status tokens exist in light and dark themes
- all readiness aliases exist in light and dark themes
- generated CSS and TypeScript are in sync with `tokens.source.json`
- contrast is sufficient for strong status/readiness foreground pairs
- readiness aliases match their underlying status token values
- Tailwind v4 exposes utility-compatible `--color-*` mappings

## 2. Design-Token Unit Tests

Extend `packages/design-tokens/src/index.test.ts`.

Required assertions:

- `lightTheme.color` and `darkTheme.color` include every `status-*` token
- `lightTheme.color` and `darkTheme.color` include every `readiness-*` token
- generated CSS contains representative variables:
  - `--status-success`
  - `--status-attention`
  - `--status-danger`
  - `--status-info`
  - `--status-pending`
  - `--readiness-ready`
  - `--readiness-attention`
  - `--readiness-blocked`
  - `--readiness-not-started`
- readiness alias values equal their mapped status values in both themes

Do not snapshot the full generated CSS. Full snapshots make intentional token
changes noisy. Assert specific contract variables and alias relationships.

## 3. Validation Script

Extend `packages/design-tokens/scripts/validate.mjs`.

The script should fail for:

- missing status tokens
- missing readiness tokens
- stale generated output
- placeholder values if any remain
- contrast below the configured thresholds
- readiness aliases diverging from their mapped status tokens

Use the existing OKLCH contrast helpers. Do not add a new color library.

Minimum contrast checks:

```text
status-success/status-success-foreground >= 4.5
status-attention/status-attention-foreground >= 4.5
status-danger/status-danger-foreground >= 4.5
status-info/status-info-foreground >= 4.5
status-pending/status-pending-foreground >= 4.5

readiness-ready/readiness-ready-foreground >= 4.5
readiness-attention/readiness-attention-foreground >= 4.5
readiness-blocked/readiness-blocked-foreground >= 4.5
readiness-not-started/readiness-not-started-foreground >= 4.5
```

## 4. Tailwind Mapping Tests

If there is no dedicated test file for `packages/tailwind-config`, use a small
source inspection in the Ralph loop audit.

Required strings in `packages/tailwind-config/shared-styles.css`:

- `--color-status-success: var(--status-success);`
- `--color-status-attention: var(--status-attention);`
- `--color-status-danger: var(--status-danger);`
- `--color-status-info: var(--status-info);`
- `--color-status-pending: var(--status-pending);`
- `--color-readiness-ready: var(--readiness-ready);`
- `--color-readiness-attention: var(--readiness-attention);`
- `--color-readiness-blocked: var(--readiness-blocked);`
- `--color-readiness-not-started: var(--readiness-not-started);`

Include foreground, muted, and border mappings for each family.

## 5. Boundary Audits

The loop must not implement UI usage of these tokens yet. That belongs to the
closing-readiness dashboard loop.

Run:

```bash
git diff --name-only
rg "status-|readiness-" packages/core packages/domain packages/ui packages/kit apps || true
```

The `rg` command should return no matches unless a README or generated package
artifact inside the allowed token/Tailwind scope is intentionally included.

## 6. Verification Commands

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
