'use client'

import { CommitmentInspector, InvestorOperationsTable } from '@repo/kit'
import { useMemo, useState } from 'react'

import { getDealOperationsData } from '../data'
import { commitmentInspectorLabels, investorTableLabels } from '../labels'

type CommitmentsClientProps = {
  readonly dealId: string
}

export function CommitmentsClient({ dealId }: CommitmentsClientProps) {
  const data = getDealOperationsData(dealId)
  const investorOperationsRecords = data?.investorOperationsRecords ?? []

  const initialSelectedRecordId =
    investorOperationsRecords.find((record) => record.kycStatus === 'blocked')?.id ??
    investorOperationsRecords.find((record) => record.blockerIds.length > 0)?.id ??
    investorOperationsRecords[0]?.id ??
    ''

  const [selectedRecordId, setSelectedRecordId] = useState(initialSelectedRecordId)
  const selectedRecord = useMemo(
    () => investorOperationsRecords.find((record) => record.id === selectedRecordId),
    [investorOperationsRecords, selectedRecordId],
  )

  if (!data) {
    return null
  }

  return (
    <section
      className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]"
      data-slot="deal-commitments-client"
    >
      <InvestorOperationsTable
        description="Operational investor state across lifecycle, identity review, signatures, and wires."
        labels={investorTableLabels}
        onSelectRecord={(record) => setSelectedRecordId(record.id)}
        records={investorOperationsRecords}
        selectedRecordId={selectedRecordId}
        title="Investor operations"
      />
      <CommitmentInspector
        className="xl:sticky xl:top-5"
        activityItems={data.activityItems}
        blockers={data.domainClosingBlockersByState[data.readinessState]}
        documentRequirements={data.documentRequirements}
        labels={commitmentInspectorLabels}
        title="Commitment inspector"
        {...(selectedRecord ? { record: selectedRecord } : {})}
      />
    </section>
  )
}
