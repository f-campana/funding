import { summarizeCapitalReconciliation, summarizeClosingReadiness } from '@repo/domain'
import { describe, expect, it } from 'vitest'

import { northstarOperationalFixture } from './fixtures/northstar-energy.fixture'
import { deriveClosingReadiness, getDealOperationalCenter } from './operational-center-service'

describe('getDealOperationalCenter', () => {
  it('returns the Northstar operational center DTO', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected Northstar to be supported, received ${result.error._tag}`)
    }

    expect(result.value._tag).toBe('DealOperationalCenter')
    expect(result.value.deal.slug).toBe('northstar-energy')
    expect(result.value.deal.stage).toBe('closing_review')
    expect(result.value).not.toHaveProperty('rail')
    expect(result.value).not.toHaveProperty('routes')
    expect(result.value.readiness).not.toHaveProperty('nextActionLabel')
  })

  it('returns a typed unsupported-deal error for unknown deals', () => {
    const result = getDealOperationalCenter({ dealId: 'unknown-deal' })

    expect(result.isError()).toBe(true)

    if (result.isOk()) {
      throw new Error('Expected unknown deal to be unsupported')
    }

    expect(result.error).toEqual({
      _tag: 'UnsupportedDeal',
      dealId: 'unknown-deal',
    })
  })

  it('serializes money as safe EUR minor-unit DTOs', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    expect(result.value.capital.targetAmount).toEqual({
      amountMinor: 500_000_000,
      currency: 'EUR',
    })
    expect(result.value.capital.economics.grossCommitted).toEqual({
      amountMinor: 485_000_000,
      currency: 'EUR',
    })
    expect(result.value.capital.economics.netInvestableAmount).toEqual({
      amountMinor: 470_000_000,
      currency: 'EUR',
    })
    expect(result.value.capital.economics.entryFees).toEqual({
      amountMinor: 10_000_000,
      currency: 'EUR',
    })
    expect(result.value.capital.economics.spvFee).toEqual({
      amountMinor: 5_000_000,
      currency: 'EUR',
    })
    expect(
      result.value.capital.economics.netInvestableAmount.amountMinor +
        result.value.capital.economics.entryFees.amountMinor +
        result.value.capital.economics.spvFee.amountMinor,
    ).toBe(result.value.capital.economics.grossCommitted.amountMinor)
    expect(result.value.capital.economics.netInvestableAmount.amountMinor).toBeLessThan(
      result.value.capital.economics.grossCommitted.amountMinor,
    )
    expect(result.value.capital.targetPosition).toEqual({
      kind: 'under_target',
      remainingToTarget: {
        amountMinor: 15_000_000,
        currency: 'EUR',
      },
    })
    expect(result.value.capital.matching).toEqual({
      kind: 'unmatched',
      unmatchedReceived: {
        amountMinor: 30_000_000,
        currency: 'EUR',
      },
    })
  })

  it('computes readiness and blockers from one fixture', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    expect(result.value.readiness.state).toBe('blocked')
    expect(countUnresolvedBlockersBySeverity(result.value.blockers).critical).toBe(2)
    expect(result.value.blockers.map((blocker) => blocker.routeHint)).toEqual([
      'commitments',
      'commitments',
      'about',
      'documents',
      'about',
    ])
    expect(
      result.value.investors.filter((investor) => investor.readinessState === 'blocked'),
    ).toHaveLength(2)
  })

  it('derives readiness dimensions from source operations and unresolved blockers', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    expect(dimensionStates(result.value.readiness.dimensions)).toEqual({
      capital_reconciliation: 'attention',
      documents: 'blocked',
      investor_identity: 'blocked',
      signatures: 'attention',
      vehicle_setup: 'attention',
      wires: 'blocked',
    })
    expect(result.value.readiness).not.toHaveProperty('nextActionLabel')
  })

  it('does not mark dimensions ready when source operations are not ready but blockers are absent', () => {
    const readiness = deriveClosingReadiness({
      blockers: [],
      capital: getCapitalSummary(northstarOperationalFixture.capital),
      documents: northstarOperationalFixture.documents,
      investors: northstarOperationalFixture.investors.map((investor) => ({
        ...investor,
        blockerIds: [],
      })),
      summary: summarizeClosingReadiness({ blockers: [], hasOperationalInputs: true }),
      vehicle: northstarOperationalFixture.deal.vehicle,
    })

    expect(readiness.state).toBe('blocked')
    expect(readiness.dimensions.every((dimension) => dimension.blockerCount === 0)).toBe(true)
    expect(dimensionStates(readiness.dimensions)).toEqual({
      capital_reconciliation: 'attention',
      documents: 'blocked',
      investor_identity: 'blocked',
      signatures: 'attention',
      vehicle_setup: 'attention',
      wires: 'attention',
    })
  })

  it('keeps blockers authoritative when source operations are otherwise ready', () => {
    const blocker = {
      ...northstarOperationalFixture.blockers[4],
      severity: 'critical',
      type: 'deadline',
    } as const
    const readiness = deriveClosingReadiness({
      blockers: [blocker],
      capital: getCapitalSummary({
        ...northstarOperationalFixture.capital,
        matchedAmountCents: northstarOperationalFixture.capital.receivedAmountCents,
      }),
      documents: northstarOperationalFixture.documents.map((document) => ({
        ...document,
        blocksClosing: false,
        status: 'approved',
      })),
      investors: northstarOperationalFixture.investors.map((investor) => ({
        ...investor,
        blockerIds: [],
        kycStatus: 'approved',
        signatureStatus: 'completed',
        wireStatus: 'reconciled',
        ...('kybStatus' in investor ? { kybStatus: 'approved' as const } : {}),
      })),
      summary: summarizeClosingReadiness({ blockers: [blocker], hasOperationalInputs: true }),
      vehicle: {
        ...northstarOperationalFixture.deal.vehicle,
        setupStatus: 'ready',
      },
    })

    expect(readiness.state).toBe('blocked')
    expect(dimensionStates(readiness.dimensions)).toMatchObject({
      capital_reconciliation: 'ready',
      documents: 'ready',
      investor_identity: 'ready',
      signatures: 'ready',
      vehicle_setup: 'blocked',
      wires: 'ready',
    })
  })

  it('includes investor operational status axes for the commitments route', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    const meridian = result.value.investors.find((investor) => investor.id === 'inv-meridian')

    expect(meridian).toMatchObject({
      commitmentStatus: 'signature_sent',
      entity: {
        kind: 'legal_entity',
        legalEntity: {
          kyb: {
            kind: 'available',
            status: 'pending_review',
          },
          name: 'Meridian Ventures II LP',
        },
      },
      investorName: 'Meridian Ventures',
      kycStatus: 'approved',
      readinessState: 'blocked',
      signatureStatus: 'sent',
      wireStatus: 'not_requested',
    })

    expect(result.value.investors.find((investor) => investor.id === 'inv-helix')).toMatchObject({
      readinessState: 'attention',
      wireStatus: 'unmatched',
    })
    expect(
      result.value.investors.find((investor) => investor.id === 'inv-julien-moreau'),
    ).toMatchObject({
      entity: {
        kind: 'individual',
      },
      readinessState: 'attention',
      wireStatus: 'matched',
    })
  })

  it('includes document issue counts for the documents route', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    const requiredDocuments = result.value.documents.requirements.filter(
      (document) => document.requirement.kind === 'required',
    )

    expect(countDocumentsByStatus(requiredDocuments, 'missing')).toBe(1)
    expect(countDocumentsByStatus(requiredDocuments, 'rejected')).toBe(1)
    expect(countDocumentsByStatus(requiredDocuments, 'expired')).toBe(1)
    expect(
      result.value.documents.requirements.filter(
        (document) => document.closingImpact.kind === 'blocks_closing',
      ),
    ).toHaveLength(4)
    expect(result.value.documents.groups.map((group) => group.id)).toEqual([
      'group-generated-closing',
      'group-investor-evidence',
      'group-vehicle-setup',
    ])
  })
})

const dimensionStates = (
  dimensions: readonly {
    readonly id: string
    readonly state: string
  }[],
) => Object.fromEntries(dimensions.map((dimension) => [dimension.id, dimension.state]))

const countUnresolvedBlockersBySeverity = (
  blockers: readonly {
    readonly resolved: boolean
    readonly severity: 'critical' | 'warning' | 'info'
  }[],
) => {
  const counts = { critical: 0, info: 0, warning: 0 }

  for (const blocker of blockers) {
    if (!blocker.resolved) {
      counts[blocker.severity] += 1
    }
  }

  return counts
}

const getCapitalSummary = (capital: typeof northstarOperationalFixture.capital) => {
  const result = summarizeCapitalReconciliation(capital)

  if (result.isError()) {
    throw new Error(`Expected valid capital fixture, received ${result.error._tag}`)
  }

  return result.value
}

const countDocumentsByStatus = (
  documents: readonly {
    readonly status: string
  }[],
  status: string,
): number => documents.filter((document) => document.status === status).length
