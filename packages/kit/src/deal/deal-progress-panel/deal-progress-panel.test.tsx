import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { axe } from '../../test/axe'
import { DealProgressPanel } from './deal-progress-panel'
import {
  clampBasisPoints,
  getPrimaryAction,
  getProgressBarValue,
  getSecondaryActions,
  minCompositionSegmentBasisPoints,
  normalizeCompositionSegments,
  normalizeSegments,
} from './deal-progress-panel.model'
import type {
  DealProgressAction,
  DealProgressPanelProps,
  DealProgressPanelState,
} from './deal-progress-panel.types'
import {
  adminOnlyState,
  closedCompletedState,
  dataIssueState,
  dealProgressPanelLabels,
  defaultCollectingCommitmentsState,
  disabledActionsState,
  errorState,
  loadingState,
  noTargetKnownState,
  ongoingClosingState,
  overTargetCappedState,
  readonlyNonAdminState,
  segmentedProgressState,
} from './deal-progress-panel-fixtures'

const renderPanel = (
  state: DealProgressPanelState = defaultCollectingCommitmentsState,
  onAction = vi.fn(),
) =>
  render(<DealProgressPanel labels={dealProgressPanelLabels} onAction={onAction} state={state} />)

const expectLifecycleState = (_state: DealProgressPanelState) => undefined
const expectPanelProps = (_props: DealProgressPanelProps) => undefined
const expectProgressAction = (_action: DealProgressAction) => undefined

// @ts-expect-error Loading state cannot carry ready capital data.
expectLifecycleState({ kind: 'loading', capital: defaultCollectingCommitmentsState.capital })

// @ts-expect-error Error state cannot carry workflow actions.
expectLifecycleState({ actions: defaultCollectingCommitmentsState.actions, kind: 'error' })

// @ts-expect-error Ready state requires capital summary.
expectLifecycleState({ kind: 'ready', mode: 'collectingCommitments', stage: 'open' })

// @ts-expect-error Retryable error state requires an action handler.
expectPanelProps({ labels: dealProgressPanelLabels, state: errorState })

// @ts-expect-error Available workflow actions require an action handler.
expectPanelProps({ labels: dealProgressPanelLabels, state: defaultCollectingCommitmentsState })

expectLifecycleState({
  actions: {
    // @ts-expect-error Terminal ready states cannot carry workflow actions.
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'enabled',
      kind: 'closeDeal',
      label: 'Close deal',
    },
  },
  capital: defaultCollectingCommitmentsState.capital,
  dataQuality: { kind: 'fresh' },
  kind: 'ready',
  mode: 'closed',
  stage: 'completed',
  status: { kind: 'completed', label: 'Completed', tone: 'success' },
})

// @ts-expect-error Readonly ready states cannot carry hidden admin actions.
expectLifecycleState({
  ...defaultCollectingCommitmentsState,
  visibility: { kind: 'readonly', label: 'Read-only view' },
})

expectProgressAction({
  audience: 'admin',
  availability: 'enabled',
  // @ts-expect-error Retry is not a ready-state workflow action.
  kind: 'retry',
  label: 'Retry',
})

// @ts-expect-error Disabled actions require an explicit disabled reason.
expectProgressAction({
  audience: 'admin',
  availability: 'disabled',
  kind: 'closeDeal',
  label: 'Close deal',
})

expectProgressAction({
  audience: 'admin',
  availability: 'enabled',
  // @ts-expect-error Enabled actions cannot carry stale disabled reasons.
  disabledReason: 'Already resolved.',
  kind: 'closeDeal',
  label: 'Close deal',
})

describe('DealProgressPanel', () => {
  it('renders the ready command panel with status, visibility, capital, progress, and actions', () => {
    const { container } = renderPanel()

    expect(screen.getByRole('heading', { name: 'Deal progression' })).toBeInTheDocument()
    expect(screen.getByText('Collecting commitments')).toBeInTheDocument()
    expect(screen.getByText('Only visible to admins')).toBeInTheDocument()
    expect(screen.getByText('€100,000 / €200,000')).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    expect(screen.getByRole('progressbar', { name: 'Deal capital progress' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
    expect(container.querySelector('[data-slot="deal-capital-composition"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-capital-composition"]')).not.toHaveAttribute(
      'role',
    )
    expect(screen.getByText('Capital composition')).toBeInTheDocument()
    expect(screen.getByText('Capital breakdown')).toBeInTheDocument()
    expect(screen.getByText('Investable')).toBeInTheDocument()
    expect(screen.getByText('€95,500')).toBeInTheDocument()
    expect(screen.queryByText('Investable amount')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-details"]')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close deal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument()
  })

  it('supports composing the panel from compound parts', () => {
    const titleId = 'composed-deal-progress-title'
    const { container } = render(
      <DealProgressPanel.Root aria-labelledby={titleId} state={defaultCollectingCommitmentsState}>
        <DealProgressPanel.Header
          labels={dealProgressPanelLabels}
          state={defaultCollectingCommitmentsState}
          titleId={titleId}
        />
        <DealProgressPanel.Capital
          capital={defaultCollectingCommitmentsState.capital}
          labels={dealProgressPanelLabels}
        />
        <DealProgressPanel.Actions onAction={vi.fn()} state={defaultCollectingCommitmentsState} />
      </DealProgressPanel.Root>,
    )

    expect(screen.getByRole('heading', { name: 'Deal progression' })).toHaveAttribute('id', titleId)
    expect(container.querySelector('[data-slot="deal-progress-panel"]')).toHaveAttribute(
      'data-visual-state',
      'ready',
    )
    expect(screen.getByRole('button', { name: 'Close deal' })).toBeInTheDocument()
  })

  it('renders loading as an inert busy skeleton state', () => {
    const { container } = renderPanel(loadingState)

    expect(container.querySelector('[data-slot="deal-progress-panel"]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('€100,000 / €200,000')).not.toBeInTheDocument()
  })

  it('renders an error state and fires retry through the stable action kind', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderPanel(errorState, onAction)

    expect(screen.getByText('Deal progression could not be loaded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onAction).toHaveBeenCalledWith({ kind: 'retry' })
  })

  it('renders a non-retryable error without requiring an action handler', () => {
    render(
      <DealProgressPanel
        labels={dealProgressPanelLabels}
        state={{ kind: 'error', title: 'No retry' }}
      />,
    )

    expect(screen.getByText('No retry')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders capital composition and breakdown without a second progressbar', () => {
    const { container } = renderPanel(segmentedProgressState)
    const composition = container.querySelector('[data-slot="deal-capital-composition"]')
    const entryFeeCompositionSegment = container.querySelector(
      '[data-slot="deal-capital-composition-segment"][data-segment-kind="entryFees"]',
    )
    const spvFeeCompositionSegment = container.querySelector(
      '[data-slot="deal-capital-composition-segment"][data-segment-kind="spvFees"]',
    )

    expect(screen.getByText('Capital composition')).toBeInTheDocument()
    expect(screen.getByText('Capital breakdown')).toBeInTheDocument()
    expect(screen.getByText('Investable')).toBeInTheDocument()
    expect(screen.getByText('€95,500')).toBeInTheDocument()
    expect(screen.getByText('Entry fees')).toBeInTheDocument()
    expect(screen.getByText('€2,500')).toBeInTheDocument()
    expect(screen.getByText('SPV fees')).toBeInTheDocument()
    expect(screen.getByText('€2,000')).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    expect(composition).toHaveAttribute('aria-hidden', 'true')
    expect(composition).not.toHaveAttribute('role')
    expect(
      composition?.querySelectorAll('[data-slot="deal-capital-composition-segment"]'),
    ).toHaveLength(3)
    expect(entryFeeCompositionSegment).toHaveAttribute(
      'data-visual-basis-points',
      `${minCompositionSegmentBasisPoints}`,
    )
    expect(spvFeeCompositionSegment).toHaveAttribute(
      'data-visual-basis-points',
      `${minCompositionSegmentBasisPoints}`,
    )
    expect(container.querySelector('[data-slot="deal-progress-segment"]')).not.toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="deal-progress-segment-marker"][data-segment-kind="investable"]',
      ),
    ).toHaveClass('bg-command-segment-investable')
  })

  it('renders overridden panel labels and locale-aware progress aria text', () => {
    const localizedLabels = {
      ...dealProgressPanelLabels,
      capitalBreakdownLabel: 'Ventilation du capital',
      capitalCompositionLabel: 'Composition du capital',
      progressCappedLabel: 'plafonne',
      progressAriaLabel: 'Progression du capital',
      title: 'Progression',
    }
    const localizedState = {
      ...segmentedProgressState,
      capital: {
        ...segmentedProgressState.capital,
        progress: {
          ...segmentedProgressState.capital.progress,
          basisPoints: 4_250,
          label: 'Capital engage',
        },
      },
    } as const satisfies DealProgressPanelState

    render(
      <DealProgressPanel
        labels={localizedLabels}
        locale="fr-FR"
        onAction={() => undefined}
        state={localizedState}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Progression' })).toBeInTheDocument()
    expect(screen.getByText('Composition du capital')).toBeInTheDocument()
    expect(screen.getByText('Ventilation du capital')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progression du capital' })).toHaveAttribute(
      'aria-valuetext',
      'Capital engage: 42,5%',
    )
  })

  it('keeps no-target progress semantically indeterminate', () => {
    renderPanel(noTargetKnownState)

    const progress = screen.getByRole('progressbar', { name: 'Deal capital progress' })

    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    expect(progress).not.toHaveAttribute('aria-valuenow')
    expect(progress).toHaveAttribute('aria-valuetext', 'Target amount not available')
    expect(screen.getByText('€640,000 raised')).toBeInTheDocument()
    expect(screen.getByText('Amount raised')).toBeInTheDocument()
    expect(
      screen.getByText('Target allocation has not been confirmed by operations.'),
    ).toBeInTheDocument()
  })

  it('keeps stale data warning and non-duplicative detail rows', () => {
    renderPanel(dataIssueState)

    expect(screen.getByText('Progress data may be stale')).toBeInTheDocument()
    expect(screen.getByText('Affected workflow')).toBeInTheDocument()
    expect(screen.getByText('Wire reconciliation')).toBeInTheDocument()
    expect(screen.queryByText('Investable amount')).not.toBeInTheDocument()
  })

  it('renders issue and unavailable data-quality states as degraded notices', () => {
    const issueState = {
      ...defaultCollectingCommitmentsState,
      dataQuality: {
        description: 'Fund admin returned inconsistent capital data.',
        kind: 'issue',
        label: 'Progress data has an issue',
      },
    } as const satisfies DealProgressPanelState
    const unavailableState = {
      ...defaultCollectingCommitmentsState,
      dataQuality: {
        description: 'Capital data is temporarily unavailable.',
        kind: 'unavailable',
        label: 'Progress data unavailable',
      },
    } as const satisfies DealProgressPanelState

    const issueRender = renderPanel(issueState)

    expect(
      issueRender.container.querySelector('[data-slot="deal-progress-panel"]'),
    ).toHaveAttribute('data-visual-state', 'issue')
    expect(screen.getByText('Progress data has an issue')).toBeInTheDocument()
    issueRender.unmount()

    const unavailableRender = renderPanel(unavailableState)

    expect(
      unavailableRender.container.querySelector('[data-slot="deal-progress-panel"]'),
    ).toHaveAttribute('data-visual-state', 'unavailable')
    expect(screen.getByText('Progress data unavailable')).toBeInTheDocument()
  })

  it('clamps over-target progress visually while preserving capped semantics', () => {
    const { container } = renderPanel(overTargetCappedState)
    const progress = screen.getByRole('progressbar', { name: 'Deal capital progress' })

    expect(progress).toHaveAttribute('aria-valuenow', '100')
    expect(progress).toHaveAttribute('aria-valuetext', 'Amount raised / target: 100% capped')
    expect(container.querySelector('[data-slot="deal-progress-bar"]')).toHaveAttribute(
      'data-capped',
      'true',
    )
  })

  it('fires primary and secondary workflow actions with stable action kinds', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderPanel(defaultCollectingCommitmentsState, onAction)

    await user.click(screen.getByRole('button', { name: 'Close deal' }))
    await user.click(screen.getByRole('button', { name: 'Invite' }))

    expect(onAction).toHaveBeenNthCalledWith(1, { kind: 'closeDeal' })
    expect(onAction).toHaveBeenNthCalledWith(2, { kind: 'invite' })
  })

  it('keeps disabled actions inert and exposes the disabled reason accessibly', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderPanel(disabledActionsState, onAction)

    const closeButton = screen.getByRole('button', { name: 'Close deal' })
    const reason = screen.getByText(
      'Resolve pending KYC/KYB and wire confirmations before closing.',
    )

    expect(closeButton).toBeDisabled()
    expect(closeButton).toHaveAttribute('aria-describedby', reason.id)
    await user.click(closeButton)

    expect(onAction).not.toHaveBeenCalled()
  })

  it('deduplicates shared disabled reasons across primary and secondary actions', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const sharedReason = 'Resolve pending KYC/KYB before continuing.'
    const state = {
      ...defaultCollectingCommitmentsState,
      actions: {
        kind: 'available',
        primary: {
          audience: 'admin',
          availability: 'disabled',
          disabledReason: sharedReason,
          kind: 'closeDeal',
          label: 'Close deal',
        },
        secondary: [
          {
            audience: 'admin',
            availability: 'disabled',
            disabledReason: sharedReason,
            kind: 'invite',
            label: 'Invite',
          },
        ],
      },
    } as const satisfies DealProgressPanelState

    renderPanel(state, onAction)

    const closeButton = screen.getByRole('button', { name: 'Close deal' })
    const inviteButton = screen.getByRole('button', { name: 'Invite' })
    const reason = screen.getByText(sharedReason)

    expect(screen.getAllByText(sharedReason)).toHaveLength(1)
    expect(closeButton).toBeDisabled()
    expect(inviteButton).toBeDisabled()
    expect(closeButton).toHaveAttribute('aria-describedby', reason.id)
    expect(inviteButton).toHaveAttribute('aria-describedby', reason.id)

    await user.click(inviteButton)
    expect(onAction).not.toHaveBeenCalled()
  })

  it('hides terminal-stage actions that would create impossible UI', () => {
    renderPanel(closedCompletedState)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close deal' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Invite' })).not.toBeInTheDocument()
  })

  it('hides admin-only actions in readonly variants', () => {
    renderPanel(readonlyNonAdminState)

    expect(screen.getByText('Read-only view')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('marks admin-only variants explicitly', () => {
    renderPanel(adminOnlyState)

    expect(screen.getByText('Only visible to admins')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close deal' })).toBeInTheDocument()
  })

  it('normalizes progress and segment helper output safely', () => {
    expect(clampBasisPoints(-250)).toBe(0)
    expect(clampBasisPoints(12_500)).toBe(10_000)
    expect(getProgressBarValue({ basisPoints: 4_250, kind: 'knownTarget', label: 'Raised' })).toBe(
      42.5,
    )
    expect(getProgressBarValue({ kind: 'noTarget', label: 'No target' })).toBeNull()

    const segments = normalizeSegments([
      {
        amountLabel: '€120',
        basisPoints: 12_000,
        kind: 'investable',
        label: 'Investable',
        tone: 'success',
      },
      {
        amountLabel: '€30',
        basisPoints: 3_000,
        kind: 'entryFees',
        label: 'Entry fees',
        tone: 'info',
      },
    ])

    expect(segments.reduce((sum, segment) => sum + segment.visualBasisPoints, 0)).toBe(10_000)

    const compositionSegments = normalizeCompositionSegments([
      {
        amountLabel: '€95,500',
        basisPoints: 4_775,
        kind: 'investable',
        label: 'Investable',
        tone: 'success',
      },
      {
        amountLabel: '€2,500',
        basisPoints: 125,
        kind: 'entryFees',
        label: 'Entry fees',
        tone: 'info',
      },
      {
        amountLabel: '€2,000',
        basisPoints: 100,
        kind: 'spvFees',
        label: 'SPV fees',
        tone: 'attention',
      },
    ])

    expect(compositionSegments.reduce((sum, segment) => sum + segment.visualBasisPoints, 0)).toBe(
      10_000,
    )
    expect(
      compositionSegments.find((segment) => segment.kind === 'entryFees')?.visualBasisPoints,
    ).toBe(minCompositionSegmentBasisPoints)
    expect(
      compositionSegments.find((segment) => segment.kind === 'spvFees')?.visualBasisPoints,
    ).toBe(minCompositionSegmentBasisPoints)
  })

  it('filters primary and secondary actions through model-level state rules', () => {
    expect(getPrimaryAction(closedCompletedState)).toBeUndefined()
    expect(getSecondaryActions(closedCompletedState)).toHaveLength(0)
    expect(getPrimaryAction(readonlyNonAdminState)).toBeUndefined()
    expect(getSecondaryActions(readonlyNonAdminState)).toHaveLength(0)
    expect(getPrimaryAction(defaultCollectingCommitmentsState)?.kind).toBe('closeDeal')
  })

  it.each([
    ['default', defaultCollectingCommitmentsState],
    ['segmented', segmentedProgressState],
    ['ongoing', ongoingClosingState],
    ['loading', loadingState],
    ['error', errorState],
    ['disabled', disabledActionsState],
    ['data issue', dataIssueState],
  ] as const)('has no accessibility violations for %s state', async (_name, state) => {
    const { container } = renderPanel(state)

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('has no accessibility violations in dark mode context', async () => {
    const { container } = render(
      <div className="dark bg-background p-6" data-theme="dark">
        <DealProgressPanel
          labels={dealProgressPanelLabels}
          onAction={() => undefined}
          state={defaultCollectingCommitmentsState}
        />
      </div>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('exposes stable semantic slots and state attributes', () => {
    const { container } = renderPanel(defaultCollectingCommitmentsState)
    const panel = container.querySelector('[data-slot="deal-progress-panel"]')

    expect(panel).toHaveAttribute('data-state', 'ready')
    expect(panel).toHaveAttribute('data-stage', 'open')
    expect(panel).toHaveAttribute('data-mode', 'collectingCommitments')
    expect(container.querySelector('[data-slot="deal-progress-status"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-capital"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-breakdown"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-capital-composition"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-action"]')).toBeInTheDocument()
  })

  it('uses command surface tokens for panel, progress, composition, and actions', () => {
    const { container } = renderPanel(defaultCollectingCommitmentsState)
    const panel = container.querySelector('[data-slot="deal-progress-panel"]')
    const closeButton = screen.getByRole('button', { name: 'Close deal' })
    const inviteButton = screen.getByRole('button', { name: 'Invite' })

    expect(panel).toHaveClass('border-command-border', 'bg-command', 'text-command-foreground')
    expect(screen.getByRole('progressbar', { name: 'Deal capital progress' })).toHaveClass(
      'bg-command-progress-muted',
    )
    expect(container.querySelector('[data-slot="deal-progress-indicator"]')).toHaveClass(
      'bg-command-progress',
    )
    expect(
      container.querySelector(
        '[data-slot="deal-progress-segment-marker"][data-segment-kind="investable"]',
      ),
    ).toHaveClass('bg-command-segment-investable')
    expect(
      container.querySelector(
        '[data-slot="deal-capital-composition-segment"][data-segment-kind="investable"]',
      ),
    ).toHaveClass('bg-command-segment-investable')
    expect(container.querySelector('[data-slot="deal-capital-composition"]')).toHaveClass(
      'border-command-border',
      'bg-command-muted',
    )
    expect(
      container.querySelector(
        '[data-slot="deal-progress-segment-marker"][data-segment-kind="entryFees"]',
      ),
    ).toHaveClass('bg-command-segment-entry-fees')
    expect(
      container.querySelector(
        '[data-slot="deal-progress-segment-marker"][data-segment-kind="spvFees"]',
      ),
    ).toHaveClass('bg-command-segment-spv-fees')
    expect(container.querySelector('[data-slot="deal-progress-status"]')).toHaveClass(
      'bg-command-progress-muted',
      'text-command-progress',
    )
    expect(closeButton).toHaveClass('bg-command-accent', 'text-command-accent-foreground')
    expect(inviteButton).toHaveClass(
      'border-command-border',
      'bg-command-muted',
      'text-command-foreground',
    )
  })
})
