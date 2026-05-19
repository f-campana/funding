'use client'

import {
  DealCommitmentInspectorActivity,
  DealCommitmentInspectorActivityItem,
  DealCommitmentInspectorBlocker,
  DealCommitmentInspectorBlockers,
  DealCommitmentInspectorDocument,
  DealCommitmentInspectorDocuments,
  DealCommitmentInspectorEmpty,
  DealCommitmentInspectorError,
  DealCommitmentInspectorHeader,
  DealCommitmentInspectorLoading,
  DealCommitmentInspectorNextAction,
  type DealCommitmentInspectorProps,
  DealCommitmentInspectorReadiness,
  DealCommitmentInspectorRoot,
} from '@repo/kit/deal-commitment-inspector'
import {
  DealCommitmentsTableBody,
  DealCommitmentsTableColumnGroup,
  DealCommitmentsTableContent,
  DealCommitmentsTableDetail,
  DealCommitmentsTableExportButton,
  DealCommitmentsTableFilters,
  DealCommitmentsTableFooterControls,
  DealCommitmentsTableFooterMetrics,
  DealCommitmentsTableFooterRoot,
  DealCommitmentsTableGridRoot,
  DealCommitmentsTableHeader,
  DealCommitmentsTableInvestorCount,
  type DealCommitmentsTableLabels,
  DealCommitmentsTableNextPageButton,
  DealCommitmentsTablePageSizeSelect,
  DealCommitmentsTablePreviousPageButton,
  DealCommitmentsTableRange,
  DealCommitmentsTableRoot,
  DealCommitmentsTableRowActionButton,
  DealCommitmentsTableSearch,
  DealCommitmentsTableSelectedCount,
  DealCommitmentsTableTable,
  DealCommitmentsTableToolbarActions,
  DealCommitmentsTableToolbarControls,
  DealCommitmentsTableToolbarHeading,
  DealCommitmentsTableToolbarPrimaryRow,
  DealCommitmentsTableToolbarRoot,
  DealCommitmentsTableTotalCommitted,
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
import type { ReactNode } from 'react'

import { createRouteInteractionTelemetryEvent } from '@/observability/telemetry-events'
import { emitTelemetryEvent } from '@/observability/telemetry-transport'
import type { DealCommitmentInspectorViewModel } from '../deal-commitment-inspector-adapter'
import type { DealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'

type CommitmentsWorkspaceProps = {
  readonly inspector: DealCommitmentInspectorViewModel
  readonly table: DealCommitmentsTableViewModel
}

const commitmentsRoutePattern = '/deals/[dealId]/commitments'
const commitmentInspectorTitleId = 'deal-commitment-inspector-title'
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
  const openInspector = () => {
    emitTelemetryEvent(
      createRouteInteractionTelemetryEvent({
        metadata: inspectorTelemetryMetadata,
        name: 'commitment_inspector_opened',
        route: commitmentsRoutePattern,
      }),
    )
  }

  return (
    <section
      aria-label="Commitments workspace"
      className="min-w-0"
      data-slot="deal-commitments-workspace"
    >
      <DealCommitmentsTableRoot className="min-w-0" state={table.state}>
        <DealCommitmentsTableContent
          {...table}
          labels={commitmentsTableLabels}
          onRowOpen={openInspector}
          renderRowAction={(action) => <DealCommitmentsTableRowActionButton {...action} />}
        >
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
          <DealCommitmentsTableGridRoot>
            <DealCommitmentsTableTable>
              <DealCommitmentsTableColumnGroup />
              <DealCommitmentsTableHeader />
              <DealCommitmentsTableBody />
            </DealCommitmentsTableTable>
          </DealCommitmentsTableGridRoot>
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
          <DealCommitmentsTableDetail>
            {({ onOpenChange, open, rowId }) => {
              const inspectorProps = rowId ? inspector.propsByInvestorId[rowId] : undefined
              const inspectorOpen = open && inspectorProps !== undefined
              const handleInspectorOpenChange = (nextOpen: boolean) => {
                if (!nextOpen && open) {
                  emitTelemetryEvent(
                    createRouteInteractionTelemetryEvent({
                      metadata: inspectorTelemetryMetadata,
                      name: 'commitment_inspector_closed',
                      route: commitmentsRoutePattern,
                    }),
                  )
                }

                onOpenChange(nextOpen)
              }

              return (
                <Sheet onOpenChange={handleInspectorOpenChange} open={inspectorOpen}>
                  <SheetContent
                    className="w-full max-w-[min(100vw,38rem)] gap-0 p-0 sm:max-w-xl"
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
                        <DealCommitmentInspectorRoot
                          aria-label={inspectorProps.labels.title}
                          className="max-w-none"
                          state={inspectorProps.state}
                        >
                          {renderCommitmentInspectorContent(inspectorProps)}
                        </DealCommitmentInspectorRoot>
                      ) : null}
                    </div>
                  </SheetContent>
                </Sheet>
              )
            }}
          </DealCommitmentsTableDetail>
        </DealCommitmentsTableContent>
      </DealCommitmentsTableRoot>
    </section>
  )
}

const renderCommitmentInspectorContent = ({
  labels,
  onAction,
  state,
}: DealCommitmentInspectorProps): ReactNode => {
  switch (state.kind) {
    case 'loading':
      return (
        <DealCommitmentInspectorLoading
          label={state.label ?? labels.loadingLabel}
          titleId={commitmentInspectorTitleId}
        />
      )
    case 'error':
      return (
        <DealCommitmentInspectorError
          onAction={onAction}
          state={state}
          titleId={commitmentInspectorTitleId}
        />
      )
    case 'empty':
      return <DealCommitmentInspectorEmpty state={state} titleId={commitmentInspectorTitleId} />
    case 'ready':
      return (
        <>
          <DealCommitmentInspectorHeader
            investor={state.investor}
            titleId={commitmentInspectorTitleId}
          />
          <DealCommitmentInspectorNextAction labels={labels} nextAction={state.nextAction} />
          <DealCommitmentInspectorReadiness labels={labels} readiness={state.readiness} />
          <DealCommitmentInspectorBlockers
            emptyLabel={labels.noBlockersLabel}
            title={labels.blockersTitle}
          >
            {state.blockers.map((blocker) => (
              <DealCommitmentInspectorBlocker blocker={blocker} key={blocker.id} labels={labels} />
            ))}
          </DealCommitmentInspectorBlockers>
          <DealCommitmentInspectorDocuments
            emptyLabel={labels.noDocumentsLabel}
            title={labels.documentsTitle}
          >
            {state.documents.map((document) => (
              <DealCommitmentInspectorDocument
                document={document}
                key={document.id}
                labels={labels}
              />
            ))}
          </DealCommitmentInspectorDocuments>
          <DealCommitmentInspectorActivity
            emptyLabel={labels.noActivityLabel}
            title={labels.activityTitle}
          >
            {state.activity.map((item) => (
              <DealCommitmentInspectorActivityItem item={item} key={item.id} />
            ))}
          </DealCommitmentInspectorActivity>
        </>
      )
  }
}
