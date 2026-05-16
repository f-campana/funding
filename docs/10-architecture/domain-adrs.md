# Domain ADRs

## ADR-DOM-001: Represent euros as branded bigint cents

**Status:** Accepted

### Context

The product handles investor commitments, SPV subscriptions, and portfolio
amounts. JavaScript `number` cannot be trusted as the primary representation for
money because it is a binary floating-point type and can silently introduce
rounding errors.

### Decision

Represent money in domain logic as `EuroCents`, a branded `bigint` containing
integer minor units.

### Rationale

`bigint` preserves exact integer arithmetic. Cents are the smallest unit we need
for v1. Branding prevents accidental mixing of plain integers with financial
amounts.

### Consequences

Domain arithmetic is exact. JSON/API boundaries need explicit serialization
helpers because raw `bigint` is not JSON-serializable. Form schemas can accept
JSON-compatible number cents as input, then transform to branded `EuroCents`.

---

## ADR-DOM-002: EUR-only in v1

**Status:** Accepted

### Context

Funding-like surfaces are European-first and the first demo surfaces are
commitment flows and dashboards denominated in EUR. A generic `Money<Currency>`
abstraction is attractive, but it introduces currency policy, conversion, and
rounding questions before we need them.

### Decision

Implement `EuroCents` only in v1.

### Rationale

Correct EUR handling is more valuable than a premature multi-currency
abstraction. Adding currencies later is a domain expansion, not a primitive
library concern.

### Consequences

All v1 money helpers are explicit: `parseEuroCents`, `formatEuroCents`,
`addEuroCents`. Any future USD/GBP/CHF support requires a new ADR covering
currency conversion and rounding policy.

---

## ADR-DOM-003: Formatting is pure and locale is passed explicitly

**Status:** Accepted

### Context

The application uses `next-intl`, but `packages/domain` must stay React-free and
Next-free.

### Decision

Domain formatting functions accept locale as an option:

```ts
formatEuroCents(amount, { locale: 'fr-FR' })
```

The default locale is `fr-FR`.

### Rationale

This keeps formatting deterministic, testable, and independent from React
providers. App or kit adapters can read locale from app context later and pass
it to domain formatting functions.

### Consequences

No `useLocale`, `useTranslations`, `NextIntlClientProvider`, or app provider
imports are allowed in `packages/domain`.

---

## ADR-DOM-004: Zod schemas live in domain and output branded values

**Status:** Accepted

### Context

The same validation contract is needed by forms, tRPC procedures, tests, and
demo fixtures. If each layer defines its own schema, domain rules drift.

### Decision

Canonical runtime schemas live in `packages/domain`. Money-related schemas
transform validated raw input into branded `EuroCents`.

### Rationale

The domain package is the stable owner of business invariants. It can depend on
Zod without pulling React or app concerns into the core library.

### Consequences

Form code composes domain schemas rather than redefining them. If presentation
needs a softer intermediate schema for partial form state, it must convert into
the canonical domain schema before final submission.

---

## ADR-DOM-005: Commitment flow schemas, not form state machines

**Status:** Accepted

### Context

The investor commitment flow is a progressive disclosure UI, but the domain
package should not own React Hook Form state, step navigation, or animations.

### Decision

`packages/domain` owns schemas and types for each step. The UI/app layer owns
step state and progression.

### Rationale

Validation and domain shape are reusable across frontend, backend, import tools,
and tests. UI state is not.

### Consequences

The domain package exports `AmountStepSchema`, `QualificationStepSchema`,
`KycStepSchema`, `ReviewStepSchema`, and `CommitmentFormSchema`. It does not
export hooks, components, or form controllers.

---

## ADR-DOM-006: Domain owns SPV statuses, app/kit own state machines

**Status:** Accepted

### Context

The frontend architecture calls for XState on SPV lifecycle surfaces. However,
XState is a UI/application orchestration concern.

### Decision

`packages/domain` owns `SpvStatus`, `SpvStatusSchema`, and a pure transition
table. It does not depend on XState.

### Rationale

Status strings and allowed transitions are domain vocabulary. Runtime machines,
subscriptions, optimistic overlays, and UI effects are application behavior.

### Consequences

Future XState machines in `apps/web` or `packages/kit` must import domain
statuses and transition helpers instead of duplicating status strings.

---

## ADR-DOM-007: No financial ratio helpers in v1

**Status:** Accepted

### Context

Cap table and fund logic eventually need allocations, percentages, basis points,
carried interest, and waterfall-like calculations. These encode policy.

### Decision

Do not implement ratio multiplication, basis-point helpers, or allocation
helpers in the first domain loop.

### Rationale

Adding these without explicit rounding rules creates false confidence. The first
domain loop should establish exact minor-unit arithmetic and parsing/formatting.

### Consequences

Any future helper such as `multiplyEuroCentsByBasisPoints` or
`allocateEuroCents` requires tests for rounding, conservation of total amount,
and remainder distribution.
