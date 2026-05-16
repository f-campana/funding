# Current Priorities And Rationale

**Status:** Active tracking  
**Created:** 2026-05-09  
**Purpose:** keep the current chain of thought, next tasks, and sequencing
rationale discoverable as the repository grows.

This document is the short-term priority tracker. It does not replace package
specs or ADRs. It explains why the next work is ordered the way it is.

## 1. Current State

The repository has a complete first vertical slice:

- safe TypeScript primitives in `@repo/core`
- exact EUR money, IDs, commitment schemas, and SPV lifecycle helpers in
  `@repo/domain`
- capital/payment reconciliation vocabulary and exact summary helpers in
  `@repo/domain/reconciliation`
- shadcn-compatible light/dark tokens and Tailwind v4 mapping
- generic UI primitives and chart infrastructure in `@repo/ui`
- product-shaped dashboard components in `@repo/kit`
- a Next.js route at `/deals/northstar-energy`
- Storybook review surfaces for UI and kit components

Recent dashboard refinement passes improved:

- desktop dashboard composition
- SPV lifecycle constrained rendering
- chart-backed product widgets
- investor record density
- mobile/narrow progressive disclosure
- rendered browser verification for the dashboard route and stories

The product surface is now structurally credible enough to expose deeper product
gaps.

## 2. Latest Product Finding

The current dashboard is still too much of a status report.

It shows:

- committed amount
- remaining amount
- lifecycle state
- investor records
- aggregate status distribution
- recent activity
- deal terms

But a private-markets operator needs an exception workspace. The page should
answer:

- What is blocking the close?
- Who owns each blocker?
- What needs attention today?
- Are we on track for the closing date?
- Which capital is committed, signed, wired, cleared, or reconciled?
- Which documents or compliance checks are incomplete?
- Which investors create concentration, deadline, or eligibility risk?

The next product improvement is therefore not simply more visual polish. It is
sharper domain/product modeling for closing readiness and exceptions.

## 3. Priority Stack

### Priority 1 — Closing Readiness And Exceptions Planning

Owner: Codex in this thread.

Output:

- [Closing Readiness + Exception Dashboard V1](./closing-readiness-exception-dashboard-v1.md)
- possibly a Ralph loop prompt after the model and scope are clear

Why this is first:

- It captures the strongest UX/domain critiques from the latest reviews.
- It prevents the dashboard from becoming prettier but still passive.
- It defines the vocabulary needed before any API, persistence, or form work.
- It gives future Ralph loops a sharper target than "improve the dashboard".

The planning pass should define:

- readiness summary model
- blocker queue model
- committed/signed/wired/cleared/reconciled capital semantics
- investor-level next action, owner, and due date
- document completeness states
- deadline and stale-request signals
- visual priority rules
- what belongs in `@repo/domain` vs `@repo/kit`
- what remains static demo data for now

### Priority 2 — Domain Reconciliation Enabling Pass

Owner: Ralph loop.

Status: completed in commit `eef6a7b`.

Output:

- `@repo/domain/reconciliation`
- `CapitalStage` and `PaymentStatus` schemas
- `PaymentRecordSchema`
- exact `CapitalReconciliationSummary` helper
- tests for stage order, JSON money branding, and exact derived amounts

Why this is next:

- Closing readiness depends on the committed/signed/received/matched
  distinction.
- These states are domain vocabulary, not kit-local dashboard strings.
- The pass is narrow, testable, and does not require UI changes.
- It lets the next dashboard loop talk about unfunded, unmatched, and
  over-target capital precisely.

### Priority 3 — Targeted Status-Token Pass

Owner: Ralph loop.

Status: completed.

Output:

- semantic `status-*` color tokens
- readiness-specific `readiness-*` aliases
- Tailwind v4 mappings for those tokens
- validation for required tokens, contrast, stale generated output, and alias
  drift

Why this is next:

- The current UI overuses green for too many meanings.
- Closing readiness needs distinct visual semantics for ready, attention,
  blocked, and not-started states.
- The next dashboard loop should consume semantic tokens rather than hard-code
  status colors.
- This pass is isolated to design tokens and Tailwind, so it is safer to run
  before product-component changes.

### Priority 4 — Public-Readiness Documentation Pass

Owner: Codex in this thread.

Status: next.

Output:

- root `README.md` improvements
- clearer review path for external readers
- short "why this exists" and "what to inspect" sections
- explicit limitations and non-affiliation language
- screenshots or stable Storybook/app routes if we decide to include them

Why this remains important:

- The project is public and may be shared with the Roundtable team.
- Decisions and thought process should be easy to discover without reading chat.
- The current repo is already strong enough to benefit from better packaging.

Why it follows the reconciliation and token passes:

- Public docs should describe the current thesis accurately.
- The committed/signed/received/matched vocabulary is central to the next
  product story.
- The ready/attention/blocked/not-started visual vocabulary is central to the
  dashboard story.
- If public docs are updated before these enabling passes, they will either
  under-explain the product direction or describe a model not yet present in the
  repo.

### Priority 5 — Closing Readiness / Exception Dashboard Implementation

Owner: Ralph loop.

Status: completed.

Output:

- `@repo/kit` readiness module:
  - `ClosingReadinessSummary`
  - `ClosingBlockerQueue`
  - `CapitalReconciliationPanel`
- dashboard composition led by readiness, blockers, and capital reconciliation
- Storybook review surfaces for readiness states and dashboard states
- Playwright assertions for the public route, keyboard interaction, mobile
  ordering, and overflow
- no backend/API/auth/persistence

Prepared artifacts:

- [Closing readiness dashboard V1 spec](../20-specs/closing-readiness-dashboard-v1-spec.md)
- [Testing closing readiness dashboard](../30-testing/testing-closing-readiness-dashboard.md)
- [Closing readiness dashboard V1 prompt](../40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-prompt.md)
- [Closing readiness dashboard V1 goal](../40-ralph-loops/ralph-loop-closing-readiness-dashboard-v1-goal.md)

Implemented scope:

- readiness header or panel
- blocker queue / action list
- clearer capital reconciliation summary
- investor risk/next-action visibility
- timeline changed from passive log toward operational context

Why a Ralph loop:

- This was a multi-file product-component pass with stories and tests.
- The spec was sharp enough for bounded implementation and verification.

Next action:

- commit the completed closing-readiness implementation and docs updates.
- then run the public-readiness documentation pass so external readers can
  understand the current architecture, product thesis, and review path.

### Priority 6 — Investor Commitment Flow

Owner: Ralph loop.

Why it waits:

- The commitment form should reuse the domain language and visual hierarchy
  clarified by the operator dashboard work.
- It is a larger flow involving progressive disclosure, validation, and i18n.
- Building it before the exception/readiness vocabulary is settled risks
  repeating weak semantics in another surface.

### Priority 7 — API / tRPC Architecture Pass

Owner: planning first, implementation later.

Current understanding:

- New surfaces should use tRPC + TanStack Query.
- GraphQL is legacy migration context, not a target for this repo.
- The repo should demonstrate clean new-surface architecture, not reproduce
  legacy coexistence unless we explicitly model migration behavior.

Why it waits:

- Transport should follow product semantics.
- The current static dashboard still needs better domain vocabulary before data
  fetching is valuable.
- We should avoid wiring APIs around incomplete concepts like "committed" when
  the domain needs signed/wired/cleared/reconciled distinctions.

## 4. Deferred Findings To Preserve

These findings are valid but not immediate implementation scope:

- color palette feels dull and low-personality
- green currently carries too many meanings
- chart colors need semantic status definitions
- mobile may hide important context too aggressively
- lifecycle is visually useful but not enough to express dependency blockers
- activity timeline should eventually become an operational task/history hybrid
- document completeness, ownership, expiry, and audit references need explicit
  product treatment
- capital concentration risk should be visible when large investors dominate
  the close
- last-updated and data freshness cues matter for trust

These should inform the next product and public-readiness passes before any
broad token or dashboard redesign.

## 5. Current Next Action

Commit the completed Closing Readiness / Exception Dashboard V1 implementation
and docs updates.

After that, run the public-readiness documentation pass. The repository is now
strong enough to present externally, but the README and docs should make the
project thesis, inspection path, non-affiliation language, and implementation
sequence obvious without requiring chat context.
