import { Result } from '@repo/core'
import { type EuroCents, euroCentsToMinorUnits, serializeEuroCentsToNumber } from '@repo/domain'

import type { MoneyMinorUnitsDTO, MoneySerializationErrorDTO } from './operational-center-dto'

export type MoneySerializationResult<T> = Result<T, MoneySerializationErrorDTO>

export const money = (
  value: EuroCents,
  field: string,
): MoneySerializationResult<MoneyMinorUnitsDTO> =>
  serializeEuroCentsToNumber(value)
    .map((amountMinor) => ({ amountMinor, currency: 'EUR' as const }))
    .mapError(() => ({
      _tag: 'UnsafeMoneyAmount',
      amountMinor: euroCentsToMinorUnits(value).toString(),
      field,
    }))

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
): MoneySerializationResult<MoneyFieldValues<Fields>> => {
  const entries: [string, MoneyMinorUnitsDTO][] = []

  for (const { field, key, value } of fields) {
    const amount = money(value, field)

    if (amount.isError()) {
      return Result.Error(amount.error)
    }

    entries.push([key, amount.value])
  }

  return Result.Ok(Object.fromEntries(entries) as MoneyFieldValues<Fields>)
}
