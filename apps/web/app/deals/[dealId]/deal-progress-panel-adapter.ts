import type {
  DealProgressActions,
  DealProgressPanelProps,
  DealProgressPanelState,
  DealProgressStatus,
} from '@repo/kit/deal-progress-panel'

import type { DealOperationalCenterDTO, DealSummaryDTO } from '@/server/deals'

import { basisPoints, compositionBasisPoints } from './deal-operational-capital-helpers'
import { formatMoney } from './deal-operational-formatting'
import { readinessTone } from './deal-operational-labels'

type ReadyProgressPanelState = Extract<DealProgressPanelState, { readonly kind: 'ready' }>
type ActiveReadyProgressPanelState = Exclude<ReadyProgressPanelState, { readonly mode: 'closed' }>
type ClosedReadyProgressPanelState = Extract<ReadyProgressPanelState, { readonly mode: 'closed' }>
type DealProgressVisibility = NonNullable<ReadyProgressPanelState['visibility']>
type DealProgressActionableVisibility = Exclude<
  DealProgressVisibility,
  { readonly kind: 'readonly' }
>
type DealProgressAvailableActions = Extract<DealProgressActions, { readonly kind: 'available' }>
type DealProgressActionHandler = NonNullable<DealProgressPanelProps['onAction']>

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

export const mapDealProgressPanelProps = (
  data: DealOperationalCenterDTO,
  onAction: DealProgressActionHandler,
): DealProgressPanelProps => ({
  labels: {
    capitalBreakdownLabel: 'Capital breakdown',
    capitalCompositionLabel: 'Capital composition',
    progressCappedLabel: 'capped',
    progressAriaLabel: 'Deal capital progress',
    title: 'Deal progression',
  },
  onAction,
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

const mapDealProgressActions = (data: DealOperationalCenterDTO): DealProgressAvailableActions => ({
  kind: 'available',
  primary: {
    audience: 'admin',
    availability: 'enabled',
    kind: 'invite',
    label:
      data.deal.access.pendingAccessRequestCount > 0
        ? `Review ${data.deal.access.pendingAccessRequestCount} access requests`
        : 'Invite investors',
  },
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
