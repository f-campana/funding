import type {
  DealOperationalActivityItem,
  DealOperationalActivityTone,
  DealOperationalBlocker,
  DealOperationalMetricTone,
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewState,
  DealOperationalReadinessState,
  DealProgressPanelProps,
  DealProgressPanelState,
} from '@repo/kit'

import type {
  ClosingReadinessDTO,
  DealOperationalCenterDTO,
  DealSummaryDTO,
  MoneyMinorUnitsDTO,
} from '@/server/deals'

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

export const getReadinessLabel = (state: ClosingReadinessDTO['state']): string =>
  ({
    attention: 'Attention needed',
    blocked: 'Blocked',
    not_started: 'Not started',
    ready: 'Ready',
  })[state]

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
): DealOperationalOverviewState => ({
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
        ...(data.capital.hasUnmatchedFunds
          ? { description: 'Finance still needs to match received wires.' }
          : {}),
        tone: data.capital.hasUnmatchedFunds ? 'danger' : 'success',
      },
      {
        label: 'Unmatched received',
        value: formatMoney(data.capital.unmatchedReceived),
        tone: amountTone(data.capital.unmatchedReceived, 'danger', 'neutral'),
      },
    ],
    progress: {
      label: getCapitalProgressLabel(data),
      value: progressPercent(
        data.capital.committedAmount.amountMinor,
        data.capital.targetAmount.amountMinor,
      ),
    },
    supportingLabel: `${formatMoney(data.capital.remainingToTarget)} remaining to target`,
    targetLabel: `${formatMoney(data.capital.targetAmount)} target`,
  },
  kind: 'ready',
  readiness: {
    blockerCounts: [
      { count: data.readiness.criticalBlockerCount, label: 'Critical', severity: 'critical' },
      { count: data.readiness.warningBlockerCount, label: 'Warning', severity: 'warning' },
      { count: data.readiness.infoBlockerCount, label: 'Info', severity: 'info' },
    ],
    dimensions: data.readiness.dimensions.map((dimension) => ({
      blockerCount: dimension.blockerCount,
      description: getDimensionDescription(dimension),
      id: dimension.id,
      label: dimension.label,
      state: dimension.state,
    })),
    label: getOperationalReadinessLabel(data.readiness.state),
    nextAction: data.readiness.nextActionLabel,
    state: data.readiness.state,
  },
})

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
  state: mapDealProgressPanelState(data),
})

const mapDealProgressPanelState = (data: DealOperationalCenterDTO): DealProgressPanelState => ({
  actions: {
    primary: {
      disabledReason: data.readiness.state === 'ready' ? undefined : data.readiness.nextActionLabel,
      kind: 'closeDeal',
      label: 'Close deal',
    },
    secondary: [
      {
        kind: 'invite',
        label:
          data.deal.access.pendingAccessRequestCount > 0
            ? `Review ${data.deal.access.pendingAccessRequestCount} access requests`
            : 'Invite investors',
      },
    ],
  },
  capital: {
    amountRaisedLabel: formatMoney(data.capital.committedAmount),
    breakdown: [
      {
        amountLabel: formatMoney(data.capital.economics.netInvestableAmount),
        basisPoints: compositionBasisPoints(
          data.capital.economics.netInvestableAmount,
          data.capital,
        ),
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
        description: data.capital.hasUnmatchedFunds
          ? 'Finance still needs to match received wires.'
          : undefined,
        label: 'Matched',
        value: formatMoney(data.capital.matchedAmount),
        tone: data.capital.hasUnmatchedFunds ? 'danger' : 'default',
      },
    ],
    headlineLabel: `${formatMoney(data.capital.committedAmount)} / ${formatMoney(
      data.capital.targetAmount,
    )}`,
    progress: {
      basisPoints: basisPoints(data.capital.committedAmount, data.capital.targetAmount),
      capped: data.capital.isOverTarget,
      kind: 'knownTarget',
      label: 'Committed capital / target',
    },
    targetAmountLabel: formatMoney(data.capital.targetAmount),
  },
  dataQuality: {
    kind: 'fresh',
    label: `Generated ${formatDateTimeLabel(data.generatedAt)}`,
  },
  kind: 'ready',
  mode: data.deal.closingMode === 'ongoing' ? 'ongoingClosing' : 'standardClosing',
  stage: mapDealProgressStage(data.deal.stage),
  status: {
    label: data.deal.stageLabel,
    tone: readinessTone(data.readiness.state),
  },
  visibility: {
    kind: data.deal.access.sharingMode === 'request_access' ? 'restricted' : 'adminOnly',
    label:
      data.deal.access.sharingMode === 'request_access'
        ? `${data.deal.access.pendingAccessRequestCount} access requests pending`
        : 'Admin-only deal workspace',
  },
})

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

const mapDealProgressStage = (
  stage: DealSummaryDTO['stage'],
): Extract<DealProgressPanelState, { readonly kind: 'ready' }>['stage'] => {
  if (stage === 'draft') {
    return 'draft'
  }

  if (stage === 'internal_review' || stage === 'open_for_preview') {
    return 'moderation'
  }

  if (
    stage === 'open_for_interests' ||
    stage === 'collecting_commitments' ||
    stage === 'reviewing_commitments'
  ) {
    return 'open'
  }

  if (stage === 'contracting' || stage === 'awaiting_wires') {
    return 'preClosing'
  }

  if (stage === 'closing_review') {
    return 'closing'
  }

  if (stage === 'closed' || stage === 'portfolio_active') {
    return 'invested'
  }

  if (stage === 'partially_exited' || stage === 'exited') {
    return 'exited'
  }

  return 'canceled'
}

const readinessTone = (
  state: ClosingReadinessDTO['state'],
): Extract<DealProgressPanelState, { readonly kind: 'ready' }>['status']['tone'] =>
  (
    ({
      attention: 'attention',
      blocked: 'danger',
      not_started: 'neutral',
      ready: 'success',
    }) as const satisfies Record<
      ClosingReadinessDTO['state'],
      Extract<DealProgressPanelState, { readonly kind: 'ready' }>['status']['tone']
    >
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
  ({
    attention: 'Attention needed',
    blocked: 'Blocked from close',
    not_started: 'Readiness not started',
    ready: 'Ready to close',
  })[state]

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

const getCapitalProgressLabel = (data: DealOperationalCenterDTO): string => {
  if (data.capital.isOverTarget) {
    return `${formatMoney(data.capital.overTarget)} over target`
  }

  return `${progressPercent(
    data.capital.committedAmount.amountMinor,
    data.capital.targetAmount.amountMinor,
  )}% of target committed`
}

const getBlockerSummary = (data: DealOperationalCenterDTO): string => {
  if (data.readiness.unresolvedBlockerCount === 0) {
    return 'All close-critical blockers are resolved.'
  }

  const blockerNoun = pluralize(data.readiness.unresolvedBlockerCount, 'blocker')
  const criticalQualifier =
    data.readiness.criticalBlockerCount > 0
      ? ' Critical identity and wire blockers remain in view.'
      : ''

  return `${data.readiness.unresolvedBlockerCount} close-impacting ${blockerNoun} remain. Capital and timing blockers are shown first.${criticalQualifier}`
}

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
