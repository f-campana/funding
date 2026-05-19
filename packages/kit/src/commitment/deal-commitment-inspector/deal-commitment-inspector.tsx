'use client'

import { Badge, Button, cn, Skeleton } from '@repo/ui'
import {
  Activity,
  Banknote,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  Landmark,
  ListChecks,
  type LucideIcon,
  Route,
  Scale,
  ShieldCheck,
  Signature,
  UserRound,
} from 'lucide-react'
import { Children, type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import {
  blockerSeverityToneClasses,
  commitmentInspectorReadinessKeys,
  getCommitmentInspectorReadinessTone,
  getCommitmentInspectorTone,
  getDocumentEvidenceStatusTone,
  inspectorToneBadgeClasses,
  inspectorToneDotClasses,
} from './deal-commitment-inspector.model'
import type {
  DealCommitmentInspectorActivityItemProps,
  DealCommitmentInspectorActivityProps,
  DealCommitmentInspectorBlockerProps,
  DealCommitmentInspectorBlockersProps,
  DealCommitmentInspectorDocumentProps,
  DealCommitmentInspectorDocumentsProps,
  DealCommitmentInspectorEmptyProps,
  DealCommitmentInspectorErrorProps,
  DealCommitmentInspectorFactProps,
  DealCommitmentInspectorHeaderProps,
  DealCommitmentInspectorLoadingProps,
  DealCommitmentInspectorNextActionProps,
  DealCommitmentInspectorProps,
  DealCommitmentInspectorReadinessItemProps,
  DealCommitmentInspectorReadinessProps,
  DealCommitmentInspectorReadyContentProps,
  DealCommitmentInspectorRootProps,
  DealCommitmentInspectorTone,
  DealCommitmentReadinessKey,
} from './deal-commitment-inspector.types'

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
    <ToneBadge tone={investor.status.tone}>{investor.status.label}</ToneBadge>
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
      <SectionTitle icon={<ListChecks aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.nextActionLabel}
      </SectionTitle>
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
      <SectionTitle icon={<ShieldCheck aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.readinessTitle}
      </SectionTitle>
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
        <ReadinessIcon readinessKey={item.key} />
        <span className="min-w-0 break-words">{item.label}</span>
      </dt>
      <dd className="min-w-0">
        <ToneBadge tone={tone}>{item.value}</ToneBadge>
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
      <SectionTitle icon={<CircleAlert aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.blockersTitle}
      </SectionTitle>
      {Children.count(blockerContent) > 0 ? (
        <ol className="grid gap-2">{blockerContent}</ol>
      ) : (
        <EmptySectionText dataSlot="deal-commitment-no-blockers">
          {emptyLabel ?? labels?.noBlockersLabel}
        </EmptySectionText>
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
      <SectionTitle icon={<FileText aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.documentsTitle}
      </SectionTitle>
      {Children.count(documentContent) > 0 ? (
        <ol className="grid gap-2">{documentContent}</ol>
      ) : (
        <EmptySectionText dataSlot="deal-commitment-no-documents">
          {emptyLabel ?? labels?.noDocumentsLabel}
        </EmptySectionText>
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
          <ToneBadge tone={statusTone}>{document.status.label}</ToneBadge>
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
      <SectionTitle icon={<Activity aria-hidden="true" className="size-4" />} id={sectionId}>
        {title ?? labels?.activityTitle}
      </SectionTitle>
      {Children.count(activityContent) > 0 ? (
        <ol className="grid gap-3">{activityContent}</ol>
      ) : (
        <EmptySectionText dataSlot="deal-commitment-no-activity">
          {emptyLabel ?? labels?.noActivityLabel}
        </EmptySectionText>
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

export const DealCommitmentInspectorLoading = ({
  label,
  titleId,
}: DealCommitmentInspectorLoadingProps) => (
  <div className="grid gap-0" data-slot="deal-commitment-inspector-loading">
    <div className="grid gap-2 border-b border-border/70 p-4">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-md motion-reduce:animate-none" />
    </div>
    <div className="grid gap-3 p-4">
      <Skeleton className="h-16 w-full motion-reduce:animate-none" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-28 w-full motion-reduce:animate-none" />
      <Skeleton className="h-28 w-full motion-reduce:animate-none" />
    </div>
  </div>
)

export const DealCommitmentInspectorError = ({
  onAction,
  state,
  titleId,
}: DealCommitmentInspectorErrorProps) => (
  <div className="grid gap-4 p-4" data-slot="deal-commitment-inspector-error">
    <div className="flex items-start gap-3">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
          {state.title}
        </h2>
        {state.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{state.description}</p>
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

export const DealCommitmentInspectorEmpty = ({
  state,
  titleId,
}: DealCommitmentInspectorEmptyProps) => (
  <div className="grid gap-2 p-4" data-slot="deal-commitment-inspector-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="text-sm leading-6 text-muted-foreground">{state.description}</p>
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
  readonly tone: DealCommitmentInspectorTone
}) => (
  <Badge
    className={cn(
      'max-w-full justify-start whitespace-normal text-left leading-5',
      inspectorToneBadgeClasses[tone],
    )}
    data-tone={tone}
    variant="outline"
  >
    {children}
  </Badge>
)

export const DealCommitmentInspectorFact = ({
  icon,
  label,
  value,
}: DealCommitmentInspectorFactProps) => (
  <div className="grid min-w-0 gap-0.5 rounded-md bg-muted/50 px-2 py-1.5">
    <dt className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{label}</span>
    </dt>
    <dd className="min-w-0 break-words pl-5 text-xs text-card-foreground">{value}</dd>
  </div>
)

const readinessIconByKey = {
  kycKyb: ShieldCheck,
  reconciliation: Scale,
  signature: Signature,
  wire: Banknote,
} as const satisfies Record<DealCommitmentReadinessKey, LucideIcon>

const ReadinessIcon = ({ readinessKey }: { readonly readinessKey: DealCommitmentReadinessKey }) => {
  const Icon = readinessIconByKey[readinessKey]

  return <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
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
