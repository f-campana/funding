import * as KitFixtures from '@repo/kit/fixtures'
import { describe, expect, it } from 'vitest'

describe('@repo/kit/fixtures package exports', () => {
  it('exports fixture-backed deal operations data from the fixture subpath', () => {
    expect(KitFixtures.northstarDealFixture.id).toBe('northstar-energy')
    expect(KitFixtures.northstarInvestorOperationsRecords.length).toBeGreaterThan(0)
    expect(KitFixtures.northstarDocumentRequirements.length).toBeGreaterThan(0)
  })
})
