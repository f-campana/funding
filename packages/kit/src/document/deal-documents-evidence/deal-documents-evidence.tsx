'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import {
  DealDocumentsEvidenceDocument,
  DealDocumentsEvidenceGroupSection,
  DealDocumentsEvidenceGroups,
  DealDocumentsEvidenceHeader,
  DealDocumentsEvidenceMetric,
  DealDocumentsEvidenceReadyContent,
  DealDocumentsEvidenceSummarySection,
} from './deal-documents-evidence.content'
import {
  DealDocumentsEvidenceEmpty,
  DealDocumentsEvidenceError,
  DealDocumentsEvidenceLoading,
} from './deal-documents-evidence.lifecycle'
import { getDocumentsEvidenceTone } from './deal-documents-evidence.model'
import { DealDocumentsEvidenceFact } from './deal-documents-evidence.parts'
import type {
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceRootProps,
} from './deal-documents-evidence.types'

export type {
  DealDocumentsEvidenceActionEvent,
  DealDocumentsEvidenceActionHandler,
  DealDocumentsEvidenceDocumentProps,
  DealDocumentsEvidenceEmptyProps,
  DealDocumentsEvidenceErrorProps,
  DealDocumentsEvidenceErrorState,
  DealDocumentsEvidenceFactProps,
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceGroupProps,
  DealDocumentsEvidenceGroupsProps,
  DealDocumentsEvidenceHeaderProps,
  DealDocumentsEvidenceItem,
  DealDocumentsEvidenceLabels,
  DealDocumentsEvidenceLoadingProps,
  DealDocumentsEvidenceMetricProps,
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceReadyContentProps,
  DealDocumentsEvidenceReadyState,
  DealDocumentsEvidenceRequirement,
  DealDocumentsEvidenceRequirementKind,
  DealDocumentsEvidenceRootProps,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceStatus,
  DealDocumentsEvidenceStatusKind,
  DealDocumentsEvidenceSummary,
  DealDocumentsEvidenceSummaryMetric,
  DealDocumentsEvidenceSummaryProps,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'
export {
  DealDocumentsEvidenceDocument,
  DealDocumentsEvidenceEmpty,
  DealDocumentsEvidenceError,
  DealDocumentsEvidenceFact,
  DealDocumentsEvidenceGroupSection,
  DealDocumentsEvidenceGroups,
  DealDocumentsEvidenceHeader,
  DealDocumentsEvidenceLoading,
  DealDocumentsEvidenceMetric,
  DealDocumentsEvidenceReadyContent,
  DealDocumentsEvidenceSummarySection,
}

export const DealDocumentsEvidenceRoot = ({
  busy,
  children,
  className,
  state,
  ...sectionProps
}: DealDocumentsEvidenceRootProps) => (
  <section
    {...sectionProps}
    aria-busy={busy ?? (state?.kind === 'loading' ? true : undefined)}
    className={cn(
      'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
      className,
    )}
    data-slot="deal-documents-evidence"
    data-state={state?.kind}
    data-tone={state ? getDocumentsEvidenceTone(state) : undefined}
  >
    {children}
  </section>
)

const DealDocumentsEvidenceView = ({
  className,
  labels,
  onAction,
  state,
}: DealDocumentsEvidenceProps) => {
  const titleId = useId()
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <DealDocumentsEvidenceLoading
        label={loadingState.label ?? labels.loadingLabel}
        titleId={titleId}
      />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <DealDocumentsEvidenceError onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'empty' }, (emptyState) => (
      <DealDocumentsEvidenceEmpty state={emptyState} titleId={titleId} />
    ))
    .with({ kind: 'ready' }, (readyState) => (
      <DealDocumentsEvidenceReadyContent labels={labels} state={readyState} titleId={titleId} />
    ))
    .exhaustive()

  return (
    <DealDocumentsEvidenceRoot aria-labelledby={titleId} className={className} state={state}>
      {content}
    </DealDocumentsEvidenceRoot>
  )
}

export const DealDocumentsEvidence = Object.assign(DealDocumentsEvidenceView, {
  Document: DealDocumentsEvidenceDocument,
  Empty: DealDocumentsEvidenceEmpty,
  Error: DealDocumentsEvidenceError,
  Fact: DealDocumentsEvidenceFact,
  Group: DealDocumentsEvidenceGroupSection,
  Groups: DealDocumentsEvidenceGroups,
  Header: DealDocumentsEvidenceHeader,
  Loading: DealDocumentsEvidenceLoading,
  Metric: DealDocumentsEvidenceMetric,
  Ready: DealDocumentsEvidenceReadyContent,
  Root: DealDocumentsEvidenceRoot,
  Summary: DealDocumentsEvidenceSummarySection,
})
