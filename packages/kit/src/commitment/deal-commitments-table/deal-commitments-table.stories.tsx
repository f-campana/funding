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

const assertStory: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) {
    throw new globalThis.Error(message)
  }
}

const waitForStoryUpdate = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

const getStoryRow = (root: ParentNode, label: string): HTMLTableRowElement => {
  const row = Array.from(root.querySelectorAll('tr')).find((candidate) =>
    candidate.textContent?.includes(label),
  )

  assertStory(row instanceof HTMLTableRowElement, `Expected ${label} row to render.`)

  return row
}

const getStoryCheckbox = (root: ParentNode, investorName: string): HTMLElement => {
  const checkbox = root.querySelector(`[role="checkbox"][aria-label="Select ${investorName}"]`)

  assertStory(checkbox instanceof HTMLElement, `Expected ${investorName} checkbox to render.`)

  return checkbox
}

const getButton = (root: ParentNode, label: string): HTMLButtonElement => {
  const button = Array.from(root.querySelectorAll('button')).find(
    (candidate) =>
      candidate.textContent === label || candidate.getAttribute('aria-label') === label,
  )

  assertStory(button instanceof HTMLButtonElement, `Expected "${label}" button to render.`)

  return button
}

const setInputValue = async (input: HTMLInputElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await waitForStoryUpdate()
}

const markStoryAction = (key: string, value: string) => {
  document.body.dataset[key] = value
}

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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(canvasElement.textContent?.includes('Commitments'), 'Expected table title.')
    assertStory(canvasElement.textContent?.includes('Readiness'), 'Expected Readiness group.')

    const pinePointRow = getStoryRow(canvasElement, 'Pine Point Capital')

    assertStory(pinePointRow.getAttribute('data-active') === 'false', 'Pine Point is not active.')
    assertStory(
      getStoryCheckbox(canvasElement, 'Pine Point Capital').getAttribute('aria-checked') ===
        'false',
      'Pine Point is not batch selected.',
    )
  },
}

export const ActiveDrawerClosed = {
  render: () => renderTable({ state: readyTableState({ activeRowId: 'pine-point-capital' }) }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const pinePointRow = getStoryRow(canvasElement, 'Pine Point Capital')

    assertStory(pinePointRow.getAttribute('data-active') === 'true', 'Pine Point is active.')
    assertStory(
      getStoryCheckbox(canvasElement, 'Pine Point Capital').getAttribute('aria-checked') ===
        'false',
      'Batch checkbox remains separate from active object state.',
    )
    assertStory(
      canvasElement.querySelector('[data-slot="commitment-drawer-connector"]') === null,
      'Drawer connector is absent while closed.',
    )
  },
}

export const ActiveDrawerOpen = {
  render: () =>
    renderTable({
      state: readyTableState({
        drawerOpenRowId: 'pine-point-capital',
      }),
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const pinePointRow = getStoryRow(canvasElement, 'Pine Point Capital')

    assertStory(pinePointRow.getAttribute('data-active') === 'true', 'Drawer row is active.')
    assertStory(
      canvasElement.querySelector('[data-slot="commitment-drawer-connector"]'),
      'Drawer connector is present while open.',
    )
  },
}

export const AttentionNotSelected = {
  render: () => renderTable(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const pinePointRow = getStoryRow(canvasElement, 'Pine Point Capital')

    assertStory(pinePointRow.getAttribute('data-attention') === 'true', 'Attention flag renders.')
    assertStory(pinePointRow.getAttribute('data-active') === 'false', 'Attention is not active.')
    assertStory(
      pinePointRow.getAttribute('data-batch-selected') === 'false',
      'Attention is not batch selected.',
    )
  },
}

export const Loading = {
  render: () => renderTable({ state: { kind: 'loading', rowCount: 8 } }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(
      canvasElement.querySelectorAll('[data-slot="commitment-row-skeleton"]').length > 0,
      'Skeleton rows render.',
    )
    assertStory(
      !canvasElement.textContent?.includes('Pine Point Capital'),
      'Real investor rows are hidden while loading.',
    )
  },
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(
      canvasElement.textContent?.includes('No commitments match your search or filters'),
      'Filtered empty copy renders.',
    )
    assertStory(
      !canvasElement.textContent?.includes('Tailwind Partners'),
      'Filtered empty state hides rows.',
    )
  },
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
            onRetry: () => markStoryAction('dealCommitmentsRetry', 'true'),
          },
          title: 'Commitments could not be loaded',
        },
      },
      'w-[min(96vw,1550px)]',
      errorDealCommitmentsTableLabels,
    ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    delete document.body.dataset.dealCommitmentsRetry
    getButton(canvasElement, 'Retry').click()
    await waitForStoryUpdate()
    assertStory(document.body.dataset.dealCommitmentsRetry === 'true', 'Retry callback fired.')
  },
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

export const Interaction = {
  render: () => renderTable(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const checkbox = getStoryCheckbox(canvasElement, 'Pine Point Capital')
    checkbox.click()
    await waitForStoryUpdate()

    assertStory(canvasElement.textContent?.includes('1 selected'), 'Checkbox updates batch count.')
    assertStory(
      !canvasElement.querySelector('[data-slot="commitment-drawer-connector"]'),
      'Checkbox does not open the drawer.',
    )

    getButton(canvasElement, 'Open commitment detail for Pine Point Capital').click()
    await waitForStoryUpdate()

    assertStory(
      canvasElement.querySelector('[data-slot="commitment-drawer-connector"]'),
      'Row action opens the active drawer connector.',
    )
  },
}

export const SearchInteraction = {
  render: () => renderTable(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const search = canvasElement.querySelector<HTMLInputElement>(
      'input[aria-label="Search investors"]',
    )

    assertStory(search, 'Search input renders.')
    await setInputValue(search, 'Pine')

    assertStory(canvasElement.textContent?.includes('Pine Point Capital'), 'Matching row remains.')
    assertStory(
      !canvasElement.textContent?.includes('Tailwind Partners'),
      'Non-matching row hides.',
    )

    await setInputValue(search, '')

    assertStory(
      canvasElement.textContent?.includes('Tailwind Partners'),
      'Clearing search restores rows.',
    )
  },
}

export const WorkflowFilterInteraction = {
  render: () => renderTable(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    getButton(canvasElement, 'Needs attention').click()
    await waitForStoryUpdate()

    assertStory(canvasElement.textContent?.includes('Pine Point Capital'), 'Attention row remains.')
    assertStory(
      !canvasElement.textContent?.includes('Tailwind Partners'),
      'Non-matching row hides.',
    )

    const activeChip = getButton(canvasElement, 'Needs attention')

    assertStory(activeChip.getAttribute('aria-pressed') === 'true', 'Filter chip is active.')
    activeChip.click()
    await waitForStoryUpdate()

    assertStory(
      canvasElement.textContent?.includes('Tailwind Partners'),
      'Clearing filter restores rows.',
    )
  },
}

export const BatchSelectionExport = {
  render: () =>
    renderTable({
      onExportSelected: (rowIds) => markStoryAction('dealCommitmentsExport', rowIds.join(',')),
      onExportVisible: (rowIds) => markStoryAction('dealCommitmentsExport', rowIds.join(',')),
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    delete document.body.dataset.dealCommitmentsExport

    getButton(canvasElement, 'Export visible').click()
    await waitForStoryUpdate()
    const visibleExport = document.body.getAttribute('data-deal-commitments-export')

    assertStory(
      typeof visibleExport === 'string' && visibleExport.startsWith('tailwind-partners'),
      'Visible export sends current visible row IDs.',
    )

    delete document.body.dataset.dealCommitmentsExport
    getStoryCheckbox(canvasElement, 'Pine Point Capital').click()
    await waitForStoryUpdate()
    getButton(canvasElement, 'Export selected').click()
    await waitForStoryUpdate()

    assertStory(
      document.body.dataset.dealCommitmentsExport === 'pine-point-capital',
      'Selected export sends selected visible row IDs.',
    )
  },
}

export const Pagination = {
  render: () => renderTable(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    getButton(canvasElement, 'Next page').click()
    await waitForStoryUpdate()

    assertStory(canvasElement.textContent?.includes('9–12 of 12'), 'Pagination range updates.')
    assertStory(canvasElement.textContent?.includes('Harborview Endowment'), 'Next page rows show.')
  },
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
