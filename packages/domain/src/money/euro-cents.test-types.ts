import type { EuroCents } from './euro-cents'
import { euroCentsFromMinorUnits } from './euro-cents'

const amount: EuroCents = euroCentsFromMinorUnits(123n)

// @ts-expect-error Plain bigint must not be assignable to EuroCents.
const unbrandedAmount: EuroCents = 123n

void amount
void unbrandedAmount
