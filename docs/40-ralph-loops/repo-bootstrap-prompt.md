# Ralph Loop Prompt: Repo Bootstrap

You are Codex running inside `/Users/fabiencampana/Documents/funding`.

Your task is to scaffold the minimal executable monorepo shell for the funding project.

Read these documents before writing files:

1. `docs/40-ralph-loops/repo-bootstrap-spec.md`
2. `docs/10-architecture/package-boundaries.md`
3. `docs/50-research/fodmapp-ui-patterns.md`
4. `docs/archive/biome.json`

Treat `docs/40-ralph-loops/repo-bootstrap-spec.md` as the source of truth for this loop.
Treat `docs/archive/biome.json` as the validated template for the root Biome configuration. Copy its structure into the root `biome.json` unless the scaffold requires a narrowly justified adjustment.

## Objective

Create a greenfield pnpm/Turbo monorepo with strict TypeScript, Biome, placeholder packages, minimal Next.js app, minimal Storybook, minimal Playwright, and placeholder tests.

This loop is infrastructure only.

Do not implement the actual core library, money domain, design-token generator, Shadcn component set, Funding dashboard, charts, or commitment form.

## Required Package Layout

Create:

```text
apps/web
apps/storybook

packages/core
packages/domain
packages/design-tokens
packages/tailwind-config
packages/ui
packages/kit
packages/typescript-config
packages/test-config
```

Use package names:

```text
@repo/web
@repo/storybook
@repo/core
@repo/domain
@repo/design-tokens
@repo/tailwind-config
@repo/ui
@repo/kit
@repo/typescript-config
@repo/test-config
```

## Work Rules

- Preserve existing docs.
- Do not initialize git.
- Use pnpm, not npm or Yarn.
- Use Biome, not ESLint/Prettier.
- Use Tailwind v4 CSS-first setup.
- Use React 19 conventions.
- Use `next-intl` with default locale `fr-FR`.
- Use `next/font`; do not import Google Fonts from CSS.
- Keep `packages/ui` generic and domain-free.
- Keep `packages/domain` React-free.
- Keep `packages/core` dependency-minimal.
- Avoid `any`.
- Avoid `data-testid` in reusable UI.
- Do not use `React.forwardRef`.
- Do not set component `.displayName`.

## Milestones

### Milestone 1: Root Workspace

Create root:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `biome.json`
- `tsconfig.json`
- `.gitignore`
- `.npmrc`
- `README.md`

After this milestone, run:

```bash
pnpm install
pnpm lint
```

If install is not possible because of network or registry issues, record the exact blocker in `STATUS.md` and continue only as far as local file creation allows.

### Milestone 2: Shared Config Packages

Create:

- `packages/typescript-config`
- `packages/test-config`

`packages/typescript-config` must export:

- `base.json`
- `next.json`
- `react-library.json`
- `node-library.json`
- `test.json`

`packages/test-config` must export minimal Vitest config helpers and shared test setup.

After this milestone, run:

```bash
pnpm typecheck
pnpm test
```

### Milestone 3: Placeholder Library Packages

Create placeholder packages:

- `packages/core`
- `packages/domain`
- `packages/design-tokens`
- `packages/tailwind-config`
- `packages/ui`
- `packages/kit`

Each package must have:

- `package.json`
- `src/index.ts` where applicable
- `typecheck` script
- placeholder test where applicable

`packages/tailwind-config` should expose `shared-styles.css`.

`packages/design-tokens` should expose placeholder CSS and TypeScript token exports.

`packages/ui` may include one minimal placeholder `Button` to verify React package testing and Storybook. Keep it generic and token-styled.

Create `packages/ui/scripts/check-styles-contract.mjs` as a placeholder contract script. It must fail on at least:

- `React.forwardRef`
- `forwardRef(`
- `.displayName =`
- `data-testid`
- icon library imports in `packages/ui`
- hardcoded Google Fonts imports in package CSS

After this milestone, run:

```bash
pnpm typecheck
pnpm test
pnpm lint
```

### Milestone 4: Minimal Web App

Create `apps/web` as a minimal Next.js App Router app.

Requirements:

- TypeScript
- React 19
- Next.js App Router
- `next-intl`
- default locale `fr-FR`
- `next/font`
- Tailwind shared styles imported
- root layout
- homepage
- loading boundary
- error boundary

After this milestone, run:

```bash
pnpm typecheck
pnpm build
```

### Milestone 5: Storybook

Create `apps/storybook` as a standalone Storybook workspace package.

Requirements:

- stories are loaded from `packages/ui` and `packages/kit`
- `pnpm storybook` works through Turbo
- `pnpm storybook:build` works
- no Chromatic

After this milestone, run:

```bash
pnpm storybook:build
```

### Milestone 6: Playwright

Set up minimal Playwright.

Requirements:

- smoke test for homepage rendering
- screenshot capability available
- no broad visual snapshot suite yet

After this milestone, run:

```bash
pnpm e2e
```

### Milestone 7: Final Verification

Run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm storybook:build
pnpm e2e
```

Write `STATUS.md` with:

- completed milestones
- verification results
- any skipped command and exact reason
- recommended next Ralph loop

## Expected Next Loop

The next loop after this bootstrap is `packages/core`.

Do not start that work in this loop.

The core loop will implement:

- `Option<T>`
- `Result<T, E>`
- `AsyncData<T>`
- `Future<T>`
- law tests
- property-based tests

Your job is only to make that next loop possible.
