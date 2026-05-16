import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { type ClosingBlocker, ClosingBlockerQueue } from './closing-blocker-queue'

const labels = {
  acknowledge: 'Acknowledge locally',
  acknowledged: 'Acknowledged locally',
  dueState: {
    due_soon: 'Due soon',
    due_today: 'Due today',
    no_due_date: 'No due date',
    on_track: 'On track',
    overdue: 'Overdue',
  },
  empty: 'No closing blockers.',
  hideDetails: 'Hide details',
  nextAction: 'Next action',
  owner: 'Owner',
  severity: {
    critical: 'Critical',
    info: 'Info',
    warning: 'Warning',
  },
  showDetails: 'Show details',
}

const blockers: readonly ClosingBlocker[] = [
  {
    detail: 'Matched wire review can happen after the critical evidence clears.',
    dueState: 'due_soon',
    id: 'payment',
    kind: 'payment_match',
    nextAction: 'Review unmatched receipt',
    owner: 'finance',
    severity: 'warning',
    title: 'Wire receipt needs matching',
  },
  {
    detail: 'Proof of address is stale for subscription signing.',
    dueState: 'overdue',
    id: 'kyc',
    investorName: 'Elise Martin',
    kind: 'kyc',
    nextAction: 'Review uploaded address document',
    owner: 'compliance',
    reference: 'KYC-ELISE-2026',
    severity: 'critical',
    title: 'KYC evidence blocks signing',
  },
  {
    detail: 'Closing memo can be attached after finance review.',
    dueState: 'no_due_date',
    id: 'memo',
    kind: 'audit_file',
    nextAction: 'Attach memo to audit file',
    owner: 'operations',
    severity: 'info',
    title: 'Audit file memo pending',
  },
]

describe('ClosingBlockerQueue', () => {
  it('sorts blockers by severity and due state', () => {
    render(<ClosingBlockerQueue blockers={blockers} labels={labels} title="Closing blockers" />)

    const items = screen.getAllByRole('listitem')

    expect(
      within(items[0] as HTMLElement).getByText('KYC evidence blocks signing'),
    ).toBeInTheDocument()
    expect(
      within(items[1] as HTMLElement).getByText('Wire receipt needs matching'),
    ).toBeInTheDocument()
    expect(within(items[2] as HTMLElement).getByText('Audit file memo pending')).toBeInTheDocument()
  })

  it('renders an accessible empty state', () => {
    render(<ClosingBlockerQueue blockers={[]} labels={labels} title="Closing blockers" />)

    expect(screen.getByText('No closing blockers.')).toBeInTheDocument()
  })

  it('expands details and toggles local acknowledgement', async () => {
    const user = userEvent.setup()
    render(<ClosingBlockerQueue blockers={blockers} labels={labels} title="Closing blockers" />)

    const detailButton = screen.getAllByRole('button', { name: 'Show details' })[0]
    expect(detailButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(detailButton as HTMLElement)

    expect(detailButton).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByText('Proof of address is stale for subscription signing.'),
    ).toBeInTheDocument()

    const acknowledgeButton = screen.getAllByRole('button', { name: 'Acknowledge locally' })[0]
    await user.click(acknowledgeButton as HTMLElement)
    expect(screen.getByRole('button', { name: 'Acknowledged locally' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Acknowledged locally' }))
    expect(screen.getAllByRole('button', { name: 'Acknowledge locally' })[0]).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('has no obvious accessibility violations', async () => {
    const { container } = render(
      <ClosingBlockerQueue blockers={blockers} labels={labels} title="Closing blockers" />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
