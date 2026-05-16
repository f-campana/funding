import { match } from 'ts-pattern'

import {
  defaultPageSize,
  getCommitmentRowVisualState,
  loadingRows,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow as CommitmentInvestorRowData,
  CommitmentTableModel,
  DealCommitmentsTableLifecycleState,
} from './deal-commitments-table.types'
import {
  CommitmentGroupRow,
  CommitmentInvestorRow,
  CommitmentRowSkeleton,
} from './deal-commitments-table-row'
import { CommitmentTableStateRow } from './deal-commitments-table-state-row'

export const CommitmentsTableBody = ({
  model,
  onRowOpen,
  onRowSelect,
  selectedRowIds,
  state,
}: {
  readonly model: CommitmentTableModel | undefined
  readonly onRowOpen: (row: CommitmentInvestorRowData) => void
  readonly onRowSelect: (row: CommitmentInvestorRowData) => void
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
    .with({ kind: 'error' }, ({ description, onRetry, retryLabel, title }) => (
      <CommitmentTableStateRow
        description={description}
        kind="error"
        onRetry={onRetry}
        retryLabel={retryLabel}
        title={title}
      />
    ))
    .with({ kind: 'ready' }, () => (
      <>{model && getReadyBodyRows(model, selectedRowIds, onRowOpen, onRowSelect)}</>
    ))
    .exhaustive()

const getReadyBodyRows = (
  model: CommitmentTableModel,
  selectedRowIds: readonly string[],
  onRowOpen: (row: CommitmentInvestorRowData) => void,
  onRowSelect: (row: CommitmentInvestorRowData) => void,
) => {
  if (!model.hasSourceRows) {
    return (
      <CommitmentTableStateRow
        description="Invited investors and submitted commitments will appear here."
        kind="empty"
        title="No commitments yet"
      />
    )
  }

  if (model.filteredRows.length === 0) {
    return (
      <CommitmentTableStateRow
        description="Clear search or filters to return to all commitments."
        kind="empty"
        title="No commitments match your search or filters"
      />
    )
  }

  return model.groupedItems.map((item) =>
    item.kind === 'group' ? (
      <CommitmentGroupRow count={item.count} key={`group-${item.id}`} label={item.label} />
    ) : (
      <CommitmentInvestorRow
        batchSelected={selectedRowIds.includes(item.row.id) && !item.row.disabled}
        key={item.row.id}
        onRowOpen={onRowOpen}
        onRowSelect={onRowSelect}
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
