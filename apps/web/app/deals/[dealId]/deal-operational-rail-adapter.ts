import type { DealOperationalCenterDTO } from '@/server/deals'

import {
  getBlockedInvestorCount,
  getRequiredDocumentIssueCount,
  getUnresolvedBlockerCounts,
} from './deal-operational-blocker-helpers'
import { formatDateTimeLabel, formatMoney } from './deal-operational-formatting'
import { getReadinessLabel } from './deal-operational-labels'

export const getDealOperationalRailViewModel = (data: DealOperationalCenterDTO) => {
  const blockerCounts = getUnresolvedBlockerCounts(data)

  return {
    blockedInvestorCountLabel: String(getBlockedInvestorCount(data)),
    capitalCalloutLabel: 'Net investable after fees',
    capitalCalloutValueLabel: formatMoney(data.capital.economics.netInvestableAmount),
    criticalBlockerCountLabel: String(blockerCounts.critical),
    documentIssueCountLabel: String(getRequiredDocumentIssueCount(data)),
    readinessLabel: getReadinessLabel(data.readiness.state),
    targetCloseDateLabel: formatDateTimeLabel(data.deal.targetCloseDate),
    warningBlockerCountLabel: String(blockerCounts.warning),
  }
}
