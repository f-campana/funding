import { Badge, cn } from '@repo/ui'
import { Activity } from 'lucide-react'
import { useId } from 'react'

import { activityToneClasses } from './deal-operational-overview.styles'
import type {
  DealOperationalActivityItem,
  DealOperationalOverviewLabels,
} from './deal-operational-overview.types'

export const ActivitySection = ({
  activity,
  labels,
}: {
  readonly activity: readonly DealOperationalActivityItem[]
  readonly labels: DealOperationalOverviewLabels
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-4 border-t border-border/70 p-5 lg:border-l lg:border-t-0"
      data-slot="deal-operational-activity"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
          {labels.activityTitle}
        </h3>
        <Activity aria-hidden="true" className="size-4 text-muted-foreground" />
      </div>
      {activity.length > 0 ? (
        <ol className="grid gap-3">
          {activity.map((item) => (
            <ActivityItem item={item} key={item.id} />
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">{labels.noActivityLabel}</p>
      )}
    </section>
  )
}

const ActivityItem = ({ item }: { readonly item: DealOperationalActivityItem }) => (
  <li
    className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
    data-slot="deal-operational-activity-item"
  >
    <span
      aria-hidden="true"
      className={cn('mt-2 size-2 rounded-full', activityToneClasses[item.tone ?? 'neutral'])}
    />
    <div className="grid gap-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-card-foreground">{item.actor}</span>
        <time dateTime={item.dateTime}>{item.timestampLabel}</time>
        {item.typeLabel ? (
          <Badge className="border-border bg-muted text-muted-foreground" variant="outline">
            {item.typeLabel}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
    </div>
  </li>
)
