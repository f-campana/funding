import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ReactNode } from 'react'

export type MetricCardProps = {
  readonly label: string
  readonly value: ReactNode
  readonly description?: ReactNode
  readonly trend?: ReactNode
  readonly emphasis?: 'standard' | 'primary'
  readonly className?: string
}

export const MetricCard = ({
  className,
  description,
  emphasis = 'standard',
  label,
  trend,
  value,
}: MetricCardProps) => (
  <Card
    className={cn(
      'gap-0 overflow-hidden border-border/80 bg-card/95 py-0',
      emphasis === 'primary' && 'border-primary/45 bg-card',
      className,
    )}
    data-emphasis={emphasis}
    data-slot="metric-card"
  >
    <CardHeader className="gap-3 p-4">
      <CardTitle className="text-xs font-semibold tracking-normal text-muted-foreground">
        {label}
      </CardTitle>
      <div
        className={cn(
          'flex items-start gap-3',
          emphasis === 'primary' ? 'flex-col' : 'justify-between',
        )}
      >
        <div
          className={cn(
            'min-w-0 font-semibold leading-none tracking-normal text-foreground',
            emphasis === 'primary' ? 'max-w-full text-[clamp(1.5rem,2vw,1.75rem)]' : 'text-xl',
          )}
        >
          {value}
        </div>
        {trend ? (
          <div className="shrink-0 rounded-md border border-border bg-muted/70 px-2 py-1 text-xs font-medium text-primary">
            {trend}
          </div>
        ) : null}
      </div>
    </CardHeader>
    {description ? (
      <CardContent className="border-t border-border bg-muted/25 px-4 py-3 text-xs leading-5 text-muted-foreground">
        {description}
      </CardContent>
    ) : null}
  </Card>
)
