import {
  northstarActivityItems,
  northstarCapitalSummariesByReadiness,
  northstarClosingBlockersByState,
  northstarDealFixture,
  northstarDealTerms,
  northstarDocumentCompletenessSummary,
  northstarDocumentRequirements,
  northstarDomainClosingBlockersByState,
  northstarInvestorOperationsRecords,
  northstarInvestorStatusBreakdown,
  northstarReadinessCopyByState,
} from '@repo/kit/fixtures'

const dealOperationsRouteData = {
  activityItems: northstarActivityItems,
  capitalSummariesByReadiness: northstarCapitalSummariesByReadiness,
  closingBlockersByState: northstarClosingBlockersByState,
  deal: northstarDealFixture,
  dealTerms: northstarDealTerms,
  documentCompletenessSummary: northstarDocumentCompletenessSummary,
  documentRequirements: northstarDocumentRequirements,
  domainClosingBlockersByState: northstarDomainClosingBlockersByState,
  investorOperationsRecords: northstarInvestorOperationsRecords,
  investorStatusBreakdown: northstarInvestorStatusBreakdown,
  readinessCopyByState: northstarReadinessCopyByState,
  readinessState: 'blocked',
} as const

export type DealOperationsRouteData = typeof dealOperationsRouteData

export function isSupportedDealId(dealId: string): boolean {
  return dealId === dealOperationsRouteData.deal.id
}

export function getDealOperationsData(dealId: string): DealOperationsRouteData | null {
  return isSupportedDealId(dealId) ? dealOperationsRouteData : null
}
