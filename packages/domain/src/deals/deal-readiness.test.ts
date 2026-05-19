import { describe, expect, it } from 'vitest'

import type { ClosingBlocker } from './closing-blocker'
import {
  CLOSING_READINESS_STATES,
  ClosingReadinessInputSchema,
  ClosingReadinessStateSchema,
  summarizeClosingReadiness,
} from './deal-readiness'

const blocker = (severity: ClosingBlocker['severity'], resolved = false): ClosingBlocker => ({
  description: `${severity} blocker`,
  id: `${severity}-${resolved ? 'resolved' : 'open'}`,
  owner: 'operations',
  resolved,
  severity,
  title: `${severity} blocker`,
  type: 'document',
})

describe('ClosingReadinessStateSchema', () => {
  it('parses every known readiness state', () => {
    for (const state of CLOSING_READINESS_STATES) {
      expect(ClosingReadinessStateSchema.parse(state)).toBe(state)
    }
  })

  it('rejects unknown readiness states', () => {
    expect(ClosingReadinessStateSchema.safeParse('almost_ready').success).toBe(false)
  })
})

describe('ClosingReadinessInputSchema', () => {
  it('parses raw blocker input before readiness helpers run', () => {
    const parsed = ClosingReadinessInputSchema.parse({
      blockers: [{ ...blocker('warning'), title: '  Subscription package missing  ' }],
      hasOperationalInputs: true,
    })

    expect(parsed.blockers[0]?.title).toBe('Subscription package missing')
    expect(summarizeClosingReadiness(parsed).state).toBe('attention')
  })

  it('rejects invalid blocker input', () => {
    expect(
      ClosingReadinessInputSchema.safeParse({
        blockers: [{ ...blocker('critical'), severity: 'urgent' }],
      }).success,
    ).toBe(false)
  })
})

describe('summarizeClosingReadiness', () => {
  it('returns not_started when no operational inputs exist', () => {
    expect(summarizeClosingReadiness({ blockers: [] })).toMatchObject({
      nextActionLabel: 'Start operational readiness review',
      state: 'not_started',
      unresolvedBlockerCount: 0,
    })
  })

  it('returns blocked when unresolved critical blockers exist', () => {
    expect(
      summarizeClosingReadiness({
        blockers: [blocker('warning'), blocker('critical'), blocker('info', true)],
      }),
    ).toMatchObject({
      criticalBlockerCount: 1,
      infoBlockerCount: 0,
      state: 'blocked',
      unresolvedBlockerCount: 2,
      warningBlockerCount: 1,
    })
  })

  it('returns attention for unresolved warnings without critical blockers', () => {
    expect(summarizeClosingReadiness({ blockers: [blocker('warning')] })).toMatchObject({
      criticalBlockerCount: 0,
      state: 'attention',
      warningBlockerCount: 1,
    })
  })

  it('returns ready when operational inputs exist without critical or warning blockers', () => {
    expect(
      summarizeClosingReadiness({
        blockers: [blocker('info')],
        hasOperationalInputs: true,
      }),
    ).toMatchObject({
      infoBlockerCount: 1,
      nextActionLabel: 'Proceed to closing review',
      state: 'ready',
    })
  })
})
