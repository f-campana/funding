'use client'

import { cn, Table, TableBody, TooltipProvider } from '@repo/ui'
import { useEffect, useMemo, useState } from 'react'
import {
  defaultPageSize,
  getCommitmentTableModel,
  getReadyControls,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow,
  CommitmentTableFilterId,
  CommitmentTableRowState,
  CommitmentTableSortState,
  DealCommitmentsTableExportProps,
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
  CommitmentReadinessRecord,
  CommitmentReadinessState,
  CommitmentReadinessTone,
  CommitmentReadinessVariant,
  CommitmentReadinessVariantByKey,
  CommitmentRowDataIssueTone,
  CommitmentTableExportHandler,
  CommitmentTableFilterId,
  CommitmentTableGroupValue,
  CommitmentTablePaginationState,
  CommitmentTableRetryAction,
  CommitmentTableRowState,
  CommitmentTableSortDirection,
  CommitmentTableSortKey,
  CommitmentTableSortState,
  CommitmentTableViewValue,
  DealCommitmentsTableBaseToolbarLabels,
  DealCommitmentsTableExportProps,
  DealCommitmentsTableExportToolbarLabels,
  DealCommitmentsTableLabels,
  DealCommitmentsTableLifecycleState,
  DealCommitmentsTableNoExportProps,
  DealCommitmentsTableNoExportToolbarLabels,
  DealCommitmentsTableProps,
} from './deal-commitments-table.types'

export const DealCommitmentsTable = (props: DealCommitmentsTableProps) => {
  const {
    className,
    footer,
    labels,
    onActiveFilterIdsChange,
    onPageChange,
    onPageSizeChange,
    onRowOpen,
    onRowStateChange,
    onSearchValueChange,
    onSelectedRowIdsChange,
    state,
    subtitle,
    title,
    toolbar,
  } = props
  const [localActiveFilterIds, setLocalActiveFilterIds] = useState<
    readonly CommitmentTableFilterId[]
  >(() => (state.kind === 'ready' ? (state.activeFilterIds ?? []) : []))
  const [localRowState, setLocalRowState] = useState<CommitmentTableRowState>(() =>
    state.kind === 'ready' ? (state.rowState ?? { kind: 'idle' }) : { kind: 'idle' },
  )
  const [localPage, setLocalPage] = useState(() =>
    state.kind === 'ready' ? (state.pagination?.page ?? 1) : 1,
  )
  const [localPageSize, setLocalPageSize] = useState(() =>
    state.kind === 'ready' ? (state.pagination?.pageSize ?? defaultPageSize) : defaultPageSize,
  )
  const [localSearchValue, setLocalSearchValue] = useState(() =>
    state.kind === 'ready' ? (state.searchValue ?? '') : '',
  )
  const [localSelectedRowIds, setLocalSelectedRowIds] = useState<readonly string[]>(() =>
    state.kind === 'ready' ? (state.selectedRowIds ?? []) : [],
  )
  const localSort: CommitmentTableSortState | undefined = undefined
  const readyActiveFilterIds = state.kind === 'ready' ? state.activeFilterIds : undefined
  const readyPage = state.kind === 'ready' ? state.pagination?.page : undefined
  const readyPageSize = state.kind === 'ready' ? state.pagination?.pageSize : undefined
  const readySearchValue = state.kind === 'ready' ? state.searchValue : undefined
  const readySelectedRowIds = state.kind === 'ready' ? state.selectedRowIds : undefined

  useEffect(() => {
    if (onActiveFilterIdsChange === undefined && readyActiveFilterIds) {
      setLocalActiveFilterIds(readyActiveFilterIds)
    }
  }, [onActiveFilterIdsChange, readyActiveFilterIds])

  useEffect(() => {
    if (onPageChange === undefined && readyPage !== undefined) {
      setLocalPage(readyPage)
    }
  }, [onPageChange, readyPage])

  useEffect(() => {
    if (onPageSizeChange === undefined && readyPageSize !== undefined) {
      setLocalPageSize(readyPageSize)
    }
  }, [onPageSizeChange, readyPageSize])

  useEffect(() => {
    if (onSearchValueChange === undefined && readySearchValue !== undefined) {
      setLocalSearchValue(readySearchValue)
    }
  }, [onSearchValueChange, readySearchValue])

  useEffect(() => {
    if (onSelectedRowIdsChange === undefined && readySelectedRowIds) {
      setLocalSelectedRowIds(readySelectedRowIds)
    }
  }, [onSelectedRowIdsChange, readySelectedRowIds])

  // Ready-state controls are controlled only when the matching callback is present. Without the
  // callback, provided values seed local state so interactive controls do not become frozen.
  const controls = getReadyControls({
    controlled: {
      activeFilterIds: onActiveFilterIdsChange !== undefined,
      page: onPageChange !== undefined,
      pageSize: onPageSizeChange !== undefined,
      rowState: onRowStateChange !== undefined,
      searchValue: onSearchValueChange !== undefined,
      selectedRowIds: onSelectedRowIdsChange !== undefined,
    },
    local: {
      activeFilterIds: localActiveFilterIds,
      group: 'none',
      page: localPage,
      pageSize: localPageSize,
      rowState: localRowState,
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

  const setRowState = (rowState: CommitmentTableRowState) => {
    if (onRowStateChange === undefined) {
      setLocalRowState(rowState)
    }

    onRowStateChange?.(rowState)
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

    setRowState({ drawerOpen: true, kind: 'active', rowId: row.id })
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

  const exportAction = isExportEnabled(props)
    ? {
        disabled: !model || model.visibleExportRowIds.length === 0,
        exportSelectedLabel: props.toolbar.exportSelectedLabel,
        exportVisibleLabel: props.toolbar.exportVisibleLabel,
        onExport: () => {
          if (!model) {
            return
          }

          if (model.selectedVisibleRowIds.length > 0) {
            props.onExportSelected(model.selectedVisibleRowIds)
            return
          }

          props.onExportVisible(model.visibleExportRowIds)
        },
      }
    : undefined

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
          exportAction={exportAction}
          model={model}
          onFilterChange={setActiveFilterIds}
          onSearchChange={setSearchValue}
          subtitle={subtitle}
          title={title}
          toolbar={toolbar}
          labels={labels}
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
              labels={labels}
              onSelectVisible={toggleVisibleSelection}
            />
            <TableBody>
              <CommitmentsTableBody
                model={model}
                labels={labels}
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
          labels={labels}
          model={model}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          stateKind={state.kind}
        />
      </section>
    </TooltipProvider>
  )
}

const isExportEnabled = (
  props: DealCommitmentsTableProps,
): props is DealCommitmentsTableExportProps =>
  props.onExportSelected !== undefined && props.onExportVisible !== undefined
