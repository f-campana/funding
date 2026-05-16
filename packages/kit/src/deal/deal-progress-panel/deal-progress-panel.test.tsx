import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  normalizeSegments,
} from './deal-progress-panel.model'
import type { DealProgressPanelState } from './deal-progress-panel.types'
import {
  adminOnlyState,
  closedCompletedState,
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

const forbiddenImportsPattern = /apps\/web|@repo\/app|trpc|createTRPC|router|route/u
const consolePattern = /console\.(log|warn|error)/u
const rawPalettePattern =
  /\b(?:bg|border|fill|from|outline|ring|stroke|text|to|via)-(?:amber|blue|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/u
const panelSourceFilePattern = /^deal-progress-panel.*\.(ts|tsx)$/u

const expectLifecycleState = (_state: DealProgressPanelState) => undefined

// @ts-expect-error Loading state cannot carry ready capital data.
expectLifecycleState({ kind: 'loading', capital: defaultCollectingCommitmentsState.capital })

// @ts-expect-error Error state cannot carry workflow actions.
expectLifecycleState({ actions: defaultCollectingCommitmentsState.actions, kind: 'error' })

// @ts-expect-error Ready state requires capital summary.
expectLifecycleState({ kind: 'ready', mode: 'collectingCommitments', stage: 'open' })

describe('DealProgressPanel', () => {
  it('renders the ready command panel with status, visibility, capital, progress, and actions', () => {
    renderPanel()

    expect(screen.getByRole('heading', { name: 'Deal progression' })).toBeInTheDocument()
    expect(screen.getByText('Collecting commitments')).toBeInTheDocument()
    expect(screen.getByText('Only visible to admins')).toBeInTheDocument()
    expect(screen.getByText('€100,000 / €200,000')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Deal capital progress' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
    expect(screen.getByRole('button', { name: 'Close deal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument()
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

  it('renders segmented progress with labels and amounts', () => {
    renderPanel(segmentedProgressState)

    expect(screen.getByText('Investable')).toBeInTheDocument()
    expect(screen.getAllByText('€95,500').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Entry fees').length).toBeGreaterThan(0)
    expect(screen.getAllByText('€2,500').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SPV fees').length).toBeGreaterThan(0)
    expect(screen.getAllByText('€2,000').length).toBeGreaterThan(0)
  })

  it('keeps no-target progress semantically indeterminate', () => {
    renderPanel(noTargetKnownState)

    const progress = screen.getByRole('progressbar', { name: 'Deal capital progress' })

    expect(progress).not.toHaveAttribute('aria-valuenow')
    expect(progress).toHaveAttribute('aria-valuetext', 'Target amount not available')
    expect(screen.getByText('€640,000 raised')).toBeInTheDocument()
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
  ] as const)('has no accessibility violations for %s state', async (_name, state) => {
    const { container } = renderPanel(state)

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('has no accessibility violations in dark mode context', async () => {
    const { container } = render(
      <div className="dark bg-background p-6" data-theme="dark">
        <DealProgressPanel
          labels={dealProgressPanelLabels}
          state={defaultCollectingCommitmentsState}
        />
      </div>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('keeps new kit files inside package boundaries', () => {
    const directory = resolve(process.cwd(), 'src/deal/deal-progress-panel')
    const files = readdirSync(directory).filter(
      (fileName) =>
        panelSourceFilePattern.test(fileName) &&
        !fileName.endsWith('.stories.tsx') &&
        !fileName.endsWith('.test.tsx'),
    )

    for (const fileName of files) {
      const contents = readFileSync(resolve(directory, fileName), 'utf8')

      expect(contents).not.toMatch(forbiddenImportsPattern)
      expect(contents).not.toMatch(consolePattern)
      expect(contents).not.toMatch(rawPalettePattern)
    }
  })

  it('exposes stable semantic slots and state attributes', () => {
    const { container } = renderPanel(defaultCollectingCommitmentsState)
    const panel = container.querySelector('[data-slot="deal-progress-panel"]')

    expect(panel).toHaveAttribute('data-state', 'ready')
    expect(panel).toHaveAttribute('data-stage', 'open')
    expect(panel).toHaveAttribute('data-mode', 'collectingCommitments')
    expect(container.querySelector('[data-slot="deal-progress-status"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-capital"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-progress-action"]')).toBeInTheDocument()
  })
})
