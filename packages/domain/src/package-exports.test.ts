import { parseEuroCents } from '@repo/domain'
import { CommitmentFormSchema } from '@repo/domain/commitment-flow'
import { CommitmentLifecycleStateSchema } from '@repo/domain/commitments'
import { DealLifecycleStateSchema, summarizeClosingReadiness } from '@repo/domain/deals'
import {
  DocumentRequirementStatusSchema,
  summarizeDocumentCompleteness,
} from '@repo/domain/documents'
import { DealIdSchema } from '@repo/domain/ids'
import { euroCentsFromMinorUnits } from '@repo/domain/money'
import { CapitalStageSchema, summarizeCapitalReconciliation } from '@repo/domain/reconciliation'
import { SpvStatusSchema } from '@repo/domain/spv'
import { STATUS_TONES } from '@repo/domain/status-tone'
import { describe, expect, it } from 'vitest'

describe('@repo/domain package exports', () => {
  it('resolves root and focused subpath exports', () => {
    expect(parseEuroCents('1234').isOk()).toBe(true)
    expect(euroCentsFromMinorUnits(123n)).toBe(123n)
    expect(DealIdSchema.safeParse('11111111-1111-4111-8111-111111111111').success).toBe(true)
    expect(CommitmentFormSchema.shape.amount).toBeDefined()
    expect(SpvStatusSchema.parse('draft')).toBe('draft')
    expect(CapitalStageSchema.parse('committed')).toBe('committed')
    expect(DealLifecycleStateSchema.parse('draft')).toBe('draft')
    expect(CommitmentLifecycleStateSchema.parse('approved')).toBe('approved')
    expect(DocumentRequirementStatusSchema.parse('missing')).toBe('missing')
    expect(STATUS_TONES).toContain('attention')
    expect(summarizeClosingReadiness({ blockers: [] }).state).toBe('not_started')
    expect(summarizeDocumentCompleteness([]).isComplete).toBe(false)
    expect(
      summarizeCapitalReconciliation({
        committedAmountCents: euroCentsFromMinorUnits(0n),
        matchedAmountCents: euroCentsFromMinorUnits(0n),
        receivedAmountCents: euroCentsFromMinorUnits(0n),
        signedAmountCents: euroCentsFromMinorUnits(0n),
        targetAmountCents: euroCentsFromMinorUnits(0n),
      }).isOk(),
    ).toBe(true)
  })
})
