import type { DealOperationalActivityItem } from '@repo/kit/deal-operational-overview'

import type { DealOperationalCenterDTO } from '@/server/deals'

import { formatDateTimeLabel } from './deal-operational-formatting'
import { activityTone, activityTypeLabel } from './deal-operational-labels'

export const mapOperationalActivity = (
  activity: DealOperationalCenterDTO['activity'][number],
): DealOperationalActivityItem => ({
  actor: activity.actorLabel,
  dateTime: activity.occurredAt,
  id: activity.id,
  summary: activity.summary,
  timestampLabel: formatDateTimeLabel(activity.occurredAt),
  tone: activityTone(activity.eventType),
  typeLabel: activityTypeLabel(activity.eventType),
})
