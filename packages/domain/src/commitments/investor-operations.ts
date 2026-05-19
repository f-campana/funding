import { Result } from '@repo/core'
import { z } from 'zod'
import type { EuroCents } from '../money'
import { euroCentsFromNumberMinorUnits } from '../money'
import type { StatusTone } from '../status-tone'
import {
  type CommitmentLifecycleState,
  CommitmentLifecycleStateSchema,
} from './commitment-lifecycle'

export const KYC_OPERATIONAL_STATUSES = [
  'not_started',
  'in_progress',
  'pending_review',
  'approved',
  'rejected',
  'expired',
  'blocked',
] as const
export type KycOperationalStatus = (typeof KYC_OPERATIONAL_STATUSES)[number]
export type KybOperationalStatus = KycOperationalStatus

export const SIGNATURE_OPERATIONAL_STATUSES = [
  'not_sent',
  'prepared',
  'sent',
  'viewed',
  'part_signed',
  'completed',
  'declined',
  'expired',
  'failed',
] as const
export type SignatureOperationalStatus = (typeof SIGNATURE_OPERATIONAL_STATUSES)[number]

export const WIRE_OPERATIONAL_STATUSES = [
  'not_requested',
  'instructions_sent',
  'pending',
  'received',
  'under_review',
  'matched',
  'partially_matched',
  'unmatched',
  'reconciled',
  'returned',
  'failed',
] as const
export type WireOperationalStatus = (typeof WIRE_OPERATIONAL_STATUSES)[number]

export type InvestorOperationsRecord = {
  readonly id: string
  readonly investorName: string
  readonly investorEmail?: string
  readonly legalEntityName?: string
  readonly commitmentAmountCents: EuroCents
  readonly commitmentStatus: CommitmentLifecycleState
  readonly kycStatus: KycOperationalStatus
  readonly kybStatus?: KybOperationalStatus
  readonly signatureStatus: SignatureOperationalStatus
  readonly wireStatus: WireOperationalStatus
  readonly blockerIds: readonly string[]
  readonly lastActivityAt?: string
}

export type CommitmentOperationalSnapshot = Pick<
  InvestorOperationsRecord,
  'commitmentStatus' | 'signatureStatus' | 'wireStatus'
>

export type CommitmentOperationalSnapshotError =
  | {
      readonly _tag: 'SignatureLifecycleMismatch'
      readonly message: string
    }
  | {
      readonly _tag: 'WireLifecycleMismatch'
      readonly message: string
    }

export const KycOperationalStatusSchema = z.enum(KYC_OPERATIONAL_STATUSES)
export const KybOperationalStatusSchema = KycOperationalStatusSchema
export const SignatureOperationalStatusSchema = z.enum(SIGNATURE_OPERATIONAL_STATUSES)
export const WireOperationalStatusSchema = z.enum(WIRE_OPERATIONAL_STATUSES)

const euroCentsJsonSchema = z
  .number({ error: 'money.InvalidFormat' })
  .int({ error: 'money.InvalidFormat' })
  .safe({ error: 'money.UnsafeNumber' })
  .nonnegative({ error: 'money.NegativeAmount' })
  .transform((value, ctx) => {
    const result = euroCentsFromNumberMinorUnits(value)

    /* v8 ignore next 7 -- the preceding Zod checks keep this defensive guard unreachable. */
    if (result.isError()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error._tag,
      })

      return z.NEVER
    }

    return result.value
  })

const RequiredTrimmedStringSchema = z
  .string()
  .trim()
  .min(1, { error: 'investorOperations.text.required' })

export const InvestorOperationsRecordSchema = z.object({
  blockerIds: z.array(RequiredTrimmedStringSchema).readonly(),
  commitmentAmountCents: euroCentsJsonSchema,
  commitmentStatus: CommitmentLifecycleStateSchema,
  id: RequiredTrimmedStringSchema,
  investorEmail: z.email({ error: 'investorOperations.email.invalid' }).optional(),
  investorName: RequiredTrimmedStringSchema,
  kybStatus: KybOperationalStatusSchema.optional(),
  kycStatus: KycOperationalStatusSchema,
  lastActivityAt: z.iso.datetime({ error: 'investorOperations.lastActivityAt.invalid' }).optional(),
  legalEntityName: RequiredTrimmedStringSchema.optional(),
  signatureStatus: SignatureOperationalStatusSchema,
  wireStatus: WireOperationalStatusSchema,
})

const KYC_OPERATIONAL_STATUS_LABELS = {
  approved: 'Approved',
  blocked: 'Blocked',
  expired: 'Expired',
  in_progress: 'In progress',
  not_started: 'Not started',
  pending_review: 'Pending review',
  rejected: 'Rejected',
} as const satisfies Record<KycOperationalStatus, string>

const SIGNATURE_OPERATIONAL_STATUS_LABELS = {
  completed: 'Completed',
  declined: 'Declined',
  expired: 'Expired',
  failed: 'Failed',
  not_sent: 'Not sent',
  part_signed: 'Part signed',
  prepared: 'Prepared',
  sent: 'Sent',
  viewed: 'Viewed',
} as const satisfies Record<SignatureOperationalStatus, string>

const WIRE_OPERATIONAL_STATUS_LABELS = {
  failed: 'Failed',
  instructions_sent: 'Instructions sent',
  matched: 'Matched',
  not_requested: 'Not requested',
  partially_matched: 'Partially matched',
  pending: 'Pending',
  received: 'Received',
  reconciled: 'Reconciled',
  returned: 'Returned',
  under_review: 'Under review',
  unmatched: 'Unmatched',
} as const satisfies Record<WireOperationalStatus, string>

const KYC_OPERATIONAL_STATUS_TONES = {
  approved: 'success',
  blocked: 'danger',
  expired: 'danger',
  in_progress: 'pending',
  not_started: 'neutral',
  pending_review: 'pending',
  rejected: 'danger',
} as const satisfies Record<KycOperationalStatus, StatusTone>

const SIGNATURE_OPERATIONAL_STATUS_TONES = {
  completed: 'success',
  declined: 'danger',
  expired: 'danger',
  failed: 'danger',
  not_sent: 'neutral',
  part_signed: 'attention',
  prepared: 'pending',
  sent: 'pending',
  viewed: 'info',
} as const satisfies Record<SignatureOperationalStatus, StatusTone>

const WIRE_OPERATIONAL_STATUS_TONES = {
  failed: 'danger',
  instructions_sent: 'pending',
  matched: 'success',
  not_requested: 'neutral',
  partially_matched: 'attention',
  pending: 'pending',
  received: 'attention',
  reconciled: 'success',
  returned: 'danger',
  under_review: 'pending',
  unmatched: 'danger',
} as const satisfies Record<WireOperationalStatus, StatusTone>

export const getKycOperationalStatusLabel = (status: KycOperationalStatus): string =>
  KYC_OPERATIONAL_STATUS_LABELS[status]

export const getKybOperationalStatusLabel = (status: KybOperationalStatus): string =>
  KYC_OPERATIONAL_STATUS_LABELS[status]

export const getSignatureOperationalStatusLabel = (status: SignatureOperationalStatus): string =>
  SIGNATURE_OPERATIONAL_STATUS_LABELS[status]

export const getWireOperationalStatusLabel = (status: WireOperationalStatus): string =>
  WIRE_OPERATIONAL_STATUS_LABELS[status]

export const getKycOperationalStatusTone = (status: KycOperationalStatus): StatusTone =>
  KYC_OPERATIONAL_STATUS_TONES[status]

export const getKybOperationalStatusTone = (status: KybOperationalStatus): StatusTone =>
  KYC_OPERATIONAL_STATUS_TONES[status]

export const getSignatureOperationalStatusTone = (status: SignatureOperationalStatus): StatusTone =>
  SIGNATURE_OPERATIONAL_STATUS_TONES[status]

export const getWireOperationalStatusTone = (status: WireOperationalStatus): StatusTone =>
  WIRE_OPERATIONAL_STATUS_TONES[status]

export const validateCommitmentOperationalSnapshot = <
  Snapshot extends CommitmentOperationalSnapshot,
>(
  snapshot: Snapshot,
): Result<Snapshot, CommitmentOperationalSnapshotError> => {
  const signatureError = validateSignatureLifecycle(snapshot)

  if (signatureError !== null) {
    return Result.Error(signatureError)
  }

  const wireError = validateWireLifecycle(snapshot)

  if (wireError !== null) {
    return Result.Error(wireError)
  }

  return Result.Ok(snapshot)
}

const validateSignatureLifecycle = (
  snapshot: CommitmentOperationalSnapshot,
): CommitmentOperationalSnapshotError | null => {
  if (snapshot.commitmentStatus === 'signature_sent' && snapshot.signatureStatus === 'not_sent') {
    return {
      _tag: 'SignatureLifecycleMismatch',
      message: 'signature_sent commitment requires signature delivery to have started',
    }
  }

  if (snapshot.commitmentStatus === 'part_signed' && snapshot.signatureStatus === 'not_sent') {
    return {
      _tag: 'SignatureLifecycleMismatch',
      message: 'part_signed commitment requires signature progress',
    }
  }

  if (
    SIGNED_OR_LATER_COMMITMENT_STATUSES.some((status) => status === snapshot.commitmentStatus) &&
    snapshot.signatureStatus !== 'completed'
  ) {
    return {
      _tag: 'SignatureLifecycleMismatch',
      message: `${snapshot.commitmentStatus} commitment requires completed signature status`,
    }
  }

  return null
}

const validateWireLifecycle = (
  snapshot: CommitmentOperationalSnapshot,
): CommitmentOperationalSnapshotError | null => {
  if (
    WIRE_REQUESTED_OR_LATER_COMMITMENT_STATUSES.some(
      (status) => status === snapshot.commitmentStatus,
    ) &&
    snapshot.wireStatus === 'not_requested'
  ) {
    return {
      _tag: 'WireLifecycleMismatch',
      message: `${snapshot.commitmentStatus} commitment requires wire instructions or later wire status`,
    }
  }

  if (
    WIRE_RECEIVED_OR_LATER_COMMITMENT_STATUSES.some(
      (status) => status === snapshot.commitmentStatus,
    ) &&
    (snapshot.wireStatus === 'not_requested' ||
      snapshot.wireStatus === 'instructions_sent' ||
      snapshot.wireStatus === 'pending')
  ) {
    return {
      _tag: 'WireLifecycleMismatch',
      message: `${snapshot.commitmentStatus} commitment requires received funds or later wire status`,
    }
  }

  if (
    (snapshot.commitmentStatus === 'reconciled' || snapshot.commitmentStatus === 'active') &&
    snapshot.wireStatus !== 'reconciled'
  ) {
    return {
      _tag: 'WireLifecycleMismatch',
      message: `${snapshot.commitmentStatus} commitment requires reconciled wire status`,
    }
  }

  return null
}

const SIGNED_OR_LATER_COMMITMENT_STATUSES = [
  'signed',
  'wire_instructions_sent',
  'wire_pending',
  'wire_received',
  'wire_matched',
  'reconciled',
  'active',
  'refunded',
] as const satisfies readonly CommitmentLifecycleState[]

const WIRE_REQUESTED_OR_LATER_COMMITMENT_STATUSES = [
  'wire_instructions_sent',
  'wire_pending',
  'wire_received',
  'wire_matched',
  'reconciled',
  'active',
  'refunded',
] as const satisfies readonly CommitmentLifecycleState[]

const WIRE_RECEIVED_OR_LATER_COMMITMENT_STATUSES = [
  'wire_received',
  'wire_matched',
  'reconciled',
  'active',
  'refunded',
] as const satisfies readonly CommitmentLifecycleState[]
