import type {
  DealCommitmentBlockerSeverity,
  DealCommitmentInspectorState,
  DealCommitmentInspectorTone,
  DealCommitmentReadinessKey,
} from './deal-commitment-inspector.types'

export const commitmentInspectorReadinessKeys = [
  'kycKyb',
  'signature',
  'wire',
  'reconciliation',
] as const satisfies readonly DealCommitmentReadinessKey[]

export const inspectorToneBadgeClasses = {
  attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  danger: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  info: 'border-status-info-border bg-status-info-muted text-status-info',
  neutral: 'border-border bg-muted text-muted-foreground',
  pending: 'border-status-pending-border bg-status-pending-muted text-status-pending',
  success: 'border-status-success-border bg-status-success-muted text-status-success',
} as const satisfies Record<DealCommitmentInspectorTone, string>

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
