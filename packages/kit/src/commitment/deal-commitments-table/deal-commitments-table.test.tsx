import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { axe } from '../../test/axe'
import {
  type CommitmentInvestorRow,
  type CommitmentTableFilterId,
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

const renderCommitmentsTable = (props: Partial<ComponentProps<typeof DealCommitmentsTable>> = {}) =>
  render(
    <DealCommitmentsTable
      {...({
        footer: dealCommitmentsTableLabels.footer,
        labels: dealCommitmentsTableLabels.labels,
        state: readyTableState(),
        subtitle: dealCommitmentsTableLabels.subtitle,
        title: dealCommitmentsTableLabels.title,
        toolbar:
          props.onExportSelected && props.onExportVisible
            ? {
                ...dealCommitmentsTableLabels.toolbar,
                ...dealCommitmentsTableExportToolbarLabels,
              }
            : dealCommitmentsTableLabels.toolbar,
        ...props,
      } as ComponentProps<typeof DealCommitmentsTable>)}
    />,
  )

const expectLifecycleState = (_state: DealCommitmentsTableLifecycleState) => undefined
const expectTableProps = (_props: ComponentProps<typeof DealCommitmentsTable>) => undefined
const openDetailsLabelPattern = /Open commitment detail for/u
const selectTailwindLabelPattern = /Select Tailwind/u
const sortByLabelPattern = /Sort by/u
const noopActiveFilterIdsChange = (_ids: readonly CommitmentTableFilterId[]) => undefined
const noopPageChange = (_page: number) => undefined
const noopPageSizeChange = (_pageSize: number) => undefined
const noopSearchValueChange = (_value: string) => undefined
const noopSelectedRowIdsChange = (_rowIds: readonly string[]) => undefined

// @ts-expect-error Loading state cannot carry ready rows.
expectLifecycleState({ kind: 'loading', rows: lockedCommitmentRows })

// @ts-expect-error Error state cannot carry ready rows.
expectLifecycleState({ kind: 'error', rows: lockedCommitmentRows, title: 'Failed' })

// @ts-expect-error Retry labels and retry behavior travel as one retry action.
expectLifecycleState({ kind: 'error', retryLabel: 'Retry', title: 'Failed' })

// @ts-expect-error Export toolbar copy requires export behavior.
expectTableProps({
  footer: dealCommitmentsTableLabels.footer,
  labels: dealCommitmentsTableLabels.labels,
  state: readyTableState(),
  subtitle: dealCommitmentsTableLabels.subtitle,
  title: dealCommitmentsTableLabels.title,
  toolbar: {
    exportLabel: 'Export',
    exportSelectedLabel: 'Export selected',
    exportVisibleLabel: 'Export visible',
    searchPlaceholder: 'Search investors',
    selectedLabel: 'selected',
    workflowFiltersLabel: 'Workflow filters',
  },
})

// @ts-expect-error Export behavior requires both selected and visible handlers.
expectTableProps({
  footer: dealCommitmentsTableLabels.footer,
  labels: dealCommitmentsTableLabels.labels,
  onExportSelected: () => undefined,
  state: readyTableState(),
  subtitle: dealCommitmentsTableLabels.subtitle,
  title: dealCommitmentsTableLabels.title,
  toolbar: dealCommitmentsTableLabels.toolbar,
})

expectLifecycleState({
  kind: 'ready',
  rows: lockedCommitmentRows,
  // @ts-expect-error Ready state uses selectedRowIds for batch selection.
  selectedRowId: 'pine-point-capital',
})

const _incompleteReadinessRow: CommitmentInvestorRow = {
  ...lockedCommitmentRows[0],
  // @ts-expect-error Readiness requires all four readiness keys.
  readiness: { kycKyb: lockedCommitmentRows[0].readiness.kycKyb },
}

const _rowWithTransientState: CommitmentInvestorRow = {
  ...lockedCommitmentRows[0],
  // @ts-expect-error Row data cannot carry transient UI state.
  selected: true,
}

const _rowMissingCommitmentSortValue: CommitmentInvestorRow = {
  ...lockedCommitmentRows[0],
  // @ts-expect-error Commitment sorting requires a stable numeric sort value.
  commitmentSortValue: undefined,
}

const _rowWithReadinessTone: CommitmentInvestorRow = {
  ...lockedCommitmentRows[0],
  readiness: {
    ...lockedCommitmentRows[0].readiness,
    kycKyb: {
      ...lockedCommitmentRows[0].readiness.kycKyb,
      // @ts-expect-error Readiness tone is derived from the semantic variant.
      tone: 'danger',
    },
  },
}

const _rowWithMismatchedReadinessKey: CommitmentInvestorRow = {
  ...lockedCommitmentRows[0],
  readiness: {
    ...lockedCommitmentRows[0].readiness,
    // @ts-expect-error Readiness record keys and inner semantic keys must match.
    wire: { ...lockedCommitmentRows[0].readiness.wire, key: 'signature' },
  },
}

const getInvestorRow = (investorName: string) => {
  const row = screen.getByText(investorName).closest('tr')

  if (!(row instanceof HTMLTableRowElement)) {
    throw new Error(`Expected ${investorName} to be rendered inside a table row.`)
  }

  return row
}

const getReadinessIconNames = (row: HTMLElement) =>
  Array.from(row.querySelectorAll<SVGElement>('[data-readiness-icon]')).map((icon) =>
    icon.getAttribute('data-readiness-icon'),
  )

const getInvestorAvatar = (investorName: string) => {
  const avatar = getInvestorRow(investorName).querySelector(
    '[data-slot="commitment-investor-avatar"]',
  )

  if (!(avatar instanceof HTMLElement)) {
    throw new Error(`Expected ${investorName} to render an avatar.`)
  }

  return avatar
}

const expectRadixTooltipText = (element: HTMLElement, fullText: string) => {
  expect(element).not.toHaveAttribute('title')
  expect(element).toHaveAttribute('data-full-text', fullText)
}

describe('DealCommitmentsTable', () => {
  it('renders title, subtitle, interactive toolbar controls, and accurate footer labels', () => {
    renderCommitmentsTable()

    expect(screen.getByRole('heading', { name: 'Commitments' })).toBeInTheDocument()
    expect(
      screen.getByText('Investor readiness across KYC/KYB, signature, and wire.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search investors' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Filters' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View: Default' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Group: None' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: sortByLabelPattern })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Needs attention' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pending KYC/KYB' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Completed KYC/KYB' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Signature pending' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wire pending' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ready for closing' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Export visible' })).not.toBeInTheDocument()
    expect(screen.getByText('12 investors')).toBeInTheDocument()
    expect(screen.getByText('Overall committed $187,600,000')).toBeInTheDocument()
    expect(screen.getByText('Rows per page 8')).toBeInTheDocument()
    expect(screen.getByText('1–8 of 12')).toBeInTheDocument()
  })

  it('contains horizontal overflow inside the table scroller for constrained workspaces', () => {
    const { container } = render(
      <div style={{ width: 760 }}>
        <DealCommitmentsTable
          className="w-full"
          footer={dealCommitmentsTableLabels.footer}
          labels={dealCommitmentsTableLabels.labels}
          state={readyTableState()}
          subtitle={dealCommitmentsTableLabels.subtitle}
          title={dealCommitmentsTableLabels.title}
          toolbar={dealCommitmentsTableLabels.toolbar}
        />
      </div>,
    )

    expect(container.querySelector('[data-slot="deal-commitments-table"]')).toHaveClass(
      'max-w-full',
      'overflow-hidden',
    )
    expect(container.querySelector('[data-slot="commitments-table-scroll"]')).toHaveAttribute(
      'data-overflow-contained',
      'true',
    )
    expect(container.querySelector('[data-slot="commitments-table-scroll"]')).toHaveClass(
      'overflow-x-auto',
      'overscroll-x-contain',
    )
    expect(screen.getByRole('table', { name: 'Commitments' })).toHaveClass(
      'min-w-[61.75rem]',
      'table-fixed',
    )
  })

  it('renders workflow columns with entity folded into investor metadata', () => {
    const { container } = renderCommitmentsTable()

    expect(screen.getByRole('table', { name: 'Commitments' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Investor' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Entity' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Commitment' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Readiness' })).toHaveAttribute('colspan', '3')
    expect(screen.getByRole('columnheader', { name: 'KYC/KYB' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Signature' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Wire' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Reconciliation' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="readiness-status-cell"]')).toHaveLength(8 * 3)
    expect(container.querySelector('[data-slot="readiness-grid"]')).not.toBeInTheDocument()
    expect(
      screen.getByText('Pine Point Capital Fund LP · Existing investor · $25M · Attention'),
    ).toBeInTheDocument()
  })

  it('renders overridden table labels without relying on English source copy', () => {
    renderCommitmentsTable({
      labels: {
        ...dealCommitmentsTableLabels.labels,
        columns: {
          ...dealCommitmentsTableLabels.labels.columns,
          actions: 'Ouvrir',
          investor: 'Investisseur',
          kycKyb: 'Identite',
          readiness: 'Controle',
        },
        filters: {
          ...dealCommitmentsTableLabels.labels.filters,
          needsAttention: 'A traiter',
        },
        row: {
          ...dealCommitmentsTableLabels.labels.row,
          openDetailsLabel: (row) => `Ouvrir le dossier de ${row.investorName}`,
        },
        selection: {
          selectAllVisibleLabel: 'Selectionner les engagements visibles',
        },
      },
    })

    expect(screen.getByRole('columnheader', { name: 'Investisseur' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Controle' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Identite' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Ouvrir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A traiter' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Selectionner les engagements visibles' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ouvrir le dossier de Tailwind Partners' }),
    ).toBeInTheDocument()
  })

  it('renders first-page investor records and visible status labels', () => {
    renderCommitmentsTable()

    for (const row of lockedCommitmentRows.slice(0, 8)) {
      expect(screen.getByText(row.investorName)).toBeInTheDocument()
      expect(screen.getByText(`${row.entityName} · ${row.investorMeta}`)).toBeInTheDocument()
      expect(screen.getByText(row.commitmentLabel)).toBeInTheDocument()
      expect(screen.getAllByText(row.status.label).length).toBeGreaterThan(0)
    }

    expect(screen.queryByText('Harborview Endowment')).not.toBeInTheDocument()
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Signed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Received').length).toBeGreaterThan(0)
    expect(screen.queryByText('Reconciled')).not.toBeInTheDocument()
    expect(screen.getByText('Expired')).toBeInTheDocument()

    expect(within(getInvestorRow('Maverick Ventures')).getByText('Pending action')).toHaveAttribute(
      'data-full-text',
      'Pending action',
    )
    expect(
      within(getInvestorRow('Maverick Ventures'))
        .getByText('Pending action')
        .closest('[data-slot="commitment-status-pill"]'),
    ).toHaveAttribute('data-tone', 'attention')

    for (const notReceivedLabel of screen.getAllByText('Not received')) {
      expect(notReceivedLabel.closest('[data-slot="readiness-status-cell"]')).toHaveAttribute(
        'data-tone',
        'neutral',
      )
    }
  })

  it('applies alternating tint only to real investor rows and lets row states win', () => {
    renderCommitmentsTable()

    const firstRow = getInvestorRow('Tailwind Partners')
    const attentionAlternateRow = getInvestorRow('Pine Point Capital')
    const thirdRow = getInvestorRow('Atlas Secure Fund')
    const plainAlternateRow = getInvestorRow('Northbridge Advisors')

    expect(firstRow).toHaveAttribute('data-row-alternate', 'false')
    expect(attentionAlternateRow).toHaveAttribute('data-row-alternate', 'true')
    expect(attentionAlternateRow).toHaveAttribute('data-visual-state', 'attention')
    expect(thirdRow).toHaveAttribute('data-row-alternate', 'false')
    expect(plainAlternateRow).toHaveAttribute('data-row-alternate', 'true')
    expect(plainAlternateRow).toHaveAttribute('data-visual-state', 'default')
  })

  it('does not apply alternating data-row tint to skeleton, lifecycle, or group rows', () => {
    const loadingRender = renderCommitmentsTable({
      state: { kind: 'loading', rowCount: 3 },
    })

    for (const skeletonRow of loadingRender.container.querySelectorAll(
      '[data-slot="commitment-row-skeleton"]',
    )) {
      expect(skeletonRow).not.toHaveAttribute('data-row-alternate')
    }

    loadingRender.unmount()

    const emptyRender = render(
      <DealCommitmentsTable
        footer={emptyDealCommitmentsTableLabels.footer}
        labels={emptyDealCommitmentsTableLabels.labels}
        state={{
          description: 'Invited investors and submitted commitments will appear here.',
          kind: 'empty',
          title: 'No commitments yet',
          variant: 'no-data',
        }}
        subtitle={emptyDealCommitmentsTableLabels.subtitle}
        title={emptyDealCommitmentsTableLabels.title}
        toolbar={emptyDealCommitmentsTableLabels.toolbar}
      />,
    )
    const stateRow = emptyRender.container.querySelector('[data-slot="commitment-table-state-row"]')

    expect(stateRow).not.toHaveAttribute('data-row-alternate')
    emptyRender.unmount()

    const groupedRender = renderCommitmentsTable({
      state: readyTableState({ group: 'status' }),
    })

    for (const groupRow of groupedRender.container.querySelectorAll(
      '[data-slot="commitment-group-row"]',
    )) {
      expect(groupRow).not.toHaveAttribute('data-row-alternate')
    }
  })

  it('uses deterministic avatar tones when provided', () => {
    renderCommitmentsTable()

    expect(getInvestorAvatar('Tailwind Partners')).toHaveAttribute('data-avatar-tone', 'navy')
    expect(getInvestorAvatar('Pine Point Capital')).toHaveAttribute('data-avatar-tone', 'blush')
  })

  it('keeps batch selection separate from active drawer state', async () => {
    const user = userEvent.setup()
    const onSelectedRowIdsChange = vi.fn()
    const onRowOpen = vi.fn()

    renderCommitmentsTable({ onRowOpen, onSelectedRowIdsChange })

    await user.click(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' }))

    const pinePointRow = getInvestorRow('Pine Point Capital')

    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith(['pine-point-capital'])
    expect(onRowOpen).not.toHaveBeenCalled()
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Export selected' })).not.toBeInTheDocument()
    expect(pinePointRow).toHaveAttribute('data-batch-selected', 'true')
    expect(pinePointRow).toHaveAttribute('data-active', 'false')
    expect(pinePointRow).toHaveAttribute('data-drawer-open', 'false')
    expect(
      document.querySelector('[data-slot="commitment-drawer-connector"]'),
    ).not.toBeInTheDocument()
  })

  it('keeps provided selected row state controlled while still firing selection callbacks', async () => {
    const user = userEvent.setup()
    const onSelectedRowIdsChange = vi.fn()

    renderCommitmentsTable({
      onSelectedRowIdsChange,
      state: readyTableState({ selectedRowIds: [] }),
    })

    await user.click(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' }))

    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith(['pine-point-capital'])
    expect(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' })).not.toBeChecked()
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-batch-selected', 'false')
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument()
  })

  it('selects all visible enabled rows, supports indeterminate state, and clears visible rows', async () => {
    const user = userEvent.setup()
    const onSelectedRowIdsChange = vi.fn()
    const rowsWithDisabled = lockedCommitmentRows.map((row) =>
      row.id === 'tailwind-partners' ? { ...row, disabled: true } : row,
    )

    renderCommitmentsTable({
      onSelectedRowIdsChange,
      state: readyTableState({
        rows: rowsWithDisabled,
      }),
    })

    await user.click(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' }))

    const headerCheckbox = screen.getByRole('checkbox', { name: 'Select all visible commitments' })

    expect(headerCheckbox).toHaveAttribute('aria-checked', 'mixed')

    await user.click(headerCheckbox)

    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith([])

    await user.click(headerCheckbox)

    const selectedIds = onSelectedRowIdsChange.mock.lastCall?.[0] as readonly string[]

    expect(selectedIds).toHaveLength(7)
    expect(selectedIds).not.toContain('tailwind-partners')
  })

  it('keeps hidden selections but header selection operates on visible filtered rows', async () => {
    const user = userEvent.setup()
    const onSelectedRowIdsChange = vi.fn()

    renderCommitmentsTable({
      onSelectedRowIdsChange,
      state: readyTableState({
        searchValue: 'Pine',
        selectedRowIds: ['tailwind-partners'],
      }),
    })

    expect(
      screen.getByRole('checkbox', { name: 'Select all visible commitments' }),
    ).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByRole('checkbox', { name: 'Select all visible commitments' }))

    expect(onSelectedRowIdsChange).toHaveBeenLastCalledWith([
      'tailwind-partners',
      'pine-point-capital',
    ])
  })

  it('opens rows from body clicks and action buttons, while checkboxes do not open rows', async () => {
    const user = userEvent.setup()
    const onRowOpen = vi.fn()

    renderCommitmentsTable({ onRowOpen })

    await user.click(getInvestorRow('Tailwind Partners'))
    expect(onRowOpen).toHaveBeenLastCalledWith('tailwind-partners')
    expect(getInvestorRow('Tailwind Partners')).toHaveAttribute('data-drawer-open', 'true')

    await user.click(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' }))
    expect(onRowOpen).toHaveBeenCalledTimes(1)

    await user.click(
      screen.getByRole('button', { name: 'Open commitment detail for Pine Point Capital' }),
    )
    expect(onRowOpen).toHaveBeenLastCalledWith('pine-point-capital')
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-drawer-open', 'true')
  })

  it('opens rows from keyboard-activated row opener buttons', async () => {
    const user = userEvent.setup()
    const onRowOpen = vi.fn()

    renderCommitmentsTable({ onRowOpen })

    const tailwindOpener = screen.getByRole('button', {
      name: 'Open commitment detail for Tailwind Partners',
    })

    tailwindOpener.focus()
    await user.keyboard('{Enter}')

    expect(onRowOpen).toHaveBeenLastCalledWith('tailwind-partners')
    expect(getInvestorRow('Tailwind Partners')).toHaveAttribute('data-drawer-open', 'true')

    const pinePointOpener = screen.getByRole('button', {
      name: 'Open commitment detail for Pine Point Capital',
    })

    pinePointOpener.focus()
    await user.keyboard(' ')

    expect(onRowOpen).toHaveBeenLastCalledWith('pine-point-capital')
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-drawer-open', 'true')
  })

  it('normalizes active and drawer-open impossible states deterministically', () => {
    const { container } = renderCommitmentsTable({
      state: readyTableState({
        activeRowId: 'tailwind-partners',
        drawerOpenRowId: 'pine-point-capital',
      }),
    })

    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-active', 'true')
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-drawer-open', 'true')
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute('data-row-alternate', 'true')
    expect(getInvestorRow('Pine Point Capital')).toHaveAttribute(
      'data-visual-state',
      'active-drawer-open',
    )
    expect(getInvestorRow('Tailwind Partners')).toHaveAttribute('data-active', 'false')
    expect(
      screen.getByRole('button', { name: 'Open commitment detail for Pine Point Capital' }),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="commitment-drawer-connector"]')).toHaveLength(1)
  })

  it('suppresses disabled row selection, active affordances, drawer connector, and handlers', async () => {
    const user = userEvent.setup()
    const onRowOpen = vi.fn()
    const onSelectedRowIdsChange = vi.fn()
    const rows = lockedCommitmentRows.map((row) =>
      row.id === 'pine-point-capital' ? { ...row, disabled: true } : row,
    )

    const { container } = renderCommitmentsTable({
      onRowOpen,
      onSelectedRowIdsChange,
      state: readyTableState({
        activeRowId: 'pine-point-capital',
        drawerOpenRowId: 'pine-point-capital',
        rows,
        selectedRowIds: ['pine-point-capital'],
      }),
    })

    const pinePointRow = getInvestorRow('Pine Point Capital')

    expect(pinePointRow).toHaveAttribute('data-disabled', 'true')
    expect(pinePointRow).toHaveAttribute('data-active', 'false')
    expect(pinePointRow).toHaveAttribute('data-batch-selected', 'false')
    expect(pinePointRow).toHaveAttribute('data-row-alternate', 'true')
    expect(pinePointRow).toHaveAttribute('data-visual-state', 'disabled')
    expect(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' })).toBeDisabled()
    expect(
      container.querySelector('[data-slot="commitment-drawer-connector"]'),
    ).not.toBeInTheDocument()

    await user.click(pinePointRow)
    await user.click(
      within(pinePointRow).getByRole('button', {
        name: 'Open commitment detail for Pine Point Capital',
      }),
    )

    expect(onRowOpen).not.toHaveBeenCalled()
    expect(onSelectedRowIdsChange).not.toHaveBeenCalled()
  })

  it('renders loading skeleton rows only and ignores real state and handlers', async () => {
    const user = userEvent.setup()
    const { container } = renderCommitmentsTable({
      onRowOpen: vi.fn(),
      onSelectedRowIdsChange: vi.fn(),
      state: { kind: 'loading', rowCount: 8 },
    })

    expect(container.querySelectorAll('[data-slot="commitment-row-skeleton"]')).toHaveLength(8)
    expect(
      container.querySelectorAll('[data-slot="commitment-row-skeleton"][data-row-alternate]'),
    ).toHaveLength(0)
    expect(container.querySelector('[data-slot="deal-commitments-table"]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
    expect(screen.queryByText('Pine Point Capital')).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="commitment-drawer-connector"]'),
    ).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-batch-selected="true"]')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: openDetailsLabelPattern })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: selectTailwindLabelPattern }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Search investors' })).toBeDisabled()

    await user.keyboard('{Tab}')
    expect(screen.getByRole('button', { name: 'Needs attention' })).toBeDisabled()
  })

  it('renders lifecycle empty state without rows, selected state, or drawer affordances', () => {
    const { container } = render(
      <DealCommitmentsTable
        footer={emptyDealCommitmentsTableLabels.footer}
        labels={emptyDealCommitmentsTableLabels.labels}
        state={{
          description: 'Invited investors and submitted commitments will appear here.',
          kind: 'empty',
          title: 'No commitments yet',
          variant: 'no-data',
        }}
        subtitle={emptyDealCommitmentsTableLabels.subtitle}
        title={emptyDealCommitmentsTableLabels.title}
        toolbar={emptyDealCommitmentsTableLabels.toolbar}
      />,
    )

    expect(screen.getByText('No commitments yet')).toBeInTheDocument()
    expect(
      screen.getByText('Invited investors and submitted commitments will appear here.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0 investors')).toBeInTheDocument()
    expect(screen.getByText('Total committed $0')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="commitment-investor-row"]')).toHaveLength(0)
    expect(container.querySelector('[data-slot="commitment-table-state-row"]')).not.toHaveAttribute(
      'data-row-alternate',
    )
    expect(
      container.querySelector('[data-slot="commitment-drawer-connector"]'),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: openDetailsLabelPattern })).not.toBeInTheDocument()
  })

  it('renders ready state with no source rows as no-data and disables row-scoped controls', async () => {
    const user = userEvent.setup()
    const onExportSelected = vi.fn()
    const onExportVisible = vi.fn()

    const { container } = renderCommitmentsTable({
      onExportSelected,
      onExportVisible,
      state: readyTableState({ rows: [] }),
    })

    expect(screen.getByText('No commitments yet')).toBeInTheDocument()
    expect(
      screen.getByText('Invited investors and submitted commitments will appear here.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0 investors')).toBeInTheDocument()
    expect(screen.getByText('Total committed $0')).toBeInTheDocument()
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="commitment-investor-row"]')).toHaveLength(0)
    expect(screen.getByRole('textbox', { name: 'Search investors' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Needs attention' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Select all visible commitments' })).toBeDisabled()

    const exportButton = screen.getByRole('button', { name: 'Export visible' })

    expect(exportButton).toBeDisabled()
    await user.click(exportButton)
    expect(onExportSelected).not.toHaveBeenCalled()
    expect(onExportVisible).not.toHaveBeenCalled()
  })

  it('renders filtered empty state for ready rows without mutating source rows', async () => {
    const user = userEvent.setup()
    const sourceRows = [...lockedCommitmentRows]

    renderCommitmentsTable({ state: readyTableState({ rows: sourceRows }) })

    await user.type(screen.getByRole('textbox', { name: 'Search investors' }), 'zzzz')

    expect(screen.getByText('No commitments match your search or filters')).toBeInTheDocument()
    expect(
      screen.getByText('Clear search or filters to return to all commitments.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Total committed $0')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
    expect(sourceRows).toEqual([...lockedCommitmentRows])
  })

  it('renders table-level errors without stale rows and calls retry when provided', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    const { container } = render(
      <DealCommitmentsTable
        footer={errorDealCommitmentsTableLabels.footer}
        labels={errorDealCommitmentsTableLabels.labels}
        state={{
          description: 'Refresh the page or try again.',
          kind: 'error',
          retry: {
            label: 'Retry',
            onRetry,
          },
          title: 'Commitments could not be loaded',
        }}
        subtitle={errorDealCommitmentsTableLabels.subtitle}
        title={errorDealCommitmentsTableLabels.title}
        toolbar={errorDealCommitmentsTableLabels.toolbar}
      />,
    )

    expect(screen.getByText('Commitments could not be loaded')).toBeInTheDocument()
    expect(screen.getByText('Refresh the page or try again.')).toBeInTheDocument()
    expect(screen.getByText('Investors unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="commitment-drawer-connector"]'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders row-level data issues as explicit fallback text distinct from business attention', () => {
    renderCommitmentsTable({ state: readyTableState({ rows: dataIssueCommitmentRows }) })

    const atlasFixture = dataIssueCommitmentRows.find((row) => row.id === 'atlas-secure-fund')
    const atlasRow = getInvestorRow('Atlas Secure Fund')
    const pinePointRow = getInvestorRow('Pine Point Capital')

    expect(atlasFixture?.readiness.reconciliation).toMatchObject({
      variant: 'needsReview',
      value: 'Needs review',
    })
    expect(atlasRow).toHaveAttribute('data-data-issue', 'true')
    expect(atlasRow).toHaveAttribute('data-attention', 'false')
    expect(within(atlasRow).getByText('Readiness sync failed')).toBeInTheDocument()
    expect(within(atlasRow).getAllByText('Unavailable').length).toBeGreaterThan(0)
    expect(within(atlasRow).getByText('Sync failed')).toBeInTheDocument()
    expect(within(atlasRow).queryByText('Needs review')).not.toBeInTheDocument()
    expect(atlasRow).toHaveAttribute('data-active', 'false')
    expect(pinePointRow).toHaveAttribute('data-attention', 'true')
    expect(pinePointRow).toHaveAttribute('data-data-issue', 'false')
  })

  it('allows row-level data issue rows to open unless the row is disabled', async () => {
    const user = userEvent.setup()
    const onRowOpen = vi.fn()

    renderCommitmentsTable({
      onRowOpen,
      state: readyTableState({ rows: dataIssueCommitmentRows }),
    })

    await user.click(getInvestorRow('Atlas Secure Fund'))

    expect(onRowOpen).toHaveBeenCalledWith('atlas-secure-fund')
  })

  it('filters rows through case-insensitive trimmed search and can clear search', async () => {
    const user = userEvent.setup()

    renderCommitmentsTable()

    const searchInput = screen.getByRole('textbox', { name: 'Search investors' })

    await user.type(searchInput, '  pine  ')

    expect(screen.getByText('Pine Point Capital')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
    expect(screen.getByText('1 investor')).toBeInTheDocument()
    expect(screen.getByText('Overall committed $187,600,000')).toBeInTheDocument()

    await user.clear(searchInput)

    expect(screen.getByText('Tailwind Partners')).toBeInTheDocument()
    expect(screen.getByText('12 investors')).toBeInTheDocument()
  })

  it('keeps provided search state controlled while still firing search callbacks', async () => {
    const user = userEvent.setup()
    const onSearchValueChange = vi.fn()

    renderCommitmentsTable({
      onSearchValueChange,
      state: readyTableState({ searchValue: '' }),
    })

    const searchInput = screen.getByRole('textbox', { name: 'Search investors' })

    await user.type(searchInput, 'Pine')

    expect(onSearchValueChange).toHaveBeenCalled()
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Tailwind Partners')).toBeInTheDocument()
    expect(screen.getByText('Pine Point Capital')).toBeInTheDocument()
  })

  it('uses provided search state without a callback as editable initial local state', async () => {
    const user = userEvent.setup()

    renderCommitmentsTable({
      state: readyTableState({ searchValue: 'Pine' }),
    })

    const searchInput = screen.getByRole('textbox', { name: 'Search investors' })

    expect(searchInput).toHaveValue('Pine')
    expect(screen.getByText('Pine Point Capital')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()

    await user.clear(searchInput)

    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Tailwind Partners')).toBeInTheDocument()
  })

  it('toggles workflow filter chips, updates rows, and clears filters', async () => {
    const user = userEvent.setup()

    renderCommitmentsTable()

    await user.click(screen.getByRole('button', { name: 'Needs attention' }))

    expect(screen.getByRole('button', { name: 'Needs attention' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Pine Point Capital')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Needs attention' }))

    expect(screen.getByRole('button', { name: 'Needs attention' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByText('Tailwind Partners')).toBeInTheDocument()
  })

  it('indexes readiness detail text in search without mutating source rows', async () => {
    const user = userEvent.setup()
    const sourceRows = [...longTextCommitmentRows]

    renderCommitmentsTable({
      onPageChange: noopPageChange,
      onPageSizeChange: noopPageSizeChange,
      state: readyTableState({
        rows: sourceRows,
        pagination: { page: 1, pageSize: 8 },
      }),
    })

    await user.type(
      screen.getByRole('textbox', { name: 'Search investors' }),
      'delegated signatory',
    )

    expect(
      screen.getByText('Longview Capital Strategic Opportunities Evergreen Partners'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Pine Point Capital')).not.toBeInTheDocument()
    expect(sourceRows).toEqual([...longTextCommitmentRows])
  })

  it('shows no-results empty state when filters hide every row', () => {
    renderCommitmentsTable({
      onActiveFilterIdsChange: noopActiveFilterIdsChange,
      onSearchValueChange: noopSearchValueChange,
      state: readyTableState({
        activeFilterIds: ['pendingKycKyb'],
        searchValue: 'Tailwind',
      }),
    })

    expect(screen.getByText('No commitments match your search or filters')).toBeInTheDocument()
    expect(screen.queryByText('Tailwind Partners')).not.toBeInTheDocument()
  })

  it('filters readiness from semantic variants instead of display copy', () => {
    const localizedWirePendingRow: CommitmentInvestorRow = {
      ...lockedCommitmentRows[0],
      id: 'localized-wire-pending',
      investorName: 'Localized Wire Pending',
      readiness: {
        ...lockedCommitmentRows[0].readiness,
        wire: {
          key: 'wire',
          label: 'Virement',
          variant: 'notReceived',
          value: 'Aucun virement',
        },
      },
    }
    const misleadingWireReceivedRow: CommitmentInvestorRow = {
      ...lockedCommitmentRows[0],
      id: 'misleading-wire-received',
      investorName: 'Misleading Wire Received',
      readiness: {
        ...lockedCommitmentRows[0].readiness,
        wire: {
          key: 'wire',
          label: 'Wire',
          variant: 'received',
          value: 'Pending display copy',
        },
      },
    }

    renderCommitmentsTable({
      onActiveFilterIdsChange: noopActiveFilterIdsChange,
      state: readyTableState({
        activeFilterIds: ['wirePending'],
        rows: [localizedWirePendingRow, misleadingWireReceivedRow],
      }),
    })

    expect(screen.getByText('Localized Wire Pending')).toBeInTheDocument()
    expect(screen.queryByText('Misleading Wire Received')).not.toBeInTheDocument()
  })

  it('exports visible rows when nothing is selected and selected visible rows when selected', async () => {
    const user = userEvent.setup()
    const onExportSelected = vi.fn()
    const onExportVisible = vi.fn()

    renderCommitmentsTable({
      onExportSelected,
      onExportVisible,
    })

    await user.click(screen.getByRole('button', { name: 'Export visible' }))

    expect(onExportVisible).toHaveBeenLastCalledWith(
      lockedCommitmentRows.slice(0, 8).map((row) => row.id),
    )

    await user.click(screen.getByRole('checkbox', { name: 'Select Pine Point Capital' }))
    await user.click(screen.getByRole('button', { name: 'Export selected' }))

    expect(onExportSelected).toHaveBeenLastCalledWith(['pine-point-capital'])
  })

  it('exports filtered visible row IDs when no selected rows are visible', async () => {
    const user = userEvent.setup()
    const onExportVisible = vi.fn()

    renderCommitmentsTable({
      onExportVisible,
      onExportSelected: vi.fn(),
      state: readyTableState({ searchValue: 'Pine' }),
      onSearchValueChange: noopSearchValueChange,
    })

    await user.click(screen.getByRole('button', { name: 'Export visible' }))

    expect(onExportVisible).toHaveBeenLastCalledWith(['pine-point-capital'])
  })

  it('paginates rows and disables pagination controls at bounds', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    renderCommitmentsTable({ onPageChange })

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(screen.getByText('9–12 of 12')).toBeInTheDocument()
    expect(screen.getByText('Harborview Endowment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('clamps controlled pagination to the available page range', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    renderCommitmentsTable({
      onPageChange,
      state: readyTableState({ pagination: { page: 99, pageSize: 8 } }),
    })

    expect(screen.getByText('9–12 of 12')).toBeInTheDocument()
    expect(screen.getByText('Harborview Endowment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('changes page size locally, fires callbacks, and keeps pagination labels coherent', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    renderCommitmentsTable({ onPageChange, onPageSizeChange })

    await user.click(screen.getByRole('button', { name: 'Rows per page 8' }))
    await user.click(await screen.findByRole('menuitemradio', { name: '12 rows' }))

    expect(onPageSizeChange).toHaveBeenCalledWith(12)
    expect(onPageChange).toHaveBeenCalledWith(1)
    expect(screen.getByText('Rows per page 12')).toBeInTheDocument()
    expect(screen.getByText('1–12 of 12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('keeps long row text compact and exposes full readiness detail through Radix tooltips', async () => {
    const longNameRow = longTextCommitmentRows[0] as CommitmentInvestorRow
    const investorMetadata = `${longNameRow.entityName} · ${longNameRow.investorMeta}`
    const row = longNameRow
    const kycDetail = row.readiness.kycKyb.detail
    const signatureDetail = row.readiness.signature.detail
    const wireDetail = row.readiness.wire.detail

    if (!kycDetail || !signatureDetail || !wireDetail) {
      throw new Error('Expected LongText fixture readiness states to include full detail.')
    }

    renderCommitmentsTable({
      onPageChange: noopPageChange,
      onPageSizeChange: noopPageSizeChange,
      state: readyTableState({
        rows: longTextCommitmentRows,
        pagination: { page: 1, pageSize: 8 },
      }),
    })

    const longTextRow = getInvestorRow(row.investorName)

    expectRadixTooltipText(within(longTextRow).getByText(row.investorName), row.investorName)
    expectRadixTooltipText(screen.getByText(investorMetadata), investorMetadata)
    expectRadixTooltipText(within(longTextRow).getByText(row.status.label), row.status.label)
    expectRadixTooltipText(within(longTextRow).getByText(row.readiness.kycKyb.value), kycDetail)
    expectRadixTooltipText(
      within(longTextRow).getByText(row.readiness.signature.value),
      signatureDetail,
    )
    expectRadixTooltipText(within(longTextRow).getByText(row.readiness.wire.value), wireDetail)
    expect(within(longTextRow).queryByText(kycDetail)).not.toBeInTheDocument()
    expect(longTextRow).toHaveAttribute('data-row-density', 'compact')

    const kycTrigger = within(longTextRow).getByText(row.readiness.kycKyb.value)

    expect(kycTrigger).toHaveAttribute('data-keyboard-tooltip', 'true')

    kycTrigger.focus()

    expect(kycTrigger).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent(kycDetail)
  })

  it('maps readiness icons from stable key and tone rather than display copy', () => {
    const localizedRow: CommitmentInvestorRow = {
      ...lockedCommitmentRows[0],
      id: 'localized-row',
      readiness: {
        kycKyb: { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Local OK' },
        reconciliation: {
          key: 'reconciliation',
          label: 'Reconciliation',
          variant: 'reconciling',
          value: 'Local sync',
        },
        signature: {
          key: 'signature',
          label: 'Signature',
          variant: 'signed',
          value: 'Local sign',
        },
        wire: { key: 'wire', label: 'Wire', variant: 'received', value: 'Local wire' },
      },
    }

    renderCommitmentsTable({
      onPageChange: noopPageChange,
      onPageSizeChange: noopPageSizeChange,
      state: readyTableState({ rows: [localizedRow], pagination: { page: 1, pageSize: 8 } }),
    })

    expect(getReadinessIconNames(getInvestorRow('Tailwind Partners'))).toEqual([
      'check',
      'signature',
      'bank',
    ])
  })

  it('handles optional handlers safely', async () => {
    const user = userEvent.setup()

    renderCommitmentsTable()

    await expect(
      user.click(screen.getByRole('checkbox', { name: 'Select Tailwind Partners' })),
    ).resolves.toBeUndefined()
    await expect(
      user.click(
        screen.getByRole('button', { name: 'Open commitment detail for Tailwind Partners' }),
      ),
    ).resolves.toBeUndefined()
  })

  it('has no accessibility violations across core light and dark table states', async () => {
    const defaultRender = renderCommitmentsTable()
    expect((await axe(defaultRender.container)).violations).toHaveLength(0)
    defaultRender.unmount()

    const drawerOpenRender = renderCommitmentsTable({
      state: readyTableState({ drawerOpenRowId: 'pine-point-capital' }),
    })
    expect((await axe(drawerOpenRender.container)).violations).toHaveLength(0)
    drawerOpenRender.unmount()

    const batchSelectedRender = renderCommitmentsTable({
      onSelectedRowIdsChange: noopSelectedRowIdsChange,
      state: readyTableState({
        selectedRowIds: ['pine-point-capital', 'atlas-secure-fund'],
      }),
    })
    expect((await axe(batchSelectedRender.container)).violations).toHaveLength(0)
    batchSelectedRender.unmount()

    const loadingRender = renderCommitmentsTable({ state: { kind: 'loading', rowCount: 8 } })
    expect((await axe(loadingRender.container)).violations).toHaveLength(0)
    loadingRender.unmount()

    const disabledRender = renderCommitmentsTable({
      state: readyTableState({ rows: disabledCommitmentRows }),
    })
    expect((await axe(disabledRender.container)).violations).toHaveLength(0)
    disabledRender.unmount()

    const filteredEmptyRender = renderCommitmentsTable({
      onSearchValueChange: noopSearchValueChange,
      state: readyTableState({ searchValue: 'missing investor' }),
    })
    expect((await axe(filteredEmptyRender.container)).violations).toHaveLength(0)
    filteredEmptyRender.unmount()

    const dataIssueRender = renderCommitmentsTable({
      state: readyTableState({ rows: dataIssueCommitmentRows }),
    })
    expect((await axe(dataIssueRender.container)).violations).toHaveLength(0)
    dataIssueRender.unmount()

    const emptyRender = render(
      <DealCommitmentsTable
        footer={emptyDealCommitmentsTableLabels.footer}
        labels={emptyDealCommitmentsTableLabels.labels}
        state={{
          description: 'Invited investors and submitted commitments will appear here.',
          kind: 'empty',
          title: 'No commitments yet',
        }}
        subtitle={emptyDealCommitmentsTableLabels.subtitle}
        title={emptyDealCommitmentsTableLabels.title}
        toolbar={emptyDealCommitmentsTableLabels.toolbar}
      />,
    )
    expect((await axe(emptyRender.container)).violations).toHaveLength(0)
    emptyRender.unmount()

    const errorRender = render(
      <DealCommitmentsTable
        footer={errorDealCommitmentsTableLabels.footer}
        labels={errorDealCommitmentsTableLabels.labels}
        state={{
          description: 'Refresh the page or try again.',
          kind: 'error',
          title: 'Commitments could not be loaded',
        }}
        subtitle={errorDealCommitmentsTableLabels.subtitle}
        title={errorDealCommitmentsTableLabels.title}
        toolbar={errorDealCommitmentsTableLabels.toolbar}
      />,
    )
    expect((await axe(errorRender.container)).violations).toHaveLength(0)
    errorRender.unmount()

    const darkDefaultRender = render(
      <div className="dark" data-theme="dark">
        <DealCommitmentsTable
          footer={dealCommitmentsTableLabels.footer}
          labels={dealCommitmentsTableLabels.labels}
          state={readyTableState()}
          subtitle={dealCommitmentsTableLabels.subtitle}
          title={dealCommitmentsTableLabels.title}
          toolbar={dealCommitmentsTableLabels.toolbar}
        />
      </div>,
    )
    expect((await axe(darkDefaultRender.container)).violations).toHaveLength(0)
    darkDefaultRender.unmount()

    const darkDrawerRender = render(
      <div className="dark" data-theme="dark">
        <DealCommitmentsTable
          footer={dealCommitmentsTableLabels.footer}
          labels={dealCommitmentsTableLabels.labels}
          state={readyTableState({ drawerOpenRowId: 'pine-point-capital' })}
          subtitle={dealCommitmentsTableLabels.subtitle}
          title={dealCommitmentsTableLabels.title}
          toolbar={dealCommitmentsTableLabels.toolbar}
        />
      </div>,
    )
    expect((await axe(darkDrawerRender.container)).violations).toHaveLength(0)
    darkDrawerRender.unmount()
  })
})
