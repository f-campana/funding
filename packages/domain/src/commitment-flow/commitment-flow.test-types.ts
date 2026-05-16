import type { EuroCents } from '../money'
import type { CommitmentFormData } from './commitment-flow'

declare const commitmentForm: CommitmentFormData

const brandedAmount: EuroCents = commitmentForm.amount.amountCents

void brandedAmount
