import 'server-only'

import {
  type DealOperationalCenterDTO,
  GetOperationalCenterInputSchema,
  getDealOperationalCenter,
} from '@/server/deals'

export type DealOperationsRouteData = DealOperationalCenterDTO

export function isSupportedDealId(dealId: string): boolean {
  return getDealOperationsData(dealId) !== null
}

export function normalizeDealId(dealId: string): string | null {
  const parsed = GetOperationalCenterInputSchema.safeParse({ dealId })

  if (!parsed.success) {
    return null
  }

  return parsed.data.dealId
}

export function getDealOperationsData(dealId: string): DealOperationsRouteData | null {
  const normalizedDealId = normalizeDealId(dealId)

  if (normalizedDealId === null) {
    return null
  }

  const result = getDealOperationalCenter({ dealId: normalizedDealId })

  if (result.isOk()) {
    return result.value
  }

  if (result.error._tag === 'UnsupportedDeal') {
    return null
  }

  throw new Error(`Unable to load deal operational center: ${result.error._tag}`)
}
