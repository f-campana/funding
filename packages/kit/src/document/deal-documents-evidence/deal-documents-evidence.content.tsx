import { Badge, cn } from '@repo/ui'
import {
  Activity,
  CircleAlert,
  Clock3,
  Eye,
  FileCheck2,
  FolderKanban,
  Landmark,
  ListChecks,
  Scale,
  UserRound,
} from 'lucide-react'
import { Children, useId } from 'react'

import {
  documentEvidenceToneBadgeClasses,
  getDocumentEvidenceItemTone,
  getDocumentsEvidenceTone,
} from './deal-documents-evidence.model'
import {
  CompactFact,
  DealDocumentsEvidenceFact,
  EmptySectionText,
  SectionTitle,
  ToneBadge,
} from './deal-documents-evidence.parts'
import type {
  DealDocumentsEvidenceDocumentProps,
  DealDocumentsEvidenceGroupProps,
  DealDocumentsEvidenceGroupsProps,
  DealDocumentsEvidenceHeaderProps,
  DealDocumentsEvidenceMetricProps,
  DealDocumentsEvidenceReadyContentProps,
  DealDocumentsEvidenceSummaryProps,
} from './deal-documents-evidence.types'

export const DealDocumentsEvidenceReadyContent = ({
  labels,
  state,
  titleId,
}: DealDocumentsEvidenceReadyContentProps) => (
  <>
    <DealDocumentsEvidenceHeader labels={labels} state={state} titleId={titleId} />
    <DealDocumentsEvidenceSummarySection labels={labels} metrics={state.summary.metrics} />
    <DealDocumentsEvidenceGroups groups={state.groups} labels={labels} />
  </>
)

export const DealDocumentsEvidenceHeader = ({
  headline,
  labels,
  state,
  subtitle,
  title,
  titleId,
  tone,
}: DealDocumentsEvidenceHeaderProps) => {
  const headlineContent = headline ?? state?.summary.headlineLabel
  const subtitleContent = subtitle ?? labels?.subtitle
  const titleContent = title ?? labels?.title
  const badgeTone = tone ?? (state ? getDocumentsEvidenceTone(state) : 'neutral')

  return (
    <header
      className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-start sm:justify-between"
      data-slot="deal-documents-evidence-header"
    >
      <div className="grid min-w-0 gap-1">
        <h2 className="break-words text-base font-semibold text-card-foreground" id={titleId}>
          {titleContent}
        </h2>
        {subtitleContent ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitleContent}</p>
        ) : null}
      </div>
      {headlineContent ? (
        <Badge
          className={cn(
            'max-w-full justify-start whitespace-normal text-left leading-5',
            documentEvidenceToneBadgeClasses[badgeTone],
          )}
          data-slot="deal-documents-evidence-headline"
          variant="outline"
        >
          {headlineContent}
        </Badge>
      ) : null}
    </header>
  )
}

export const DealDocumentsEvidenceSummarySection = ({
  children,
  labels,
  metrics,
  title,
}: DealDocumentsEvidenceSummaryProps) => {
  const sectionId = useId()
  const metricContent =
    children ??
    metrics?.map((metric) => <DealDocumentsEvidenceMetric key={metric.id} metric={metric} />)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 border-b border-border/70 p-5"
      data-slot="deal-documents-evidence-summary"
    >
      <SectionTitle icon={<ListChecks aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.summaryTitle}
      </SectionTitle>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{metricContent}</dl>
    </section>
  )
}

export const DealDocumentsEvidenceMetric = ({ metric }: DealDocumentsEvidenceMetricProps) => (
  <div
    className="grid min-w-0 gap-1 rounded-md border border-border/70 bg-background/60 p-3"
    data-metric-id={metric.id}
    data-slot="deal-documents-evidence-metric"
    data-tone={metric.tone ?? 'neutral'}
  >
    <dt className="break-words text-xs font-medium text-muted-foreground">{metric.label}</dt>
    <dd className="break-words text-lg font-semibold leading-7 text-card-foreground">
      {metric.value}
    </dd>
    {metric.description ? (
      <dd className="break-words text-xs leading-5 text-muted-foreground">{metric.description}</dd>
    ) : null}
  </div>
)

export const DealDocumentsEvidenceGroups = ({
  children,
  emptyLabel,
  groups,
  labels,
  title,
}: DealDocumentsEvidenceGroupsProps) => {
  const sectionId = useId()
  const groupContent =
    children ??
    (groups && labels
      ? groups.map((group) => (
          <DealDocumentsEvidenceGroupSection group={group} key={group.id} labels={labels} />
        ))
      : null)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-4 p-5"
      data-slot="deal-documents-evidence-groups"
    >
      <SectionTitle icon={<FolderKanban aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.groupsTitle}
      </SectionTitle>
      {Children.count(groupContent) > 0 ? (
        <ol className="grid gap-4">{groupContent}</ol>
      ) : (
        <EmptySectionText dataSlot="deal-documents-evidence-no-groups">
          {emptyLabel ?? labels?.noGroupsLabel}
        </EmptySectionText>
      )}
    </section>
  )
}

export const DealDocumentsEvidenceGroupSection = ({
  children,
  group,
  labels,
}: DealDocumentsEvidenceGroupProps) => {
  const groupId = useId()
  const documentContent =
    children ??
    group.documents.map((document) => (
      <DealDocumentsEvidenceDocument document={document} key={document.id} labels={labels} />
    ))

  return (
    <li>
      <section
        aria-labelledby={groupId}
        className="grid gap-3 rounded-md border border-border/70 bg-background/50 p-3 sm:p-4"
        data-group-id={group.id}
        data-slot="deal-documents-evidence-group"
      >
        <header className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="grid min-w-0 gap-1">
            <h4 className="break-words text-sm font-semibold text-card-foreground" id={groupId}>
              {group.label}
            </h4>
            {group.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
            ) : null}
          </div>
          <dl className="flex min-w-0 flex-wrap gap-2 text-xs">
            <CompactFact label={labels.groupVisibilityLabel} value={group.visibilityLabel} />
            <CompactFact label={labels.groupCountLabel} value={group.countLabel} />
          </dl>
        </header>
        {Children.count(documentContent) > 0 ? (
          <ol className="grid gap-2">{documentContent}</ol>
        ) : (
          <EmptySectionText dataSlot="deal-documents-evidence-no-group-documents">
            {labels.noGroupDocumentsLabel}
          </EmptySectionText>
        )}
      </section>
    </li>
  )
}

export const DealDocumentsEvidenceDocument = ({
  document,
  labels,
}: DealDocumentsEvidenceDocumentProps) => {
  const statusTone = getDocumentEvidenceItemTone(document)

  return (
    <li>
      <article
        className="grid gap-3 rounded-md border border-border/70 bg-card/80 p-3"
        data-blocks-closing={document.blocksClosing ? 'true' : 'false'}
        data-document-id={document.id}
        data-requirement={document.requirement.kind}
        data-slot="deal-documents-evidence-document"
        data-status={document.status.kind}
        data-tone={statusTone}
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid min-w-0 gap-1">
            <h5 className="break-words text-sm font-semibold text-card-foreground">
              {document.label}
            </h5>
            {document.description ? (
              <p className="text-sm leading-6 text-muted-foreground">{document.description}</p>
            ) : null}
          </div>
          <ToneBadge tone={statusTone}>{document.status.label}</ToneBadge>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-3">
          <DealDocumentsEvidenceFact
            icon={<FileCheck2 aria-hidden="true" className="size-3.5" />}
            label={labels.documentStatusLabel}
            value={document.status.label}
          />
          <DealDocumentsEvidenceFact
            icon={<UserRound aria-hidden="true" className="size-3.5" />}
            label={labels.documentOwnerLabel}
            value={document.ownerLabel}
          />
          <DealDocumentsEvidenceFact
            icon={<Scale aria-hidden="true" className="size-3.5" />}
            label={labels.documentRequirementLabel}
            value={document.requirement.label}
          />
          <DealDocumentsEvidenceFact
            icon={<CircleAlert aria-hidden="true" className="size-3.5" />}
            label={labels.documentBlockingLabel}
            value={document.blockingLabel}
          />
          {document.relatedInvestorLabel ? (
            <DealDocumentsEvidenceFact
              icon={<Landmark aria-hidden="true" className="size-3.5" />}
              label={labels.documentRelatedInvestorLabel}
              value={document.relatedInvestorLabel}
            />
          ) : null}
          {document.dueLabel ? (
            <DealDocumentsEvidenceFact
              icon={<Clock3 aria-hidden="true" className="size-3.5" />}
              label={labels.documentDueLabel}
              value={
                document.dueDateTime ? (
                  <time dateTime={document.dueDateTime}>{document.dueLabel}</time>
                ) : (
                  document.dueLabel
                )
              }
            />
          ) : null}
          {document.lastActivityLabel ? (
            <DealDocumentsEvidenceFact
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
            <DealDocumentsEvidenceFact
              icon={<Eye aria-hidden="true" className="size-3.5" />}
              label={labels.documentVisibilityLabel}
              value={document.visibilityLabel}
            />
          ) : null}
        </dl>
      </article>
    </li>
  )
}
