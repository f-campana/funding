import { euroCentsFromMinorUnits, InvestorIdSchema } from '@repo/domain'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { InvestorRow, type InvestorRowData, type InvestorRowProps } from './investor-row'

const labels = {
  amount: 'Commitment',
  collapse: 'Collapse investor details',
  country: 'Country',
  entityType: 'Entity type',
  expand: 'Expand investor details',
  qualification: 'Qualification',
  qualificationType: {
    informed: 'Informed investor',
    non_eligible: 'Not eligible',
    professional: 'Professional investor',
  },
  status: {
    committed: 'Committed',
    invited: 'Invited',
    kyc_pending: 'KYC pending',
    reviewing: 'Reviewing',
    signed: 'Signed',
    wired: 'Wired',
  },
} satisfies InvestorRowProps['labels']

const investor: InvestorRowData = {
  committedAmount: euroCentsFromMinorUnits(125_000_00n),
  country: 'FR',
  details: [
    {
      description: 'Proof of address is expired and must be refreshed before signing.',
      id: 'kyc',
      label: 'KYC documents',
      tone: 'warning',
      value: 'Blocked',
    },
    {
      id: 'next-action',
      label: 'Next action',
      value: 'Request updated proof of address',
    },
  ],
  entityType: 'individual',
  id: InvestorIdSchema.parse('4210e398-2416-42a6-8527-d612d27ed7d0'),
  name: 'Ariane Dupont',
  qualificationType: 'professional',
  status: 'wired',
}

const normalizeFrenchNumber = (value: string) => value.replace(/\u00a0|\u202f/g, ' ')
const EURO_SYMBOL_PATTERN = /€/

describe('InvestorRow', () => {
  it('renders the row summary with labels and formatted amount', () => {
    const { container } = render(<InvestorRow investor={investor} labels={labels} />)

    const row = container.querySelector('[data-slot="investor-row"]')

    expect(row).toHaveAttribute('data-state', 'closed')
    expect(screen.getByRole('heading', { name: investor.name })).toBeInTheDocument()
    expect(screen.getByText('FR')).toBeInTheDocument()
    expect(screen.getByText('Wired')).toBeInTheDocument()
    expect(screen.getByText('Professional investor')).toBeInTheDocument()
    expect(screen.getByText(labels.country)).toHaveClass('md:sr-only')
    expect(screen.getByText(labels.qualification)).toHaveClass('md:sr-only')
    expect(screen.getByText(labels.amount)).toHaveClass('md:sr-only')
    expect(normalizeFrenchNumber(screen.getByText(EURO_SYMBOL_PATTERN).textContent ?? '')).toBe(
      '125 000,00 €',
    )
  })

  it('toggles disclosure state with an accessible button', async () => {
    const user = userEvent.setup()
    const { container } = render(<InvestorRow investor={investor} labels={labels} />)

    const expandButton = screen.getByRole('button', { name: labels.expand })

    expect(expandButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('KYC documents')).not.toBeInTheDocument()

    await user.click(expandButton)

    expect(container.querySelector('[data-slot="investor-row"]')).toHaveAttribute(
      'data-state',
      'open',
    )
    expect(screen.getByRole('button', { name: labels.collapse })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('KYC documents')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: labels.collapse }))

    await waitFor(() => {
      expect(screen.queryByText('KYC documents')).not.toBeInTheDocument()
    })
    expect(container.querySelector('[data-slot="investor-row"]')).toHaveAttribute(
      'data-state',
      'closed',
    )
  })

  it('renders optional operational detail instead of repeating the summary fields', async () => {
    const user = userEvent.setup()
    const { container } = render(<InvestorRow investor={investor} labels={labels} />)

    await user.click(screen.getByRole('button', { name: labels.expand }))

    expect(container.querySelector('[data-slot="investor-row-details"]')).toBeInTheDocument()
    expect(screen.getByText('KYC documents')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Request updated proof of address')).toBeInTheDocument()
    expect(screen.queryByText(labels.entityType)).not.toBeInTheDocument()
    expect(screen.queryByText('individual')).not.toBeInTheDocument()
  })

  it('has no accessibility violations when closed and open', async () => {
    const user = userEvent.setup()
    const { container } = render(<InvestorRow investor={investor} labels={labels} />)

    expect((await axe(container)).violations).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: labels.expand }))

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
