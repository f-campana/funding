'use client'

import { DealCommitmentInspector } from '@repo/kit/deal-commitment-inspector'
import {
  DealCommitmentsTable,
  type DealCommitmentsTableLabels,
  type DealCommitmentsTableLifecycleState,
} from '@repo/kit/deal-commitments-table'
import { Button } from '@repo/ui/components/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet'
import { useMemo, useState } from 'react'

import { createRouteInteractionTelemetryEvent } from '@/observability/telemetry-events'
import { emitTelemetryEvent } from '@/observability/telemetry-transport'
import type { DealCommitmentInspectorViewModel } from '../deal-commitment-inspector-adapter'
import type { DealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'

type CommitmentsWorkspaceProps = {
  readonly inspector: DealCommitmentInspectorViewModel
  readonly table: DealCommitmentsTableViewModel
}

const closedInspectorRowId = '__commitment_inspector_closed__'
const commitmentsRoutePattern = '/deals/[dealId]/commitments'
const inspectorTelemetryMetadata = {
  routeKind: 'commitments',
  surface: 'commitment_inspector',
} as const

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
    readyForClosing: 'Ready for closing review',
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
  const inspectorProps = drawerOpenRowId ? inspector.propsByInvestorId[drawerOpenRowId] : undefined
  const inspectorOpen = inspectorProps !== undefined
  const controlledTableState = useMemo(
    () => getControlledTableState(table.state, activeRowId, drawerOpenRowId, selectedRowIds),
    [activeRowId, drawerOpenRowId, selectedRowIds, table.state],
  )

  const openInspector = (rowId: string) => {
    setActiveRowId(rowId)
    setDrawerOpenRowId(rowId)
    emitTelemetryEvent(
      createRouteInteractionTelemetryEvent({
        metadata: inspectorTelemetryMetadata,
        name: 'commitment_inspector_opened',
        route: commitmentsRoutePattern,
      }),
    )
  }

  const handleInspectorOpenChange = (open: boolean) => {
    if (open) {
      return
    }

    if (drawerOpenRowId) {
      emitTelemetryEvent(
        createRouteInteractionTelemetryEvent({
          metadata: inspectorTelemetryMetadata,
          name: 'commitment_inspector_closed',
          route: commitmentsRoutePattern,
        }),
      )
    }

    setDrawerOpenRowId(undefined)
    setActiveRowId(undefined)
  }

  return (
    <section
      aria-label="Commitments workspace"
      className="min-w-0"
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

      <Sheet onOpenChange={handleInspectorOpenChange} open={inspectorOpen}>
        <SheetContent
          className="w-full max-w-[min(100vw,38rem)] gap-0 p-0 sm:max-w-xl"
          showCloseButton={false}
          side="right"
        >
          <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
            <SheetHeader className="pr-20">
              <SheetTitle>Commitment details</SheetTitle>
              <SheetDescription>
                Inspect investor readiness, blockers, evidence, and activity.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button
                aria-label="Close commitment inspector"
                className="absolute top-4 right-4 h-8 px-3 text-xs"
                type="button"
                variant="outline"
              >
                Close
              </Button>
            </SheetClose>
          </div>

          <div className="min-w-0 p-4 sm:p-5">
            {inspectorProps ? (
              <DealCommitmentInspector {...inspectorProps} className="max-w-none" />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
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
