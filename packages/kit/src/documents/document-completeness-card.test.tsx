import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { northstarDocumentCompletenessSummary, northstarDocumentRequirements } from '../fixtures'
import { axe } from '../test/axe'
import { DocumentCompletenessCard } from './document-completeness-card'

const labels = {
  approved: 'approved',
  empty: 'No document requirements.',
  expired: 'Expired',
  missing: 'Missing',
  optional: 'Optional',
  owner: {
    deal: 'Deal',
    fund: 'Fund',
    investor: 'Investor',
    legal_entity: 'Legal entity',
    spv: 'SPV',
  },
  rejected: 'Rejected',
  required: 'Required',
  status: {
    approved: 'Approved',
    expired: 'Expired',
    missing: 'Missing',
    rejected: 'Rejected',
    under_review: 'Under review',
    uploaded: 'Uploaded',
  },
  underReview: 'Under review',
}

describe('DocumentCompletenessCard', () => {
  it('renders summary counts and requirement statuses', () => {
    render(
      <DocumentCompletenessCard
        labels={labels}
        requirements={northstarDocumentRequirements}
        summary={northstarDocumentCompletenessSummary}
        title="Documents"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByText('2/6 approved')).toBeInTheDocument()
    expect(screen.getByText('Rhine Ventures UBO declaration')).toBeInTheDocument()
    expect(screen.getByText('Elise Martin proof of address')).toBeInTheDocument()
    expect(screen.getAllByText('Missing').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0)
  })

  it('renders an empty state', () => {
    render(<DocumentCompletenessCard labels={labels} requirements={[]} title="Documents" />)

    expect(screen.getByText('No document requirements.')).toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <DocumentCompletenessCard
        labels={labels}
        requirements={northstarDocumentRequirements}
        title="Documents"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
