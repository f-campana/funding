import { Badge, Button, cn, TableCell } from '@repo/ui'
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
import type { ReactNode } from 'react'

import { statusToneClasses } from '../../status/status-tone'
import { getCommitmentReadinessTone } from './deal-commitments-table.model'
import type {
  CommitmentInvestorAvatarTone,
  CommitmentInvestorRow as CommitmentInvestorRowData,
  CommitmentReadinessKey,
  CommitmentReadinessState,
  CommitmentReadinessTone,
  CommitmentRowDataIssueTone,
  DealCommitmentsTableLabels,
} from './deal-commitments-table.types'
import { TruncatedText } from './deal-commitments-table-truncated-text'

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

export const CommitmentInvestorCell = ({
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

export const CommitmentAmountCell = ({ children }: { readonly children: ReactNode }) => (
  <TableCell className="px-3 py-2 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
    {children}
  </TableCell>
)

export const ReadinessStatusCell = ({
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

type ReadinessIconConfig = { readonly Icon: LucideIcon; readonly name: ReadinessIconName }

const readinessIconByTone = {
  attention: { Icon: Clock3, name: 'clock' },
  danger: { Icon: AlertCircle, name: 'alert' },
  info: { Icon: Clock3, name: 'clock' },
  neutral: { Icon: CircleMinus, name: 'minus' },
  success: { Icon: CheckCircle2, name: 'check' },
} as const satisfies Record<CommitmentReadinessTone, ReadinessIconConfig>

const successReadinessIconByKey: Partial<Record<CommitmentReadinessKey, ReadinessIconConfig>> = {
  signature: { Icon: FilePenLine, name: 'signature' },
  wire: { Icon: Landmark, name: 'bank' },
}

const getReadinessIcon = (
  key: CommitmentReadinessKey,
  tone: CommitmentReadinessTone,
): ReadinessIconConfig => {
  if (tone === 'info' && key === 'reconciliation') {
    return { Icon: RefreshCw, name: 'refresh' }
  }

  if (tone === 'success') {
    return successReadinessIconByKey[key] ?? readinessIconByTone.success
  }

  return readinessIconByTone[tone]
}

export const CommitmentStatusPill = ({
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

export const CommitmentDataIssueIndicator = ({
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

export const CommitmentActionCell = ({
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
