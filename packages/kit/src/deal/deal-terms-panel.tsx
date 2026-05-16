import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ReactNode } from 'react'

export type DealTerm = {
  readonly id: string
  readonly label: string
  readonly value: ReactNode
  readonly description?: ReactNode
}

export type DealTermsPanelProps = {
  readonly title: string
  readonly terms: readonly DealTerm[]
  readonly className?: string
}

export const DealTermsPanel = ({ className, terms, title }: DealTermsPanelProps) => (
  <Card className={cn('gap-4', className)} data-slot="deal-terms-panel">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="grid gap-4">
        {terms.map((term) => (
          <div
            className="grid gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0"
            key={term.id}
          >
            <dt className="text-sm text-muted-foreground">{term.label}</dt>
            <dd className="text-sm font-medium text-foreground">{term.value}</dd>
            {term.description ? (
              <dd className="text-sm text-muted-foreground">{term.description}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
)
