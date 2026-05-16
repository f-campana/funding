import { euroCentsFromMinorUnits } from '@repo/domain'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { type ClosingReadinessState, ClosingReadinessSummary } from './closing-readiness-summary'

const labels = {
  blockers: 'blockers',
  closingDate: 'Closing review',
  deadline: 'Deadline',
  lastUpdated: 'Last updated',
  remaining: 'Remaining',
}

const remainingAmountPattern = /625\s?000,00/

const renderSummary = (state: ClosingReadinessState) =>
  render(
    <ClosingReadinessSummary
      blockerCount={state === 'blocked' ? 3 : 0}
      closingDateLabel="24 May 2026"
      deadlineLabel="5 days"
      description="Operational readiness for the next close."
      labels={labels}
      lastUpdatedLabel="10 May 2026, 09:30"
      remainingAmount={euroCentsFromMinorUnits(625_000_00n)}
      state={state}
      title={`Readiness ${state}`}
    />,
  )

describe('ClosingReadinessSummary', () => {
  it.each<ClosingReadinessState>([
    'ready',
    'attention',
    'blocked',
    'not_started',
  ])('renders %s with the semantic state contract', (state) => {
    const { container } = renderSummary(state)

    expect(container.querySelector('[data-slot="closing-readiness-summary"]')).toHaveAttribute(
      'data-state',
      state,
    )
    expect(screen.getByRole('heading', { name: `Readiness ${state}` })).toBeInTheDocument()
  })

  it('renders operational labels and remaining money', () => {
    renderSummary('blocked')

    expect(screen.getByText('3 blockers')).toBeInTheDocument()
    expect(screen.getByText('24 May 2026')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
    expect(screen.getByText('10 May 2026, 09:30')).toBeInTheDocument()
    expect(screen.getByText(remainingAmountPattern)).toBeInTheDocument()
  })

  it('has no obvious accessibility violations', async () => {
    const { container } = renderSummary('blocked')

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
