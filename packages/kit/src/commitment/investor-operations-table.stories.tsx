import { northstarInvestorOperationsRecords } from '../fixtures'
import { StorySection } from '../stories/story-layout'
import { InvestorOperationsTable } from './investor-operations-table'

const meta = {
  component: InvestorOperationsTable,
  title: 'Kit/Commitment/InvestorOperationsTable',
}

export default meta

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

export const Default = {
  render: () => (
    <StorySection
      description="Operational table for commitments, KYC/KYB, signatures, wires, and inspection."
      title="Investor operations"
    >
      <div className="w-full max-w-7xl">
        <InvestorOperationsTable
          labels={labels}
          records={northstarInvestorOperationsRecords}
          selectedRecordId="ec331d48-94b9-4655-a11d-b011401d38b3"
          title="Investor operations"
        />
      </div>
    </StorySection>
  ),
}

export const Empty = {
  render: () => (
    <StorySection title="Empty investor operations">
      <div className="w-full max-w-4xl">
        <InvestorOperationsTable labels={labels} records={[]} title="Investor operations" />
      </div>
    </StorySection>
  ),
}

export const BlockedSelected = {
  render: () => (
    <StorySection title="Blocked selected investor">
      <div className="w-full max-w-7xl">
        <InvestorOperationsTable
          labels={labels}
          records={northstarInvestorOperationsRecords}
          selectedRecordId="ec331d48-94b9-4655-a11d-b011401d38b3"
          title="Investor operations"
        />
      </div>
    </StorySection>
  ),
}

export const ReadyRecords = {
  render: () => (
    <StorySection title="Ready / reconciled records">
      <div className="w-full max-w-7xl">
        <InvestorOperationsTable
          labels={labels}
          records={northstarInvestorOperationsRecords.filter(
            (record) => record.commitmentStatus === 'reconciled' || record.kycStatus === 'approved',
          )}
          selectedRecordId="a36ad8a4-828c-4e9a-9e61-8dd5f60edc4a"
          title="Investor operations"
        />
      </div>
    </StorySection>
  ),
}
