import { describe, expect, it } from 'vitest'

import type {
  DealOperationalCenterDTO,
  DealOperationalCenterValidationErrorDTO,
} from './operational-center-dto'
import { getDealOperationalCenter } from './operational-center-service'
import { validateDealOperationalCenter } from './operational-center-validation'

describe('validateDealOperationalCenter', () => {
  it('validates the Northstar DTO boundary', () => {
    const result = validateDealOperationalCenter(getNorthstarData())

    expect(result.isOk()).toBe(true)
  })

  it('rejects unsafe money amounts', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        targetAmount: {
          ...data.capital.targetAmount,
          amountMinor: Number.MAX_SAFE_INTEGER + 1,
        },
      },
    }

    expectValidationError(invalid, 'InvalidMoney')
  })

  it('rejects non-EUR money amounts', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        targetAmount: {
          ...data.capital.targetAmount,
          currency: 'USD',
        },
      },
    } as unknown as DealOperationalCenterDTO

    expectValidationError(invalid, 'InvalidMoney')
  })

  it('rejects invalid DTO date strings', () => {
    const invalid = {
      ...getNorthstarData(),
      generatedAt: 'not-an-iso-date',
    }

    expectValidationError(invalid, 'InvalidDateTime')
  })

  it('rejects inconsistent committed capital economics', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        economics: {
          ...data.capital.economics,
          grossCommitted: {
            ...data.capital.economics.grossCommitted,
            amountMinor: data.capital.economics.grossCommitted.amountMinor + 1,
          },
        },
      },
    }

    expectValidationError(invalid, 'CapitalInvariantViolation')
  })

  it('rejects matched capital greater than received capital', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        matchedAmount: {
          ...data.capital.matchedAmount,
          amountMinor: data.capital.receivedAmount.amountMinor + 1,
        },
      },
    }

    expectValidationError(invalid, 'CapitalInvariantViolation')
  })

  it('rejects finance-accepted capital fields the source model does not prove', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        financeAcceptedAmount: data.capital.matchedAmount,
      },
    } as unknown as DealOperationalCenterDTO

    expectValidationError(invalid, 'CapitalInvariantViolation')
  })

  it('rejects impossible capital variant payloads', () => {
    const data = getNorthstarData()
    const invalid = {
      ...data,
      capital: {
        ...data.capital,
        matching: {
          kind: 'matched',
          unmatchedReceived:
            data.capital.matching.kind === 'unmatched'
              ? data.capital.matching.unmatchedReceived
              : data.capital.receivedAmount,
        },
      },
    } as unknown as DealOperationalCenterDTO

    const error = expectValidationError(invalid, 'CapitalInvariantViolation')

    expect(error).toMatchObject({
      message: 'matched capital cannot expose unmatchedReceived',
    })
  })

  it('rejects impossible document requirement and closing impact combinations', () => {
    const data = getNorthstarData()
    const document = firstOf(data.documents.requirements, 'document')
    const invalid = {
      ...data,
      documents: {
        ...data.documents,
        requirements: data.documents.requirements.map((candidate) =>
          candidate.id === document.id
            ? {
                ...candidate,
                closingImpact: { kind: 'blocks_closing' },
                requirement: { kind: 'optional' },
              }
            : candidate,
        ),
      },
    } as unknown as DealOperationalCenterDTO

    const error = expectValidationError(invalid, 'DocumentInvariantViolation')

    expect(error).toMatchObject({
      documentId: document.id,
      message: 'optional documents cannot block closing',
    })
  })

  it('rejects dangling investor graph references', () => {
    const data = getNorthstarData()
    const blocker = firstOf(data.blockers, 'blocker')
    const invalid = {
      ...data,
      blockers: data.blockers.map((candidate) =>
        candidate.id === blocker.id
          ? {
              ...candidate,
              relatedInvestorIds: ['inv-missing'],
            }
          : candidate,
      ),
    }

    const error = expectValidationError(invalid, 'DanglingReference')

    expect(error).toMatchObject({
      path: `blockers.${blocker.id}.relatedInvestorIds[0]`,
      target: 'investors.inv-missing',
    })
  })

  it('rejects missing document groups', () => {
    const data = getNorthstarData()
    const document = firstOf(data.documents.requirements, 'document')
    const invalid = {
      ...data,
      documents: {
        ...data.documents,
        requirements: data.documents.requirements.map((candidate) =>
          candidate.id === document.id
            ? {
                ...candidate,
                groupId: 'group-missing',
              }
            : candidate,
        ),
      },
    }

    const error = expectValidationError(invalid, 'DanglingReference')

    expect(error).toMatchObject({
      path: `documents.requirements.${document.id}.groupId`,
      target: 'documents.groups.group-missing',
    })
  })

  it('rejects dangling activity blocker references', () => {
    const data = getNorthstarData()
    const activity = firstOf(data.activity, 'activity')
    const invalid = {
      ...data,
      activity: data.activity.map((candidate) =>
        candidate.id === activity.id
          ? {
              ...candidate,
              relatedBlockerId: 'blk-missing',
            }
          : candidate,
      ),
    } as unknown as DealOperationalCenterDTO

    const error = expectValidationError(invalid, 'DanglingReference')

    expect(error).toMatchObject({
      path: `activity.${activity.id}.relatedBlockerId`,
      target: 'blockers.blk-missing',
    })
  })
})

const getNorthstarData = (): DealOperationalCenterDTO => {
  const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

  if (result.isError()) {
    throw new Error(`Expected Northstar fixture, received ${result.error._tag}`)
  }

  return result.value
}

const expectValidationError = (
  data: DealOperationalCenterDTO,
  tag: DealOperationalCenterValidationErrorDTO['_tag'],
): DealOperationalCenterValidationErrorDTO => {
  const result = validateDealOperationalCenter(data)

  expect(result.isError()).toBe(true)

  if (result.isOk()) {
    throw new Error('Expected validation to fail')
  }

  expect(result.error._tag).toBe(tag)

  return result.error
}

const firstOf = <Item>(items: readonly Item[], label: string): Item => {
  const [item] = items

  if (item === undefined) {
    throw new Error(`Expected at least one ${label}`)
  }

  return item
}
