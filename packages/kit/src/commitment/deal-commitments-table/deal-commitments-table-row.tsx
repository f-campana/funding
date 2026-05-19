import { Checkbox, cn, TableCell, TableRow } from '@repo/ui'
import type { ReactNode } from 'react'

import { visibleReadinessKeys } from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow as CommitmentInvestorRowData,
  CommitmentRowVisualState,
  DealCommitmentsTableLabels,
  DealCommitmentsTableRowActionRenderProps,
} from './deal-commitments-table.types'
import {
  CommitmentActionCell,
  CommitmentAmountCell,
  CommitmentDataIssueIndicator,
  CommitmentInvestorCell,
  CommitmentStatusPill,
  ReadinessStatusCell,
} from './deal-commitments-table-row-cells'

export { CommitmentGroupRow } from './deal-commitments-table-group-row'
export { CommitmentRowActionButton } from './deal-commitments-table-row-cells'
export { CommitmentRowSkeleton } from './deal-commitments-table-row-skeleton'
export { TruncatedText } from './deal-commitments-table-truncated-text'

export const CommitmentInvestorRow = ({
  batchSelected,
  labels,
  onRowOpen,
  onRowSelect,
  renderRowAction,
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
  readonly renderRowAction?:
    | ((props: DealCommitmentsTableRowActionRenderProps) => ReactNode)
    | undefined
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
        renderAction={renderRowAction}
        row={row}
      />
    </TableRow>
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
