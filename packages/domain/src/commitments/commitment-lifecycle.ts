import { z } from 'zod'

import type { StatusTone } from '../status-tone'

export const COMMITMENT_LIFECYCLE_STATES = [
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected',
  'withdrawn',
  'contracting',
  'signature_sent',
  'part_signed',
  'signed',
  'wire_instructions_sent',
  'wire_pending',
  'wire_received',
  'wire_matched',
  'reconciled',
  'active',
  'cancelled',
  'refunded',
] as const

export type CommitmentLifecycleState = (typeof COMMITMENT_LIFECYCLE_STATES)[number]

export const CommitmentLifecycleStateSchema = z.enum(COMMITMENT_LIFECYCLE_STATES)

export type CommitmentOperationalActivityInput = {
  readonly lifecycleState: CommitmentLifecycleState
  readonly signatureComplete: boolean
  readonly wireMatchedOrReconciled: boolean
  readonly reconciliationComplete: boolean
}

const ALLOWED_TRANSITIONS = {
  active: ['refunded'],
  approved: ['contracting', 'cancelled'],
  cancelled: [],
  contracting: ['signature_sent', 'cancelled'],
  draft: ['submitted', 'cancelled'],
  part_signed: ['signed', 'cancelled'],
  pending_review: ['approved', 'rejected', 'withdrawn'],
  reconciled: ['active', 'refunded'],
  refunded: [],
  rejected: [],
  signature_sent: ['part_signed', 'signed', 'cancelled'],
  signed: ['wire_instructions_sent', 'cancelled'],
  submitted: ['pending_review', 'withdrawn', 'cancelled'],
  wire_instructions_sent: ['wire_pending', 'cancelled'],
  wire_matched: ['reconciled', 'refunded'],
  wire_pending: ['wire_received', 'cancelled'],
  wire_received: ['wire_matched', 'refunded'],
  withdrawn: [],
} as const satisfies Record<CommitmentLifecycleState, readonly CommitmentLifecycleState[]>

const TERMINAL_STATES = [
  'cancelled',
  'refunded',
  'rejected',
  'withdrawn',
] as const satisfies readonly CommitmentLifecycleState[]

const APPROVED_OR_LATER_STATES = [
  'approved',
  'contracting',
  'signature_sent',
  'part_signed',
  'signed',
  'wire_instructions_sent',
  'wire_pending',
  'wire_received',
  'wire_matched',
  'reconciled',
  'active',
] as const satisfies readonly CommitmentLifecycleState[]

const COMMITMENT_LIFECYCLE_LABELS = {
  active: 'Active',
  approved: 'Approved',
  cancelled: 'Cancelled',
  contracting: 'Contracting',
  draft: 'Draft',
  part_signed: 'Part signed',
  pending_review: 'Pending review',
  reconciled: 'Reconciled',
  refunded: 'Refunded',
  rejected: 'Rejected',
  signature_sent: 'Signature sent',
  signed: 'Signed',
  submitted: 'Submitted',
  wire_instructions_sent: 'Wire instructions sent',
  wire_matched: 'Wire matched',
  wire_pending: 'Wire pending',
  wire_received: 'Wire received',
  withdrawn: 'Withdrawn',
} as const satisfies Record<CommitmentLifecycleState, string>

const COMMITMENT_LIFECYCLE_TONES = {
  active: 'success',
  approved: 'success',
  cancelled: 'danger',
  contracting: 'pending',
  draft: 'neutral',
  part_signed: 'attention',
  pending_review: 'pending',
  reconciled: 'success',
  refunded: 'attention',
  rejected: 'danger',
  signature_sent: 'pending',
  signed: 'info',
  submitted: 'info',
  wire_instructions_sent: 'pending',
  wire_matched: 'success',
  wire_pending: 'attention',
  wire_received: 'attention',
  withdrawn: 'neutral',
} as const satisfies Record<CommitmentLifecycleState, StatusTone>

export const canTransitionCommitmentLifecycle = (
  from: CommitmentLifecycleState,
  to: CommitmentLifecycleState,
): boolean => ALLOWED_TRANSITIONS[from].some((candidate) => candidate === to)

export const isTerminalCommitmentLifecycleState = (state: CommitmentLifecycleState): boolean =>
  TERMINAL_STATES.some((candidate) => candidate === state)

export const getCommitmentLifecycleLabel = (state: CommitmentLifecycleState): string =>
  COMMITMENT_LIFECYCLE_LABELS[state]

export const getCommitmentLifecycleTone = (state: CommitmentLifecycleState): StatusTone =>
  COMMITMENT_LIFECYCLE_TONES[state]

export const isCommitmentOperationallyActive = ({
  lifecycleState,
  reconciliationComplete,
  signatureComplete,
  wireMatchedOrReconciled,
}: CommitmentOperationalActivityInput): boolean =>
  APPROVED_OR_LATER_STATES.some((candidate) => candidate === lifecycleState) &&
  signatureComplete &&
  wireMatchedOrReconciled &&
  reconciliationComplete
