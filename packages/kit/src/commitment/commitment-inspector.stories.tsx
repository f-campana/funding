import {
  northstarActivityItems,
  northstarDocumentRequirements,
  northstarDomainClosingBlockersByState,
  northstarInvestorOperationsRecords,
} from '../fixtures'
import { StorySection } from '../stories/story-layout'
import { CommitmentInspector } from './commitment-inspector'

const meta = {
  component: CommitmentInspector,
  title: 'Kit/Commitment/CommitmentInspector',
}

export default meta

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

const getInvestorRecord = (index: number) => {
  const record = northstarInvestorOperationsRecords[index]

  if (record === undefined) {
    throw new Error(`Missing investor fixture at index ${index}`)
  }

  return record
}

export const BlockedInvestor = {
  render: () => (
    <StorySection title="Blocked investor inspector">
      <div className="w-full max-w-sm">
        <CommitmentInspector
          activityItems={northstarActivityItems}
          blockers={northstarDomainClosingBlockersByState.blocked}
          documentRequirements={northstarDocumentRequirements}
          labels={labels}
          record={getInvestorRecord(2)}
          title="Commitment inspector"
        />
      </div>
    </StorySection>
  ),
}

export const Empty = {
  render: () => (
    <StorySection title="No selected investor">
      <div className="w-full max-w-sm">
        <CommitmentInspector labels={labels} title="Commitment inspector" />
      </div>
    </StorySection>
  ),
}

export const ReconciledInvestor = {
  render: () => (
    <StorySection title="Reconciled investor inspector">
      <div className="w-full max-w-sm">
        <CommitmentInspector
          activityItems={northstarActivityItems}
          blockers={northstarDomainClosingBlockersByState.ready}
          documentRequirements={northstarDocumentRequirements.filter(
            (requirement) => requirement.status === 'approved',
          )}
          labels={labels}
          record={getInvestorRecord(0)}
          title="Commitment inspector"
        />
      </div>
    </StorySection>
  ),
}
