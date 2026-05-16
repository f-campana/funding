# @repo/tailwind-config

Shared Tailwind CSS v4 configuration for the funding workspace.

This package imports generated design-token CSS from `@repo/design-tokens` and
maps canonical shadcn variables into Tailwind v4 `@theme inline` aliases. It
contains no React components and no product code.

## Export

```css
@import "@repo/tailwind-config/shared-styles.css";
```

The stylesheet defines:

- Tailwind v4 import and source paths
- `.dark` and `[data-theme="dark"]` custom variant support
- canonical shadcn color mappings such as `bg-background`, `text-foreground`,
  `border-border`, and `ring-ring`
- semantic status mappings such as `bg-status-success`,
  `text-status-danger-foreground`, and `border-status-attention-border`
- closing-readiness aliases such as `bg-readiness-ready-muted`,
  `text-readiness-blocked`, and `border-readiness-not-started-border`
- font, spacing, radius, and shadow token aliases
- base `html`/`body` defaults

## Dependency Boundary

May import:

- `@repo/design-tokens/css`
- `tailwindcss`

Must not define:

- React components
- product components
- app routes
- domain logic

## Commands

```bash
pnpm --filter @repo/tailwind-config typecheck
```

See [../../docs/20-specs/design-tokens-spec.md](../../docs/20-specs/design-tokens-spec.md) and
[../../docs/10-architecture/package-boundaries.md](../../docs/10-architecture/package-boundaries.md).
