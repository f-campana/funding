import type {
  DealOperationalActivityItem,
  DealOperationalActivityTone,
  DealOperationalBlocker,
  DealOperationalMetricTone,
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewState,
  DealOperationalReadinessState,
  DealProgressActions,
  DealProgressPanelProps,
  DealProgressPanelState,
  DealProgressStatus,
} from '@repo/kit'

import type {
  CapitalMatchingDTO,
  CapitalReconciliationDTO,
  CapitalTargetPositionDTO,
  ClosingReadinessDTO,
  DealOperationalCenterDTO,
  DealSummaryDTO,
  MoneyMinorUnitsDTO,
} from '@/server/deals'

type ReadyProgressPanelState = Extract<DealProgressPanelState, { readonly kind: 'ready' }>
type ActiveReadyProgressPanelState = Exclude<ReadyProgressPanelState, { readonly mode: 'closed' }>
type ClosedReadyProgressPanelState = Extract<ReadyProgressPanelState, { readonly mode: 'closed' }>
type ReadyOperationalOverviewState = Extract<
  DealOperationalOverviewState,
  { readonly kind: 'ready' }
>
type DealProgressVisibility = NonNullable<ReadyProgressPanelState['visibility']>
type DealProgressActionableVisibility = Exclude<
  DealProgressVisibility,
  { readonly kind: 'readonly' }
>
type DealProgressAvailableActions = Extract<DealProgressActions, { readonly kind: 'available' }>
type DealProgressStatusTone = DealProgressStatus['tone']

type ActiveDealProgressWorkflow =
  | {
      readonly stage: 'draft'
      readonly mode: 'openForInterests'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'draft' }>
    }
  | {
      readonly stage: 'moderation'
      readonly mode: 'openForInterests'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'moderation' }>
    }
  | {
      readonly stage: 'open'
      readonly mode: 'openForInterests'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'openForInterests' }>
    }
  | {
      readonly stage: 'open'
      readonly mode: 'collectingCommitments'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'collectingCommitments' }>
    }
  | {
      readonly stage: 'open' | 'closing'
      readonly mode: 'ongoingClosing'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'ongoingClosing' }>
    }
  | {
      readonly stage: 'open' | 'closing'
      readonly mode: 'standardClosing'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'standardClosing' }>
    }
  | {
      readonly stage: 'preClosing' | 'closing'
      readonly mode: 'contracting'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'contracting' }>
    }
  | {
      readonly stage: 'preClosing' | 'closing'
      readonly mode: 'readyToClose'
      readonly status: Extract<DealProgressStatus, { readonly kind: 'readyToClose' }>
    }

type ClosedDealProgressWorkflow = {
  readonly stage: 'invested' | 'completed' | 'exited' | 'canceled'
  readonly mode: 'closed'
  readonly status: Extract<
    DealProgressStatus,
    { readonly kind: 'invested' | 'completed' | 'exited' | 'canceled' }
  >
}

type DealProgressWorkflow = ActiveDealProgressWorkflow | ClosedDealProgressWorkflow

export const formatMoney = (money: MoneyMinorUnitsDTO): string =>
  new Intl.NumberFormat('en-US', {
    currency: money.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(money.amountMinor / 100)

export const formatDateTimeLabel = (value: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date(value))

const READINESS_LABELS = {
  attention: 'Attention needed',
  blocked: 'Blocked',
  not_started: 'Not started',
  ready: 'Ready',
} as const satisfies Record<ClosingReadinessDTO['state'], string>

const OPERATIONAL_READINESS_LABELS = {
  attention: 'Attention needed',
  blocked: 'Blocked from close',
  not_started: 'Readiness not started',
  ready: 'Ready to close',
} as const satisfies Record<DealOperationalReadinessState, string>

const READINESS_NEXT_ACTION_LABELS = {
  attention: 'Review operational exceptions before close',
  blocked: 'Resolve blocking operational exceptions before close',
  not_started: 'Start operational readiness review',
  ready: 'Proceed to closing review',
} as const satisfies Record<ClosingReadinessDTO['state'], string>

export const getReadinessLabel = (state: ClosingReadinessDTO['state']): string =>
  READINESS_LABELS[state]

export const getDealHeaderViewModel = (deal: DealSummaryDTO) => ({
  description: `${deal.companyName} closing operations for ${deal.vehicle.name} in ${deal.vehicle.jurisdiction}.`,
  lastUpdatedLabel: formatDateTimeLabel(deal.lastUpdatedAt),
  statusLabel: deal.stageLabel,
  targetCloseDateLabel: formatDateTimeLabel(deal.targetCloseDate),
  title: deal.name,
  vehicleLabel: `${deal.vehicle.name} - ${deal.vehicle.jurisdiction}`,
})

const dealOperationalOverviewLabels = {
  activityTitle: 'Latest activity',
  blockerCountsLabel: 'Blocker counts by severity',
  blockerDocumentsLabel: 'Documents',
  blockerDueLabel: 'Due',
  blockerInvestorsLabel: 'Investors',
  blockerOwnerLabel: 'Owner',
  blockerSurfaceLabel: 'Surface',
  blockersTitle: 'Priority blockers',
  capitalEconomicsTitle: 'Economics',
  capitalMetricsTitle: 'Reconciliation metrics',
  capitalProgressAriaLabel: 'Capital reconciliation progress',
  capitalTitle: 'Capital reconciliation',
  dimensionsTitle: 'Readiness dimensions',
  loadingLabel: 'Loading operational overview',
  nextActionLabel: 'Next action',
  noActivityLabel: 'No recent operational activity.',
  noBlockersLabel: 'No priority blockers are open.',
  readinessTitle: 'Closing readiness',
  subtitle: 'Mission-control view for close readiness, blockers, capital, and recent movement.',
  title: 'Operational overview',
} as const satisfies DealOperationalOverviewLabels

export const mapDealOperationalOverviewProps = (
  data: DealOperationalCenterDTO,
): DealOperationalOverviewProps => ({
  labels: dealOperationalOverviewLabels,
  state: mapDealOperationalOverviewState(data),
})

const mapDealOperationalOverviewState = (
  data: DealOperationalCenterDTO,
): ReadyOperationalOverviewState => {
  const blockerCounts = getUnresolvedBlockerCounts(data)
  const matching = data.capital.matching
  const unmatchedReceived = getUnmatchedReceivedAmount(
    matching,
    data.capital.receivedAmount.currency,
  )

  return {
    activity: [...data.activity]
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
      .slice(0, 4)
      .map(mapOperationalActivity),
    blockerSummary: getBlockerSummary(data),
    blockers: selectPriorityBlockers(data).map((blocker) => mapOperationalBlocker(blocker, data)),
    capital: {
      economics: [
        {
          label: 'Net investable amount',
          tone: 'success',
          value: formatMoney(data.capital.economics.netInvestableAmount),
        },
        {
          label: 'Entry fees',
          value: formatMoney(data.capital.economics.entryFees),
        },
        {
          label: 'SPV fee',
          value: formatMoney(data.capital.economics.spvFee),
        },
        {
          label: 'Carry',
          value: `${data.capital.economics.carryPercent}%`,
        },
      ],
      headlineLabel: `${formatMoney(data.capital.committedAmount)} committed`,
      matchedLabel: `${formatMoney(data.capital.matchedAmount)} matched`,
      metrics: [
        {
          label: 'Signed',
          value: formatMoney(data.capital.signedAmount),
          ...amountDescription(data.capital.unsignedCommitted, 'committed capital not yet signed'),
          tone: amountTone(data.capital.unsignedCommitted, 'attention', 'success'),
        },
        {
          label: 'Received',
          value: formatMoney(data.capital.receivedAmount),
          ...amountDescription(data.capital.unreceivedSigned, 'signed capital not yet received'),
          tone: amountTone(data.capital.unreceivedSigned, 'attention', 'success'),
        },
        {
          label: 'Matched',
          value: formatMoney(data.capital.matchedAmount),
          ...(matching.kind === 'unmatched'
            ? { description: 'Finance still needs to match received wires.' }
            : {}),
          tone: matching.kind === 'unmatched' ? 'danger' : 'success',
        },
        {
          label: 'Unmatched received',
          value: formatMoney(unmatchedReceived),
          tone: amountTone(unmatchedReceived, 'danger', 'neutral'),
        },
      ],
      progress: {
        label: getCapitalProgressLabel(data.capital),
        value: progressPercent(
          data.capital.committedAmount.amountMinor,
          data.capital.targetAmount.amountMinor,
        ),
      },
      supportingLabel: getCapitalSupportingLabel(data.capital.targetPosition),
      targetLabel: `${formatMoney(data.capital.targetAmount)} target`,
    },
    kind: 'ready',
    readiness: {
      blockerCounts: [
        { count: blockerCounts.critical, label: 'Critical', severity: 'critical' },
        { count: blockerCounts.warning, label: 'Warning', severity: 'warning' },
        { count: blockerCounts.info, label: 'Info', severity: 'info' },
      ],
      dimensions: data.readiness.dimensions.map((dimension) => ({
        blockerCount: dimension.blockerCount,
        description: getDimensionDescription(dimension),
        id: dimension.id,
        label: dimension.label,
        state: dimension.state,
      })),
      label: getOperationalReadinessLabel(data.readiness.state),
      nextAction: getReadinessNextActionLabel(data.readiness.state),
      state: data.readiness.state,
    },
  }
}

export const mapDealProgressPanelProps = (
  data: DealOperationalCenterDTO,
): DealProgressPanelProps => ({
  labels: {
    capitalBreakdownLabel: 'Capital breakdown',
    capitalCompositionLabel: 'Capital composition',
    progressCappedLabel: 'capped',
    progressAriaLabel: 'Deal capital progress',
    title: 'Deal progression',
  },
  onAction: () => undefined,
  state: mapDealProgressPanelState(data),
})

const mapDealProgressPanelState = (data: DealOperationalCenterDTO): ReadyProgressPanelState => {
  const workflow = mapDealProgressWorkflow(data)
  const readyBase = {
    capital: mapDealProgressCapital(data),
    dataQuality: { kind: 'fresh' },
    kind: 'ready',
  } as const

  if (workflow.mode === 'closed') {
    return {
      ...readyBase,
      ...workflow,
      actions: { kind: 'none' },
      visibility: mapDealVisibility(data.deal.access),
    } satisfies ClosedReadyProgressPanelState
  }

  return {
    ...readyBase,
    ...workflow,
    actions: mapDealProgressActions(data),
    visibility: mapDealVisibility(data.deal.access),
  } satisfies ActiveReadyProgressPanelState
}

const mapDealProgressCapital = (
  data: DealOperationalCenterDTO,
): ReadyProgressPanelState['capital'] => ({
  breakdown: [
    {
      amountLabel: formatMoney(data.capital.economics.netInvestableAmount),
      basisPoints: compositionBasisPoints(data.capital.economics.netInvestableAmount, data.capital),
      kind: 'investable',
      label: 'Investable',
      tone: 'success',
    },
    {
      amountLabel: formatMoney(data.capital.economics.entryFees),
      basisPoints: compositionBasisPoints(data.capital.economics.entryFees, data.capital),
      kind: 'entryFees',
      label: 'Entry fees',
      tone: 'info',
    },
    {
      amountLabel: formatMoney(data.capital.economics.spvFee),
      basisPoints: compositionBasisPoints(data.capital.economics.spvFee, data.capital),
      kind: 'spvFees',
      label: 'SPV fees',
      tone: 'attention',
    },
  ],
  details: [
    {
      label: 'Signed',
      value: formatMoney(data.capital.signedAmount),
    },
    {
      label: 'Received',
      value: formatMoney(data.capital.receivedAmount),
      tone: data.capital.unreceivedSigned.amountMinor > 0 ? 'attention' : 'default',
    },
    {
      description:
        data.capital.matching.kind === 'unmatched'
          ? 'Finance still needs to match received wires.'
          : undefined,
      label: 'Matched',
      value: formatMoney(data.capital.matchedAmount),
      tone: data.capital.matching.kind === 'unmatched' ? 'danger' : 'default',
    },
  ],
  headlineLabel: `${formatMoney(data.capital.committedAmount)} / ${formatMoney(
    data.capital.targetAmount,
  )}`,
  progress: {
    basisPoints: basisPoints(data.capital.committedAmount, data.capital.targetAmount),
    capped: data.capital.targetPosition.kind === 'over_target',
    kind: 'knownTarget',
    label: 'Committed capital / target',
  },
})

export const getDealOperationalRailViewModel = (data: DealOperationalCenterDTO) => {
  const blockerCounts = getUnresolvedBlockerCounts(data)

  return {
    blockedInvestorCountLabel: String(getBlockedInvestorCount(data)),
    capitalCalloutLabel: 'Net investable amount',
    capitalCalloutValueLabel: formatMoney(data.capital.economics.netInvestableAmount),
    criticalBlockerCountLabel: String(blockerCounts.critical),
    documentIssueCountLabel: String(getRequiredDocumentIssueCount(data)),
    readinessLabel: getReadinessLabel(data.readiness.state),
    targetCloseDateLabel: formatDateTimeLabel(data.deal.targetCloseDate),
    warningBlockerCountLabel: String(blockerCounts.warning),
  }
}

const basisPoints = (part: MoneyMinorUnitsDTO, total: MoneyMinorUnitsDTO): number => {
  if (total.amountMinor <= 0) {
    return 0
  }

  return Math.max(0, Math.round((part.amountMinor / total.amountMinor) * 10_000))
}

const compositionBasisPoints = (
  part: MoneyMinorUnitsDTO,
  capital: DealOperationalCenterDTO['capital'],
): number => {
  const total =
    capital.economics.netInvestableAmount.amountMinor +
    capital.economics.entryFees.amountMinor +
    capital.economics.spvFee.amountMinor

  if (total <= 0) {
    return 0
  }

  return Math.max(0, Math.round((part.amountMinor / total) * 10_000))
}

const mapDealProgressActions = (data: DealOperationalCenterDTO): DealProgressAvailableActions => ({
  kind: 'available',
  primary:
    data.readiness.state === 'ready'
      ? {
          audience: 'admin',
          availability: 'enabled',
          kind: 'closeDeal',
          label: 'Close deal',
        }
      : {
          audience: 'admin',
          availability: 'disabled',
          disabledReason: getReadinessNextActionLabel(data.readiness.state),
          kind: 'closeDeal',
          label: 'Close deal',
        },
  secondary: [
    {
      audience: 'admin',
      availability: 'enabled',
      kind: 'invite',
      label:
        data.deal.access.pendingAccessRequestCount > 0
          ? `Review ${data.deal.access.pendingAccessRequestCount} access requests`
          : 'Invite investors',
    },
  ],
})

type DealProgressWorkflowMapper = (data: DealOperationalCenterDTO) => DealProgressWorkflow

const DEAL_PROGRESS_WORKFLOW_BY_LIFECYCLE = {
  awaiting_wires: (data) => ({
    mode: 'contracting',
    stage: 'preClosing',
    status: { kind: 'contracting', ...progressStatusBase(data) },
  }),
  cancelled: (data) => ({
    mode: 'closed',
    stage: 'canceled',
    status: { kind: 'canceled', ...progressStatusBase(data) },
  }),
  closed: (data) => ({
    mode: 'closed',
    stage: 'invested',
    status: { kind: 'invested', ...progressStatusBase(data) },
  }),
  collecting_commitments: (data) => ({
    mode: 'collectingCommitments',
    stage: 'open',
    status: { kind: 'collectingCommitments', ...progressStatusBase(data) },
  }),
  closing_review: (data) =>
    data.deal.closingMode === 'ongoing'
      ? {
          mode: 'ongoingClosing',
          stage: 'closing',
          status: { kind: 'ongoingClosing', ...progressStatusBase(data) },
        }
      : {
          mode: 'standardClosing',
          stage: 'closing',
          status: { kind: 'standardClosing', ...progressStatusBase(data) },
        },
  contracting: (data) => ({
    mode: 'contracting',
    stage: 'preClosing',
    status: { kind: 'contracting', ...progressStatusBase(data) },
  }),
  draft: (data) => ({
    mode: 'openForInterests',
    stage: 'draft',
    status: { kind: 'draft', ...progressStatusBase(data) },
  }),
  exited: (data) => ({
    mode: 'closed',
    stage: 'exited',
    status: { kind: 'exited', ...progressStatusBase(data) },
  }),
  internal_review: (data) => ({
    mode: 'openForInterests',
    stage: 'moderation',
    status: { kind: 'moderation', ...progressStatusBase(data) },
  }),
  open_for_interests: (data) => ({
    mode: 'openForInterests',
    stage: 'open',
    status: { kind: 'openForInterests', ...progressStatusBase(data) },
  }),
  open_for_preview: (data) => ({
    mode: 'openForInterests',
    stage: 'moderation',
    status: { kind: 'moderation', ...progressStatusBase(data) },
  }),
  partially_exited: (data) => ({
    mode: 'closed',
    stage: 'exited',
    status: { kind: 'exited', ...progressStatusBase(data) },
  }),
  portfolio_active: (data) => ({
    mode: 'closed',
    stage: 'invested',
    status: { kind: 'invested', ...progressStatusBase(data) },
  }),
  reviewing_commitments: (data) => ({
    mode: 'collectingCommitments',
    stage: 'open',
    status: { kind: 'collectingCommitments', ...progressStatusBase(data) },
  }),
} as const satisfies Record<DealSummaryDTO['stage'], DealProgressWorkflowMapper>

const mapDealProgressWorkflow = (data: DealOperationalCenterDTO): DealProgressWorkflow =>
  DEAL_PROGRESS_WORKFLOW_BY_LIFECYCLE[data.deal.stage](data)

const progressStatusBase = (data: DealOperationalCenterDTO) => ({
  label: data.deal.stageLabel,
  tone: readinessTone(data.readiness.state),
})

const mapDealVisibility = (access: DealSummaryDTO['access']): DealProgressActionableVisibility =>
  (
    ({
      anyone_with_link: {
        kind: 'public',
        label: 'Public deal workspace',
      },
      disabled: {
        kind: 'adminOnly',
        label: 'Admin-only deal workspace',
      },
      request_access: {
        kind: 'restricted',
        label: `${access.pendingAccessRequestCount} access requests pending`,
      },
    }) as const satisfies Record<
      DealSummaryDTO['access']['sharingMode'],
      DealProgressActionableVisibility
    >
  )[access.sharingMode]

const readinessTone = (state: ClosingReadinessDTO['state']): DealProgressStatusTone =>
  (
    ({
      attention: 'attention',
      blocked: 'danger',
      not_started: 'neutral',
      ready: 'success',
    }) as const satisfies Record<ClosingReadinessDTO['state'], DealProgressStatusTone>
  )[state]

const selectPriorityBlockers = (
  data: DealOperationalCenterDTO,
): readonly DealOperationalCenterDTO['blockers'][number][] => {
  const unresolvedBlockers = data.blockers.filter((blocker) => !blocker.resolved)
  const aboutBlockers = unresolvedBlockers.filter((blocker) => blocker.routeHint === 'about')
  const aboutBlockerIds = new Set(aboutBlockers.map((blocker) => blocker.id))
  const closeCriticalBlockers = unresolvedBlockers.filter(
    (blocker) => blocker.severity === 'critical' && !aboutBlockerIds.has(blocker.id),
  )
  const selectedBlockerIds = new Set([
    ...aboutBlockers.map((blocker) => blocker.id),
    ...closeCriticalBlockers.map((blocker) => blocker.id),
  ])
  const remainingBlockers = unresolvedBlockers.filter(
    (blocker) => !selectedBlockerIds.has(blocker.id),
  )

  return [...aboutBlockers, ...closeCriticalBlockers, ...remainingBlockers]
}

const mapOperationalBlocker = (
  blocker: DealOperationalCenterDTO['blockers'][number],
  data: DealOperationalCenterDTO,
): DealOperationalBlocker => {
  const investorCountLabel = countLabel(blocker.relatedInvestorIds.length, 'investor')
  const documentCountLabel = countLabel(blocker.relatedDocumentIds.length, 'document')
  const dueLabel = getBlockerDueLabel(blocker, data)

  return {
    description: blocker.description,
    id: blocker.id,
    owner: ownerLabel(blocker.owner),
    severity: blocker.severity,
    severityLabel: severityLabel(blocker.severity),
    surfaceLabel: blockerSurfaceLabel(blocker.type),
    title: blocker.title,
    ...(documentCountLabel === undefined ? {} : { documentCountLabel }),
    ...(dueLabel === undefined ? {} : { dueLabel }),
    ...(investorCountLabel === undefined ? {} : { investorCountLabel }),
  }
}

const mapOperationalActivity = (
  activity: DealOperationalCenterDTO['activity'][number],
): DealOperationalActivityItem => ({
  actor: activity.actorLabel,
  dateTime: activity.occurredAt,
  id: activity.id,
  summary: activity.summary,
  timestampLabel: formatDateTimeLabel(activity.occurredAt),
  tone: activityTone(activity.eventType),
  typeLabel: activityTypeLabel(activity.eventType),
})

const getOperationalReadinessLabel = (state: DealOperationalReadinessState): string =>
  OPERATIONAL_READINESS_LABELS[state]

const getReadinessNextActionLabel = (state: ClosingReadinessDTO['state']): string =>
  READINESS_NEXT_ACTION_LABELS[state]

const getDimensionDescription = (
  dimension: DealOperationalCenterDTO['readiness']['dimensions'][number],
): string => {
  if (dimension.blockerCount === 0) {
    return dimension.state === 'ready'
      ? 'No open blockers in this readiness dimension.'
      : 'Source operations still need review before this dimension can be marked ready.'
  }

  const blockerNoun = pluralize(dimension.blockerCount, 'blocker')

  if (dimension.state === 'blocked') {
    return `${dimension.blockerCount} ${blockerNoun} blocking this readiness dimension.`
  }

  return `${dimension.blockerCount} ${blockerNoun} need operator attention before close.`
}

const getCapitalProgressLabel = (capital: CapitalReconciliationDTO): string => {
  if (capital.targetPosition.kind === 'over_target') {
    return `${formatMoney(capital.targetPosition.overTarget)} over target`
  }

  return `${progressPercent(
    capital.committedAmount.amountMinor,
    capital.targetAmount.amountMinor,
  )}% of target committed`
}

const getCapitalSupportingLabel = (targetPosition: CapitalTargetPositionDTO): string => {
  if (targetPosition.kind === 'over_target') {
    return `${formatMoney(targetPosition.overTarget)} over target`
  }

  if (targetPosition.kind === 'under_target') {
    return `${formatMoney(targetPosition.remainingToTarget)} remaining to target`
  }

  return 'Target reached'
}

const getUnmatchedReceivedAmount = (
  matching: CapitalMatchingDTO,
  currency: MoneyMinorUnitsDTO['currency'],
): MoneyMinorUnitsDTO =>
  matching.kind === 'unmatched' ? matching.unmatchedReceived : { amountMinor: 0, currency }

const getBlockerSummary = (data: DealOperationalCenterDTO): string => {
  const blockerCounts = getUnresolvedBlockerCounts(data)
  const unresolvedBlockerCount = blockerCounts.critical + blockerCounts.warning + blockerCounts.info

  if (unresolvedBlockerCount === 0) {
    return 'All close-critical blockers are resolved.'
  }

  const blockerNoun = pluralize(unresolvedBlockerCount, 'blocker')
  const criticalQualifier =
    blockerCounts.critical > 0 ? ' Critical identity and wire blockers remain in view.' : ''

  return `${unresolvedBlockerCount} close-impacting ${blockerNoun} remain. Capital and timing blockers are shown first.${criticalQualifier}`
}

export const getUnresolvedBlockerCounts = (
  data: DealOperationalCenterDTO,
): Record<DealOperationalCenterDTO['blockers'][number]['severity'], number> => {
  const counts = { critical: 0, info: 0, warning: 0 }

  for (const blocker of data.blockers) {
    if (!blocker.resolved) {
      counts[blocker.severity] += 1
    }
  }

  return counts
}

export const getRequiredDocumentIssueCount = (data: DealOperationalCenterDTO): number =>
  data.documents.requirements.filter(
    (document) => document.required && REQUIRED_DOCUMENT_ISSUE_BY_STATUS[document.status],
  ).length

const REQUIRED_DOCUMENT_ISSUE_BY_STATUS = {
  approved: false,
  expired: true,
  missing: true,
  rejected: true,
  under_review: false,
  uploaded: false,
} as const satisfies Record<
  DealOperationalCenterDTO['documents']['requirements'][number]['status'],
  boolean
>

export const getBlockedInvestorCount = (data: DealOperationalCenterDTO): number =>
  data.investors.filter((investor) => investor.readinessState === 'blocked').length

const getBlockerDueLabel = (
  blocker: DealOperationalCenterDTO['blockers'][number],
  data: DealOperationalCenterDTO,
): string | undefined => {
  if (blocker.type === 'deadline') {
    return `Target close ${formatDateTimeLabel(data.deal.targetCloseDate)}`
  }

  const dueDates = data.documents.requirements
    .filter((document) => blocker.relatedDocumentIds.includes(document.id))
    .map((document) => document.dueDate)
    .filter((dueDate): dueDate is string => dueDate !== undefined)
    .sort()
  const earliestDueDate = dueDates.at(0)

  return earliestDueDate === undefined ? undefined : `Due ${formatDateTimeLabel(earliestDueDate)}`
}

const amountDescription = (amount: MoneyMinorUnitsDTO, label: string) =>
  amount.amountMinor > 0 ? { description: `${formatMoney(amount)} ${label}` } : {}

const amountTone = (
  amount: MoneyMinorUnitsDTO,
  positiveTone: DealOperationalMetricTone,
  zeroTone: DealOperationalMetricTone,
): DealOperationalMetricTone => (amount.amountMinor > 0 ? positiveTone : zeroTone)

const progressPercent = (part: number, total: number): number => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((part / total) * 100)))
}

const countLabel = (count: number, noun: string): string | undefined =>
  count > 0 ? `${count} ${pluralize(count, noun)}` : undefined

const pluralize = (count: number, noun: string): string => (count === 1 ? noun : `${noun}s`)

const severityLabel = (
  severity: DealOperationalCenterDTO['blockers'][number]['severity'],
): string =>
  ({
    critical: 'Critical',
    info: 'Info',
    warning: 'Warning',
  })[severity]

const ownerLabel = (owner: string): string =>
  owner
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const blockerSurfaceLabel = (type: DealOperationalCenterDTO['blockers'][number]['type']): string =>
  ({
    allocation: 'Capital allocation',
    compliance: 'Compliance',
    deadline: 'Closing readiness',
    document: 'Document operations',
    kyb: 'Investor identity',
    kyc: 'Investor identity',
    reconciliation: 'Capital reconciliation',
    signature: 'Signatures',
    wire: 'Wire operations',
  })[type]

const activityTypeLabel = (
  eventType: DealOperationalCenterDTO['activity'][number]['eventType'],
): string =>
  ({
    blocker_created: 'Blockers',
    blocker_resolved: 'Blockers',
    commitment_updated: 'Commitments',
    document_rejected: 'Documents',
    document_uploaded: 'Documents',
    signature_completed: 'Signatures',
    signature_sent: 'Signatures',
    wire_flagged: 'Wires',
    wire_matched: 'Wires',
  })[eventType]

const activityTone = (
  eventType: DealOperationalCenterDTO['activity'][number]['eventType'],
): DealOperationalActivityTone =>
  (
    ({
      blocker_created: 'attention',
      blocker_resolved: 'success',
      commitment_updated: 'neutral',
      document_rejected: 'attention',
      document_uploaded: 'info',
      signature_completed: 'success',
      signature_sent: 'info',
      wire_flagged: 'attention',
      wire_matched: 'success',
    }) as const satisfies Record<
      DealOperationalCenterDTO['activity'][number]['eventType'],
      DealOperationalActivityTone
    >
  )[eventType]
