import type { NorthstarDocumentRequirementFixture } from './fixtures/northstar-energy.fixture'
import type { DocumentRequirementDTO } from './operational-center-dto'

export const mapDocuments = (
  documents: readonly NorthstarDocumentRequirementFixture[],
): readonly DocumentRequirementDTO[] =>
  documents.map((document) => ({
    category: document.category,
    closingImpact: mapClosingImpact(document),
    groupId: document.groupId,
    id: document.id,
    label: document.label,
    owner: document.owner,
    requirement: document.required ? { kind: 'required' } : { kind: 'optional' },
    status: document.status,
    ...(document.dueDate === undefined ? {} : { dueDate: document.dueDate }),
    ...(document.lastActivityAt === undefined ? {} : { lastActivityAt: document.lastActivityAt }),
    ...(document.relatedInvestorId === undefined
      ? {}
      : { relatedInvestorId: document.relatedInvestorId }),
  }))

const mapClosingImpact = (
  document: NorthstarDocumentRequirementFixture,
): DocumentRequirementDTO['closingImpact'] => {
  if (document.blocksClosing) {
    return { kind: 'blocks_closing' }
  }

  return document.status === 'approved'
    ? { kind: 'cleared_for_closing' }
    : { kind: 'does_not_block_closing' }
}
