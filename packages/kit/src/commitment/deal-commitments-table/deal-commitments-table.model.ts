import { commitmentReadinessNeedsAttention } from '../commitment-readiness.model'
import { commitmentReadinessKeys } from '../commitment-readiness.types'
import type {
  CommitmentInvestorRow,
  CommitmentRowVisualState,
  CommitmentTableBodyItem,
  CommitmentTableFilterId,
  CommitmentTableGroupValue,
  CommitmentTableModel,
  CommitmentTableRowState,
  CommitmentTableSortKey,
  CommitmentTableSortState,
  CommitmentTableViewValue,
  DealCommitmentsTableLifecycleState,
  LocalReadyControls,
  ReadyControls,
} from './deal-commitments-table.types'

export { getCommitmentReadinessTone } from '../commitment-readiness.model'

export const readinessKeys = commitmentReadinessKeys

export const visibleReadinessKeys = ['kycKyb', 'signature', 'wire'] as const

export const commitmentTableColumnCount = 8

export const defaultPageSize = 8

export const pageSizeOptions = [8, 12, 25] as const

export const filterOptions = [
  { id: 'needsAttention' },
  { id: 'pendingKycKyb' },
  { id: 'completedKycKyb' },
  { id: 'signaturePending' },
  { id: 'wirePending' },
  { id: 'readyForClosing' },
] as const satisfies readonly { readonly id: CommitmentTableFilterId }[]

const statusToneRank = {
  attention: 0,
  pending: 1,
  inProgress: 2,
  complete: 3,
} as const satisfies Record<CommitmentInvestorRow['status']['tone'], number>

export const loadingRows = (count: number) =>
  Array.from({ length: count }, (_, index) => `commitment-row-skeleton-${index}`)

export const getReadyControls = ({
  controlled,
  local,
  state,
}: {
  readonly controlled: {
    readonly activeFilterIds: boolean
    readonly page: boolean
    readonly pageSize: boolean
    readonly rowState: boolean
    readonly searchValue: boolean
    readonly selectedRowIds: boolean
  }
  readonly local: LocalReadyControls
  readonly state: DealCommitmentsTableLifecycleState
}): ReadyControls => {
  if (state.kind !== 'ready') {
    return {
      activeFilterIds: [],
      group: 'none',
      hoveredRowId: undefined,
      page: 1,
      pageSize: defaultPageSize,
      rowState: { kind: 'idle' },
      searchValue: '',
      selectedRowIds: [],
      sort: undefined,
      view: 'default',
    }
  }

  return {
    activeFilterIds: getControlValue(
      controlled.activeFilterIds,
      state.activeFilterIds,
      local.activeFilterIds,
    ),
    group: state.group ?? local.group,
    hoveredRowId: state.hoveredRowId,
    page: getControlValue(controlled.page, state.pagination?.page, local.page),
    pageSize: getControlValue(controlled.pageSize, state.pagination?.pageSize, local.pageSize),
    rowState: getControlValue(controlled.rowState, state.rowState, local.rowState),
    searchValue: getControlValue(controlled.searchValue, state.searchValue, local.searchValue),
    selectedRowIds: getControlValue(
      controlled.selectedRowIds,
      state.selectedRowIds,
      local.selectedRowIds,
    ),
    sort: state.sort ?? local.sort,
    view: state.view ?? local.view,
  }
}

const getControlValue = <Value>(
  controlled: boolean,
  controlledValue: Value | undefined,
  localValue: Value,
) => (controlled ? (controlledValue ?? localValue) : localValue)

export const getCommitmentTableModel = (
  rows: readonly CommitmentInvestorRow[],
  controls: ReadyControls,
): CommitmentTableModel => {
  const rowIndexById = new Map(rows.map((row, rowIndex) => [row.id, rowIndex] as const))
  const validRowState = getValidRowState(rows, controls.rowState)
  const searchFilteredRows = filterRowsBySearch(rows, controls.searchValue)
  const viewFilteredRows = filterRowsByView(searchFilteredRows, controls.view)
  const filteredRows = filterRowsByFilters(viewFilteredRows, controls.activeFilterIds)
  const sortedRows = sortRows(filteredRows, controls.sort)
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / controls.pageSize))
  const page = clamp(controls.page, 1, pageCount)
  const visibleRows = paginateRows(sortedRows, page, controls.pageSize)
  const selectedRowIdSet = new Set(controls.selectedRowIds)
  const selectableVisibleRowIds = visibleRows.filter((row) => !row.disabled).map((row) => row.id)
  const selectedVisibleRowIds = selectableVisibleRowIds.filter((rowId) =>
    selectedRowIdSet.has(rowId),
  )

  return {
    activeRowId: validRowState.kind === 'active' ? validRowState.rowId : undefined,
    drawerOpenRowId:
      validRowState.kind === 'active' && validRowState.drawerOpen ? validRowState.rowId : undefined,
    filteredRows: sortedRows,
    groupedItems: getGroupedItems(visibleRows, controls.group, rowIndexById),
    hasSourceRows: rows.length > 0,
    headerCheckboxState: getHeaderCheckboxState(
      selectableVisibleRowIds.length,
      selectedVisibleRowIds.length,
    ),
    hoveredRowId: controls.hoveredRowId,
    page,
    pageCount,
    pageSize: controls.pageSize,
    selectableVisibleRowIds,
    selectedVisibleRowIds,
    totalRows: sortedRows.length,
    visibleExportRowIds: selectableVisibleRowIds,
    visibleRows,
  }
}

export const getValidRowState = (
  rows: readonly CommitmentInvestorRow[],
  rowState: CommitmentTableRowState,
): CommitmentTableRowState => {
  if (rowState.kind === 'idle') {
    return rowState
  }

  const rowId = getValidOpenRowId(rows, rowState.rowId)

  return rowId ? { ...rowState, rowId } : { kind: 'idle' }
}

export const getValidOpenRowId = (
  rows: readonly CommitmentInvestorRow[],
  rowId: string | undefined,
): string | undefined => {
  if (!rowId) {
    return undefined
  }

  const row = rows.find((candidate) => candidate.id === rowId)

  return row && !row.disabled ? row.id : undefined
}

export const filterRowsBySearch = (
  rows: readonly CommitmentInvestorRow[],
  searchValue: string,
): readonly CommitmentInvestorRow[] => {
  const normalizedSearch = normalizeSearchValue(searchValue)

  if (!normalizedSearch) {
    return rows
  }

  return rows.filter((row) =>
    normalizeSearchValue(getRowSearchText(row)).includes(normalizedSearch),
  )
}

export const filterRowsByView = (
  rows: readonly CommitmentInvestorRow[],
  view: CommitmentTableViewValue,
): readonly CommitmentInvestorRow[] => {
  switch (view) {
    case 'default':
      return rows
    case 'attention':
      return rows.filter(rowNeedsAttention)
    case 'ready':
      return rows.filter((row) => row.status.tone === 'complete' && !row.dataIssue)
  }
}

export const filterRowsByFilters = (
  rows: readonly CommitmentInvestorRow[],
  activeFilterIds: readonly CommitmentTableFilterId[],
): readonly CommitmentInvestorRow[] => {
  if (activeFilterIds.length === 0) {
    return rows
  }

  return rows.filter((row) => activeFilterIds.some((filterId) => rowMatchesFilter(row, filterId)))
}

export const sortRows = (
  rows: readonly CommitmentInvestorRow[],
  sort: CommitmentTableSortState | undefined,
): readonly CommitmentInvestorRow[] => {
  if (!sort) {
    return rows
  }

  return [...rows].sort((first, second) => {
    const value = compareRows(first, second, sort.key)

    return sort.direction === 'asc' ? value : -value
  })
}

export const paginateRows = (
  rows: readonly CommitmentInvestorRow[],
  page: number,
  pageSize: number,
): readonly CommitmentInvestorRow[] => rows.slice((page - 1) * pageSize, page * pageSize)

export const getGroupedItems = (
  rows: readonly CommitmentInvestorRow[],
  group: CommitmentTableGroupValue,
  rowIndexById: ReadonlyMap<string, number>,
): readonly CommitmentTableBodyItem[] => {
  if (group === 'none') {
    return rows.map((row) => ({
      kind: 'row',
      row,
      rowIndex: rowIndexById.get(row.id) ?? 0,
    }))
  }

  return buildGroupedItems(rows, getGroupLabel, rowIndexById, group)
}

export const getCommitmentRowVisualState = ({
  activeRowId,
  drawerOpenRowId,
  hoveredRowId,
  row,
}: {
  readonly activeRowId: string | undefined
  readonly drawerOpenRowId: string | undefined
  readonly hoveredRowId: string | undefined
  readonly row: CommitmentInvestorRow
}): CommitmentRowVisualState => {
  if (row.disabled) {
    return { kind: 'disabled' }
  }

  if (drawerOpenRowId === row.id) {
    return { drawerOpen: true, kind: 'active' }
  }

  if (activeRowId === row.id) {
    return { drawerOpen: false, kind: 'active' }
  }

  if (hoveredRowId === row.id) {
    return { kind: 'hovered' }
  }

  if (row.attention) {
    return { kind: 'attention' }
  }

  return { kind: 'default' }
}

export const getHeaderCheckboxState = (
  selectableVisibleCount: number,
  selectedVisibleCount: number,
): boolean | 'indeterminate' => {
  if (selectableVisibleCount === 0 || selectedVisibleCount === 0) {
    return false
  }

  return selectedVisibleCount === selectableVisibleCount ? true : 'indeterminate'
}

export const compareRows = (
  first: CommitmentInvestorRow,
  second: CommitmentInvestorRow,
  key: CommitmentTableSortKey,
) => rowComparatorBySortKey[key](first, second)

export const rowNeedsAttention = (row: CommitmentInvestorRow) =>
  row.attention === true ||
  row.dataIssue !== undefined ||
  row.status.tone === 'attention' ||
  readinessKeys.some((key) => commitmentReadinessNeedsAttention(row.readiness[key]))

export const toggleFilterId = (
  activeFilterIds: readonly CommitmentTableFilterId[],
  filterId: CommitmentTableFilterId,
) => {
  const selected = new Set(activeFilterIds)

  if (selected.has(filterId)) {
    selected.delete(filterId)
  } else {
    selected.add(filterId)
  }

  return [...selected]
}

const getRowSearchText = (row: CommitmentInvestorRow) =>
  [
    row.investorName,
    row.entityName,
    row.investorMeta,
    row.commitmentLabel,
    row.status.label,
    row.dataIssue?.label,
    ...readinessKeys.flatMap((key) => [row.readiness[key].value, row.readiness[key].detail]),
  ]
    .filter(Boolean)
    .join(' ')

const normalizeSearchValue = (value: string) => value.trim().toLocaleLowerCase()

const rowFilterPredicateById = {
  completedKycKyb: (row) => row.readiness.kycKyb.variant === 'verified',
  needsAttention: rowNeedsAttention,
  pendingKycKyb: (row) => row.readiness.kycKyb.variant !== 'verified',
  readyForClosing: (row) =>
    row.readiness.kycKyb.variant === 'verified' &&
    row.readiness.signature.variant === 'signed' &&
    row.readiness.wire.variant === 'received' &&
    row.readiness.reconciliation.variant === 'reconciled' &&
    !row.dataIssue &&
    !row.disabled,
  signaturePending: (row) => row.readiness.signature.variant === 'pending',
  wirePending: (row) =>
    row.readiness.wire.variant === 'pending' || row.readiness.wire.variant === 'notReceived',
} as const satisfies Record<CommitmentTableFilterId, (row: CommitmentInvestorRow) => boolean>

const rowMatchesFilter = (row: CommitmentInvestorRow, filterId: CommitmentTableFilterId) =>
  rowFilterPredicateById[filterId](row)

const compareText = (first: string, second: string) =>
  first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' })

const compareNumber = (first: number, second: number) => first - second

const compareStatus = (first: CommitmentInvestorRow, second: CommitmentInvestorRow) =>
  compareText(getStatusSortValue(first), getStatusSortValue(second))

const rowComparatorBySortKey = {
  commitment: (first, second) =>
    compareNumber(first.commitmentSortValue, second.commitmentSortValue),
  entity: (first, second) => compareText(first.entityName, second.entityName),
  investor: (first, second) => compareText(first.investorName, second.investorName),
  status: compareStatus,
} as const satisfies Record<
  CommitmentTableSortKey,
  (first: CommitmentInvestorRow, second: CommitmentInvestorRow) => number
>

const getStatusSortValue = (row: CommitmentInvestorRow) =>
  String(row.status.sortValue ?? statusToneRank[row.status.tone])

const buildGroupedItems = (
  rows: readonly CommitmentInvestorRow[],
  labelForRow: (row: CommitmentInvestorRow, group: CommitmentTableGroupValue) => string,
  rowIndexById: ReadonlyMap<string, number>,
  group: CommitmentTableGroupValue,
): readonly CommitmentTableBodyItem[] => {
  const groupOrder: string[] = []
  const rowsByGroup = new Map<string, CommitmentInvestorRow[]>()

  for (const row of rows) {
    const label = labelForRow(row, group)
    const groupRows = rowsByGroup.get(label)

    if (groupRows) {
      groupRows.push(row)
    } else {
      groupOrder.push(label)
      rowsByGroup.set(label, [row])
    }
  }

  return groupOrder.flatMap((label) => {
    const groupRows = rowsByGroup.get(label) ?? []

    return [
      {
        count: groupRows.length,
        id: label,
        kind: 'group' as const,
        label,
      },
      ...groupRows.map((row) => ({
        kind: 'row' as const,
        row,
        rowIndex: rowIndexById.get(row.id) ?? 0,
      })),
    ]
  })
}

const getGroupLabel = (row: CommitmentInvestorRow, group: CommitmentTableGroupValue): string => {
  switch (group) {
    case 'status':
      return row.status.label
    case 'readinessIssue':
      return rowNeedsAttention(row) ? 'Needs review' : 'Ready'
    case 'none':
      return 'None'
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
