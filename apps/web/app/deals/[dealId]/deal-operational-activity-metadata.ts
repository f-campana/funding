import type { DealCommitmentInspectorTone } from '@repo/kit/deal-commitment-inspector'
import type { DealOperationalActivityTone } from '@repo/kit/deal-operational-overview'

import type { DealOperationalCenterDTO } from '@/server/deals'

type ActivityEventType = DealOperationalCenterDTO['activity'][number]['eventType']
type BaseActivityTone = Extract<DealOperationalActivityTone, DealCommitmentInspectorTone>

const activityMetadata = {
  blocker_created: { label: 'Blockers', tone: 'attention' },
  blocker_resolved: { label: 'Blockers', tone: 'success' },
  commitment_updated: { label: 'Commitments', tone: 'neutral' },
  document_rejected: { label: 'Documents', tone: 'attention' },
  document_uploaded: { label: 'Documents', tone: 'info' },
  signature_completed: { label: 'Signatures', tone: 'success' },
  signature_sent: { label: 'Signatures', tone: 'info' },
  wire_flagged: { label: 'Wires', tone: 'attention' },
  wire_matched: { label: 'Wires', tone: 'success' },
} as const satisfies Record<
  ActivityEventType,
  {
    readonly label: string
    readonly tone: BaseActivityTone
  }
>

const commitmentInspectorToneOverrides: Partial<
  Record<ActivityEventType, DealCommitmentInspectorTone>
> = {
  commitment_updated: 'info',
}

export const getActivityTypeLabel = (eventType: ActivityEventType): string =>
  activityMetadata[eventType].label

export const getOperationalActivityTone = (
  eventType: ActivityEventType,
): DealOperationalActivityTone => activityMetadata[eventType].tone

export const getCommitmentInspectorActivityTone = (
  eventType: ActivityEventType,
): DealCommitmentInspectorTone =>
  commitmentInspectorToneOverrides[eventType] ?? activityMetadata[eventType].tone
