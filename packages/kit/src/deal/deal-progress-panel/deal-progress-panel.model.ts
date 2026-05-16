import { match } from 'ts-pattern'

import type {
  DealProgressAction,
  DealProgressPanelState,
  DealProgressSegment,
  DealProgressVisualProgress,
  NormalizedDealProgressSegment,
} from './deal-progress-panel.types'

export const maxBasisPoints = 10_000

const terminalStages = ['invested', 'completed', 'exited', 'canceled'] as const

const terminalActionKinds = [
  'invite',
  'moveToContracting',
  'closeDeal',
  'openForInterests',
] as const

export const clampBasisPoints = (basisPoints: number) => {
  if (!Number.isFinite(basisPoints)) {
    return 0
  }

  return Math.min(Math.max(Math.round(basisPoints), 0), maxBasisPoints)
}

export const getProgressBarValue = (progress: DealProgressVisualProgress): number | null =>
  match(progress)
    .returnType<number | null>()
    .with({ kind: 'knownTarget' }, ({ basisPoints }) => clampBasisPoints(basisPoints) / 100)
    .with({ kind: 'noTarget' }, () => null)
    .exhaustive()

export const getProgressAriaValueText = (progress: DealProgressVisualProgress) =>
  match(progress)
    .returnType<string>()
    .with({ kind: 'knownTarget' }, ({ basisPoints, capped, label }) => {
      const percentage = new Intl.NumberFormat('en', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }).format(clampBasisPoints(basisPoints) / 100)

      return capped ? `${label}: ${percentage}% capped` : `${label}: ${percentage}%`
    })
    .with({ kind: 'noTarget' }, ({ label }) => label)
    .exhaustive()

export const normalizeSegments = (
  segments: readonly DealProgressSegment[] | undefined,
): readonly NormalizedDealProgressSegment[] => {
  if (!segments || segments.length === 0) {
    return []
  }

  const clampedSegments = segments.map((segment) => ({
    ...segment,
    visualBasisPoints: clampBasisPoints(segment.basisPoints),
  }))
  const total = clampedSegments.reduce((sum, segment) => sum + segment.visualBasisPoints, 0)

  if (total <= maxBasisPoints) {
    return clampedSegments
  }

  let allocated = 0

  return clampedSegments.map((segment, index) => {
    const isLast = index === clampedSegments.length - 1
    const visualBasisPoints = isLast
      ? Math.max(maxBasisPoints - allocated, 0)
      : Math.floor((segment.visualBasisPoints / total) * maxBasisPoints)

    allocated += visualBasisPoints

    return {
      ...segment,
      visualBasisPoints,
    }
  })
}

export const isActionDisabled = (action: DealProgressAction) =>
  action.disabledReason !== undefined && action.disabledReason.length > 0

export const getActionDisabledReason = (action: DealProgressAction) =>
  isActionDisabled(action) ? action.disabledReason : undefined

export const getPrimaryAction = (state: DealProgressPanelState): DealProgressAction | undefined => {
  if (state.kind !== 'ready' || !state.actions.primary) {
    return undefined
  }

  return isActionVisibleForState(state.actions.primary, state) ? state.actions.primary : undefined
}

export const getSecondaryActions = (
  state: DealProgressPanelState,
): readonly DealProgressAction[] => {
  if (state.kind !== 'ready') {
    return []
  }

  return (state.actions.secondary ?? []).filter((action) => isActionVisibleForState(action, state))
}

export const getPanelVisualState = (state: DealProgressPanelState) =>
  match(state)
    .returnType<'loading' | 'error' | 'ready' | 'stale' | 'issue' | 'unavailable'>()
    .with({ kind: 'loading' }, () => 'loading')
    .with({ kind: 'error' }, () => 'error')
    .with({ kind: 'ready', dataQuality: { kind: 'stale' } }, () => 'stale')
    .with({ kind: 'ready', dataQuality: { kind: 'issue' } }, () => 'issue')
    .with({ kind: 'ready', dataQuality: { kind: 'unavailable' } }, () => 'unavailable')
    .with({ kind: 'ready' }, () => 'ready')
    .exhaustive()

const isActionVisibleForState = (
  action: DealProgressAction,
  state: Extract<DealProgressPanelState, { readonly kind: 'ready' }>,
) => {
  if ((terminalStages as readonly string[]).includes(state.stage) || state.mode === 'closed') {
    return !(terminalActionKinds as readonly string[]).includes(action.kind)
  }

  if (action.audience === 'admin' && state.visibility?.kind === 'readonly') {
    return false
  }

  return true
}
