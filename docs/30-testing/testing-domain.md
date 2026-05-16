# Testing Domain

## Purpose

`packages/domain` tests protect financial and regulatory invariants. They should
catch wrong money arithmetic, loose parsing, schema drift, and incomplete status
handling before UI or app code can rely on broken assumptions.

---

## Required Commands

From the repo root:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
```

`packages/domain` should add:

```json
{
  "scripts": {
    "lint": "biome check ./src",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

The package should use `@vitest/coverage-v8` and 100 percent thresholds for
implemented files.

---

## Money Tests

### Constructor and Serialization

Test:

- `euroCentsFromMinorUnits(123n)` brands an exact value
- `euroCentsToMinorUnits` returns the exact original `bigint`
- `euroCentsFromNumberMinorUnits` rejects non-integers
- `euroCentsFromNumberMinorUnits` rejects unsafe integers
- `serializeEuroCentsToNumber` rejects values outside `Number.MAX_SAFE_INTEGER`

### Parsing

Valid examples:

```text
1234
1234.56
1234,56
1 234,56
1.234,56
1_234,56
1 234,56 EUR
1 234,56 €
-1 234,56
```

Invalid examples:

```text
""
"abc"
"1,234.56.78"
"1,234"
"12,345"
"1.234,567"
"1,23,4"
```

The ambiguous values above should be rejected unless the implementation has a
clear deterministic interpretation and tests document it.

### Formatting

Use `fr-FR` as the default locale.

French currency formatting can contain regular spaces, no-break spaces
(`\u00a0`), or narrow no-break spaces (`\u202f`) depending on platform and ICU
version. Tests should normalize spacing when they assert visible output:

```ts
export const normalizeFrenchNumber = (value: string) =>
  value.replace(/\u00a0|\u202f/g, ' ')
```

Assert examples after normalization:

```ts
expect(normalizeFrenchNumber(formatted)).toBe('1 234,56 €')
```

### Property Tests

Use `fast-check` over bounded `bigint` ranges.

Required properties:

- `addEuroCents(a, b) === addEuroCents(b, a)`
- `addEuroCents(addEuroCents(a, b), c) === addEuroCents(a, addEuroCents(b, c))`
- `subtractEuroCents(addEuroCents(a, b), b) === a`
- `negateEuroCents(negateEuroCents(a)) === a`
- `compareEuroCents(a, b)` agrees with raw bigint comparison
- for a safe display range, `parseEuroCents(formatEuroCents(a)) === a` after
  spacing normalization

Do not property-test unbounded `bigint` ranges that make failures hard to
inspect. Use realistic financial bounds, for example plus/minus EUR 100 million.

---

## Commitment Flow Schema Tests

Use fixtures in:

```text
packages/domain/src/commitment-flow/fixtures.ts
```

Recommended fixtures:

- valid individual professional investor
- valid legal-entity professional investor
- valid informed investor in `FR`
- invalid informed investor in `CH`
- non-eligible investor
- valid KYC individual
- valid KYB legal entity
- invalid legal entity with no UBO
- invalid UBO below 25 percent ownership
- valid review step
- invalid review step with one missing consent

Specific invariants:

- professional investor requires at least 2 of 3 MiFID criteria
- informed investor is restricted to EuVECA countries
- all consent fields are `true`, not merely boolean
- document size cannot exceed 10 MB
- document MIME type is restricted to allowed types
- amount cents are integer and safe before branding
- full commitment schema rejects `qualificationType: "non_eligible"` if final
  submission is intended to proceed
- `SubmittableCommitmentFormSchema` explicitly rejects a complete payload whose
  `qualification.qualificationType` is `"non_eligible"`

If the base `CommitmentFormSchema` allows non-eligible data for blocking UI
states, create a separate `SubmittableCommitmentFormSchema` that rejects it.
Do not hide this distinction in UI code.

---

## SPV Lifecycle Tests

Test every status:

- parses through `SpvStatusSchema`
- appears in exactly one expected category: terminal or non-terminal
- has explicit transition behavior

Transition tests:

- allowed forward transitions return `true`
- reverse transitions return `false`
- same-state transitions return `false` unless explicitly allowed later
- unknown statuses are rejected by Zod

Use an exhaustive table rather than scattered one-off tests.

---

## Type Tests

Compile-time expectations should verify:

- `EuroCents` is not assignable from plain `bigint`
- `DealId` is not assignable to `InvestorId`
- commitment schema output brands `amountCents` as `EuroCents`

Prefer `.test-types.ts` files included by `tsconfig.json` over runtime hacks.

---

## What Not To Test

Do not use:

- React Testing Library
- Playwright
- browser APIs
- snapshots
- image snapshots
- Storybook stories

Those belong to UI, kit, or app loops. Domain tests are pure Node tests.
