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
    description="Kit-first mission-control baseline for deal close readiness, capital reconciliation, blockers, and latest activity."
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

const markStoryAction = (kind: string) => {
  document.body.dataset.dealOperationalOverviewAction = kind
}

const assertStory: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) {
    throw new globalThis.Error(message)
  }
}

const assertDefaultStory = (canvasElement: HTMLElement) => {
  assertStory(canvasElement.textContent?.includes('Closing readiness'), 'Expected readiness title.')
  assertStory(canvasElement.textContent?.includes('Critical'), 'Expected blocker count label.')
  assertStory(canvasElement.querySelector('[role="progressbar"]'), 'Expected capital progress.')
  assertStory(
    canvasElement.textContent && canvasElement.textContent.trim().length > 0,
    'Expected non-blank story.',
  )
}

export const DefaultBlocked = {
  render: () => renderOverview(),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertDefaultStory(canvasElement)
    const overview = canvasElement.querySelector('[data-slot="deal-operational-overview"]')

    assertStory(
      overview?.getAttribute('data-visible-blocker-count') === '3',
      'Expected visible blocker count.',
    )
    assertStory(
      overview?.getAttribute('data-total-blocker-count') === '6',
      'Expected total blocker count.',
    )
  },
}

export const ReadyToClose = {
  render: () => renderOverview({ state: readyOperationalOverviewState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(canvasElement.textContent?.includes('Ready to close'), 'Expected ready state.')
    assertStory(canvasElement.textContent?.includes('100% of target'), 'Expected full progress.')
  },
}

export const Attention = {
  render: () => renderOverview({ state: attentionOperationalOverviewState }),
}

export const NoBlockersReady = {
  render: () => renderOverview({ state: readyOperationalOverviewState }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(
      canvasElement.textContent?.includes('No priority blockers'),
      'Expected no blockers.',
    )
  },
}

export const Loading = {
  render: () => renderOverview({ state: loadingOperationalOverviewState }),
}

export const Empty = {
  render: () => renderOverview({ state: emptyOperationalOverviewState }),
}

export const ErrorState = {
  name: 'Error',
  render: () =>
    renderOverview({
      onAction: (event) => markStoryAction(event.kind),
      state: errorOperationalOverviewState,
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const button = Array.from(canvasElement.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === 'Retry',
    )

    assertStory(button instanceof HTMLButtonElement, 'Expected retry button.')
    button.click()
    assertStory(
      document.body.dataset.dealOperationalOverviewAction === 'retry',
      'Retry action fired.',
    )
  },
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertDefaultStory(canvasElement)
    assertStory(
      canvasElement.scrollWidth <= canvasElement.clientWidth + 1,
      'Dark story root should not overflow horizontally.',
    )
  },
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertStory(canvasElement.textContent?.includes('Operational overview'), 'Expected overview.')
    assertStory(canvasElement.textContent?.includes('Deal progression'), 'Expected progress panel.')
  },
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
