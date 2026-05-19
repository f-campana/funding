import { getDocumentEvidenceStatusTone } from '../../status/document-status'
import { statusToneClasses } from '../../status/status-tone'
import { commitmentReadinessKeys } from '../commitment-readiness.types'
import type {
  DealCommitmentBlockerSeverity,
  DealCommitmentInspectorState,
  DealCommitmentInspectorTone,
  DealCommitmentReadinessItem,
} from './deal-commitment-inspector.types'

export const commitmentInspectorReadinessKeys = commitmentReadinessKeys

export const inspectorToneBadgeClasses = statusToneClasses satisfies Record<
  DealCommitmentInspectorTone,
  string
>

export const inspectorToneDotClasses = {
  attention: 'bg-status-attention',
  danger: 'bg-status-danger',
  info: 'bg-status-info',
  neutral: 'bg-muted-foreground',
  pending: 'bg-status-pending',
  success: 'bg-status-success',
} as const satisfies Record<DealCommitmentInspectorTone, string>

export const blockerSeverityToneClasses = {
  critical: inspectorToneBadgeClasses.danger,
  info: inspectorToneBadgeClasses.info,
  warning: inspectorToneBadgeClasses.attention,
} as const satisfies Record<DealCommitmentBlockerSeverity, string>

export const getCommitmentInspectorTone = (
  state: DealCommitmentInspectorState,
): DealCommitmentInspectorTone => (state.kind === 'ready' ? state.investor.status.tone : 'neutral')

export { getDocumentEvidenceStatusTone }

export const getCommitmentInspectorReadinessTone = (
  item: DealCommitmentReadinessItem,
): DealCommitmentInspectorTone => {
  switch (item.key) {
    case 'kycKyb':
      return kycKybInspectorReadinessToneByVariant[item.variant]
    case 'signature':
      return signatureInspectorReadinessToneByVariant[item.variant]
    case 'wire':
      return wireInspectorReadinessToneByVariant[item.variant]
    case 'reconciliation':
      return reconciliationInspectorReadinessToneByVariant[item.variant]
  }
}

const kycKybInspectorReadinessToneByVariant = {
  expired: 'danger',
  inReview: 'attention',
  unavailable: 'neutral',
  verified: 'success',
} as const satisfies Record<
  DealCommitmentReadinessItem<'kycKyb'>['variant'],
  DealCommitmentInspectorTone
>

const signatureInspectorReadinessToneByVariant = {
  pending: 'info',
  signed: 'success',
  unavailable: 'neutral',
} as const satisfies Record<
  DealCommitmentReadinessItem<'signature'>['variant'],
  DealCommitmentInspectorTone
>

const wireInspectorReadinessToneByVariant = {
  notReceived: 'pending',
  pending: 'attention',
  received: 'success',
  syncFailed: 'danger',
} as const satisfies Record<
  DealCommitmentReadinessItem<'wire'>['variant'],
  DealCommitmentInspectorTone
>

const reconciliationInspectorReadinessToneByVariant = {
  needsReview: 'danger',
  notStarted: 'neutral',
  pending: 'pending',
  reconciled: 'success',
  reconciling: 'info',
} as const satisfies Record<
  DealCommitmentReadinessItem<'reconciliation'>['variant'],
  DealCommitmentInspectorTone
>
