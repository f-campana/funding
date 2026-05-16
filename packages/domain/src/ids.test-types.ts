import type { DealId, InvestorId } from './ids'

declare const dealId: DealId

const sameDealId: DealId = dealId

// @ts-expect-error DealId and InvestorId must remain nominally distinct.
const investorId: InvestorId = dealId

void sameDealId
void investorId
