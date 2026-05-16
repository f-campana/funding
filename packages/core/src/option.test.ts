import * as fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'

import { Option, type Option as OptionType } from './option'

type PlainOption<T> =
  | {
      readonly _tag: 'Some'
      readonly value: T
    }
  | {
      readonly _tag: 'None'
    }

const plainOption = <T>(option: OptionType<T>): PlainOption<T> => {
  return option.match<PlainOption<T>>({
    Some: (value) => ({ _tag: 'Some' as const, value }),
    None: () => ({ _tag: 'None' as const }),
  })
}

describe('Option constructors', () => {
  it('creates Some with the provided value', () => {
    expect(plainOption(Option.Some(42))).toEqual({ _tag: 'Some', value: 42 })
  })

  it('creates None', () => {
    expect(plainOption(Option.None<number>())).toEqual({ _tag: 'None' })
  })

  it('converts nullable values to options', () => {
    expect(plainOption(Option.fromNullable('value'))).toEqual({ _tag: 'Some', value: 'value' })
    expect(plainOption(Option.fromNullable(null))).toEqual({ _tag: 'None' })
    expect(plainOption(Option.fromNullable(undefined))).toEqual({ _tag: 'None' })
  })

  it('creates Some only when the predicate passes', () => {
    expect(plainOption(Option.fromPredicate(5, (value) => value > 0))).toEqual({
      _tag: 'Some',
      value: 5,
    })
    expect(plainOption(Option.fromPredicate(-1, (value) => value > 0))).toEqual({
      _tag: 'None',
    })
  })
})

describe('Option.map', () => {
  it('transforms the value when Some', () => {
    expect(plainOption(Option.Some(5).map((value) => value * 2))).toEqual({
      _tag: 'Some',
      value: 10,
    })
  })

  it('propagates None without calling the mapper', () => {
    const mapper = vi.fn((value: number) => value * 2)
    const result = Option.None<number>().map(mapper)

    expect(plainOption(result)).toEqual({ _tag: 'None' })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('Option.flatMap', () => {
  const safeDivide = (numerator: number, denominator: number): OptionType<number> => {
    return denominator === 0 ? Option.None() : Option.Some(numerator / denominator)
  }

  it('chains Some values', () => {
    const result = Option.Some(10).flatMap((value) => safeDivide(value, 2))

    expect(plainOption(result)).toEqual({ _tag: 'Some', value: 5 })
  })

  it('returns None when the chain returns None', () => {
    const result = Option.Some(10).flatMap((value) => safeDivide(value, 0))

    expect(plainOption(result)).toEqual({ _tag: 'None' })
  })

  it('does not call the mapper when None', () => {
    const mapper = vi.fn((value: number) => Option.Some(value * 2))
    const result = Option.None<number>().flatMap(mapper)

    expect(plainOption(result)).toEqual({ _tag: 'None' })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('Option extraction and matching', () => {
  it('returns the value or fallback from getOr', () => {
    expect(Option.Some(3).getOr(9)).toBe(3)
    expect(Option.None<number>().getOr(9)).toBe(9)
  })

  it('lazily returns the value or fallback from getOrElse', () => {
    const fallback = vi.fn(() => 9)

    expect(Option.Some(3).getOrElse(fallback)).toBe(3)
    expect(fallback).not.toHaveBeenCalled()
    expect(Option.None<number>().getOrElse(fallback)).toBe(9)
    expect(fallback).toHaveBeenCalledOnce()
  })

  it('matches both variants', () => {
    const some = Option.Some(3).match({
      Some: (value) => `some ${value}`,
      None: () => 'none',
    })
    const none = Option.None<number>().match({
      Some: (value) => `some ${value}`,
      None: () => 'none',
    })

    expect(some).toBe('some 3')
    expect(none).toBe('none')
  })
})

describe('Option predicates and conversions', () => {
  it('narrows Some and None at runtime', () => {
    const some = Option.Some(1)
    const none = Option.None<number>()

    expect(some.isSome()).toBe(true)
    expect(some.isNone()).toBe(false)
    if (some.isSome()) {
      expect(some.value).toBe(1)
    }

    expect(none.isNone()).toBe(true)
    expect(none.isSome()).toBe(false)
  })

  it('converts to Result', () => {
    expect(Option.Some(1).toResult('missing')).toMatchObject({ _tag: 'Ok', value: 1 })
    expect(Option.None<number>().toResult('missing')).toMatchObject({
      _tag: 'Error',
      error: 'missing',
    })
  })

  it('filters Some values and propagates None', () => {
    const predicate = vi.fn((value: number) => value > 3)

    expect(plainOption(Option.Some(5).filter(predicate))).toEqual({ _tag: 'Some', value: 5 })
    expect(plainOption(Option.Some(1).filter((value) => value > 3))).toEqual({ _tag: 'None' })
    expect(plainOption(Option.None<number>().filter(predicate))).toEqual({ _tag: 'None' })
    expect(predicate).toHaveBeenCalledOnce()
  })
})

describe('Option.all', () => {
  it('returns Some tuple when all inputs are Some', () => {
    expect(plainOption(Option.all(Option.Some(1), Option.Some('a')))).toEqual({
      _tag: 'Some',
      value: [1, 'a'],
    })
  })

  it('supports variadic tuples', () => {
    expect(plainOption(Option.all(Option.Some(1), Option.Some('a'), Option.Some(true)))).toEqual({
      _tag: 'Some',
      value: [1, 'a', true],
    })
  })

  it('returns None when any input is None', () => {
    expect(plainOption(Option.all(Option.Some(1), Option.None<string>()))).toEqual({
      _tag: 'None',
    })
    expect(plainOption(Option.all(Option.None<number>(), Option.Some('a')))).toEqual({
      _tag: 'None',
    })
  })
})

describe('Option.allFromRecord', () => {
  it('returns Some record when all fields are Some', () => {
    const result = Option.allFromRecord({
      amount: Option.Some(100),
      name: Option.Some('Ada'),
    })

    expect(plainOption(result)).toEqual({
      _tag: 'Some',
      value: { amount: 100, name: 'Ada' },
    })
  })

  it('returns None when any field is None', () => {
    const result = Option.allFromRecord({
      amount: Option.Some(100),
      name: Option.None<string>(),
    })

    expect(plainOption(result)).toEqual({ _tag: 'None' })
  })
})

describe('Option Functor laws', () => {
  const optionArbitrary: fc.Arbitrary<OptionType<number>> = fc.oneof(
    fc.integer().map((value) => Option.Some(value)),
    fc.constant(Option.None<number>()),
  )

  it('identity: option.map(id) equals option', () => {
    fc.assert(
      fc.property(optionArbitrary, (option) => {
        expect(plainOption(option.map((value) => value))).toEqual(plainOption(option))
      }),
    )
  })

  it('composition: option.map(f).map(g) equals option.map(g after f)', () => {
    const f = (value: number): number => value * 2
    const g = (value: number): number => value + 1

    fc.assert(
      fc.property(optionArbitrary, (option) => {
        const left = option.map(f).map(g)
        const right = option.map((value) => g(f(value)))

        expect(plainOption(left)).toEqual(plainOption(right))
      }),
    )
  })
})

describe('Option Monad laws', () => {
  const optionArbitrary: fc.Arbitrary<OptionType<number>> = fc.oneof(
    fc.integer().map((value) => Option.Some(value)),
    fc.constant(Option.None<number>()),
  )
  const f = (value: number): OptionType<number> => {
    return value > 0 ? Option.Some(value * 2) : Option.None()
  }
  const g = (value: number): OptionType<string> => {
    return value < 100 ? Option.Some(value.toString()) : Option.None()
  }

  it('left identity: Some(x).flatMap(f) equals f(x)', () => {
    fc.assert(
      fc.property(fc.integer(), (value) => {
        expect(plainOption(Option.Some(value).flatMap(f))).toEqual(plainOption(f(value)))
      }),
    )
  })

  it('right identity: option.flatMap(Some) equals option', () => {
    fc.assert(
      fc.property(optionArbitrary, (option) => {
        expect(plainOption(option.flatMap(Option.Some))).toEqual(plainOption(option))
      }),
    )
  })

  it('associativity: flatMap composition is stable', () => {
    fc.assert(
      fc.property(optionArbitrary, (option) => {
        const left = option.flatMap(f).flatMap(g)
        const right = option.flatMap((value) => f(value).flatMap(g))

        expect(plainOption(left)).toEqual(plainOption(right))
      }),
    )
  })
})
