'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

const normalizeProgress = (value: number | null | undefined, max: number | undefined) => {
  const resolvedMax = typeof max === 'number' && Number.isFinite(max) && max > 0 ? max : 100

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { max: resolvedMax, percent: 0, value: null }
  }

  const clampedValue = Math.min(Math.max(value, 0), resolvedMax)

  return {
    max: resolvedMax,
    percent: (clampedValue / resolvedMax) * 100,
    value: clampedValue,
  }
}

export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root>

export const Progress = ({ className, max, value, ...props }: ProgressProps) => {
  const normalized = normalizeProgress(value, max)

  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      data-slot="progress"
      max={normalized.max}
      value={normalized.value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="size-full flex-1 bg-primary transition-transform"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - normalized.percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
