import type { ComponentProps } from 'react'

import { StorySection, StoryStack } from '../../stories/story-layout'
import {
  DealCommitmentsTable,
  type DealCommitmentsTableLifecycleState,
} from './deal-commitments-table'
import {
  dataIssueCommitmentRows,
  dealCommitmentsTableExportToolbarLabels,
  dealCommitmentsTableLabels,
  disabledCommitmentRows,
  emptyDealCommitmentsTableLabels,
  errorDealCommitmentsTableLabels,
  lockedCommitmentRows,
  longTextCommitmentRows,
} from './deal-commitments-table-fixtures'

const meta = {
  component: DealCommitmentsTable,
  title: 'Kit/Commitment/DealCommitmentsTable',
}

export default meta

type DealCommitmentsTableLabels = Pick<
  ComponentProps<typeof DealCommitmentsTable>,
  'footer' | 'labels' | 'subtitle' | 'title' | 'toolbar'
>
type ReadyCommitmentsTableState = Extract<
  DealCommitmentsTableLifecycleState,
  { readonly kind: 'ready' }
>

const readyTableState = (
  state: Partial<Omit<ReadyCommitmentsTableState, 'kind'>> = {},
): ReadyCommitmentsTableState => ({
  kind: 'ready',
  rows: lockedCommitmentRows,
  ...state,
})

const renderTable = (
  props: Partial<ComponentProps<typeof DealCommitmentsTable>> = {},
  className = 'w-[min(96vw,1550px)]',
  labels: DealCommitmentsTableLabels = dealCommitmentsTableLabels,
) => (
  <StorySection
    className={className}
    description="Desktop commitments workflow table with KYC/KYB, signature, and wire readiness."
    title="Deal commitments"
  >
    <DealCommitmentsTable
      {...({
        footer: labels.footer,
        labels: labels.labels,
        state: readyTableState(),
        subtitle: labels.subtitle,
        title: labels.title,
        toolbar:
          props.onExportSelected && props.onExportVisible
            ? {
                ...labels.toolbar,
                ...dealCommitmentsTableExportToolbarLabels,
              }
            : labels.toolbar,
        ...props,
      } as ComponentProps<typeof DealCommitmentsTable>)}
    />
  </StorySection>
)

const renderDarkTable = (
  props: Partial<ComponentProps<typeof DealCommitmentsTable>> = {},
  className = 'w-full max-w-[1550px]',
  labels: DealCommitmentsTableLabels = dealCommitmentsTableLabels,
) => (
  <div className="dark bg-background p-6" data-theme="dark">
    {renderTable(props, className, labels)}
  </div>
)

const noopPageChange = (_page: number) => undefined
const noopPageSizeChange = (_pageSize: number) => undefined
const noopSearchValueChange = (_value: string) => undefined
const noopSelectedRowIdsChange = (_rowIds: readonly string[]) => undefined

const renderRowStateTable = (
  title: string,
  props: Partial<ComponentProps<typeof DealCommitmentsTable>> = {},
) => (
  <StorySection title={title}>
    <DealCommitmentsTable
      {...({
        footer: dealCommitmentsTableLabels.footer,
        labels: dealCommitmentsTableLabels.labels,
        state: readyTableState({
          pagination: { page: 1, pageSize: 3 },
          rows: lockedCommitmentRows.slice(0, 3),
        }),
        onPageChange: noopPageChange,
        onPageSizeChange: noopPageSizeChange,
        subtitle: dealCommitmentsTableLabels.subtitle,
        title: dealCommitmentsTableLabels.title,
        toolbar: dealCommitmentsTableLabels.toolbar,
        ...props,
      } as ComponentProps<typeof DealCommitmentsTable>)}
    />
  </StorySection>
)

export const Default = {
  render: () => renderTable(),
}

export const ActiveDrawerClosed = {
  render: () => renderTable({ state: readyTableState({ activeRowId: 'pine-point-capital' }) }),
}

export const ActiveDrawerOpen = {
  render: () =>
    renderTable({
      state: readyTableState({
        drawerOpenRowId: 'pine-point-capital',
      }),
    }),
}

export const AttentionNotSelected = {
  render: () => renderTable(),
}

export const Loading = {
  render: () => renderTable({ state: { kind: 'loading', rowCount: 8 } }),
}

export const EmptyNoData = {
  render: () =>
    renderTable(
      {
        state: {
          description: 'Invited investors and submitted commitments will appear here.',
          kind: 'empty',
          title: 'No commitments yet',
          variant: 'no-data',
        },
      },
      'w-[min(96vw,1550px)]',
      emptyDealCommitmentsTableLabels,
    ),
}

export const EmptyFiltered = {
  render: () =>
    renderTable({
      onSearchValueChange: noopSearchValueChange,
      state: readyTableState({
        searchValue: 'no matching investor',
      }),
    }),
}

export const TableError = {
  name: 'Error',
  render: () =>
    renderTable(
      {
        state: {
          description: 'Refresh the page or try again.',
          kind: 'error',
          retry: {
            label: 'Retry',
            onRetry: () => undefined,
          },
          title: 'Commitments could not be loaded',
        },
      },
      'w-[min(96vw,1550px)]',
      errorDealCommitmentsTableLabels,
    ),
}

export const RowDataIssue = {
  render: () => renderTable({ state: readyTableState({ rows: dataIssueCommitmentRows }) }),
}

export const BatchSelection = {
  render: () =>
    renderTable({
      onSelectedRowIdsChange: noopSelectedRowIdsChange,
      state: readyTableState({
        selectedRowIds: ['pine-point-capital', 'atlas-secure-fund'],
      }),
    }),
}

export const FullWidth = {
  render: () => renderTable({}, 'w-[min(96vw,1550px)]'),
}

export const MacBookPro14Workspace = {
  render: () => renderTable({}, 'w-[1180px] max-w-full'),
}

export const MacBookPro14WithRail = {
  render: () => renderTable({}, 'w-[900px] max-w-full'),
}

export const NarrowContainer = {
  render: () => renderTable({}, 'w-[760px] max-w-full'),
}

export const RowStates = {
  render: () => (
    <StoryStack>
      {renderRowStateTable('Default complete')}
      {renderRowStateTable('Hover', {
        state: readyTableState({ hoveredRowId: 'tailwind-partners' }),
      })}
      {renderRowStateTable('Attention not selected')}
      {renderRowStateTable('Active drawer closed', {
        state: readyTableState({ activeRowId: 'pine-point-capital' }),
      })}
      {renderRowStateTable('Active drawer open', {
        state: readyTableState({ drawerOpenRowId: 'pine-point-capital' }),
      })}
      {renderRowStateTable('Loading', { state: { kind: 'loading', rowCount: 3 } })}
    </StoryStack>
  ),
}

export const DarkDefault = {
  render: () => renderDarkTable(),
}

export const DarkDrawerOpen = {
  render: () =>
    renderDarkTable({
      state: readyTableState({
        drawerOpenRowId: 'pine-point-capital',
      }),
    }),
}

export const DarkBatchSelected = {
  render: () =>
    renderDarkTable({
      onSelectedRowIdsChange: noopSelectedRowIdsChange,
      state: readyTableState({
        selectedRowIds: ['pine-point-capital', 'atlas-secure-fund'],
      }),
    }),
}

export const DarkError = {
  render: () =>
    renderDarkTable(
      {
        state: {
          description: 'Refresh the page or try again.',
          kind: 'error',
          title: 'Commitments could not be loaded',
        },
      },
      'w-[min(96vw,1550px)]',
      errorDealCommitmentsTableLabels,
    ),
}

export const LongText = {
  render: () => renderTable({ state: readyTableState({ rows: longTextCommitmentRows }) }),
}

export const DisabledRows = {
  render: () => renderTable({ state: readyTableState({ rows: disabledCommitmentRows }) }),
}
