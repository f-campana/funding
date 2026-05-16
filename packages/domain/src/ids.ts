import { Result } from '@repo/core'
import { z } from 'zod'

import type { Brand } from './brand'

export type DealId = Brand<string, 'DealId'>
export type InvestorId = Brand<string, 'InvestorId'>
export type CommitmentId = Brand<string, 'CommitmentId'>
export type SpvId = Brand<string, 'SpvId'>
export type FundId = Brand<string, 'FundId'>
export type DocumentId = Brand<string, 'DocumentId'>

export type IdParseError = {
  readonly _tag: 'InvalidUuid'
  readonly input: string
}

type BrandedId = DealId | InvestorId | CommitmentId | SpvId | FundId | DocumentId

const uuidStringSchema = z.string().uuid({ error: 'id.InvalidUuid' })

const brandedUuidSchema = <Id extends BrandedId>() =>
  uuidStringSchema.transform((value) => value as Id)

const idFromString =
  <Id extends BrandedId>(schema: z.ZodType<Id, string>) =>
  (input: string): Result<Id, IdParseError> => {
    const parsed = schema.safeParse(input)

    return parsed.success ? Result.Ok(parsed.data) : Result.Error({ _tag: 'InvalidUuid', input })
  }

export const DealIdSchema = brandedUuidSchema<DealId>()
export const InvestorIdSchema = brandedUuidSchema<InvestorId>()
export const CommitmentIdSchema = brandedUuidSchema<CommitmentId>()
export const SpvIdSchema = brandedUuidSchema<SpvId>()
export const FundIdSchema = brandedUuidSchema<FundId>()
export const DocumentIdSchema = brandedUuidSchema<DocumentId>()

export const dealIdFromString = idFromString(DealIdSchema)
export const investorIdFromString = idFromString(InvestorIdSchema)
export const commitmentIdFromString = idFromString(CommitmentIdSchema)
export const spvIdFromString = idFromString(SpvIdSchema)
export const fundIdFromString = idFromString(FundIdSchema)
export const documentIdFromString = idFromString(DocumentIdSchema)
