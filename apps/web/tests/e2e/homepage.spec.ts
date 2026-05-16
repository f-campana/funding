import { expect, type Page, test } from '@playwright/test'

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

async function expectOperationalRailPlaceholder(page: Page) {
  const rail = page.locator('[data-slot="deal-operational-rail"]')
  await expect(rail).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Workspace status' })).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Cleanup scope' })).toBeVisible()
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
  await expectPlaceholder(page, 'About')
})

test('deal about route renders the temporary workspace shell', async ({ page }) => {
  await page.goto('/deals/northstar-energy')

  await expect(page).toHaveURL('/deals/northstar-energy/about')
  await expectDealShell(page, 'About')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expectPlaceholder(page, 'About')
  await expectOperationalRailPlaceholder(page)
  await expectActiveDealTab(page, 'About')
})

test('deal placeholder shell avoids mobile page overflow', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/about')

  await expect(page.locator('[data-slot="deal-left-rail"]')).toBeVisible()
  await expectPlaceholder(page, 'About')
  await expectOperationalRailPlaceholder(page)

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
