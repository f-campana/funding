import { describe, expect, it } from 'vitest'

import {
  COMMITMENT_LIFECYCLE_STATES,
  type CommitmentLifecycleState,
  CommitmentLifecycleStateSchema,
  CommitmentOperationalActivityInputSchema,
  canTransitionCommitmentLifecycle,
  getCommitmentLifecycleLabel,
  getCommitmentLifecycleTone,
  isCommitmentOperationallyActive,
  isTerminalCommitmentLifecycleState,
} from './commitment-lifecycle'

const allowedTransitions = [
  ['draft', 'submitted'],
  ['draft', 'cancelled'],
  ['submitted', 'pending_review'],
  ['submitted', 'withdrawn'],
  ['submitted', 'cancelled'],
  ['pending_review', 'approved'],
  ['pending_review', 'rejected'],
  ['pending_review', 'withdrawn'],
  ['approved', 'contracting'],
  ['approved', 'cancelled'],
  ['contracting', 'signature_sent'],
  ['contracting', 'cancelled'],
  ['signature_sent', 'part_signed'],
  ['signature_sent', 'signed'],
  ['signature_sent', 'cancelled'],
  ['part_signed', 'signed'],
  ['part_signed', 'cancelled'],
  ['signed', 'wire_instructions_sent'],
  ['signed', 'cancelled'],
  ['wire_instructions_sent', 'wire_pending'],
  ['wire_instructions_sent', 'cancelled'],
  ['wire_pending', 'wire_received'],
  ['wire_pending', 'cancelled'],
  ['wire_received', 'wire_matched'],
  ['wire_received', 'refunded'],
  ['wire_matched', 'reconciled'],
  ['wire_matched', 'refunded'],
  ['reconciled', 'active'],
  ['reconciled', 'refunded'],
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

describe('CommitmentOperationalActivityInputSchema', () => {
  it('parses raw activity input before operational helpers run', () => {
    const parsed = CommitmentOperationalActivityInputSchema.parse({
      lifecycleState: 'reconciled',
      reconciliationComplete: true,
      signatureComplete: true,
      wireMatchedOrReconciled: true,
    })

    expect(isCommitmentOperationallyActive(parsed)).toBe(true)
  })

  it('rejects invalid lifecycle state and non-boolean flags', () => {
    expect(
      CommitmentOperationalActivityInputSchema.safeParse({
        lifecycleState: 'funded',
        reconciliationComplete: true,
        signatureComplete: true,
        wireMatchedOrReconciled: true,
      }).success,
    ).toBe(false)
    expect(
      CommitmentOperationalActivityInputSchema.safeParse({
        lifecycleState: 'reconciled',
        reconciliationComplete: 'yes',
        signatureComplete: true,
        wireMatchedOrReconciled: true,
      }).success,
    ).toBe(false)
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

  it('has explicit behavior for every possible transition pair', () => {
    const explicitPairs = new Set(allowedTransitions.map(([from, to]) => `${from}:${to}`))

    for (const from of COMMITMENT_LIFECYCLE_STATES) {
      for (const to of COMMITMENT_LIFECYCLE_STATES) {
        expect(canTransitionCommitmentLifecycle(from, to)).toBe(explicitPairs.has(`${from}:${to}`))
      }
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
