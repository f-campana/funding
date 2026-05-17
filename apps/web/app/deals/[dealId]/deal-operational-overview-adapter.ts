import type {
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewState,
} from '@repo/kit'

import type { DealOperationalCenterDTO } from '@/server/deals'

import { mapOperationalActivity } from './deal-operational-activity-helpers'
import {
  getBlockerSummary,
  getUnresolvedBlockerCounts,
  mapOperationalBlocker,
  selectPriorityBlockers,
} from './deal-operational-blocker-helpers'
import {
  amountDescription,
  amountTone,
  getCapitalProgressLabel,
  getCapitalSupportingLabel,
  getUnmatchedReceivedAmount,
  progressPercent,
} from './deal-operational-capital-helpers'
import { formatMoney, pluralize } from './deal-operational-formatting'
import {
  getOperationalReadinessLabel,
  getReadinessNextActionLabel,
} from './deal-operational-labels'

type ReadyOperationalOverviewState = Extract<
  DealOperationalOverviewState,
  { readonly kind: 'ready' }
>

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
  subtitle: 'Close-readiness view for priority blockers, capital exceptions, and recent movement.',
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
