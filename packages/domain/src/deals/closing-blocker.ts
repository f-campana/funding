import { z } from 'zod'

import type { StatusTone } from '../status-tone'

export const CLOSING_BLOCKER_SEVERITIES = ['critical', 'warning', 'info'] as const
export type ClosingBlockerSeverity = (typeof CLOSING_BLOCKER_SEVERITIES)[number]

export const CLOSING_BLOCKER_TYPES = [
  'kyc',
  'kyb',
  'signature',
  'wire',
  'reconciliation',
  'document',
  'allocation',
  'compliance',
  'deadline',
] as const
export type ClosingBlockerType = (typeof CLOSING_BLOCKER_TYPES)[number]

export const CLOSING_BLOCKER_OWNERS = [
  'operations',
  'legal',
  'compliance',
  'finance',
  'investor',
  'deal_lead',
  'system',
] as const
export type ClosingBlockerOwner = (typeof CLOSING_BLOCKER_OWNERS)[number]

export type ClosingBlocker = {
  readonly id: string
  readonly severity: ClosingBlockerSeverity
  readonly type: ClosingBlockerType
  readonly title: string
  readonly description: string
  readonly owner: ClosingBlockerOwner
  readonly resolved: boolean
}

export type ClosingBlockerSeverityCounts = Record<ClosingBlockerSeverity, number>

export const ClosingBlockerSeveritySchema = z.enum(CLOSING_BLOCKER_SEVERITIES)
export const ClosingBlockerTypeSchema = z.enum(CLOSING_BLOCKER_TYPES)
export const ClosingBlockerOwnerSchema = z.enum(CLOSING_BLOCKER_OWNERS)

export const ClosingBlockerSchema = z.object({
  description: z.string().trim().min(1, { error: 'closingBlocker.description.required' }),
  id: z.string().trim().min(1, { error: 'closingBlocker.id.required' }),
  owner: ClosingBlockerOwnerSchema,
  resolved: z.boolean(),
  severity: ClosingBlockerSeveritySchema,
  title: z.string().trim().min(1, { error: 'closingBlocker.title.required' }),
  type: ClosingBlockerTypeSchema,
})

const ZERO_COUNTS = {
  critical: 0,
  info: 0,
  warning: 0,
} as const satisfies ClosingBlockerSeverityCounts

const CLOSING_BLOCKER_SEVERITY_TONES = {
  critical: 'danger',
  info: 'info',
  warning: 'attention',
} as const satisfies Record<ClosingBlockerSeverity, StatusTone>

export const getClosingBlockerSeverityTone = (severity: ClosingBlockerSeverity): StatusTone =>
  CLOSING_BLOCKER_SEVERITY_TONES[severity]

export const getUnresolvedClosingBlockers = (
  blockers: readonly ClosingBlocker[],
): readonly ClosingBlocker[] => blockers.filter((blocker) => !blocker.resolved)

export const countClosingBlockersBySeverity = (
  blockers: readonly ClosingBlocker[],
): ClosingBlockerSeverityCounts => {
  const counts: ClosingBlockerSeverityCounts = { ...ZERO_COUNTS }

  for (const blocker of blockers) {
    counts[blocker.severity] += 1
  }

  return counts
}

export const hasCriticalClosingBlockers = (blockers: readonly ClosingBlocker[]): boolean =>
  blockers.some((blocker) => !blocker.resolved && blocker.severity === 'critical')
