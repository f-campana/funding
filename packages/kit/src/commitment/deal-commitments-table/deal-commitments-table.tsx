'use client'

import { cn, TooltipProvider } from '@repo/ui'

import { DealCommitmentsTableContent } from './deal-commitments-table.content'
import type {
  DealCommitmentsTableProps,
  DealCommitmentsTableRootProps,
} from './deal-commitments-table.types'
import { DealCommitmentsTableDetail } from './deal-commitments-table-detail'
import {
  DealCommitmentsTableFooter,
  DealCommitmentsTableFooterControls,
  DealCommitmentsTableFooterMetric,
  DealCommitmentsTableFooterMetrics,
  DealCommitmentsTableFooterRoot,
  DealCommitmentsTableInvestorCount,
  DealCommitmentsTableNextPageButton,
  DealCommitmentsTablePageSizeSelect,
  DealCommitmentsTablePreviousPageButton,
  DealCommitmentsTableRange,
  DealCommitmentsTableTotalCommitted,
} from './deal-commitments-table-footer'
import {
  DealCommitmentsTableBody,
  DealCommitmentsTableColumnGroup,
  DealCommitmentsTableGrid,
  DealCommitmentsTableGridRoot,
  DealCommitmentsTableHeader,
  DealCommitmentsTableModel,
  DealCommitmentsTableTable,
} from './deal-commitments-table-grid'
import { CommitmentRowActionButton as DealCommitmentsTableRowActionButton } from './deal-commitments-table-row'
import {
  DealCommitmentsTableExportButton,
  DealCommitmentsTableFilters,
  DealCommitmentsTableSearch,
  DealCommitmentsTableSelectedCount,
  DealCommitmentsTableToolbar,
  DealCommitmentsTableToolbarActions,
  DealCommitmentsTableToolbarButton,
  DealCommitmentsTableToolbarControls,
  DealCommitmentsTableToolbarHeading,
  DealCommitmentsTableToolbarPrimaryRow,
  DealCommitmentsTableToolbarRoot,
} from './deal-commitments-table-toolbar'

export { DealCommitmentsTableContent } from './deal-commitments-table.content'
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
export { DealCommitmentsTableDetail } from './deal-commitments-table-detail'
export {
  DealCommitmentsTableFooter,
  DealCommitmentsTableFooterControls,
  DealCommitmentsTableFooterMetric,
  DealCommitmentsTableFooterMetrics,
  DealCommitmentsTableFooterRoot,
  DealCommitmentsTableInvestorCount,
  DealCommitmentsTableNextPageButton,
  DealCommitmentsTablePageSizeSelect,
  DealCommitmentsTablePreviousPageButton,
  DealCommitmentsTableRange,
  DealCommitmentsTableTotalCommitted,
} from './deal-commitments-table-footer'
export {
  DealCommitmentsTableBody,
  DealCommitmentsTableColumnGroup,
  DealCommitmentsTableGrid,
  DealCommitmentsTableGridRoot,
  DealCommitmentsTableHeader,
  DealCommitmentsTableModel,
  DealCommitmentsTableTable,
} from './deal-commitments-table-grid'
export { CommitmentRowActionButton as DealCommitmentsTableRowActionButton } from './deal-commitments-table-row'
export {
  DealCommitmentsTableExportButton,
  DealCommitmentsTableFilters,
  DealCommitmentsTableSearch,
  DealCommitmentsTableSelectedCount,
  DealCommitmentsTableToolbar,
  DealCommitmentsTableToolbarActions,
  DealCommitmentsTableToolbarButton,
  DealCommitmentsTableToolbarControls,
  DealCommitmentsTableToolbarHeading,
  DealCommitmentsTableToolbarPrimaryRow,
  DealCommitmentsTableToolbarRoot,
} from './deal-commitments-table-toolbar'

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
