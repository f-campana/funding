# UI Package Spec

## `@repo/ui` - Generic shadcn-compatible primitives

**Status:** Implemented
**Scope:** `packages/ui`, Storybook stories, shadcn monorepo configuration
**Depends on:** `@repo/tailwind-config`, React, Radix/shadcn dependencies
**Must not depend on:** `@repo/domain`, `@repo/kit`, `next-intl`, app code

## 1. Purpose

`@repo/ui` owns generic reusable React primitives. These components should feel
native to shadcn/ui and Tailwind v4, but remain domain-free.

This package is not where private-market product concepts belong. There should
be no investor, SPV, commitment, KYC, money, jurisdiction, fund, or Roundtable
copy in `packages/ui`. Those belong in `@repo/domain` and `@repo/kit`.

## 2. Compatibility Target

The package must be compatible with current shadcn/ui monorepo conventions:

- shadcn CLI can understand the workspace through `components.json`
- components use canonical shadcn CSS variables through Tailwind classes
- Tailwind v4 uses CSS-first configuration and an empty Tailwind config path
- app-level component installs can route primitives into `packages/ui`
- subpath imports such as `@repo/ui/components/button` work

Relevant upstream docs:

- <https://ui.shadcn.com/docs/monorepo>
- <https://ui.shadcn.com/docs/components-json>
- <https://ui.shadcn.com/docs/tailwind-v4>

Current local CLI observation:

```bash
pnpm dlx shadcn@latest info -c apps/web --json
```

The workspace now includes shadcn configuration in both `apps/web` and
`packages/ui`, so the CLI can resolve the monorepo aliases and package-level UI
destination.

## 3. Required shadcn Configuration

The package owns shadcn configuration for both the app workspace and the UI
workspace. Current shadcn monorepo docs require every workspace using the CLI to
have a `components.json` file.

Implemented files:

```text
apps/web/components.json
packages/ui/components.json
```

Use the same style, base color, icon library, RSC setting, and TypeScript
setting in both files.

Current `apps/web/components.json` values:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

For `packages/ui/components.json`, the `tailwind.css` path should be:

```json
"src/styles/globals.css"
```

For Tailwind v4, `tailwind.config` stays empty.

## 4. UI Global Styles Entry

Implemented shadcn-compatible package style entrypoint:

```text
packages/ui/src/styles/globals.css
```

It should import the existing shared Tailwind v4 setup:

```css
@import "@repo/tailwind-config/shared-styles.css";
```

Do not duplicate token definitions in `packages/ui`. The source of truth remains
`@repo/design-tokens` and `@repo/tailwind-config`.

Export the style entrypoint from `packages/ui/package.json`:

```json
"./globals.css": "./src/styles/globals.css"
```

## 5. Package Imports And Exports

`packages/ui/package.json` includes package-local imports:

```json
"imports": {
  "#components/*": "./src/components/*.tsx",
  "#lib/*": "./src/lib/*.ts",
  "#hooks/*": "./src/hooks/*.ts"
}
```

Expose shadcn-style subpaths:

```json
"exports": {
  ".": {
    "types": "./src/index.ts",
    "import": "./src/index.ts"
  },
  "./globals.css": "./src/styles/globals.css",
  "./components/*": {
    "types": "./src/components/*.tsx",
    "import": "./src/components/*.tsx"
  },
  "./lib/*": {
    "types": "./src/lib/*.ts",
    "import": "./src/lib/*.ts"
  }
}
```

`packages/ui/src/lib/utils.ts` exports `cn`. `@repo/ui/lib/utils` works because
shadcn components expect a `utils` alias.

## 6. First Component Scope

Implemented first generic primitive batch:

- `Button`
- `Input`
- `Textarea`
- `Field` composition primitives
- `Table`
- `Badge`
- `Progress`
- `Card`
- `Separator`
- `Skeleton`
- `VisuallyHidden`

This is intentionally not the full shadcn catalog. Do not add dialogs, sheets,
drawers, forms, charts, tabs, select, command, tooltip, popover, sidebar, or
data-table in this loop.

The initial UI loop intentionally excluded charts. Generic chart primitives are
specified as a dedicated follow-up pass in
[chart-primitives-spec.md](./chart-primitives-spec.md), so chart infrastructure
can land without mixing product-specific dashboard widgets into `@repo/ui`.

## 7. Component Rules

All reusable component roots must expose stable `data-slot` attributes.
Subparts should do the same when they are part of the public component
contract.

Use React 19 ref style:

- no `React.forwardRef`
- no imported `forwardRef`
- no `.displayName = ...`
- accept `ref` as a regular prop through `React.ComponentProps<...>` where
  needed

Use shadcn/Radix composition where appropriate:

- `Button` supports `asChild` through `@radix-ui/react-slot`
- `Progress` uses `@radix-ui/react-progress`
- `Separator` uses `@radix-ui/react-separator`
- field label behavior should remain accessible

Use CVA where variants are part of the public API:

- `Button`
- `Badge`

Avoid CVA for one-off structural components where a plain class list is
clearer.

## 8. Styling Rules

Use semantic Tailwind classes only:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `text-muted-foreground`
- `border-border`
- `ring-ring`
- `bg-primary`
- `text-primary-foreground`

Do not use hardcoded color utilities such as `text-green-600`,
`bg-stone-50`, or raw OKLCH/hex values in components.

Do not scatter manual dark-mode color overrides in components. Light/dark
behavior comes from CSS variables.

Do not use `space-x-*` or `space-y-*`; use `flex` or `grid` with `gap-*`.

Use `size-*` when width and height are equal.

Use `cn()` for conditional classes.

## 9. Copy And i18n Boundary

`packages/ui` must not hardcode French user-facing copy.

Allowed:

- generic accessible labels provided by props
- visually hidden labels provided by props
- Storybook example text

Not allowed:

- domain copy
- translation files
- `next-intl`
- locale formatting

## 10. Icons

`packages/ui` must not import icon libraries directly.

Generic components may accept `ReactNode` icon slots. Product-level icon choices
belong in `@repo/kit` or `apps/web`.

The existing style contract script must continue to reject direct icon-library
imports in `packages/ui`.

## 11. Stories

Every component in the first batch needs at least one Storybook story. Variant
components need stories covering their public variants.

Stories live beside components:

```text
packages/ui/src/components/button.stories.tsx
```

or under the existing story layout if the agent keeps it consistent. Storybook
already reads:

```text
packages/ui/src/**/*.stories.@(ts|tsx)
packages/kit/src/**/*.stories.@(ts|tsx)
```

## 12. Non-Goals

Do not implement:

- `packages/kit`
- product components such as deal progress panels or commitment tables
- product/domain chart widgets. Generic chart primitives are specified
  separately in [chart-primitives-spec.md](./chart-primitives-spec.md).
- motion animations
- forms tied to `@repo/domain`
- React Hook Form integration
- app routes
- auth
- data fetching
- tRPC
- database code
- visual snapshot infrastructure

## 13. Verification

The loop is complete only when all commands pass:

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Also audit:

```bash
rg -n "forwardRef|React\\.forwardRef|\\.displayName\\s*=|data-testid|lucide-react|@repo/domain|@repo/kit|next-intl" packages/ui/src
rg -n "text-(green|red|blue|stone|slate|zinc|neutral)-|bg-(green|red|blue|stone|slate|zinc|neutral)-|#[0-9a-fA-F]{3,8}|oklch\\(" packages/ui/src
```

The second audit may find legitimate examples only if they are not component
source. Component source should not contain hardcoded color utilities or raw
colors.
