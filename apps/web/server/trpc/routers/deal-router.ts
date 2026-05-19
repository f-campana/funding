import {
  type DealOperationalCenterDTO,
  type GetDealOperationalCenterError,
  type GetDealOperationalCenterOutputDTO,
  GetDealOperationalCenterOutputSchema,
  GetOperationalCenterInputSchema,
  getDealOperationalCenter,
} from '../../deals'
import { createTrpcRouter, publicProcedure } from '../init'

type GetDealOperationalCenterResult = ReturnType<typeof getDealOperationalCenter>
type GetDealOperationalCenterErrorOutput = Exclude<
  GetDealOperationalCenterOutputDTO,
  { readonly _tag: 'Ok'; readonly data: DealOperationalCenterDTO }
>

export const mapGetDealOperationalCenterResult = (
  result: GetDealOperationalCenterResult,
): GetDealOperationalCenterOutputDTO => {
  if (result.isOk()) {
    return {
      _tag: 'Ok',
      data: result.value,
    }
  }

  return mapGetDealOperationalCenterError(result.error)
}

const mapGetDealOperationalCenterError = (
  error: GetDealOperationalCenterError,
): GetDealOperationalCenterErrorOutput => {
  switch (error._tag) {
    case 'UnsupportedDeal':
      return {
        _tag: 'UnsupportedDeal',
        dealId: error.dealId,
      }
    case 'ReconciliationError':
      return {
        _tag: 'ReconciliationError',
        error: error.error,
      }
    case 'MoneySerializationError':
      return {
        _tag: 'MoneySerializationError',
        error: error.error,
      }
    case 'ValidationError':
      return {
        _tag: 'ValidationError',
        error: error.error,
      }
  }

  return assertNever(error)
}

const assertNever = (value: never): never => {
  throw new Error(`Unhandled getDealOperationalCenter error: ${JSON.stringify(value)}`)
}

export const dealRouter = createTrpcRouter({
  // Fixture-backed demo seam. Production private deal data must require real auth.
  getOperationalCenter: publicProcedure
    .input(GetOperationalCenterInputSchema)
    .output(GetDealOperationalCenterOutputSchema)
    .query(({ input }) =>
      GetDealOperationalCenterOutputSchema.parse(
        mapGetDealOperationalCenterResult(getDealOperationalCenter(input)),
      ),
    ),
})
