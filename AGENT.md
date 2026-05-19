# Agent Instructions

## React Composition Guardrail

When creating or changing React components, prefer composition over
configuration. Components should combine caller-owned UI descriptions through
`children`, slots, or compound subcomponents instead of accepting structural
props such as `title`, `subtitle`, `header`, `footer`, `toolbar`, `actions`,
`icon`, `emptyState`, or `columns`.

Small primitive props, accessibility props, variants, event handlers, and domain
data records are fine. But if a prop makes the component decide layout,
ordering, nested controls, section presence, or rendered action UI, stop and
use children or a compound API. Exported `@repo/kit` product surfaces should
expose composable parts first; pre-composed defaults may wrap those parts, but
must not be the only public API.

## React Hooks Synchronization Guardrail

Treat every render as a snapshot. Call hooks only at stable top-level positions,
keep dependency arrays truthful, and model effects as synchronization with
external systems rather than lifecycle events. Use functional state updates when
the next value depends on queued state, and use refs only to bridge stable
callbacks to latest values without resubscribing external observers. Controlled
and uncontrolled hook state must have one clear owner.

## React State Ownership Guardrail

Default to colocated `useState`. Lift state only to the nearest common owner when
siblings genuinely share it. Treat Context as dependency injection for stable or
infrequently changing values, not as a state-management layer; split providers
by update frequency and avoid fresh provider objects that broadcast every
render.

Do not introduce Zustand, Redux, XState, or another external state tool unless
the change includes a short rationale proving local state, lifted state, URL
state, server/cache state, and Context DI are insufficient. Use XState only for
real domain workflows with explicit events, guarded transitions, async effects,
replay/reconciliation, or parallel states, not for ordinary component or form
progression.

For reusable components, make controlled/uncontrolled ownership explicit with
`value/defaultValue/onChange` semantics or a local controllable-state helper. Do
not mirror props into local state with `useEffect` when the rendered value can
be chosen from the current source of truth during render. Avoid accepting both
raw inputs and independently derived summaries unless one is clearly canonical.

## Runtime Validation Guardrail

Before adding or changing a data boundary, decide whether the value is trusted
compiled code or untrusted runtime data. Use canonical `@repo/domain` schemas
for business invariants, app-local DTO schemas for serialized route/API shapes,
and validation at URL, request, import, generated JSON, provider, database,
environment, form-submission, storage, package-manifest, and generated
diagnostics boundaries.

Do not add Zod inside ordinary React render components or generic UI primitives
just to duplicate TypeScript props. When introducing a new DTO or external data
source, add or reuse a schema in the owning layer and document why validation
lives there.
