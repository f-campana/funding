import { expect, type Page, test } from '@playwright/test'

const eliseMartinRowName = /Elise Martin/

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

async function expectOperationalRail(page: Page) {
  const rail = page.locator('[data-slot="deal-operational-rail"]')
  await expect(rail).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Deal progress' })).toBeVisible()
  await expect(rail.getByRole('heading', { name: 'Close readiness' })).toBeVisible()
}

test('homepage renders and redirects the legacy Northstar deal route to about', async ({
  page,
}) => {
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
})

test('deal about route renders overview sections and disclosure interaction', async ({
  page,
}, testInfo) => {
  await page.goto('/deals/northstar-energy')

  await expect(page).toHaveURL('/deals/northstar-energy/about')
  await expectDealShell(page, 'About')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Close is blocked' })).toBeVisible()
  await expect(page.getByText('KYC evidence blocks signing')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Capital reconciliation' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Document completeness' })).toBeVisible()
  await expectOperationalRail(page)
  await expectActiveDealTab(page, 'About')

  const firstBlocker = page.locator('[data-slot="closing-blocker-item"]').first()
  const blockerDetailsButton = firstBlocker.getByRole('button', { name: 'Show details' })
  await blockerDetailsButton.click()
  await expect(firstBlocker.getByRole('button', { name: 'Hide details' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath('northstar-energy-about.png'),
  })
})

test('deal about route keeps readiness and blockers visible on mobile without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 390 })
  await page.goto('/deals/northstar-energy/about')

  await expect(page.locator('[data-slot="deal-left-rail"]')).toBeVisible()
  await expectOperationalRail(page)
  await expect(page.getByRole('heading', { name: 'Close is blocked' })).toBeVisible()
  await expect(page.getByText('KYC evidence blocks signing')).toBeVisible()

  const railTop = await page
    .locator('[data-slot="deal-operational-rail"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const readinessTop = await page
    .locator('[data-slot="closing-readiness-summary"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const blockerTop = await page
    .locator('[data-slot="closing-blocker-queue"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const documentTop = await page
    .locator('[data-slot="document-completeness-card"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )

  expect(railTop).toBeLessThan(readinessTop)
  expect(readinessTop).toBeLessThan(blockerTop)
  expect(blockerTop).toBeLessThan(documentTop)
  expect(hasHorizontalOverflow).toBe(false)
})

test('deal commitments route supports investor inspection', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 })
  await page.goto('/deals/northstar-energy/commitments')

  await expectDealShell(page, 'Commitments')
  await expectOperationalRail(page)
  await expect(page.getByRole('heading', { name: 'Investor operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Commitment inspector' })).toBeVisible()
  await expectActiveDealTab(page, 'Commitments')

  const tableBox = await page
    .locator('[data-slot="investor-operations-table"]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()

      return { bottom: rect.bottom, left: rect.left }
    })
  const inspectorBox = await page
    .locator('[data-slot="commitment-inspector"]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect()

      return { left: rect.left, top: rect.top }
    })
  expect(inspectorBox.left).toBeGreaterThan(tableBox.left)
  expect(inspectorBox.top).toBeLessThan(tableBox.bottom)

  const eliseRow = page.getByRole('row', { name: eliseMartinRowName })
  const eliseInspectButton = eliseRow.getByRole('button', { name: 'Inspect' })
  await expect(eliseInspectButton).toHaveAttribute('aria-pressed', 'true')

  await expect(page.getByText('Elise Martin').last()).toBeVisible()
  await expect(page.getByText('KYC evidence blocks signing')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open documents' })).toBeVisible()
})

test('deal commitments route stacks inspector on mobile without page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('/deals/northstar-energy/commitments')

  await expect(page.locator('[data-slot="deal-left-rail"]')).toBeVisible()
  await expectOperationalRail(page)
  await expect(page.getByRole('heading', { name: 'Investor operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Commitment inspector' })).toBeVisible()

  const tableTop = await page
    .locator('[data-slot="investor-operations-table"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const inspectorTop = await page
    .locator('[data-slot="commitment-inspector"]')
    .evaluate((element) => element.getBoundingClientRect().top)
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )

  expect(tableTop).toBeLessThan(inspectorTop)
  expect(hasHorizontalOverflow).toBe(false)
})

test('deal documents route renders fixture-backed requirements', async ({ page }) => {
  await page.goto('/deals/northstar-energy/documents')

  await expectDealShell(page, 'Documents')
  await expectOperationalRail(page)
  await expect(page.getByRole('heading', { name: 'Document completeness' })).toBeVisible()
  await expectActiveDealTab(page, 'Documents')
  await expect(page.getByText('Elise Martin proof of address')).toBeVisible()
  await expect(page.getByText('Rhine Ventures UBO declaration')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rejected' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Missing' })).toBeVisible()
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
