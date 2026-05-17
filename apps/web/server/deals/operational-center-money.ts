import { Result } from '@repo/core'
import { type EuroCents, euroCentsToMinorUnits, serializeEuroCentsToNumber } from '@repo/domain'

import type { MoneyMinorUnitsDTO, MoneySerializationErrorDTO } from './operational-center-dto'

export type MoneySerializationResult<T> = Result<T, MoneySerializationErrorDTO>

export const money = (
  value: EuroCents,
  field: string,
): MoneySerializationResult<MoneyMinorUnitsDTO> =>
  serializeEuroCentsToNumber(value).match({
    Error: () =>
      Result.Error({
        _tag: 'UnsafeMoneyAmount',
        amountMinor: euroCentsToMinorUnits(value).toString(),
        field,
      }),
    Ok: (amountMinor) => Result.Ok({ amountMinor, currency: 'EUR' }),
  })

export const firstError = <ErrorValue>(errors: readonly ErrorValue[]): ErrorValue => {
  const [first] = errors

  if (first === undefined) {
    throw new Error('Expected at least one Result error')
  }

  return first
}

type MoneyField<Key extends string> = {
  readonly key: Key
  readonly field: string
  readonly value: EuroCents
}

type MoneyFieldValues<Fields extends readonly MoneyField<string>[]> = {
  readonly [Field in Fields[number] as Field['key']]: MoneyMinorUnitsDTO
}

export const mapMoneyFields = <const Fields extends readonly MoneyField<string>[]>(
  fields: Fields,
): MoneySerializationResult<MoneyFieldValues<Fields>> =>
  Result.traverse(fields, ({ field, key, value }) =>
    money(value, field).map((amount) => [key, amount] as const),
  )
    .mapError(firstError)
    .map((entries) => Object.fromEntries(entries) as MoneyFieldValues<Fields>)
