import { DealDocumentsEvidence } from '@repo/kit/deal-documents-evidence'
import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { mapDealDocumentsEvidenceProps } from '../deal-documents-evidence-adapter'

type DealDocumentsPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealDocumentsPage({ params }: DealDocumentsPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  return <DealDocumentsEvidence {...mapDealDocumentsEvidenceProps(data)} />
}
