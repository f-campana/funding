import type { DealProgressPanelProps, DealProgressPanelState } from '@repo/kit'

import type {
  ClosingReadinessDTO,
  DealOperationalCenterDTO,
  DealSummaryDTO,
  MoneyMinorUnitsDTO,
  ReadinessDimensionStateDTO,
} from '@/server/deals'

export const formatMoney = (money: MoneyMinorUnitsDTO): string =>
  new Intl.NumberFormat('en-US', {
    currency: money.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
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

export const getDimensionStateLabel = (state: ReadinessDimensionStateDTO): string =>
  ({
    attention: 'Attention',
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
