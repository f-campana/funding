import type { SpvStatus } from '@repo/domain'

import { StorySection } from '../stories/story-layout'
import { SpvStateTracker } from './spv-state-tracker'

const meta = {
  component: SpvStateTracker,
  title: 'Kit/SpvStateTracker',
}

export default meta

const labels = {
  closed: 'Closed',
  collecting: 'Collecting',
  draft: 'Draft',
  e_signatures: 'E-signatures',
  incorporated: 'Incorporated',
  kyc_in_progress: 'KYC in progress',
  open: 'Open',
} satisfies Record<SpvStatus, string>

export const Collecting = {
  render: () => (
    <StorySection
      description="SPV lifecycle statuses are rendered in the domain-defined order."
      title="Lifecycle horizontal"
    >
      <SpvStateTracker currentStatus="collecting" labels={labels} />
    </StorySection>
  ),
}

export const SidebarCompact = {
  render: () => (
    <StorySection
      className="max-w-sm"
      description="Compact mode is used in sidebar contexts where seven columns would clip labels."
      title="Lifecycle compact"
    >
      <SpvStateTracker currentStatus="collecting" labels={labels} variant="compact" />
    </StorySection>
  ),
}
