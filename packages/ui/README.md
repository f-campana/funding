# @repo/ui

Generic shadcn/Radix-compatible UI primitives for the funding workspace.

This package is domain-free. It owns reusable React primitives, package-local
shadcn aliases, Storybook stories, component contract tests, and accessibility
tests. Product concepts such as investors, SPVs, commitments, KYC, and money
belong in `@repo/domain` and `@repo/kit`, not here.

## Exports

Root export:

```ts
import { Badge, Button, Card, Field, Input, Table } from '@repo/ui'
```

Subpath exports:

```ts
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
```

Styles:

```css
@import "@repo/ui/globals.css";
```

## Component Scope

Implemented first primitive batch:

- `Badge`
- `Button`
- `Card`
- `Field`
- `Input`
- `Progress`
- `Separator`
- `Skeleton`
- `Table`
- `Textarea`
- `VisuallyHidden`

Every component exposes stable `data-slot` attributes and uses semantic
Tailwind classes backed by `@repo/tailwind-config`.

## shadcn Compatibility

The package includes:

- `packages/ui/components.json`
- `apps/web/components.json`
- package-local aliases for `#components`, `#lib`, and `#hooks`
- `@repo/ui/lib/utils` exporting `cn`
- subpath exports for shadcn-style imports

The current target is Tailwind v4 with CSS-first configuration.

## Boundary Rules

May import:

- React
- Radix primitives
- shadcn dependencies
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

Must not import:

- `@repo/domain`
- `@repo/kit`
- `next-intl`
- app code
- icon libraries

The contract script rejects direct icon imports, `data-testid`,
`React.forwardRef`, `.displayName`, raw colors, manual dark-mode overrides, and
other architectural violations.

## Commands

```bash
pnpm --filter @repo/ui typecheck
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test:coverage
pnpm storybook:build
```

See [../../docs/20-specs/ui-spec.md](../../docs/20-specs/ui-spec.md),
[../../docs/30-testing/testing-ui.md](../../docs/30-testing/testing-ui.md), and
[../../docs/50-research/fodmapp-ui-patterns.md](../../docs/50-research/fodmapp-ui-patterns.md).
