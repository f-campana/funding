const dealOperationsRouteData = {
  deal: {
    closingReviewDateLabel: 'Rebuild paused',
    description:
      'Temporary workspace shell while the deal experience is rebuilt from accepted kit baselines.',
    id: 'northstar-energy',
    lastUpdatedLabel: 'Static shell',
    statusLabel: 'Rebuild in progress',
    title: 'Northstar Energy SPV',
    vehicleLabel: 'SPV',
  },
} as const

export type DealOperationsRouteData = typeof dealOperationsRouteData

export function isSupportedDealId(dealId: string): boolean {
  return dealId === dealOperationsRouteData.deal.id
}

export function getDealOperationsData(dealId: string): DealOperationsRouteData | null {
  return isSupportedDealId(dealId) ? dealOperationsRouteData : null
}
