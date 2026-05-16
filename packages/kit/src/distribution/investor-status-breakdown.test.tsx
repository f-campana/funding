import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import {
  InvestorStatusBreakdown,
  type InvestorStatusBreakdownItem,
} from './investor-status-breakdown'

const items: readonly InvestorStatusBreakdownItem[] = [
  {
    count: 2,
    id: 'ready',
    label: 'Signed or wired',
    percentageBasisPoints: 3334,
  },
  {
    count: 1,
    id: 'kyc',
    label: 'KYC pending',
    percentageBasisPoints: 1667,
  },
]

describe('InvestorStatusBreakdown', () => {
  it('renders chart-backed status rows', () => {
    const { container } = render(
      <InvestorStatusBreakdown
        countLabel="investors"
        items={items}
        percentageLabel="Share"
        title="Investor status"
      />,
    )

    expect(container.querySelector('[data-slot="investor-status-breakdown"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="investor-status-breakdown-chart"]'),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-container"]')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Investor status' })).toBeInTheDocument()
    expect(screen.getByText('Signed or wired')).toBeInTheDocument()
    expect(screen.getByText('2 investors')).toBeInTheDocument()
    expect(screen.getByText('33,3%')).toBeInTheDocument()
  })

  it('renders an empty state safely', () => {
    const { container } = render(
      <InvestorStatusBreakdown
        emptyLabel="No investor statuses yet."
        items={[]}
        title="Investor status"
      />,
    )

    expect(screen.getByText('No investor statuses yet.')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="investor-status-breakdown-chart"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="investor-status-breakdown-item"]'),
    ).not.toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <InvestorStatusBreakdown
        countLabel="investors"
        items={items}
        percentageLabel="Share"
        title="Investor status"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
