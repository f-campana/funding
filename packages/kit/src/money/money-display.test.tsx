import { euroCentsFromMinorUnits } from '@repo/domain'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MoneyDisplay } from './money-display'

const normalizeFrenchNumber = (value: string) => value.replace(/\u00a0|\u202f/g, ' ')
const EURO_SYMBOL_PATTERN = /€/
const EUR_CODE_PATTERN = /EUR/

describe('MoneyDisplay', () => {
  it('formats exact cents with the default fr-FR locale', () => {
    render(<MoneyDisplay amount={euroCentsFromMinorUnits(123_456n)} />)

    const money = screen.getByText(EURO_SYMBOL_PATTERN)

    expect(normalizeFrenchNumber(money.textContent ?? '')).toBe('1 234,56 €')
    expect(money).toHaveAttribute('data-slot', 'money-display')
    expect(money).toHaveAttribute('data-state', 'ready')
    expect(money).toHaveClass('font-mono')
    expect(money).toHaveClass('tabular-nums')
  })

  it('formats exact cents with an explicit en-US locale', () => {
    render(<MoneyDisplay amount={euroCentsFromMinorUnits(123_456n)} locale="en-US" />)

    expect(screen.getByText('€1,234.56')).toHaveAttribute('data-state', 'ready')
  })

  it('supports currency code display', () => {
    render(<MoneyDisplay amount={euroCentsFromMinorUnits(123_456n)} currencyDisplay="code" />)

    expect(normalizeFrenchNumber(screen.getByText(EUR_CODE_PATTERN).textContent ?? '')).toBe(
      '1 234,56 EUR',
    )
  })

  it('renders fallback content when the amount cannot be safely formatted', () => {
    render(
      <MoneyDisplay
        amount={euroCentsFromMinorUnits(BigInt(Number.MAX_SAFE_INTEGER) + 1n)}
        fallback="Unavailable"
      />,
    )

    const money = screen.getByText('Unavailable')

    expect(money).toHaveAttribute('data-state', 'error')
  })
})
