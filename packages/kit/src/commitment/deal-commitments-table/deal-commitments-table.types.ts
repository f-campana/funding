export type CommitmentReadinessKey = 'kycKyb' | 'signature' | 'wire' | 'reconciliation'

export type CommitmentReadinessTone = 'success' | 'danger' | 'attention' | 'info' | 'neutral'

export type CommitmentInvestorStatusTone = 'complete' | 'attention' | 'inProgress' | 'pending'

export type CommitmentInvestorAvatarTone =
  | 'navy'
  | 'blush'
  | 'blue'
  | 'purple'
  | 'teal'
  | 'ochre'
  | 'slate'
  | 'brown'

export type CommitmentRowDataIssueTone = 'danger' | 'neutral'

export type CommitmentTableSortKey = 'investor' | 'entity' | 'commitment' | 'status'

export type CommitmentTableSortDirection = 'asc' | 'desc'

export type CommitmentTableSortState = {
  readonly key: CommitmentTableSortKey
  readonly direction: CommitmentTableSortDirection
}

export type CommitmentTableFilterId =
  | 'needsAttention'
  | 'pendingKycKyb'
  | 'completedKycKyb'
  | 'signaturePending'
  | 'wirePending'
  | 'readyForClosing'

export type CommitmentTableViewValue = 'default' | 'attention' | 'ready'

export type CommitmentTableGroupValue = 'none' | 'status' | 'readinessIssue'

export type CommitmentTablePaginationState = {
  readonly page: number
  readonly pageSize: number
  readonly totalRows?: number | undefined
}

/**
 * Readiness objects stay self-describing for fixtures and future app adapters. The enclosing
 * Record still provides the structural guarantee that every readiness key is present.
 */
export type CommitmentReadinessState = {
  readonly key: CommitmentReadinessKey
  readonly label: string
  readonly value: string
  readonly detail?: string | undefined
  readonly tone: CommitmentReadinessTone
}

export type CommitmentInvestorRow = {
  readonly id: string
  readonly investorName: string
  readonly investorInitials: string
  readonly investorMeta: string
  readonly avatarTone?: CommitmentInvestorAvatarTone
  readonly entityName: string
  readonly commitmentLabel: string
  readonly commitmentSortValue: number
  readonly readiness: Record<CommitmentReadinessKey, CommitmentReadinessState>
  readonly status: {
    readonly label: string
    readonly tone: CommitmentInvestorStatusTone
    readonly sortValue?: number | string | undefined
  }
  readonly dataIssue?: {
    readonly label: string
    readonly tone?: CommitmentRowDataIssueTone
  }
  readonly attention?: boolean
  readonly disabled?: boolean
}

export type DealCommitmentsTableLifecycleState =
  | {
      readonly kind: 'loading'
      readonly rowCount?: number | undefined
    }
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryLabel?: string | undefined
      readonly onRetry?: (() => void) | undefined
    }
  | {
      readonly kind: 'empty'
      readonly title: string
      readonly description?: string | undefined
      readonly variant?: 'no-data' | 'no-results' | undefined
    }
  | {
      readonly kind: 'ready'
      readonly rows: readonly CommitmentInvestorRow[]
      readonly activeRowId?: string | undefined
      readonly drawerOpenRowId?: string | undefined
      readonly hoveredRowId?: string | undefined
      readonly selectedRowIds?: readonly string[] | undefined
      readonly searchValue?: string | undefined
      readonly activeFilterIds?: readonly CommitmentTableFilterId[] | undefined
      /**
       * Non-default controlled hooks retained for integration flexibility. The T3E baseline
       * table does not expose visible sort, group, or view controls.
       */
      readonly sort?: CommitmentTableSortState | undefined
      readonly group?: CommitmentTableGroupValue | undefined
      readonly view?: CommitmentTableViewValue | undefined
      readonly pagination?: CommitmentTablePaginationState | undefined
    }

export type DealCommitmentsTableProps = {
  readonly title: string
  readonly subtitle: string
  readonly labels: DealCommitmentsTableLabels
  readonly toolbar: {
    readonly searchPlaceholder: string
    readonly workflowFiltersLabel: string
    readonly exportLabel: string
    readonly exportSelectedLabel: string
    readonly exportVisibleLabel: string
    readonly selectedLabel: string
  }
  readonly footer: {
    readonly investorsLabel: string
    /**
     * Display-ready summary label. Callers should make the visible/overall scope explicit because
     * kit does not format or aggregate money.
     */
    readonly totalCommittedLabel: string
    readonly rowsPerPageLabel: string
    readonly rangeLabel: string
  }
  readonly state: DealCommitmentsTableLifecycleState
  readonly onRowOpen?: (rowId: string) => void
  readonly onSelectedRowIdsChange?: (rowIds: readonly string[]) => void
  readonly onSearchValueChange?: (value: string) => void
  readonly onActiveFilterIdsChange?: (ids: readonly CommitmentTableFilterId[]) => void
  readonly onPageChange?: (page: number) => void
  readonly onPageSizeChange?: (pageSize: number) => void
  readonly onExportSelected?: (rowIds: readonly string[]) => void
  readonly onExportVisible?: (rowIds: readonly string[]) => void
  readonly className?: string
}

export type DealCommitmentsTableLabels = {
  readonly columns: {
    readonly investor: string
    readonly commitment: string
    readonly readiness: string
    readonly kycKyb: string
    readonly signature: string
    readonly wire: string
    readonly status: string
    readonly actions: string
  }
  readonly empty: {
    readonly noDataTitle: string
    readonly noDataDescription: string
    readonly noResultsTitle: string
    readonly noResultsDescription: string
  }
  readonly filters: Record<CommitmentTableFilterId, string>
  readonly footer: {
    readonly emptyTotalCommittedLabel: string
    readonly investorsLabel: (count: number) => string
    readonly nextPageLabel: string
    readonly previousPageLabel: string
    readonly rangeLabel: (start: number, end: number, total: number) => string
    readonly rowsPerPageLabel: (pageSize: number) => string
    readonly rowsPerPageOptionLabel: (pageSize: number) => string
  }
  readonly row: {
    readonly groupSummaryLabel: (label: string, count: number) => string
    readonly openDetailsLabel: (row: CommitmentInvestorRow) => string
    readonly selectRowLabel: (row: CommitmentInvestorRow) => string
  }
  readonly selection: {
    readonly selectAllVisibleLabel: string
  }
}

export type ReadyControls = {
  readonly activeFilterIds: readonly CommitmentTableFilterId[]
  readonly activeRowId: string | undefined
  readonly drawerOpenRowId: string | undefined
  readonly group: CommitmentTableGroupValue
  readonly hoveredRowId: string | undefined
  readonly page: number
  readonly pageSize: number
  readonly searchValue: string
  readonly selectedRowIds: readonly string[]
  readonly sort: CommitmentTableSortState | undefined
  readonly view: CommitmentTableViewValue
}

export type LocalReadyControls = {
  readonly activeFilterIds: readonly CommitmentTableFilterId[]
  readonly activeRowId: string | undefined
  readonly drawerOpenRowId: string | undefined
  readonly group: CommitmentTableGroupValue
  readonly page: number
  readonly pageSize: number
  readonly searchValue: string
  readonly selectedRowIds: readonly string[]
  readonly sort: CommitmentTableSortState | undefined
  readonly view: CommitmentTableViewValue
}

export type CommitmentTableBodyItem =
  | {
      readonly kind: 'group'
      readonly id: string
      readonly label: string
      readonly count: number
    }
  | {
      readonly kind: 'row'
      readonly row: CommitmentInvestorRow
      readonly rowIndex: number
    }

export type CommitmentTableModel = {
  readonly activeRowId: string | undefined
  readonly drawerOpenRowId: string | undefined
  readonly filteredRows: readonly CommitmentInvestorRow[]
  readonly groupedItems: readonly CommitmentTableBodyItem[]
  readonly hasSourceRows: boolean
  readonly headerCheckboxState: boolean | 'indeterminate'
  readonly hoveredRowId: string | undefined
  readonly page: number
  readonly pageCount: number
  readonly pageSize: number
  readonly selectableVisibleRowIds: readonly string[]
  readonly selectedVisibleRowIds: readonly string[]
  readonly totalRows: number
  readonly visibleExportRowIds: readonly string[]
  readonly visibleRows: readonly CommitmentInvestorRow[]
}

export type CommitmentRowVisualState =
  | { readonly kind: 'default' }
  | { readonly kind: 'hovered' }
  | { readonly kind: 'attention' }
  | { readonly kind: 'active'; readonly drawerOpen: false }
  | { readonly kind: 'active'; readonly drawerOpen: true }
  | { readonly kind: 'disabled' }
