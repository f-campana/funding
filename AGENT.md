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
