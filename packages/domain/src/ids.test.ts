import { describe, expect, it } from 'vitest'

import {
  CommitmentIdSchema,
  commitmentIdFromString,
  DealIdSchema,
  DocumentIdSchema,
  dealIdFromString,
  documentIdFromString,
  FundIdSchema,
  fundIdFromString,
  InvestorIdSchema,
  investorIdFromString,
  SpvIdSchema,
  spvIdFromString,
} from './ids'

const validUuid = '11111111-1111-4111-8111-111111111111'

const constructors = [
  ['DealId', dealIdFromString],
  ['InvestorId', investorIdFromString],
  ['CommitmentId', commitmentIdFromString],
  ['SpvId', spvIdFromString],
  ['FundId', fundIdFromString],
  ['DocumentId', documentIdFromString],
] as const

const schemas = [
  ['DealIdSchema', DealIdSchema],
  ['InvestorIdSchema', InvestorIdSchema],
  ['CommitmentIdSchema', CommitmentIdSchema],
  ['SpvIdSchema', SpvIdSchema],
  ['FundIdSchema', FundIdSchema],
  ['DocumentIdSchema', DocumentIdSchema],
] as const

describe('domain ID constructors', () => {
  it.each(constructors)('%s parses a valid UUID into a branded ID', (_name, fromString) => {
    const result = fromString(validUuid)

    expect(result).toMatchObject({ _tag: 'Ok', value: validUuid })
  })

  it.each(constructors)('%s returns InvalidUuid for invalid input', (_name, fromString) => {
    const result = fromString('not-a-uuid')

    expect(result).toMatchObject({
      _tag: 'Error',
      error: { _tag: 'InvalidUuid', input: 'not-a-uuid' },
    })
  })
})

describe('domain ID schemas', () => {
  it.each(schemas)('%s transforms a valid UUID into a branded ID', (_name, schema) => {
    expect(schema.parse(validUuid)).toBe(validUuid)
  })

  it.each(schemas)('%s rejects invalid UUID input', (_name, schema) => {
    expect(schema.safeParse('not-a-uuid').success).toBe(false)
  })
})
