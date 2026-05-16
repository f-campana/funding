/**
 * Extracts the done value type from an `AsyncData`.
 */
export type AsyncDataValue<T> = T extends AsyncData<infer Value> ? Value : never

/**
 * The async operation has not been started.
 */
export type AsyncDataNotAsked<T> = {
  readonly _tag: 'NotAsked'
  map<U>(fn: (value: T) => U): AsyncData<U>
  flatMap<U>(fn: (value: T) => AsyncData<U>): AsyncData<U>
  match<U>(cases: AsyncDataMatchCases<T, U>): U
  isNotAsked(): this is AsyncDataNotAsked<T>
  isLoading(): this is AsyncDataLoading<T>
  isDone(): this is AsyncDataDone<T>
}

/**
 * The async operation is in flight.
 */
export type AsyncDataLoading<T> = {
  readonly _tag: 'Loading'
  map<U>(fn: (value: T) => U): AsyncData<U>
  flatMap<U>(fn: (value: T) => AsyncData<U>): AsyncData<U>
  match<U>(cases: AsyncDataMatchCases<T, U>): U
  isNotAsked(): this is AsyncDataNotAsked<T>
  isLoading(): this is AsyncDataLoading<T>
  isDone(): this is AsyncDataDone<T>
}

/**
 * The async operation has completed with a value.
 */
export type AsyncDataDone<T> = {
  readonly _tag: 'Done'
  readonly value: T
  map<U>(fn: (value: T) => U): AsyncData<U>
  flatMap<U>(fn: (value: T) => AsyncData<U>): AsyncData<U>
  match<U>(cases: AsyncDataMatchCases<T, U>): U
  isNotAsked(): this is AsyncDataNotAsked<T>
  isLoading(): this is AsyncDataLoading<T>
  isDone(): this is AsyncDataDone<T>
}

/**
 * Represents an async lifecycle as `NotAsked`, `Loading`, or `Done(value)`.
 */
export type AsyncData<T> = AsyncDataNotAsked<T> | AsyncDataLoading<T> | AsyncDataDone<T>

type AsyncDataMatchCases<T, U> = {
  readonly NotAsked: () => U
  readonly Loading: () => U
  readonly Done: (value: T) => U
}

type AsyncDataValues<T extends readonly AsyncData<unknown>[]> = {
  -readonly [Key in keyof T]: AsyncDataValue<T[Key]>
}

type AsyncDataNamespace = {
  /**
   * Creates the not-started async state.
   *
   * @example
   * const investors = AsyncData.NotAsked<Investor[]>()
   */
  NotAsked<T>(): AsyncData<T>

  /**
   * Creates the in-flight async state.
   *
   * @example
   * const investors = AsyncData.Loading<Investor[]>()
   */
  Loading<T>(): AsyncData<T>

  /**
   * Creates the completed async state.
   *
   * @param value Completed value.
   * @example
   * const investors = AsyncData.Done(result)
   */
  Done<T>(value: T): AsyncData<T>

  /**
   * Combines async states, preferring `Loading`, then `NotAsked`, then `Done`.
   *
   * @example
   * const both = AsyncData.all(investors, deals)
   */
  all<T, U>(a: AsyncData<T>, b: AsyncData<U>): AsyncData<[T, U]>
  all<T extends readonly [AsyncData<unknown>, AsyncData<unknown>, ...AsyncData<unknown>[]]>(
    ...items: T
  ): AsyncData<AsyncDataValues<T>>
}

const makeNotAsked = <T>(): AsyncData<T> => {
  const self: AsyncDataNotAsked<T> = {
    _tag: 'NotAsked' as const,
    map<U>(_fn: (value: T) => U): AsyncData<U> {
      return makeNotAsked()
    },
    flatMap<U>(_fn: (value: T) => AsyncData<U>): AsyncData<U> {
      return makeNotAsked()
    },
    match<U>(cases: AsyncDataMatchCases<T, U>): U {
      return cases.NotAsked()
    },
    isNotAsked(): this is AsyncDataNotAsked<T> {
      return true
    },
    isLoading(): this is AsyncDataLoading<T> {
      return false
    },
    isDone(): this is AsyncDataDone<T> {
      return false
    },
  }

  return self
}

const makeLoading = <T>(): AsyncData<T> => {
  const self: AsyncDataLoading<T> = {
    _tag: 'Loading' as const,
    map<U>(_fn: (value: T) => U): AsyncData<U> {
      return makeLoading()
    },
    flatMap<U>(_fn: (value: T) => AsyncData<U>): AsyncData<U> {
      return makeLoading()
    },
    match<U>(cases: AsyncDataMatchCases<T, U>): U {
      return cases.Loading()
    },
    isNotAsked(): this is AsyncDataNotAsked<T> {
      return false
    },
    isLoading(): this is AsyncDataLoading<T> {
      return true
    },
    isDone(): this is AsyncDataDone<T> {
      return false
    },
  }

  return self
}

const makeDone = <T>(value: T): AsyncData<T> => {
  const self: AsyncDataDone<T> = {
    _tag: 'Done' as const,
    value,
    map<U>(fn: (present: T) => U): AsyncData<U> {
      return makeDone(fn(self.value))
    },
    flatMap<U>(fn: (present: T) => AsyncData<U>): AsyncData<U> {
      return fn(self.value)
    },
    match<U>(cases: AsyncDataMatchCases<T, U>): U {
      return cases.Done(self.value)
    },
    isNotAsked(): this is AsyncDataNotAsked<T> {
      return false
    },
    isLoading(): this is AsyncDataLoading<T> {
      return false
    },
    isDone(): this is AsyncDataDone<T> {
      return true
    },
  }

  return self
}

function all<T, U>(a: AsyncData<T>, b: AsyncData<U>): AsyncData<[T, U]>
function all<T extends readonly [AsyncData<unknown>, AsyncData<unknown>, ...AsyncData<unknown>[]]>(
  ...items: T
): AsyncData<AsyncDataValues<T>>
function all(...items: readonly AsyncData<unknown>[]): AsyncData<unknown[]> {
  const values: unknown[] = []
  let hasNotAsked = false

  for (const item of items) {
    if (item.isLoading()) {
      return makeLoading()
    }

    if (item.isNotAsked()) {
      hasNotAsked = true
    } else {
      values.push(item.value)
    }
  }

  return hasNotAsked ? makeNotAsked() : makeDone(values)
}

/**
 * Constructors and combinators for `AsyncData<T>`.
 */
export const AsyncData: AsyncDataNamespace = {
  NotAsked: makeNotAsked,
  Loading: makeLoading,
  Done: makeDone,
  all,
}
