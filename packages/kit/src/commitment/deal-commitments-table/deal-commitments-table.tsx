'use client'

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TooltipProvider,
} from '@repo/ui'
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  defaultPageSize,
  filterOptions,
  getCommitmentTableModel,
  getReadyControls,
  pageSizeOptions,
  toggleFilterId,
} from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow,
  CommitmentTableFilterId,
  CommitmentTableRowState,
  CommitmentTableSortState,
  DealCommitmentsTableContentProps,
  DealCommitmentsTableDetailProps,
  DealCommitmentsTableExportContentProps,
  DealCommitmentsTableModelProps,
  DealCommitmentsTableProps,
  DealCommitmentsTableRootProps,
} from './deal-commitments-table.types'
import { CommitmentsTableBody } from './deal-commitments-table-body'
import { CommitmentsTableColgroup, CommitmentsTableHeader } from './deal-commitments-table-header'
import { CommitmentRowActionButton as DealCommitmentsTableRowActionButton } from './deal-commitments-table-row'

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
  DealCommitmentsTableContentProps,
  DealCommitmentsTableDetailProps,
  DealCommitmentsTableDetailRenderProps,
  DealCommitmentsTableExportContentProps,
  DealCommitmentsTableExportProps,
  DealCommitmentsTableExportToolbarLabels,
  DealCommitmentsTableLabels,
  DealCommitmentsTableLifecycleState,
  DealCommitmentsTableModelProps,
  DealCommitmentsTableModelRenderProps,
  DealCommitmentsTableNoExportContentProps,
  DealCommitmentsTableNoExportProps,
  DealCommitmentsTableNoExportToolbarLabels,
  DealCommitmentsTableProps,
  DealCommitmentsTableRootProps,
  DealCommitmentsTableRowActionRenderProps,
} from './deal-commitments-table.types'

export { DealCommitmentsTableRowActionButton }

type DealCommitmentsTableExportAction =
  | {
      readonly disabled: boolean
      readonly exportSelectedLabel: string
      readonly exportVisibleLabel: string
      readonly onExport: () => void
    }
  | undefined

type DealCommitmentsTableContextValue = {
  readonly controls: ReturnType<typeof getReadyControls>
  readonly disabled: boolean
  readonly exportAction: DealCommitmentsTableExportAction
  readonly footer: DealCommitmentsTableContentProps['footer']
  readonly labels: DealCommitmentsTableContentProps['labels']
  readonly model: ReturnType<typeof getCommitmentTableModel> | undefined
  readonly onDetailOpenChange: (open: boolean) => void
  readonly onFilterChange: (filterIds: readonly CommitmentTableFilterId[]) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRowOpen: (row: CommitmentInvestorRow) => void
  readonly onRowSelect: (row: CommitmentInvestorRow) => void
  readonly onSearchChange: (value: string) => void
  readonly onSelectVisible: () => void
  readonly renderRowAction: DealCommitmentsTableContentProps['renderRowAction']
  readonly state: DealCommitmentsTableContentProps['state']
  readonly subtitle: DealCommitmentsTableContentProps['subtitle']
  readonly title: DealCommitmentsTableContentProps['title']
  readonly toolbar: DealCommitmentsTableContentProps['toolbar']
}

type DealCommitmentsTableToolbarButtonProps = {
  readonly disabled?: boolean | undefined
  readonly icon: ReactNode
} & Omit<ComponentProps<typeof Button>, 'disabled'>

const DealCommitmentsTableContext = createContext<DealCommitmentsTableContextValue | undefined>(
  undefined,
)

const useDealCommitmentsTableContext = () => {
  const context = useContext(DealCommitmentsTableContext)

  if (!context) {
    throw new Error('DealCommitmentsTable compound parts must be rendered inside Content.')
  }

  return context
}

export const DealCommitmentsTableRoot = ({
  busy,
  children,
  className,
  state,
  ...sectionProps
}: DealCommitmentsTableRootProps) => (
  <TooltipProvider delayDuration={250}>
    <section
      {...sectionProps}
      aria-busy={busy ?? (state?.kind === 'loading' ? true : undefined)}
      className={cn(
        'max-w-full overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-card',
        className,
      )}
      data-slot="deal-commitments-table"
    >
      {children}
    </section>
  </TooltipProvider>
)

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

export const DealCommitmentsTableToolbarRoot = ({
  children,
  className,
  ...headerProps
}: ComponentPropsWithoutRef<'header'>) => (
  <header
    className={cn('flex flex-col gap-3 border-b border-border/60 px-4 py-4 xl:px-5', className)}
    data-slot="commitments-table-toolbar"
    {...headerProps}
  >
    {children}
  </header>
)

export const DealCommitmentsTableToolbarHeading = () => {
  const { subtitle, title } = useDealCommitmentsTableContext()

  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold leading-tight text-foreground">{title}</h2>
      <p className="text-sm leading-5 text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export const DealCommitmentsTableToolbarControls = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => {
  const { title } = useDealCommitmentsTableContext()

  return (
    <div aria-label={title} className={cn('grid gap-2.5', className)} role="toolbar" {...divProps}>
      {children}
    </div>
  )
}

export const DealCommitmentsTableToolbarPrimaryRow = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2 xl:flex-nowrap', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableSearch = () => {
  const { controls, disabled, model, onSearchChange, toolbar } = useDealCommitmentsTableContext()

  return (
    <div className="relative w-full sm:w-[15rem]">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={toolbar.searchPlaceholder}
        className="h-9 rounded-lg bg-background pl-9 text-sm"
        disabled={disabled && !model?.hasSourceRows}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        placeholder={toolbar.searchPlaceholder}
        value={controls.searchValue}
      />
    </div>
  )
}

export const DealCommitmentsTableToolbarActions = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2 xl:ml-auto', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableSelectedCount = () => {
  const { model, toolbar } = useDealCommitmentsTableContext()
  const selectedCount = model?.selectedVisibleRowIds.length ?? 0

  return selectedCount > 0 ? (
    <span
      className="rounded-full border border-status-info-border bg-status-info-muted px-2.5 py-0.5 text-status-info text-xs font-semibold"
      data-slot="commitments-selected-count"
    >
      {selectedCount} {toolbar.selectedLabel}
    </span>
  ) : null
}

export const DealCommitmentsTableExportButton = () => {
  const { exportAction, model } = useDealCommitmentsTableContext()
  const selectedCount = model?.selectedVisibleRowIds.length ?? 0
  const exportLabel = exportAction
    ? selectedCount > 0
      ? exportAction.exportSelectedLabel
      : exportAction.exportVisibleLabel
    : undefined

  return exportAction && exportLabel ? (
    <DealCommitmentsTableToolbarButton
      className={selectedCount > 0 ? 'w-44' : 'w-36'}
      disabled={exportAction.disabled}
      icon={<Download />}
      onClick={exportAction.onExport}
    >
      {exportLabel}
    </DealCommitmentsTableToolbarButton>
  ) : null
}

export const DealCommitmentsTableFilters = () => {
  const { controls, disabled, labels, onFilterChange, toolbar } = useDealCommitmentsTableContext()

  return (
    <fieldset
      className="flex flex-wrap items-center gap-1.5"
      data-slot="commitments-workflow-filters"
    >
      <legend className="sr-only">{toolbar.workflowFiltersLabel}</legend>
      {filterOptions.map((option) => {
        const active = controls.activeFilterIds.includes(option.id)
        const label = labels.filters[option.id]

        return (
          <Button
            aria-pressed={active}
            className={cn(
              'h-7 rounded-full px-2.5 text-xs font-medium',
              active
                ? 'border-status-info-border bg-status-info-muted text-status-info hover:bg-status-info-muted'
                : 'bg-background/70 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
            disabled={disabled}
            key={option.id}
            onClick={() => onFilterChange(toggleFilterId(controls.activeFilterIds, option.id))}
            size="sm"
            variant="outline"
          >
            {label}
          </Button>
        )
      })}
    </fieldset>
  )
}

export const DealCommitmentsTableToolbarButton = ({
  children,
  className,
  disabled,
  icon,
  ...buttonProps
}: DealCommitmentsTableToolbarButtonProps) => (
  <Button
    className={cn('h-9 justify-start rounded-lg bg-background/70 px-3 text-sm', className)}
    disabled={disabled}
    variant="outline"
    {...buttonProps}
  >
    <span
      className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4"
      data-icon="inline-start"
    >
      {icon}
    </span>
    <span className="min-w-0 truncate">{children}</span>
  </Button>
)

export const DealCommitmentsTableToolbar = () => (
  <DealCommitmentsTableToolbarRoot>
    <DealCommitmentsTableToolbarHeading />
    <DealCommitmentsTableToolbarControls>
      <DealCommitmentsTableToolbarPrimaryRow>
        <DealCommitmentsTableSearch />
        <DealCommitmentsTableToolbarActions>
          <DealCommitmentsTableSelectedCount />
          <DealCommitmentsTableExportButton />
        </DealCommitmentsTableToolbarActions>
      </DealCommitmentsTableToolbarPrimaryRow>
      <DealCommitmentsTableFilters />
    </DealCommitmentsTableToolbarControls>
  </DealCommitmentsTableToolbarRoot>
)

export const DealCommitmentsTableGridRoot = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn('max-w-full overflow-x-auto overscroll-x-contain', className)}
    data-overflow-contained="true"
    data-slot="commitments-table-scroll"
    {...divProps}
  >
    {children}
  </div>
)

export const DealCommitmentsTableTable = ({
  children,
  className,
  ...tableProps
}: ComponentProps<typeof Table>) => {
  const { title } = useDealCommitmentsTableContext()

  return (
    <Table
      aria-label={title}
      className={cn('min-w-[61.75rem] table-fixed', className)}
      {...tableProps}
    >
      {children}
    </Table>
  )
}

export const DealCommitmentsTableColumnGroup = CommitmentsTableColgroup

export const DealCommitmentsTableHeader = () => {
  const { labels, model, onSelectVisible } = useDealCommitmentsTableContext()

  return (
    <CommitmentsTableHeader
      headerCheckboxState={model?.headerCheckboxState ?? false}
      headerSelectionDisabled={!model || model.selectableVisibleRowIds.length === 0}
      labels={labels}
      onSelectVisible={onSelectVisible}
    />
  )
}

export const DealCommitmentsTableBody = () => {
  const { controls, labels, model, onRowOpen, onRowSelect, renderRowAction, state } =
    useDealCommitmentsTableContext()

  return (
    <TableBody>
      <CommitmentsTableBody
        labels={labels}
        model={model}
        onRowOpen={onRowOpen}
        onRowSelect={onRowSelect}
        renderRowAction={renderRowAction}
        selectedRowIds={controls.selectedRowIds}
        state={state}
      />
    </TableBody>
  )
}

export const DealCommitmentsTableGrid = () => (
  <DealCommitmentsTableGridRoot>
    <DealCommitmentsTableTable>
      <DealCommitmentsTableColumnGroup />
      <DealCommitmentsTableHeader />
      <DealCommitmentsTableBody />
    </DealCommitmentsTableTable>
  </DealCommitmentsTableGridRoot>
)

export const DealCommitmentsTableModel = ({ children }: DealCommitmentsTableModelProps) => {
  const {
    controls,
    disabled,
    labels,
    model,
    onRowOpen,
    onRowSelect,
    onSelectVisible,
    renderRowAction,
    state,
  } = useDealCommitmentsTableContext()

  return (
    <>
      {children({
        controls,
        disabled,
        labels,
        model,
        onRowOpen,
        onRowSelect,
        onSelectVisible,
        renderRowAction,
        state,
      })}
    </>
  )
}

export const DealCommitmentsTableFooterRoot = ({
  children,
  className,
  ...footerProps
}: ComponentPropsWithoutRef<'footer'>) => (
  <footer
    className={cn(
      'flex flex-col gap-3 border-t border-border/60 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between xl:px-7',
      className,
    )}
    data-slot="commitments-table-footer"
    {...footerProps}
  >
    {children}
  </footer>
)

export const DealCommitmentsTableFooterMetrics = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-4', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableFooterControls = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableFooterMetric = ({
  children,
}: {
  readonly children: ReactNode
}) => <span className="font-medium text-muted-foreground">{children}</span>

export const DealCommitmentsTableInvestorCount = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>
      {footerLabels.investorsLabel}
    </DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTableTotalCommitted = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>
      {footerLabels.totalCommittedLabel}
    </DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTableRange = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>{footerLabels.rangeLabel}</DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTablePageSizeSelect = () => {
  const { labels, model, onPageSizeChange } = useDealCommitmentsTableContext()
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 gap-1.5 px-2 text-muted-foreground text-xs"
          disabled={!model}
          variant="ghost"
        >
          {footerLabels.rowsPerPageLabel}
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup
          onValueChange={(value) => onPageSizeChange(Number(value))}
          value={String(model?.pageSize ?? pageSizeOptions[0])}
        >
          {pageSizeOptions.map((pageSize) => (
            <DropdownMenuRadioItem key={pageSize} value={String(pageSize)}>
              {labels.footer.rowsPerPageOptionLabel(pageSize)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const DealCommitmentsTablePreviousPageButton = () => {
  const { labels, model, onPageChange } = useDealCommitmentsTableContext()

  return (
    <Button
      aria-label={labels.footer.previousPageLabel}
      className="size-8"
      disabled={!model || model.page <= 1}
      onClick={() => model && onPageChange(model.page - 1)}
      size="icon"
      variant="ghost"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
    </Button>
  )
}

export const DealCommitmentsTableNextPageButton = () => {
  const { labels, model, onPageChange } = useDealCommitmentsTableContext()

  return (
    <Button
      aria-label={labels.footer.nextPageLabel}
      className="size-8"
      disabled={!model || model.page >= model.pageCount}
      onClick={() => model && onPageChange(model.page + 1)}
      size="icon"
      variant="ghost"
    >
      <ChevronRight aria-hidden="true" className="size-4" />
    </Button>
  )
}

export const DealCommitmentsTableFooter = () => (
  <DealCommitmentsTableFooterRoot>
    <DealCommitmentsTableFooterMetrics>
      <DealCommitmentsTableInvestorCount />
      <DealCommitmentsTableTotalCommitted />
    </DealCommitmentsTableFooterMetrics>
    <DealCommitmentsTableFooterControls>
      <DealCommitmentsTablePageSizeSelect />
      <DealCommitmentsTableRange />
      <DealCommitmentsTablePreviousPageButton />
      <DealCommitmentsTableNextPageButton />
    </DealCommitmentsTableFooterControls>
  </DealCommitmentsTableFooterRoot>
)

export const DealCommitmentsTableDetail = ({ children }: DealCommitmentsTableDetailProps) => {
  const { model, onDetailOpenChange, state } = useDealCommitmentsTableContext()
  const rowId = model?.drawerOpenRowId
  const row = state.kind === 'ready' ? state.rows.find((item) => item.id === rowId) : undefined

  return <>{children({ onOpenChange: onDetailOpenChange, open: row !== undefined, row, rowId })}</>
}

const useDealCommitmentsTableFooterLabels = () => {
  const { footer, labels, model, state } = useDealCommitmentsTableContext()

  if (!model || state.kind !== 'ready') {
    return footer
  }

  const start = model.totalRows === 0 ? 0 : (model.page - 1) * model.pageSize + 1
  const end = model.totalRows === 0 ? 0 : Math.min(model.page * model.pageSize, model.totalRows)

  return {
    investorsLabel: labels.footer.investorsLabel(model.totalRows),
    rangeLabel: labels.footer.rangeLabel(start, end, model.totalRows),
    rowsPerPageLabel: labels.footer.rowsPerPageLabel(model.pageSize),
    totalCommittedLabel:
      model.totalRows === 0 ? labels.footer.emptyTotalCommittedLabel : footer.totalCommittedLabel,
  }
}

const DealCommitmentsTableView = (props: DealCommitmentsTableProps) => (
  <DealCommitmentsTableRoot className={props.className} state={props.state}>
    <DealCommitmentsTableContent {...props} />
  </DealCommitmentsTableRoot>
)

export const DealCommitmentsTable = Object.assign(DealCommitmentsTableView, {
  Body: DealCommitmentsTableBody,
  ColumnGroup: DealCommitmentsTableColumnGroup,
  Content: DealCommitmentsTableContent,
  Detail: DealCommitmentsTableDetail,
  ExportButton: DealCommitmentsTableExportButton,
  Filters: DealCommitmentsTableFilters,
  Footer: DealCommitmentsTableFooter,
  FooterControls: DealCommitmentsTableFooterControls,
  FooterMetric: DealCommitmentsTableFooterMetric,
  FooterMetrics: DealCommitmentsTableFooterMetrics,
  FooterRoot: DealCommitmentsTableFooterRoot,
  Grid: DealCommitmentsTableGrid,
  GridRoot: DealCommitmentsTableGridRoot,
  Header: DealCommitmentsTableHeader,
  InvestorCount: DealCommitmentsTableInvestorCount,
  Model: DealCommitmentsTableModel,
  NextPageButton: DealCommitmentsTableNextPageButton,
  PageSizeSelect: DealCommitmentsTablePageSizeSelect,
  PreviousPageButton: DealCommitmentsTablePreviousPageButton,
  Range: DealCommitmentsTableRange,
  Root: DealCommitmentsTableRoot,
  RowActionButton: DealCommitmentsTableRowActionButton,
  Search: DealCommitmentsTableSearch,
  SelectedCount: DealCommitmentsTableSelectedCount,
  Table: DealCommitmentsTableTable,
  ToolbarActions: DealCommitmentsTableToolbarActions,
  ToolbarButton: DealCommitmentsTableToolbarButton,
  ToolbarControls: DealCommitmentsTableToolbarControls,
  ToolbarHeading: DealCommitmentsTableToolbarHeading,
  ToolbarPrimaryRow: DealCommitmentsTableToolbarPrimaryRow,
  ToolbarRoot: DealCommitmentsTableToolbarRoot,
  Toolbar: DealCommitmentsTableToolbar,
  TotalCommitted: DealCommitmentsTableTotalCommitted,
})

const isExportEnabled = (
  props: DealCommitmentsTableContentProps,
): props is DealCommitmentsTableExportContentProps =>
  props.onExportSelected !== undefined && props.onExportVisible !== undefined
