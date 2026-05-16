import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import { match } from 'ts-pattern'

export type ActivityTimelineItem = {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly timestamp: string
  readonly tone?: 'neutral' | 'success' | 'warning'
}

export type ActivityTimelineProps = {
  readonly title: string
  readonly items: readonly ActivityTimelineItem[]
  readonly emptyLabel?: string
  readonly className?: string
}

const markerClasses = (tone: NonNullable<ActivityTimelineItem['tone']>) =>
  match(tone)
    .with('neutral', () => 'border-border bg-muted text-muted-foreground')
    .with('success', () => 'border-primary bg-primary text-primary-foreground')
    .with('warning', () => 'border-accent bg-accent text-accent-foreground')
    .exhaustive()

export const ActivityTimeline = ({
  className,
  emptyLabel,
  items,
  title,
}: ActivityTimelineProps) => (
  <Card className={cn('gap-4', className)} data-slot="activity-timeline">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length > 0 ? (
        <ol className="grid gap-0" data-slot="activity-timeline-list">
          {items.map((item, index) => {
            const tone = item.tone ?? 'neutral'

            return (
              <li
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3"
                data-slot="activity-timeline-item"
                data-tone={tone}
                key={item.id}
              >
                <div className="grid justify-items-center">
                  <span
                    aria-hidden="true"
                    className={cn('mt-1 size-3 rounded-full border', markerClasses(tone))}
                  />
                  {index < items.length - 1 ? (
                    <span aria-hidden="true" className="h-full w-px bg-border" />
                  ) : null}
                </div>
                <div className={cn('grid gap-1', index < items.length - 1 ? 'pb-4' : 'pb-0')}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">
                      {item.timestamp}
                    </p>
                  </div>
                  {item.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </CardContent>
  </Card>
)
