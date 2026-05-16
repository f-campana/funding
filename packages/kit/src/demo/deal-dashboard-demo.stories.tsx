import { StorySection } from '../stories/story-layout'
import { DealDashboardDemo } from './deal-dashboard-demo'

const meta = {
  component: DealDashboardDemo,
  title: 'Kit/DealDashboardDemo',
}

export default meta

export const DesktopReview = {
  render: () => (
    <StorySection
      description="Page-width product review surface for private-market deal operations."
      title="Dashboard desktop review"
    >
      <div className="w-full max-w-7xl">
        <DealDashboardDemo />
      </div>
    </StorySection>
  ),
}

export const NarrowReview = {
  render: () => (
    <StorySection
      description="Narrow review surface for KPI money fit, right-rail stacking, and investor record density."
      title="Dashboard narrow review"
    >
      <div className="w-full max-w-md">
        <DealDashboardDemo />
      </div>
    </StorySection>
  ),
}

export const BlockedState = {
  render: () => (
    <StorySection
      description="Default exception workspace with critical blockers first."
      title="Dashboard blocked state"
    >
      <div className="w-full max-w-7xl">
        <DealDashboardDemo readinessState="blocked" />
      </div>
    </StorySection>
  ),
}

export const AttentionState = {
  render: () => (
    <StorySection
      description="Operational work remains without a critical close blocker."
      title="Dashboard attention state"
    >
      <div className="w-full max-w-7xl">
        <DealDashboardDemo readinessState="attention" />
      </div>
    </StorySection>
  ),
}

export const ReadyState = {
  render: () => (
    <StorySection
      description="No known blocker prevents the next closing action."
      title="Dashboard ready state"
    >
      <div className="w-full max-w-7xl">
        <DealDashboardDemo readinessState="ready" />
      </div>
    </StorySection>
  ),
}
