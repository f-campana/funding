import type { DealDocumentsEvidenceProps, DealDocumentsEvidenceReadyState } from '@repo/kit'
import { describe, expect, it } from 'vitest'
import { getDealOperationalCenter } from '../../../server/deals'
import { mapDealDocumentsEvidenceProps } from './deal-documents-evidence-adapter'

describe('mapDealDocumentsEvidenceProps', () => {
  it('maps Northstar documents into the DealDocumentsEvidence ready state', () => {
    const props = mapDealDocumentsEvidenceProps(getNorthstarData())
    const state = getReadyState(props)

    expect(props.labels.title).toBe('Documents')
    expect(props.labels.subtitle).toBe(
      'Closing evidence across generated documents, investor evidence, and vehicle setup.',
    )
    expect('onAction' in props).toBe(false)
    expect(state.summary.headlineLabel).toBe('9 documents · 4 blocking close · 4 document issues')
    expect(state.summary.metrics).toMatchObject([
      { id: 'total', value: '9' },
      { id: 'blocking', tone: 'danger', value: '4' },
      { id: 'missing', tone: 'danger', value: '1' },
      { id: 'under-review', tone: 'pending', value: '1' },
      { id: 'approved', tone: 'success', value: '3' },
      { id: 'rejected-expired', tone: 'attention', value: '2' },
    ])
    expect(state.groups.map((group) => group.label)).toEqual([
      'Generated closing documents',
      'Investor evidence',
      'Vehicle and target setup',
    ])
  })

  it('preserves document statuses, closing impact, and related investors', () => {
    const state = getReadyState(mapDealDocumentsEvidenceProps(getNorthstarData()))
    const documents = state.groups.flatMap((group) => group.documents)

    expect(documents.find((document) => document.id === 'doc-meridian-ubo')).toMatchObject({
      blockingLabel: 'Blocks closing',
      blocksClosing: true,
      label: 'Meridian UBO declaration',
      relatedInvestorLabel: 'Meridian Ventures',
      status: { kind: 'missing', label: 'Missing', tone: 'danger' },
    })
    expect(documents.find((document) => document.id === 'doc-subscription-bulletin')).toMatchObject(
      {
        blockingLabel: 'Blocks closing',
        status: { kind: 'under_review', label: 'Under review', tone: 'pending' },
      },
    )
    expect(
      documents.find((document) => document.id === 'doc-riverbend-proof-address'),
    ).toMatchObject({
      relatedInvestorLabel: 'Riverbend Holdings',
      status: { kind: 'expired', label: 'Expired', tone: 'attention' },
    })
    expect(documents.find((document) => document.id === 'doc-target-legal-pack')).toMatchObject({
      blockingLabel: 'Blocks closing',
      status: { kind: 'rejected', label: 'Rejected', tone: 'danger' },
    })
    expect(
      documents.find((document) => document.id === 'doc-shareholders-agreement'),
    ).toMatchObject({
      blockingLabel: 'Cleared for closing',
      status: { kind: 'approved', label: 'Approved', tone: 'success' },
    })
  })
})

const getNorthstarData = () => {
  const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

  if (result.isError()) {
    throw new Error(`Expected Northstar fixture, received ${result.error._tag}`)
  }

  return result.value
}

const getReadyState = (props: DealDocumentsEvidenceProps): DealDocumentsEvidenceReadyState => {
  if (props.state.kind !== 'ready') {
    throw new Error(`Expected ready documents evidence state, received ${props.state.kind}`)
  }

  return props.state
}
