import type { EuroCents, FormatEuroCentsOptions } from '@repo/domain'
import { formatEuroCents } from '@repo/domain'
import { cn } from '@repo/ui'

export type MoneyDisplayProps = {
  readonly amount: EuroCents
  readonly locale?: string
  readonly currencyDisplay?: FormatEuroCentsOptions['currencyDisplay']
  readonly fallback?: string
  readonly className?: string
}

export const MoneyDisplay = ({
  amount,
  className,
  currencyDisplay,
  fallback = '-',
  locale = 'fr-FR',
}: MoneyDisplayProps) => {
  const formatOptions = currencyDisplay === undefined ? { locale } : { currencyDisplay, locale }
  const formatted = formatEuroCents(amount, formatOptions)
  const state = formatted.isError() ? 'error' : 'ready'
  const value = formatted.isError() ? fallback : formatted.value

  return (
    <span
      className={cn('font-mono tabular-nums', className)}
      data-slot="money-display"
      data-state={state}
    >
      {value}
    </span>
  )
}
