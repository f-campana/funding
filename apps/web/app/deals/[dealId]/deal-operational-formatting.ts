import type { MoneyMinorUnitsDTO } from '@/server/deals'

export const formatMoney = (money: MoneyMinorUnitsDTO): string =>
  new Intl.NumberFormat('en-US', {
    currency: money.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(money.amountMinor / 100)

export const formatDateTimeLabel = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date(value))

export const countLabel = (count: number, noun: string): string | undefined =>
  count > 0 ? `${count} ${pluralize(count, noun)}` : undefined

export const pluralize = (count: number, noun: string): string => (count === 1 ? noun : `${noun}s`)
