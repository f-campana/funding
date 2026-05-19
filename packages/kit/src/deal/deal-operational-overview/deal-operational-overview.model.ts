import type {
  DealOperationalBlockerCount,
  DealOperationalOverviewState,
  DealOperationalProgress,
  DealOperationalReadinessState,
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

export const getOperationalReadinessState = (
  state: DealOperationalOverviewState,
): DealOperationalReadinessState | undefined =>
  state.kind === 'ready' ? state.readiness.state : undefined
