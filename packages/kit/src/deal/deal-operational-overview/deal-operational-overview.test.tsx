import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
import type { DealOperationalOverviewState } from './deal-operational-overview.types'
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

const forbiddenImportsPattern = /apps\/web|@repo\/app|@repo\/domain|trpc|createTRPC|router|route/u
const consolePattern = /console\.(log|warn|error)/u
const rawPalettePattern =
  /\b(?:bg|border|fill|from|outline|ring|stroke|text|to|via)-(?:amber|blue|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/u
const overviewSourceFilePattern = /^deal-operational-overview.*\.(ts|tsx)$/u

const expectLifecycleState = (_state: DealOperationalOverviewState) => undefined

// @ts-expect-error Loading state cannot carry ready readiness data.
expectLifecycleState({ kind: 'loading', readiness: blockedOperationalOverviewState.readiness })

// @ts-expect-error Error state cannot carry blocker rows.
expectLifecycleState({ blockers: blockedOperationalOverviewState.blockers, kind: 'error' })

// @ts-expect-error Ready state requires capital summary.
expectLifecycleState({ kind: 'ready', readiness: blockedOperationalOverviewState.readiness })

describe('DealOperationalOverview', () => {
  it('renders ready mission-control content with readiness, capital, blockers, and activity', () => {
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
      'data-blocker-count',
      '3',
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

  it('keeps new kit files inside package boundaries', () => {
    const directory = resolve(process.cwd(), 'src/deal/deal-operational-overview')
    const files = readdirSync(directory).filter(
      (fileName) =>
        overviewSourceFilePattern.test(fileName) &&
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
})
