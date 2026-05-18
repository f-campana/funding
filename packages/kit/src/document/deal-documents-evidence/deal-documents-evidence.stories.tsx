import type { ComponentProps } from 'react'

import { DealCommitmentInspector } from '../../commitment/deal-commitment-inspector'
import {
  blockedCommitmentInspectorState,
  dealCommitmentInspectorLabels,
} from '../../commitment/deal-commitment-inspector/deal-commitment-inspector-fixtures'
import { StorySection } from '../../stories/story-layout'
import { DealDocumentsEvidence } from './deal-documents-evidence'
import {
  dealDocumentsEvidenceLabels,
  defaultDocumentsEvidenceState,
  emptyDocumentsEvidenceState,
  errorDocumentsEvidenceState,
  loadingDocumentsEvidenceState,
  longTextDocumentsEvidenceState,
  missingEvidenceState,
  readyDocumentsEvidenceState,
  rejectedExpiredEvidenceState,
  underReviewEvidenceState,
} from './deal-documents-evidence-fixtures'

const meta = {
  component: DealDocumentsEvidence,
  title: 'Kit/Document/DealDocumentsEvidence',
}

export default meta

const renderDocumentsEvidence = (
  props: Partial<ComponentProps<typeof DealDocumentsEvidence>> = {},
  className = 'w-[min(96vw,74rem)]',
) => (
  <StorySection
    className={className}
    description="Reusable operator documents and evidence readiness surface."
    title="Deal documents evidence"
  >
    <DealDocumentsEvidence
      {...({
        labels: dealDocumentsEvidenceLabels,
        state: defaultDocumentsEvidenceState,
        ...props,
      } as ComponentProps<typeof DealDocumentsEvidence>)}
    />
  </StorySection>
)

const renderDarkDocumentsEvidence = (
  props: Partial<ComponentProps<typeof DealDocumentsEvidence>> = {},
) => (
  <div className="dark bg-background p-6" data-theme="dark">
    {renderDocumentsEvidence(props)}
  </div>
)

export const DefaultEvidence = {
  render: () => renderDocumentsEvidence(),
}

export const ReadyEvidence = {
  render: () => renderDocumentsEvidence({ state: readyDocumentsEvidenceState }),
}

export const MissingBlockingEvidence = {
  render: () => renderDocumentsEvidence({ state: missingEvidenceState }),
}

export const RejectedExpiredEvidence = {
  render: () => renderDocumentsEvidence({ state: rejectedExpiredEvidenceState }),
}

export const UnderReview = {
  render: () => renderDocumentsEvidence({ state: underReviewEvidenceState }),
}

export const Empty = {
  render: () => renderDocumentsEvidence({ state: emptyDocumentsEvidenceState }),
}

export const Loading = {
  render: () => renderDocumentsEvidence({ state: loadingDocumentsEvidenceState }),
}

export const ErrorState = {
  name: 'Error',
  render: () =>
    renderDocumentsEvidence({
      onAction: () => undefined,
      state: errorDocumentsEvidenceState,
    }),
}

export const LongText = {
  render: () => renderDocumentsEvidence({ state: longTextDocumentsEvidenceState }),
}

export const DarkDefault = {
  render: () => renderDarkDocumentsEvidence(),
}

export const MobileStack = {
  render: () => renderDocumentsEvidence({}, 'w-full max-w-[360px]'),
}

export const WithCommitmentsInspectorContext = {
  render: () => (
    <StorySection
      className="w-[min(96vw,86rem)]"
      description="Documents evidence beside one-investor commitment evidence diagnosis."
      title="Documents with commitment inspector context"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <DealDocumentsEvidence
          labels={dealDocumentsEvidenceLabels}
          state={defaultDocumentsEvidenceState}
        />
        <DealCommitmentInspector
          labels={dealCommitmentInspectorLabels}
          state={blockedCommitmentInspectorState}
        />
      </div>
    </StorySection>
  ),
}
