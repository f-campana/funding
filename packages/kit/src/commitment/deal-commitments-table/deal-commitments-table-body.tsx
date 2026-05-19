import type { ReactNode } from 'react'
import { match } from 'ts-pattern'

import {
  defaultPageSize,
  getCommitmentRowVisualState,
  loadingRows,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow as CommitmentInvestorRowData,
  CommitmentTableModel,
  DealCommitmentsTableLabels,
  DealCommitmentsTableLifecycleState,
  DealCommitmentsTableRowActionRenderProps,
} from './deal-commitments-table.types'
import {
  CommitmentGroupRow,
  CommitmentInvestorRow,
  CommitmentRowSkeleton,
} from './deal-commitments-table-row'
import { CommitmentTableStateRow } from './deal-commitments-table-state-row'

export const CommitmentsTableBody = ({
  labels,
  model,
  onRowOpen,
  onRowSelect,
  renderRowAction,
  selectedRowIds,
  state,
}: {
  readonly labels: DealCommitmentsTableLabels
  readonly model: CommitmentTableModel | undefined
  readonly onRowOpen: (row: CommitmentInvestorRowData) => void
  readonly onRowSelect: (row: CommitmentInvestorRowData) => void
  readonly renderRowAction?:
    | ((props: DealCommitmentsTableRowActionRenderProps) => ReactNode)
    | undefined
  readonly selectedRowIds: readonly string[]
  readonly state: DealCommitmentsTableLifecycleState
}) =>
  match(state)
    .with({ kind: 'loading' }, ({ rowCount }) => (
      <>
        {loadingRows(rowCount ?? defaultPageSize).map((rowId) => (
          <CommitmentRowSkeleton key={rowId} />
        ))}
      </>
    ))
    .with({ kind: 'empty' }, ({ description, title }) => (
      <CommitmentTableStateRow description={description} kind="empty" title={title} />
    ))
    .with({ kind: 'error' }, ({ description, retry, title }) => (
      <CommitmentTableStateRow description={description} kind="error" retry={retry} title={title} />
    ))
    .with({ kind: 'ready' }, () => (
      <>
        {model &&
          getReadyBodyRows(labels, model, selectedRowIds, onRowOpen, onRowSelect, renderRowAction)}
      </>
    ))
    .exhaustive()

const getReadyBodyRows = (
  labels: DealCommitmentsTableLabels,
  model: CommitmentTableModel,
  selectedRowIds: readonly string[],
  onRowOpen: (row: CommitmentInvestorRowData) => void,
  onRowSelect: (row: CommitmentInvestorRowData) => void,
  renderRowAction: ((props: DealCommitmentsTableRowActionRenderProps) => ReactNode) | undefined,
) => {
  if (!model.hasSourceRows) {
    return (
      <CommitmentTableStateRow
        description={labels.empty.noDataDescription}
        kind="empty"
        title={labels.empty.noDataTitle}
      />
    )
  }

  if (model.filteredRows.length === 0) {
    return (
      <CommitmentTableStateRow
        description={labels.empty.noResultsDescription}
        kind="empty"
        title={labels.empty.noResultsTitle}
      />
    )
  }

  return model.groupedItems.map((item) =>
    item.kind === 'group' ? (
      <CommitmentGroupRow
        count={item.count}
        key={`group-${item.id}`}
        label={item.label}
        labels={labels}
      />
    ) : (
      <CommitmentInvestorRow
        batchSelected={selectedRowIds.includes(item.row.id) && !item.row.disabled}
        labels={labels}
        key={item.row.id}
        onRowOpen={onRowOpen}
        onRowSelect={onRowSelect}
        renderRowAction={renderRowAction}
        row={item.row}
        rowIndex={item.rowIndex}
        visualState={getCommitmentRowVisualState({
          activeRowId: model.activeRowId,
          drawerOpenRowId: model.drawerOpenRowId,
          hoveredRowId: model.hoveredRowId,
          row: item.row,
        })}
      />
    ),
  )
}
