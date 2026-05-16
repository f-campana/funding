import { describe, expect, it } from 'vitest'

import { createTrpcContext } from '../context'
import { createCaller } from '../root'

describe('dealRouter', () => {
  it('returns the operational center DTO through the server caller', async () => {
    const caller = createCaller(await createTrpcContext())

    const output = await caller.deal.getOperationalCenter({ dealId: 'northstar-energy' })

    expect(output._tag).toBe('Ok')

    if (output._tag !== 'Ok') {
      throw new Error(`Expected Ok output, received ${output._tag}`)
    }

    expect(output.data.deal.slug).toBe('northstar-energy')
    expect(output.data.capital.economics.netInvestableAmount.currency).toBe('EUR')
  })

  it('returns a typed unsupported-deal output', async () => {
    const caller = createCaller(await createTrpcContext())

    const output = await caller.deal.getOperationalCenter({ dealId: 'not-northstar' })

    expect(output).toEqual({
      _tag: 'UnsupportedDeal',
      dealId: 'not-northstar',
    })
  })

  it('rejects invalid input through tRPC validation', async () => {
    const caller = createCaller(await createTrpcContext())

    await expect(caller.deal.getOperationalCenter({ dealId: '   ' })).rejects.toThrow()
  })
})
