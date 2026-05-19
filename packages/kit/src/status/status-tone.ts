import type { StatusTone } from '@repo/domain'

export type { StatusTone } from '@repo/domain'

export const statusToneClasses = {
  attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  danger: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  info: 'border-status-info-border bg-status-info-muted text-status-info',
  neutral: 'border-border bg-muted text-muted-foreground',
  pending: 'border-status-pending-border bg-status-pending-muted text-status-pending',
  success: 'border-status-success-border bg-status-success-muted text-status-success',
} as const satisfies Record<StatusTone, string>
