import * as Kit from '@repo/kit'
import { describe, expect, it } from 'vitest'

describe('@repo/kit package exports', () => {
  it('exports the first composed product component set', () => {
    expect(Kit.MoneyDisplay).toBeTypeOf('function')
    expect(Kit.MetricCard).toBeTypeOf('function')
    expect(Kit.CommitmentProgress).toBeTypeOf('function')
    expect(Kit.DealCommitmentsTable).toBeTypeOf('function')
    expect(Kit.CommitmentInspector).toBeTypeOf('function')
    expect(Kit.InvestorOperationsTable).toBeTypeOf('function')
    expect(Kit.SpvStateTracker).toBeTypeOf('function')
    expect(Kit.DealTermsPanel).toBeTypeOf('function')
    expect(Kit.DealProgressCard).toBeTypeOf('function')
    expect(Kit.DocumentCompletenessCard).toBeTypeOf('function')
    expect(Kit.InvestorRow).toBeTypeOf('function')
    expect(Kit.TicketDistribution).toBeTypeOf('function')
    expect(Kit.InvestorStatusBreakdown).toBeTypeOf('function')
    expect(Kit.ActivityTimeline).toBeTypeOf('function')
    expect(Kit.ClosingReadinessSummary).toBeTypeOf('function')
    expect(Kit.ClosingBlockerQueue).toBeTypeOf('function')
    expect(Kit.CapitalReconciliationPanel).toBeTypeOf('function')
    expect(Kit.DealDashboardDemo).toBeTypeOf('function')
  })

  it('does not export the removed bootstrap placeholder', () => {
    expect('KitPlaceholder' in Kit).toBe(false)
  })

  it('does not export fixture data from the root', () => {
    expect('northstarDealFixture' in Kit).toBe(false)
    expect('northstarInvestorOperationsRecords' in Kit).toBe(false)
  })
})
