import * as fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'

import { Result, type Result as ResultType } from './result'

type PlainResult<T, E> =
  | {
      readonly _tag: 'Ok'
      readonly value: T
    }
  | {
      readonly _tag: 'Error'
      readonly error: E
    }

const plainResult = <T, E>(result: ResultType<T, E>): PlainResult<T, E> => {
  return result.match<PlainResult<T, E>>({
    Ok: (value) => ({ _tag: 'Ok' as const, value }),
    Error: (error) => ({ _tag: 'Error' as const, error }),
  })
}

describe('Result constructors', () => {
  it('creates Ok and Error variants', () => {
    expect(plainResult(Result.Ok<number, string>(42))).toEqual({ _tag: 'Ok', value: 42 })
    expect(plainResult(Result.Error<number, string>('bad'))).toEqual({
      _tag: 'Error',
      error: 'bad',
    })
  })

  it('captures successful functions with fromTryCatch', () => {
    expect(plainResult(Result.fromTryCatch(() => 42))).toEqual({ _tag: 'Ok', value: 42 })
  })

  it('captures thrown values with fromTryCatch', () => {
    const error = new Error('boom')
    const result = Result.fromTryCatch(() => {
      throw error
    })

    expect(plainResult(result)).toEqual({ _tag: 'Error', error })
  })

  it('maps thrown values with fromTryCatchTyped', () => {
    const result = Result.fromTryCatchTyped(
      () => {
        throw 'boom'
      },
      (error) => `mapped ${String(error)}`,
    )

    expect(plainResult(result)).toEqual({ _tag: 'Error', error: 'mapped boom' })
  })

  it('returns Ok from fromTryCatchTyped when no error is thrown', () => {
    expect(plainResult(Result.fromTryCatchTyped(() => 7, String))).toEqual({
      _tag: 'Ok',
      value: 7,
    })
  })
})

describe('Result.map', () => {
  it('transforms Ok values', () => {
    expect(plainResult(Result.Ok<number, string>(5).map((value) => value * 2))).toEqual({
      _tag: 'Ok',
      value: 10,
    })
  })

  it('propagates Error without calling the mapper', () => {
    const mapper = vi.fn((value: number) => value * 2)
    const result = Result.Error<number, string>('bad').map(mapper)

    expect(plainResult(result)).toEqual({ _tag: 'Error', error: 'bad' })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('Result.mapError', () => {
  it('transforms Error values', () => {
    const result = Result.Error<number, string>('bad').mapError((error) => error.length)

    expect(plainResult(result)).toEqual({ _tag: 'Error', error: 3 })
  })

  it('propagates Ok without calling the mapper', () => {
    const mapper = vi.fn((error: string) => error.length)
    const result = Result.Ok<number, string>(5).mapError(mapper)

    expect(plainResult(result)).toEqual({ _tag: 'Ok', value: 5 })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('Result.flatMap', () => {
  const validatePositive = (value: number): ResultType<number, string> => {
    return value > 0 ? Result.Ok(value) : Result.Error('not positive')
  }

  it('chains Ok values', () => {
    expect(plainResult(Result.Ok<number, string>(5).flatMap(validatePositive))).toEqual({
      _tag: 'Ok',
      value: 5,
    })
  })

  it('returns Error when the chain returns Error', () => {
    expect(plainResult(Result.Ok<number, string>(-1).flatMap(validatePositive))).toEqual({
      _tag: 'Error',
      error: 'not positive',
    })
  })

  it('does not call the mapper when Error', () => {
    const mapper = vi.fn(validatePositive)
    const result = Result.Error<number, string>('bad').flatMap(mapper)

    expect(plainResult(result)).toEqual({ _tag: 'Error', error: 'bad' })
    expect(mapper).not.toHaveBeenCalled()
  })

  it('exposes a static flatMap combinator', () => {
    const result = Result.flatMap(Result.Ok<number, string>(4), validatePositive)

    expect(plainResult(result)).toEqual({ _tag: 'Ok', value: 4 })
  })
})

describe('Result extraction and matching', () => {
  it('returns the value or fallback from getOr', () => {
    expect(Result.Ok<number, string>(3).getOr(9)).toBe(3)
    expect(Result.Error<number, string>('bad').getOr(9)).toBe(9)
  })

  it('lazily returns the value or fallback from getOrElse', () => {
    const fallback = vi.fn((error: string) => error.length)

    expect(Result.Ok<number, string>(3).getOrElse(fallback)).toBe(3)
    expect(fallback).not.toHaveBeenCalled()
    expect(Result.Error<number, string>('bad').getOrElse(fallback)).toBe(3)
    expect(fallback).toHaveBeenCalledOnce()
  })

  it('matches both variants', () => {
    const ok = Result.Ok<number, string>(3).match({
      Ok: (value) => `ok ${value}`,
      Error: (error) => `error ${error}`,
    })
    const error = Result.Error<number, string>('bad').match({
      Ok: (value) => `ok ${value}`,
      Error: (failure) => `error ${failure}`,
    })

    expect(ok).toBe('ok 3')
    expect(error).toBe('error bad')
  })
})

describe('Result predicates and conversions', () => {
  it('narrows Ok and Error at runtime', () => {
    const ok = Result.Ok<number, string>(1)
    const error = Result.Error<number, string>('bad')

    expect(ok.isOk()).toBe(true)
    expect(ok.isError()).toBe(false)
    if (ok.isOk()) {
      expect(ok.value).toBe(1)
    }

    expect(error.isError()).toBe(true)
    expect(error.isOk()).toBe(false)
  })

  it('converts to Option', () => {
    expect(Result.Ok<number, string>(1).toOption()).toMatchObject({ _tag: 'Some', value: 1 })
    expect(Result.Error<number, string>('bad').toOption()).toMatchObject({ _tag: 'None' })
  })
})

describe('Result.all', () => {
  it('returns Ok tuple when all inputs succeed', () => {
    const result = Result.all([Result.Ok<number, string>(1), Result.Ok<string, string>('a')])

    expect(plainResult(result)).toEqual({ _tag: 'Ok', value: [1, 'a'] })
  })

  it('supports larger tuples', () => {
    const result = Result.all([
      Result.Ok<number, string>(1),
      Result.Ok<string, string>('a'),
      Result.Ok<boolean, string>(true),
    ])

    expect(plainResult(result)).toEqual({ _tag: 'Ok', value: [1, 'a', true] })
  })

  it('collects all errors instead of short-circuiting', () => {
    const first = new Error('first')
    const second = new Error('second')
    const third = new Error('third')
    const result = Result.all([
      Result.Error<number, Error>(first),
      Result.Ok<number, Error>(1),
      Result.Error<number, Error>(second),
      Result.Error<number, Error>(third),
    ])

    expect(plainResult(result)).toEqual({
      _tag: 'Error',
      error: [first, second, third],
    })
  })

  it('returns Ok for an empty result array', () => {
    expect(plainResult(Result.all<number, string>([]))).toEqual({ _tag: 'Ok', value: [] })
  })
})

describe('Result.traverse', () => {
  const parsePositive = (value: number): ResultType<number, string> => {
    return value > 0 ? Result.Ok(value * 2) : Result.Error(`${value} is invalid`)
  }

  it('maps all items when every result is Ok', () => {
    expect(plainResult(Result.traverse([1, 2, 3], parsePositive))).toEqual({
      _tag: 'Ok',
      value: [2, 4, 6],
    })
  })

  it('collects every error when any item fails', () => {
    expect(plainResult(Result.traverse([1, -2, -3], parsePositive))).toEqual({
      _tag: 'Error',
      error: ['-2 is invalid', '-3 is invalid'],
    })
  })
})

describe('Result Functor laws', () => {
  const resultArbitrary: fc.Arbitrary<ResultType<number, string>> = fc.oneof(
    fc.integer().map((value) => Result.Ok<number, string>(value)),
    fc.string().map((error) => Result.Error<number, string>(error)),
  )

  it('identity: result.map(id) equals result', () => {
    fc.assert(
      fc.property(resultArbitrary, (result) => {
        expect(plainResult(result.map((value) => value))).toEqual(plainResult(result))
      }),
    )
  })

  it('composition: result.map(f).map(g) equals result.map(g after f)', () => {
    const f = (value: number): number => value * 2
    const g = (value: number): number => value + 1

    fc.assert(
      fc.property(resultArbitrary, (result) => {
        const left = result.map(f).map(g)
        const right = result.map((value) => g(f(value)))

        expect(plainResult(left)).toEqual(plainResult(right))
      }),
    )
  })
})

describe('Result Monad laws', () => {
  const resultArbitrary: fc.Arbitrary<ResultType<number, string>> = fc.oneof(
    fc.integer().map((value) => Result.Ok<number, string>(value)),
    fc.string().map((error) => Result.Error<number, string>(error)),
  )
  const f = (value: number): ResultType<number, string> => {
    return value > 0 ? Result.Ok(value * 2) : Result.Error('non-positive')
  }
  const g = (value: number): ResultType<string, string> => {
    return value < 100 ? Result.Ok(value.toString()) : Result.Error('too large')
  }

  it('left identity: Ok(x).flatMap(f) equals f(x)', () => {
    fc.assert(
      fc.property(fc.integer(), (value) => {
        expect(plainResult(Result.Ok<number, string>(value).flatMap(f))).toEqual(
          plainResult(f(value)),
        )
      }),
    )
  })

  it('right identity: result.flatMap(Ok) equals result', () => {
    fc.assert(
      fc.property(resultArbitrary, (result) => {
        expect(plainResult(result.flatMap(Result.Ok))).toEqual(plainResult(result))
      }),
    )
  })

  it('associativity: flatMap composition is stable', () => {
    fc.assert(
      fc.property(resultArbitrary, (result) => {
        const left = result.flatMap(f).flatMap(g)
        const right = result.flatMap((value) => f(value).flatMap(g))

        expect(plainResult(left)).toEqual(plainResult(right))
      }),
    )
  })
})
