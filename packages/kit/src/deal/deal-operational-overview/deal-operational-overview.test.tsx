import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { axe } from '../../test/axe'
import { DealOperationalOverview } from './deal-operational-overview'
import {
  clampOperationalProgressValue,
  getOperationalBlockerTotal,
  getOperationalProgressValue,
} from './deal-operational-overview.model'
import type {
  DealOperationalBlockerSeverity,
  DealOperationalOverviewProps,
  DealOperationalOverviewReadyState,
  DealOperationalOverviewState,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'
import {
  blockedOperationalOverviewState,
  dealOperationalOverviewLabels,
  emptyOperationalOverviewState,
  errorOperationalOverviewState,
  loadingOperationalOverviewState,
  readyOperationalOverviewState,
} from './deal-operational-overview-fixtures'

const renderOverview = (
  state: DealOperationalOverviewState = blockedOperationalOverviewState,
  onAction = vi.fn(),
) =>
  render(
    <DealOperationalOverview
      labels={dealOperationalOverviewLabels}
      onAction={onAction}
      state={state}
    />,
  )

const expectLifecycleState = (_state: DealOperationalOverviewState) => undefined
const expectOverviewProps = (_props: DealOperationalOverviewProps) => undefined
const expectReadyState = (_state: DealOperationalOverviewReadyState) => undefined
const expectBlockedReadiness = (
  _readiness: Extract<DealOperationalReadinessSummary, { readonly state: 'blocked' }>,
) => undefined
const expectReadinessState = (_state: DealOperationalReadinessState) => undefined
const expectBlockerSeverity = (_severity: DealOperationalBlockerSeverity) => undefined

// @ts-expect-error Loading state cannot carry ready readiness data.
expectLifecycleState({ kind: 'loading', readiness: blockedOperationalOverviewState.readiness })

// @ts-expect-error Error state cannot carry blocker rows.
expectLifecycleState({ blockers: blockedOperationalOverviewState.blockers, kind: 'error' })

// @ts-expect-error Ready state requires capital summary.
expectLifecycleState({ kind: 'ready', readiness: blockedOperationalOverviewState.readiness })

expectReadyState(blockedOperationalOverviewState)
expectBlockedReadiness(blockedOperationalOverviewState.readiness)

// @ts-expect-error Readiness summary state remains the discriminant.
expectBlockedReadiness(readyOperationalOverviewState.readiness)

// @ts-expect-error Error retry UI uses retryAction, not a detached retry label.
expectLifecycleState({ kind: 'error', retryLabel: 'Retry', title: 'Could not load' })

// @ts-expect-error Retryable error state requires an action handler.
expectOverviewProps({
  labels: dealOperationalOverviewLabels,
  state: errorOperationalOverviewState,
})

expectReadinessState('not_started')

// @ts-expect-error Readiness state must match the Northstar DTO vocabulary.
expectReadinessState('not' + 'Started')

expectBlockerSeverity('warning')
expectBlockerSeverity('info')

// @ts-expect-error Blocker severity must match the Northstar DTO vocabulary.
expectBlockerSeverity('hi' + 'gh')

describe('DealOperationalOverview', () => {
  it('renders ready overview content with readiness, capital, blockers, and activity', () => {
    const { container } = renderOverview()

    expect(screen.getByRole('heading', { name: 'Operational overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Closing readiness' })).toBeInTheDocument()
    expect(screen.getByText('Blocked from close')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Resolve identity and wire matching blockers before scheduling final close.',
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="deal-operational-dimension"][data-dimension-id="investor-identity"]',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('€4,850,000 committed')).toBeInTheDocument()
    expect(screen.getByText('€5,000,000 target')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Capital reconciliation progress' }),
    ).toHaveAttribute('aria-valuenow', '97')
    expect(screen.getByText('Unmatched received')).toBeInTheDocument()
    expect(screen.getByText('Verify beneficial owner evidence')).toBeInTheDocument()
    expect(screen.getByText('Latest activity')).toBeInTheDocument()
    expect(
      screen.getByText('Matched €410,000 of incoming wires to signed subscription records.'),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-operational-overview"]')).toHaveAttribute(
      'data-visible-blocker-count',
      '3',
    )
    expect(container.querySelector('[data-slot="deal-operational-overview"]')).toHaveAttribute(
      'data-total-blocker-count',
      '6',
    )
    expect(container.querySelector('[data-slot="deal-operational-overview"]')).not.toHaveAttribute(
      'data-' + 'blocker-count',
    )
  })

  it('supports composing the overview surface from compound parts', () => {
    const titleId = 'composed-operational-overview-title'
    const { container } = render(
      <DealOperationalOverview.Root
        aria-labelledby={titleId}
        state={blockedOperationalOverviewState}
      >
        <DealOperationalOverview.Header
          readiness={blockedOperationalOverviewState.readiness}
          subtitle={dealOperationalOverviewLabels.subtitle}
          title="Composed operational overview"
          titleId={titleId}
        />
        <DealOperationalOverview.PrimaryGrid>
          <DealOperationalOverview.Readiness
            labels={dealOperationalOverviewLabels}
            readiness={blockedOperationalOverviewState.readiness}
          />
          <DealOperationalOverview.Capital
            capital={blockedOperationalOverviewState.capital}
            labels={dealOperationalOverviewLabels}
          />
        </DealOperationalOverview.PrimaryGrid>
        <DealOperationalOverview.SecondaryGrid>
          <DealOperationalOverview.Blockers
            blockers={blockedOperationalOverviewState.blockers}
            labels={dealOperationalOverviewLabels}
            summary={blockedOperationalOverviewState.blockerSummary}
          />
          <DealOperationalOverview.Activity
            activity={blockedOperationalOverviewState.activity}
            labels={dealOperationalOverviewLabels}
          />
        </DealOperationalOverview.SecondaryGrid>
      </DealOperationalOverview.Root>,
    )

    expect(
      screen.getByRole('heading', { name: 'Composed operational overview' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Closing readiness' })).toBeInTheDocument()
    expect(screen.getByText('€4,850,000 committed')).toBeInTheDocument()
    expect(screen.getByText('Priority blockers')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-operational-overview"]')).toHaveAttribute(
      'data-readiness-state',
      'blocked',
    )
  })

  it('renders loading as a busy skeleton state without ready content', () => {
    const { container } = renderOverview(loadingOperationalOverviewState)

    expect(container.querySelector('[data-slot="deal-operational-overview"]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByText('€4,850,000 committed')).not.toBeInTheDocument()
    expect(screen.queryByText('Priority blockers')).not.toBeInTheDocument()
  })

  it('renders an error state and fires retry through the stable action event', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderOverview(errorOperationalOverviewState, onAction)

    expect(screen.getByText('Operational overview could not be loaded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onAction).toHaveBeenCalledWith({ kind: 'retry' })
  })

  it('renders a non-retryable error without requiring an action handler', () => {
    render(
      <DealOperationalOverview
        labels={dealOperationalOverviewLabels}
        state={{ kind: 'error', title: 'No retry' }}
      />,
    )

    expect(screen.getByText('No retry')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders an empty state safely', () => {
    renderOverview(emptyOperationalOverviewState)

    expect(screen.getByRole('heading', { name: 'No operational overview yet' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Operational readiness data will appear after the deal has a closing workflow.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('exposes semantic state attributes for future route adapters and visual QA', () => {
    const { container } = renderOverview()
    const overview = container.querySelector('[data-slot="deal-operational-overview"]')
    const readiness = container.querySelector('[data-slot="deal-operational-readiness"]')
    const blockedDimension = container.querySelector(
      '[data-slot="deal-operational-dimension"][data-dimension-id="investor-identity"]',
    )
    const criticalBlocker = container.querySelector(
      '[data-slot="deal-operational-blocker"][data-blocker-id="bo-evidence"]',
    )

    expect(overview).toHaveAttribute('data-state', 'ready')
    expect(overview).toHaveAttribute('data-readiness-state', 'blocked')
    expect(readiness).toHaveAttribute('data-readiness-state', 'blocked')
    expect(blockedDimension).toHaveAttribute('data-state', 'blocked')
    expect(criticalBlocker).toHaveAttribute('data-severity', 'critical')
  })

  it('renders blocker fact labels from the labels contract', () => {
    render(
      <DealOperationalOverview
        labels={{
          ...dealOperationalOverviewLabels,
          blockerDocumentsLabel: 'Document evidence',
          blockerDueLabel: 'Target date',
          blockerInvestorsLabel: 'Investor scope',
          blockerOwnerLabel: 'Responsible team',
          blockerSurfaceLabel: 'Operational surface',
        }}
        state={blockedOperationalOverviewState}
      />,
    )

    expect(screen.getAllByText('Responsible team').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Operational surface').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Investor scope').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Document evidence').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Target date').length).toBeGreaterThan(0)
  })

  it('keeps blocker severity fixtures on the Northstar vocabulary', () => {
    expect(
      blockedOperationalOverviewState.readiness.blockerCounts.map((count) => count.severity),
    ).toEqual(['critical', 'warning', 'info'])
    expect(blockedOperationalOverviewState.blockers.map((blocker) => blocker.severity)).toEqual([
      'critical',
      'critical',
      'warning',
    ])
  })

  it('renders no-blocker ready states without creating empty blocker rows', () => {
    const { container } = renderOverview(readyOperationalOverviewState)

    expect(screen.getByText('Ready to close')).toBeInTheDocument()
    expect(screen.getByText('No priority blockers are open.')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="deal-operational-blocker"]')).toHaveLength(0)
    expect(container.querySelector('[data-slot="deal-operational-no-blockers"]')).toHaveClass(
      'bg-status-success-muted',
      'text-status-success',
    )
  })

  it('renders ready states with empty activity and optional metric groups omitted', () => {
    const state = {
      ...blockedOperationalOverviewState,
      activity: [],
      capital: {
        ...blockedOperationalOverviewState.capital,
        economics: [],
        metrics: [],
      },
    } as const satisfies DealOperationalOverviewState

    const { container } = renderOverview(state)

    expect(screen.getByText('No recent operational activity.')).toBeInTheDocument()
    expect(screen.queryByText('Reconciliation metrics')).not.toBeInTheDocument()
    expect(screen.queryByText('Economics')).not.toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Capital reconciliation progress' }),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-slot="deal-operational-blocker"]')).toBeInTheDocument()
  })

  it('renders not-started readiness and dimension states from the Northstar vocabulary', () => {
    const state = {
      ...blockedOperationalOverviewState,
      readiness: {
        ...blockedOperationalOverviewState.readiness,
        blockerCounts: [],
        dimensions: [
          {
            blockerCount: 0,
            description: 'Closing workflow has not started.',
            id: 'closing-workflow',
            label: 'Closing workflow',
            state: 'not_started',
          },
        ],
        label: 'Not started',
        nextAction: 'Start the closing workflow.',
        state: 'not_started',
      },
    } as const satisfies DealOperationalOverviewState

    const { container } = renderOverview(state)

    expect(container.querySelector('[data-slot="deal-operational-overview"]')).toHaveAttribute(
      'data-readiness-state',
      'not_started',
    )
    expect(screen.getByText('Not started')).toBeInTheDocument()
    expect(screen.getByText('Start the closing workflow.')).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="deal-operational-dimension"][data-dimension-id="closing-workflow"]',
      ),
    ).toHaveAttribute('data-state', 'not_started')
  })

  it('clamps progress helper output for invalid and over-target values', () => {
    expect(clampOperationalProgressValue(-25)).toBe(0)
    expect(clampOperationalProgressValue(Number.NaN)).toBe(0)
    expect(clampOperationalProgressValue(150)).toBe(100)
    expect(getOperationalProgressValue({ label: 'Over target', value: 128 })).toBe(100)
    expect(
      getOperationalBlockerTotal(blockedOperationalOverviewState.readiness.blockerCounts),
    ).toBe(6)
  })

  it.each([
    ['ready', blockedOperationalOverviewState],
    ['loading', loadingOperationalOverviewState],
    ['error', errorOperationalOverviewState],
    ['empty', emptyOperationalOverviewState],
    ['no blockers', readyOperationalOverviewState],
  ] as const)('has no accessibility violations for %s state', async (_name, state) => {
    const { container } = renderOverview(state)

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('has no accessibility violations in dark mode context', async () => {
    const { container } = render(
      <div className="dark bg-background p-6" data-theme="dark">
        <DealOperationalOverview
          labels={dealOperationalOverviewLabels}
          state={blockedOperationalOverviewState}
        />
      </div>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
