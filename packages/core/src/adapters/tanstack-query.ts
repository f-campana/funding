import type { UseQueryResult } from '@tanstack/react-query'

import { AsyncData } from '../async-data'
import { Result } from '../result'

/**
 * Converts a TanStack Query result to `AsyncData<Result<T, E>>`.
 *
 * @param query Query result returned by TanStack Query.
 * @example
 * const data = fromTanStackQuery(useQuery(options))
 */
export function fromTanStackQuery<T, E = Error>(
  query: UseQueryResult<T, E>,
): AsyncData<Result<T, E>> {
  if (query.isLoading) {
    return AsyncData.Loading()
  }

  if (query.isError) {
    return AsyncData.Done(Result.Error(query.error))
  }

  if (query.isSuccess) {
    return AsyncData.Done(Result.Ok(query.data))
  }

  return AsyncData.NotAsked()
}
