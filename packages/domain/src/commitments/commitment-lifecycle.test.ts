import { describe, expect, it } from 'vitest'

import {
  COMMITMENT_LIFECYCLE_STATES,
  type CommitmentLifecycleState,
  CommitmentLifecycleStateSchema,
  canTransitionCommitmentLifecycle,
  getCommitmentLifecycleLabel,
  getCommitmentLifecycleTone,
  isCommitmentOperationallyActive,
  isTerminalCommitmentLifecycleState,
} from './commitment-lifecycle'

const allowedTransitions = [
  ['draft', 'submitted'],
  ['submitted', 'pending_review'],
  ['pending_review', 'approved'],
  ['pending_review', 'rejected'],
  ['approved', 'contracting'],
  ['contracting', 'signature_sent'],
  ['signature_sent', 'part_signed'],
  ['signature_sent', 'signed'],
  ['part_signed', 'signed'],
  ['signed', 'wire_instructions_sent'],
  ['wire_instructions_sent', 'wire_pending'],
  ['wire_pending', 'wire_received'],
  ['wire_received', 'wire_matched'],
  ['wire_matched', 'reconciled'],
  ['reconciled', 'active'],
  ['active', 'refunded'],
] as const satisfies readonly (readonly [CommitmentLifecycleState, CommitmentLifecycleState])[]

describe('CommitmentLifecycleStateSchema', () => {
  it('parses every known commitment lifecycle state', () => {
    for (const state of COMMITMENT_LIFECYCLE_STATES) {
      expect(CommitmentLifecycleStateSchema.parse(state)).toBe(state)
    }
  })

  it('rejects unknown commitment lifecycle states', () => {
    expect(CommitmentLifecycleStateSchema.safeParse('funded').success).toBe(false)
  })
})

describe('commitment lifecycle helpers', () => {
  it('allows explicit transitions', () => {
    for (const [from, to] of allowedTransitions) {
      expect(canTransitionCommitmentLifecycle(from, to)).toBe(true)
    }
  })

  it('rejects skipped, reverse, and same-state transitions', () => {
    expect(canTransitionCommitmentLifecycle('approved', 'wire_received')).toBe(false)
    expect(canTransitionCommitmentLifecycle('wire_matched', 'wire_received')).toBe(false)

    for (const state of COMMITMENT_LIFECYCLE_STATES) {
      expect(canTransitionCommitmentLifecycle(state, state)).toBe(false)
    }
  })

  it('identifies terminal states without treating active as terminal', () => {
    expect(isTerminalCommitmentLifecycleState('rejected')).toBe(true)
    expect(isTerminalCommitmentLifecycleState('withdrawn')).toBe(true)
    expect(isTerminalCommitmentLifecycleState('cancelled')).toBe(true)
    expect(isTerminalCommitmentLifecycleState('refunded')).toBe(true)
    expect(isTerminalCommitmentLifecycleState('active')).toBe(false)
  })

  it('provides labels and semantic tones for every state', () => {
    for (const state of COMMITMENT_LIFECYCLE_STATES) {
      expect(getCommitmentLifecycleLabel(state)).not.toHaveLength(0)
      expect(getCommitmentLifecycleTone(state)).not.toHaveLength(0)
    }

    expect(getCommitmentLifecycleTone('wire_received')).toBe('attention')
    expect(getCommitmentLifecycleTone('rejected')).toBe('danger')
  })

  it('requires explicit operational inputs before treating a commitment as active', () => {
    expect(
      isCommitmentOperationallyActive({
        lifecycleState: 'active',
        reconciliationComplete: false,
        signatureComplete: false,
        wireMatchedOrReconciled: false,
      }),
    ).toBe(false)
    expect(
      isCommitmentOperationallyActive({
        lifecycleState: 'signed',
        reconciliationComplete: false,
        signatureComplete: true,
        wireMatchedOrReconciled: false,
      }),
    ).toBe(false)
    expect(
      isCommitmentOperationallyActive({
        lifecycleState: 'wire_matched',
        reconciliationComplete: false,
        signatureComplete: true,
        wireMatchedOrReconciled: true,
      }),
    ).toBe(false)
    expect(
      isCommitmentOperationallyActive({
        lifecycleState: 'reconciled',
        reconciliationComplete: true,
        signatureComplete: true,
        wireMatchedOrReconciled: true,
      }),
    ).toBe(true)
  })
})
