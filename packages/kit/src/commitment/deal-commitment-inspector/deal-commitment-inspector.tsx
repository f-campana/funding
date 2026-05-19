'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import {
  DealCommitmentInspectorActivity,
  DealCommitmentInspectorActivityItem,
  DealCommitmentInspectorBlocker,
  DealCommitmentInspectorBlockers,
  DealCommitmentInspectorDocument,
  DealCommitmentInspectorDocuments,
  DealCommitmentInspectorHeader,
  DealCommitmentInspectorNextAction,
  DealCommitmentInspectorReadiness,
  DealCommitmentInspectorReadinessItem,
  DealCommitmentInspectorReadyContent,
} from './deal-commitment-inspector.content'
import {
  DealCommitmentInspectorEmpty,
  DealCommitmentInspectorError,
  DealCommitmentInspectorLoading,
} from './deal-commitment-inspector.lifecycle'
import { getCommitmentInspectorTone } from './deal-commitment-inspector.model'
import { DealCommitmentInspectorFact } from './deal-commitment-inspector.parts'
import type {
  DealCommitmentInspectorProps,
  DealCommitmentInspectorRootProps,
} from './deal-commitment-inspector.types'

export {
  DealCommitmentInspectorActivity,
  DealCommitmentInspectorActivityItem,
  DealCommitmentInspectorBlocker,
  DealCommitmentInspectorBlockers,
  DealCommitmentInspectorDocument,
  DealCommitmentInspectorDocuments,
  DealCommitmentInspectorHeader,
  DealCommitmentInspectorNextAction,
  DealCommitmentInspectorReadiness,
  DealCommitmentInspectorReadinessItem,
  DealCommitmentInspectorReadyContent,
} from './deal-commitment-inspector.content'
export {
  DealCommitmentInspectorEmpty,
  DealCommitmentInspectorError,
  DealCommitmentInspectorLoading,
} from './deal-commitment-inspector.lifecycle'
export { DealCommitmentInspectorFact } from './deal-commitment-inspector.parts'
export type {
  DealCommitmentActivityItem,
  DealCommitmentBlocker,
  DealCommitmentBlockerSeverity,
  DealCommitmentEvidenceItem,
  DealCommitmentEvidenceStatus,
  DealCommitmentEvidenceStatusKind,
  DealCommitmentInspectorActionEvent,
  DealCommitmentInspectorActionHandler,
  DealCommitmentInspectorActivityItemProps,
  DealCommitmentInspectorActivityProps,
  DealCommitmentInspectorBlockerProps,
  DealCommitmentInspectorBlockersProps,
  DealCommitmentInspectorDocumentProps,
  DealCommitmentInspectorDocumentsProps,
  DealCommitmentInspectorEmptyProps,
  DealCommitmentInspectorErrorProps,
  DealCommitmentInspectorErrorState,
  DealCommitmentInspectorFactProps,
  DealCommitmentInspectorHeaderProps,
  DealCommitmentInspectorLabels,
  DealCommitmentInspectorLoadingProps,
  DealCommitmentInspectorNextActionProps,
  DealCommitmentInspectorProps,
  DealCommitmentInspectorReadinessItemProps,
  DealCommitmentInspectorReadinessProps,
  DealCommitmentInspectorReadyContentProps,
  DealCommitmentInspectorReadyState,
  DealCommitmentInspectorRootProps,
  DealCommitmentInspectorState,
  DealCommitmentInspectorTone,
  DealCommitmentInvestorSummary,
  DealCommitmentReadinessItem,
  DealCommitmentReadinessKey,
  DealCommitmentReadinessRecord,
  DealCommitmentStatus,
} from './deal-commitment-inspector.types'

export const DealCommitmentInspectorRoot = ({
  busy,
  children,
  className,
  state,
  ...sectionProps
}: DealCommitmentInspectorRootProps) => (
  <section
    {...sectionProps}
    aria-busy={busy ?? (state?.kind === 'loading' ? true : undefined)}
    className={cn(
      'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
      className,
    )}
    data-inspector-tone={state ? getCommitmentInspectorTone(state) : undefined}
    data-slot="deal-commitment-inspector"
    data-state={state?.kind}
  >
    {children}
  </section>
)

const DealCommitmentInspectorView = ({
  className,
  labels,
  onAction,
  state,
}: DealCommitmentInspectorProps) => {
  const titleId = useId()
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <DealCommitmentInspectorLoading
        label={loadingState.label ?? labels.loadingLabel}
        titleId={titleId}
      />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <DealCommitmentInspectorError onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'empty' }, (emptyState) => (
      <DealCommitmentInspectorEmpty state={emptyState} titleId={titleId} />
    ))
    .with({ kind: 'ready' }, (readyState) => (
      <DealCommitmentInspectorReadyContent labels={labels} state={readyState} titleId={titleId} />
    ))
    .exhaustive()

  return (
    <DealCommitmentInspectorRoot aria-label={labels.title} className={className} state={state}>
      {content}
    </DealCommitmentInspectorRoot>
  )
}

export const DealCommitmentInspector = Object.assign(DealCommitmentInspectorView, {
  Activity: DealCommitmentInspectorActivity,
  ActivityItem: DealCommitmentInspectorActivityItem,
  Blocker: DealCommitmentInspectorBlocker,
  Blockers: DealCommitmentInspectorBlockers,
  Document: DealCommitmentInspectorDocument,
  Documents: DealCommitmentInspectorDocuments,
  Empty: DealCommitmentInspectorEmpty,
  Error: DealCommitmentInspectorError,
  Fact: DealCommitmentInspectorFact,
  Header: DealCommitmentInspectorHeader,
  Loading: DealCommitmentInspectorLoading,
  NextAction: DealCommitmentInspectorNextAction,
  Readiness: DealCommitmentInspectorReadiness,
  ReadinessItem: DealCommitmentInspectorReadinessItem,
  Ready: DealCommitmentInspectorReadyContent,
  Root: DealCommitmentInspectorRoot,
})
