import { Result } from '@repo/core'
import { z } from 'zod'

declare const euroCentsBrand: unique symbol

export type EuroCents = bigint & {
  readonly [euroCentsBrand]: 'EuroCents'
}

export type MoneyParseError =
  | { readonly _tag: 'EmptyInput' }
  | { readonly _tag: 'InvalidFormat'; readonly input: string }
  | { readonly _tag: 'TooManyFractionDigits'; readonly input: string }
  | { readonly _tag: 'UnsafeNumber'; readonly value: number }

export type MoneyFormatError = {
  readonly _tag: 'UnsafeNumber'
  readonly value: bigint
}

export type FormatEuroCentsOptions = {
  readonly locale?: string
  readonly currencyDisplay?: 'symbol' | 'code' | 'name'
}

export type EuroCentsJsonSchemaMinimum = 'none' | 'nonnegative' | 'positive'

export type EuroCentsJsonSchemaOptions = {
  readonly minimum?: EuroCentsJsonSchemaMinimum
  readonly minimumError?: string
}

const CENTS_PER_EURO = 100n
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)
const MIN_SAFE_INTEGER_BIGINT = BigInt(Number.MIN_SAFE_INTEGER)
const GROUPING_SEPARATORS_PATTERN = /[ _\u00a0\u202f]/g
const CURRENCY_SUFFIX_PATTERN = /\s*(?:€|EUR)\s*$/iu
const DECIMAL_DIGIT_PATTERN = /^\d+$/
const COMMA_GROUPING_PATTERN = /^\d{1,3}(?:,\d{3})+$/
const DOT_GROUPING_PATTERN = /^\d{1,3}(?:\.\d{3})+$/
const NUMBER_BODY_PATTERN = /^[\d.,]+$/

type DecimalParts = {
  readonly major: string
  readonly minor: string
}

export const euroCentsFromMinorUnits = (value: bigint): EuroCents => value as EuroCents

export const euroCentsFromNumberMinorUnits = (
  value: number,
): Result<EuroCents, MoneyParseError> => {
  if (!Number.isInteger(value)) {
    return Result.Error({ _tag: 'InvalidFormat', input: String(value) })
  }

  if (!Number.isSafeInteger(value)) {
    return Result.Error({ _tag: 'UnsafeNumber', value })
  }

  return Result.Ok(euroCentsFromMinorUnits(BigInt(value)))
}

export const createEuroCentsJsonSchema = ({
  minimum = 'none',
  minimumError,
}: EuroCentsJsonSchemaOptions = {}) =>
  euroCentsJsonNumberSchema(minimum, minimumError).transform((value, ctx) => {
    const result = euroCentsFromNumberMinorUnits(value)

    /* v8 ignore next 7 -- the preceding Zod checks keep this defensive guard unreachable. */
    if (result.isError()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `money.${result.error._tag}`,
      })

      return z.NEVER
    }

    return result.value
  })

export const EuroCentsJsonSchema = createEuroCentsJsonSchema()
export const NonNegativeEuroCentsJsonSchema = createEuroCentsJsonSchema({
  minimum: 'nonnegative',
})
export const PositiveEuroCentsJsonSchema = createEuroCentsJsonSchema({
  minimum: 'positive',
})

export const euroCentsToMinorUnits = (value: EuroCents): bigint => value

export const serializeEuroCentsToNumber = (value: EuroCents): Result<number, MoneyFormatError> => {
  const minorUnits = euroCentsToMinorUnits(value)

  if (minorUnits > MAX_SAFE_INTEGER_BIGINT || minorUnits < MIN_SAFE_INTEGER_BIGINT) {
    return Result.Error({ _tag: 'UnsafeNumber', value: minorUnits })
  }

  return Result.Ok(Number(minorUnits))
}

export const parseEuroCents = (input: string): Result<EuroCents, MoneyParseError> => {
  const withoutCurrency = input.trim().replace(CURRENCY_SUFFIX_PATTERN, '').trim()

  if (withoutCurrency.length === 0) {
    return Result.Error({ _tag: 'EmptyInput' })
  }

  const sign = withoutCurrency.startsWith('-') ? -1n : 1n
  const unsigned = sign === -1n ? withoutCurrency.slice(1).trim() : withoutCurrency

  if (unsigned.length === 0 || unsigned.startsWith('-')) {
    return Result.Error({ _tag: 'InvalidFormat', input })
  }

  const normalized = unsigned.replace(GROUPING_SEPARATORS_PATTERN, '')

  if (normalized.length === 0 || !NUMBER_BODY_PATTERN.test(normalized)) {
    return Result.Error({ _tag: 'InvalidFormat', input })
  }

  const parts = parseDecimalParts(normalized, input)

  if (parts.isError()) {
    return Result.Error(parts.error)
  }

  const major = BigInt(parts.value.major)
  const minor = BigInt(parts.value.minor.padEnd(2, '0'))
  const cents = sign * (major * CENTS_PER_EURO + minor)

  return Result.Ok(euroCentsFromMinorUnits(cents))
}

export const formatEuroCents = (
  value: EuroCents,
  options: FormatEuroCentsOptions = {},
): Result<string, MoneyFormatError> => {
  const serialized = serializeEuroCentsToNumber(value)

  if (serialized.isError()) {
    return Result.Error(serialized.error)
  }

  const formatter = new Intl.NumberFormat(options.locale ?? 'fr-FR', {
    currency: 'EUR',
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  })

  return Result.Ok(formatter.format(serialized.value / 100))
}

export const addEuroCents = (left: EuroCents, right: EuroCents): EuroCents =>
  euroCentsFromMinorUnits(left + right)

export const subtractEuroCents = (left: EuroCents, right: EuroCents): EuroCents =>
  euroCentsFromMinorUnits(left - right)

export const negateEuroCents = (value: EuroCents): EuroCents => euroCentsFromMinorUnits(-value)

export const compareEuroCents = (left: EuroCents, right: EuroCents): -1 | 0 | 1 => {
  if (left < right) {
    return -1
  }

  if (left > right) {
    return 1
  }

  return 0
}

export const isZeroEuroCents = (value: EuroCents): boolean => value === 0n
export const isPositiveEuroCents = (value: EuroCents): boolean => value > 0n
export const isNegativeEuroCents = (value: EuroCents): boolean => value < 0n

function euroCentsJsonBaseNumberSchema() {
  return z
    .number({ error: 'money.InvalidFormat' })
    .int({ error: 'money.InvalidFormat' })
    .safe({ error: 'money.UnsafeNumber' })
}

function euroCentsJsonNumberSchema(
  minimum: EuroCentsJsonSchemaMinimum,
  minimumError: string | undefined,
) {
  const baseSchema = euroCentsJsonBaseNumberSchema()

  if (minimum === 'nonnegative') {
    return baseSchema.nonnegative({ error: minimumError ?? 'money.NegativeAmount' })
  }

  if (minimum === 'positive') {
    return baseSchema.positive({ error: minimumError ?? 'money.PositiveAmount' })
  }

  return baseSchema
}

const parseDecimalParts = (
  normalized: string,
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  const commaIndexes = separatorIndexes(normalized, ',')
  const dotIndexes = separatorIndexes(normalized, '.')

  if (commaIndexes.length > 0 && dotIndexes.length > 0) {
    return parseMixedSeparators(normalized, commaIndexes, dotIndexes, originalInput)
  }

  if (commaIndexes.length > 0) {
    return parseCommaOnly(normalized, commaIndexes, originalInput)
  }

  if (dotIndexes.length > 0) {
    return parseDotOnly(normalized, dotIndexes, originalInput)
  }

  return Result.Ok({ major: normalized, minor: '' })
}

const parseMixedSeparators = (
  normalized: string,
  commaIndexes: readonly number[],
  dotIndexes: readonly number[],
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  const decimalSeparator =
    lastIndex(commaIndexes) > lastIndex(dotIndexes) ? (',' as const) : ('.' as const)
  const groupingSeparator = decimalSeparator === ',' ? '.' : ','
  const decimalIndexes = decimalSeparator === ',' ? commaIndexes : dotIndexes

  if (decimalIndexes.length > 1) {
    return Result.Error({ _tag: 'InvalidFormat', input: originalInput })
  }

  return splitWithDecimalSeparator(
    normalized,
    groupingSeparator,
    lastIndex(decimalIndexes),
    originalInput,
  )
}

const parseCommaOnly = (
  normalized: string,
  commaIndexes: readonly number[],
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  if (commaIndexes.length > 1) {
    return Result.Error({ _tag: 'InvalidFormat', input: originalInput })
  }

  return splitWithoutGrouping(normalized, commaIndexes[0] as number, originalInput)
}

const parseDotOnly = (
  normalized: string,
  dotIndexes: readonly number[],
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  if (dotIndexes.length > 1) {
    return Result.Error({ _tag: 'InvalidFormat', input: originalInput })
  }

  const dotIndex = dotIndexes[0] as number

  const suffixLength = normalized.length - dotIndex - 1

  if (suffixLength > 2) {
    return Result.Error({ _tag: 'InvalidFormat', input: originalInput })
  }

  return splitWithoutGrouping(normalized, dotIndex, originalInput)
}

const splitWithDecimalSeparator = (
  normalized: string,
  groupingSeparator: ',' | '.',
  decimalIndex: number,
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  const majorWithGrouping = normalized.slice(0, decimalIndex)
  const minor = normalized.slice(decimalIndex + 1)

  if (!hasValidFraction(minor)) {
    return fractionError(minor, originalInput)
  }

  if (!hasValidGrouping(majorWithGrouping, groupingSeparator)) {
    return Result.Error({ _tag: 'InvalidFormat', input: originalInput })
  }

  const major = majorWithGrouping.replaceAll(groupingSeparator, '')

  return Result.Ok({ major, minor })
}

const splitWithoutGrouping = (
  normalized: string,
  decimalIndex: number,
  originalInput: string,
): Result<DecimalParts, MoneyParseError> => {
  const major = normalized.slice(0, decimalIndex)
  const minor = normalized.slice(decimalIndex + 1)

  if (!hasValidFraction(minor)) {
    return fractionError(minor, originalInput)
  }

  return hasValidMajor(major)
    ? Result.Ok({ major, minor })
    : Result.Error({ _tag: 'InvalidFormat', input: originalInput })
}

const hasValidMajor = (major: string): boolean => DECIMAL_DIGIT_PATTERN.test(major)

const hasValidFraction = (minor: string): boolean =>
  minor.length > 0 && minor.length <= 2 && DECIMAL_DIGIT_PATTERN.test(minor)

const fractionError = (minor: string, input: string): Result<DecimalParts, MoneyParseError> =>
  DECIMAL_DIGIT_PATTERN.test(minor) && minor.length > 2
    ? Result.Error({ _tag: 'TooManyFractionDigits', input })
    : Result.Error({ _tag: 'InvalidFormat', input })

const hasValidGrouping = (majorWithGrouping: string, groupingSeparator: ',' | '.'): boolean =>
  groupingSeparator === ','
    ? COMMA_GROUPING_PATTERN.test(majorWithGrouping)
    : DOT_GROUPING_PATTERN.test(majorWithGrouping)

const separatorIndexes = (value: string, separator: ',' | '.'): readonly number[] => {
  const indexes: number[] = []

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === separator) {
      indexes.push(index)
    }
  }

  return indexes
}

const lastIndex = (indexes: readonly number[]): number => indexes[indexes.length - 1] as number
