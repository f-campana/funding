import type {
  DealProgressAction,
  DealProgressPanelState,
  DealProgressReadyState,
  DealProgressSegment,
  DealProgressVisualProgress,
} from './deal-progress-panel.types'

type NormalizedDealProgressSegment = DealProgressSegment & {
  readonly visualBasisPoints: number
}

export const maxBasisPoints = 10_000
export const minCompositionSegmentBasisPoints = 600

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
  progress.kind === 'knownTarget' ? clampBasisPoints(progress.basisPoints) / 100 : null

export const getProgressAriaValueText = ({
  cappedLabel,
  locale,
  progress,
}: {
  readonly progress: DealProgressVisualProgress
  readonly cappedLabel: string
  readonly locale?: string | undefined
}) => {
  if (progress.kind === 'noTarget') {
    return progress.label
  }

  const percentage = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(clampBasisPoints(progress.basisPoints) / 100)

  return progress.capped
    ? `${progress.label}: ${percentage}% ${cappedLabel}`
    : `${progress.label}: ${percentage}%`
}

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

export const normalizeCompositionSegments = (
  segments: readonly DealProgressSegment[] | undefined,
): readonly NormalizedDealProgressSegment[] => {
  const nonZeroSegments = normalizeSegments(segments).filter(
    (segment) => segment.visualBasisPoints > 0,
  )

  if (nonZeroSegments.length === 0) {
    return []
  }

  const total = nonZeroSegments.reduce((sum, segment) => sum + segment.visualBasisPoints, 0)
  let allocated = 0
  const proportionalSegments = nonZeroSegments.map((segment, index) => {
    const isLast = index === nonZeroSegments.length - 1
    const visualBasisPoints = isLast
      ? Math.max(maxBasisPoints - allocated, 0)
      : Math.floor((segment.visualBasisPoints / total) * maxBasisPoints)

    allocated += visualBasisPoints

    return {
      ...segment,
      visualBasisPoints,
    }
  })

  const adjustedSegments = proportionalSegments.map((segment) => ({
    ...segment,
    visualBasisPoints: Math.max(segment.visualBasisPoints, minCompositionSegmentBasisPoints),
  }))
  let overflow =
    adjustedSegments.reduce((sum, segment) => sum + segment.visualBasisPoints, 0) - maxBasisPoints

  return adjustedSegments.map((segment) => {
    if (overflow <= 0) {
      return segment
    }

    const reduction = Math.min(
      Math.max(segment.visualBasisPoints - minCompositionSegmentBasisPoints, 0),
      overflow,
    )
    overflow -= reduction

    return {
      ...segment,
      visualBasisPoints: segment.visualBasisPoints - reduction,
    }
  })
}

export const isActionDisabled = (action: DealProgressAction) => action.availability === 'disabled'

export const getActionDisabledReason = (action: DealProgressAction) =>
  action.availability === 'disabled' ? action.disabledReason : undefined

export const getPrimaryAction = (state: DealProgressPanelState): DealProgressAction | undefined => {
  if (state.kind !== 'ready' || state.actions.kind === 'none') {
    return undefined
  }

  return isActionVisibleForState(state.actions.primary, state) ? state.actions.primary : undefined
}

export const getSecondaryActions = (
  state: DealProgressPanelState,
): readonly DealProgressAction[] => {
  if (state.kind !== 'ready' || state.actions.kind === 'none') {
    return []
  }

  return (state.actions.secondary ?? []).filter((action) => isActionVisibleForState(action, state))
}

type DealProgressPanelVisualState =
  | 'loading'
  | 'error'
  | 'ready'
  | 'stale'
  | 'issue'
  | 'unavailable'

const panelVisualStateByDataQuality = {
  fresh: 'ready',
  issue: 'issue',
  stale: 'stale',
  unavailable: 'unavailable',
} as const satisfies Record<
  DealProgressReadyState['dataQuality']['kind'],
  DealProgressPanelVisualState
>

export const getPanelVisualState = (
  state: DealProgressPanelState,
): DealProgressPanelVisualState => {
  if (state.kind !== 'ready') {
    return state.kind
  }

  return panelVisualStateByDataQuality[state.dataQuality.kind]
}

const isActionVisibleForState = (action: DealProgressAction, state: DealProgressReadyState) => {
  if ((terminalStages as readonly string[]).includes(state.stage) || state.mode === 'closed') {
    return !(terminalActionKinds as readonly string[]).includes(action.kind)
  }

  if (action.audience === 'admin' && state.visibility?.kind === 'readonly') {
    return false
  }

  return true
}
