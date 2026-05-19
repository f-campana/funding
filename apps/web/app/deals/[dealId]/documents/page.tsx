import {
  DealDocumentsEvidenceDocument,
  DealDocumentsEvidenceEmpty,
  DealDocumentsEvidenceError,
  DealDocumentsEvidenceGroupSection,
  DealDocumentsEvidenceGroups,
  DealDocumentsEvidenceHeader,
  DealDocumentsEvidenceLoading,
  type DealDocumentsEvidenceProps,
  DealDocumentsEvidenceRoot,
  DealDocumentsEvidenceSummarySection,
} from '@repo/kit/deal-documents-evidence'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from '../data'
import { mapDealDocumentsEvidenceProps } from '../deal-documents-evidence-adapter'

type DealDocumentsPageProps = {
  params: Promise<{ dealId: string }>
}

const documentsEvidenceTitleId = 'deal-documents-evidence-title'

export default async function DealDocumentsPage({ params }: DealDocumentsPageProps) {
  const { dealId } = await params
  const dataResult = getDealOperationsData(dealId)

  if (dataResult.isError()) {
    if (isDealOperationsRouteNotFoundError(dataResult.error)) {
      notFound()
    }

    throw dealOperationsRouteDataError(dataResult.error)
  }

  const data = dataResult.value
  const documentsEvidence = mapDealDocumentsEvidenceProps(data)

  return (
    <DealDocumentsEvidenceRoot
      aria-labelledby={documentsEvidenceTitleId}
      className={documentsEvidence.className}
      state={documentsEvidence.state}
    >
      {renderDocumentsEvidenceContent(documentsEvidence)}
    </DealDocumentsEvidenceRoot>
  )
}

const renderDocumentsEvidenceContent = ({
  labels,
  onAction,
  state,
}: DealDocumentsEvidenceProps): ReactNode => {
  switch (state.kind) {
    case 'loading':
      return (
        <DealDocumentsEvidenceLoading
          label={state.label ?? labels.loadingLabel}
          titleId={documentsEvidenceTitleId}
        />
      )
    case 'error':
      return (
        <DealDocumentsEvidenceError
          onAction={onAction}
          state={state}
          titleId={documentsEvidenceTitleId}
        />
      )
    case 'empty':
      return <DealDocumentsEvidenceEmpty state={state} titleId={documentsEvidenceTitleId} />
    case 'ready':
      return (
        <>
          <DealDocumentsEvidenceHeader
            headline={state.summary.headlineLabel}
            state={state}
            subtitle={labels.subtitle}
            title={labels.title}
            titleId={documentsEvidenceTitleId}
          />
          <DealDocumentsEvidenceSummarySection
            metrics={state.summary.metrics}
            title={labels.summaryTitle}
          />
          <DealDocumentsEvidenceGroups emptyLabel={labels.noGroupsLabel} title={labels.groupsTitle}>
            {state.groups.map((group) => (
              <DealDocumentsEvidenceGroupSection group={group} key={group.id} labels={labels}>
                {group.documents.map((document) => (
                  <DealDocumentsEvidenceDocument
                    document={document}
                    key={document.id}
                    labels={labels}
                  />
                ))}
              </DealDocumentsEvidenceGroupSection>
            ))}
          </DealDocumentsEvidenceGroups>
        </>
      )
  }
}
