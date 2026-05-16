# Domain Ralph Loop Goal

Use this in the Codex CLI from `/Users/fabiencampana/Documents/funding`.

## Start Codex

```bash
codex --no-alt-screen -C /Users/fabiencampana/Documents/funding
```

## Set Goal

```text
/goal Implement packages/domain from docs/40-ralph-loops/ralph-loop-domain-prompt.md, docs/20-specs/domain-spec.md, docs/10-architecture/domain-adrs.md, docs/30-testing/testing-domain.md, and docs/archive/commitment-flow.schemas.ts with full verification.
```

## Run Prompt

```text
Read docs/40-ralph-loops/ralph-loop-domain-prompt.md and execute it exactly for packages/domain. Preserve existing bootstrap and core structure. Maintain PLAN.md and STATUS.md. Stop after final verification and report results.
```

## Required Verification

The agent must run:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
pnpm lint
```

## Expected Non-Goals

The agent must not implement design tokens, UI components, kit components,
XState machines, app routes, tRPC, Prisma, multi-currency, FX conversion, or
rounding-policy helpers.

