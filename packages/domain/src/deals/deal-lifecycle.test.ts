import { describe, expect, it } from 'vitest'

import {
  canTransitionDealLifecycle,
  DEAL_LIFECYCLE_STATES,
  type DealLifecycleState,
  DealLifecycleStateSchema,
  getDealLifecycleLabel,
  getDealLifecycleTone,
  isPreCloseDealLifecycleState,
  isTerminalDealLifecycleState,
} from './deal-lifecycle'

const allowedTransitions = [
  ['draft', 'internal_review'],
  ['draft', 'cancelled'],
  ['internal_review', 'open_for_preview'],
  ['internal_review', 'cancelled'],
  ['open_for_preview', 'open_for_interests'],
  ['open_for_preview', 'cancelled'],
  ['open_for_interests', 'collecting_commitments'],
  ['open_for_interests', 'cancelled'],
  ['collecting_commitments', 'reviewing_commitments'],
  ['collecting_commitments', 'cancelled'],
  ['reviewing_commitments', 'contracting'],
  ['reviewing_commitments', 'cancelled'],
  ['contracting', 'awaiting_wires'],
  ['contracting', 'cancelled'],
  ['awaiting_wires', 'closing_review'],
  ['awaiting_wires', 'cancelled'],
  ['closing_review', 'closed'],
  ['closing_review', 'cancelled'],
  ['closed', 'portfolio_active'],
  ['portfolio_active', 'partially_exited'],
  ['portfolio_active', 'exited'],
  ['partially_exited', 'exited'],
] as const satisfies readonly (readonly [DealLifecycleState, DealLifecycleState])[]

const preCloseStates = [
  'draft',
  'internal_review',
  'open_for_preview',
  'open_for_interests',
  'collecting_commitments',
  'reviewing_commitments',
  'contracting',
  'awaiting_wires',
  'closing_review',
] as const satisfies readonly DealLifecycleState[]

describe('DealLifecycleStateSchema', () => {
  it('parses every known deal lifecycle state', () => {
    for (const state of DEAL_LIFECYCLE_STATES) {
      expect(DealLifecycleStateSchema.parse(state)).toBe(state)
    }
  })

  it('rejects unknown deal lifecycle states', () => {
    expect(DealLifecycleStateSchema.safeParse('archived').success).toBe(false)
  })
})

describe('deal lifecycle helpers', () => {
  it('allows explicit lifecycle transitions and pre-close cancellation', () => {
    for (const [from, to] of allowedTransitions) {
      expect(canTransitionDealLifecycle(from, to)).toBe(true)
    }

    for (const state of preCloseStates) {
      expect(canTransitionDealLifecycle(state, 'cancelled')).toBe(true)
    }
  })

  it('rejects skipped, reverse, and same-state transitions', () => {
    expect(canTransitionDealLifecycle('draft', 'open_for_preview')).toBe(false)
    expect(canTransitionDealLifecycle('closed', 'closing_review')).toBe(false)
    expect(canTransitionDealLifecycle('closed', 'cancelled')).toBe(false)

    for (const state of DEAL_LIFECYCLE_STATES) {
      expect(canTransitionDealLifecycle(state, state)).toBe(false)
    }
  })

  it('has explicit behavior for every possible transition pair', () => {
    const explicitPairs = new Set(allowedTransitions.map(([from, to]) => `${from}:${to}`))

    for (const from of DEAL_LIFECYCLE_STATES) {
      for (const to of DEAL_LIFECYCLE_STATES) {
        expect(canTransitionDealLifecycle(from, to)).toBe(explicitPairs.has(`${from}:${to}`))
      }
    }
  })

  it('identifies terminal and pre-close states without treating closed as terminal', () => {
    expect(isTerminalDealLifecycleState('exited')).toBe(true)
    expect(isTerminalDealLifecycleState('cancelled')).toBe(true)
    expect(isTerminalDealLifecycleState('closed')).toBe(false)

    for (const state of preCloseStates) {
      expect(isPreCloseDealLifecycleState(state)).toBe(true)
    }

    expect(isPreCloseDealLifecycleState('portfolio_active')).toBe(false)
  })

  it('provides labels and semantic tones for every state', () => {
    for (const state of DEAL_LIFECYCLE_STATES) {
      expect(getDealLifecycleLabel(state)).not.toHaveLength(0)
      expect(getDealLifecycleTone(state)).not.toHaveLength(0)
    }

    expect(getDealLifecycleTone('awaiting_wires')).toBe('attention')
    expect(getDealLifecycleTone('cancelled')).toBe('danger')
  })
})
