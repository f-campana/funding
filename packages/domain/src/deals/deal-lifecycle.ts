import { z } from 'zod'

import type { StatusTone } from '../status-tone'

export const DEAL_LIFECYCLE_STATES = [
  'draft',
  'internal_review',
  'open_for_preview',
  'open_for_interests',
  'collecting_commitments',
  'reviewing_commitments',
  'contracting',
  'awaiting_wires',
  'closing_review',
  'closed',
  'portfolio_active',
  'partially_exited',
  'exited',
  'cancelled',
] as const

export type DealLifecycleState = (typeof DEAL_LIFECYCLE_STATES)[number]

export const DealLifecycleStateSchema = z.enum(DEAL_LIFECYCLE_STATES)

const PRE_CLOSE_STATES = [
  'draft',
  'internal_review',
  'open_for_preview',
  'open_for_interests',
  'collecting_commitments',
  'reviewing_commitments',
  'contracting',
  'awaiting_wires',
  'closing_review',
] as const satisfies readonly DealLifecycleState[]

const ALLOWED_TRANSITIONS = {
  awaiting_wires: ['closing_review', 'cancelled'],
  cancelled: [],
  closed: ['portfolio_active'],
  collecting_commitments: ['reviewing_commitments', 'cancelled'],
  contracting: ['awaiting_wires', 'cancelled'],
  draft: ['internal_review', 'cancelled'],
  exited: [],
  internal_review: ['open_for_preview', 'cancelled'],
  open_for_interests: ['collecting_commitments', 'cancelled'],
  open_for_preview: ['open_for_interests', 'cancelled'],
  partially_exited: ['exited'],
  portfolio_active: ['partially_exited', 'exited'],
  reviewing_commitments: ['contracting', 'cancelled'],
  closing_review: ['closed', 'cancelled'],
} as const satisfies Record<DealLifecycleState, readonly DealLifecycleState[]>

const TERMINAL_STATES = ['exited', 'cancelled'] as const satisfies readonly DealLifecycleState[]

const DEAL_LIFECYCLE_LABELS = {
  awaiting_wires: 'Awaiting wires',
  cancelled: 'Cancelled',
  closed: 'Closed',
  collecting_commitments: 'Collecting commitments',
  contracting: 'Contracting',
  draft: 'Draft',
  exited: 'Exited',
  internal_review: 'Internal review',
  open_for_interests: 'Open for interests',
  open_for_preview: 'Open for preview',
  partially_exited: 'Partially exited',
  portfolio_active: 'Portfolio active',
  reviewing_commitments: 'Reviewing commitments',
  closing_review: 'Closing review',
} as const satisfies Record<DealLifecycleState, string>

const DEAL_LIFECYCLE_TONES = {
  awaiting_wires: 'attention',
  cancelled: 'danger',
  closed: 'success',
  collecting_commitments: 'info',
  contracting: 'pending',
  draft: 'neutral',
  exited: 'success',
  internal_review: 'pending',
  open_for_interests: 'info',
  open_for_preview: 'info',
  partially_exited: 'attention',
  portfolio_active: 'success',
  reviewing_commitments: 'pending',
  closing_review: 'attention',
} as const satisfies Record<DealLifecycleState, StatusTone>

export const canTransitionDealLifecycle = (
  from: DealLifecycleState,
  to: DealLifecycleState,
): boolean => ALLOWED_TRANSITIONS[from].some((candidate) => candidate === to)

export const isPreCloseDealLifecycleState = (state: DealLifecycleState): boolean =>
  PRE_CLOSE_STATES.some((candidate) => candidate === state)

export const isTerminalDealLifecycleState = (state: DealLifecycleState): boolean =>
  TERMINAL_STATES.some((candidate) => candidate === state)

export const getDealLifecycleLabel = (state: DealLifecycleState): string =>
  DEAL_LIFECYCLE_LABELS[state]

export const getDealLifecycleTone = (state: DealLifecycleState): StatusTone =>
  DEAL_LIFECYCLE_TONES[state]
