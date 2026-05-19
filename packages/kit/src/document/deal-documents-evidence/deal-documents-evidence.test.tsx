import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { axe } from '../../test/axe'
import { DealDocumentsEvidence } from './deal-documents-evidence'
import {
  getDocumentEvidenceItemTone,
  getDocumentsEvidenceTone,
  getDocumentsEvidenceTotals,
  isDocumentEvidenceIssueStatus,
} from './deal-documents-evidence.model'
import type {
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceRequirementKind,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceStatus,
  DealDocumentsEvidenceStatusKind,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'
import {
  dealDocumentsEvidenceLabels,
  defaultDocumentsEvidenceState,
  emptyDocumentsEvidenceState,
  errorDocumentsEvidenceState,
  loadingDocumentsEvidenceState,
  noDocumentsEvidenceState,
  readyDocumentsEvidenceState,
  rejectedExpiredEvidenceState,
  underReviewEvidenceState,
} from './deal-documents-evidence-fixtures'

const forbiddenAppImportPattern =
  /from\s+['"](?:@\/[^'"]*|(?:\.\.\/)*apps\/[^'"]*|@repo\/(?:app|web|domain)(?:\/[^'"]*)?)['"]/
const forbiddenBackendPattern =
  /from\s+['"][^'"]*(?:trpc|tRPC|\/server\/|\/database\/|\/db\/)[^'"]*['"]/
const forbiddenConsolePattern = /console\.(?:log|warn|error)/
const forbiddenRawTailwindPalettePattern =
  /\b(?:bg|border|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-(?:amber|blue|brown|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/

const renderDocumentsEvidence = (
  state: DealDocumentsEvidenceState = defaultDocumentsEvidenceState,
  onAction = vi.fn(),
) =>
  render(
    <DealDocumentsEvidence
      labels={dealDocumentsEvidenceLabels}
      onAction={onAction}
      state={state}
    />,
  )

const expectLifecycleState = (_state: DealDocumentsEvidenceState) => undefined
const expectDocumentsEvidenceProps = (_props: DealDocumentsEvidenceProps) => undefined
const expectDocumentStatus = (_status: DealDocumentsEvidenceStatus) => undefined
const expectStatusKind = (_status: DealDocumentsEvidenceStatusKind) => undefined
const expectTone = (_tone: DealDocumentsEvidenceTone) => undefined
const expectRequirementKind = (_requirement: DealDocumentsEvidenceRequirementKind) => undefined

// @ts-expect-error Loading state cannot carry ready group data.
expectLifecycleState({ groups: defaultDocumentsEvidenceState.groups, kind: 'loading' })

// @ts-expect-error Ready state requires summary.
expectLifecycleState({ groups: defaultDocumentsEvidenceState.groups, kind: 'ready' })

// @ts-expect-error Retryable error state requires an action handler.
expectDocumentsEvidenceProps({
  labels: dealDocumentsEvidenceLabels,
  state: errorDocumentsEvidenceState,
})

expectStatusKind('under_review')

// @ts-expect-error Status kind must stay on the documents evidence vocabulary.
expectStatusKind('reviewing')

expectDocumentStatus({ kind: 'missing', label: 'Missing' })

// @ts-expect-error Document evidence status tone is derived from kind.
expectDocumentStatus({ kind: 'missing', label: 'Missing', tone: 'danger' })

expectTone('pending')

// @ts-expect-error Tone must use existing semantic status vocabulary.
expectTone('warning')

expectRequirementKind('required')

// @ts-expect-error Requirement kind must be required or optional.
expectRequirementKind('conditional')

describe('DealDocumentsEvidence', () => {
  it('renders ready content with title, summary, groups, and document evidence rows', () => {
    const { container } = renderDocumentsEvidence()

    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Closing evidence across generated documents, investor evidence, and vehicle setup.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('9 documents · 4 blocking close · 4 need attention'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Evidence summary' })).toBeInTheDocument()
    expect(screen.getByText('Blocking close')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Generated closing documents' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Investor evidence' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vehicle and target setup' })).toBeInTheDocument()
    expect(screen.getByText('Meridian UBO declaration')).toBeInTheDocument()
    expect(screen.getByText('Helix source-of-funds packet')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="deal-documents-evidence-group"]')).toHaveLength(
      3,
    )
    expect(
      container.querySelectorAll('[data-slot="deal-documents-evidence-document"]'),
    ).toHaveLength(9)
  })

  it('renders status, owner, requirement, blocking, investor, due, activity, and visibility facts', () => {
    const { container } = renderDocumentsEvidence()

    expect(screen.getAllByText('Missing').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Blocks closing').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Legal ops').length).toBeGreaterThan(0)
    expect(screen.getByText('Meridian Ventures')).toBeInTheDocument()
    expect(screen.getAllByText('Due 18 May 2026').length).toBeGreaterThan(0)
    expect(screen.getByText('Requested 13 May 2026')).toBeInTheDocument()
    expect(screen.getAllByText('Investor evidence').length).toBeGreaterThan(0)
    expect(
      container.querySelector(
        '[data-slot="deal-documents-evidence-document"][data-status="missing"][data-tone="danger"]',
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="deal-documents-evidence-document"][data-requirement="optional"]',
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        '[data-slot="deal-documents-evidence-document"][data-blocks-closing="true"]',
      ),
    ).toBeInTheDocument()
  })

  it('renders due dates and last activity with time elements when dateTime is supplied', () => {
    const { container } = renderDocumentsEvidence()

    expect(container.querySelector('time[datetime="2026-05-18T12:00:00.000Z"]')).toHaveTextContent(
      'Due 18 May 2026',
    )
    expect(container.querySelector('time[datetime="2026-05-13T09:20:00.000Z"]')).toHaveTextContent(
      'Requested 13 May 2026',
    )
  })

  it('renders loading as a named busy skeleton state without ready content', () => {
    const { container } = renderDocumentsEvidence(loadingDocumentsEvidenceState)

    expect(container.querySelector('[data-slot="deal-documents-evidence"]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByText('Meridian UBO declaration')).not.toBeInTheDocument()
  })

  it('renders an error state and fires retry through the stable action event', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderDocumentsEvidence(errorDocumentsEvidenceState, onAction)

    expect(screen.getByText('Documents evidence could not be loaded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onAction).toHaveBeenCalledWith({ kind: 'retry' })
  })

  it('renders a non-retryable error without an action handler', () => {
    render(
      <DealDocumentsEvidence
        labels={dealDocumentsEvidenceLabels}
        state={{ kind: 'error', title: 'No retry available' }}
      />,
    )

    expect(screen.getByText('No retry available')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders empty and ready-with-no-documents states safely', () => {
    const { rerender } = render(
      <DealDocumentsEvidence
        labels={dealDocumentsEvidenceLabels}
        state={emptyDocumentsEvidenceState}
      />,
    )

    expect(screen.getByRole('heading', { name: 'No document evidence yet' })).toBeInTheDocument()
    expect(screen.queryByText('Evidence groups')).not.toBeInTheDocument()

    rerender(
      <DealDocumentsEvidence
        labels={dealDocumentsEvidenceLabels}
        state={noDocumentsEvidenceState}
      />,
    )

    expect(
      screen.getByText('0 documents · 0 blocking close · 0 need attention'),
    ).toBeInTheDocument()
    expect(screen.getByText('No document evidence is ready for display.')).toBeInTheDocument()
  })

  it('does not render fake upload, review, approval, or request action controls in ready states', () => {
    renderDocumentsEvidence()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('Upload')).not.toBeInTheDocument()
    expect(screen.queryByText('Approve')).not.toBeInTheDocument()
    expect(screen.queryByText('Request document')).not.toBeInTheDocument()
  })

  it('supports composing the evidence surface from compound parts', () => {
    const group = defaultDocumentsEvidenceState.groups[0]

    if (!group) {
      throw new Error('Expected default documents evidence fixture to include a group')
    }

    const document = group.documents[0]

    if (!document) {
      throw new Error('Expected default documents evidence fixture to include a document')
    }

    const titleId = 'composed-documents-title'
    const { container } = render(
      <DealDocumentsEvidence.Root aria-labelledby={titleId} state={defaultDocumentsEvidenceState}>
        <DealDocumentsEvidence.Header
          headline={defaultDocumentsEvidenceState.summary.headlineLabel}
          state={defaultDocumentsEvidenceState}
          subtitle={dealDocumentsEvidenceLabels.subtitle}
          title="Composed documents"
          titleId={titleId}
        />
        <DealDocumentsEvidence.Summary title="Composed summary">
          <DealDocumentsEvidence.Metric metric={defaultDocumentsEvidenceState.summary.metrics[0]} />
        </DealDocumentsEvidence.Summary>
        <DealDocumentsEvidence.Groups
          emptyLabel={dealDocumentsEvidenceLabels.noGroupsLabel}
          title="Composed groups"
        >
          <DealDocumentsEvidence.Group group={group} labels={dealDocumentsEvidenceLabels}>
            <DealDocumentsEvidence.Document
              document={document}
              labels={dealDocumentsEvidenceLabels}
            />
          </DealDocumentsEvidence.Group>
        </DealDocumentsEvidence.Groups>
      </DealDocumentsEvidence.Root>,
    )

    expect(screen.getByRole('heading', { name: 'Composed documents' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Composed summary' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Composed groups' })).toBeInTheDocument()
    expect(screen.getByText(document.label)).toBeInTheDocument()
    expect(
      container.querySelectorAll('[data-slot="deal-documents-evidence-document"]'),
    ).toHaveLength(1)
  })

  it('keeps model totals and semantic tone helpers aligned with document status data', () => {
    expect(getDocumentsEvidenceTotals(defaultDocumentsEvidenceState.groups)).toEqual({
      blocking: 4,
      issues: 4,
      total: 9,
    })
    expect(getDocumentsEvidenceTone(defaultDocumentsEvidenceState)).toBe('danger')
    expect(getDocumentsEvidenceTone(readyDocumentsEvidenceState)).toBe('success')
    expect(getDocumentsEvidenceTone(noDocumentsEvidenceState)).toBe('neutral')
    expect(
      getDocumentEvidenceItemTone({
        blocksClosing: true,
        status: { kind: 'missing', label: 'Missing' },
      }),
    ).toBe('danger')
    expect(
      getDocumentEvidenceItemTone({
        blocksClosing: false,
        status: { kind: 'missing', label: 'Missing' },
      }),
    ).toBe('attention')
    expect(isDocumentEvidenceIssueStatus('under_review')).toBe(true)
    expect(isDocumentEvidenceIssueStatus('uploaded')).toBe(false)
  })

  it.each([
    ['ready', defaultDocumentsEvidenceState],
    ['loading', loadingDocumentsEvidenceState],
    ['error', errorDocumentsEvidenceState],
    ['empty', emptyDocumentsEvidenceState],
    ['rejected and expired', rejectedExpiredEvidenceState],
    ['under review', underReviewEvidenceState],
  ] as const)('has no accessibility violations for %s state', async (_name, state) => {
    const { container } = renderDocumentsEvidence(state)

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('has no accessibility violations in dark mode context', async () => {
    const { container } = render(
      <div className="dark bg-background p-6" data-theme="dark">
        <DealDocumentsEvidence
          labels={dealDocumentsEvidenceLabels}
          state={defaultDocumentsEvidenceState}
        />
      </div>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('keeps the document kit boundary free of app, backend, domain, console, and raw palette imports', () => {
    const directory = join(process.cwd(), 'src/document/deal-documents-evidence')
    const contents = readdirSync(directory)
      .filter((fileName) => fileName.endsWith('.ts') || fileName.endsWith('.tsx'))
      .map((fileName) => readFileSync(join(directory, fileName), 'utf8'))
      .join('\n')

    expect(contents).not.toMatch(forbiddenAppImportPattern)
    expect(contents).not.toMatch(forbiddenBackendPattern)
    expect(contents).not.toMatch(forbiddenConsolePattern)
    expect(contents).not.toMatch(forbiddenRawTailwindPalettePattern)
  })
})
