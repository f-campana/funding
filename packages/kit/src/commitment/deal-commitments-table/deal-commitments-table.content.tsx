'use client'

import { useMemo, useState } from 'react'

import { DealCommitmentsTableContext } from './deal-commitments-table.context'
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
  DealCommitmentsTableContentProps,
  DealCommitmentsTableExportContentProps,
} from './deal-commitments-table.types'
import { DealCommitmentsTableFooter } from './deal-commitments-table-footer'
import { DealCommitmentsTableGrid } from './deal-commitments-table-grid'
import { DealCommitmentsTableToolbar } from './deal-commitments-table-toolbar'

export const DealCommitmentsTableContent = (props: DealCommitmentsTableContentProps) => {
  const {
    children,
    footer,
    labels,
    onActiveFilterIdsChange,
    onPageChange,
    onPageSizeChange,
    onRowOpen,
    onRowStateChange,
    onSearchValueChange,
    onSelectedRowIdsChange,
    renderRowAction,
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
  const activeFilterIdsControlled =
    onActiveFilterIdsChange !== undefined && readyActiveFilterIds !== undefined
  const pageControlled = onPageChange !== undefined && readyPage !== undefined
  const pageSizeControlled = onPageSizeChange !== undefined && readyPageSize !== undefined
  const rowStateControlled = onRowStateChange !== undefined
  const searchValueControlled = onSearchValueChange !== undefined && readySearchValue !== undefined
  const selectedRowIdsControlled =
    onSelectedRowIdsChange !== undefined && readySelectedRowIds !== undefined

  // Ready-state values are controlled only when a caller provides both the value and its change
  // callback. Row state treats `undefined` as a controlled idle clear when its callback is present.
  const controls = getReadyControls({
    controlled: {
      activeFilterIds: activeFilterIdsControlled,
      page: pageControlled,
      pageSize: pageSizeControlled,
      rowState: rowStateControlled,
      searchValue: searchValueControlled,
      selectedRowIds: selectedRowIdsControlled,
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

  const setPage = (page: number) => {
    setLocalValueUnlessControlled(pageControlled, setLocalPage, page)
    onPageChange?.(page)
  }

  const resetPage = () => {
    setPage(1)
  }

  const setSearchValue = (value: string) => {
    setLocalValueUnlessControlled(searchValueControlled, setLocalSearchValue, value)
    onSearchValueChange?.(value)
    resetPage()
  }

  const setActiveFilterIds = (ids: readonly CommitmentTableFilterId[]) => {
    setLocalValueUnlessControlled(activeFilterIdsControlled, setLocalActiveFilterIds, ids)
    onActiveFilterIdsChange?.(ids)
    resetPage()
  }

  const setSelectedRowIds = (rowIds: readonly string[]) => {
    setLocalValueUnlessControlled(selectedRowIdsControlled, setLocalSelectedRowIds, rowIds)
    onSelectedRowIdsChange?.(rowIds)
  }

  const setRowState = (rowState: CommitmentTableRowState) => {
    if (onRowStateChange === undefined) {
      setLocalRowState(rowState)
    }

    onRowStateChange?.(rowState)
  }

  const setPageSize = (pageSize: number) => {
    setLocalValueUnlessControlled(pageSizeControlled, setLocalPageSize, pageSize)
    onPageSizeChange?.(pageSize)
    resetPage()
  }

  const setDetailOpen = (open: boolean) => {
    if (!open) {
      setRowState({ kind: 'idle' })
    }
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
    <DealCommitmentsTableContext
      value={{
        controls,
        disabled: !isReady || (model ? !model.hasSourceRows : true),
        exportAction,
        footer,
        labels,
        model,
        onDetailOpenChange: setDetailOpen,
        onFilterChange: setActiveFilterIds,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        onRowOpen: openRow,
        onRowSelect: toggleRowSelection,
        onSearchChange: setSearchValue,
        onSelectVisible: toggleVisibleSelection,
        renderRowAction,
        state,
        subtitle,
        title,
        toolbar,
      }}
    >
      {children ?? (
        <>
          <DealCommitmentsTableToolbar />
          <DealCommitmentsTableGrid />
          <DealCommitmentsTableFooter />
        </>
      )}
    </DealCommitmentsTableContext>
  )
}

const isExportEnabled = (
  props: DealCommitmentsTableContentProps,
): props is DealCommitmentsTableExportContentProps =>
  props.onExportSelected !== undefined && props.onExportVisible !== undefined

const setLocalValueUnlessControlled = <Value,>(
  controlled: boolean,
  setLocalValue: (value: Value) => void,
  value: Value,
) => {
  if (!controlled) {
    setLocalValue(value)
  }
}
