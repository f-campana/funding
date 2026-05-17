import { Result } from '@repo/core'
import {
  type Brand,
  getDealLifecycleLabel,
  summarizeCapitalReconciliation,
  summarizeClosingReadiness,
} from '@repo/domain'

import {
  NORTHSTAR_DEAL_SLUG,
  northstarOperationalFixture,
} from './fixtures/northstar-energy.fixture'
import { mapBlocker } from './operational-center-blocker-mapper'
import { mapCapital, mapCapitalReconciliationError } from './operational-center-capital-mapper'
import { mapDocuments } from './operational-center-document-mapper'
import type {
  CapitalReconciliationErrorDTO,
  ClosingReadinessDTO,
  DealOperationalCenterDTO,
  DocumentCenterDTO,
  GetOperationalCenterInputDTO,
  MoneySerializationErrorDTO,
} from './operational-center-dto'
import { mapInvestor } from './operational-center-investor-mapper'
import { firstError } from './operational-center-money'
import { deriveClosingReadiness } from './operational-center-readiness'

export { deriveClosingReadiness } from './operational-center-readiness'

type DealSlug = Brand<string, 'DealSlug'>

const dealSlugFromInput = (value: string): DealSlug => value.trim() as DealSlug

export type GetDealOperationalCenterError =
  | {
      readonly _tag: 'UnsupportedDeal'
      readonly dealId: string
    }
  | {
      readonly _tag: 'ReconciliationError'
      readonly error: CapitalReconciliationErrorDTO
    }
  | {
      readonly _tag: 'MoneySerializationError'
      readonly error: MoneySerializationErrorDTO
    }

export const getDealOperationalCenter = (
  input: GetOperationalCenterInputDTO,
): Result<DealOperationalCenterDTO, GetDealOperationalCenterError> => {
  const dealId = dealSlugFromInput(input.dealId)

  if (dealId !== NORTHSTAR_DEAL_SLUG) {
    return Result.Error({ _tag: 'UnsupportedDeal', dealId })
  }

  const capitalResult = summarizeCapitalReconciliation(northstarOperationalFixture.capital)

  if (capitalResult.isError()) {
    const errorResult = mapCapitalReconciliationError(capitalResult.error)

    if (errorResult.isError()) {
      return Result.Error({ _tag: 'MoneySerializationError', error: errorResult.error })
    }

    return Result.Error({ _tag: 'ReconciliationError', error: errorResult.value })
  }

  const readinessSummary = summarizeClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
    hasOperationalInputs: true,
  })
  const documents = mapDocuments(northstarOperationalFixture.documents)
  const blockers = northstarOperationalFixture.blockers.map(mapBlocker)
  const readiness: ClosingReadinessDTO = deriveClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
    capital: capitalResult.value,
    documents: northstarOperationalFixture.documents,
    investors: northstarOperationalFixture.investors,
    summary: readinessSummary,
    vehicle: northstarOperationalFixture.deal.vehicle,
  })
  const documentsCenter: DocumentCenterDTO = {
    groups: northstarOperationalFixture.documentGroups,
    requirements: documents,
  }
  const capitalDtoResult = mapCapital(capitalResult.value, northstarOperationalFixture.capital)

  if (capitalDtoResult.isError()) {
    return Result.Error({ _tag: 'MoneySerializationError', error: capitalDtoResult.error })
  }

  const investorsResult = Result.traverse(northstarOperationalFixture.investors, (investor) =>
    mapInvestor(investor, northstarOperationalFixture.blockers),
  ).mapError(firstError)

  if (investorsResult.isError()) {
    return Result.Error({ _tag: 'MoneySerializationError', error: investorsResult.error })
  }

  return Result.Ok({
    _tag: 'DealOperationalCenter',
    activity: northstarOperationalFixture.activity,
    blockers,
    capital: capitalDtoResult.value,
    deal: {
      ...northstarOperationalFixture.deal,
      stageLabel: getDealLifecycleLabel(northstarOperationalFixture.deal.stage),
    },
    documents: documentsCenter,
    generatedAt: northstarOperationalFixture.generatedAt,
    investors: investorsResult.value,
    readiness,
  })
}
