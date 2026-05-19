import type {
  CommitmentReadinessState,
  CommitmentReadinessTone,
  CommitmentReadinessVariantByKey,
} from './commitment-readiness.types'

const kycKybReadinessToneByVariant = {
  expired: 'danger',
  inReview: 'info',
  unavailable: 'neutral',
  verified: 'success',
} as const satisfies Record<CommitmentReadinessVariantByKey['kycKyb'], CommitmentReadinessTone>

const signatureReadinessToneByVariant = {
  pending: 'attention',
  signed: 'success',
  unavailable: 'neutral',
} as const satisfies Record<CommitmentReadinessVariantByKey['signature'], CommitmentReadinessTone>

const wireReadinessToneByVariant = {
  notReceived: 'neutral',
  pending: 'attention',
  received: 'success',
  syncFailed: 'danger',
} as const satisfies Record<CommitmentReadinessVariantByKey['wire'], CommitmentReadinessTone>

const reconciliationReadinessToneByVariant = {
  needsReview: 'danger',
  notStarted: 'neutral',
  pending: 'attention',
  reconciled: 'success',
  reconciling: 'info',
} as const satisfies Record<
  CommitmentReadinessVariantByKey['reconciliation'],
  CommitmentReadinessTone
>

const kycKybReadinessNeedsAttentionByVariant = {
  expired: true,
  inReview: false,
  unavailable: false,
  verified: false,
} as const satisfies Record<CommitmentReadinessVariantByKey['kycKyb'], boolean>

const signatureReadinessNeedsAttentionByVariant = {
  pending: true,
  signed: false,
  unavailable: false,
} as const satisfies Record<CommitmentReadinessVariantByKey['signature'], boolean>

const wireReadinessNeedsAttentionByVariant = {
  notReceived: false,
  pending: true,
  received: false,
  syncFailed: true,
} as const satisfies Record<CommitmentReadinessVariantByKey['wire'], boolean>

const reconciliationReadinessNeedsAttentionByVariant = {
  needsReview: true,
  notStarted: false,
  pending: true,
  reconciled: false,
  reconciling: false,
} as const satisfies Record<CommitmentReadinessVariantByKey['reconciliation'], boolean>

export const getCommitmentReadinessTone = (
  state: CommitmentReadinessState,
): CommitmentReadinessTone => {
  switch (state.key) {
    case 'kycKyb':
      return kycKybReadinessToneByVariant[state.variant]
    case 'signature':
      return signatureReadinessToneByVariant[state.variant]
    case 'wire':
      return wireReadinessToneByVariant[state.variant]
    case 'reconciliation':
      return reconciliationReadinessToneByVariant[state.variant]
  }
}

export const commitmentReadinessNeedsAttention = (state: CommitmentReadinessState): boolean => {
  switch (state.key) {
    case 'kycKyb':
      return kycKybReadinessNeedsAttentionByVariant[state.variant]
    case 'signature':
      return signatureReadinessNeedsAttentionByVariant[state.variant]
    case 'wire':
      return wireReadinessNeedsAttentionByVariant[state.variant]
    case 'reconciliation':
      return reconciliationReadinessNeedsAttentionByVariant[state.variant]
  }
}
