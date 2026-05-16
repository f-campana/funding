import { StorySection } from '../stories/story-layout'
import { type ClosingBlocker, ClosingBlockerQueue } from './closing-blocker-queue'

const meta = {
  component: ClosingBlockerQueue,
  title: 'Kit/Readiness/ClosingBlockerQueue',
}

export default meta

const labels = {
  acknowledge: 'Acknowledge locally',
  acknowledged: 'Acknowledged locally',
  dueState: {
    due_soon: 'Due soon',
    due_today: 'Due today',
    no_due_date: 'No due date',
    on_track: 'On track',
    overdue: 'Overdue',
  },
  empty: 'No blockers for the next close.',
  hideDetails: 'Hide details',
  nextAction: 'Next action',
  owner: 'Owner',
  severity: {
    critical: 'Critical',
    info: 'Info',
    warning: 'Warning',
  },
  showDetails: 'Show details',
}

const blockers: readonly ClosingBlocker[] = [
  {
    detail: 'Refreshed proof of address is required before the subscription package can be signed.',
    dueState: 'overdue',
    id: 'elise-kyc',
    investorName: 'Elise Martin',
    kind: 'kyc',
    nextAction: 'Review uploaded address document',
    owner: 'compliance',
    reference: 'KYC-ELISE-2026',
    severity: 'critical',
    title: 'KYC evidence blocks signing',
  },
  {
    detail: 'Received funds are in the account but not matched to the expected investor reference.',
    dueState: 'due_today',
    id: 'wire-match',
    kind: 'payment_match',
    nextAction: 'Match receipt against bank reference',
    owner: 'finance',
    reference: 'WIRE-BELAIR-REVIEW',
    severity: 'warning',
    title: 'Wire receipt needs matching',
  },
  {
    detail: 'Attach the closing memo after finance review is complete.',
    dueState: 'due_soon',
    id: 'audit-memo',
    kind: 'audit_file',
    nextAction: 'Attach memo to audit file',
    owner: 'operations',
    severity: 'info',
    title: 'Audit file memo pending',
  },
]

export const Populated = {
  render: () => (
    <StorySection title="Populated blocker queue">
      <ClosingBlockerQueue
        blockers={blockers}
        description="Sorted by close impact and due state."
        labels={labels}
        title="Closing blockers"
      />
    </StorySection>
  ),
}

export const Empty = {
  render: () => (
    <StorySection title="Empty blocker queue">
      <ClosingBlockerQueue blockers={[]} labels={labels} title="Closing blockers" />
    </StorySection>
  ),
}

export const InteractionReview = {
  render: () => (
    <StorySection title="Interaction review">
      <ClosingBlockerQueue
        blockers={blockers}
        description="Use the details and acknowledgement controls to review local-only state."
        labels={labels}
        title="Closing blockers"
      />
    </StorySection>
  ),
}

export const CriticalOnly = {
  render: () => (
    <StorySection title="Critical blocker">
      <ClosingBlockerQueue
        blockers={blockers.filter((blocker) => blocker.severity === 'critical')}
        description="Single high-impact dependency without extra queue noise."
        labels={labels}
        title="Closing blockers"
      />
    </StorySection>
  ),
}
