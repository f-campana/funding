'use client'

import { useEffect, useMemo, useState } from 'react'

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
