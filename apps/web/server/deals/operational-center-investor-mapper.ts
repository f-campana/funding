import {
  getCommitmentLifecycleLabel,
  getKybOperationalStatusLabel,
  getKycOperationalStatusLabel,
  getSignatureOperationalStatusLabel,
  getWireOperationalStatusLabel,
} from '@repo/domain'

import type {
  NorthstarClosingBlockerFixture,
  NorthstarInvestorOperationFixture,
} from './fixtures/northstar-energy.fixture'
import type { InvestorOperationDTO, MoneyMinorUnitsDTO } from './operational-center-dto'
import { type MoneySerializationResult, money } from './operational-center-money'
import { deriveInvestorReadinessState } from './operational-center-readiness'

export const mapInvestor = (
  investor: NorthstarInvestorOperationFixture,
  blockers: readonly NorthstarClosingBlockerFixture[],
): MoneySerializationResult<InvestorOperationDTO> => {
  const unresolvedBlockersById = new Map(
    blockers.filter((blocker) => !blocker.resolved).map((blocker) => [blocker.id, blocker]),
  )
  const investorBlockers = investor.blockerIds
    .map((blockerId) => unresolvedBlockersById.get(blockerId))
    .filter((blocker): blocker is NorthstarClosingBlockerFixture => blocker !== undefined)

  return money(investor.commitmentAmountCents, `investors.${investor.id}.commitment`).map(
    (commitmentAmount) =>
      buildInvestorOperation({
        commitmentAmount,
        investor,
        investorBlockers,
      }),
  )
}

const buildInvestorOperation = ({
  commitmentAmount,
  investor,
  investorBlockers,
}: {
  readonly investor: NorthstarInvestorOperationFixture
  readonly investorBlockers: readonly NorthstarClosingBlockerFixture[]
  readonly commitmentAmount: MoneyMinorUnitsDTO
}): InvestorOperationDTO => {
  const entity =
    investor.legalEntityName === undefined
      ? ({ kind: 'individual' } as const)
      : {
          kind: 'legal_entity' as const,
          legalEntity: {
            kyb:
              investor.kybStatus === undefined
                ? {
                    kind: 'missing' as const,
                    statusLabel: 'KYB status missing',
                  }
                : {
                    kind: 'available' as const,
                    status: investor.kybStatus,
                    statusLabel: getKybOperationalStatusLabel(investor.kybStatus),
                  },
            name: investor.legalEntityName,
          },
        }

  return {
    blockerIds: investor.blockerIds,
    commitmentAmount,
    commitmentStatus: investor.commitmentStatus,
    commitmentStatusLabel: getCommitmentLifecycleLabel(investor.commitmentStatus),
    documentIds: investor.documentIds,
    entity,
    id: investor.id,
    investorName: investor.investorName,
    kycStatus: investor.kycStatus,
    kycStatusLabel: getKycOperationalStatusLabel(investor.kycStatus),
    readinessState: deriveInvestorReadinessState(investor, investorBlockers),
    signatureStatus: investor.signatureStatus,
    signatureStatusLabel: getSignatureOperationalStatusLabel(investor.signatureStatus),
    wireStatus: investor.wireStatus,
    wireStatusLabel: getWireOperationalStatusLabel(investor.wireStatus),
    ...(investor.investorEmail === undefined ? {} : { investorEmail: investor.investorEmail }),
    ...(investor.lastActivityAt === undefined ? {} : { lastActivityAt: investor.lastActivityAt }),
  }
}
