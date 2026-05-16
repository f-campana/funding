# @repo/design-tokens

Generated design-token package for the funding workspace.

This package owns the token source, generated CSS custom properties, generated
TypeScript exports, and validation scripts. It is shadcn/ui and Tailwind CSS v4
compatible.

## Source And Outputs

Source of truth:

```text
src/tokens.source.json
```

Generated artifacts:

```text
css/tokens.css
src/tokens.generated.ts
```

Do not edit generated files directly. Edit `tokens.source.json`, then run:

```bash
pnpm --filter @repo/design-tokens build
```

## Exports

CSS:

```css
@import "@repo/design-tokens/css";
```

TypeScript:

```ts
import { darkTheme, lightTheme, tokens } from '@repo/design-tokens'
```

The TypeScript export preserves the DTCG-adjacent token shape. Components should
usually consume tokens through Tailwind/shadcn semantic classes rather than
importing token values directly.

## CSS Contract

Generated CSS defines canonical shadcn variables for both light and dark themes:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--muted`, `--accent`, `--destructive`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`
- sidebar variables
- status variables such as `--status-success`, `--status-attention`,
  `--status-danger`, `--status-info`, and `--status-pending`, each with
  `-foreground`, `-muted`, and `-border` roles
- readiness aliases such as `--readiness-ready`,
  `--readiness-attention`, `--readiness-blocked`, and
  `--readiness-not-started`, each with `-foreground`, `-muted`, and `-border`
  roles
- `--radius`, fonts, spacing, elevation, and motion variables

Dark mode supports both `.dark` and `[data-theme="dark"]`.

Bootstrap compatibility aliases such as `--color-bg` and `--radius-control` are
kept for existing placeholders, but new UI work should use canonical shadcn
variables through Tailwind classes.

## Validation

```bash
pnpm --filter @repo/design-tokens check
```

The validator checks:

- required token presence
- generated CSS/TypeScript sync
- placeholder removal
- WCAG contrast pairs for light and dark themes
- readiness alias drift against the mapped status tokens

## Commands

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test:coverage
```

## Non-Goals

- Style Dictionary
- Figma Tokens integration
- native iOS/Android outputs
- React components
- shadcn component installation
- runtime tenant theme application

See [../../docs/20-specs/design-tokens-spec.md](../../docs/20-specs/design-tokens-spec.md).
