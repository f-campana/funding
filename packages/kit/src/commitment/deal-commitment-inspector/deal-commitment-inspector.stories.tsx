import type { ComponentProps } from 'react'

import { StorySection } from '../../stories/story-layout'
import {
  type CommitmentInvestorRow,
  DealCommitmentsTable,
  type DealCommitmentsTableLifecycleState,
} from '../deal-commitments-table'
import {
  dealCommitmentsTableLabels,
  lockedCommitmentRows,
} from '../deal-commitments-table/deal-commitments-table-fixtures'
import { DealCommitmentInspector } from './deal-commitment-inspector'
import {
  blockedCommitmentInspectorState,
  dealCommitmentInspectorLabels,
  documentIssueCommitmentInspectorState,
  emptyCommitmentInspectorState,
  errorCommitmentInspectorState,
  loadingCommitmentInspectorState,
  longTextCommitmentInspectorState,
  noActivityCommitmentInspectorState,
  noBlockersCommitmentInspectorState,
  noDocumentsCommitmentInspectorState,
  readyCommitmentInspectorState,
  wireIssueCommitmentInspectorState,
} from './deal-commitment-inspector-fixtures'

const meta = {
  component: DealCommitmentInspector,
  title: 'Kit/Commitment/DealCommitmentInspector',
}

export default meta

const renderInspector = (
  props: Partial<ComponentProps<typeof DealCommitmentInspector>> = {},
  className = 'w-[min(96vw,34rem)]',
) => (
  <StorySection
    className={className}
    description="Reusable commitment inspection content for one investor."
    title="Deal commitment inspector"
  >
    <DealCommitmentInspector
      {...({
        labels: dealCommitmentInspectorLabels,
        state: blockedCommitmentInspectorState,
        ...props,
      } as ComponentProps<typeof DealCommitmentInspector>)}
    />
  </StorySection>
)

const renderDarkInspector = (
  props: Partial<ComponentProps<typeof DealCommitmentInspector>> = {},
) => (
  <div className="dark bg-background p-6" data-theme="dark">
    {renderInspector(props)}
  </div>
)

export const DefaultBlocked = {
  render: () => renderInspector(),
}

export const ReadyInvestor = {
  render: () => renderInspector({ state: readyCommitmentInspectorState }),
}

export const WireIssue = {
  render: () => renderInspector({ state: wireIssueCommitmentInspectorState }),
}

export const DocumentIssue = {
  render: () => renderInspector({ state: documentIssueCommitmentInspectorState }),
}

export const NoBlockers = {
  render: () => renderInspector({ state: noBlockersCommitmentInspectorState }),
}

export const NoRelatedDocuments = {
  render: () => renderInspector({ state: noDocumentsCommitmentInspectorState }),
}

export const NoActivity = {
  render: () => renderInspector({ state: noActivityCommitmentInspectorState }),
}

export const Loading = {
  render: () => renderInspector({ state: loadingCommitmentInspectorState }),
}

export const Empty = {
  render: () => renderInspector({ state: emptyCommitmentInspectorState }),
}

export const ErrorState = {
  name: 'Error',
  render: () =>
    renderInspector({
      onAction: () => undefined,
      state: errorCommitmentInspectorState,
    }),
}

export const LongText = {
  render: () => renderInspector({ state: longTextCommitmentInspectorState }),
}

export const DarkDefault = {
  render: () => renderDarkInspector(),
}

export const NarrowPanel = {
  render: () => renderInspector({}, 'w-full max-w-[26rem]'),
}

const contextRows = [
  {
    attention: true,
    avatarTone: 'teal',
    commitmentLabel: '€1,250,000',
    commitmentSortValue: 1_250_000,
    entityName: 'Meridian Ventures II LP',
    id: 'meridian-ventures',
    investorInitials: 'MV',
    investorMeta: 'New investor · KYB evidence open',
    investorName: 'Meridian Ventures',
    readiness: {
      kycKyb: {
        key: 'kycKyb',
        label: 'KYC/KYB',
        value: 'KYB pending',
        variant: 'inReview',
      },
      reconciliation: {
        key: 'reconciliation',
        label: 'Reconciliation',
        value: 'Pending',
        variant: 'pending',
      },
      signature: {
        key: 'signature',
        label: 'Signature',
        value: 'Package sent',
        variant: 'pending',
      },
      wire: {
        key: 'wire',
        label: 'Wire',
        value: 'Not received',
        variant: 'notReceived',
      },
    },
    status: {
      label: 'Needs attention',
      tone: 'attention',
    },
  },
  ...lockedCommitmentRows.slice(0, 3),
] as const satisfies readonly CommitmentInvestorRow[]

const contextState = {
  kind: 'ready',
  pagination: { page: 1, pageSize: 4 },
  rowState: { drawerOpen: true, kind: 'active', rowId: 'meridian-ventures' },
  rows: contextRows,
} as const satisfies DealCommitmentsTableLifecycleState

export const WithCommitmentsTableContext = {
  render: () => (
    <StorySection
      className="w-[min(96vw,80rem)]"
      description="Table selection context with the inspector rendered as adjacent content."
      title="Commitments table with inspector context"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <DealCommitmentsTable
          footer={{
            investorsLabel: '4 investors',
            rangeLabel: '1-4 of 4',
            rowsPerPageLabel: 'Rows per page 4',
            totalCommittedLabel: 'Visible committed €61,250,000',
          }}
          labels={dealCommitmentsTableLabels.labels}
          state={contextState}
          subtitle={dealCommitmentsTableLabels.subtitle}
          title={dealCommitmentsTableLabels.title}
          toolbar={dealCommitmentsTableLabels.toolbar}
        />
        <DealCommitmentInspector
          labels={dealCommitmentInspectorLabels}
          state={blockedCommitmentInspectorState}
        />
      </div>
    </StorySection>
  ),
}
