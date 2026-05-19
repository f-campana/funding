import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import * as Kit from '@repo/kit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../test/axe'
import type { CommitmentReadinessKey } from '../commitment-readiness.types'
import { commitmentReadinessKeys } from '../commitment-readiness.types'
import type {
  DealCommitmentEvidenceItem,
  DealCommitmentInspectorActionEvent,
  DealCommitmentInspectorProps,
  DealCommitmentInspectorState,
  DealCommitmentInspectorTone,
  DealCommitmentReadinessKey,
  DealCommitmentReadinessRecord,
} from './deal-commitment-inspector'
import { DealCommitmentInspector } from './deal-commitment-inspector'
import {
  blockedCommitmentInspectorState,
  dealCommitmentInspectorLabels,
  emptyCommitmentInspectorState,
  errorCommitmentInspectorState,
  loadingCommitmentInspectorState,
  noActivityCommitmentInspectorState,
  noBlockersCommitmentInspectorState,
  noDocumentsCommitmentInspectorState,
  readyCommitmentInspectorState,
} from './deal-commitment-inspector-fixtures'

const renderInspector = (props: Partial<ComponentProps<typeof DealCommitmentInspector>> = {}) =>
  render(
    <DealCommitmentInspector
      {...({
        labels: dealCommitmentInspectorLabels,
        state: blockedCommitmentInspectorState,
        ...props,
      } as ComponentProps<typeof DealCommitmentInspector>)}
    />,
  )

const expectInspectorState = (_state: DealCommitmentInspectorState) => undefined
const expectInspectorProps = (_props: DealCommitmentInspectorProps) => undefined
const expectEvidenceItem = (_item: DealCommitmentEvidenceItem) => undefined
const expectTone = (_tone: DealCommitmentInspectorTone) => undefined
const expectActionEvent = (_event: DealCommitmentInspectorActionEvent) => undefined
const expectSharedReadinessKey = (_key: CommitmentReadinessKey) => undefined
const expectInspectorReadinessKey = (_key: DealCommitmentReadinessKey) => undefined
const forbiddenRouteImportPattern = /from\s+['"][^'"]*(?:trpc|tRPC|router|backend)[^'"]*['"]/i
const consoleStatementPattern = /console\.(?:log|warn|error)/
const rawTailwindPalettePattern =
  /\b(?:bg|border|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-(?:amber|blue|brown|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/

// @ts-expect-error Loading state cannot carry ready investor data.
expectInspectorState({ kind: 'loading', investor: blockedCommitmentInspectorState.investor })

// @ts-expect-error Ready state requires investor and readiness sections.
expectInspectorState({ activity: [], blockers: [], documents: [], kind: 'ready' })

// @ts-expect-error Retryable error state requires an action handler.
expectInspectorProps({
  labels: dealCommitmentInspectorLabels,
  state: errorCommitmentInspectorState,
})

expectTone('neutral')
expectTone('attention')

// @ts-expect-error Tone values must remain constrained to semantic token states.
expectTone('blocked')

expectActionEvent({ kind: 'retry' })

// @ts-expect-error The inspector baseline does not expose fake mutation events.
expectActionEvent({ kind: 'requestEvidence' })

const sharedReadinessKey: CommitmentReadinessKey = 'wire'
const inspectorReadinessKey: DealCommitmentReadinessKey = sharedReadinessKey
expectSharedReadinessKey(inspectorReadinessKey)
expectInspectorReadinessKey(inspectorReadinessKey)

// @ts-expect-error Readiness requires all four investor-readiness rows.
const _incompleteReadiness: DealCommitmentReadinessRecord = {
  kycKyb: blockedCommitmentInspectorState.readiness.kycKyb,
}

const _mismatchedReadiness: DealCommitmentReadinessRecord = {
  ...blockedCommitmentInspectorState.readiness,
  // @ts-expect-error Readiness record keys and inner semantic keys must match.
  wire: { ...blockedCommitmentInspectorState.readiness.wire, key: 'signature' },
}

expectEvidenceItem({
  id: 'typed-document',
  label: 'Typed document',
  owner: 'Legal ops',
  requirementLabel: 'Required',
  status: { kind: 'missing', label: 'Missing' },
})

expectEvidenceItem({
  id: 'typed-document',
  label: 'Typed document',
  owner: 'Legal ops',
  requirementLabel: 'Required',
  // @ts-expect-error Evidence status tone is derived from status.kind.
  status: { kind: 'missing', label: 'Missing', tone: 'danger' },
})

const walk = async (directory: string): Promise<readonly string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const children = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        return walk(fullPath)
      }

      return ['.ts', '.tsx'].includes(extname(entry.name)) ? [fullPath] : []
    }),
  )

  return children.flat()
}

const readInspectorSource = async () => {
  const directory = join(process.cwd(), 'src/commitment/deal-commitment-inspector')
  const files = await walk(directory)
  const sources = await Promise.all(files.map((file) => readFile(file, 'utf8')))

  return sources.join('\n')
}

describe('DealCommitmentInspector', () => {
  it('uses the provided title as the root accessible name', () => {
    renderInspector()

    expect(
      screen.getByRole('region', { name: dealCommitmentInspectorLabels.title }),
    ).toBeInTheDocument()
  })

  it('uses the shared commitment readiness key order', () => {
    expect(commitmentReadinessKeys).toEqual(['kycKyb', 'signature', 'wire', 'reconciliation'])
  })

  it('renders investor identity, commitment summary, status, and next action', () => {
    renderInspector()

    expect(screen.getByRole('heading', { name: 'Meridian Ventures' })).toBeInTheDocument()
    expect(screen.getByText('Meridian Ventures II LP')).toBeInTheDocument()
    expect(screen.getByText('closing@meridian.example')).toBeInTheDocument()
    expect(screen.getByText('€1,250,000 commitment')).toBeInTheDocument()
    expect(screen.getByText('Needs attention')).toHaveAttribute('data-tone', 'attention')
    expect(screen.getAllByText('Updated 13 May 2026')[0]).toHaveAttribute(
      'datetime',
      '2026-05-13T09:20:00.000Z',
    )
    expect(screen.getByRole('heading', { name: 'Next action' })).toBeInTheDocument()
    expect(
      screen.getByText('Collect KYB evidence before signature completion.'),
    ).toBeInTheDocument()
  })

  it('renders readiness breakdown rows with details and metadata', () => {
    const { container } = renderInspector()

    expect(screen.getByRole('heading', { name: 'Readiness breakdown' })).toBeInTheDocument()
    expect(screen.getByText('KYC/KYB')).toBeInTheDocument()
    expect(screen.getByText('KYC approved · KYB pending review')).toHaveAttribute(
      'data-tone',
      'attention',
    )
    expect(
      screen.getByText('Individual KYC is approved. Entity KYB is pending the UBO declaration.'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Package sent')[0]).toHaveAttribute('data-tone', 'info')
    expect(screen.getByText('Not received')).toHaveAttribute('data-tone', 'pending')
    expect(screen.getAllByText('Pending')[0]).toHaveAttribute('data-tone', 'pending')
    expect(container.querySelectorAll('[data-slot="deal-commitment-readiness-item"]')).toHaveLength(
      4,
    )
  })

  it('renders related blockers with visible severity and facts', () => {
    const { container } = renderInspector()

    expect(screen.getByRole('heading', { name: 'Related blockers' })).toBeInTheDocument()
    expect(screen.getByText('Beneficial owner evidence is missing')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toHaveAttribute('data-severity', 'critical')
    expect(screen.getAllByText('Legal ops').length).toBeGreaterThan(0)
    expect(screen.getByText('Commitments -> evidence review')).toBeInTheDocument()
    expect(screen.getAllByText('Due 18 May 2026').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-blocker-id="meridian-kyb-evidence"]')).toHaveAttribute(
      'data-severity',
      'critical',
    )
  })

  it('renders related documents and evidence with closing impact and activity timestamps', () => {
    renderInspector()

    expect(screen.getByRole('heading', { name: 'Related evidence' })).toBeInTheDocument()
    expect(screen.getByText('Meridian UBO declaration')).toBeInTheDocument()
    expect(screen.getByText('Missing')).toHaveAttribute('data-tone', 'attention')
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    expect(screen.getByText('Blocks closing')).toBeInTheDocument()
    expect(screen.getByText('Investor evidence')).toBeInTheDocument()
    expect(screen.getAllByText('Updated 13 May 2026')[1]).toHaveAttribute(
      'datetime',
      '2026-05-13T09:20:00.000Z',
    )
  })

  it('renders recent investor activity with semantic time elements', () => {
    const { container } = renderInspector()

    expect(screen.getByRole('heading', { name: 'Recent investor activity' })).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('13 May 2026, 11:20')).toHaveAttribute(
      'datetime',
      '2026-05-13T09:20:00.000Z',
    )
    expect(
      screen.getByText(
        'Asked legal ops to collect the signed UBO declaration before countersignature.',
      ),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="deal-commitment-activity-item"]')).toHaveLength(
      3,
    )
  })

  it('renders empty labels for no blockers, no documents, and no activity', () => {
    const noBlockersRender = renderInspector({ state: noBlockersCommitmentInspectorState })

    expect(screen.getByText('No investor-specific blockers.')).toBeInTheDocument()
    expect(
      noBlockersRender.container.querySelectorAll('[data-slot="deal-commitment-blocker"]'),
    ).toHaveLength(0)
    noBlockersRender.unmount()

    const noDocumentsRender = renderInspector({ state: noDocumentsCommitmentInspectorState })

    expect(screen.getByText('No related evidence.')).toBeInTheDocument()
    expect(
      noDocumentsRender.container.querySelectorAll('[data-slot="deal-commitment-document"]'),
    ).toHaveLength(0)
    noDocumentsRender.unmount()

    const noActivityRender = renderInspector({ state: noActivityCommitmentInspectorState })

    expect(screen.getByText('No recent investor activity.')).toBeInTheDocument()
    expect(
      noActivityRender.container.querySelectorAll('[data-slot="deal-commitment-activity-item"]'),
    ).toHaveLength(0)
  })

  it('renders ready state without an open next action', () => {
    renderInspector({ state: readyCommitmentInspectorState })

    expect(screen.getByRole('heading', { name: 'Solenne Family Office' })).toBeInTheDocument()
    expect(screen.getByText('Ready to close')).toHaveAttribute('data-tone', 'success')
    expect(screen.getByText('No investor-specific action is open.')).toBeInTheDocument()
    expect(screen.getByText('No investor-specific blockers.')).toBeInTheDocument()
  })

  it('renders loading, error, and empty lifecycle states without stale ready content', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const loadingRender = renderInspector({ state: loadingCommitmentInspectorState })

    expect(
      loadingRender.container.querySelector('[data-slot="deal-commitment-inspector"]'),
    ).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { name: 'Loading Meridian commitment' })).toBeInTheDocument()
    expect(screen.queryByText('Meridian Ventures')).not.toBeInTheDocument()
    loadingRender.unmount()

    const errorRender = renderInspector({
      onAction,
      state: errorCommitmentInspectorState,
    })

    expect(screen.getByText('Commitment inspector could not be loaded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'retry' })
    expect(screen.queryByText('Meridian Ventures')).not.toBeInTheDocument()
    errorRender.unmount()

    renderInspector({ state: emptyCommitmentInspectorState })

    expect(screen.getByRole('heading', { name: 'No commitment selected' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Select an investor commitment to inspect readiness, blockers, and evidence.',
      ),
    ).toBeInTheDocument()
  })

  it.each([
    ['ready', blockedCommitmentInspectorState],
    ['loading', loadingCommitmentInspectorState],
    ['error', errorCommitmentInspectorState],
    ['empty', emptyCommitmentInspectorState],
  ] as const)('has no accessibility violations for %s state', async (_name, state) => {
    const { container } =
      state.kind === 'error'
        ? renderInspector({ onAction: vi.fn(), state })
        : renderInspector({ state })

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('has no accessibility violations in dark mode context', async () => {
    const { container } = render(
      <div className="dark bg-background p-6" data-theme="dark">
        <DealCommitmentInspector
          labels={dealCommitmentInspectorLabels}
          state={blockedCommitmentInspectorState}
        />
      </div>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('keeps package boundaries and baseline guardrails out of the inspector source', async () => {
    const source = await readInspectorSource()

    expect(source).not.toContain('from ' + "'apps/web")
    expect(source).not.toContain('from ' + "'@repo/" + 'domain')
    expect(source).not.toMatch(forbiddenRouteImportPattern)
    expect(source).not.toMatch(consoleStatementPattern)
    expect(source).not.toMatch(rawTailwindPalettePattern)
  })

  it('exports the component from the root package without exposing fixtures', () => {
    expect(Kit.DealCommitmentInspector).toBeTypeOf('function')
    expect('dealCommitmentInspectorLabels' in Kit).toBe(false)
    expect('blockedCommitmentInspectorState' in Kit).toBe(false)
  })
})
