import { euroCentsFromMinorUnits } from '@repo/domain'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { TicketDistribution, type TicketDistributionSegment } from './ticket-distribution'

const segments: readonly TicketDistributionSegment[] = [
  {
    amount: euroCentsFromMinorUnits(1_275_000_00n),
    id: 'large',
    investorCount: 2,
    label: '500k plus tickets',
    percentageBasisPoints: 6800,
  },
  {
    amount: euroCentsFromMinorUnits(525_000_00n),
    id: 'core',
    investorCount: 3,
    label: '100k to 499k tickets',
    percentageBasisPoints: 2800,
  },
]

const normalizeFrenchNumber = (value: string) => value.replace(/\u00a0|\u202f/g, ' ')

describe('TicketDistribution', () => {
  it('renders chart-backed ticket segments with exact money amounts', () => {
    const { container } = render(
      <TicketDistribution
        amountLabel="Amount"
        investorCountLabel="investors"
        percentageLabel="Share"
        segments={segments}
        title="Ticket distribution"
      />,
    )

    const moneyDisplays = Array.from(container.querySelectorAll('[data-slot="money-display"]'))

    expect(container.querySelector('[data-slot="ticket-distribution"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="ticket-distribution-chart"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-container"]')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ticket distribution' })).toBeInTheDocument()
    expect(screen.getByText('500k plus tickets')).toBeInTheDocument()
    expect(screen.getByText('2 investors')).toBeInTheDocument()
    expect(screen.getByText('68%')).toBeInTheDocument()
    expect(moneyDisplays.map((node) => normalizeFrenchNumber(node.textContent ?? ''))).toEqual([
      '1 275 000,00 €',
      '525 000,00 €',
    ])
  })

  it('renders an empty state without chart rows', () => {
    const { container } = render(
      <TicketDistribution
        emptyLabel="No committed tickets yet."
        segments={[]}
        title="Ticket distribution"
      />,
    )

    expect(screen.getByText('No committed tickets yet.')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="ticket-distribution-chart"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="ticket-distribution-segment"]'),
    ).not.toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <TicketDistribution
        amountLabel="Amount"
        investorCountLabel="investors"
        percentageLabel="Share"
        segments={segments}
        title="Ticket distribution"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
