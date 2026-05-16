import { Result } from './result'

/**
 * Extracts the value type from an `Option`.
 */
export type OptionValue<T> = T extends Option<infer Value> ? Value : never

/**
 * Maps a record of `Option` values to a record of their unwrapped values.
 */
export type OptionRecord<T extends Record<string, Option<unknown>>> = {
  readonly [Key in keyof T]: OptionValue<T[Key]>
}

/**
 * The present variant of `Option<T>`.
 */
export type SomeOption<T> = {
  readonly _tag: 'Some'
  readonly value: T
  map<U>(fn: (value: T) => U): Option<U>
  flatMap<U>(fn: (value: T) => Option<U>): Option<U>
  getOr(fallback: T): T
  getOrElse(fn: () => T): T
  match<U>(cases: OptionMatchCases<T, U>): U
  isSome(): this is SomeOption<T>
  isNone(): this is NoneOption<T>
  toResult<E>(error: E): Result<T, E>
  filter(predicate: (value: T) => boolean): Option<T>
}

/**
 * The absent variant of `Option<T>`.
 */
export type NoneOption<T> = {
  readonly _tag: 'None'
  map<U>(fn: (value: T) => U): Option<U>
  flatMap<U>(fn: (value: T) => Option<U>): Option<U>
  getOr(fallback: T): T
  getOrElse(fn: () => T): T
  match<U>(cases: OptionMatchCases<T, U>): U
  isSome(): this is SomeOption<T>
  isNone(): this is NoneOption<T>
  toResult<E>(error: E): Result<T, E>
  filter(predicate: (value: T) => boolean): Option<T>
}

/**
 * Represents a value that may or may not be present.
 *
 * Use `Some` for a present value and `None` for an explicit absence instead
 * of `null` or `undefined`.
 */
export type Option<T> = SomeOption<T> | NoneOption<T>

type OptionMatchCases<T, U> = {
  readonly Some: (value: T) => U
  readonly None: () => U
}

type OptionValues<T extends readonly Option<unknown>[]> = {
  -readonly [Key in keyof T]: OptionValue<T[Key]>
}

type OptionNamespace = {
  /**
   * Creates an `Option` with a present value.
   *
   * @param value Value to wrap.
   * @example
   * const amount = Option.Some(100)
   */
  Some<T>(value: T): Option<T>

  /**
   * Creates an `Option` with no value.
   *
   * @example
   * const missing = Option.None<string>()
   */
  None<T>(): Option<T>

  /**
   * Converts `null` and `undefined` to `None`, and all other values to `Some`.
   *
   * @param value Nullable value to lift.
   * @example
   * const name = Option.fromNullable(user.name)
   */
  fromNullable<T>(value: T | null | undefined): Option<T>

  /**
   * Creates `Some(value)` when the predicate is true, otherwise `None`.
   *
   * @param value Value to test and potentially wrap.
   * @param predicate Predicate that decides whether the value is present.
   * @example
   * const positive = Option.fromPredicate(amount, (value) => value > 0)
   */
  fromPredicate<T>(value: T, predicate: (value: T) => boolean): Option<T>

  /**
   * Combines multiple options, returning `None` when any input is `None`.
   *
   * @example
   * const both = Option.all(Option.Some(1), Option.Some('a'))
   */
  all<T, U>(a: Option<T>, b: Option<U>): Option<[T, U]>
  all<T extends readonly [Option<unknown>, Option<unknown>, ...Option<unknown>[]]>(
    ...options: T
  ): Option<OptionValues<T>>

  /**
   * Combines a record of options, returning `None` when any value is `None`.
   *
   * @param record Record whose values are all options.
   * @example
   * const form = Option.allFromRecord({ name, email })
   */
  allFromRecord<T extends Record<string, Option<unknown>>>(record: T): Option<OptionRecord<T>>
}

const makeSome = <T>(value: T): Option<T> => {
  const self: SomeOption<T> = {
    _tag: 'Some' as const,
    value,
    map<U>(fn: (present: T) => U): Option<U> {
      return makeSome(fn(self.value))
    },
    flatMap<U>(fn: (present: T) => Option<U>): Option<U> {
      return fn(self.value)
    },
    getOr(_fallback: T): T {
      return self.value
    },
    getOrElse(_fn: () => T): T {
      return self.value
    },
    match<U>(cases: OptionMatchCases<T, U>): U {
      return cases.Some(self.value)
    },
    isSome(): this is SomeOption<T> {
      return true
    },
    isNone(): this is NoneOption<T> {
      return false
    },
    toResult<E>(_error: E): Result<T, E> {
      return Result.Ok(self.value)
    },
    filter(predicate: (present: T) => boolean): Option<T> {
      return predicate(self.value) ? self : makeNone()
    },
  }

  return self
}

const makeNone = <T>(): Option<T> => {
  const self: NoneOption<T> = {
    _tag: 'None' as const,
    map<U>(_fn: (value: T) => U): Option<U> {
      return makeNone()
    },
    flatMap<U>(_fn: (value: T) => Option<U>): Option<U> {
      return makeNone()
    },
    getOr(fallback: T): T {
      return fallback
    },
    getOrElse(fn: () => T): T {
      return fn()
    },
    match<U>(cases: OptionMatchCases<T, U>): U {
      return cases.None()
    },
    isSome(): this is SomeOption<T> {
      return false
    },
    isNone(): this is NoneOption<T> {
      return true
    },
    toResult<E>(error: E): Result<T, E> {
      return Result.Error(error)
    },
    filter(_predicate: (value: T) => boolean): Option<T> {
      return self
    },
  }

  return self
}

const fromNullable = <T>(value: T | null | undefined): Option<T> => {
  return value === null || value === undefined ? makeNone() : makeSome(value)
}

const fromPredicate = <T>(value: T, predicate: (value: T) => boolean): Option<T> => {
  return predicate(value) ? makeSome(value) : makeNone()
}

function all<T, U>(a: Option<T>, b: Option<U>): Option<[T, U]>
function all<T extends readonly [Option<unknown>, Option<unknown>, ...Option<unknown>[]]>(
  ...options: T
): Option<OptionValues<T>>
function all(...options: readonly Option<unknown>[]): Option<unknown[]> {
  const values: unknown[] = []

  for (const option of options) {
    if (option.isNone()) {
      return makeNone()
    }

    values.push(option.value)
  }

  return makeSome(values)
}

const allFromRecord = <T extends Record<string, Option<unknown>>>(
  record: T,
): Option<OptionRecord<T>> => {
  const values: Record<string, unknown> = {}

  for (const [key, option] of Object.entries(record) as Array<[keyof T, T[keyof T]]>) {
    if (option.isNone()) {
      return makeNone()
    }

    values[String(key)] = option.value
  }

  return makeSome(values as OptionRecord<T>)
}

/**
 * Constructors and combinators for `Option<T>`.
 */
export const Option: OptionNamespace = {
  Some: makeSome,
  None: makeNone,
  fromNullable,
  fromPredicate,
  all,
  allFromRecord,
}
