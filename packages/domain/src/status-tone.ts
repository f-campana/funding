export const STATUS_TONES = [
  'neutral',
  'info',
  'success',
  'attention',
  'danger',
  'pending',
] as const

export type StatusTone = (typeof STATUS_TONES)[number]
