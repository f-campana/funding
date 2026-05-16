# Design Tokens Ralph Loop Goal

Use this in the Codex CLI from `/Users/fabiencampana/Documents/funding`.

## Start Codex

```bash
codex --no-alt-screen -C /Users/fabiencampana/Documents/funding
```

## Set Goal

```text
/goal Implement the shadcn-compatible packages/design-tokens pipeline from docs/40-ralph-loops/ralph-loop-design-tokens-prompt.md and docs/20-specs/design-tokens-spec.md with full verification.
```

## Run Prompt

```text
Read docs/40-ralph-loops/ralph-loop-design-tokens-prompt.md and execute it exactly for packages/design-tokens and packages/tailwind-config. Preserve existing core and domain structure. Maintain PLAN.md and STATUS.md. Stop after final verification and report results.
```

## Required Verification

The agent must run:

```bash
pnpm --filter @repo/design-tokens build
pnpm --filter @repo/design-tokens check
pnpm --filter @repo/design-tokens typecheck
pnpm --filter @repo/design-tokens lint
pnpm --filter @repo/design-tokens test:coverage
pnpm --filter @repo/tailwind-config typecheck
pnpm turbo typecheck lint test
pnpm lint
```

## Expected Non-Goals

The agent must not implement UI components, kit components, shadcn component
installation, `components.json`, Next.js font loading, tenant runtime theming,
Style Dictionary, native outputs, or dark-mode UI.

