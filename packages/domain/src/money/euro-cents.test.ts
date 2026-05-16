import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  addEuroCents,
  compareEuroCents,
  euroCentsFromMinorUnits,
  euroCentsFromNumberMinorUnits,
  euroCentsToMinorUnits,
  formatEuroCents,
  isNegativeEuroCents,
  isPositiveEuroCents,
  isZeroEuroCents,
  negateEuroCents,
  parseEuroCents,
  serializeEuroCentsToNumber,
  subtractEuroCents,
} from './euro-cents'

const normalizeFrenchNumber = (value: string): string => value.replace(/\u00a0|\u202f/g, ' ')

const expectParsedMinorUnits = (input: string, expected: bigint): void => {
  const result = parseEuroCents(input)

  expect(result).toMatchObject({ _tag: 'Ok' })
  expect(result.isOk() ? euroCentsToMinorUnits(result.value) : undefined).toBe(expected)
}

const boundedEuroCentsArbitrary = fc
  .bigInt({ max: 10_000_000_000n, min: -10_000_000_000n })
  .map(euroCentsFromMinorUnits)

describe('EuroCents constructors and serialization', () => {
  it('brands exact bigint minor units', () => {
    const amount = euroCentsFromMinorUnits(123n)

    expect(euroCentsToMinorUnits(amount)).toBe(123n)
  })

  it('converts safe integer number minor units', () => {
    const result = euroCentsFromNumberMinorUnits(123)

    expect(result).toMatchObject({ _tag: 'Ok' })
    expect(result.isOk() ? euroCentsToMinorUnits(result.value) : undefined).toBe(123n)
  })

  it('rejects non-integer number minor units', () => {
    expect(euroCentsFromNumberMinorUnits(12.34)).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'InvalidFormat', input: '12.34' },
    })
  })

  it('rejects unsafe number minor units', () => {
    expect(euroCentsFromNumberMinorUnits(Number.MAX_SAFE_INTEGER + 1)).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'UnsafeNumber', value: Number.MAX_SAFE_INTEGER + 1 },
    })
  })

  it('serializes safe bigint cents to number', () => {
    expect(serializeEuroCentsToNumber(euroCentsFromMinorUnits(-123n))).toMatchObject({
      _tag: 'Ok',
      value: -123,
    })
  })

  it('rejects positive and negative values outside Number safe integer range', () => {
    expect(
      serializeEuroCentsToNumber(euroCentsFromMinorUnits(9_007_199_254_740_992n)),
    ).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'UnsafeNumber', value: 9_007_199_254_740_992n },
    })
    expect(
      serializeEuroCentsToNumber(euroCentsFromMinorUnits(-9_007_199_254_740_992n)),
    ).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'UnsafeNumber', value: -9_007_199_254_740_992n },
    })
  })
})

describe('parseEuroCents', () => {
  it.each([
    ['1234', 123_400n],
    ['1234.56', 123_456n],
    ['1234,56', 123_456n],
    ['1 234,56', 123_456n],
    ['1\u00a0234,56', 123_456n],
    ['1\u202f234,56', 123_456n],
    ['1.234,56', 123_456n],
    ['1_234,56', 123_456n],
    ['1 234,56 EUR', 123_456n],
    ['1 234,56 €', 123_456n],
    ['-1 234,56', -123_456n],
    ['1,234.56', 123_456n],
    ['0,1', 10n],
  ])('parses %s exactly', (input, expected) => {
    expectParsedMinorUnits(input, expected)
  })

  it('rejects empty input', () => {
    expect(parseEuroCents('')).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'EmptyInput' },
    })
  })

  it.each([
    'abc',
    '--1',
    '+123',
    '1.234.567',
    '1,23,4',
    '1.234,56,78',
    '12.34,56',
    '12,34.56',
    '12.34.56',
    '1234,',
    '.12',
    ',12',
  ])('rejects invalid format %s', (input) => {
    expect(parseEuroCents(input)).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'InvalidFormat', input },
    })
  })

  it.each(['1,234', '12,345', '1.234'])('rejects ambiguous input %s', (input) => {
    expect(parseEuroCents(input).isError()).toBe(true)
  })

  it.each(['1234,567', '1.234,567'])('rejects too many fractional digits in %s', (input) => {
    expect(parseEuroCents(input)).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'TooManyFractionDigits', input },
    })
  })
})

describe('formatEuroCents', () => {
  it('formats with fr-FR symbol display by default', () => {
    const result = formatEuroCents(euroCentsFromMinorUnits(123_456n))

    expect(result).toMatchObject({ _tag: 'Ok' })
    expect(result.isOk() ? normalizeFrenchNumber(result.value) : undefined).toBe('1 234,56 €')
  })

  it('formats negative values and accepts explicit currency display options', () => {
    const result = formatEuroCents(euroCentsFromMinorUnits(-123_456n), {
      currencyDisplay: 'code',
      locale: 'fr-FR',
    })

    expect(result).toMatchObject({ _tag: 'Ok' })
    expect(result.isOk() ? normalizeFrenchNumber(result.value) : undefined).toBe('-1 234,56 EUR')
  })

  it('rejects values that cannot be safely converted for Intl formatting', () => {
    const unsafeValue = BigInt(Number.MAX_SAFE_INTEGER) + 1n

    expect(formatEuroCents(euroCentsFromMinorUnits(unsafeValue))).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'UnsafeNumber', value: unsafeValue },
    })
  })
})

describe('EuroCents arithmetic and predicates', () => {
  it('adds, subtracts, negates, compares, and checks signs', () => {
    const left = euroCentsFromMinorUnits(250n)
    const right = euroCentsFromMinorUnits(150n)

    expect(euroCentsToMinorUnits(addEuroCents(left, right))).toBe(400n)
    expect(euroCentsToMinorUnits(subtractEuroCents(left, right))).toBe(100n)
    expect(euroCentsToMinorUnits(negateEuroCents(left))).toBe(-250n)
    expect(compareEuroCents(left, right)).toBe(1)
    expect(compareEuroCents(right, left)).toBe(-1)
    expect(compareEuroCents(left, euroCentsFromMinorUnits(250n))).toBe(0)
    expect(isZeroEuroCents(euroCentsFromMinorUnits(0n))).toBe(true)
    expect(isPositiveEuroCents(left)).toBe(true)
    expect(isNegativeEuroCents(negateEuroCents(left))).toBe(true)
  })
})

describe('EuroCents properties', () => {
  it('addition is commutative', () => {
    fc.assert(
      fc.property(boundedEuroCentsArbitrary, boundedEuroCentsArbitrary, (left, right) => {
        expect(euroCentsToMinorUnits(addEuroCents(left, right))).toBe(
          euroCentsToMinorUnits(addEuroCents(right, left)),
        )
      }),
    )
  })

  it('addition is associative', () => {
    fc.assert(
      fc.property(
        boundedEuroCentsArbitrary,
        boundedEuroCentsArbitrary,
        boundedEuroCentsArbitrary,
        (left, middle, right) => {
          const leftGrouped = addEuroCents(addEuroCents(left, middle), right)
          const rightGrouped = addEuroCents(left, addEuroCents(middle, right))

          expect(euroCentsToMinorUnits(leftGrouped)).toBe(euroCentsToMinorUnits(rightGrouped))
        },
      ),
    )
  })

  it('subtracting an added value returns the original value', () => {
    fc.assert(
      fc.property(boundedEuroCentsArbitrary, boundedEuroCentsArbitrary, (left, right) => {
        expect(euroCentsToMinorUnits(subtractEuroCents(addEuroCents(left, right), right))).toBe(
          euroCentsToMinorUnits(left),
        )
      }),
    )
  })

  it('negation is involutive', () => {
    fc.assert(
      fc.property(boundedEuroCentsArbitrary, (amount) => {
        expect(euroCentsToMinorUnits(negateEuroCents(negateEuroCents(amount)))).toBe(
          euroCentsToMinorUnits(amount),
        )
      }),
    )
  })

  it('comparison agrees with raw bigint comparison', () => {
    fc.assert(
      fc.property(boundedEuroCentsArbitrary, boundedEuroCentsArbitrary, (left, right) => {
        const rawLeft = euroCentsToMinorUnits(left)
        const rawRight = euroCentsToMinorUnits(right)
        const expected = rawLeft < rawRight ? -1 : rawLeft > rawRight ? 1 : 0

        expect(compareEuroCents(left, right)).toBe(expected)
      }),
    )
  })

  it('roundtrips formatted safe-range values through the parser', () => {
    fc.assert(
      fc.property(boundedEuroCentsArbitrary, (amount) => {
        const formatted = formatEuroCents(amount)

        expect(formatted).toMatchObject({ _tag: 'Ok' })

        if (formatted.isOk()) {
          const parsed = parseEuroCents(formatted.value)

          expect(parsed).toMatchObject({ _tag: 'Ok' })
          expect(parsed.isOk() ? euroCentsToMinorUnits(parsed.value) : undefined).toBe(
            euroCentsToMinorUnits(amount),
          )
        }
      }),
    )
  })
})
