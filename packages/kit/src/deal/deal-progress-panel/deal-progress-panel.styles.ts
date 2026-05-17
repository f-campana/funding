import type { StatusTone } from '@repo/domain'

import type {
  DealProgressDataQuality,
  DealProgressMetric,
  DealProgressSegmentKind,
  DealProgressSegmentTone,
} from './deal-progress-panel.types'

export const segmentKindClasses = {
  entryFees: 'bg-command-segment-entry-fees',
  investable: 'bg-command-segment-investable',
  spvFees: 'bg-command-segment-spv-fees',
} as const satisfies Record<DealProgressSegmentKind, string>

export const commandStatusToneClasses = {
  attention:
    'border-command-segment-spv-fees/70 bg-command-progress-muted text-command-segment-spv-fees',
  danger: 'border-status-danger-border/70 bg-command-progress-muted text-status-danger-border',
  info: 'border-command-segment-entry-fees/70 bg-command-progress-muted text-command-segment-entry-fees',
  neutral: 'border-command-border bg-command-muted text-command-foreground/75',
  pending:
    'border-command-segment-neutral/60 bg-command-progress-muted text-command-segment-neutral',
  success: 'border-command-progress/70 bg-command-progress-muted text-command-progress',
} as const satisfies Record<StatusTone, string>

export const metricToneClasses = {
  attention: 'text-status-attention',
  danger: 'text-status-danger',
  default: 'text-command-foreground',
  neutral: 'text-command-foreground/80',
} as const satisfies Record<NonNullable<DealProgressMetric['tone']>, string>

export const dataQualityClasses = {
  fresh: 'border-command-border bg-command-muted text-command-foreground/70',
  issue: 'border-status-danger-border/60 bg-status-danger-muted text-status-danger',
  stale: 'border-status-attention-border/60 bg-status-attention-muted text-status-attention',
  unavailable: 'border-command-border bg-command-muted text-command-foreground/70',
} as const satisfies Record<DealProgressDataQuality['kind'], string>

export const getSegmentClassName = ({
  kind,
  tone,
}: {
  readonly kind: DealProgressSegmentKind
  readonly tone: DealProgressSegmentTone
}) => (tone === 'neutral' ? 'bg-command-segment-neutral' : segmentKindClasses[kind])
