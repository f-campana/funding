import {
  type GetDealOperationalCenterOutputDTO,
  GetOperationalCenterInputSchema,
  getDealOperationalCenter,
} from '../../deals'
import { createTrpcRouter, publicProcedure } from '../init'

export const dealRouter = createTrpcRouter({
  // Fixture-backed demo seam. Production private deal data must require real auth.
  getOperationalCenter: publicProcedure
    .input(GetOperationalCenterInputSchema)
    .query(({ input }): GetDealOperationalCenterOutputDTO => {
      const result = getDealOperationalCenter(input)

      if (result.isOk()) {
        return {
          _tag: 'Ok',
          data: result.value,
        }
      }

      switch (result.error._tag) {
        case 'UnsupportedDeal':
          return {
            _tag: 'UnsupportedDeal',
            dealId: result.error.dealId,
          }
        case 'ReconciliationError':
          return {
            _tag: 'ReconciliationError',
            error: result.error.error,
          }
        case 'MoneySerializationError':
          return {
            _tag: 'MoneySerializationError',
            error: result.error.error,
          }
      }
    }),
})
