import { Result } from './result'

/**
 * Cancels a running `Future`.
 */
export type CancelFn = () => void

/**
 * Represents a lazy, cancellable asynchronous computation.
 */
export type Future<T> = {
  readonly _tag: 'Future'
  map<U>(fn: (value: T) => U): Future<U>
  flatMap<U>(fn: (value: T) => Future<U>): Future<U>
  get(resolve: (value: T) => void): CancelFn
}

type FutureNamespace = {
  /**
   * Creates a lazy future from a function that starts work and returns cancel.
   *
   * @param fn Function invoked only when `.get()` is called.
   * @example
   * const future = Future.make((resolve) => {
   *   const id = setTimeout(() => resolve(1), 10)
   *   return () => clearTimeout(id)
   * })
   */
  make<T>(fn: (resolve: (value: T) => void) => CancelFn): Future<T>

  /**
   * Creates a future that resolves to a value when executed.
   *
   * @param value Value to resolve with.
   * @example
   * const immediate = Future.value(42)
   */
  value<T>(value: T): Future<T>

  /**
   * Converts a promise factory into a future of `Result`.
   *
   * @param fn Promise factory invoked only when `.get()` is called.
   * @example
   * const users = Future.fromPromise(() => fetch('/users').then((r) => r.json()))
   */
  fromPromise<T>(fn: () => Promise<T>): Future<Result<T, Error>>
}

const noop: CancelFn = () => undefined

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error))
}

const make = <T>(fn: (resolve: (value: T) => void) => CancelFn): Future<T> => {
  const self: Future<T> = {
    _tag: 'Future' as const,
    map<U>(mapValue: (value: T) => U): Future<U> {
      return make((resolve) => {
        return self.get((value) => {
          resolve(mapValue(value))
        })
      })
    },
    flatMap<U>(mapValue: (value: T) => Future<U>): Future<U> {
      return make((resolve) => {
        let innerCancel: CancelFn | undefined

        const outerCancel = self.get((value) => {
          innerCancel = mapValue(value).get(resolve)
        })

        return () => {
          outerCancel()
          innerCancel?.()
        }
      })
    },
    get(resolve: (value: T) => void): CancelFn {
      let cancelled = false
      let settled = false

      const cancel = fn((value) => {
        if (!cancelled && !settled) {
          settled = true
          resolve(value)
        }
      })

      return () => {
        if (cancelled) {
          return
        }

        cancelled = true

        if (!settled) {
          cancel()
        }
      }
    },
  }

  return self
}

const value = <T>(resolvedValue: T): Future<T> => {
  return make((resolve) => {
    resolve(resolvedValue)
    return noop
  })
}

const fromPromise = <T>(fn: () => Promise<T>): Future<Result<T, Error>> => {
  return make((resolve) => {
    let promise: Promise<T>

    try {
      promise = fn()
    } catch (error) {
      resolve(Result.Error(toError(error)))
      return noop
    }

    promise.then(
      (value) => {
        resolve(Result.Ok(value))
      },
      (error: unknown) => {
        resolve(Result.Error(toError(error)))
      },
    )

    return noop
  })
}

/**
 * Constructors and combinators for `Future<T>`.
 */
export const Future: FutureNamespace = {
  make,
  value,
  fromPromise,
}
