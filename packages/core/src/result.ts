import { Option } from './option'

/**
 * Extracts the success value type from a `Result`.
 */
export type ResultValue<T> = T extends Result<infer Value, unknown> ? Value : never

/**
 * Extracts the error value type from a `Result`.
 */
export type ResultErrorValue<T> = T extends Result<unknown, infer ErrorValue> ? ErrorValue : never

/**
 * The success variant of `Result<T, E>`.
 */
export type OkResult<T, E> = {
  readonly _tag: 'Ok'
  readonly value: T
  map<U>(fn: (value: T) => U): Result<U, E>
  mapError<F>(fn: (error: E) => F): Result<T, F>
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  getOr(fallback: T): T
  getOrElse(fn: (error: E) => T): T
  match<U>(cases: ResultMatchCases<T, E, U>): U
  isOk(): this is OkResult<T, E>
  isError(): this is ErrorResult<T, E>
  toOption(): Option<T>
}

/**
 * The failure variant of `Result<T, E>`.
 */
export type ErrorResult<T, E> = {
  readonly _tag: 'Error'
  readonly error: E
  map<U>(fn: (value: T) => U): Result<U, E>
  mapError<F>(fn: (error: E) => F): Result<T, F>
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  getOr(fallback: T): T
  getOrElse(fn: (error: E) => T): T
  match<U>(cases: ResultMatchCases<T, E, U>): U
  isOk(): this is OkResult<T, E>
  isError(): this is ErrorResult<T, E>
  toOption(): Option<T>
}

/**
 * Represents an operation that either succeeds with `Ok(value)` or fails with
 * `Error(error)`.
 */
export type Result<T, E> = OkResult<T, E> | ErrorResult<T, E>

type ResultMatchCases<T, E, U> = {
  readonly Ok: (value: T) => U
  readonly Error: (error: E) => U
}

type ResultValues<T extends readonly Result<unknown, unknown>[]> = {
  -readonly [Key in keyof T]: ResultValue<T[Key]>
}

type ResultErrorValues<T extends readonly Result<unknown, unknown>[]> = {
  readonly [Key in keyof T]: ResultErrorValue<T[Key]>
}

type ResultNamespace = {
  /**
   * Creates a successful `Result`.
   *
   * @param value Success value to wrap.
   * @example
   * const parsed = Result.Ok(42)
   */
  Ok<T, E = never>(value: T): Result<T, E>

  /**
   * Creates a failed `Result`.
   *
   * @param error Error value to wrap.
   * @example
   * const failed = Result.Error('invalid amount')
   */
  Error<T = never, E = unknown>(error: E): Result<T, E>

  /**
   * Runs a throwing function and captures thrown values as `Result.Error`.
   *
   * @param fn Function that may throw.
   * @example
   * const parsed = Result.fromTryCatch(() => JSON.parse(raw))
   */
  fromTryCatch<T>(fn: () => T): Result<T, unknown>

  /**
   * Runs a throwing function and maps thrown values into a typed error.
   *
   * @param fn Function that may throw.
   * @param mapError Converts an unknown thrown value into the desired error type.
   * @example
   * const parsed = Result.fromTryCatchTyped(parse, toParseError)
   */
  fromTryCatchTyped<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>

  /**
   * Static form of `result.flatMap(fn)`.
   *
   * @param result Result to chain from.
   * @param fn Function that returns the next result.
   * @example
   * const next = Result.flatMap(parsed, validate)
   */
  flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>

  /**
   * Combines results and collects every error instead of short-circuiting.
   *
   * @param results Results to combine.
   * @example
   * const form = Result.all([name, email, amount])
   */
  all<T, U, E>(results: readonly [Result<T, E>, Result<U, E>]): Result<[T, U], E[]>
  all<T, U, V, E>(
    results: readonly [Result<T, E>, Result<U, E>, Result<V, E>],
  ): Result<[T, U, V], E[]>
  all<T, U, V, W, E>(
    results: readonly [Result<T, E>, Result<U, E>, Result<V, E>, Result<W, E>],
  ): Result<[T, U, V, W], E[]>
  all<T, U, V, W, X, E>(
    results: readonly [Result<T, E>, Result<U, E>, Result<V, E>, Result<W, E>, Result<X, E>],
  ): Result<[T, U, V, W, X], E[]>
  all<T, E>(results: readonly Result<T, E>[]): Result<T[], E[]>
  all<T extends readonly Result<unknown, unknown>[]>(
    results: T,
  ): Result<ResultValues<T>, ResultErrorValues<T>[number][]>

  /**
   * Maps an array into results and collects every error.
   *
   * @param items Items to traverse.
   * @param fn Function that validates or transforms each item.
   * @example
   * const parsed = Result.traverse(inputs, parseInput)
   */
  traverse<T, U, E>(items: readonly T[], fn: (item: T) => Result<U, E>): Result<U[], E[]>
}

const makeOk = <T, E = never>(value: T): Result<T, E> => {
  const self: OkResult<T, E> = {
    _tag: 'Ok' as const,
    value,
    map<U>(fn: (present: T) => U): Result<U, E> {
      return makeOk(fn(self.value))
    },
    mapError<F>(_fn: (error: E) => F): Result<T, F> {
      return makeOk(self.value)
    },
    flatMap<U>(fn: (present: T) => Result<U, E>): Result<U, E> {
      return fn(self.value)
    },
    getOr(_fallback: T): T {
      return self.value
    },
    getOrElse(_fn: (error: E) => T): T {
      return self.value
    },
    match<U>(cases: ResultMatchCases<T, E, U>): U {
      return cases.Ok(self.value)
    },
    isOk(): this is OkResult<T, E> {
      return true
    },
    isError(): this is ErrorResult<T, E> {
      return false
    },
    toOption(): Option<T> {
      return Option.Some(self.value)
    },
  }

  return self
}

const makeError = <T = never, E = unknown>(error: E): Result<T, E> => {
  const self: ErrorResult<T, E> = {
    _tag: 'Error' as const,
    error,
    map<U>(_fn: (value: T) => U): Result<U, E> {
      return makeError(self.error)
    },
    mapError<F>(fn: (failure: E) => F): Result<T, F> {
      return makeError(fn(self.error))
    },
    flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
      return makeError(self.error)
    },
    getOr(fallback: T): T {
      return fallback
    },
    getOrElse(fn: (failure: E) => T): T {
      return fn(self.error)
    },
    match<U>(cases: ResultMatchCases<T, E, U>): U {
      return cases.Error(self.error)
    },
    isOk(): this is OkResult<T, E> {
      return false
    },
    isError(): this is ErrorResult<T, E> {
      return true
    },
    toOption(): Option<T> {
      return Option.None()
    },
  }

  return self
}

const fromTryCatch = <T>(fn: () => T): Result<T, unknown> => {
  try {
    return makeOk(fn())
  } catch (error) {
    return makeError(error)
  }
}

const fromTryCatchTyped = <T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E> => {
  try {
    return makeOk(fn())
  } catch (error) {
    return makeError(mapError(error))
  }
}

const flatMap = <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
  return result.flatMap(fn)
}

function all<T, U, E>(results: readonly [Result<T, E>, Result<U, E>]): Result<[T, U], E[]>
function all<T, U, V, E>(
  results: readonly [Result<T, E>, Result<U, E>, Result<V, E>],
): Result<[T, U, V], E[]>
function all<T, U, V, W, E>(
  results: readonly [Result<T, E>, Result<U, E>, Result<V, E>, Result<W, E>],
): Result<[T, U, V, W], E[]>
function all<T, U, V, W, X, E>(
  results: readonly [Result<T, E>, Result<U, E>, Result<V, E>, Result<W, E>, Result<X, E>],
): Result<[T, U, V, W, X], E[]>
function all<T, E>(results: readonly Result<T, E>[]): Result<T[], E[]>
function all<T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<ResultValues<T>, ResultErrorValues<T>[number][]>
function all(results: readonly Result<unknown, unknown>[]): Result<unknown[], unknown[]> {
  const values: unknown[] = []
  const errors: unknown[] = []

  for (const result of results) {
    if (result.isOk()) {
      values.push(result.value)
    } else {
      errors.push(result.error)
    }
  }

  return errors.length > 0 ? makeError(errors) : makeOk(values)
}

const traverse = <T, U, E>(
  items: readonly T[],
  fn: (item: T) => Result<U, E>,
): Result<U[], E[]> => {
  const values: U[] = []
  const errors: E[] = []

  for (const item of items) {
    const result = fn(item)

    if (result.isOk()) {
      values.push(result.value)
    } else {
      errors.push(result.error)
    }
  }

  return errors.length > 0 ? makeError(errors) : makeOk(values)
}

/**
 * Constructors and combinators for `Result<T, E>`.
 */
export const Result: ResultNamespace = {
  Ok: makeOk,
  Error: makeError,
  fromTryCatch,
  fromTryCatchTyped,
  flatMap,
  all,
  traverse,
}
