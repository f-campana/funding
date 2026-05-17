import type {
  DealOperationalActivityTone,
  DealOperationalBlockerSeverity,
  DealOperationalMetricTone,
  DealOperationalReadinessState,
} from './deal-operational-overview.types'

export const readinessToneClasses = {
  attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  blocked: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  not_started: 'border-status-pending-border bg-status-pending-muted text-status-pending',
  ready: 'border-status-success-border bg-status-success-muted text-status-success',
} as const satisfies Record<DealOperationalReadinessState, string>

export const severityToneClasses = {
  critical: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  info: 'border-status-info-border bg-status-info-muted text-status-info',
  warning: 'border-status-attention-border bg-status-attention-muted text-status-attention',
} as const satisfies Record<DealOperationalBlockerSeverity, string>

export const metricToneClasses = {
  attention: 'text-status-attention',
  danger: 'text-status-danger',
  default: 'text-card-foreground',
  neutral: 'text-muted-foreground',
  success: 'text-status-success',
} as const satisfies Record<DealOperationalMetricTone, string>

export const activityToneClasses = {
  attention: 'bg-status-attention',
  danger: 'bg-status-danger',
  info: 'bg-status-info',
  neutral: 'bg-muted-foreground',
  success: 'bg-status-success',
} as const satisfies Record<DealOperationalActivityTone, string>
