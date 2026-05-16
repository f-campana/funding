import { euroCentsFromMinorUnits } from '@repo/domain'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { DealProgressCard } from './deal-progress-card'

const labels = {
  committed: 'Committed',
  deadline: 'Deadline',
  lifecycle: 'Lifecycle',
  matched: 'Matched',
  nextAction: 'Next action',
  progress: 'Commitment progress',
  target: 'Target',
}

describe('DealProgressCard', () => {
  it('renders lifecycle, exact money, progress, deadline, and next action', () => {
    const { container } = render(
      <DealProgressCard
        committedAmount={euroCentsFromMinorUnits(1_250_000_00n)}
        deadlineLabel="24 May 2026"
        labels={labels}
        lifecycleState="awaiting_wires"
        matchedAmount={euroCentsFromMinorUnits(750_000_00n)}
        nextActionLabel="Resolve wire matching"
        targetAmount={euroCentsFromMinorUnits(2_500_000_00n)}
        title="Deal progress"
      />,
    )

    expect(container.querySelector('[data-slot="deal-progress-card"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Deal progress' })).toBeInTheDocument()
    expect(screen.getByText('Awaiting wires')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Commitment progress' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
    expect(screen.getByText('Resolve wire matching')).toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <DealProgressCard
        committedAmount={euroCentsFromMinorUnits(2_500_000_00n)}
        deadlineLabel="Ready now"
        labels={labels}
        lifecycleState="closing_review"
        matchedAmount={euroCentsFromMinorUnits(2_500_000_00n)}
        nextActionLabel="Proceed to close review"
        targetAmount={euroCentsFromMinorUnits(2_500_000_00n)}
        title="Deal progress"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
