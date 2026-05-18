'use client'

import {
  DealCommitmentInspector,
  DealCommitmentsTable,
  type DealCommitmentsTableLabels,
  type DealCommitmentsTableLifecycleState,
} from '@repo/kit'
import { Button } from '@repo/ui'
import { useMemo, useState } from 'react'

import type { DealCommitmentInspectorViewModel } from '../deal-commitment-inspector-adapter'
import type { DealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'

type CommitmentsWorkspaceProps = {
  readonly inspector: DealCommitmentInspectorViewModel
  readonly table: DealCommitmentsTableViewModel
}

const closedInspectorRowId = '__commitment_inspector_closed__'

const commitmentsTableLabels = {
  columns: {
    actions: 'Actions',
    commitment: 'Commitment',
    investor: 'Investor',
    kycKyb: 'KYC/KYB',
    readiness: 'Readiness',
    signature: 'Signature',
    status: 'Status',
    wire: 'Wire',
  },
  empty: {
    noDataDescription: 'Invited investors and submitted commitments will appear here.',
    noDataTitle: 'No commitments yet',
    noResultsDescription: 'Clear search or filters to return to all commitments.',
    noResultsTitle: 'No commitments match your search or filters',
  },
  filters: {
    completedKycKyb: 'Completed KYC/KYB',
    needsAttention: 'Needs attention',
    pendingKycKyb: 'Pending KYC/KYB',
    readyForClosing: 'Ready for closing',
    signaturePending: 'Signature pending',
    wirePending: 'Wire pending',
  },
  footer: {
    emptyTotalCommittedLabel: 'No listed commitments',
    investorsLabel: (count) => `${count} ${count === 1 ? 'investor' : 'investors'}`,
    nextPageLabel: 'Next commitments page',
    previousPageLabel: 'Previous commitments page',
    rangeLabel: (start, end, total) => `${start}-${end} of ${total}`,
    rowsPerPageLabel: (pageSize) => `${pageSize} rows per page`,
    rowsPerPageOptionLabel: (pageSize) => `${pageSize} rows`,
  },
  row: {
    groupSummaryLabel: (label, count) =>
      `${label}: ${count} ${count === 1 ? 'investor' : 'investors'}`,
    openDetailsLabel: (row) => `Open ${row.investorName} commitment`,
    selectRowLabel: (row) => `Select ${row.investorName} commitment`,
  },
  selection: {
    selectAllVisibleLabel: 'Select all visible commitments',
  },
} satisfies DealCommitmentsTableLabels

export function CommitmentsWorkspace({ inspector, table }: CommitmentsWorkspaceProps) {
  const [activeRowId, setActiveRowId] = useState<string>()
  const [drawerOpenRowId, setDrawerOpenRowId] = useState<string>()
  const [selectedRowIds, setSelectedRowIds] = useState<readonly string[]>(() =>
    table.state.kind === 'ready' ? (table.state.selectedRowIds ?? []) : [],
  )
  const inspectorOpen = drawerOpenRowId !== undefined
  const inspectorProps = drawerOpenRowId
    ? (inspector.propsByInvestorId[drawerOpenRowId] ?? inspector.emptyProps)
    : inspector.emptyProps
  const controlledTableState = useMemo(
    () => getControlledTableState(table.state, activeRowId, drawerOpenRowId, selectedRowIds),
    [activeRowId, drawerOpenRowId, selectedRowIds, table.state],
  )

  const openInspector = (rowId: string) => {
    setActiveRowId(rowId)
    setDrawerOpenRowId(rowId)
  }

  const closeInspector = () => {
    setActiveRowId(undefined)
    setDrawerOpenRowId(undefined)
  }

  return (
    <section
      aria-label="Commitments workspace"
      className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]"
      data-slot="deal-commitments-workspace"
    >
      <DealCommitmentsTable
        {...table}
        className="min-w-0"
        labels={commitmentsTableLabels}
        onRowOpen={openInspector}
        onSelectedRowIdsChange={setSelectedRowIds}
        state={controlledTableState}
      />

      <aside
        aria-label="Commitment inspector panel"
        className="grid min-w-0 content-start gap-2 xl:sticky xl:top-5"
        data-open={inspectorOpen ? 'true' : 'false'}
        data-slot="deal-commitment-inspector-panel"
      >
        {inspectorOpen ? (
          <div className="flex justify-end">
            <Button
              aria-label="Close commitment inspector"
              className="h-8 px-3 text-xs"
              onClick={closeInspector}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </div>
        ) : null}

        <DealCommitmentInspector {...inspectorProps} className="max-w-none" />
      </aside>
    </section>
  )
}

const getControlledTableState = (
  state: DealCommitmentsTableLifecycleState,
  activeRowId: string | undefined,
  drawerOpenRowId: string | undefined,
  selectedRowIds: readonly string[],
): DealCommitmentsTableLifecycleState => {
  if (state.kind !== 'ready') {
    return state
  }

  return {
    ...state,
    activeRowId: activeRowId ?? closedInspectorRowId,
    drawerOpenRowId: drawerOpenRowId ?? closedInspectorRowId,
    selectedRowIds,
  }
}
