# Ralph Loop Prompt: Design Tokens Package

You are Codex running inside `/Users/fabiencampana/Documents/funding`.

Your task is to implement the first real `packages/design-tokens` pipeline and
update Tailwind's shared styles to consume it.

Read these documents before writing files:

1. `docs/20-specs/design-tokens-spec.md`
2. `docs/50-research/fodmapp-ui-patterns.md`
3. `docs/10-architecture/package-boundaries.md`
4. `docs/10-architecture/monorepo-conventions.md`
5. `docs/40-ralph-loops/repo-bootstrap-spec.md`
6. `docs/50-research/funding.md`
7. `docs/50-research/funding-frontend-spec.md`

Treat `docs/20-specs/design-tokens-spec.md` as the source of truth for this loop.

## Objective

Replace the bootstrap placeholder token package with a small, generated,
shadcn-compatible design-token pipeline.

The package must provide:

- DTCG-adjacent JSON source tokens
- generated canonical shadcn CSS variables
- generated typed TypeScript token exports
- light and dark theme support
- contrast validation for semantic pairs
- stale generated-output validation
- Tailwind v4 `@theme inline` mapping through `packages/tailwind-config`

## Non-Goals

Do not implement:

- Style Dictionary
- Figma Tokens integration
- native token outputs
- React components
- shadcn components
- `components.json`
- UI or kit components
- Next.js font loading
- runtime tenant theme application
- dark-mode toggle UI
- chart components
- Storybook stories

## Required Package Boundary

`packages/design-tokens` may use Node standard-library modules in scripts.

It must not import React, Next.js, UI components, app code, domain code, or
Tailwind config code.

No runtime dependencies are required. A small dev dependency for color parsing
is acceptable only if you document why local OKLCH parsing is too brittle.

`packages/tailwind-config` may import `@repo/design-tokens/css` and
`tailwindcss` only.

## Required File Layout

Create or update:

```text
packages/design-tokens/
  css/
    tokens.css
  scripts/
    generate.mjs
    validate.mjs
  src/
    index.ts
    index.test.ts
    tokens.generated.ts
    tokens.source.json
  package.json
  vitest.config.ts

packages/tailwind-config/
  shared-styles.css
```

Remove or replace:

```text
packages/design-tokens/scripts/generate-placeholder.mjs
packages/design-tokens/scripts/check-placeholder.mjs
```

Remove `placeholderTokens` from `src/index.ts`.

## Milestone 1: Source Tokens and Package Scripts

Create `src/tokens.source.json` using the shape and values from
`docs/20-specs/design-tokens-spec.md`.

Update `packages/design-tokens/package.json`:

- keep export `.` pointing to `src/index.ts`
- keep export `./css` pointing to `css/tokens.css`
- set scripts:
  - `"build": "node scripts/generate.mjs"`
  - `"check": "node scripts/validate.mjs"`
  - `"typecheck": "tsc --noEmit -p tsconfig.json"`
  - `"lint": "biome check ./src ./scripts"`
  - `"test": "vitest run"`
  - `"test:coverage": "vitest run --coverage"`

Do not change package name or package boundary.

Verification:

```bash
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test
```

## Milestone 2: Generator

Implement `scripts/generate.mjs`.

The generator must read `src/tokens.source.json` and write:

- `css/tokens.css`
- `src/tokens.generated.ts`

`css/tokens.css` must:

- start with a generated-file comment
- define light variables under `:root, [data-theme="light"]`
- define dark variables under `.dark, [data-theme="dark"]`
- include all canonical shadcn variables listed in `docs/20-specs/design-tokens-spec.md`
- include bootstrap aliases listed in `docs/20-specs/design-tokens-spec.md`
- keep color values in OKLCH

`src/tokens.generated.ts` must export:

```ts
export const tokens = { ... } as const
export const lightTheme = tokens.themes.light
export const darkTheme = tokens.themes.dark
export type Tokens = typeof tokens
export type ThemeName = keyof typeof tokens.themes
export type SemanticColorToken = keyof typeof tokens.themes.light.color
```

Update `src/index.ts` to export from `tokens.generated.ts`.

Run:

```bash
pnpm --filter @repo/design-tokens build
```

Verification:

```bash
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test
```

## Milestone 3: Validation

Implement `scripts/validate.mjs`.

Validation must fail when:

- a required light color token is missing
- a required dark color token is missing
- a required base token is missing
- generated `css/tokens.css` is stale
- generated `src/tokens.generated.ts` is stale
- `placeholderTokens` still appears in `packages/design-tokens/src`
- any required contrast pair fails its threshold

Use the contrast pairs and thresholds from `docs/20-specs/design-tokens-spec.md`.

Preferred implementation: parse `oklch()` and calculate WCAG contrast locally.
If a color parsing dev dependency is added, keep it in `devDependencies` and
record the rationale in `STATUS.md`.

Verification:

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test
```

## Milestone 4: Tailwind v4 Shared Styles

Update `packages/tailwind-config/shared-styles.css`.

Requirements:

- keep `@import "tailwindcss" source(none);`
- keep `@import "@repo/design-tokens/css";`
- update dark variant to support both `.dark` and `[data-theme="dark"]`
- map all canonical shadcn variables through `@theme inline`
- map fonts, spacing, radius scale, and shadows as specified
- use canonical variables in the base layer:
  - `background: var(--background)`
  - `color: var(--foreground)`
- preserve existing `@source` entries
- do not create a Tailwind v3 config

Verification:

```bash
pnpm --filter @repo/tailwind-config typecheck
pnpm turbo typecheck lint test
pnpm lint
```

## Milestone 5: Tests and Coverage

Update `packages/design-tokens/src/index.test.ts`.

Required tests:

- `tokens` exposes light and dark themes
- `lightTheme.color` contains all canonical shadcn color tokens
- `darkTheme.color` contains all canonical shadcn color tokens
- generated CSS contains `:root`, `[data-theme="light"]`, `.dark`, and
  `[data-theme="dark"]`
- generated CSS contains representative variables:
  - `--background`
  - `--foreground`
  - `--primary`
  - `--primary-foreground`
  - `--chart-1`
  - `--sidebar`
  - `--radius`
- generated CSS preserves bootstrap aliases:
  - `--color-bg`
  - `--color-text`
  - `--color-surface`
  - `--radius-control`

Do not snapshot the full generated CSS.

Verification:

```bash
pnpm --filter @repo/design-tokens test:coverage
```

## Final Verification

Run all commands:

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

## Completion Criteria

Before marking the goal complete:

- all required files exist
- placeholder token exports are removed
- placeholder scripts are removed or replaced
- generated artifacts are in sync with source
- generated CSS defines canonical shadcn variables for light and dark themes
- generated CSS supports `.dark` and `[data-theme="dark"]`
- `shared-styles.css` uses canonical shadcn variables through `@theme inline`
- contrast validation passes
- no React/Next/UI imports exist in `packages/design-tokens`
- no Tailwind v3 config is created
- all verification commands pass
- `PLAN.md` and `STATUS.md` are updated with final results

## Reporting

Final response must include:

- files changed
- generated token artifacts
- validation result
- contrast validation result
- verification commands and pass/fail status
- any deviations from the spec, with rationale

