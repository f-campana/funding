import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  northstarActivityItems,
  northstarDocumentRequirements,
  northstarDomainClosingBlockersByState,
  northstarInvestorOperationsRecords,
} from '../fixtures'
import { axe } from '../test/axe'
import { CommitmentInspector } from './commitment-inspector'

const labels = {
  actions: 'Actions',
  activity: 'Activity',
  approve: 'Approve',
  blockers: 'Blockers',
  commitment: 'Commitment',
  documentStatus: {
    approved: 'Approved',
    expired: 'Expired',
    missing: 'Missing',
    rejected: 'Rejected',
    under_review: 'Under review',
    uploaded: 'Uploaded',
  },
  documents: 'Documents',
  empty: 'Select an investor to inspect.',
  identity: 'Identity',
  legalEntity: 'Legal entity',
  noActivity: 'No recent activity.',
  noBlockers: 'No blockers.',
  noDocuments: 'No documents.',
  noLegalEntity: 'Direct investor',
  openDocuments: 'Open documents',
  remind: 'Send reminder',
  status: {
    commitment: 'Commitment',
    kyb: 'KYB',
    kyc: 'KYC',
    signature: 'Signature',
    wire: 'Wire',
  },
  statuses: 'Statuses',
}

describe('CommitmentInspector', () => {
  it('renders selected investor identity, statuses, blockers, documents, and activity', () => {
    const record = northstarInvestorOperationsRecords.find((candidate) =>
      candidate.blockerIds.includes('elise-kyc'),
    )

    if (record === undefined) {
      throw new Error('expected Elise fixture record')
    }

    render(
      <CommitmentInspector
        activityItems={northstarActivityItems}
        blockers={northstarDomainClosingBlockersByState.blocked}
        documentRequirements={northstarDocumentRequirements}
        labels={labels}
        record={record}
        title="Commitment inspector"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Commitment inspector' })).toBeInTheDocument()
    expect(screen.getByText('Elise Martin')).toBeInTheDocument()
    expect(screen.getByText('KYC evidence blocks signing')).toBeInTheDocument()
    expect(screen.getByText('Elise Martin proof of address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reminder' })).toBeInTheDocument()
  })

  it('renders an empty state', () => {
    render(<CommitmentInspector labels={labels} title="Commitment inspector" />)

    expect(screen.getByText('Select an investor to inspect.')).toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const record = northstarInvestorOperationsRecords[2]

    if (record === undefined) {
      throw new Error('expected blocked fixture record')
    }

    const { container } = render(
      <CommitmentInspector
        activityItems={northstarActivityItems}
        blockers={northstarDomainClosingBlockersByState.blocked}
        documentRequirements={northstarDocumentRequirements}
        labels={labels}
        record={record}
        title="Commitment inspector"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
