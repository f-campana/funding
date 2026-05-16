import { euroCentsFromMinorUnits, InvestorIdSchema } from '@repo/domain'
import { useEffect, useRef } from 'react'

import { StorySection, StoryStack } from '../stories/story-layout'
import { InvestorRow, type InvestorRowData, type InvestorRowProps } from './investor-row'

const meta = {
  component: InvestorRow,
  title: 'Kit/InvestorRow',
}

export default meta

const labels = {
  amount: 'Commitment',
  collapse: 'Collapse investor details',
  country: 'Country',
  entityType: 'Entity type',
  expand: 'Expand investor details',
  qualification: 'Qualification',
  qualificationType: {
    informed: 'Informed investor',
    non_eligible: 'Not eligible',
    professional: 'Professional investor',
  },
  status: {
    committed: 'Committed',
    invited: 'Invited',
    kyc_pending: 'KYC pending',
    reviewing: 'Reviewing',
    signed: 'Signed',
    wired: 'Wired',
  },
} satisfies InvestorRowProps['labels']

const investor: InvestorRowData = {
  committedAmount: euroCentsFromMinorUnits(1_250_000_00n),
  country: 'FR',
  details: [
    {
      id: 'entity',
      label: 'Entity',
      value: 'Natural person',
    },
    {
      description: 'Proof of address is expired and must be refreshed before subscription signing.',
      id: 'kyc',
      label: 'KYC documents',
      tone: 'warning',
      value: 'Blocked',
    },
    {
      id: 'subscription',
      label: 'Subscription package',
      value: 'Prepared',
    },
    {
      id: 'next-action',
      label: 'Next action',
      value: 'Request updated address evidence',
    },
  ],
  entityType: 'individual',
  id: InvestorIdSchema.parse('efa7f1ed-6e02-48c7-9f8c-cde339b2be65'),
  name: 'Camille Laurent Family Holding Renewable Infrastructure SLP',
  qualificationType: 'professional',
  status: 'kyc_pending',
}

const OpenInvestorRow = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = containerRef.current?.querySelector('button[aria-expanded="false"]')

    if (button instanceof HTMLButtonElement) {
      button.click()
    }
  }, [])

  return (
    <div ref={containerRef}>
      <InvestorRow investor={investor} labels={labels} />
    </div>
  )
}

export const CollapsedDesktop = {
  render: () => (
    <StorySection
      className="rounded-lg border border-border bg-card"
      description="Desktop table-context review where repeated visible labels are hidden in row cells."
      title="Collapsed desktop record"
    >
      <div className="hidden border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(12rem,1.4fr)_minmax(6rem,0.6fr)_minmax(9rem,1fr)_minmax(9rem,auto)_auto] md:items-center">
        <span>Investor</span>
        <span>Country</span>
        <span>Qualification</span>
        <span className="text-right">Commitment</span>
        <span aria-hidden="true" />
      </div>
      <InvestorRow investor={investor} labels={labels} />
    </StorySection>
  ),
}

export const Expanded = {
  render: () => (
    <StoryStack>
      <StorySection
        className="rounded-lg border border-border bg-card"
        description="Expanded state reveals secondary operational detail, including a KYC blocker."
        title="Expanded operational detail"
      >
        <OpenInvestorRow />
      </StorySection>
    </StoryStack>
  ),
}

export const Narrow = {
  render: () => (
    <StorySection
      className="rounded-lg border border-border bg-card"
      description="Narrow review where labels remain visible and the long legal name and EUR value must wrap without horizontal scrolling."
      title="Narrow record"
    >
      <div className="w-full max-w-sm">
        <InvestorRow investor={investor} labels={labels} />
      </div>
    </StorySection>
  ),
}
