import type {
  DealOperationalActivityTone,
  DealOperationalReadinessState,
} from '@repo/kit/deal-operational-overview'
import type { DealProgressStatus } from '@repo/kit/deal-progress-panel'

import type { ClosingReadinessDTO, DealOperationalCenterDTO } from '@/server/deals'

type DealProgressStatusTone = DealProgressStatus['tone']

const READINESS_LABELS = {
  attention: 'Attention needed',
  blocked: 'Blocked',
  not_started: 'Not started',
  ready: 'Ready',
} as const satisfies Record<ClosingReadinessDTO['state'], string>

const OPERATIONAL_READINESS_LABELS = {
  attention: 'Attention needed',
  blocked: 'Blocked from close',
  not_started: 'Readiness not started',
  ready: 'Ready to close',
} as const satisfies Record<DealOperationalReadinessState, string>

const READINESS_NEXT_ACTION_LABELS = {
  attention: 'Review operational exceptions before close',
  blocked: 'Resolve blocking operational exceptions before close',
  not_started: 'Start operational readiness review',
  ready: 'Proceed to closing review',
} as const satisfies Record<ClosingReadinessDTO['state'], string>

export const getReadinessLabel = (state: ClosingReadinessDTO['state']): string =>
  READINESS_LABELS[state]

export const getOperationalReadinessLabel = (state: DealOperationalReadinessState): string =>
  OPERATIONAL_READINESS_LABELS[state]

export const getReadinessNextActionLabel = (state: ClosingReadinessDTO['state']): string =>
  READINESS_NEXT_ACTION_LABELS[state]

export const readinessTone = (state: ClosingReadinessDTO['state']): DealProgressStatusTone =>
  (
    ({
      attention: 'attention',
      blocked: 'danger',
      not_started: 'neutral',
      ready: 'success',
    }) as const satisfies Record<ClosingReadinessDTO['state'], DealProgressStatusTone>
  )[state]

export const severityLabel = (
  severity: DealOperationalCenterDTO['blockers'][number]['severity'],
): string =>
  ({
    critical: 'Critical',
    info: 'Info',
    warning: 'Warning',
  })[severity]

export const ownerLabel = (owner: string): string =>
  owner
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const blockerSurfaceLabel = (
  type: DealOperationalCenterDTO['blockers'][number]['type'],
): string =>
  ({
    allocation: 'Capital allocation',
    compliance: 'Compliance',
    deadline: 'Closing readiness',
    document: 'Document operations',
    kyb: 'Investor identity',
    kyc: 'Investor identity',
    reconciliation: 'Capital reconciliation',
    signature: 'Signatures',
    wire: 'Wire operations',
  })[type]

export const activityTypeLabel = (
  eventType: DealOperationalCenterDTO['activity'][number]['eventType'],
): string =>
  ({
    blocker_created: 'Blockers',
    blocker_resolved: 'Blockers',
    commitment_updated: 'Commitments',
    document_rejected: 'Documents',
    document_uploaded: 'Documents',
    signature_completed: 'Signatures',
    signature_sent: 'Signatures',
    wire_flagged: 'Wires',
    wire_matched: 'Wires',
  })[eventType]

export const activityTone = (
  eventType: DealOperationalCenterDTO['activity'][number]['eventType'],
): DealOperationalActivityTone =>
  (
    ({
      blocker_created: 'attention',
      blocker_resolved: 'success',
      commitment_updated: 'neutral',
      document_rejected: 'attention',
      document_uploaded: 'info',
      signature_completed: 'success',
      signature_sent: 'info',
      wire_flagged: 'attention',
      wire_matched: 'success',
    }) as const satisfies Record<
      DealOperationalCenterDTO['activity'][number]['eventType'],
      DealOperationalActivityTone
    >
  )[eventType]
