import * as Kit from '@repo/kit'
import { describe, expect, it } from 'vitest'

describe('@repo/kit package exports', () => {
  it('exports only the accepted baseline component set', () => {
    expect(Kit.DealCommitmentInspector).toBeTypeOf('function')
    expect(Kit.DealCommitmentsTable).toBeTypeOf('function')
    expect(Kit.DealDocumentsEvidence).toBeTypeOf('function')
    expect(Kit.DealOperationalOverview).toBeTypeOf('function')
    expect(Kit.DealProgressPanel).toBeTypeOf('function')
    expect(Object.keys(Kit).sort()).toEqual([
      'DealCommitmentInspector',
      'DealCommitmentsTable',
      'DealDocumentsEvidence',
      'DealOperationalOverview',
      'DealProgressPanel',
    ])
  })

  it('does not export the removed bootstrap placeholder', () => {
    expect('KitPlaceholder' in Kit).toBe(false)
  })

  it('does not export fixture data from the root', () => {
    expect('northstarDealFixture' in Kit).toBe(false)
    expect('northstarInvestorOperationsRecords' in Kit).toBe(false)
  })
})
