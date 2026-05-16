import type { UseQueryResult } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { fromTanStackQuery } from './tanstack-query'

const queryResult = <T, E>(query: Partial<UseQueryResult<T, E>>): UseQueryResult<T, E> => {
  return query as UseQueryResult<T, E>
}

describe('fromTanStackQuery', () => {
  it('converts loading queries to Loading', () => {
    const result = fromTanStackQuery(
      queryResult<number, string>({
        isLoading: true,
      }),
    )

    expect(result).toMatchObject({ _tag: 'Loading' })
  })

  it('converts error queries to Done(Error)', () => {
    const result = fromTanStackQuery(
      queryResult<number, string>({
        error: 'bad',
        isError: true,
        isLoading: false,
      }),
    )

    expect(result).toMatchObject({
      _tag: 'Done',
      value: { _tag: 'Error', error: 'bad' },
    })
  })

  it('converts successful queries to Done(Ok)', () => {
    const result = fromTanStackQuery(
      queryResult<number, string>({
        data: 7,
        isError: false,
        isLoading: false,
        isSuccess: true,
      }),
    )

    expect(result).toMatchObject({
      _tag: 'Done',
      value: { _tag: 'Ok', value: 7 },
    })
  })

  it('converts idle pending queries to NotAsked', () => {
    const result = fromTanStackQuery(
      queryResult<number, string>({
        isError: false,
        isLoading: false,
        isSuccess: false,
      }),
    )

    expect(result).toMatchObject({ _tag: 'NotAsked' })
  })
})
