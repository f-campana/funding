# Task: Implement `apps/web` app shell integration

You are working in:

```text
/Users/fabiencampana/Documents/funding
```

Read these documents before editing files:

```text
docs/20-specs/app-shell-spec.md
docs/30-testing/testing-app.md
docs/10-architecture/package-boundaries.md
docs/10-architecture/monorepo-conventions.md
docs/20-specs/design-tokens-spec.md
docs/20-specs/domain-spec.md
docs/20-specs/kit-spec.md
docs/30-testing/testing-kit.md
docs/20-specs/ui-spec.md
docs/50-research/funding-frontend-spec.md
```

Current implemented foundation:

- `@repo/core` is complete.
- `@repo/domain` is complete.
- `@repo/design-tokens` is complete.
- `@repo/tailwind-config` is complete.
- `@repo/ui` is complete for the first primitive batch.
- `@repo/kit` is complete for the first composed product batch.
- `apps/storybook` is configured and builds.
- `apps/web` is still a minimal Next.js shell.

Your task is to integrate the implemented packages into `apps/web` and produce
the first real app route surface.

Maintain `PLAN.md` and `STATUS.md` while working. Start by writing a concise
milestone plan to `PLAN.md`. Update `STATUS.md` after each milestone with what
passed, what failed, and what remains.

## Non-Negotiable Boundaries

Do not modify or refactor these packages:

```text
packages/core
packages/domain
packages/design-tokens
packages/tailwind-config
packages/ui
packages/kit
apps/storybook
```

You may modify:

```text
apps/web
README.md
docs/README.md
docs/00-overview/project-overview.md
PLAN.md
STATUS.md
pnpm-lock.yaml
```

Only update docs if the implementation status changes.

Do not implement:

- investor commitment form
- React Hook Form
- Zod resolver wiring
- tRPC
- GraphQL
- auth/session logic
- database code
- server actions
- route handlers
- API clients
- live data fetching
- TanStack Query
- TanStack Table
- TanStack Virtual
- XState
- image snapshot assertions

This is an app shell integration loop.

## Required Outcome

At the end of this loop, `apps/web` must provide:

- homepage route `/`
- deal route `/deals/northstar-energy`
- app-level not-found UI for unsupported deal routes
- root and deal route loading/error boundaries
- `@repo/kit/DealDashboardDemo` rendered in the deal route
- `next-intl` translations for app-owned visible copy
- self-hosted font variables expected by the token system
- default `data-theme="light"` on the document root
- Playwright coverage for homepage, deal route, disclosure interaction, and
  not-found behavior
- passing verification commands

## Milestone 1: Inspect And Plan

Read the required docs and inspect:

```text
apps/web/package.json
apps/web/next.config.ts
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/app/error.tsx
apps/web/app/loading.tsx
apps/web/messages/fr-FR.json
apps/web/tests/e2e/homepage.spec.ts
```

Write `PLAN.md`.

Record the starting state in `STATUS.md`.

## Milestone 2: App Package And Next Config

Update `apps/web/package.json`:

- add `@repo/kit` as a dependency
- do not add unrelated dependencies

Run `pnpm install` only if the lockfile needs updating.

Update `apps/web/next.config.ts`:

```ts
const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/core',
    '@repo/domain',
    '@repo/ui',
    '@repo/kit',
    '@repo/tailwind-config',
  ],
}
```

Keep the `next-intl` plugin.

Run:

```bash
pnpm --filter @repo/web typecheck
```

Record results in `STATUS.md`.

## Milestone 3: Root Layout, Fonts, And Theme

Update `apps/web/app/layout.tsx`.

Requirements:

- keep `NextIntlClientProvider`
- use `getLocale` and `getMessages`
- pass the locale and messages into `NextIntlClientProvider`
- load fonts with `next/font/google`
- define these variables:
  - `--font-geist-sans`
  - `--font-geist-mono`
  - `--font-fraunces`
- apply font variable class names on `<html>`
- set `data-theme="light"` on `<html>`
- set `lang={locale}`
- keep body classes semantic: `bg-background`, `font-sans`,
  `text-foreground`, `antialiased`

Use explicit weights for `Fraunces` if required by `next/font/google`:

```ts
const fraunces = Fraunces({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
})
```

Do not add a theme switcher.

Do not use external font `<link>` tags.

Run:

```bash
pnpm --filter @repo/web typecheck
```

## Milestone 4: Routes And Translations

Update homepage `/`.

Requirements:

- Server Component
- uses `getTranslations`
- one clear `h1`
- link to `/deals/northstar-energy`
- semantic Tailwind classes only
- no raw colors
- no manual `dark:` classes

Create deal route files:

```text
apps/web/app/deals/[dealId]/page.tsx
apps/web/app/deals/[dealId]/loading.tsx
apps/web/app/deals/[dealId]/error.tsx
```

The deal page must:

- be a Server Component
- type `params` as `Promise<{ dealId: string }>`
- await `params`
- call `notFound()` for unsupported IDs
- render `DealDashboardDemo` from `@repo/kit`
- use translated app-owned framing copy

Add or update not-found UI:

```text
apps/web/app/not-found.tsx
```

Update:

```text
apps/web/messages/fr-FR.json
```

All app-owned visible copy should be translated through `next-intl`, except
simple loading skeletons with no visible text.

Run:

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
```

## Milestone 5: Error And Loading Boundaries

Ensure:

- root `app/error.tsx` remains a Client Component
- deal route `error.tsx` is a Client Component
- error boundaries use translated copy through `useTranslations`
- reset buttons have accessible names
- no sensitive data is logged to the console
- loading states use token-styled skeleton or muted layout

Do not add `react-error-boundary`.

Run:

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
```

## Milestone 6: Playwright

Update app e2e tests under:

```text
apps/web/tests/e2e
```

Required assertions:

- `/` renders the homepage heading
- homepage link navigates to `/deals/northstar-energy`
- deal route renders its route heading
- deal route renders `Northstar Energy SPV`
- deal route exposes the `Commitment progress` progressbar
- investor disclosure can be expanded and collapsed
- `/deals/unknown` renders the not-found UI
- deal route screenshot is captured through `testInfo.outputPath(...)`

Prefer `getByRole` and accessible names. Do not add `data-testid`.

Run:

```bash
pnpm --filter @repo/web e2e
```

If Playwright browser launch is blocked by the local environment, record the
exact error in `STATUS.md` and continue with the remaining non-browser
verification.

## Milestone 7: Docs Status

If the app integration succeeds, update:

```text
README.md
docs/00-overview/project-overview.md
docs/README.md
```

The docs should say that `apps/web` now renders the first product-shaped route.

Do not rewrite historical Ralph loop prompts.

## Final Verification

Run:

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm turbo typecheck lint test
pnpm lint
pnpm e2e
git diff --check
```

If `pnpm --filter @repo/web e2e` and `pnpm e2e` are blocked by the same local
browser issue, record the blocker once and make clear that app code still
passed typecheck/build/workspace verification.

## Final Audit

Before finishing, run or manually verify:

```bash
git diff --name-only
rg -n "trpc|graphql|prisma|drizzle|postgres|auth|session|use server|route\\.ts" apps/web
rg -n "#[0-9a-fA-F]{3,8}\\b|oklch\\(|\\bdark:|\\b(?:bg|border|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-(?:amber|blue|brown|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\\d{2,3}\\b" apps/web/app
```

Expected:

- no changes under preserved packages
- no tRPC/GraphQL/auth/database/server-action code
- no raw colors or manual dark-mode classes in app UI
- `@repo/kit` dependency exists in `apps/web/package.json`
- `transpilePackages` includes `@repo/core`, `@repo/domain`, `@repo/ui`,
  `@repo/kit`, and `@repo/tailwind-config`
- app route copy exists in `messages/fr-FR.json`
- tests cover homepage, deal route, not-found, and disclosure interaction

Stop after final verification and report results.
