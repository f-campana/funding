# Status Tokens Spec

**Status:** Implemented v1  
**Created:** 2026-05-09  
**Scope:** targeted semantic status tokens for closing-readiness and exception
dashboard work.

This document specifies a narrow design-token pass. It does not redesign the
palette. It adds a small semantic layer so future dashboard components can stop
overloading green for success, progress, current state, completion, and generic
category color.

## 1. Why This Exists

The current token system is shadcn-compatible and works well for generic UI.
The next product surface needs clearer operational semantics:

- ready / healthy
- needs attention
- blocked / critical
- neutral informational work
- pending / not started / unavailable

These meanings must exist as reusable tokens before the closing-readiness
dashboard pass. Otherwise the dashboard loop will hard-code colors or continue
using `primary`, `destructive`, and chart colors in inconsistent ways.

## 2. Non-Goals

Do not:

- redesign the full light or dark palette
- rename or remove canonical shadcn variables
- change component implementation in `@repo/ui`, `@repo/kit`, or `apps/web`
- add new chart components
- implement closing-readiness UI
- implement domain readiness logic
- add a full Style Dictionary pipeline

This is a token infrastructure pass only.

## 3. Package Scope

Allowed implementation scope:

```text
packages/design-tokens/src/tokens.source.json
packages/design-tokens/scripts/generate.mjs
packages/design-tokens/scripts/validate.mjs
packages/design-tokens/css/tokens.css
packages/design-tokens/src/tokens.generated.ts
packages/design-tokens/src/index.test.ts
packages/design-tokens/README.md
packages/tailwind-config/shared-styles.css
packages/tailwind-config/README.md
PLAN.md
STATUS.md
pnpm-lock.yaml, only if tooling requires it
```

Do not edit `packages/core`, `packages/domain`, `packages/ui`, `packages/kit`,
`apps/web`, or `apps/storybook`.

## 4. Required Status Tokens

Add these color tokens under both `themes.light.color` and
`themes.dark.color` in `tokens.source.json`.

Each status has four roles:

- base: strong semantic color for badges, icons, chart marks, and emphasis
- foreground: accessible text/icon color on the base color
- muted: quiet background color for panels, empty states, and soft badges
- border: border/accent color for soft surfaces

Required token names:

```text
status-success
status-success-foreground
status-success-muted
status-success-border

status-attention
status-attention-foreground
status-attention-muted
status-attention-border

status-danger
status-danger-foreground
status-danger-muted
status-danger-border

status-info
status-info-foreground
status-info-muted
status-info-border

status-pending
status-pending-foreground
status-pending-muted
status-pending-border
```

Semantic meanings:

| Token | Meaning |
|---|---|
| `status-success` | completed, matched, ready, healthy |
| `status-attention` | due soon, work required, non-critical exception |
| `status-danger` | blocked, overdue, critical exception |
| `status-info` | neutral operational context, manual review, system note |
| `status-pending` | not started, unavailable, inactive, waiting |

## 5. Required Readiness Aliases

Add readiness aliases under both light and dark themes. These are intentionally
separate from the generic status tokens so product components can use
readiness-specific class names without embedding status interpretation.

```text
readiness-ready
readiness-ready-foreground
readiness-ready-muted
readiness-ready-border

readiness-attention
readiness-attention-foreground
readiness-attention-muted
readiness-attention-border

readiness-blocked
readiness-blocked-foreground
readiness-blocked-muted
readiness-blocked-border

readiness-not-started
readiness-not-started-foreground
readiness-not-started-muted
readiness-not-started-border
```

Alias mapping:

| Readiness token | Should match |
|---|---|
| `readiness-ready*` | `status-success*` |
| `readiness-attention*` | `status-attention*` |
| `readiness-blocked*` | `status-danger*` |
| `readiness-not-started*` | `status-pending*` |

The generator does not need full DTCG reference resolution. Duplicating values
is acceptable in v1, but tests should ensure the alias values match their status
counterparts.

## 6. Recommended Values

Use these values unless validation requires a small contrast correction.

### Light Theme

```json
{
  "status-success": "oklch(0.36 0.095 158)",
  "status-success-foreground": "oklch(0.985 0.01 85)",
  "status-success-muted": "oklch(0.925 0.035 155)",
  "status-success-border": "oklch(0.68 0.065 155)",
  "status-attention": "oklch(0.68 0.11 76)",
  "status-attention-foreground": "oklch(0.205 0.025 155)",
  "status-attention-muted": "oklch(0.93 0.045 82)",
  "status-attention-border": "oklch(0.77 0.075 82)",
  "status-danger": "oklch(0.58 0.19 25)",
  "status-danger-foreground": "oklch(0.985 0.01 85)",
  "status-danger-muted": "oklch(0.94 0.035 25)",
  "status-danger-border": "oklch(0.72 0.11 25)",
  "status-info": "oklch(0.55 0.1 250)",
  "status-info-foreground": "oklch(0.985 0.01 85)",
  "status-info-muted": "oklch(0.92 0.025 250)",
  "status-info-border": "oklch(0.72 0.055 250)",
  "status-pending": "oklch(0.72 0.012 85)",
  "status-pending-foreground": "oklch(0.205 0.025 155)",
  "status-pending-muted": "oklch(0.91 0.014 85)",
  "status-pending-border": "oklch(0.78 0.014 85)"
}
```

### Dark Theme

```json
{
  "status-success": "oklch(0.72 0.1 155)",
  "status-success-foreground": "oklch(0.145 0.02 155)",
  "status-success-muted": "oklch(0.29 0.04 155)",
  "status-success-border": "oklch(0.5 0.075 155)",
  "status-attention": "oklch(0.76 0.12 76)",
  "status-attention-foreground": "oklch(0.145 0.02 155)",
  "status-attention-muted": "oklch(0.32 0.04 76)",
  "status-attention-border": "oklch(0.55 0.08 76)",
  "status-danger": "oklch(0.68 0.16 25)",
  "status-danger-foreground": "oklch(0.145 0.02 155)",
  "status-danger-muted": "oklch(0.32 0.05 25)",
  "status-danger-border": "oklch(0.53 0.1 25)",
  "status-info": "oklch(0.7 0.11 250)",
  "status-info-foreground": "oklch(0.145 0.02 155)",
  "status-info-muted": "oklch(0.32 0.04 250)",
  "status-info-border": "oklch(0.55 0.075 250)",
  "status-pending": "oklch(0.58 0.018 85)",
  "status-pending-foreground": "oklch(0.145 0.02 155)",
  "status-pending-muted": "oklch(0.27 0.016 85)",
  "status-pending-border": "oklch(0.42 0.018 85)"
}
```

## 7. Generator Requirements

The generator currently emits only canonical shadcn color tokens from an
explicit token list. Update the generator so status and readiness tokens are
also emitted into:

```text
packages/design-tokens/css/tokens.css
packages/design-tokens/src/tokens.generated.ts
```

The generated CSS should contain `--status-*` and `--readiness-*` variables in
both light and dark blocks.

The generated TypeScript export should expose these tokens through
`lightTheme.color`, `darkTheme.color`, and `SemanticColorToken`.

## 8. Tailwind v4 Mapping

Update `packages/tailwind-config/shared-styles.css` with `@theme inline`
mappings for each token.

Examples:

```css
--color-status-success: var(--status-success);
--color-status-success-foreground: var(--status-success-foreground);
--color-status-success-muted: var(--status-success-muted);
--color-status-success-border: var(--status-success-border);

--color-readiness-ready: var(--readiness-ready);
--color-readiness-ready-foreground: var(--readiness-ready-foreground);
--color-readiness-ready-muted: var(--readiness-ready-muted);
--color-readiness-ready-border: var(--readiness-ready-border);
```

After this pass, future components may use classes such as:

```text
bg-status-success
text-status-success-foreground
border-status-attention-border
bg-readiness-blocked-muted
text-readiness-blocked
```

## 9. Validation Requirements

Update validation so `pnpm --filter @repo/design-tokens check` fails when:

- any required status token is missing from either theme
- any required readiness token is missing from either theme
- generated CSS or TypeScript is stale
- strong status foreground contrast is below 4.5:1
- strong readiness foreground contrast is below 4.5:1
- readiness alias values diverge from their corresponding status values

## 10. Verification

The loop must pass:

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

Also run boundary audits:

```bash
git diff --name-only
rg "status-|readiness-" packages/core packages/domain packages/ui packages/kit apps || true
rg "tailwind.config" . || true
```

The first `rg` command should return no implementation changes outside token
and Tailwind files. The second should confirm the repo still does not introduce
a Tailwind v3 config.
