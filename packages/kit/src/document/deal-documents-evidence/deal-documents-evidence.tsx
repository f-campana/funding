'use client'

import { Badge, Button, cn, Skeleton } from '@repo/ui'
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
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import {
  documentEvidenceToneBadgeClasses,
  getDocumentsEvidenceTone,
} from './deal-documents-evidence.model'
import type {
  DealDocumentsEvidenceActionHandler,
  DealDocumentsEvidenceErrorState,
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceItem,
  DealDocumentsEvidenceLabels,
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceReadyState,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceSummaryMetric,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export type {
  DealDocumentsEvidenceActionEvent,
  DealDocumentsEvidenceActionHandler,
  DealDocumentsEvidenceErrorState,
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceItem,
  DealDocumentsEvidenceLabels,
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceReadyState,
  DealDocumentsEvidenceRequirement,
  DealDocumentsEvidenceRequirementKind,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceStatus,
  DealDocumentsEvidenceStatusKind,
  DealDocumentsEvidenceSummary,
  DealDocumentsEvidenceSummaryMetric,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export const DealDocumentsEvidence = ({
  className,
  labels,
  onAction,
  state,
}: DealDocumentsEvidenceProps) => {
  const titleId = useId()
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <LoadingContent label={loadingState.label ?? labels.loadingLabel} titleId={titleId} />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <ErrorContent onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'empty' }, (emptyState) => <EmptyContent state={emptyState} titleId={titleId} />)
    .with({ kind: 'ready' }, (readyState) => (
      <ReadyContent labels={labels} state={readyState} titleId={titleId} />
    ))
    .exhaustive()

  return (
    <section
      aria-busy={state.kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
        className,
      )}
      data-slot="deal-documents-evidence"
      data-state={state.kind}
      data-tone={getDocumentsEvidenceTone(state)}
    >
      {content}
    </section>
  )
}

const ReadyContent = ({
  labels,
  state,
  titleId,
}: {
  readonly labels: DealDocumentsEvidenceLabels
  readonly state: DealDocumentsEvidenceReadyState
  readonly titleId: string
}) => (
  <>
    <EvidenceHeader labels={labels} state={state} titleId={titleId} />
    <SummarySection labels={labels} metrics={state.summary.metrics} />
    <GroupsSection groups={state.groups} labels={labels} />
  </>
)

const EvidenceHeader = ({
  labels,
  state,
  titleId,
}: {
  readonly labels: DealDocumentsEvidenceLabels
  readonly state: DealDocumentsEvidenceReadyState
  readonly titleId: string
}) => (
  <header
    className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-start sm:justify-between"
    data-slot="deal-documents-evidence-header"
  >
    <div className="grid min-w-0 gap-1">
      <h2 className="break-words text-base font-semibold text-card-foreground" id={titleId}>
        {labels.title}
      </h2>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{labels.subtitle}</p>
    </div>
    <Badge
      className={cn(
        'max-w-full justify-start whitespace-normal text-left leading-5',
        documentEvidenceToneBadgeClasses[getDocumentsEvidenceTone(state)],
      )}
      data-slot="deal-documents-evidence-headline"
      variant="outline"
    >
      {state.summary.headlineLabel}
    </Badge>
  </header>
)

const SummarySection = ({
  labels,
  metrics,
}: {
  readonly labels: DealDocumentsEvidenceLabels
  readonly metrics: readonly DealDocumentsEvidenceSummaryMetric[]
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-3 border-b border-border/70 p-5"
      data-slot="deal-documents-evidence-summary"
    >
      <SectionTitle icon={<ListChecks aria-hidden="true" className="size-4" />} id={sectionId}>
        {labels.summaryTitle}
      </SectionTitle>
      <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <SummaryMetric metric={metric} key={metric.id} />
        ))}
      </dl>
    </section>
  )
}

const SummaryMetric = ({ metric }: { readonly metric: DealDocumentsEvidenceSummaryMetric }) => (
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

const GroupsSection = ({
  groups,
  labels,
}: {
  readonly groups: readonly DealDocumentsEvidenceGroup[]
  readonly labels: DealDocumentsEvidenceLabels
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid gap-4 p-5"
      data-slot="deal-documents-evidence-groups"
    >
      <SectionTitle icon={<FolderKanban aria-hidden="true" className="size-4" />} id={sectionId}>
        {labels.groupsTitle}
      </SectionTitle>
      {groups.length > 0 ? (
        <ol className="grid gap-4">
          {groups.map((group) => (
            <li key={group.id}>
              <GroupSection group={group} labels={labels} />
            </li>
          ))}
        </ol>
      ) : (
        <EmptySectionText dataSlot="deal-documents-evidence-no-groups">
          {labels.noGroupsLabel}
        </EmptySectionText>
      )}
    </section>
  )
}

const GroupSection = ({
  group,
  labels,
}: {
  readonly group: DealDocumentsEvidenceGroup
  readonly labels: DealDocumentsEvidenceLabels
}) => {
  const groupId = useId()

  return (
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
      {group.documents.length > 0 ? (
        <ol className="grid gap-2">
          {group.documents.map((document) => (
            <DocumentItem document={document} key={document.id} labels={labels} />
          ))}
        </ol>
      ) : (
        <EmptySectionText dataSlot="deal-documents-evidence-no-group-documents">
          {labels.noGroupDocumentsLabel}
        </EmptySectionText>
      )}
    </section>
  )
}

const DocumentItem = ({
  document,
  labels,
}: {
  readonly document: DealDocumentsEvidenceItem
  readonly labels: DealDocumentsEvidenceLabels
}) => (
  <li>
    <article
      className="grid gap-3 rounded-md border border-border/70 bg-card/80 p-3"
      data-blocks-closing={document.blocksClosing ? 'true' : 'false'}
      data-document-id={document.id}
      data-requirement={document.requirement.kind}
      data-slot="deal-documents-evidence-document"
      data-status={document.status.kind}
      data-tone={document.status.tone}
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
        <ToneBadge tone={document.status.tone}>{document.status.label}</ToneBadge>
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-3">
        <Fact
          icon={<FileCheck2 aria-hidden="true" className="size-3.5" />}
          label={labels.documentStatusLabel}
          value={document.status.label}
        />
        <Fact
          icon={<UserRound aria-hidden="true" className="size-3.5" />}
          label={labels.documentOwnerLabel}
          value={document.ownerLabel}
        />
        <Fact
          icon={<Scale aria-hidden="true" className="size-3.5" />}
          label={labels.documentRequirementLabel}
          value={document.requirement.label}
        />
        <Fact
          icon={<CircleAlert aria-hidden="true" className="size-3.5" />}
          label={labels.documentBlockingLabel}
          value={document.blockingLabel}
        />
        {document.relatedInvestorLabel ? (
          <Fact
            icon={<Landmark aria-hidden="true" className="size-3.5" />}
            label={labels.documentRelatedInvestorLabel}
            value={document.relatedInvestorLabel}
          />
        ) : null}
        {document.dueLabel ? (
          <Fact
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
          <Fact
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
          <Fact
            icon={<Eye aria-hidden="true" className="size-3.5" />}
            label={labels.documentVisibilityLabel}
            value={document.visibilityLabel}
          />
        ) : null}
      </dl>
    </article>
  </li>
)

const LoadingContent = ({
  label,
  titleId,
}: {
  readonly label: string
  readonly titleId: string
}) => (
  <div className="grid gap-0" data-slot="deal-documents-evidence-loading">
    <div className="grid gap-2 border-b border-border/70 p-5">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-xl motion-reduce:animate-none" />
    </div>
    <div className="grid gap-4 p-5">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-44 w-full motion-reduce:animate-none" />
      <Skeleton className="h-44 w-full motion-reduce:animate-none" />
    </div>
  </div>
)

const ErrorContent = ({
  onAction,
  state,
  titleId,
}: {
  readonly onAction: DealDocumentsEvidenceActionHandler | undefined
  readonly state: DealDocumentsEvidenceErrorState
  readonly titleId: string
}) => (
  <div className="grid gap-4 p-5" data-slot="deal-documents-evidence-error">
    <div className="flex items-start gap-3">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
          {state.title}
        </h2>
        {state.description ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
        ) : null}
      </div>
    </div>
    {state.retryLabel && onAction ? (
      <Button className="w-fit" onClick={() => onAction({ kind: 'retry' })} variant="outline">
        {state.retryLabel}
      </Button>
    ) : null}
  </div>
)

const EmptyContent = ({
  state,
  titleId,
}: {
  readonly state: Extract<DealDocumentsEvidenceState, { readonly kind: 'empty' }>
  readonly titleId: string
}) => (
  <div className="grid gap-2 p-5" data-slot="deal-documents-evidence-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
    ) : null}
  </div>
)

const SectionTitle = ({
  children,
  icon,
  id,
}: {
  readonly children: ReactNode
  readonly icon: ReactNode
  readonly id: string
}) => (
  <h3
    className="flex min-w-0 items-center gap-2 text-sm font-semibold text-card-foreground"
    id={id}
  >
    <span className="text-muted-foreground">{icon}</span>
    <span className="min-w-0 break-words">{children}</span>
  </h3>
)

const EmptySectionText = ({
  children,
  dataSlot,
}: {
  readonly children: ReactNode
  readonly dataSlot: string
}) => (
  <p
    className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm leading-6 text-muted-foreground"
    data-slot={dataSlot}
  >
    {children}
  </p>
)

const ToneBadge = ({
  children,
  tone,
}: {
  readonly children: ReactNode
  readonly tone: DealDocumentsEvidenceTone
}) => (
  <Badge
    className={cn(
      'max-w-full justify-start whitespace-normal text-left leading-5',
      documentEvidenceToneBadgeClasses[tone],
    )}
    data-tone={tone}
    variant="outline"
  >
    {children}
  </Badge>
)

const CompactFact = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="grid min-w-0 gap-0.5 rounded-md border border-border/70 bg-muted/50 px-2 py-1">
    <dt className="break-words text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="break-words text-xs text-card-foreground">{value}</dd>
  </div>
)

const Fact = ({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode
  readonly label: string
  readonly value: ReactNode
}) => (
  <div className="grid min-w-0 gap-0.5 rounded-md bg-muted/50 px-2 py-1.5">
    <dt className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{label}</span>
    </dt>
    <dd className="min-w-0 break-words pl-5 text-xs text-card-foreground">{value}</dd>
  </div>
)
