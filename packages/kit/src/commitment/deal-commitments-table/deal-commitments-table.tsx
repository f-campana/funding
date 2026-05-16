'use client'

import { cn, Table, TableBody, TooltipProvider } from '@repo/ui'
import { useMemo, useState } from 'react'
import {
  defaultPageSize,
  getCommitmentTableModel,
  getReadyControls,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow,
  CommitmentTableFilterId,
  CommitmentTableSortState,
  DealCommitmentsTableProps,
} from './deal-commitments-table.types'
import { CommitmentsTableBody } from './deal-commitments-table-body'
import { CommitmentsTableFooter } from './deal-commitments-table-footer'
import { CommitmentsTableColgroup, CommitmentsTableHeader } from './deal-commitments-table-header'
import { CommitmentsTableToolbar } from './deal-commitments-table-toolbar'

export type {
  CommitmentInvestorAvatarTone,
  CommitmentInvestorRow,
  CommitmentInvestorStatusTone,
  CommitmentReadinessKey,
  CommitmentReadinessState,
  CommitmentReadinessTone,
  CommitmentRowDataIssueTone,
  CommitmentTableFilterId,
  CommitmentTableGroupValue,
  CommitmentTablePaginationState,
  CommitmentTableSortDirection,
  CommitmentTableSortKey,
  CommitmentTableSortState,
  CommitmentTableViewValue,
  DealCommitmentsTableLifecycleState,
  DealCommitmentsTableProps,
} from './deal-commitments-table.types'

export const DealCommitmentsTable = ({
  className,
  footer,
  onActiveFilterIdsChange,
  onExportSelected,
  onExportVisible,
  onPageChange,
  onPageSizeChange,
  onRowOpen,
  onSearchValueChange,
  onSelectedRowIdsChange,
  state,
  subtitle,
  title,
  toolbar,
}: DealCommitmentsTableProps) => {
  const [localActiveFilterIds, setLocalActiveFilterIds] = useState<
    readonly CommitmentTableFilterId[]
  >([])
  const [localActiveRowId, setLocalActiveRowId] = useState<string>()
  const [localDrawerOpenRowId, setLocalDrawerOpenRowId] = useState<string>()
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(defaultPageSize)
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [localSelectedRowIds, setLocalSelectedRowIds] = useState<readonly string[]>([])
  const localSort: CommitmentTableSortState | undefined = undefined

  // Ready-state controls are semi-controlled: provided state values win; omitted values use local
  // state for Storybook/demo interaction. Sort/group/view remain non-default controlled inputs for
  // downstream experiments; T3E does not render visible controls for them.
  const controls = getReadyControls({
    local: {
      activeFilterIds: localActiveFilterIds,
      activeRowId: localActiveRowId,
      drawerOpenRowId: localDrawerOpenRowId,
      group: 'none',
      page: localPage,
      pageSize: localPageSize,
      searchValue: localSearchValue,
      selectedRowIds: localSelectedRowIds,
      sort: localSort,
      view: 'default',
    },
    state,
  })

  const model = useMemo(
    () => (state.kind === 'ready' ? getCommitmentTableModel(state.rows, controls) : undefined),
    [state, controls],
  )

  const isReady = state.kind === 'ready'
  const isLoading = state.kind === 'loading'

  const setPage = (page: number) => {
    setLocalPage(page)
    onPageChange?.(page)
  }

  const resetPage = () => {
    setPage(1)
  }

  const setSearchValue = (value: string) => {
    setLocalSearchValue(value)
    onSearchValueChange?.(value)
    resetPage()
  }

  const setActiveFilterIds = (ids: readonly CommitmentTableFilterId[]) => {
    setLocalActiveFilterIds(ids)
    onActiveFilterIdsChange?.(ids)
    resetPage()
  }

  const setSelectedRowIds = (rowIds: readonly string[]) => {
    setLocalSelectedRowIds(rowIds)
    onSelectedRowIdsChange?.(rowIds)
  }

  const setPageSize = (pageSize: number) => {
    setLocalPageSize(pageSize)
    onPageSizeChange?.(pageSize)
    resetPage()
  }

  const openRow = (row: CommitmentInvestorRow) => {
    if (row.disabled) {
      return
    }

    setLocalActiveRowId(row.id)
    setLocalDrawerOpenRowId(row.id)
    onRowOpen?.(row.id)
  }

  const toggleRowSelection = (row: CommitmentInvestorRow) => {
    if (row.disabled) {
      return
    }

    const selected = new Set(controls.selectedRowIds)

    if (selected.has(row.id)) {
      selected.delete(row.id)
    } else {
      selected.add(row.id)
    }

    setSelectedRowIds([...selected])
  }

  const toggleVisibleSelection = () => {
    if (!model || model.selectableVisibleRowIds.length === 0) {
      return
    }

    const next = new Set(controls.selectedRowIds)
    const shouldClearVisible =
      model.headerCheckboxState === true || model.headerCheckboxState === 'indeterminate'

    for (const rowId of model.selectableVisibleRowIds) {
      if (shouldClearVisible) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
    }

    setSelectedRowIds([...next])
  }

  const exportRows = () => {
    if (!model) {
      return
    }

    if (model.selectedVisibleRowIds.length > 0) {
      onExportSelected?.(model.selectedVisibleRowIds)
      return
    }

    onExportVisible?.(model.visibleExportRowIds)
  }

  return (
    <TooltipProvider delayDuration={250}>
      <section
        aria-busy={isLoading ? true : undefined}
        className={cn(
          'max-w-full overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-card',
          className,
        )}
        data-slot="deal-commitments-table"
      >
        <CommitmentsTableToolbar
          controls={controls}
          disabled={!isReady || (model ? !model.hasSourceRows : true)}
          exportDisabled={!model || model.visibleExportRowIds.length === 0}
          model={model}
          onExport={exportRows}
          onFilterChange={setActiveFilterIds}
          onSearchChange={setSearchValue}
          subtitle={subtitle}
          title={title}
          toolbar={toolbar}
        />
        <div
          className="max-w-full overflow-x-auto overscroll-x-contain"
          data-overflow-contained="true"
          data-slot="commitments-table-scroll"
        >
          <Table aria-label={title} className="min-w-[61.75rem] table-fixed">
            <CommitmentsTableColgroup />
            <CommitmentsTableHeader
              headerCheckboxState={model?.headerCheckboxState ?? false}
              headerSelectionDisabled={!model || model.selectableVisibleRowIds.length === 0}
              onSelectVisible={toggleVisibleSelection}
            />
            <TableBody>
              <CommitmentsTableBody
                model={model}
                onRowOpen={openRow}
                onRowSelect={toggleRowSelection}
                state={state}
                selectedRowIds={controls.selectedRowIds}
              />
            </TableBody>
          </Table>
        </div>
        <CommitmentsTableFooter
          footer={footer}
          model={model}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          stateKind={state.kind}
        />
      </section>
    </TooltipProvider>
  )
}
