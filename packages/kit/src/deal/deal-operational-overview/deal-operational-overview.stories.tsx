import { StorySection, StoryStack } from '../../stories/story-layout'
import { type DealProgressActionHandler, DealProgressPanel } from '../deal-progress-panel'
import {
  dealProgressPanelLabels,
  ongoingClosingState,
} from '../deal-progress-panel/deal-progress-panel-fixtures'
import {
  DealOperationalOverview,
  type DealOperationalOverviewActionHandler,
  type DealOperationalOverviewState,
} from './deal-operational-overview'
import {
  attentionOperationalOverviewState,
  blockedOperationalOverviewState,
  dealOperationalOverviewLabels,
  emptyOperationalOverviewState,
  errorOperationalOverviewState,
  loadingOperationalOverviewState,
  longTextOperationalOverviewState,
  readyOperationalOverviewState,
} from './deal-operational-overview-fixtures'

const meta = {
  component: DealOperationalOverview,
  title: 'Kit/Deal/DealOperationalOverview',
}

export default meta

type DealOperationalOverviewStoryProps = {
  readonly className?: string | undefined
  readonly onAction?: DealOperationalOverviewActionHandler | undefined
  readonly state?: DealOperationalOverviewState | undefined
}

const noopOverviewAction: DealOperationalOverviewActionHandler = () => undefined
const noopProgressAction: DealProgressActionHandler = () => undefined

const renderOverview = (
  props: DealOperationalOverviewStoryProps = {},
  className = 'w-full max-w-6xl',
) => (
  <StorySection
    className={className}
    description="Kit-first baseline for deal close readiness, capital reconciliation, blockers, and latest activity."
    title="Deal operational overview"
  >
    <DealOperationalOverview
      className={props.className}
      labels={dealOperationalOverviewLabels}
      onAction={props.onAction ?? noopOverviewAction}
      state={props.state ?? blockedOperationalOverviewState}
    />
  </StorySection>
)

export const DefaultBlocked = {
  render: () => renderOverview(),
}

export const ReadyToClose = {
  render: () => renderOverview({ state: readyOperationalOverviewState }),
}

export const Attention = {
  render: () => renderOverview({ state: attentionOperationalOverviewState }),
}

export const NoBlockersReady = {
  render: () => renderOverview({ state: readyOperationalOverviewState }),
}

export const Loading = {
  render: () => renderOverview({ state: loadingOperationalOverviewState }),
}

export const Empty = {
  render: () => renderOverview({ state: emptyOperationalOverviewState }),
}

export const ErrorState = {
  name: 'Error',
  render: () => renderOverview({ state: errorOperationalOverviewState }),
}

export const LongText = {
  render: () => renderOverview({ state: longTextOperationalOverviewState }),
}

export const DarkDefault = {
  render: () => (
    <div className="dark min-h-[720px] bg-background p-6" data-theme="dark">
      {renderOverview({}, 'w-full max-w-6xl')}
    </div>
  ),
}

export const NarrowContainer = {
  render: () => renderOverview({}, 'w-[390px] max-w-full'),
}

export const WithProgressPanelContext = {
  render: () => (
    <StorySection
      className="w-full max-w-[1512px]"
      description="Shows the about-route body baseline paired with the accepted deal progression command panel."
      title="Operational overview with progress panel"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <DealOperationalOverview
          labels={dealOperationalOverviewLabels}
          state={blockedOperationalOverviewState}
        />
        <DealProgressPanel
          labels={dealProgressPanelLabels}
          onAction={noopProgressAction}
          state={ongoingClosingState}
        />
      </div>
    </StorySection>
  ),
}

export const StateBoard = {
  render: () => (
    <StoryStack className="max-w-6xl">
      <DealOperationalOverview
        labels={dealOperationalOverviewLabels}
        state={blockedOperationalOverviewState}
      />
      <DealOperationalOverview
        labels={dealOperationalOverviewLabels}
        state={attentionOperationalOverviewState}
      />
      <DealOperationalOverview
        labels={dealOperationalOverviewLabels}
        state={readyOperationalOverviewState}
      />
    </StoryStack>
  ),
}
