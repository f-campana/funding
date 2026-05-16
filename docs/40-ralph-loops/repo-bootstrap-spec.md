# Repo Bootstrap Spec

## Purpose

Create the minimal executable monorepo shell for the funding project.

This bootstrap is not a product implementation pass. It exists to give later Ralph loops a stable runway for:

- `packages/core`
- `packages/domain`
- `packages/design-tokens`
- `packages/ui`
- `packages/kit`
- `apps/web`

The bootstrap agent should set up package boundaries, shared tooling, and verification commands. It should not implement the functional core library, the money domain, the token pipeline, or UI components beyond placeholders required to prove tooling works.

## Repository Root

Use:

```text
/Users/fabiencampana/Documents/funding
```

This directory has been inspected and is greenlit as an empty greenfield repo root.

## Package Manager And Runtime

Use:

- `pnpm`
- Node.js `>=22`
- TypeScript latest stable available through package manager unless a version is already pinned by the bootstrap agent's environment
- React 19 latest
- Next.js latest stable App Router release
- Tailwind CSS v4
- Biome for linting and formatting
- Vitest for unit/integration tests
- Playwright for e2e and selected screenshot tests
- Storybook for component development and selected visual surfaces

Do not use:

- ESLint
- Prettier
- Jest
- Yarn
- npm workspaces
- Tailwind v3 config-first setup

## Required Directory Structure

Create:

```text
apps/
  web/
  storybook/

packages/
  core/
  domain/
  design-tokens/
  tailwind-config/
  ui/
  kit/
  typescript-config/
  test-config/

docs/
```

The existing `docs/` directory must be preserved.

## Required Root Files

Create:

```text
package.json
pnpm-workspace.yaml
turbo.json
biome.json
tsconfig.json
.gitignore
.npmrc
README.md
```

Do not initialize git unless explicitly requested by the user after bootstrap verification.

## Package Naming

Use workspace package names:

```text
@repo/core
@repo/domain
@repo/design-tokens
@repo/tailwind-config
@repo/ui
@repo/kit
@repo/typescript-config
@repo/test-config
@repo/web
@repo/storybook
```

`apps/web` should be named `@repo/web`.
`apps/storybook` should be named `@repo/storybook`.

## Root Scripts

Root `package.json` must expose at least:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "storybook": "turbo run storybook",
    "storybook:build": "turbo run storybook:build",
    "e2e": "turbo run e2e"
  }
}
```

Use exact script names consistently across packages where applicable:

- `build`
- `dev`
- `typecheck`
- `test`
- `test:coverage`
- `storybook`
- `storybook:build`
- `e2e`

## Turbo Pipeline

Configure `turbo.json` so:

- `build` depends on upstream package builds
- `typecheck` depends on upstream package builds or typecheck where appropriate
- `test` depends on upstream builds where necessary
- `dev`, `storybook`, and `e2e` are persistent when needed
- outputs are configured for `.next`, `dist`, `storybook-static`, and coverage directories

Keep the pipeline simple. Do not over-optimize caching in bootstrap.

## TypeScript Config Package

Create `packages/typescript-config` with exported configs:

```text
base.json
next.json
react-library.json
node-library.json
test.json
```

Base config must include:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `useUnknownInCatchVariables: true`
- `moduleResolution: "bundler"`
- `verbatimModuleSyntax: true`
- `isolatedModules: true`
- `skipLibCheck: true`

Package configs should extend this base rather than duplicate it.

## Test Config Package

Create `packages/test-config` with shared Vitest helpers/config factories.

Initial scope:

- base Vitest config factory
- React/jsdom config factory
- shared setup file importing Testing Library matchers

Do not add `vitest-axe`, `fast-check`, or complex visual-test helpers in bootstrap unless needed by placeholder tests. Later loops can add them when packages need them.

## Biome Config

Create a valid `biome.json`.

Requirements:

- format enabled
- organize imports enabled
- lint enabled
- no explicit `any`
- no console in source code, except allowed in scripts if necessary
- no `dangerouslySetInnerHTML`
- accessibility recommended rules enabled where available
- test overrides may relax selected rules where appropriate

For Biome 2, organize imports should be enabled through the assist action:

```json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

The config must validate with Biome. Avoid JSON comments.

If unsure whether a Biome rule name exists in the installed version, prefer a smaller valid config over an ambitious invalid one.

## App Package: `apps/web`

Create a minimal Next.js App Router app.

Requirements:

- React 19
- Next.js App Router
- TypeScript
- `next-intl`
- default locale `fr-FR`
- `next/font` setup for final chosen fonts as placeholders if exact fonts are not finalized
- imports shared Tailwind styles
- root layout
- homepage that proves app renders
- route-level error boundary
- route-level loading boundary
- minimal Playwright smoke test

Do not implement Funding dashboard UI in bootstrap.

## Tailwind Config Package

Create `packages/tailwind-config`.

Requirements:

- Tailwind v4 CSS-first setup
- `shared-styles.css`
- import `tailwindcss`
- map semantic CSS variables via `@theme inline`
- include a custom dark variant placeholder
- import generated design-token CSS or a placeholder token CSS from `@repo/design-tokens/css`

Do not create a Tailwind v3 `tailwind.config.js` unless a tool absolutely requires it. Prefer CSS-first configuration.

`shared-styles.css` should start with this Tailwind v4 CSS-first skeleton:

```css
@import "tailwindcss" source(none);
@import "@repo/design-tokens/css";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-background: var(--color-bg);
  --color-foreground: var(--color-text);
  --color-card: var(--color-surface);
  --color-card-foreground: var(--color-text);
  --color-primary: var(--color-accent);
  --color-primary-foreground: var(--color-accent-foreground);
  --color-border: var(--color-border);
  --color-ring: var(--color-ring);
  --radius: var(--radius-control);
}
```

The token agent may expand the semantic variable set later. The bootstrap agent should preserve the structure.

## Design Tokens Package

Create `packages/design-tokens`.

Bootstrap scope:

- package manifest
- source token placeholder
- generated CSS placeholder
- TypeScript entrypoint exporting placeholder token object
- script placeholders for future token generation/checking

Do not implement the full Style Dictionary pipeline in bootstrap.

The later token agent will expand this package.

## Core Package

Create `packages/core`.

Bootstrap scope:

- package manifest
- `src/index.ts` placeholder export
- placeholder test proving Vitest works
- typecheck script

Do not implement `Option`, `Result`, `AsyncData`, or `Future`.

The later core-library Ralph loop owns that implementation.

## Domain Package

Create `packages/domain`.

Bootstrap scope:

- package manifest
- `src/index.ts` placeholder export
- placeholder test proving package works

Do not implement money, schemas, KYC, SPV lifecycle, or commitment flow.

The later domain agent owns this.

## UI Package

Create `packages/ui`.

Bootstrap scope:

- package manifest
- source-only package exports
- `src/index.ts`
- `src/lib/cn.ts`
- placeholder primitive component, preferably `Button`, only if required to prove React package testing
- placeholder Storybook story
- placeholder test
- `scripts/check-styles-contract.mjs` placeholder enforcing at least these rules:
  - no `React.forwardRef`
  - no `forwardRef(`
  - no `.displayName =`
  - no `data-testid`
  - no icon library imports in `packages/ui`
  - no hardcoded Google Fonts imports in package CSS

Use:

- React 19 ref-as-prop style
- `clsx`
- `tailwind-merge`

Do not install/copy the full Shadcn component set in bootstrap.

The later UI agent owns real Shadcn/Radix component installation.

## Kit Package

Create `packages/kit`.

Bootstrap scope:

- package manifest
- `src/index.ts`
- placeholder component or no-op export
- placeholder test

Do not implement dashboard, charts, commitment form, or money display.

The later kit agent owns those.

## Storybook

Create `apps/storybook` as a standalone workspace package.

Storybook must consume stories from:

- `packages/ui`
- `packages/kit`

Do not configure Storybook inside `packages/ui` or `apps/web`.

Requirements:

- `pnpm storybook` starts Storybook through Turbo
- `pnpm storybook:build` succeeds
- deterministic preview setup
- no Chromatic

## Playwright

Set up minimal Playwright.

Requirements:

- app smoke test verifies homepage renders
- screenshot capability available
- no broad visual snapshot suite yet

Do not add complex Staffmatch-style image snapshot infrastructure in bootstrap.

## Documentation Preservation

Do not delete existing docs.

Existing docs include:

- `docs/50-research/fodmapp-ui-patterns.md`
- `docs/10-architecture/package-boundaries.md`

The bootstrap agent may add:

- `PLAN.md`
- `STATUS.md`
- package READMEs

## Verification Commands

At the end of bootstrap, these commands should pass:

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm storybook:build
pnpm e2e
```

If `storybook:build` or `e2e` cannot pass because of environment constraints, document the exact blocker in `STATUS.md`.

## Non-Goals

The bootstrap agent must not:

- implement the ADT core library
- implement money arithmetic
- implement commitment-flow schemas
- implement real design-token generation
- copy the full FODMAP UI package
- copy the full Shadcn component set
- build the Funding dashboard
- build the progressive disclosure form
- add tRPC
- add database tooling
- add authentication
- initialize git
- add deployment config

## Success Criteria

Bootstrap is successful when:

- package boundaries exist
- scripts are consistent
- TypeScript strictness is active
- Biome config is valid
- tests run
- Storybook builds
- Playwright smoke test runs
- docs remain in place
- later agents can work package-by-package without inventing infrastructure
