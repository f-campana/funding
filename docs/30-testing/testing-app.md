# Testing App

## Purpose

`apps/web` tests verify that the implemented package layers work together in a
real Next.js App Router application.

Package tests already cover the computational and component contracts. App
tests should focus on routing, provider wiring, localization, integration, and
browser-observable behavior.

## Test Types

### Typecheck

Run:

```bash
pnpm --filter @repo/web typecheck
```

This must catch:

- invalid App Router route types
- incorrect async `params` handling
- invalid imports from workspace packages
- broken `next-intl` configuration

### Build

Run:

```bash
pnpm --filter @repo/web build
```

This must catch:

- packages missing from `transpilePackages`
- invalid Server/Client Component boundaries
- font loading mistakes
- route generation issues

### Playwright

Run:

```bash
pnpm --filter @repo/web e2e
```

and from the root:

```bash
pnpm e2e
```

The app shell loop should use Playwright for browser-visible integration
coverage.

## Required E2E Coverage

The first app integration loop must test:

- homepage renders with one clear heading
- homepage has a link to `/deals/northstar-energy`
- clicking the link reaches `/deals/northstar-energy/about`
- `/deals/northstar-energy/about` renders its translated heading
- `/deals/northstar-energy/about` exposes the `Commitment progress`
  progressbar
- `/deals/northstar-energy/commitments` supports investor inspection
- `/deals/northstar-energy/documents` renders document requirements
- active deal navigation marks the current route with `aria-current="page"`
- unsupported deal routes render the not-found UI
- deal route screenshot is captured as a Playwright output artifact

Do not assert implementation details such as internal class names or Motion
animation internals.

## Query Strategy

Prefer:

- `getByRole`
- accessible names
- visible route headings
- stable link names
- progressbar role
- button expanded/collapsed state

Avoid:

- `data-testid`
- raw CSS selectors
- brittle text from long paragraphs
- snapshots of full HTML

## Screenshot Strategy

Use Playwright screenshots for key route states:

- deal route loaded
- optionally investor row expanded

For this loop, store screenshots as test artifacts through
`testInfo.outputPath(...)`.

Do not add image snapshot assertions yet. They are useful later once the app
surface stabilizes.

## Locale Expectations

Default locale: `fr-FR`.

Tests may assert French app-owned copy. For financial values rendered by
`@repo/kit`, normalize non-breaking spaces before comparing text.

Use this helper if needed:

```ts
const normalizeFrenchSpacing = (value: string) =>
  value.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ')
```

## Error And Not-Found Testing

Test unsupported deal IDs through navigation:

```text
/deals/unknown
/deals/unknown/about
/deals/unknown/commitments
/deals/unknown/documents
```

Assert the not-found UI, not the HTTP internals.

Route `error.tsx` behavior can be tested later when app routes have real
fallible data loading. Do not manufacture runtime crashes in this loop unless
the implementation naturally exposes a safe test hook, which it should not.

## Accessibility

The app shell should preserve accessible route structure:

- one primary `h1` per route
- semantic links and buttons
- focusable interactive controls
- no hidden-only primary navigation

Playwright is enough for this loop. Do not add Axe to `apps/web` yet; component
accessibility is covered in `@repo/ui` and `@repo/kit`.

## Verification Block

Required final commands:

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm turbo typecheck lint test
pnpm lint
pnpm e2e
git diff --check
```

If browser launch is blocked locally, record the exact Playwright failure in
`STATUS.md` and still run typecheck, build, lint, and workspace tests.
