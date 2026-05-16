import { northstarDocumentRequirements } from '../fixtures'
import { StorySection } from '../stories/story-layout'
import { DocumentCompletenessCard } from './document-completeness-card'

const meta = {
  component: DocumentCompletenessCard,
  title: 'Kit/Documents/DocumentCompletenessCard',
}

export default meta

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

export const MissingDocuments = {
  render: () => (
    <StorySection
      description="Required deal and investor documents with unresolved gaps."
      title="Document completeness"
    >
      <div className="w-full max-w-2xl">
        <DocumentCompletenessCard
          description="Required documents are grouped by owner and review state."
          labels={labels}
          requirements={northstarDocumentRequirements}
          title="Document completeness"
        />
      </div>
    </StorySection>
  ),
}

export const Empty = {
  render: () => (
    <StorySection title="No documents">
      <div className="w-full max-w-2xl">
        <DocumentCompletenessCard labels={labels} requirements={[]} title="Document completeness" />
      </div>
    </StorySection>
  ),
}

const allApprovedRequirements = northstarDocumentRequirements.map((requirement) => ({
  ...requirement,
  status: 'approved' as const,
}))

export const AllApproved = {
  render: () => (
    <StorySection title="All approved documents">
      <div className="w-full max-w-2xl">
        <DocumentCompletenessCard
          description="Every required document is accepted for closing operations."
          labels={labels}
          requirements={allApprovedRequirements}
          title="Document completeness"
        />
      </div>
    </StorySection>
  ),
}

export const RejectedDocuments = {
  render: () => (
    <StorySection title="Rejected document state">
      <div className="w-full max-w-2xl">
        <DocumentCompletenessCard
          description="Rejected evidence remains visible alongside owner and requirement metadata."
          labels={labels}
          requirements={northstarDocumentRequirements.filter(
            (requirement) => requirement.status === 'rejected' || requirement.status === 'expired',
          )}
          title="Document completeness"
        />
      </div>
    </StorySection>
  ),
}
