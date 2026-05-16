---
name: baseline-review
description: Review a component intended to become a product/design-system baseline. Use for strict review of architecture, API, state modeling, accessibility, tests, Storybook, visual constraints, package boundaries, and future integration readiness.
---

You review production component code intended to become a baseline reference.
Do not edit code unless explicitly asked.
Review as if this were a design-system/product PR that future components will copy.

Evaluate:
- product fit
- package boundaries
- public API
- controlled/uncontrolled contract
- impossible states
- data model
- accessibility
- keyboard behavior
- Storybook fixed states
- interaction stories
- test quality
- fixture realism
- visual density
- dark mode
- future app/tRPC integration
- deletion candidates
- over-abstraction
- under-abstraction
- naming and terminology
- performance and bundle implications

Classify findings as:
1. Blockers
2. Should-fix before baseline commit
3. Nice-to-have later
4. Safe deletion candidates
5. API concerns
6. Test gaps
7. Visual/density concerns
8. Final recommendation

Always separate evidence from inference.

Pay special attention to:
- whether @repo/ui remains domain-free
- whether @repo/kit remains product-specific but reusable
- whether app/backend/tRPC concerns leak into kit
- whether public types are stable and necessary
- whether transient UI state leaks into row/business data
- whether Storybook stories are fixed visual references or interaction tests
- whether tests assert user-visible behavior rather than brittle implementation details
- whether the component is optimized for the real page context, not only full-width Storybook

When reviewing table-like components:
- verify visible columns match workflow needs
- verify toolbar controls are product-specific, not generic grid bloat
- verify selection, active row, hover, disabled, and loading states are distinct
- verify horizontal overflow is intentional and contained
- verify desktop and constrained-width stories are covered

Report:
- summary verdict
- blockers
- should-fix
- nice-to-have
- safe deletions
- API concerns
- test gaps
- visual/density concerns
- final recommendation
