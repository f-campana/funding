import type { DealSummaryDTO } from '@/server/deals'

import { formatDateTimeLabel } from './deal-operational-formatting'

export const getDealHeaderViewModel = (deal: DealSummaryDTO) => ({
  description: `${deal.companyName} closing operations for ${deal.vehicle.name} in ${deal.vehicle.jurisdiction}.`,
  lastUpdatedLabel: formatDateTimeLabel(deal.lastUpdatedAt),
  statusLabel: deal.stageLabel,
  targetCloseDateLabel: formatDateTimeLabel(deal.targetCloseDate),
  title: deal.name,
  vehicleLabel: `${deal.vehicle.name} - ${deal.vehicle.jurisdiction}`,
})
