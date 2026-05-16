import { type DealOperationalCenterDTO, getDealOperationalCenter } from '@/server/deals'

export type DealOperationsRouteData = DealOperationalCenterDTO

export function isSupportedDealId(dealId: string): boolean {
  return getDealOperationsData(dealId) !== null
}

export function getDealOperationsData(dealId: string): DealOperationsRouteData | null {
  const result = getDealOperationalCenter({ dealId })

  if (result.isOk()) {
    return result.value
  }

  if (result.error._tag === 'UnsupportedDeal') {
    return null
  }

  throw new Error(`Unable to load deal operational center: ${result.error._tag}`)
}
