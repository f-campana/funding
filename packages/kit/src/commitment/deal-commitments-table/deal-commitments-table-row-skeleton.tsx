import { cn, Skeleton, TableCell, TableRow } from '@repo/ui'
import type { ComponentProps, ReactNode } from 'react'

import { visibleReadinessKeys } from './deal-commitments-table.model'

export const CommitmentRowSkeleton = () => (
  <TableRow
    aria-hidden="true"
    className="h-16"
    data-loading="true"
    data-row-density="compact"
    data-slot="commitment-row-skeleton"
  >
    <TableCell className="px-3 py-2">
      <Skeleton className="mx-auto size-4 rounded-[4px] motion-reduce:animate-none" />
    </TableCell>
    <SkeletonCell>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full motion-reduce:animate-none" />
        <div className="grid gap-2">
          <Skeleton className="h-3.5 w-28 motion-reduce:animate-none" />
          <Skeleton className="h-3 w-40 motion-reduce:animate-none" />
        </div>
      </div>
    </SkeletonCell>
    <SkeletonCell contentClassName="justify-end">
      <Skeleton className="h-3.5 w-20 motion-reduce:animate-none" />
    </SkeletonCell>
    {visibleReadinessKeys.map((key) => (
      <SkeletonCell cellClassName="border-l border-border/25" key={key}>
        <Skeleton className="h-3.5 w-16 motion-reduce:animate-none" />
      </SkeletonCell>
    ))}
    <SkeletonCell>
      <Skeleton className="h-6 w-20 rounded-full motion-reduce:animate-none" />
    </SkeletonCell>
    <TableCell className="px-3 py-2 text-right">
      <Skeleton className="ml-auto size-8 rounded-lg motion-reduce:animate-none" />
    </TableCell>
  </TableRow>
)

const SkeletonCell = ({
  children,
  cellClassName,
  contentClassName,
}: {
  readonly children: ReactNode
  readonly cellClassName?: ComponentProps<typeof TableCell>['className']
  readonly contentClassName?: string
}) => (
  <TableCell className={cn('px-3 py-2', cellClassName)}>
    <div className={cn('flex items-center', contentClassName)}>{children}</div>
  </TableCell>
)
