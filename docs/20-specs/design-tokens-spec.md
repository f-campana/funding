# Design Tokens Spec

**Status:** Implemented v1.0

This document specifies the first real implementation of
`packages/design-tokens`.

The goal is a small, auditable token pipeline that is fully compatible with
shadcn/ui and Tailwind CSS v4, while preserving a migration path to full DTCG
and Style Dictionary later.

## 1. Source of Truth

Use a DTCG-adjacent JSON source file:

```text
packages/design-tokens/src/tokens.source.json
```

The source file uses `$value` and `$type` per token, but does not need to
implement the full DTCG reference-resolution specification in v1.

Do not hand-edit generated CSS or generated TypeScript output.

Generated files:

```text
packages/design-tokens/css/tokens.css
packages/design-tokens/src/tokens.generated.ts
```

Both generated files must be committed. The UI and Tailwind packages consume
these files directly, so the repo should work after install without requiring a
manual generation step first.

## 2. Compatibility Targets

The generated CSS must be compatible with:

- shadcn/ui Tailwind v4 theming
- shadcn/ui copied components using semantic classes such as `bg-background`,
  `text-foreground`, `border-border`, `ring-ring`, `bg-primary`,
  `text-primary-foreground`, `bg-card`, and `text-muted-foreground`
- shadcn chart tokens using `var(--chart-1)` through `var(--chart-5)`
- shadcn sidebar tokens
- Tailwind CSS v4 `@theme inline`
- runtime theming through CSS custom properties

Relevant references:

- <https://ui.shadcn.com/docs/theming>
- <https://ui.shadcn.com/docs/tailwind-v4>
- <https://ui.shadcn.com/docs/components-json>
- <https://tailwindcss.com/docs/theme>

## 3. Required CSS Variable Contract

The generated CSS must define the canonical shadcn variables below for both
light and dark themes.

Color variables:

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--chart-1
--chart-2
--chart-3
--chart-4
--chart-5
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

Base variables:

```css
--radius
--font-ui
--font-display
--font-code
--space-unit
--space-control
--elevation-card
--elevation-popover
--duration-fast
--duration-normal
--ease-standard
```

Bootstrap compatibility aliases:

```css
--color-bg
--color-text
--color-surface
--color-accent
--color-accent-foreground
--radius-control
```

These aliases preserve compatibility for older bootstrap-era code. New UI work
should use standard shadcn classes and radius utilities.

## 4. Theme Selectors

Light theme output:

```css
:root,
[data-theme="light"] {
  /* light variables */
}
```

Dark theme output:

```css
.dark,
[data-theme="dark"] {
  /* dark variables */
}
```

Why both dark selectors:

- shadcn/ui defaults to `.dark`
- this repo's frontend architecture prefers `[data-theme="dark"]`

Supporting both avoids compatibility friction.

## 5. Source JSON Shape

Use this shape:

```json
{
  "$schemaVersion": "funding.design-tokens.v1",
  "meta": {
    "name": "Funding Tokens",
    "description": "Light and dark shadcn-compatible tokens for the funding workspace."
  },
  "themes": {
    "light": {
      "color": {
        "background": { "$type": "color", "$value": "oklch(...)" }
      }
    },
    "dark": {
      "color": {
        "background": { "$type": "color", "$value": "oklch(...)" }
      }
    }
  },
  "radius": {
    "base": { "$type": "dimension", "$value": "0.5rem" }
  },
  "font": {
    "ui": { "$type": "fontFamily", "$value": "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif" },
    "display": { "$type": "fontFamily", "$value": "var(--font-fraunces), Georgia, serif" },
    "code": { "$type": "fontFamily", "$value": "var(--font-geist-mono), 'Azeret Mono', ui-monospace, SFMono-Regular, monospace" }
  },
  "space": {
    "unit": { "$type": "dimension", "$value": "0.25rem" },
    "control": { "$type": "dimension", "$value": "0.75rem" }
  },
  "shadow": {
    "card": { "$type": "shadow", "$value": "0 1px 2px oklch(0% 0 0 / 0.04)" },
    "popover": { "$type": "shadow", "$value": "0 18px 50px oklch(0% 0 0 / 0.14)" }
  },
  "motion": {
    "duration-fast": { "$type": "duration", "$value": "120ms" },
    "duration-normal": { "$type": "duration", "$value": "180ms" },
    "ease-standard": { "$type": "cubicBezier", "$value": "cubic-bezier(0.2, 0, 0, 1)" }
  }
}
```

Token keys under `themes.*.color` should match the CSS variable names without
the leading `--`. For example, `"primary-foreground"` generates
`--primary-foreground`.

## 6. Initial Token Values

Use these values for v1 unless validation requires a small contrast adjustment.

The design direction is light-first, modern private-markets fintech:
warm paper, crisp cards, deep forest primary, restrained amber accent, clear
financial chart colors, and a dense but premium interface register.

### Light Theme

```json
{
  "background": "oklch(0.955 0.018 85)",
  "foreground": "oklch(0.205 0.025 155)",
  "card": "oklch(0.988 0.008 85)",
  "card-foreground": "oklch(0.205 0.025 155)",
  "popover": "oklch(0.995 0.006 85)",
  "popover-foreground": "oklch(0.205 0.025 155)",
  "primary": "oklch(0.36 0.095 158)",
  "primary-foreground": "oklch(0.985 0.01 85)",
  "secondary": "oklch(0.91 0.018 85)",
  "secondary-foreground": "oklch(0.245 0.025 155)",
  "muted": "oklch(0.905 0.014 85)",
  "muted-foreground": "oklch(0.43 0.024 155)",
  "accent": "oklch(0.82 0.075 82)",
  "accent-foreground": "oklch(0.215 0.025 155)",
  "destructive": "oklch(0.58 0.19 25)",
  "destructive-foreground": "oklch(0.985 0.01 85)",
  "border": "oklch(0.84 0.018 85)",
  "input": "oklch(0.84 0.018 85)",
  "ring": "oklch(0.43 0.095 158)",
  "chart-1": "oklch(0.43 0.095 158)",
  "chart-2": "oklch(0.68 0.11 76)",
  "chart-3": "oklch(0.56 0.1 250)",
  "chart-4": "oklch(0.62 0.12 190)",
  "chart-5": "oklch(0.58 0.14 28)",
  "sidebar": "oklch(0.925 0.016 85)",
  "sidebar-foreground": "oklch(0.205 0.025 155)",
  "sidebar-primary": "oklch(0.36 0.095 158)",
  "sidebar-primary-foreground": "oklch(0.985 0.01 85)",
  "sidebar-accent": "oklch(0.88 0.02 85)",
  "sidebar-accent-foreground": "oklch(0.205 0.025 155)",
  "sidebar-border": "oklch(0.82 0.018 85)",
  "sidebar-ring": "oklch(0.43 0.095 158)"
}
```

### Dark Theme

```json
{
  "background": "oklch(0.18 0.022 155)",
  "foreground": "oklch(0.94 0.012 85)",
  "card": "oklch(0.225 0.025 155)",
  "card-foreground": "oklch(0.94 0.012 85)",
  "popover": "oklch(0.215 0.024 155)",
  "popover-foreground": "oklch(0.94 0.012 85)",
  "primary": "oklch(0.72 0.1 155)",
  "primary-foreground": "oklch(0.145 0.02 155)",
  "secondary": "oklch(0.275 0.025 155)",
  "secondary-foreground": "oklch(0.92 0.012 85)",
  "muted": "oklch(0.285 0.02 155)",
  "muted-foreground": "oklch(0.74 0.012 85)",
  "accent": "oklch(0.64 0.11 76)",
  "accent-foreground": "oklch(0.145 0.02 155)",
  "destructive": "oklch(0.68 0.16 25)",
  "destructive-foreground": "oklch(0.145 0.02 155)",
  "border": "oklch(0.34 0.025 155)",
  "input": "oklch(0.34 0.025 155)",
  "ring": "oklch(0.72 0.1 155)",
  "chart-1": "oklch(0.72 0.1 155)",
  "chart-2": "oklch(0.76 0.12 76)",
  "chart-3": "oklch(0.7 0.11 250)",
  "chart-4": "oklch(0.73 0.12 190)",
  "chart-5": "oklch(0.72 0.14 28)",
  "sidebar": "oklch(0.205 0.024 155)",
  "sidebar-foreground": "oklch(0.94 0.012 85)",
  "sidebar-primary": "oklch(0.72 0.1 155)",
  "sidebar-primary-foreground": "oklch(0.145 0.02 155)",
  "sidebar-accent": "oklch(0.28 0.025 155)",
  "sidebar-accent-foreground": "oklch(0.94 0.012 85)",
  "sidebar-border": "oklch(0.34 0.025 155)",
  "sidebar-ring": "oklch(0.72 0.1 155)"
}
```

`dark.destructive-foreground` intentionally uses the dark ink value rather than
the light foreground value because the contrast validator requires
`destructive / destructive-foreground >= 4.5`.

### Base Tokens

```json
{
  "radius": {
    "base": "0.5rem"
  },
  "space": {
    "unit": "0.25rem",
    "control": "0.75rem"
  },
  "font": {
    "ui": "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif",
    "display": "var(--font-fraunces), Georgia, ui-serif, serif",
    "code": "var(--font-geist-mono), 'Azeret Mono', ui-monospace, SFMono-Regular, monospace"
  },
  "shadow": {
    "card": "0 1px 2px oklch(0% 0 0 / 0.04), 0 12px 30px oklch(0% 0 0 / 0.04)",
    "popover": "0 18px 50px oklch(0% 0 0 / 0.14)"
  },
  "motion": {
    "duration-fast": "120ms",
    "duration-normal": "180ms",
    "ease-standard": "cubic-bezier(0.2, 0, 0, 1)"
  }
}
```

## 7. CSS Output Requirements

`css/tokens.css` must be generated from `src/tokens.source.json`.

Required shape:

```css
/* Generated by scripts/generate.mjs. Do not edit directly. */

:root,
[data-theme="light"] {
  --background: oklch(...);
  --foreground: oklch(...);
  /* all required variables */

  --color-bg: var(--background);
  --color-text: var(--foreground);
  --color-surface: var(--card);
  --color-accent: var(--primary);
  --color-accent-foreground: var(--primary-foreground);
  --radius-control: var(--radius);
  --elevation-card: ...;
  --elevation-popover: ...;
}

.dark,
[data-theme="dark"] {
  --background: oklch(...);
  --foreground: oklch(...);
  /* all dark color variables */

  --color-bg: var(--background);
  --color-text: var(--foreground);
  --color-surface: var(--card);
  --color-accent: var(--primary);
  --color-accent-foreground: var(--primary-foreground);
}
```

Keep all values in OKLCH where color is involved.

## 8. TypeScript Output Requirements

`src/tokens.generated.ts` must be generated from `src/tokens.source.json`.

Required exports:

```ts
export const tokens = { ... } as const
export const lightTheme = tokens.themes.light
export const darkTheme = tokens.themes.dark
export type Tokens = typeof tokens
export type ThemeName = keyof typeof tokens.themes
export type SemanticColorToken = keyof typeof tokens.themes.light.color
```

`src/index.ts` should export from `tokens.generated.ts`.

Remove `placeholderTokens`.

## 9. Tailwind Shared Styles

Update `packages/tailwind-config/shared-styles.css` to use the canonical
shadcn/Tailwind v4 mapping.

Required shape:

```css
@import "tailwindcss" source(none);
@import "@repo/design-tokens/css";

@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-ui);
  --font-serif: var(--font-display);
  --font-mono: var(--font-code);

  --spacing: var(--space-unit);

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  --shadow-card: var(--elevation-card);
  --shadow-popover: var(--elevation-popover);
}
```

Base layer should use canonical variables:

```css
@layer base {
  html {
    background: var(--background);
    color: var(--foreground);
  }

  body {
    min-height: 100vh;
  }
}
```

Do not create a Tailwind v3 config.

## 10. Validation

Create:

```text
packages/design-tokens/scripts/validate.mjs
```

The validation script must:

- read `src/tokens.source.json`
- ensure all required shadcn color tokens exist in light and dark themes
- ensure all required base tokens exist
- ensure generated `css/tokens.css` is in sync with source
- ensure generated `src/tokens.generated.ts` is in sync with source
- ensure there is no remaining `placeholderTokens` export
- validate contrast pairs in both light and dark themes

Contrast pairs:

```text
background / foreground >= 7.0
card / card-foreground >= 7.0
popover / popover-foreground >= 7.0
primary / primary-foreground >= 4.5
secondary / secondary-foreground >= 4.5
muted / muted-foreground >= 4.5
accent / accent-foreground >= 4.5
destructive / destructive-foreground >= 4.5
sidebar / sidebar-foreground >= 7.0
sidebar-primary / sidebar-primary-foreground >= 4.5
sidebar-accent / sidebar-accent-foreground >= 4.5
```

Preferred implementation: parse `oklch()` locally and convert to sRGB for WCAG
contrast calculation. A small dev dependency for color parsing is acceptable
only if the local implementation becomes too brittle. Do not add runtime
dependencies.

If a supplied token fails contrast, adjust the closest foreground token first.
Preserve the intended palette unless a contrast rule makes that impossible.

## 11. Scripts

Update `packages/design-tokens/package.json` scripts:

```json
{
  "build": "node scripts/generate.mjs",
  "check": "node scripts/validate.mjs",
  "typecheck": "tsc --noEmit -p tsconfig.json",
  "lint": "biome check ./src ./scripts",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

`pnpm --filter @repo/design-tokens check` must fail if generated artifacts are
stale.

## 12. Tests

Keep tests focused. This package is mostly generation and validation.

Required tests:

- `tokens` export exposes light and dark themes
- all shadcn semantic color tokens exist in `lightTheme.color`
- all shadcn semantic color tokens exist in `darkTheme.color`
- generated CSS contains `:root`, `[data-theme="light"]`, `.dark`, and
  `[data-theme="dark"]`
- generated CSS contains `--background`, `--foreground`, `--primary`,
  `--primary-foreground`, `--chart-1`, `--sidebar`, and `--radius`
- generated CSS preserves bootstrap aliases such as `--color-bg` and
  `--radius-control`

Do not use snapshot tests for the full generated CSS. Generated CSS snapshots
are too noisy for this loop. Test targeted invariants and use `validate.mjs`
for full generated-output sync.

## 13. Non-Goals

Do not implement:

- Style Dictionary
- native iOS or Android token outputs
- Figma Tokens integration
- remote theme fetching
- tenant theme storage
- runtime theme application code
- React components
- shadcn component installation
- `components.json`
- typography loading in Next.js
- UI or kit components
- dark-mode toggle UI

## 14. Verification

The design-token loop must run:

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test:coverage
pnpm --filter @repo/tailwind-config typecheck
pnpm turbo typecheck lint test
pnpm lint
```

If CSS generation changes `packages/tailwind-config/shared-styles.css`, verify
the root checks still pass.

## 15. Completion Criteria

The loop is complete when:

- `placeholderTokens` is removed
- `generate-placeholder.mjs` and `check-placeholder.mjs` are removed or replaced
- `tokens.source.json` exists
- `tokens.generated.ts` exists and is generated from source
- `css/tokens.css` exists and is generated from source
- CSS defines all canonical shadcn variables for light and dark themes
- CSS supports `.dark` and `[data-theme="dark"]`
- `shared-styles.css` maps canonical shadcn variables through `@theme inline`
- validation enforces required tokens, output sync, and contrast
- package tests pass
- root monorepo checks pass
