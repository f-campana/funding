import {
  Badge,
  Button,
  Checkbox,
  cn,
  Skeleton,
  TableCell,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleMinus,
  Clock3,
  FilePenLine,
  Landmark,
  RefreshCw,
} from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { match } from 'ts-pattern'

import { statusToneClasses } from '../../status/status-tone'
import {
  commitmentTableColumnCount,
  getCommitmentReadinessTone,
  visibleReadinessKeys,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorAvatarTone,
  CommitmentInvestorRow as CommitmentInvestorRowData,
  CommitmentReadinessKey,
  CommitmentReadinessState,
  CommitmentReadinessTone,
  CommitmentRowDataIssueTone,
  CommitmentRowVisualState,
  DealCommitmentsTableLabels,
} from './deal-commitments-table.types'

const readinessToneClasses = {
  attention: 'text-status-attention',
  danger: 'text-status-danger',
  info: 'text-status-info',
  neutral: 'text-muted-foreground',
  success: 'text-status-success',
} as const satisfies Record<CommitmentReadinessTone, string>

const statusToneByInvestorTone = {
  attention: 'attention',
  complete: 'success',
  inProgress: 'info',
  pending: 'pending',
} as const satisfies Record<
  CommitmentInvestorRowData['status']['tone'],
  keyof typeof statusToneClasses
>

const dataIssueToneClasses = {
  danger: 'text-status-danger',
  neutral: 'text-muted-foreground',
} as const satisfies Record<CommitmentRowDataIssueTone, string>

const avatarToneOrder = [
  'navy',
  'blush',
  'blue',
  'purple',
  'teal',
  'ochre',
  'slate',
  'brown',
] as const satisfies readonly CommitmentInvestorAvatarTone[]

const avatarToneClasses = {
  blush: 'bg-status-danger-muted text-status-danger',
  blue: 'bg-status-info-muted text-status-info',
  brown: 'bg-secondary text-secondary-foreground',
  navy: 'bg-foreground text-background',
  ochre: 'bg-status-attention-muted text-status-attention',
  purple: 'bg-readiness-blocked-muted text-readiness-blocked',
  slate: 'bg-muted text-muted-foreground',
  teal: 'bg-status-success-muted text-status-success',
} as const satisfies Record<CommitmentInvestorAvatarTone, string>

export const CommitmentGroupRow = ({
  count,
  label,
  labels,
}: {
  readonly count: number
  readonly label: string
  readonly labels: DealCommitmentsTableLabels
}) => (
  <TableRow
    className="h-10 border-b border-border/50 bg-muted/35 hover:bg-muted/35"
    data-slot="commitment-group-row"
  >
    <TableCell colSpan={commitmentTableColumnCount} className="px-3 py-2">
      <span className="text-muted-foreground text-xs font-semibold uppercase">
        {labels.row.groupSummaryLabel(label, count)}
      </span>
    </TableCell>
  </TableRow>
)

export const CommitmentInvestorRow = ({
  batchSelected,
  labels,
  onRowOpen,
  onRowSelect,
  row,
  rowIndex,
  visualState,
}: {
  readonly batchSelected: boolean
  readonly labels: DealCommitmentsTableLabels
  readonly row: CommitmentInvestorRowData
  readonly rowIndex: number
  readonly visualState: CommitmentRowVisualState
  readonly onRowOpen: (row: CommitmentInvestorRowData) => void
  readonly onRowSelect: (row: CommitmentInvestorRowData) => void
}) => {
  const flags = getCommitmentRowFlags(visualState)
  const alternate = rowIndex % 2 === 1

  return (
    <TableRow
      aria-disabled={flags.disabled ? true : undefined}
      className={getCommitmentRowClassName({ ...flags, alternate })}
      data-active={flags.active ? 'true' : 'false'}
      data-row-alternate={alternate ? 'true' : 'false'}
      data-attention={row.attention === true ? 'true' : 'false'}
      data-batch-selected={batchSelected ? 'true' : 'false'}
      data-data-issue={row.dataIssue ? 'true' : 'false'}
      data-disabled={flags.disabled ? 'true' : 'false'}
      data-drawer-open={flags.drawerOpen ? 'true' : 'false'}
      data-hovered={flags.hovered ? 'true' : 'false'}
      data-row-density="compact"
      data-slot="commitment-investor-row"
      data-tone={row.status.tone}
      data-visual-state={
        visualState.kind === 'active' && flags.drawerOpen ? 'active-drawer-open' : visualState.kind
      }
      onClick={() => onRowOpen(row)}
    >
      <TableCell className="relative px-3 py-2 text-center">
        {flags.active ? (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-[3px] bg-status-info"
          />
        ) : null}
        <Checkbox
          aria-label={labels.row.selectRowLabel(row)}
          checked={batchSelected}
          className={
            batchSelected
              ? 'data-[state=checked]:border-status-info data-[state=checked]:bg-status-info'
              : undefined
          }
          disabled={flags.disabled}
          onClick={(event) => event.stopPropagation()}
          onCheckedChange={() => onRowSelect(row)}
        />
      </TableCell>
      <CommitmentInvestorCell row={row} rowIndex={rowIndex} />
      <CommitmentAmountCell>{row.commitmentLabel}</CommitmentAmountCell>
      {visibleReadinessKeys.map((key) => (
        <ReadinessStatusCell key={key} readinessKey={key} state={row.readiness[key]} />
      ))}
      <TableCell className="min-w-0 px-3 py-2">
        <div className="flex max-w-full min-w-0 flex-col items-start gap-1.5 overflow-hidden">
          <CommitmentStatusPill status={row.status} />
          {row.dataIssue ? <CommitmentDataIssueIndicator issue={row.dataIssue} /> : null}
        </div>
      </TableCell>
      <CommitmentActionCell
        active={flags.active}
        disabled={flags.disabled}
        drawerOpen={flags.drawerOpen}
        labels={labels}
        onRowOpen={onRowOpen}
        row={row}
      />
    </TableRow>
  )
}

export const CommitmentRowSkeleton = () => (
  <TableRow
    aria-hidden="true"
    className="h-16"
    data-loading="true"
    data-row-density="compact"
    data-slot="commitment-row-skeleton"
  >
    <TableCell className="px-3 py-2">
      <Skeleton className="mx-auto size-4 rounded-[4px] motion-reduce:animate-none" />
    </TableCell>
    <SkeletonCell>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full motion-reduce:animate-none" />
        <div className="grid gap-2">
          <Skeleton className="h-3.5 w-28 motion-reduce:animate-none" />
          <Skeleton className="h-3 w-40 motion-reduce:animate-none" />
        </div>
      </div>
    </SkeletonCell>
    <SkeletonCell contentClassName="justify-end">
      <Skeleton className="h-3.5 w-20 motion-reduce:animate-none" />
    </SkeletonCell>
    {visibleReadinessKeys.map((key) => (
      <SkeletonCell cellClassName="border-l border-border/25" key={key}>
        <Skeleton className="h-3.5 w-16 motion-reduce:animate-none" />
      </SkeletonCell>
    ))}
    <SkeletonCell>
      <Skeleton className="h-6 w-20 rounded-full motion-reduce:animate-none" />
    </SkeletonCell>
    <TableCell className="px-3 py-2 text-right">
      <Skeleton className="ml-auto size-8 rounded-lg motion-reduce:animate-none" />
    </TableCell>
  </TableRow>
)

export const TruncatedText = ({
  children,
  className,
  fullText,
}: {
  readonly children: string
  readonly className?: string
  readonly fullText?: string | undefined
}) => {
  const tooltipText = fullText ?? children
  const shouldRevealOnFocus = fullText !== undefined

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'block min-w-0 max-w-full truncate rounded-[2px]',
            shouldRevealOnFocus
              ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
              : null,
            className,
          )}
          data-full-text={tooltipText}
          data-keyboard-tooltip={shouldRevealOnFocus ? 'true' : 'false'}
          tabIndex={shouldRevealOnFocus ? 0 : undefined}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}

const getCommitmentRowFlags = (visualState: CommitmentRowVisualState) => ({
  active: visualState.kind === 'active',
  attentionVisible: visualState.kind === 'attention',
  disabled: visualState.kind === 'disabled',
  drawerOpen: visualState.kind === 'active' && visualState.drawerOpen,
  hovered: visualState.kind === 'hovered',
})

const getCommitmentRowClassName = ({
  active,
  alternate,
  attentionVisible,
  disabled,
  drawerOpen,
  hovered,
}: ReturnType<typeof getCommitmentRowFlags> & { readonly alternate: boolean }) =>
  cn(
    'h-16 cursor-pointer border-b border-border/50 bg-card transition-colors last:border-b-0 hover:bg-status-info-muted/15 motion-reduce:transition-none',
    alternate ? 'bg-muted/10' : null,
    attentionVisible ? 'bg-status-attention-muted/15' : null,
    hovered ? 'bg-status-info-muted/20' : null,
    active
      ? 'bg-status-info-muted/28 outline outline-1 -outline-offset-1 outline-status-info-border'
      : null,
    drawerOpen
      ? 'bg-status-info-muted/42 outline outline-1 -outline-offset-1 outline-status-info-border'
      : null,
    disabled
      ? 'cursor-not-allowed bg-card opacity-60 hover:bg-card [&_[data-slot=commitment-drawer-connector]]:hidden'
      : null,
  )

const CommitmentInvestorCell = ({
  row,
  rowIndex,
}: {
  readonly row: CommitmentInvestorRowData
  readonly rowIndex: number
}) => {
  const investorMetadata = `${row.entityName} · ${row.investorMeta}`
  const revealInvestorNameOnFocus = row.investorName.length >= 40
  const revealMetadataOnFocus = investorMetadata.length >= 64

  return (
    <TableCell className="px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <InvestorAvatar row={row} rowIndex={rowIndex} />
        <div className="grid min-w-0 gap-0.5">
          <TruncatedText
            className="text-sm font-semibold text-foreground"
            fullText={revealInvestorNameOnFocus ? row.investorName : undefined}
          >
            {row.investorName}
          </TruncatedText>
          <TruncatedText
            className="text-muted-foreground text-xs leading-5"
            fullText={revealMetadataOnFocus ? investorMetadata : undefined}
          >
            {investorMetadata}
          </TruncatedText>
        </div>
      </div>
    </TableCell>
  )
}

const InvestorAvatar = ({
  row,
  rowIndex,
}: {
  readonly row: CommitmentInvestorRowData
  readonly rowIndex: number
}) => {
  const fallbackTone = avatarToneOrder[rowIndex % avatarToneOrder.length] ?? 'navy'
  const avatarTone = row.avatarTone ?? fallbackTone

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        avatarToneClasses[avatarTone],
      )}
      data-avatar-tone={avatarTone}
      data-slot="commitment-investor-avatar"
    >
      {row.investorInitials}
    </span>
  )
}

const CommitmentAmountCell = ({ children }: { readonly children: ReactNode }) => (
  <TableCell className="px-3 py-2 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
    {children}
  </TableCell>
)

const ReadinessStatusCell = ({
  readinessKey,
  state,
}: {
  readonly readinessKey: CommitmentReadinessKey
  readonly state: CommitmentReadinessState
}) => {
  const tone = getCommitmentReadinessTone(state)
  const { Icon, name: iconName } = getReadinessIcon(readinessKey, tone)

  return (
    <TableCell
      className="min-w-0 overflow-hidden border-l border-border/25 px-3 py-2"
      data-slot="readiness-status-cell"
      data-tone={tone}
    >
      <span
        className={cn(
          'flex w-full min-w-0 max-w-full items-center gap-1.5 overflow-hidden text-xs font-medium',
          readinessToneClasses[tone],
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" data-readiness-icon={iconName} />
        <TruncatedText className="flex-1" fullText={state.detail}>
          {state.value}
        </TruncatedText>
      </span>
    </TableCell>
  )
}

type ReadinessIconName = 'alert' | 'bank' | 'check' | 'clock' | 'minus' | 'refresh' | 'signature'

const getReadinessIcon = (
  key: CommitmentReadinessKey,
  tone: CommitmentReadinessTone,
): { readonly Icon: LucideIcon; readonly name: ReadinessIconName } =>
  match({ key, tone })
    .returnType<{ readonly Icon: LucideIcon; readonly name: ReadinessIconName }>()
    .with({ tone: 'danger' }, () => ({ Icon: AlertCircle, name: 'alert' }))
    .with({ tone: 'attention' }, () => ({ Icon: Clock3, name: 'clock' }))
    .with({ tone: 'neutral' }, () => ({ Icon: CircleMinus, name: 'minus' }))
    .with({ key: 'reconciliation', tone: 'info' }, () => ({
      Icon: RefreshCw,
      name: 'refresh',
    }))
    .with({ key: 'signature', tone: 'success' }, () => ({
      Icon: FilePenLine,
      name: 'signature',
    }))
    .with({ key: 'wire', tone: 'success' }, () => ({ Icon: Landmark, name: 'bank' }))
    .with({ tone: 'success' }, () => ({ Icon: CheckCircle2, name: 'check' }))
    .with({ tone: 'info' }, () => ({ Icon: Clock3, name: 'clock' }))
    .exhaustive()

const CommitmentStatusPill = ({
  status,
}: {
  readonly status: CommitmentInvestorRowData['status']
}) => (
  <Badge
    className={cn(
      'h-6 max-w-full shrink justify-start overflow-hidden rounded-full px-2 text-xs font-semibold',
      statusToneClasses[statusToneByInvestorTone[status.tone]],
    )}
    data-slot="commitment-status-pill"
    data-tone={status.tone}
    variant="outline"
  >
    <TruncatedText
      className="min-w-0 max-w-full"
      fullText={status.label.length >= 32 ? status.label : undefined}
    >
      {status.label}
    </TruncatedText>
  </Badge>
)

const CommitmentDataIssueIndicator = ({
  issue,
}: {
  readonly issue: NonNullable<CommitmentInvestorRowData['dataIssue']>
}) => {
  const issueTone = issue.tone ?? 'neutral'
  const IssueIcon = issueTone === 'danger' ? AlertCircle : CircleMinus

  return (
    <span
      className={cn(
        'flex w-full min-w-0 max-w-full items-center gap-1.5 overflow-hidden text-xs font-medium',
        dataIssueToneClasses[issueTone],
      )}
      data-slot="commitment-row-data-issue"
      data-tone={issueTone}
    >
      <IssueIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <TruncatedText
        className="flex-1"
        fullText={issue.label.length >= 32 ? issue.label : undefined}
      >
        {issue.label}
      </TruncatedText>
    </span>
  )
}

const CommitmentActionCell = ({
  active,
  disabled,
  drawerOpen,
  labels,
  onRowOpen,
  row,
}: {
  readonly row: CommitmentInvestorRowData
  readonly active: boolean
  readonly drawerOpen: boolean
  readonly disabled: boolean
  readonly labels: DealCommitmentsTableLabels
  readonly onRowOpen: (row: CommitmentInvestorRowData) => void
}) => {
  const buttonLabel = labels.row.openDetailsLabel(row)

  return (
    <TableCell className="relative px-3 py-2 text-right">
      {drawerOpen ? (
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-[3px] bg-status-info"
          data-slot="commitment-drawer-connector"
        />
      ) : null}
      <Button
        aria-label={buttonLabel}
        className={cn(
          'size-8 rounded-lg text-muted-foreground',
          active ? 'text-status-info' : null,
          drawerOpen ? 'bg-status-info-muted text-status-info hover:bg-status-info-muted' : null,
        )}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onRowOpen(row)
        }}
        size="icon"
        variant="ghost"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </TableCell>
  )
}

const SkeletonCell = ({
  children,
  cellClassName,
  contentClassName,
}: {
  readonly children: ReactNode
  readonly cellClassName?: ComponentProps<typeof TableCell>['className']
  readonly contentClassName?: string
}) => (
  <TableCell className={cn('px-3 py-2', cellClassName)}>
    <div className={cn('flex items-center', contentClassName)}>{children}</div>
  </TableCell>
)
