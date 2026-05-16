import type { ComponentProps } from 'react'

import {
  DealCommitmentsTable,
  type DealCommitmentsTableLifecycleState,
} from '../../commitment/deal-commitments-table'
import {
  dealCommitmentsTableLabels,
  lockedCommitmentRows,
} from '../../commitment/deal-commitments-table/deal-commitments-table-fixtures'
import { StoryGrid, StorySection, StoryStack } from '../../stories/story-layout'
import { DealProgressPanel } from './deal-progress-panel'
import {
  adminOnlyState,
  closedCompletedState,
  dataIssueState,
  dealProgressPanelLabels,
  defaultCollectingCommitmentsState,
  disabledActionsState,
  errorState,
  loadingState,
  moveToContractingState,
  noTargetKnownState,
  ongoingClosingState,
  openForInterestsState,
  overTargetCappedState,
  readonlyNonAdminState,
  readyToCloseState,
  segmentedProgressState,
  zeroProgressState,
} from './deal-progress-panel-fixtures'

const meta = {
  component: DealProgressPanel,
  title: 'Kit/Deal/DealProgressPanel',
}

export default meta

const renderPanel = (
  props: Partial<ComponentProps<typeof DealProgressPanel>> = {},
  className = 'w-full max-w-md',
) => (
  <StorySection
    className={className}
    description="Roundtable-style command panel for deal progression, capital breakdown, and workflow actions."
    title="Deal progression panel"
  >
    <DealProgressPanel
      labels={dealProgressPanelLabels}
      state={defaultCollectingCommitmentsState}
      {...props}
    />
  </StorySection>
)

const markStoryAction = (kind: string) => {
  document.body.dataset.dealProgressAction = kind
}

const assertStory: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) {
    throw new globalThis.Error(message)
  }
}

const getStoryButton = (root: ParentNode, label: string) => {
  const button = Array.from(root.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  )

  assertStory(button instanceof HTMLButtonElement, `Expected "${label}" button to render.`)

  return button
}

const readyTableState = (): Extract<
  DealCommitmentsTableLifecycleState,
  { readonly kind: 'ready' }
> => ({
  kind: 'ready',
  rows: lockedCommitmentRows,
})

export const DefaultCollectingCommitments = {
  render: () => renderPanel(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(canvasElement.textContent?.includes('Deal progression'), 'Expected title.')
    assertStory(canvasElement.textContent?.includes('Collecting commitments'), 'Expected status.')
    assertStory(canvasElement.textContent?.includes('€100,000 / €200,000'), 'Expected headline.')
  },
}

export const OngoingClosing = {
  render: () => renderPanel({ state: ongoingClosingState }),
}

export const OpenForInterests = {
  render: () => renderPanel({ state: openForInterestsState }),
}

export const MoveToContracting = {
  render: () => renderPanel({ state: moveToContractingState }),
}

export const ReadyToClose = {
  render: () => renderPanel({ state: readyToCloseState }),
}

export const ClosedCompleted = {
  render: () => renderPanel({ state: closedCompletedState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(!canvasElement.textContent?.includes('Close deal'), 'Closed panel hides close CTA.')
    assertStory(!canvasElement.textContent?.includes('Invite'), 'Closed panel hides invite CTA.')
  },
}

export const SegmentedProgress = {
  render: () => renderPanel({ state: segmentedProgressState }),
}

export const ZeroProgress = {
  render: () => renderPanel({ state: zeroProgressState }),
}

export const OverTargetCapped = {
  render: () => renderPanel({ state: overTargetCappedState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const progress = canvasElement.querySelector('[data-slot="deal-progress-bar"]')

    assertStory(progress?.getAttribute('data-capped') === 'true', 'Expected capped progress.')
  },
}

export const NoTargetKnown = {
  render: () => renderPanel({ state: noTargetKnownState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const progress = canvasElement.querySelector('[role="progressbar"]')

    assertStory(progress, 'Expected progressbar.')
    assertStory(!progress.hasAttribute('aria-valuenow'), 'No-target progress is indeterminate.')
  },
}

export const Loading = {
  render: () => renderPanel({ state: loadingState }),
}

export const ErrorState = {
  name: 'Error',
  render: () =>
    renderPanel({
      onAction: (event) => markStoryAction(event.kind),
      state: errorState,
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    getStoryButton(canvasElement, 'Retry').click()
    assertStory(document.body.dataset.dealProgressAction === 'retry', 'Retry action fired.')
  },
}

export const ReadonlyNonAdmin = {
  render: () => renderPanel({ state: readonlyNonAdminState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(!canvasElement.querySelector('button'), 'Readonly panel hides admin actions.')
  },
}

export const DisabledActions = {
  render: () => renderPanel({ state: disabledActionsState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const button = getStoryButton(canvasElement, 'Close deal')

    assertStory(button.disabled, 'Close action is disabled.')
    assertStory(
      canvasElement.textContent?.includes('Resolve pending KYC/KYB'),
      'Disabled reason renders.',
    )
  },
}

export const AdminOnly = {
  render: () => renderPanel({ state: adminOnlyState }),
}

export const DataIssue = {
  render: () => renderPanel({ state: dataIssueState }),
}

export const DarkCardOnLightWorkspace = {
  render: () => (
    <div className="min-h-[620px] bg-background p-8">
      {renderPanel({}, 'ml-auto w-full max-w-md')}
    </div>
  ),
}

export const MacBook14RightRailContext = {
  render: () => (
    <StorySection
      className="w-[min(96vw,1512px)]"
      description="Simulates a 14-inch workspace with primary content and a right command panel."
      title="MacBook 14 right rail context"
    >
      <div className="grid min-h-[720px] gap-5 rounded-xl border border-border bg-background p-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-4">
          <div className="h-36 rounded-xl border border-border bg-card shadow-card" />
          <div className="h-72 rounded-xl border border-border bg-card shadow-card" />
        </div>
        <DealProgressPanel
          labels={dealProgressPanelLabels}
          state={defaultCollectingCommitmentsState}
        />
      </div>
    </StorySection>
  ),
}

export const WithCommitmentsTableContext = {
  render: () => (
    <StorySection
      className="w-[min(96vw,1512px)]"
      description="Shows the progression panel paired with the isolated commitments workflow table."
      title="Panel with commitments table"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <DealCommitmentsTable
          footer={dealCommitmentsTableLabels.footer}
          state={readyTableState()}
          subtitle={dealCommitmentsTableLabels.subtitle}
          title={dealCommitmentsTableLabels.title}
          toolbar={dealCommitmentsTableLabels.toolbar}
        />
        <DealProgressPanel labels={dealProgressPanelLabels} state={ongoingClosingState} />
      </div>
    </StorySection>
  ),
}

export const StateBoard = {
  render: () => (
    <StoryStack className="max-w-6xl">
      <StoryGrid>
        <DealProgressPanel
          labels={dealProgressPanelLabels}
          state={defaultCollectingCommitmentsState}
        />
        <DealProgressPanel labels={dealProgressPanelLabels} state={readyToCloseState} />
        <DealProgressPanel labels={dealProgressPanelLabels} state={overTargetCappedState} />
        <DealProgressPanel labels={dealProgressPanelLabels} state={noTargetKnownState} />
        <DealProgressPanel labels={dealProgressPanelLabels} state={disabledActionsState} />
        <DealProgressPanel labels={dealProgressPanelLabels} state={dataIssueState} />
      </StoryGrid>
    </StoryStack>
  ),
}
