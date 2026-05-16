import { describe, expect, it } from 'vitest'

import { getDealOperationalCenter } from './operational-center-service'

describe('getDealOperationalCenter', () => {
  it('returns the Northstar operational center DTO', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected Northstar to be supported, received ${result.error._tag}`)
    }

    expect(result.value._tag).toBe('DealOperationalCenter')
    expect(result.value.deal.slug).toBe('northstar-energy')
    expect(result.value.deal.stage).toBe('closing_review')
    expect(result.value.routes.about).toBe('/deals/northstar-energy/about')
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
    expect(result.value.capital.economics.netInvestableAmount.amountMinor).toBeLessThan(
      result.value.capital.economics.grossCommitted.amountMinor,
    )
  })

  it('computes readiness, blockers, and rail facts from one fixture', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    expect(result.value.readiness.state).toBe('blocked')
    expect(result.value.readiness.criticalBlockerCount).toBe(2)
    expect(result.value.blockers.map((blocker) => blocker.routeHint)).toEqual([
      'commitments',
      'commitments',
      'about',
      'documents',
      'about',
    ])
    expect(result.value.rail.criticalBlockerCount).toBe(2)
    expect(result.value.rail.investorsBlockedCount).toBe(2)
  })

  it('includes investor operational status axes for the commitments route', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    const meridian = result.value.investors.find((investor) => investor.id === 'inv-meridian')

    expect(meridian).toMatchObject({
      commitmentStatus: 'signature_sent',
      investorName: 'Meridian Ventures',
      kycStatus: 'approved',
      kybStatus: 'pending_review',
      readinessState: 'blocked',
      signatureStatus: 'sent',
      wireStatus: 'not_requested',
    })
  })

  it('includes document issue counts for the documents route', () => {
    const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

    if (result.isError()) {
      throw new Error(`Expected DTO, received ${result.error._tag}`)
    }

    expect(result.value.documents.summary.requiredMissingCount).toBe(1)
    expect(result.value.documents.summary.requiredRejectedCount).toBe(1)
    expect(result.value.documents.summary.requiredExpiredCount).toBe(1)
    expect(
      result.value.documents.requirements.filter((document) => document.blocksClosing),
    ).toHaveLength(4)
    expect(result.value.documents.groups.map((group) => group.id)).toEqual([
      'group-generated-closing',
      'group-investor-evidence',
      'group-vehicle-setup',
    ])
  })
})
