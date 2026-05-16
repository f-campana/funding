# Package Boundaries

## Purpose

This document defines the first monorepo package boundaries for the funding project.

The repo should optimize for:

- strict TypeScript correctness
- financial data safety
- accessible UI primitives
- i18n from the start
- composable agent work
- small, enforceable package contracts

## Proposed Structure

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
```

The first scaffold should create the shell and empty package boundaries. It should not implement the full product.

## Dependency Direction

```text
core ───────────────┐
  ↓                 │
domain ────────────→ kit ─→ apps/web
                    ↑
design-tokens → tailwind-config → ui
```

Read this as "left-side packages may be imported by right-side packages." `ui` must not import `domain`; `kit` is the first layer where product/domain-shaped props are allowed.

Styling dependencies:

```text
design-tokens → tailwind-config → ui / kit / apps/web
```

Shared tooling dependencies:

```text
typescript-config → all packages
test-config       → all tested packages
```

Tooling packages are dev dependencies of the workspace. They are omitted from the product data-flow diagram because they do not participate in runtime dependency direction.

No circular dependencies are allowed.

## Package Responsibilities

### `packages/core`

Foundational algebraic data types and computation primitives.

Owns:

- `Option<T>`
- `Result<T, E>`
- `AsyncData<T>`
- `Future<T>`
- core combinators
- law-oriented tests
- TanStack Query adapters only if kept dependency-light or exported from a subpath

Must not import:

- React
- Next.js
- DOM APIs
- Zod, unless an adapter subpath explicitly owns it
- app/domain-specific types
- design tokens

Allowed dependencies should be minimal.

### `packages/domain`

Business/domain types and runtime schemas.

Owns:

- money types such as `EuroCents`
- branded identifiers
- commitment-flow Zod schemas
- investor qualification unions
- KYC/KYB document unions
- SPV lifecycle unions
- pure domain utilities
- financial formatting functions that do not require React

May import:

- `@repo/core`
- `zod`

Must not import:

- React
- Next.js
- Radix
- Shadcn UI
- Tailwind classes
- `next-intl`

Domain functions may accept a `locale` string but must not read locale from React context.

### `packages/design-tokens`

Source and generated design tokens.

Owns:

- token source files
- generated CSS variables
- generated TypeScript token exports
- token validation scripts
- contrast checks

May use:

- Style Dictionary when introduced
- small validation utilities

Must not import:

- React
- app code
- UI components

Initial scope should be smaller than FODMAP's full token generator. Start with web CSS and TypeScript outputs.

### `packages/tailwind-config`

Tailwind v4 CSS-first shared configuration.

Owns:

- `shared-styles.css`
- `@theme inline` mapping
- custom variants
- token-to-Tailwind semantic aliases

May import:

- `@repo/design-tokens/css`
- `tailwindcss`

Must not define product components.

### `packages/ui`

Generic reusable UI primitives and Radix/Shadcn adapters.

Owns:

- Shadcn copied primitives
- Radix adapters
- generic foundation components
- generic field/table/card primitives
- generic accessibility helpers
- component-level tests
- Storybook stories for primitive states

May import:

- React
- Radix packages
- Shadcn dependencies
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@repo/tailwind-config`

Should avoid importing:

- `@repo/domain`
- `@repo/kit`
- `next-intl`
- app code

Must not:

- fetch data
- know about investors, SPVs, KYC, funds, or commitments
- hardcode French copy
- import icon libraries directly
- use `data-testid`
- use `React.forwardRef`
- set `.displayName`

Generic primitives should accept labels as props when an accessible label is needed.

### `packages/kit`

Product-shaped composed components built on top of `ui`.

Owns:

- the accepted `DealCommitmentsTable` baseline
- the accepted `DealProgressPanel` baseline
- public props, state, action, label, and input types for those baselines
- Storybook stories for realistic product states of accepted baselines

Deleted legacy kit surfaces from earlier exploratory passes are historical and
must not be treated as current API. New kit surfaces require an explicit future
scope decision.

May import:

- `@repo/core`
- `@repo/domain`
- `@repo/ui`
- `motion/react`
- `lucide-react`
- chart libraries when appropriate

Should not:

- call tRPC directly
- fetch data
- own app routing
- own authentication
- contain server actions

The kit layer may accept domain-shaped props but should remain render-focused.

### `apps/web`

The Next.js application.

Owns:

- routing
- layouts
- `next-intl` setup
- `next/font` font loading
- providers
- tRPC client/server wiring
- route-level error boundaries
- app-level Playwright tests
- realistic demo pages

May import all workspace packages.

Must keep server/data concerns out of `packages/ui` and `packages/kit`.

### `apps/storybook`

Standalone Storybook workspace package.

Owns:

- Storybook configuration
- Storybook preview decorators
- story loading from `packages/ui` and `packages/kit`
- Storybook static build

May import:

- `@repo/ui`
- `@repo/kit`
- `@repo/tailwind-config`
- `@repo/design-tokens`

Must not:

- own product routing
- fetch live data
- depend on app-only providers unless mocked or wrapped deterministically

## i18n Boundary

Default locale: `fr-FR`.

Use `next-intl` in `apps/web`.

Rules:

- `packages/domain` receives locale as a parameter for pure formatting helpers.
- `packages/ui` receives already translated labels or label props.
- `packages/kit` may either receive translated labels or expose label props for the app to fill.
- `apps/web` owns translation files and providers.

Never format ambiguous numeric dates such as `08/05/2026` for legally meaningful deadlines. Use explicit localized dates with written months where relevant.

## Money Boundary

Money must not be represented as a floating-point number in domain logic.

Rules:

- parse raw form input into branded integer cents in `packages/domain`
- format money through domain utilities
- render money in app or kit adapters from JSON-safe/display-ready values
- never perform financial arithmetic in React components
- never add different currencies without an explicit conversion step

`packages/ui` should not know what money is.

## Error Boundary Strategy

Granular error boundaries are required.

Initial app boundaries:

- route-level boundary
- dashboard main-column boundary
- dashboard side-panel boundary
- commitment form boundary
- document preview boundary when document UI appears

An investor table failure should not crash deal terms. A document preview failure should not crash the whole dashboard.

## Testing Ownership

### `packages/core`

Tests:

- unit tests
- property-based tests
- law tests for map/flatMap/all
- compile-time type tests if practical

No DOM tests.

### `packages/domain`

Tests:

- Zod schema validation
- branded money parsing/formatting
- jurisdiction/qualification rules
- property-based tests for money invariants

No React tests.

### `packages/ui`

Tests:

- Testing Library component tests
- `vitest-axe` accessibility tests
- keyboard and focus tests
- Storybook primitive stories
- visual screenshots for selected stable primitives

No domain fixtures.

### `packages/kit`

Tests:

- composed component integration tests
- Storybook realistic product states
- chart accessibility tests
- selected visual screenshots
- progressive disclosure behavior

May use domain fixtures.

### `apps/web`

Tests:

- Playwright e2e flows
- locale smoke tests
- route-level error boundary behavior
- visual screenshots for key page layouts

### `apps/storybook`

Tests:

- Storybook build smoke
- selected interaction stories
- selected visual screenshots when stable

## Storybook Boundary

Storybook should cover:

- `packages/ui` primitive states
- `packages/kit` composed states
- selected dashboard/demo blocks

Do not use Storybook as a replacement for app e2e tests.

Storybook lives in `apps/storybook`.

Storybook stories should be deterministic:

- fixed dates
- fixed locale
- fixed mock data
- stable fonts
- no live network calls

## Visual Testing Boundary

Start with Playwright screenshots and selected image snapshots.

Use visual testing for:

- layout regressions
- chart rendering
- progressive disclosure transitions after animation settles
- responsive breakpoints

Do not snapshot every component by default.

## Agent Work Boundaries

Agents should receive narrowly scoped ownership.

Recommended sequence:

1. repo scaffold agent
2. core library agent
3. domain schemas/money agent
4. token pipeline agent
5. ui primitives agent
6. kit dashboard/form agent
7. app integration agent

Each agent should write or update:

- `PLAN.md`
- `STATUS.md`
- package-local tests
- verification notes

Each agent should run:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

or the closest package-scoped equivalent.

## Import Rules

Allowed examples:

```ts
// domain can use core
import { Result } from "@repo/core";

// kit can use domain and ui
import { parseEuroCents } from "@repo/domain/money";
import { Button } from "@repo/ui/button";

// app can use accepted kit baselines
import { DealProgressPanel } from "@repo/kit";
```

Forbidden examples:

```ts
// core must not know domain
import { EuroCents } from "@repo/domain/money";

// ui must not know domain
import { InvestorStatus } from "@repo/domain/investor";

// domain must not know React
import type { ReactNode } from "react";

// kit must not fetch data
import { api } from "@/trpc/client";
```

## First Scaffold Scope

The first scaffold should create:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `biome.json`
- root `tsconfig.json`
- package directories
- minimal package manifests
- shared TypeScript config package
- shared test config package
- empty source entrypoints
- placeholder tests proving tooling works
- Storybook shell
- Playwright shell
- docs directory

It should not implement:

- full ADT library
- full token generator
- full UI primitive set
- dashboard mockup
- commitment form
- tRPC setup

The goal is to create a stable runway for subsequent Ralph loops, not to ship product code in the bootstrap pass.
