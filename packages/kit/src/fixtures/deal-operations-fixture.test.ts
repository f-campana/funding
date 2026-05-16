import { euroCentsToMinorUnits, InvestorOperationsRecordSchema } from '@repo/domain'
import { ClosingBlockerSchema, summarizeClosingReadiness } from '@repo/domain/deals'
import { DocumentRequirementSchema } from '@repo/domain/documents'
import { describe, expect, it } from 'vitest'

import {
  northstarActivityItems,
  northstarCapitalSummariesByReadiness,
  northstarClosingBlockersByState,
  northstarDealFixture,
  northstarDealTerms,
  northstarDocumentCompletenessSummary,
  northstarDocumentRequirements,
  northstarDomainClosingBlockersByState,
  northstarInvestorOperationsRecords,
  northstarInvestorRows,
  northstarInvestorStatusBreakdown,
  northstarTicketDistribution,
} from './index'

describe('Northstar deal operations fixtures', () => {
  it('provides the existing Northstar demo identity and display data', () => {
    expect(northstarDealFixture.id).toBe('northstar-energy')
    expect(northstarDealFixture.title).toBe('Northstar Energy SPV')
    expect(northstarDealFixture.statusLabel).toBe('Collecting')
    expect(northstarDealFixture.spvStatus).toBe('collecting')
    expect(northstarDealTerms).toHaveLength(4)
    expect(northstarActivityItems).toHaveLength(4)
    expect(northstarInvestorRows).toHaveLength(6)
  })

  it('preserves the current dashboard blocker scenarios through kit adapters', () => {
    expect(northstarClosingBlockersByState.blocked).toHaveLength(3)
    expect(northstarClosingBlockersByState.attention).toHaveLength(2)
    expect(northstarClosingBlockersByState.ready).toHaveLength(0)
    expect(northstarClosingBlockersByState.blocked[0]?.title).toBe('KYC evidence blocks signing')
    expect(northstarClosingBlockersByState.blocked[1]?.kind).toBe('payment_match')
  })

  it('maps blocker fixtures to canonical domain readiness summaries', () => {
    for (const blockers of Object.values(northstarDomainClosingBlockersByState)) {
      for (const blocker of blockers) {
        expect(ClosingBlockerSchema.safeParse(blocker).success).toBe(true)
      }
    }

    expect(
      summarizeClosingReadiness({
        blockers: northstarDomainClosingBlockersByState.blocked,
      }),
    ).toMatchObject({
      criticalBlockerCount: 1,
      state: 'blocked',
      unresolvedBlockerCount: 3,
      warningBlockerCount: 1,
    })
    expect(
      summarizeClosingReadiness({
        blockers: northstarDomainClosingBlockersByState.attention,
      }),
    ).toMatchObject({
      criticalBlockerCount: 0,
      state: 'attention',
      unresolvedBlockerCount: 2,
      warningBlockerCount: 1,
    })
    expect(
      summarizeClosingReadiness({
        blockers: northstarDomainClosingBlockersByState.ready,
        hasOperationalInputs: true,
      }).state,
    ).toBe('ready')
  })

  it('provides canonical investor operations records for every visible investor row', () => {
    expect(northstarInvestorOperationsRecords).toHaveLength(northstarInvestorRows.length)

    for (const record of northstarInvestorOperationsRecords) {
      expect(
        InvestorOperationsRecordSchema.safeParse({
          ...record,
          commitmentAmountCents: Number(euroCentsToMinorUnits(record.commitmentAmountCents)),
        }).success,
      ).toBe(true)
    }

    expect(
      northstarInvestorOperationsRecords.some((record) => record.kycStatus === 'blocked'),
    ).toBe(true)
    expect(
      northstarInvestorOperationsRecords.some((record) => record.wireStatus === 'reconciled'),
    ).toBe(true)
    expect(
      northstarInvestorOperationsRecords.some((record) => record.wireStatus === 'received'),
    ).toBe(true)
  })

  it('provides document requirements with missing, rejected, review, approved, and expired cases', () => {
    for (const requirement of northstarDocumentRequirements) {
      expect(DocumentRequirementSchema.safeParse(requirement).success).toBe(true)
    }

    expect(northstarDocumentCompletenessSummary).toMatchObject({
      approvedCount: 2,
      expiredCount: 1,
      isComplete: false,
      missingCount: 1,
      rejectedCount: 1,
      requiredCount: 6,
      requiredMissingCount: 1,
      requiredRejectedCount: 1,
      underReviewCount: 1,
      uploadedCount: 1,
    })
  })

  it('keeps exact capital and distribution fixture amounts', () => {
    expect(
      euroCentsToMinorUnits(northstarCapitalSummariesByReadiness.blocked.unmatchedReceivedCents),
    ).toBe(125_000_00n)
    expect(
      euroCentsToMinorUnits(northstarCapitalSummariesByReadiness.ready.remainingToTargetCents),
    ).toBe(0n)
    expect(northstarTicketDistribution).toHaveLength(3)
    expect(northstarInvestorStatusBreakdown).toHaveLength(4)
  })
})
