import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { northstarInvestorOperationsRecords } from '../fixtures'
import { axe } from '../test/axe'
import { InvestorOperationsTable } from './investor-operations-table'

const labels = {
  columns: {
    actions: 'Actions',
    commitmentAmount: 'Commitment',
    commitmentStatus: 'Commitment status',
    investor: 'Investor',
    kyb: 'KYB',
    kyc: 'KYC',
    legalEntity: 'Legal entity',
    signature: 'Signature',
    wire: 'Wire',
  },
  empty: 'No investor operations records.',
  inspectAction: 'Inspect',
  noLegalEntity: 'Direct investor',
  notApplicable: 'N/A',
}

describe('InvestorOperationsTable', () => {
  it('renders investor operation columns and statuses', () => {
    const { container } = render(
      <InvestorOperationsTable
        labels={labels}
        records={northstarInvestorOperationsRecords}
        title="Investor operations"
      />,
    )

    expect(container.querySelector('[data-slot="investor-operations-table"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Investor operations' })).toBeInTheDocument()
    expect(screen.getByText('Camille Moreau')).toBeInTheDocument()
    expect(screen.getByText('Elise Martin')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getAllByText('Reconciled').length).toBeGreaterThan(0)
  })

  it('calls the row inspection handler', async () => {
    const user = userEvent.setup()
    const onSelectRecord = vi.fn()

    render(
      <InvestorOperationsTable
        labels={labels}
        onSelectRecord={onSelectRecord}
        records={northstarInvestorOperationsRecords.slice(0, 1)}
        title="Investor operations"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Inspect' }))

    expect(onSelectRecord).toHaveBeenCalledWith(northstarInvestorOperationsRecords.at(0))
  })

  it('renders an empty state', () => {
    render(<InvestorOperationsTable labels={labels} records={[]} title="Investor operations" />)

    expect(screen.getByText('No investor operations records.')).toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <InvestorOperationsTable
        labels={labels}
        records={northstarInvestorOperationsRecords}
        title="Investor operations"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
