import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { fromZod } from './zod'

describe('fromZod', () => {
  const schema = z.object({
    amount: z.number().positive(),
  })

  it('returns Ok when parsing succeeds', () => {
    expect(fromZod(schema, { amount: 100 })).toMatchObject({
      _tag: 'Ok',
      value: { amount: 100 },
    })
  })

  it('returns Error when parsing fails', () => {
    const result = fromZod(schema, { amount: -1 })

    expect(result).toMatchObject({ _tag: 'Error' })
    if (result.isError()) {
      expect(result.error.issues[0]?.path).toEqual(['amount'])
    }
  })
})
