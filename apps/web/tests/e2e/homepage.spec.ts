import { expect, type Page, test } from '@playwright/test'

const COMMITTED_AMOUNT_PATTERN = /4,850,000/
const FAKE_DOCUMENT_ACTION_PATTERN =
  /upload|request document|approve|reject|mark reviewed|resolve blocker|send reminder/i
const FAKE_INSPECTOR_ACTION_PATTERN = /send reminder|request evidence|approve|match wire/i
const INTERNAL_ROUTE_COPY_PATTERN =
  /rebuild|baseline|scaffold|placeholder|Storybook|adapter not wired|not wired|fake|demo-only|Deferred|Removed|mission-control|mission control|admin dashboard/i

async function expectActiveDealTab(page: Page, name: string) {
  await expect(
    page.getByRole('navigation', { name: 'Deal sections' }).getByRole('link', { name }),
  ).toHaveAttribute('aria-current', 'page')
}

async function expectDealShell(page: Page, activeModule: string) {
  const leftRail = page.locator('[data-slot="deal-left-rail"]')
  await expect(leftRail).toBeVisible()
  await expect(leftRail.getByRole('link', { name: activeModule })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.locator('[data-slot="deal-entity-header"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Northstar Energy SPV' })).toBeVisible()
}

async function expectCommitmentsTable(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Commitments workflow not available yet' }),
  ).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(INTERNAL_ROUTE_COPY_PATTERN)

  const table = page.locator('[data-slot="deal-commitments-table"]')
  await expect(table).toBeVisible()
  await expect(table.getByRole('heading', { name: 'Commitments' })).toBeVisible()
  await expect(
    table.getByText('Investor readiness across KYC/KYB, signature, and wire'),
  ).toBeVisible()
  await expect(table.getByLabel('Search investors')).toBeVisible()
  await expect(table.locator('[data-slot="commitments-workflow-filters"]')).toBeVisible()
  await expect(table.getByRole('table', { name: 'Commitments' })).toBeVisible()
  await expect(table.getByText('Investor', { exact: true })).toBeVisible()
  await expect(table.getByText('Commitment', { exact: true })).toBeVisible()
  await expect(table.getByText('KYC/KYB', { exact: true })).toBeVisible()
  await expect(table.getByText('Signature', { exact: true })).toBeVisible()
  await expect(table.getByText('Wire', { exact: true })).toBeVisible()
  await expect(commitmentRow(page, 'Alba Family Office')).toBeVisible()
  await expect(commitmentRow(page, 'Meridian Ventures')).toBeVisible()
  await expect(commitmentRow(page, 'Riverbend Holdings')).toBeVisible()
  await expect(table.getByText('Alba FO SARL')).toBeVisible()
  await expect(table.getByText('Meridian Ventures II LP')).toBeVisible()
  await expect(table.getByText('€1,500,000')).toBeVisible()
  await expect(table.getByText('Overall committed €4,850,000')).toBeVisible()
  await expect(table).toContainText('Verified')
  await expect(table).toContainText('Signed')
  await expect(commitmentRow(page, 'Alba Family Office')).toContainText('Reconciled')
  await expect(commitmentRow(page, 'Julien Moreau')).toContainText('Matched')
  await expect(commitmentRow(page, 'Julien Moreau')).toContainText('In progress')
  await expect(commitmentRow(page, 'Julien Moreau')).not.toContainText('Reconciled')
  await expect(table).toContainText('Ready for closing review')
  await expect(table).toContainText('Needs attention')
}

async function expectDocumentsEvidence(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Documents workflow not available yet' }),
  ).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(INTERNAL_ROUTE_COPY_PATTERN)

  const evidence = page.locator('[data-slot="deal-documents-evidence"]')
  await expect(evidence).toBeVisible()
  await expect(evidence).toHaveAttribute('data-state', 'ready')
  await expect(evidence).toHaveAttribute('data-tone', 'danger')
  await expect(evidence.getByRole('heading', { exact: true, name: 'Documents' })).toBeVisible()
  await expect(
    evidence.getByText(
      'Closing evidence across generated documents, investor evidence, and vehicle setup.',
    ),
  ).toBeVisible()
  await expect(evidence.locator('[data-slot="deal-documents-evidence-headline"]')).toContainText(
    '9 documents · 4 blocking close · 4 document issues',
  )
  await expect(evidence.locator('[data-slot="deal-documents-evidence-summary"]')).toContainText(
    'Blocking close',
  )
  await expect(evidence.locator('[data-slot="deal-documents-evidence-summary"]')).toContainText(
    'Rejected/expired',
  )

  const groups = evidence.locator('[data-slot="deal-documents-evidence-group"]')
  await expect(groups).toHaveCount(3)
  await expect(evidence.getByRole('heading', { name: 'Generated closing documents' })).toBeVisible()
  await expect(evidence.getByRole('heading', { name: 'Investor evidence' })).toBeVisible()
  await expect(evidence.getByRole('heading', { name: 'Vehicle and target setup' })).toBeVisible()
  await expect(groups.filter({ hasText: 'Generated closing documents' })).toContainText(
    'Protected close room',
  )
  await expect(groups.filter({ hasText: 'Investor evidence' })).toContainText('Internal operations')
  await expect(groups.filter({ hasText: 'Vehicle and target setup' })).toContainText(
    'Investor-visible data room',
  )

  const meridianDocument = evidence.locator(
    '[data-slot="deal-documents-evidence-document"][data-document-id="doc-meridian-ubo"]',
  )
  await expect(meridianDocument).toBeVisible()
  await expect(meridianDocument).toHaveAttribute('data-status', 'missing')
  await expect(meridianDocument).toHaveAttribute('data-tone', 'danger')
  await expect(meridianDocument).toHaveAttribute('data-blocks-closing', 'true')
  await expect(meridianDocument).toContainText('Missing')
  await expect(meridianDocument).toContainText('Blocks closing')
  await expect(meridianDocument).toContainText('Related investor')
  await expect(meridianDocument).toContainText('Meridian Ventures')

  const subscriptionBulletin = evidence.locator(
    '[data-slot="deal-documents-evidence-document"][data-document-id="doc-subscription-bulletin"]',
  )
  await expect(subscriptionBulletin).toHaveAttribute('data-status', 'under_review')
  await expect(subscriptionBulletin).toContainText('Under review')

  const albaIdentity = evidence.locator(
    '[data-slot="deal-documents-evidence-document"][data-document-id="doc-alba-identity"]',
  )
  await expect(albaIdentity).toHaveAttribute('data-status', 'approved')
  await expect(albaIdentity).toContainText('Approved')
  await expect(albaIdentity).toContainText('Cleared for closing')
  await expect(albaIdentity).toContainText('Alba Family Office')

  const riverbendProof = evidence.locator(
    '[data-slot="deal-documents-evidence-document"][data-document-id="doc-riverbend-proof-address"]',
  )
  await expect(riverbendProof).toHaveAttribute('data-status', 'expired')
  await expect(riverbendProof).toContainText('Expired')
  await expect(riverbendProof).toContainText('Riverbend Holdings')

  const targetLegalPack = evidence.locator(
    '[data-slot="deal-documents-evidence-document"][data-document-id="doc-target-legal-pack"]',
  )
  await expect(targetLegalPack).toHaveAttribute('data-status', 'rejected')
  await expect(targetLegalPack).toContainText('Rejected')
  await expect(targetLegalPack).toContainText('Blocks closing')

  await expect(evidence.getByRole('button', { name: FAKE_DOCUMENT_ACTION_PATTERN })).toHaveCount(0)
}

function commitmentRow(page: Page, investorName: string) {
  return page.locator('[data-slot="commitment-investor-row"]').filter({ hasText: investorName })
}

function commitmentInspectorPanel(page: Page) {
  return page.getByRole('dialog', { name: 'Commitment details' })
}

async function expectCommitmentInspectorClosed(page: Page) {
  await expect(commitmentInspectorPanel(page)).toHaveCount(0)
  await expect(page.locator('[data-slot="deal-commitment-inspector-panel"]')).toHaveCount(0)
  await expect(page.locator('[data-slot="deal-commitment-inspector"]')).toHaveCount(0)
  await expect(page.getByText('No commitment selected')).toHaveCount(0)
  await expect(page.getByText('Open an investor to inspect blockers and evidence.')).toHaveCount(0)
}

async function openMeridianInspectorWithKeyboard(page: Page) {
  const meridianRow = commitmentRow(page, 'Meridian Ventures')

  await expect(meridianRow).toBeVisible()
  await page.getByRole('button', { name: 'Open Meridian Ventures commitment' }).focus()
  await page.keyboard.press('Enter')
  await expect(meridianRow).toHaveAttribute('data-active', 'true')
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'true')
  await expect(commitmentInspectorPanel(page)).toBeVisible()
  await expect(commitmentInspectorPanel(page).getByText('Inspect investor readiness')).toBeVisible()
  await expect(
    commitmentInspectorPanel(page).getByRole('button', { name: 'Close commitment inspector' }),
  ).toBeVisible()
}

async function expectMeridianCommitmentInspector(page: Page) {
  const inspector = commitmentInspectorPanel(page).locator(
    '[data-slot="deal-commitment-inspector"]',
  )

  await expect(inspector).toHaveAttribute('data-state', 'ready')
  await expect(inspector.getByRole('heading', { name: 'Meridian Ventures' })).toBeVisible()
  await expect(inspector.getByText('Meridian Ventures II LP')).toBeVisible()
  await expect(inspector.getByText('closing@meridian.example')).toBeVisible()
  await expect(inspector.getByText('€1,250,000 commitment')).toBeVisible()
  await expect(inspector.locator('[data-slot="deal-commitment-readiness"]')).toContainText(
    'KYC: Approved',
  )
  await expect(inspector.locator('[data-slot="deal-commitment-readiness"]')).toContainText(
    'KYB: Pending review',
  )
  await expect(inspector.locator('[data-slot="deal-commitment-blockers"]')).toContainText(
    'Meridian KYB evidence incomplete',
  )
  await expect(inspector.locator('[data-slot="deal-commitment-documents"]')).toContainText(
    'Meridian UBO declaration',
  )
  await expect(inspector.locator('[data-slot="deal-commitment-activity"]')).toContainText(
    'Meridian Ventures needs KYB evidence before signature completion.',
  )
  await expect(inspector.getByRole('button', { name: FAKE_INSPECTOR_ACTION_PATTERN })).toHaveCount(
    0,
  )
}

async function expectOperationalRail(page: Page) {
  const rail = page.locator('[data-slot="deal-operational-rail"]')
  await expect(rail).toBeVisible()
  await expect(rail.locator('[data-slot="deal-progress-panel"]')).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Deal progression' })).toBeVisible()
  await expect(rail.getByText('Closing review')).toBeVisible()
  await expect(rail.getByText(COMMITTED_AMOUNT_PATTERN)).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Operational snapshot' })).toBeVisible()
  await expect(rail.getByText('Blocked', { exact: true })).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Exception queue' })).toBeVisible()
  await expect(rail.getByText('Critical blockers', { exact: true })).toBeVisible()
}

async function expectOperationalOverview(page: Page) {
  await expect(
    page.getByRole('heading', { name: 'Overview workflow not available yet' }),
  ).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(INTERNAL_ROUTE_COPY_PATTERN)

  const overview = page.locator('[data-slot="deal-operational-overview"]')
  await expect(overview).toBeVisible()
  await expect(overview).toHaveAttribute('data-state', 'ready')
  await expect(overview).toHaveAttribute('data-readiness-state', 'blocked')
  await expect(overview.getByRole('heading', { name: 'Overview' })).toBeVisible()
  await expect(overview.getByText('Blocked from close')).toBeVisible()

  const readiness = overview.locator('[data-slot="deal-operational-readiness"]')
  await expect(readiness.getByRole('heading', { name: 'Closing readiness' })).toBeVisible()
  await expect(
    readiness.getByText('Resolve blocking operational exceptions before close'),
  ).toBeVisible()
  await expect(readiness.getByText('Investor identity')).toBeVisible()
  await expect(readiness.getByText('Critical')).toBeVisible()
  await expect(readiness.getByText('Warning')).toBeVisible()
  await expect(readiness.getByText('Info')).toBeVisible()

  const capital = overview.locator('[data-slot="deal-operational-capital"]')
  await expect(capital.getByRole('heading', { name: 'Capital reconciliation' })).toBeVisible()
  await expect(capital.getByText('€300,000 unmatched received')).toBeVisible()
  await expect(capital.getByText('€3,950,000 received')).toBeVisible()
  await expect(capital.getByText('€3,650,000 matched funds')).toBeVisible()
  await expect(
    capital.getByText('92% of received capital matched; finance acceptance pending'),
  ).toBeVisible()
  await expect(capital.getByText('Exception evidence')).toBeVisible()
  await expect(capital.getByText('Unreceived signed')).toBeVisible()
  await expect(capital.getByText('€450,000 signed not received')).toBeVisible()
  await expect(capital).not.toContainText('€4,850,000 committed')
  await expect(capital).not.toContainText('97% of target committed')
  await expect(capital).not.toContainText('Net investable amount')

  const blockers = overview.locator('[data-slot="deal-operational-blockers"]')
  await expect(blockers.getByRole('heading', { name: 'Priority blockers' })).toBeVisible()
  await expect(blockers.getByText('Helix wire requires reconciliation')).toBeVisible()
  await expect(blockers.getByText('Closing date needs operator review')).toBeVisible()
  await expect(blockers.getByText('Meridian KYB evidence incomplete')).toBeVisible()

  const activity = overview.locator('[data-slot="deal-operational-activity"]')
  await expect(activity.getByRole('heading', { name: 'Latest activity' })).toBeVisible()
  await expect(
    activity.getByText('Alba Family Office completed the subscription package.'),
  ).toBeVisible()
}

test('homepage renders and redirects the Northstar deal route to overview', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Funding, etude frontend de marches prives',
    }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const dealLink = page.getByRole('link', { name: 'Ouvrir le deal Northstar Energy' })
  await expect(dealLink).toHaveAttribute('href', '/deals/northstar-energy')

  await dealLink.click()
  await expect(page).toHaveURL('/deals/northstar-energy/overview')
  await expectDealShell(page, 'Overview')
  await expectActiveDealTab(page, 'Overview')
  await expectOperationalOverview(page)
})

test('deal overview route renders the operational overview', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy')

  await expect(page).toHaveURL('/deals/northstar-energy/overview')
  await expectDealShell(page, 'Overview')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expectOperationalOverview(page)
  await expectOperationalRail(page)
  await expectActiveDealTab(page, 'Overview')

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )

  expect(hasHorizontalOverflow).toBe(false)
})

test('legacy deal about route redirects to overview', async ({ page }) => {
  await page.goto('/deals/northstar-energy/about')

  await expect(page).toHaveURL('/deals/northstar-energy/overview')
  await expectDealShell(page, 'Overview')
  await expectOperationalOverview(page)
  await expectActiveDealTab(page, 'Overview')
})

test('deal overview avoids page overflow and keeps main content before rail on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/overview')

  await expect(page.locator('[data-slot="deal-left-rail"]')).toBeVisible()
  await expectOperationalOverview(page)
  await expectOperationalRail(page)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  const overviewAppearsBeforeRail = await page.evaluate(() => {
    const overview = document.querySelector('[data-slot="deal-operational-overview"]')
    const rail = document.querySelector('[data-slot="deal-operational-rail"]')

    if (!overview || !rail) {
      return false
    }

    return Boolean(overview.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING)
  })

  expect(hasHorizontalOverflow).toBe(false)
  expect(overviewAppearsBeforeRail).toBe(true)
})

test('deal progression action opens the commitments workflow', async ({ page }) => {
  await page.goto('/deals/northstar-energy/overview')

  await page
    .locator('[data-slot="deal-progress-panel"]')
    .getByRole('button', { name: 'Review 3 access requests' })
    .click()

  await expect(page).toHaveURL('/deals/northstar-energy/commitments')
  await expectDealShell(page, 'Commitments')
  await expectActiveDealTab(page, 'Commitments')
  await expectCommitmentsTable(page)
})

test('deal commitments route renders the commitments table', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy/commitments')

  await expect(page).toHaveURL('/deals/northstar-energy/commitments')
  await expectDealShell(page, 'Commitments')
  await expectActiveDealTab(page, 'Commitments')
  await expectCommitmentsTable(page)
  await expectCommitmentInspectorClosed(page)
  await expectOperationalRail(page)
})

test('deal commitments table supports search and workflow filters', async ({ page }) => {
  await page.goto('/deals/northstar-energy/commitments')

  await openMeridianInspectorWithKeyboard(page)
  await expectMeridianCommitmentInspector(page)

  await commitmentInspectorPanel(page)
    .getByRole('button', { name: 'Close commitment inspector' })
    .click()
  await expectCommitmentInspectorClosed(page)

  await page.getByLabel('Search investors').fill('Meridian')
  await expect(commitmentRow(page, 'Meridian Ventures')).toBeVisible()
  await expect(commitmentRow(page, 'Alba Family Office')).toHaveCount(0)
  await expect(page.getByText('1 investor')).toBeVisible()

  await page.getByLabel('Search investors').fill('')
  await page.getByRole('button', { name: 'Wire pending' }).click()
  await expect(commitmentRow(page, 'Meridian Ventures')).toBeVisible()
  await expect(commitmentRow(page, 'Riverbend Holdings')).toBeVisible()
  await expect(commitmentRow(page, 'Alba Family Office')).toHaveCount(0)
  await expectCommitmentInspectorClosed(page)
})

test('deal commitments row opener is keyboard reachable and selection stays separate', async ({
  page,
}) => {
  await page.goto('/deals/northstar-energy/commitments')

  await expectCommitmentInspectorClosed(page)

  const helixRow = commitmentRow(page, 'Helix Capital')
  await expect(helixRow).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select Helix Capital commitment' }).click()
  await expect(helixRow).toHaveAttribute('data-batch-selected', 'true')
  await expect(helixRow).toHaveAttribute('data-drawer-open', 'false')
  await expectCommitmentInspectorClosed(page)

  const meridianRow = commitmentRow(page, 'Meridian Ventures')
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'false')
  await openMeridianInspectorWithKeyboard(page)
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'true')
  await expect(meridianRow).toHaveAttribute('data-batch-selected', 'false')
  await expect(helixRow).toHaveAttribute('data-batch-selected', 'true')
  await expect(helixRow).toHaveAttribute('data-drawer-open', 'false')
  await expectMeridianCommitmentInspector(page)

  await commitmentInspectorPanel(page)
    .getByRole('button', { name: 'Close commitment inspector' })
    .click()
  await expectCommitmentInspectorClosed(page)
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'false')
  await expect(helixRow).toHaveAttribute('data-batch-selected', 'true')
})

test('deal commitments route avoids page overflow and keeps main content before rail on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/commitments')

  await expectDealShell(page, 'Commitments')
  await expectActiveDealTab(page, 'Commitments')
  await expectCommitmentsTable(page)
  await expectOperationalRail(page)
  await openMeridianInspectorWithKeyboard(page)
  await expectMeridianCommitmentInspector(page)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  const commitmentsTableAppearsBeforeRail = await page.evaluate(() => {
    const table = document.querySelector('[data-slot="deal-commitments-table"]')
    const rail = document.querySelector('[data-slot="deal-operational-rail"]')

    if (!table || !rail) {
      return false
    }

    return Boolean(table.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  const closeButtonBox = await commitmentInspectorPanel(page)
    .getByRole('button', { name: 'Close commitment inspector' })
    .boundingBox()

  expect(hasHorizontalOverflow).toBe(false)
  expect(commitmentsTableAppearsBeforeRail).toBe(true)
  expect(closeButtonBox).not.toBeNull()
  expect(closeButtonBox?.x).toBeGreaterThanOrEqual(0)
  expect((closeButtonBox?.x ?? 0) + (closeButtonBox?.width ?? 0)).toBeLessThanOrEqual(390)
})

test('deal documents route renders document evidence', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy/overview')

  const tabs = page.getByRole('navigation', { name: 'Deal sections' })

  await tabs.getByRole('link', { name: 'Documents' }).click()
  await expect(page).toHaveURL('/deals/northstar-energy/documents')
  await expectDealShell(page, 'Documents')
  await expectActiveDealTab(page, 'Documents')
  await expectDocumentsEvidence(page)
  await expectOperationalRail(page)
})

test('deal documents route avoids page overflow and keeps main content before rail on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/documents')

  await expectDealShell(page, 'Documents')
  await expectActiveDealTab(page, 'Documents')
  await expectDocumentsEvidence(page)
  await expectOperationalRail(page)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  const documentsEvidenceAppearsBeforeRail = await page.evaluate(() => {
    const evidence = document.querySelector('[data-slot="deal-documents-evidence"]')
    const rail = document.querySelector('[data-slot="deal-operational-rail"]')

    if (!evidence || !rail) {
      return false
    }

    return Boolean(evidence.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING)
  })

  expect(hasHorizontalOverflow).toBe(false)
  expect(documentsEvidenceAppearsBeforeRail).toBe(true)
})

test('unsupported deal route renders the not-found UI', async ({ page }) => {
  await page.goto('/deals/unknown')

  await expect(page.getByRole('heading', { level: 1, name: 'Deal introuvable' })).toBeVisible()
  await expect(page.getByRole('link', { name: "Retour a l'accueil" })).toHaveAttribute('href', '/')
})

test('unsupported nested deal routes render the not-found UI', async ({ page }) => {
  for (const segment of ['overview', 'about', 'commitments', 'documents']) {
    await page.goto(`/deals/unknown/${segment}`)

    await expect(page.getByRole('heading', { level: 1, name: 'Deal introuvable' })).toBeVisible()
    await expect(page.getByRole('link', { name: "Retour a l'accueil" })).toHaveAttribute(
      'href',
      '/',
    )
  }
})
