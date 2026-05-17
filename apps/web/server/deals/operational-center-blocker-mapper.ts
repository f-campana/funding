import { getClosingBlockerSeverityTone } from '@repo/domain'

import type { NorthstarClosingBlockerFixture } from './fixtures/northstar-energy.fixture'

export const mapBlocker = (blocker: NorthstarClosingBlockerFixture) => ({
  description: blocker.description,
  id: blocker.id,
  owner: blocker.owner,
  relatedDocumentIds: blocker.relatedDocumentIds,
  relatedInvestorIds: blocker.relatedInvestorIds,
  resolved: blocker.resolved,
  routeHint: blocker.routeHint,
  severity: blocker.severity,
  title: blocker.title,
  tone: getClosingBlockerSeverityTone(blocker.severity),
  type: blocker.type,
})
