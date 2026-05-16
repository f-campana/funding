import { describe, expect, it } from 'vitest'

import {
  CLOSING_BLOCKER_OWNERS,
  CLOSING_BLOCKER_SEVERITIES,
  CLOSING_BLOCKER_TYPES,
  type ClosingBlocker,
  ClosingBlockerOwnerSchema,
  ClosingBlockerSchema,
  ClosingBlockerSeveritySchema,
  ClosingBlockerTypeSchema,
  countClosingBlockersBySeverity,
  getClosingBlockerSeverityTone,
  getUnresolvedClosingBlockers,
  hasCriticalClosingBlockers,
} from './closing-blocker'

const blockers = [
  {
    description: 'Proof of address is missing.',
    id: 'kyc-proof',
    owner: 'compliance',
    resolved: false,
    severity: 'critical',
    title: 'KYC evidence blocks signing',
    type: 'kyc',
  },
  {
    description: 'Wire receipt needs matching.',
    id: 'wire-match',
    owner: 'finance',
    resolved: false,
    severity: 'warning',
    title: 'Wire receipt unmatched',
    type: 'reconciliation',
  },
  {
    description: 'Audit memo was attached.',
    id: 'audit-memo',
    owner: 'operations',
    resolved: true,
    severity: 'info',
    title: 'Audit memo attached',
    type: 'document',
  },
] as const satisfies readonly ClosingBlocker[]

describe('closing blocker schemas', () => {
  it('parses every known enum value', () => {
    for (const severity of CLOSING_BLOCKER_SEVERITIES) {
      expect(ClosingBlockerSeveritySchema.parse(severity)).toBe(severity)
    }

    for (const type of CLOSING_BLOCKER_TYPES) {
      expect(ClosingBlockerTypeSchema.parse(type)).toBe(type)
    }

    for (const owner of CLOSING_BLOCKER_OWNERS) {
      expect(ClosingBlockerOwnerSchema.parse(owner)).toBe(owner)
    }
  })

  it('rejects invalid blocker payloads', () => {
    expect(ClosingBlockerSchema.safeParse(blockers[0]).success).toBe(true)
    expect(ClosingBlockerSchema.safeParse({ ...blockers[0], severity: 'urgent' }).success).toBe(
      false,
    )
    expect(ClosingBlockerSchema.safeParse({ ...blockers[0], title: '   ' }).success).toBe(false)
  })
})

describe('closing blocker helpers', () => {
  it('filters unresolved blockers and counts severities', () => {
    const unresolved = getUnresolvedClosingBlockers(blockers)

    expect(unresolved).toHaveLength(2)
    expect(countClosingBlockersBySeverity(unresolved)).toEqual({
      critical: 1,
      info: 0,
      warning: 1,
    })
  })

  it('detects unresolved critical blockers only', () => {
    expect(hasCriticalClosingBlockers(blockers)).toBe(true)
    expect(hasCriticalClosingBlockers([{ ...blockers[0], resolved: true }])).toBe(false)
  })

  it('maps severity to semantic status tones', () => {
    expect(getClosingBlockerSeverityTone('critical')).toBe('danger')
    expect(getClosingBlockerSeverityTone('warning')).toBe('attention')
    expect(getClosingBlockerSeverityTone('info')).toBe('info')
  })
})
