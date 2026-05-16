# App Shell Spec

Historical status note: this spec describes the earlier app-shell integration
loop. The current kit API has since been narrowed to `DealCommitmentsTable` and
`DealProgressPanel`, and the Northstar app vertical should now consume the
app-owned operational data spine instead of the deleted `DealDashboardDemo`
surface.

## Purpose

This document specifies the historical app-shell implementation loop for
`apps/web`.

The goal is to turn the minimal Next.js shell into a real app surface that
integrates the implemented workspace layers:

```text
@repo/core -> @repo/domain -> @repo/kit -> apps/web

@repo/design-tokens -> @repo/tailwind-config -> @repo/ui -> @repo/kit -> apps/web
```

At the time it was written, this loop proved that the app could render the
then-current product-shaped kit layer in a real Next.js App Router environment
with locale, fonts, route boundaries, and Playwright coverage.

## Current State

`apps/web` currently contains:

- a minimal App Router shell
- `next-intl` configured with default `fr-FR`
- `@repo/tailwind-config/shared-styles.css` imported through `app/globals.css`
- one root page with placeholder copy
- one root `error.tsx`
- one root `loading.tsx`
- one Playwright homepage smoke test

The current app does not yet import `@repo/kit`.

## Scope

Owns:

- `apps/web`
- app-level messages under `apps/web/messages`
- app-level Playwright tests under `apps/web/tests/e2e`
- app-specific README/status documentation, if needed

May update:

- root `README.md`
- `docs/00-overview/project-overview.md`
- `docs/README.md`
- `PLAN.md`
- `STATUS.md`
- `pnpm-lock.yaml`, if dependencies change

Must not modify:

- `packages/core`
- `packages/domain`
- `packages/design-tokens`
- `packages/tailwind-config`
- `packages/ui`
- `packages/kit`
- `apps/storybook`

## Non-Goals

Do not implement:

- the investor commitment form
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
- full visual regression infrastructure

This loop is an integration shell, not a data or form loop.

## Required Result

At the end of the loop, `apps/web` must provide:

- a root route that introduces the case-study app and links to the deal route
- a deal route rendering the then-current `@repo/kit/DealDashboardDemo`
- `next-intl` translations for app-owned visible copy
- self-hosted fonts through `next/font`
- semantic Tailwind classes only
- a default light theme through `data-theme="light"`
- preserved dark-mode compatibility through token usage
- route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` coverage where
  relevant
- Playwright e2e coverage for the homepage and deal route
- screenshot capture for the deal route
- passing app and workspace verification

## Routes

### `/`

The homepage should remain a Server Component.

It should:

- use `getTranslations`
- describe the project as a private-markets frontend case study
- link to `/deals/northstar-energy`
- avoid marketing-style hero composition
- avoid cards nested in cards
- use semantic token classes such as `bg-background`, `text-foreground`,
  `text-muted-foreground`, `border-border`, and `bg-card`

It should not render the full dashboard. The homepage is a short entry point.

### `/deals/[dealId]`

Create a deal route:

```text
apps/web/app/deals/[dealId]/page.tsx
apps/web/app/deals/[dealId]/loading.tsx
apps/web/app/deals/[dealId]/error.tsx
```

The only supported initial `dealId` is:

```text
northstar-energy
```

The page should:

- be a Server Component
- type `params` as a promise, as required by current Next.js App Router APIs
- call `notFound()` for unsupported deal IDs
- render the historical `DealDashboardDemo` from `@repo/kit`
- use translated route framing copy around the kit demo
- keep all mock/product data inside the kit demo for this loop

Example shape:

```tsx
import { DealDashboardDemo } from '@repo/kit'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

type DealPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params

  if (dealId !== 'northstar-energy') {
    notFound()
  }

  const t = await getTranslations('DealPage')

  return (
    <main>
      <h1>{t('heading')}</h1>
      <DealDashboardDemo />
    </main>
  )
}
```

### `not-found.tsx`

Add an app-level `not-found.tsx` or route-level not-found UI if needed.

It should:

- use app-owned translated copy where possible
- provide a link back to `/`
- not expose implementation details

## Next.js Configuration

Update `apps/web/next.config.ts` so the app can consume the implemented
workspace packages.

Required `transpilePackages`:

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

Keep `next-intl` plugin wiring.

Do not add proxy/middleware in this loop.

## Dependencies

Add `@repo/kit` to `apps/web/package.json` dependencies.

Do not add new runtime dependencies unless there is a specific, documented
need. This loop should not need new dependencies.

## Fonts

Use `next/font/google`.

The design tokens expect these CSS variable names:

- `--font-geist-sans`
- `--font-geist-mono`
- `--font-fraunces`

Load these fonts in `app/layout.tsx`:

- `Geist`
- `Geist_Mono`
- `Fraunces`

Use explicit weights for `Fraunces` if required by `next/font/google`:

```ts
const fraunces = Fraunces({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
})
```

Apply the generated variable class names on `<html>`, not only on `<body>`.

Example:

```tsx
<html
  className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
  data-theme="light"
  lang={locale}
>
```

Do not use external Google Fonts `<link>` tags.

## Theme

Set the default app theme at the document root:

```tsx
<html data-theme="light">
```

Do not add a theme switcher in this loop.

Dark mode is already supported by the token system and Storybook toolbar. The
app must preserve compatibility by using semantic classes only:

- no raw color values
- no hardcoded Tailwind palette classes such as `bg-green-900`
- no manual `dark:` variants

## Internationalization

Default locale: `fr-FR`.

Rules:

- `apps/web` owns all app-level translation files.
- Use `getTranslations` in Server Components.
- Use `useTranslations` only in Client Components such as `error.tsx`.
- Keep Zod/domain message keys out of user-facing copy.
- Avoid ambiguous numeric dates.
- Do not introduce locale routing in this loop.

Update `apps/web/messages/fr-FR.json` for:

- homepage copy
- deal route framing copy
- error boundary copy
- loading and not-found copy if rendered as visible text
- Playwright-visible labels when relevant

## Error Boundaries

Required:

- keep or improve the root `app/error.tsx`
- add a deal route error boundary for `/deals/[dealId]`

The route error boundary must:

- be a Client Component
- use translated copy
- expose a reset action
- avoid logging investor or deal data to the console

Section-level dashboard boundaries are deferred until the dashboard has real
independent data sources. Do not add `react-error-boundary` in this loop.

## Loading States

Keep loading states simple and token-styled.

Use semantic skeleton-like layouts or muted copy. Do not introduce spinners or
new animation libraries.

## Accessibility

The app shell must preserve:

- one clear `h1` per route
- accessible link names
- route error reset button names
- visible focus styles through UI primitives and token classes
- no text overlap at common desktop and mobile viewport widths

## Playwright Requirements

Update `apps/web/tests/e2e/homepage.spec.ts` or split tests as needed.

Required coverage:

- `/` renders the app homepage heading
- homepage links to `/deals/northstar-energy`
- `/deals/northstar-energy` renders the deal route heading
- deal route renders the kit dashboard heading `Northstar Energy SPV`
- deal route exposes the `Commitment progress` progressbar
- an investor disclosure can be expanded and collapsed
- an unknown deal route returns the not-found UI
- a screenshot is captured for the deal route

Keep screenshots as Playwright output artifacts. Do not add image snapshot
assertions yet.

## Verification

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

If Playwright browser launch is blocked by the local environment, record the
exact blocker in `STATUS.md`. Do not mark the loop complete if app code,
routes, or tests are missing.

## Completion Audit

Before finishing, audit:

- `apps/web/package.json` depends on `@repo/kit`
- `apps/web/next.config.ts` transpiles `@repo/kit`, `@repo/domain`, and
  `@repo/core`
- root layout loads the expected font variables
- `NextIntlClientProvider` receives app messages and locale context
- root layout sets `data-theme="light"`
- app-owned copy is in `messages/fr-FR.json`
- route files exist for the deal route
- no forbidden package changes were made
- no tRPC, GraphQL, auth, database, or server-action code was added
- Playwright tests cover the homepage and deal route
- docs that describe current implementation status are updated if the loop
  completes
