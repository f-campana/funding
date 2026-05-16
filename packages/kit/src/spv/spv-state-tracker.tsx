import type { SpvStatus } from '@repo/domain'
import { SPV_STATUSES } from '@repo/domain'
import { cn } from '@repo/ui'
import { match } from 'ts-pattern'

export type SpvStateTrackerProps = {
  readonly currentStatus: SpvStatus
  readonly labels: Record<SpvStatus, string>
  readonly variant?: SpvStateTrackerVariant
  readonly className?: string
}

export type SpvStateTrackerVariant = 'compact' | 'horizontal'

type StepState = 'complete' | 'current' | 'pending'

const getStepState = (stepIndex: number, currentIndex: number): StepState => {
  if (stepIndex < currentIndex) {
    return 'complete'
  }

  if (stepIndex === currentIndex) {
    return 'current'
  }

  return 'pending'
}

const stepStateClasses = (state: StepState) =>
  match(state)
    .with('complete', () => 'border-primary bg-primary text-primary-foreground')
    .with('current', () => 'border-ring bg-card text-card-foreground ring-2 ring-ring')
    .with('pending', () => 'border-border bg-muted text-muted-foreground')
    .exhaustive()

const listVariantClasses = (variant: SpvStateTrackerVariant) =>
  match(variant)
    .with(
      'horizontal',
      () => 'grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(8.75rem,1fr))]',
    )
    .with('compact', () => 'grid gap-2')
    .exhaustive()

const itemVariantClasses = (variant: SpvStateTrackerVariant) =>
  match(variant)
    .with('horizontal', () => 'flex min-h-24 flex-col justify-between gap-3 p-3')
    .with('compact', () => 'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-3 py-2')
    .exhaustive()

const orderVariantClasses = (variant: SpvStateTrackerVariant) =>
  match(variant)
    .with('horizontal', () => 'font-mono text-xs tabular-nums')
    .with(
      'compact',
      () =>
        'order-first row-span-2 flex size-7 items-center justify-center rounded-sm border border-current/20 font-mono text-xs tabular-nums',
    )
    .exhaustive()

export const SpvStateTracker = ({
  className,
  currentStatus,
  labels,
  variant = 'horizontal',
}: SpvStateTrackerProps) => {
  const currentIndex = SPV_STATUSES.indexOf(currentStatus)

  return (
    <ol
      aria-label={labels[currentStatus]}
      className={cn(listVariantClasses(variant), className)}
      data-slot="spv-state-tracker"
      data-variant={variant}
    >
      {SPV_STATUSES.map((status, index) => {
        const state = getStepState(index, currentIndex)

        return (
          <li
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'rounded-md border text-sm transition-colors',
              itemVariantClasses(variant),
              stepStateClasses(state),
            )}
            data-state={state}
            key={status}
          >
            <span className="min-w-0 font-medium leading-tight">{labels[status]}</span>
            <span className={orderVariantClasses(variant)}>{index + 1}</span>
          </li>
        )
      })}
    </ol>
  )
}
