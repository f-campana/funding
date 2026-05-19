import * as Kit from '@repo/kit'
import { DealCommitmentInspector } from '@repo/kit/deal-commitment-inspector'
import { DealCommitmentsTable } from '@repo/kit/deal-commitments-table'
import { DealDocumentsEvidence } from '@repo/kit/deal-documents-evidence'
import { DealOperationalOverview } from '@repo/kit/deal-operational-overview'
import { DealProgressPanel } from '@repo/kit/deal-progress-panel'
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

  it('supports granular accepted surface subpath imports', () => {
    expect(DealCommitmentInspector).toBeTypeOf('function')
    expect(DealCommitmentsTable).toBeTypeOf('function')
    expect(DealDocumentsEvidence).toBeTypeOf('function')
    expect(DealOperationalOverview).toBeTypeOf('function')
    expect(DealProgressPanel).toBeTypeOf('function')
  })
})
