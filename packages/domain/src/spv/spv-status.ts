import { z } from 'zod'

export const SPV_STATUSES = [
  'draft',
  'open',
  'kyc_in_progress',
  'e_signatures',
  'collecting',
  'incorporated',
  'closed',
] as const

export type SpvStatus = (typeof SPV_STATUSES)[number]

export const SpvStatusSchema = z.enum(SPV_STATUSES)

const ALLOWED_TRANSITIONS = {
  draft: ['open'],
  open: ['kyc_in_progress'],
  kyc_in_progress: ['e_signatures'],
  e_signatures: ['collecting'],
  collecting: ['incorporated'],
  incorporated: ['closed'],
  closed: [],
} as const satisfies Record<SpvStatus, readonly SpvStatus[]>

export const isTerminalSpvStatus = (status: SpvStatus): boolean => status === 'closed'

export const canTransitionSpvStatus = (from: SpvStatus, to: SpvStatus): boolean =>
  ALLOWED_TRANSITIONS[from].some((candidate) => candidate === to)
