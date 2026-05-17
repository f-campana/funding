import { expect, type Page, test } from '@playwright/test'

const COMMITTED_AMOUNT_PATTERN = /4,850,000/
const INTERNAL_ROUTE_COPY_PATTERN =
  /rebuild|baseline|scaffold|placeholder|Storybook-first|adapter not wired|not wired|Deferred|Removed|mission-control|mission control|admin dashboard/i

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

async function expectPendingWorkspaceSection(page: Page, sectionLabel: string) {
  await expect(
    page.getByRole('heading', { name: `${sectionLabel} workflow not available yet` }),
  ).toBeVisible()
  await expect(
    page.getByText(`${sectionLabel} records stay outside the active overview workflow.`),
  ).toBeVisible()
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
  await expect(table).toContainText('Reconciled')
  await expect(table).toContainText('Ready for closing')
  await expect(table).toContainText('Needs attention')
}

function commitmentRow(page: Page, investorName: string) {
  return page.locator('[data-slot="commitment-investor-row"]').filter({ hasText: investorName })
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
  await expect(overview.getByRole('heading', { name: 'Operational overview' })).toBeVisible()
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
  await expect(capital.getByText('€3,650,000 matched')).toBeVisible()
  await expect(capital.getByText('92% of received capital matched')).toBeVisible()
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
  await expectOperationalRail(page)
})

test('deal commitments table supports search and workflow filters', async ({ page }) => {
  await page.goto('/deals/northstar-energy/commitments')

  await page.getByLabel('Search investors').fill('Meridian')
  await expect(commitmentRow(page, 'Meridian Ventures')).toBeVisible()
  await expect(commitmentRow(page, 'Alba Family Office')).toHaveCount(0)
  await expect(page.getByText('1 investor')).toBeVisible()

  await page.getByLabel('Search investors').fill('')
  await page.getByRole('button', { name: 'Wire pending' }).click()
  await expect(commitmentRow(page, 'Meridian Ventures')).toBeVisible()
  await expect(commitmentRow(page, 'Riverbend Holdings')).toBeVisible()
  await expect(commitmentRow(page, 'Alba Family Office')).toHaveCount(0)
})

test('deal commitments row opener is keyboard reachable and selection stays separate', async ({
  page,
}) => {
  await page.goto('/deals/northstar-energy/commitments')

  const meridianRow = commitmentRow(page, 'Meridian Ventures')
  await expect(meridianRow).toBeVisible()
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'false')
  await page.getByRole('button', { name: 'Open Meridian Ventures commitment' }).focus()
  await page.keyboard.press('Enter')
  await expect(meridianRow).toHaveAttribute('data-drawer-open', 'true')

  const helixRow = commitmentRow(page, 'Helix Capital')
  await expect(helixRow).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select Helix Capital commitment' }).click()
  await expect(helixRow).toHaveAttribute('data-batch-selected', 'true')
  await expect(helixRow).toHaveAttribute('data-drawer-open', 'false')
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

  expect(hasHorizontalOverflow).toBe(false)
  expect(commitmentsTableAppearsBeforeRail).toBe(true)
})

test('deal section navigation keeps documents pending', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy/overview')

  const tabs = page.getByRole('navigation', { name: 'Deal sections' })

  await tabs.getByRole('link', { name: 'Documents' }).click()
  await expect(page).toHaveURL('/deals/northstar-energy/documents')
  await expectDealShell(page, 'Documents')
  await expectPendingWorkspaceSection(page, 'Documents')
  await expectActiveDealTab(page, 'Documents')
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
