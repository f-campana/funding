import { getDocumentRequirementStatusTone } from '@repo/domain'

import type { NorthstarDocumentRequirementFixture } from './fixtures/northstar-energy.fixture'
import type { DocumentRequirementDTO } from './operational-center-dto'

export const mapDocuments = (
  documents: readonly NorthstarDocumentRequirementFixture[],
): readonly DocumentRequirementDTO[] =>
  documents.map((document) => ({
    blocksClosing: document.blocksClosing,
    category: document.category,
    groupId: document.groupId,
    id: document.id,
    label: document.label,
    owner: document.owner,
    required: document.required,
    status: document.status,
    tone: getDocumentRequirementStatusTone(document.status),
    ...(document.dueDate === undefined ? {} : { dueDate: document.dueDate }),
    ...(document.lastActivityAt === undefined ? {} : { lastActivityAt: document.lastActivityAt }),
    ...(document.relatedInvestorId === undefined
      ? {}
      : { relatedInvestorId: document.relatedInvestorId }),
  }))
