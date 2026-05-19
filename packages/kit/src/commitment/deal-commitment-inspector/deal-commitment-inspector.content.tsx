'use client'

import { Badge, cn } from '@repo/ui'
import {
  Activity,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  Landmark,
  ListChecks,
  Route,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Children, useId } from 'react'

import {
  blockerSeverityToneClasses,
  commitmentInspectorReadinessKeys,
  getCommitmentInspectorReadinessTone,
  getDocumentEvidenceStatusTone,
} from './deal-commitment-inspector.model'
import {
  DealCommitmentInspectorEmptySectionText,
  DealCommitmentInspectorFact,
  DealCommitmentInspectorReadinessIcon,
  DealCommitmentInspectorSectionTitle,
  DealCommitmentInspectorToneBadge,
  inspectorToneDotClasses,
} from './deal-commitment-inspector.parts'
import type {
  DealCommitmentInspectorActivityItemProps,
  DealCommitmentInspectorActivityProps,
  DealCommitmentInspectorBlockerProps,
  DealCommitmentInspectorBlockersProps,
  DealCommitmentInspectorDocumentProps,
  DealCommitmentInspectorDocumentsProps,
  DealCommitmentInspectorHeaderProps,
  DealCommitmentInspectorNextActionProps,
  DealCommitmentInspectorReadinessItemProps,
  DealCommitmentInspectorReadinessProps,
  DealCommitmentInspectorReadyContentProps,
} from './deal-commitment-inspector.types'

export const DealCommitmentInspectorReadyContent = ({
  labels,
  state,
  titleId,
}: DealCommitmentInspectorReadyContentProps) => (
  <>
    <DealCommitmentInspectorHeader investor={state.investor} titleId={titleId} />
    <DealCommitmentInspectorNextAction labels={labels} nextAction={state.nextAction} />
    <DealCommitmentInspectorReadiness labels={labels} readiness={state.readiness} />
    <DealCommitmentInspectorBlockers blockers={state.blockers} labels={labels} />
    <DealCommitmentInspectorDocuments documents={state.documents} labels={labels} />
    <DealCommitmentInspectorActivity activity={state.activity} labels={labels} />
  </>
)

export const DealCommitmentInspectorHeader = ({
  investor,
  titleId,
}: DealCommitmentInspectorHeaderProps) => (
  <header
    className="grid gap-3 border-b border-border/70 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
    data-slot="deal-commitment-inspector-header"
  >
    <div className="grid min-w-0 gap-1">
      <h2 className="break-words text-base font-semibold text-card-foreground" id={titleId}>
        {investor.name}
      </h2>
      <p className="break-words text-sm leading-6 text-muted-foreground">{investor.entityName}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
        <span className="break-words">{investor.contactLabel}</span>
        <span className="font-medium text-card-foreground">{investor.commitmentLabel}</span>
      </div>
      {investor.lastActivityLabel ? (
        <div className="text-xs text-muted-foreground">
          {investor.lastActivityDateTime ? (
            <time dateTime={investor.lastActivityDateTime}>{investor.lastActivityLabel}</time>
          ) : (
            investor.lastActivityLabel
          )}
        </div>
      ) : null}
    </div>
    <DealCommitmentInspectorToneBadge tone={investor.status.tone}>
      {investor.status.label}
    </DealCommitmentInspectorToneBadge>
  </header>
)

export const DealCommitmentInspectorNextAction = ({
  labels,
  nextAction,
  title,
}: DealCommitmentInspectorNextActionProps) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-2 border-b border-border/70 p-4"
      data-slot="deal-commitment-next-action"
    >
      <DealCommitmentInspectorSectionTitle
        icon={<ListChecks aria-hidden="true" className="size-4" />}
        id={sectionId}
      >
        {title ?? labels?.nextActionLabel}
      </DealCommitmentInspectorSectionTitle>
      <p className="text-sm leading-6 text-muted-foreground">
        {nextAction ?? labels?.noNextActionLabel}
      </p>
    </section>
  )
}

export const DealCommitmentInspectorReadiness = ({
  children,
  labels,
  readiness,
  title,
}: DealCommitmentInspectorReadinessProps) => {
  const sectionId = useId()
  const readinessContent =
    children ??
    (readiness
      ? commitmentInspectorReadinessKeys.map((key) => (
          <DealCommitmentInspectorReadinessItem item={readiness[key]} key={key} />
        ))
      : null)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 border-b border-border/70 p-4"
      data-slot="deal-commitment-readiness"
    >
      <DealCommitmentInspectorSectionTitle
        icon={<ShieldCheck aria-hidden="true" className="size-4" />}
        id={sectionId}
      >
        {title ?? labels?.readinessTitle}
      </DealCommitmentInspectorSectionTitle>
      <dl className="grid gap-2 sm:grid-cols-2">{readinessContent}</dl>
    </section>
  )
}

export const DealCommitmentInspectorReadinessItem = ({
  item,
}: DealCommitmentInspectorReadinessItemProps) => {
  const tone = getCommitmentInspectorReadinessTone(item)

  return (
    <div
      className="grid gap-2 rounded-md border border-border/70 bg-background/60 p-3"
      data-readiness-key={item.key}
      data-slot="deal-commitment-readiness-item"
      data-tone={tone}
    >
      <dt className="flex min-w-0 items-center gap-2 text-sm font-medium text-card-foreground">
        <DealCommitmentInspectorReadinessIcon readinessKey={item.key} />
        <span className="min-w-0 break-words">{item.label}</span>
      </dt>
      <dd className="min-w-0">
        <DealCommitmentInspectorToneBadge tone={tone}>
          {item.value}
        </DealCommitmentInspectorToneBadge>
      </dd>
      {item.detail ? (
        <dd className="text-sm leading-6 text-muted-foreground">{item.detail}</dd>
      ) : null}
      {item.metadata && item.metadata.length > 0 ? (
        <dd>
          <ul className="flex flex-wrap gap-1.5">
            {item.metadata.map((metadata) => (
              <li
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                key={metadata}
              >
                {metadata}
              </li>
            ))}
          </ul>
        </dd>
      ) : null}
    </div>
  )
}

export const DealCommitmentInspectorBlockers = ({
  blockers,
  children,
  emptyLabel,
  labels,
  title,
}: DealCommitmentInspectorBlockersProps) => {
  const sectionId = useId()
  const blockerContent =
    children ??
    (blockers && labels
      ? blockers.map((blocker) => (
          <DealCommitmentInspectorBlocker blocker={blocker} key={blocker.id} labels={labels} />
        ))
      : null)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 border-b border-border/70 p-4"
      data-slot="deal-commitment-blockers"
    >
      <DealCommitmentInspectorSectionTitle
        icon={<CircleAlert aria-hidden="true" className="size-4" />}
        id={sectionId}
      >
        {title ?? labels?.blockersTitle}
      </DealCommitmentInspectorSectionTitle>
      {Children.count(blockerContent) > 0 ? (
        <ol className="grid gap-2">{blockerContent}</ol>
      ) : (
        <DealCommitmentInspectorEmptySectionText dataSlot="deal-commitment-no-blockers">
          {emptyLabel ?? labels?.noBlockersLabel}
        </DealCommitmentInspectorEmptySectionText>
      )}
    </section>
  )
}

export const DealCommitmentInspectorBlocker = ({
  blocker,
  labels,
}: DealCommitmentInspectorBlockerProps) => (
  <li>
    <article
      className="grid gap-3 rounded-md border border-border/70 bg-background/60 p-3"
      data-blocker-id={blocker.id}
      data-severity={blocker.severity}
      data-slot="deal-commitment-blocker"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid min-w-0 gap-1">
          <h4 className="break-words text-sm font-semibold text-card-foreground">
            {blocker.title}
          </h4>
          <p className="text-sm leading-6 text-muted-foreground">{blocker.description}</p>
        </div>
        <Badge
          className={cn(
            'max-w-full justify-start whitespace-normal text-left',
            blockerSeverityToneClasses[blocker.severity],
          )}
          data-severity={blocker.severity}
          variant="outline"
        >
          {blocker.severityLabel}
        </Badge>
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <DealCommitmentInspectorFact
          icon={<UserRound aria-hidden="true" className="size-3.5" />}
          label={labels.blockerOwnerLabel}
          value={blocker.owner}
        />
        <DealCommitmentInspectorFact
          icon={<Route aria-hidden="true" className="size-3.5" />}
          label={labels.blockerSurfaceLabel}
          value={blocker.surfaceLabel}
        />
        {blocker.relatedInvestorLabel ? (
          <DealCommitmentInspectorFact
            icon={<Landmark aria-hidden="true" className="size-3.5" />}
            label={labels.blockerInvestorsLabel}
            value={blocker.relatedInvestorLabel}
          />
        ) : null}
        {blocker.relatedDocumentLabel ? (
          <DealCommitmentInspectorFact
            icon={<FileCheck2 aria-hidden="true" className="size-3.5" />}
            label={labels.blockerDocumentsLabel}
            value={blocker.relatedDocumentLabel}
          />
        ) : null}
        {blocker.dueLabel ? (
          <DealCommitmentInspectorFact
            icon={<Clock3 aria-hidden="true" className="size-3.5" />}
            label={labels.blockerDueLabel}
            value={blocker.dueLabel}
          />
        ) : null}
      </dl>
    </article>
  </li>
)

export const DealCommitmentInspectorDocuments = ({
  children,
  documents,
  emptyLabel,
  labels,
  title,
}: DealCommitmentInspectorDocumentsProps) => {
  const sectionId = useId()
  const documentContent =
    children ??
    (documents && labels
      ? documents.map((document) => (
          <DealCommitmentInspectorDocument document={document} key={document.id} labels={labels} />
        ))
      : null)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 border-b border-border/70 p-4"
      data-slot="deal-commitment-documents"
    >
      <DealCommitmentInspectorSectionTitle
        icon={<FileText aria-hidden="true" className="size-4" />}
        id={sectionId}
      >
        {title ?? labels?.documentsTitle}
      </DealCommitmentInspectorSectionTitle>
      {Children.count(documentContent) > 0 ? (
        <ol className="grid gap-2">{documentContent}</ol>
      ) : (
        <DealCommitmentInspectorEmptySectionText dataSlot="deal-commitment-no-documents">
          {emptyLabel ?? labels?.noDocumentsLabel}
        </DealCommitmentInspectorEmptySectionText>
      )}
    </section>
  )
}

export const DealCommitmentInspectorDocument = ({
  document,
  labels,
}: DealCommitmentInspectorDocumentProps) => {
  const statusTone = getDocumentEvidenceStatusTone(document.status.kind)

  return (
    <li>
      <article
        className="grid gap-3 rounded-md border border-border/70 bg-background/60 p-3"
        data-document-id={document.id}
        data-slot="deal-commitment-document"
        data-status={document.status.kind}
        data-tone={statusTone}
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h4 className="break-words text-sm font-semibold text-card-foreground">
            {document.label}
          </h4>
          <DealCommitmentInspectorToneBadge tone={statusTone}>
            {document.status.label}
          </DealCommitmentInspectorToneBadge>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <DealCommitmentInspectorFact
            icon={<UserRound aria-hidden="true" className="size-3.5" />}
            label={labels.documentOwnerLabel}
            value={document.owner}
          />
          <DealCommitmentInspectorFact
            icon={<Scale aria-hidden="true" className="size-3.5" />}
            label={labels.documentRequirementLabel}
            value={document.requirementLabel}
          />
          {document.blockingLabel ? (
            <DealCommitmentInspectorFact
              icon={<CircleAlert aria-hidden="true" className="size-3.5" />}
              label={labels.documentBlockingLabel}
              value={document.blockingLabel}
            />
          ) : null}
          {document.dueLabel ? (
            <DealCommitmentInspectorFact
              icon={<Clock3 aria-hidden="true" className="size-3.5" />}
              label={labels.documentDueLabel}
              value={document.dueLabel}
            />
          ) : null}
          {document.lastActivityLabel ? (
            <DealCommitmentInspectorFact
              icon={<Activity aria-hidden="true" className="size-3.5" />}
              label={labels.documentLastActivityLabel}
              value={
                document.lastActivityDateTime ? (
                  <time dateTime={document.lastActivityDateTime}>{document.lastActivityLabel}</time>
                ) : (
                  document.lastActivityLabel
                )
              }
            />
          ) : null}
          {document.visibilityLabel ? (
            <DealCommitmentInspectorFact
              icon={<Landmark aria-hidden="true" className="size-3.5" />}
              label={labels.documentVisibilityLabel}
              value={document.visibilityLabel}
            />
          ) : null}
        </dl>
      </article>
    </li>
  )
}

export const DealCommitmentInspectorActivity = ({
  activity,
  children,
  emptyLabel,
  labels,
  title,
}: DealCommitmentInspectorActivityProps) => {
  const sectionId = useId()
  const activityContent =
    children ??
    activity?.map((item) => <DealCommitmentInspectorActivityItem item={item} key={item.id} />)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 p-4"
      data-slot="deal-commitment-activity"
    >
      <DealCommitmentInspectorSectionTitle
        icon={<Activity aria-hidden="true" className="size-4" />}
        id={sectionId}
      >
        {title ?? labels?.activityTitle}
      </DealCommitmentInspectorSectionTitle>
      {Children.count(activityContent) > 0 ? (
        <ol className="grid gap-3">{activityContent}</ol>
      ) : (
        <DealCommitmentInspectorEmptySectionText dataSlot="deal-commitment-no-activity">
          {emptyLabel ?? labels?.noActivityLabel}
        </DealCommitmentInspectorEmptySectionText>
      )}
    </section>
  )
}

export const DealCommitmentInspectorActivityItem = ({
  item,
}: DealCommitmentInspectorActivityItemProps) => (
  <li
    className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
    data-activity-id={item.id}
    data-slot="deal-commitment-activity-item"
    data-tone={item.tone ?? 'neutral'}
  >
    <span
      aria-hidden="true"
      className={cn('mt-2 size-2 rounded-full', inspectorToneDotClasses[item.tone ?? 'neutral'])}
    />
    <div className="grid min-w-0 gap-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-card-foreground">{item.actor}</span>
        <time dateTime={item.dateTime}>{item.timestampLabel}</time>
        {item.typeLabel ? (
          <Badge className="border-border bg-muted text-muted-foreground" variant="outline">
            {item.typeLabel}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
    </div>
  </li>
)
