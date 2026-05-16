import { describe, expect, it } from 'vitest'

import {
  canTransitionSpvStatus,
  isTerminalSpvStatus,
  SPV_STATUSES,
  type SpvStatus,
  SpvStatusSchema,
} from './spv-status'

const allowedTransitions = [
  ['draft', 'open'],
  ['open', 'kyc_in_progress'],
  ['kyc_in_progress', 'e_signatures'],
  ['e_signatures', 'collecting'],
  ['collecting', 'incorporated'],
  ['incorporated', 'closed'],
] as const satisfies readonly (readonly [SpvStatus, SpvStatus])[]

const terminalStatuses = ['closed'] as const satisfies readonly SpvStatus[]
const nonTerminalStatuses = SPV_STATUSES.filter((status) => status !== 'closed')

describe('SpvStatusSchema', () => {
  it('parses every known SPV status', () => {
    for (const status of SPV_STATUSES) {
      expect(SpvStatusSchema.parse(status)).toBe(status)
    }
  })

  it('rejects unknown SPV statuses', () => {
    expect(SpvStatusSchema.safeParse('cancelled').success).toBe(false)
  })
})

describe('SPV lifecycle helpers', () => {
  it('identifies terminal and non-terminal statuses exhaustively', () => {
    expect(nonTerminalStatuses).toEqual([
      'draft',
      'open',
      'kyc_in_progress',
      'e_signatures',
      'collecting',
      'incorporated',
    ])

    for (const status of terminalStatuses) {
      expect(isTerminalSpvStatus(status)).toBe(true)
    }

    for (const status of nonTerminalStatuses) {
      expect(isTerminalSpvStatus(status)).toBe(false)
    }
  })

  it('allows only explicit forward transitions', () => {
    for (const [from, to] of allowedTransitions) {
      expect(canTransitionSpvStatus(from, to)).toBe(true)
    }
  })

  it('rejects reverse transitions', () => {
    for (const [to, from] of allowedTransitions) {
      expect(canTransitionSpvStatus(from, to)).toBe(false)
    }
  })

  it('rejects same-state transitions', () => {
    for (const status of SPV_STATUSES) {
      expect(canTransitionSpvStatus(status, status)).toBe(false)
    }
  })

  it('has explicit behavior for every possible transition pair', () => {
    const explicitPairs = new Set(allowedTransitions.map(([from, to]) => `${from}:${to}`))

    for (const from of SPV_STATUSES) {
      for (const to of SPV_STATUSES) {
        expect(canTransitionSpvStatus(from, to)).toBe(explicitPairs.has(`${from}:${to}`))
      }
    }
  })
})
