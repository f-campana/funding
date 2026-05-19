import { z } from 'zod'

import {
  type ClosingBlocker,
  ClosingBlockerSchema,
  countClosingBlockersBySeverity,
  getUnresolvedClosingBlockers,
} from './closing-blocker'

export const CLOSING_READINESS_STATES = ['not_started', 'ready', 'attention', 'blocked'] as const
export type ClosingReadinessState = (typeof CLOSING_READINESS_STATES)[number]

export const ClosingReadinessStateSchema = z.enum(CLOSING_READINESS_STATES)

export type ClosingReadinessSummary = {
  readonly state: ClosingReadinessState
  readonly unresolvedBlockerCount: number
  readonly criticalBlockerCount: number
  readonly warningBlockerCount: number
  readonly infoBlockerCount: number
  readonly nextActionLabel: string
}

export type ClosingReadinessInput = {
  readonly blockers: readonly ClosingBlocker[]
  readonly hasOperationalInputs?: boolean
}

export const ClosingReadinessInputSchema = z
  .object({
    blockers: z.array(ClosingBlockerSchema),
    hasOperationalInputs: z.boolean().optional(),
  })
  .strict()
  .transform((input): ClosingReadinessInput => {
    if (input.hasOperationalInputs === undefined) {
      return {
        blockers: input.blockers,
      }
    }

    return {
      blockers: input.blockers,
      hasOperationalInputs: input.hasOperationalInputs,
    }
  })

const NEXT_ACTION_LABELS = {
  attention: 'Review warning blockers before close',
  blocked: 'Resolve critical blockers before close',
  not_started: 'Start operational readiness review',
  ready: 'Proceed to closing review',
} as const satisfies Record<ClosingReadinessState, string>

export const summarizeClosingReadiness = ({
  blockers,
  hasOperationalInputs = blockers.length > 0,
}: ClosingReadinessInput): ClosingReadinessSummary => {
  const unresolvedBlockers = getUnresolvedClosingBlockers(blockers)
  const counts = countClosingBlockersBySeverity(unresolvedBlockers)
  const state = getReadinessState({
    criticalBlockerCount: counts.critical,
    hasOperationalInputs,
    warningBlockerCount: counts.warning,
  })

  return {
    criticalBlockerCount: counts.critical,
    infoBlockerCount: counts.info,
    nextActionLabel: NEXT_ACTION_LABELS[state],
    state,
    unresolvedBlockerCount: unresolvedBlockers.length,
    warningBlockerCount: counts.warning,
  }
}

const getReadinessState = ({
  criticalBlockerCount,
  hasOperationalInputs,
  warningBlockerCount,
}: {
  readonly criticalBlockerCount: number
  readonly warningBlockerCount: number
  readonly hasOperationalInputs: boolean
}): ClosingReadinessState => {
  if (!hasOperationalInputs) {
    return 'not_started'
  }

  if (criticalBlockerCount > 0) {
    return 'blocked'
  }

  if (warningBlockerCount > 0) {
    return 'attention'
  }

  return 'ready'
}
