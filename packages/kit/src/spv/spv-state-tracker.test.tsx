import { SPV_STATUSES, type SpvStatus } from '@repo/domain'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { SpvStateTracker } from './spv-state-tracker'

const labels = {
  closed: 'Closed',
  collecting: 'Collecting',
  draft: 'Draft',
  e_signatures: 'E-signatures',
  incorporated: 'Incorporated',
  kyc_in_progress: 'KYC in progress',
  open: 'Open',
} satisfies Record<SpvStatus, string>

describe('SpvStateTracker', () => {
  it('renders all statuses in SPV_STATUSES order', () => {
    render(<SpvStateTracker currentStatus="collecting" labels={labels} />)

    const list = screen.getByRole('list', { name: 'Collecting' })
    expect(list).toHaveAttribute('data-variant', 'horizontal')
    const renderedLabels = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)

    expect(renderedLabels).toEqual(
      SPV_STATUSES.map((status, index) => `${labels[status]}${index + 1}`),
    )
  })

  it.each([
    ['draft', 'complete'],
    ['open', 'complete'],
    ['kyc_in_progress', 'complete'],
    ['e_signatures', 'current'],
    ['collecting', 'pending'],
    ['incorporated', 'pending'],
    ['closed', 'pending'],
  ] satisfies readonly [
    SpvStatus,
    'complete' | 'current' | 'pending',
  ][])('marks %s as %s for the current status', (status, expectedState) => {
    render(<SpvStateTracker currentStatus="e_signatures" labels={labels} />)

    expect(screen.getByText(labels[status]).closest('li')).toHaveAttribute(
      'data-state',
      expectedState,
    )
  })

  it('renders compact variant for constrained sidebar contexts', () => {
    render(<SpvStateTracker currentStatus="collecting" labels={labels} variant="compact" />)

    const list = screen.getByRole('list', { name: 'Collecting' })

    expect(list).toHaveAttribute('data-variant', 'compact')
    expect(within(list).getAllByRole('listitem')).toHaveLength(SPV_STATUSES.length)
    expect(screen.getByText('Collecting').closest('li')).toHaveAttribute('data-state', 'current')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<SpvStateTracker currentStatus="e_signatures" labels={labels} />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
