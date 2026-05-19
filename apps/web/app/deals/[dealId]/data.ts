import 'server-only'

import { Result } from '@repo/core'
import { fromZod } from '@repo/core/adapters/zod'

import {
  type DealOperationalCenterDTO,
  type GetDealOperationalCenterError,
  GetOperationalCenterInputSchema,
  getDealOperationalCenter,
} from '@/server/deals'

export type DealOperationsRouteData = DealOperationalCenterDTO

export type InvalidDealRouteParamError = {
  readonly _tag: 'InvalidDealRouteParam'
  readonly dealId: string
}

export type DealOperationsRouteDataError =
  | InvalidDealRouteParamError
  | GetDealOperationalCenterError

export function isSupportedDealId(dealId: string): boolean {
  return getDealOperationsData(dealId).isOk()
}

export function normalizeDealId(dealId: string): Result<string, InvalidDealRouteParamError> {
  return fromZod(GetOperationalCenterInputSchema, { dealId })
    .map((input) => input.dealId)
    .mapError(() => ({
      _tag: 'InvalidDealRouteParam',
      dealId,
    }))
}

export function getDealOperationsData(
  dealId: string,
): Result<DealOperationsRouteData, DealOperationsRouteDataError> {
  const normalizedDealId = normalizeDealId(dealId)

  if (normalizedDealId.isError()) {
    return Result.Error(normalizedDealId.error)
  }

  return getDealOperationalCenter({ dealId: normalizedDealId.value }).mapError(
    (error): DealOperationsRouteDataError => error,
  )
}

export const isDealOperationsRouteNotFoundError = (error: DealOperationsRouteDataError): boolean =>
  error._tag === 'InvalidDealRouteParam' || error._tag === 'UnsupportedDeal'

export const dealOperationsRouteDataError = (error: DealOperationsRouteDataError): Error =>
  new Error(`Unable to load deal operational center: ${error._tag}`)
