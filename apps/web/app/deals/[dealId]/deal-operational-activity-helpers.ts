import type { DealOperationalActivityItem } from '@repo/kit/deal-operational-overview'

import type { DealOperationalCenterDTO } from '@/server/deals'

import {
  getActivityTypeLabel,
  getOperationalActivityTone,
} from './deal-operational-activity-metadata'
import { formatDateTimeLabel } from './deal-operational-formatting'

export const mapOperationalActivity = (
  activity: DealOperationalCenterDTO['activity'][number],
): DealOperationalActivityItem => ({
  actor: activity.actorLabel,
  dateTime: activity.occurredAt,
  id: activity.id,
  summary: activity.summary,
  timestampLabel: formatDateTimeLabel(activity.occurredAt),
  tone: getOperationalActivityTone(activity.eventType),
  typeLabel: getActivityTypeLabel(activity.eventType),
})
