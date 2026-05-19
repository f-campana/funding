import type {
  DealOperationalBlockerCount,
  DealOperationalOverviewState,
  DealOperationalProgress,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export const maxOperationalProgressValue = 100

export const clampOperationalProgressValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(Math.round(value), 0), maxOperationalProgressValue)
}

export const getOperationalProgressValue = (progress: DealOperationalProgress) =>
  clampOperationalProgressValue(progress.value)

export const getOperationalBlockerTotal = (blockerCounts: readonly DealOperationalBlockerCount[]) =>
  blockerCounts.reduce((total, count) => total + Math.max(count.count, 0), 0)

export const getOperationalBlockerSummary = (
  readiness: Pick<DealOperationalReadinessSummary, 'blockerCounts'>,
): string => {
  const blockerCounts = getCountsBySeverity(readiness.blockerCounts)
  const unresolvedBlockerCount = blockerCounts.critical + blockerCounts.warning + blockerCounts.info

  if (unresolvedBlockerCount === 0) {
    return 'All close-critical blockers are resolved.'
  }

  const blockerNoun = pluralize(unresolvedBlockerCount, 'blocker')
  const criticalQualifier =
    blockerCounts.critical > 0 ? ' Critical identity and wire blockers remain in view.' : ''

  return `${unresolvedBlockerCount} close-impacting ${blockerNoun} remain. Capital and timing blockers are shown first.${criticalQualifier}`
}

export const getOperationalReadinessState = (
  state: DealOperationalOverviewState,
): DealOperationalReadinessState | undefined =>
  state.kind === 'ready' ? state.readiness.state : undefined

const getCountsBySeverity = (blockerCounts: readonly DealOperationalBlockerCount[]) => {
  const counts = { critical: 0, info: 0, warning: 0 }

  for (const blockerCount of blockerCounts) {
    counts[blockerCount.severity] += Math.max(blockerCount.count, 0)
  }

  return counts
}

const pluralize = (count: number, singular: string): string =>
  count === 1 ? singular : `${singular}s`
