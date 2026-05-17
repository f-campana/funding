import { expect, type Page, test } from '@playwright/test'

const COMMITTED_AMOUNT_PATTERN = /4,850,000/
const INTERNAL_ROUTE_COPY_PATTERN =
  /rebuild|baseline|scaffold|placeholder|Storybook-first|adapter not wired|Deferred|Removed|mission-control|mission control|admin dashboard/i

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

async function expectPlaceholder(page: Page, sectionLabel: string) {
  const placeholder = page.locator('[data-slot="deal-rebuild-placeholder"]')
  await expect(placeholder).toBeVisible()
  await expect(placeholder.getByText(sectionLabel, { exact: true })).toBeVisible()
  await expect(
    placeholder.getByRole('heading', { name: 'Deal Workspace rebuild in progress' }),
  ).toBeVisible()
  await expect(
    placeholder.getByText('Accepted kit baselines are available in Storybook'),
  ).toBeVisible()
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

async function expectAboutOverview(page: Page) {
  await expect(page.locator('[data-slot="deal-rebuild-placeholder"]')).toHaveCount(0)
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
  await expect(capital.getByText(COMMITTED_AMOUNT_PATTERN)).toBeVisible()
  await expect(capital.getByText('€4,850,000 committed')).toBeVisible()
  await expect(capital.getByText('97% of target committed')).toBeVisible()
  await expect(capital.getByText('Net investable amount')).toBeVisible()

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

test('homepage renders and redirects the Northstar deal route to about', async ({ page }) => {
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
  await expect(page).toHaveURL('/deals/northstar-energy/about')
  await expectDealShell(page, 'About')
  await expectActiveDealTab(page, 'About')
  await expectAboutOverview(page)
})

test('deal about route renders the operational overview', async ({ page }) => {
  await page.goto('/deals/northstar-energy')

  await expect(page).toHaveURL('/deals/northstar-energy/about')
  await expectDealShell(page, 'About')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expectAboutOverview(page)
  await expectOperationalRail(page)
  await expectActiveDealTab(page, 'About')
})

test('deal about overview avoids mobile page overflow', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/about')

  await expect(page.locator('[data-slot="deal-left-rail"]')).toBeVisible()
  await expectAboutOverview(page)
  await expectOperationalRail(page)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )

  expect(hasHorizontalOverflow).toBe(false)
})

test('deal progression action opens the commitments workflow', async ({ page }) => {
  await page.goto('/deals/northstar-energy/about')

  await page
    .locator('[data-slot="deal-progress-panel"]')
    .getByRole('button', { name: 'Review 3 access requests' })
    .click()

  await expect(page).toHaveURL('/deals/northstar-energy/commitments')
  await expectDealShell(page, 'Commitments')
  await expectActiveDealTab(page, 'Commitments')
})

test('deal section navigation renders placeholder routes', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy/about')

  const tabs = page.getByRole('navigation', { name: 'Deal sections' })

  await tabs.getByRole('link', { name: 'Commitments' }).click()
  await expect(page).toHaveURL('/deals/northstar-energy/commitments')
  await expectDealShell(page, 'Commitments')
  await expectPlaceholder(page, 'Commitments')
  await expectActiveDealTab(page, 'Commitments')

  await tabs.getByRole('link', { name: 'Documents' }).click()
  await expect(page).toHaveURL('/deals/northstar-energy/documents')
  await expectDealShell(page, 'Documents')
  await expectPlaceholder(page, 'Documents')
  await expectActiveDealTab(page, 'Documents')
})

test('unsupported deal route renders the not-found UI', async ({ page }) => {
  await page.goto('/deals/unknown')

  await expect(page.getByRole('heading', { level: 1, name: 'Deal introuvable' })).toBeVisible()
  await expect(page.getByRole('link', { name: "Retour a l'accueil" })).toHaveAttribute('href', '/')
})

test('unsupported nested deal routes render the not-found UI', async ({ page }) => {
  for (const segment of ['about', 'commitments', 'documents']) {
    await page.goto(`/deals/unknown/${segment}`)

    await expect(page.getByRole('heading', { level: 1, name: 'Deal introuvable' })).toBeVisible()
    await expect(page.getByRole('link', { name: "Retour a l'accueil" })).toHaveAttribute(
      'href',
      '/',
    )
  }
})
