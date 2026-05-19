import type { AmountStep, EuroCents } from '@repo/domain'

declare const amountStep: AmountStep

const brandedAmount: EuroCents = amountStep.amountCents
const displayAmount: string = amountStep.amountRaw

void brandedAmount
void displayAmount
