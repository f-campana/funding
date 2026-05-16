# Task: Implement `@repo/ui` - shadcn-compatible primitives

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

Read these documents before editing files:

```text
docs/20-specs/ui-spec.md
docs/30-testing/testing-ui.md
docs/10-architecture/package-boundaries.md
docs/20-specs/design-tokens-spec.md
docs/50-research/fodmapp-ui-patterns.md
docs/10-architecture/monorepo-conventions.md
```

Current implemented foundation:

- `@repo/core` is complete.
- `@repo/domain` is complete.
- `@repo/design-tokens` is complete.
- `@repo/tailwind-config` is complete.
- `@repo/ui` currently contains a bootstrap `Button` only.

Your task is to replace the bootstrap `@repo/ui` placeholder with the first real
generic UI primitive set.

Maintain `PLAN.md` and `STATUS.md` while working. Start by writing a concise
milestone plan to `PLAN.md`. Update `STATUS.md` after each milestone with what
passed, what failed, and what remains.

## Non-Negotiable Boundaries

Do not modify or refactor these packages except where explicitly required by
workspace imports or verification:

```text
packages/core
packages/domain
packages/design-tokens
packages/tailwind-config
packages/kit
```

Do not implement:

- product/domain components
- `MoneyDisplay`
- investor rows
- SPV trackers
- commitment forms
- charts
- animation/motion infrastructure
- app routes
- auth
- data fetching
- tRPC
- database code

`packages/ui` must not import:

- `@repo/domain`
- `@repo/kit`
- `next-intl`
- app code
- icon libraries such as `lucide-react`

## Required Outcome

At the end of this loop, `@repo/ui` should provide a shadcn-compatible generic
primitive layer with:

- shadcn `components.json` files for `apps/web` and `packages/ui`
- package-local shadcn aliases/imports for `packages/ui`
- a UI globals CSS entrypoint that imports `@repo/tailwind-config`
- shadcn-style subpath exports
- generic primitives
- Storybook stories
- Testing Library and accessibility tests
- passing verification commands

## Milestone 1: shadcn Workspace Configuration

Create:

```text
apps/web/components.json
packages/ui/components.json
packages/ui/src/styles/globals.css
```

Follow `docs/20-specs/ui-spec.md`.

Use shadcn monorepo-compatible configuration:

- same `style` in both files
- same `iconLibrary` in both files
- same `baseColor` in both files
- `rsc: true`
- `tsx: true`
- Tailwind v4 `tailwind.config` is `""`
- `cssVariables: true`

Use `radix-nova` unless the current shadcn CLI rejects it. If rejected, use the
current CLI default preset/style and record the deviation in `STATUS.md`.

`packages/ui/src/styles/globals.css` should only import the shared CSS:

```css
@import "@repo/tailwind-config/shared-styles.css";
```

Do not duplicate token variables.

After writing the config, run:

```bash
pnpm dlx shadcn@latest info -c apps/web --json
```

Record the result in `STATUS.md`.

## Milestone 2: Package Imports, Exports, And Utilities

Update `packages/ui/package.json`:

- add package-local `imports` for `#components/*`, `#lib/*`, and `#hooks/*`
- add exports for:
  - `.`
  - `./globals.css`
  - `./components/*`
  - `./lib/*`

Create or adjust:

```text
packages/ui/src/lib/utils.ts
```

It must export `cn`.

Keep backwards compatibility with the existing `cn` export if practical, but
new shadcn-compatible imports must work:

```ts
import { cn } from '@repo/ui/lib/utils'
```

Run:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
```

## Milestone 3: Add Or Mirror shadcn Components

Preferred path: use the shadcn CLI from the app workspace so it routes files to
`packages/ui`:

```bash
cd apps/web
pnpm dlx shadcn@latest add button input textarea field table badge progress card separator skeleton
```

If the CLI cannot route correctly in this existing custom monorepo, do not
force destructive changes. Instead:

1. Record the blocker in `STATUS.md`.
2. Use the current official shadcn component source via the CLI where possible
   (`pnpm dlx shadcn@latest view ...` or `docs ...`).
3. Adapt the components manually while preserving the public API and styling
   model.

Never fetch raw GitHub files manually.

Components required in this loop:

```text
button
input
textarea
field
table
badge
progress
card
separator
skeleton
visually-hidden
```

`visually-hidden` may be a local utility component if shadcn does not provide a
matching primitive.

Use React 19 conventions:

- no `React.forwardRef`
- no imported `forwardRef`
- no `.displayName =`

If generated shadcn code includes old ref/displayName patterns, rewrite it to
React 19 style while preserving API compatibility.

## Milestone 4: Enforce Styling And Architecture Contracts

Update `packages/ui/scripts/check-styles-contract.mjs` if needed.

It must reject at least:

- `React.forwardRef`
- imported `forwardRef`
- `.displayName =`
- `data-testid`
- direct icon library imports
- Google Fonts imports
- `dangerouslySetInnerHTML`
- direct imports from `@repo/domain`, `@repo/kit`, `next-intl`, or app code

Add a hardcoded color/style check if practical:

- raw hex colors
- raw `oklch(...)`
- Tailwind color family utilities such as `text-green-600`, `bg-slate-50`,
  `border-zinc-200`

Do not block semantic shadcn/Tailwind classes such as `bg-background`,
`text-muted-foreground`, `border-border`, `ring-ring`, `bg-primary`, or
`text-primary-foreground`.

Run:

```bash
pnpm --filter @repo/ui test
```

## Milestone 5: Tests

Install test dependencies if missing:

```bash
pnpm --filter @repo/ui add -D vitest-axe axe-core
```

Write tests for every component in the first batch.

Test with:

- Testing Library role/label queries
- `data-slot` contract assertions
- native prop forwarding where relevant
- variant coverage where relevant
- `vitest-axe` accessibility checks for representative states

Do not use `data-testid`.

Do not write broad snapshots.

Run:

```bash
pnpm --filter @repo/ui test:coverage
```

## Milestone 6: Storybook Stories

Add stories for every implemented component.

Stories should cover:

- default state
- variants
- disabled state when relevant
- invalid/error state for field/input components
- table/card/progress representative states

Keep stories generic. Do not introduce private-market domain copy into
`packages/ui` stories.

Run:

```bash
pnpm storybook:build
```

## Milestone 7: Exports And Smoke Tests

Update:

```text
packages/ui/src/index.ts
```

Export every public component and public prop type that should be available
from the package root.

Also ensure subpath imports work:

```ts
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
```

Add a package export smoke test if needed.

Run:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
```

## Final Verification

Run all commands:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Run audits:

```bash
rg -n "forwardRef|React\\.forwardRef|\\.displayName\\s*=|data-testid|lucide-react|@repo/domain|@repo/kit|next-intl" packages/ui/src packages/ui/package.json
rg -n "text-(green|red|blue|stone|slate|zinc|neutral)-|bg-(green|red|blue|stone|slate|zinc|neutral)-|border-(green|red|blue|stone|slate|zinc|neutral)-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/ui/src
```

The first audit must return no forbidden component-source hits.

The second audit should return no component-source hits. If it returns a hit,
inspect it and either replace it with a semantic token class or document why it
is not component source.

## Completion Audit

Before final response, verify:

- `apps/web/components.json` exists
- `packages/ui/components.json` exists
- `packages/ui/src/styles/globals.css` exists
- `packages/ui/package.json` exports `./globals.css`, `./components/*`, and
  `./lib/*`
- `@repo/ui/lib/utils` works
- `packages/ui` has no domain imports
- `packages/ui` has no icon library imports
- components use `data-slot`
- no `forwardRef` or `.displayName`
- Storybook build passes
- UI coverage passes
- `PLAN.md` and `STATUS.md` are updated

Stop after verification. Do not start implementing `packages/kit`.
