import { expect, type Page, test } from '@playwright/test'

const COMMITTED_AMOUNT_PATTERN = /4,850,000\.00/
const COMMITTED_HEADING_PATTERN = /committed/

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

  const overview = page.locator('[data-slot="deal-about-overview"]')
  await expect(overview).toBeVisible()

  const readiness = overview.locator('[data-slot="closing-readiness-summary"]')
  await expect(readiness.getByRole('heading', { name: 'Blocked' })).toBeVisible()
  await expect(readiness.getByText('Resolve critical blockers before close')).toBeVisible()
  await expect(readiness.getByText('5 open blockers')).toBeVisible()
  await expect(readiness.getByText('Investor identity')).toBeVisible()

  const capital = overview.locator('[data-slot="capital-summary"]')
  await expect(capital.getByRole('heading', { name: COMMITTED_HEADING_PATTERN })).toBeVisible()
  await expect(capital.getByText(COMMITTED_AMOUNT_PATTERN)).toBeVisible()
  await expect(capital.getByText('97% of target')).toBeVisible()
  await expect(capital.getByText('Net investable')).toBeVisible()

  const blockers = overview.locator('[data-slot="closing-blocker-summary"]')
  await expect(
    blockers.getByRole('heading', { name: '5 unresolved closing blockers' }),
  ).toBeVisible()
  await expect(blockers.getByText('Helix wire requires reconciliation')).toBeVisible()
  await expect(blockers.getByText('Closing date needs operator review')).toBeVisible()
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
