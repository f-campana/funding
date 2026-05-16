import { euroCentsFromMinorUnits } from '@repo/domain'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { CommitmentProgress } from './commitment-progress'

const labels = {
  committed: 'Committed',
  investors: 'Investors',
  remaining: 'Remaining',
  target: 'Target',
  title: 'Commitment progress',
  velocity: '7 day movement',
}

const normalizeFrenchNumber = (value: string) => value.replace(/\u00a0|\u202f/g, ' ')

describe('CommitmentProgress', () => {
  it('renders committed and target amounts through MoneyDisplay', () => {
    const { container } = render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(5_000_000n)}
        investorCount={7}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(10_000_000n)}
      />,
    )

    const moneyDisplays = Array.from(container.querySelectorAll('[data-slot="money-display"]'))

    expect(container.querySelector('[data-slot="commitment-progress"]')).toBeInTheDocument()
    expect(moneyDisplays.map((node) => normalizeFrenchNumber(node.textContent ?? ''))).toEqual([
      '50 000,00 €',
      '100 000,00 €',
    ])
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('computes percentage from bigint minor units', () => {
    render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(3_333n)}
        investorCount={1}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(10_000n)}
      />,
    )

    expect(screen.getByRole('progressbar', { name: labels.title })).toHaveAttribute(
      'aria-valuenow',
      '33.33',
    )
  })

  it('clamps visual percentage above 100 percent', () => {
    render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(15_000n)}
        investorCount={1}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(10_000n)}
      />,
    )

    expect(screen.getByRole('progressbar', { name: labels.title })).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
  })

  it('clamps visual percentage below 0 percent', () => {
    render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(-1_000n)}
        investorCount={1}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(10_000n)}
      />,
    )

    expect(screen.getByRole('progressbar', { name: labels.title })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('handles a zero target without dividing by zero', () => {
    render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(15_000n)}
        investorCount={1}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(0n)}
      />,
    )

    expect(screen.getByRole('progressbar', { name: labels.title })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('renders optional remaining amount and velocity context', () => {
    const { container } = render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(5_000_000n)}
        investorCount={7}
        labels={labels}
        remainingAmount={euroCentsFromMinorUnits(5_000_000n)}
        targetAmount={euroCentsFromMinorUnits(10_000_000n)}
        velocity="+3 records"
      />,
    )

    const moneyDisplays = Array.from(container.querySelectorAll('[data-slot="money-display"]'))

    expect(screen.getByText(labels.remaining)).toBeInTheDocument()
    expect(screen.getByText(labels.velocity)).toBeInTheDocument()
    expect(screen.getByText('+3 records')).toBeInTheDocument()
    expect(moneyDisplays.map((node) => normalizeFrenchNumber(node.textContent ?? ''))).toEqual([
      '50 000,00 €',
      '100 000,00 €',
      '50 000,00 €',
    ])
  })

  it('has an accessible progress surface without violations', async () => {
    const { container } = render(
      <CommitmentProgress
        committedAmount={euroCentsFromMinorUnits(5_000_000n)}
        investorCount={7}
        labels={labels}
        targetAmount={euroCentsFromMinorUnits(10_000_000n)}
      />,
    )

    expect(screen.getByTitle('Commitment progress: 50%')).toBeInTheDocument()
    expect((await axe(container)).violations).toHaveLength(0)
  })
})
