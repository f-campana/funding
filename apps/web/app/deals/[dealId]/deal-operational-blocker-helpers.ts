import type { DealOperationalBlocker } from '@repo/kit'

import type { DealOperationalCenterDTO } from '@/server/deals'

import { countLabel, formatDateTimeLabel, pluralize } from './deal-operational-formatting'
import { blockerSurfaceLabel, ownerLabel, severityLabel } from './deal-operational-labels'

export const selectPriorityBlockers = (
  data: DealOperationalCenterDTO,
): readonly DealOperationalCenterDTO['blockers'][number][] => {
  const unresolvedBlockers = data.blockers.filter((blocker) => !blocker.resolved)
  const aboutBlockers = unresolvedBlockers.filter((blocker) => blocker.routeHint === 'about')
  const aboutBlockerIds = new Set(aboutBlockers.map((blocker) => blocker.id))
  const closeCriticalBlockers = unresolvedBlockers.filter(
    (blocker) => blocker.severity === 'critical' && !aboutBlockerIds.has(blocker.id),
  )
  const selectedBlockerIds = new Set([
    ...aboutBlockers.map((blocker) => blocker.id),
    ...closeCriticalBlockers.map((blocker) => blocker.id),
  ])
  const remainingBlockers = unresolvedBlockers.filter(
    (blocker) => !selectedBlockerIds.has(blocker.id),
  )

  return [...aboutBlockers, ...closeCriticalBlockers, ...remainingBlockers]
}

export const mapOperationalBlocker = (
  blocker: DealOperationalCenterDTO['blockers'][number],
  data: DealOperationalCenterDTO,
): DealOperationalBlocker => {
  const investorCountLabel = countLabel(blocker.relatedInvestorIds.length, 'investor')
  const documentCountLabel = countLabel(blocker.relatedDocumentIds.length, 'document')
  const dueLabel = getBlockerDueLabel(blocker, data)

  return {
    description: blocker.description,
    id: blocker.id,
    owner: ownerLabel(blocker.owner),
    severity: blocker.severity,
    severityLabel: severityLabel(blocker.severity),
    surfaceLabel: blockerSurfaceLabel(blocker.type),
    title: blocker.title,
    ...(documentCountLabel === undefined ? {} : { documentCountLabel }),
    ...(dueLabel === undefined ? {} : { dueLabel }),
    ...(investorCountLabel === undefined ? {} : { investorCountLabel }),
  }
}

export const getBlockerSummary = (data: DealOperationalCenterDTO): string => {
  const blockerCounts = getUnresolvedBlockerCounts(data)
  const unresolvedBlockerCount = blockerCounts.critical + blockerCounts.warning + blockerCounts.info

  if (unresolvedBlockerCount === 0) {
    return 'All close-critical blockers are resolved.'
  }

  const blockerNoun = pluralize(unresolvedBlockerCount, 'blocker')
  const criticalQualifier =
    blockerCounts.critical > 0 ? ' Critical identity and wire blockers remain in view.' : ''

  return `${unresolvedBlockerCount} close-impacting ${blockerNoun} remain. Capital and timing blockers are shown first.${criticalQualifier}`
}

export const getUnresolvedBlockerCounts = (
  data: DealOperationalCenterDTO,
): Record<DealOperationalCenterDTO['blockers'][number]['severity'], number> => {
  const counts = { critical: 0, info: 0, warning: 0 }

  for (const blocker of data.blockers) {
    if (!blocker.resolved) {
      counts[blocker.severity] += 1
    }
  }

  return counts
}

export const getRequiredDocumentIssueCount = (data: DealOperationalCenterDTO): number =>
  data.documents.requirements.filter(
    (document) => document.required && REQUIRED_DOCUMENT_ISSUE_BY_STATUS[document.status],
  ).length

const REQUIRED_DOCUMENT_ISSUE_BY_STATUS = {
  approved: false,
  expired: true,
  missing: true,
  rejected: true,
  under_review: false,
  uploaded: false,
} as const satisfies Record<
  DealOperationalCenterDTO['documents']['requirements'][number]['status'],
  boolean
>

export const getBlockedInvestorCount = (data: DealOperationalCenterDTO): number =>
  data.investors.filter((investor) => investor.readinessState === 'blocked').length

const getBlockerDueLabel = (
  blocker: DealOperationalCenterDTO['blockers'][number],
  data: DealOperationalCenterDTO,
): string | undefined => {
  if (blocker.type === 'deadline') {
    return `Target close ${formatDateTimeLabel(data.deal.targetCloseDate)}`
  }

  const dueDates = data.documents.requirements
    .filter((document) => blocker.relatedDocumentIds.includes(document.id))
    .map((document) => document.dueDate)
    .filter((dueDate): dueDate is string => dueDate !== undefined)
    .sort()
  const earliestDueDate = dueDates.at(0)

  return earliestDueDate === undefined ? undefined : `Due ${formatDateTimeLabel(earliestDueDate)}`
}
