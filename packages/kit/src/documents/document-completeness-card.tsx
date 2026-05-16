import {
  type DocumentCompletenessSummary,
  type DocumentRequirement,
  getDocumentRequirementStatusTone,
  summarizeDocumentCompleteness,
} from '@repo/domain/documents'
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'

import { statusToneClasses } from '../status/status-tone'

export type DocumentCompletenessCardProps = {
  readonly title: string
  readonly requirements: readonly DocumentRequirement[]
  readonly summary?: DocumentCompletenessSummary
  readonly labels: {
    readonly approved: string
    readonly missing: string
    readonly rejected: string
    readonly underReview: string
    readonly expired: string
    readonly required: string
    readonly optional: string
    readonly empty: string
    readonly status: Record<DocumentRequirement['status'], string>
    readonly owner: Record<DocumentRequirement['owner'], string>
  }
  readonly description?: string
  readonly className?: string
}

export const DocumentCompletenessCard = ({
  className,
  description,
  labels,
  requirements,
  summary = summarizeDocumentCompleteness(requirements),
  title,
}: DocumentCompletenessCardProps) => (
  <Card
    className={cn('gap-0 overflow-hidden py-0', className)}
    data-slot="document-completeness-card"
  >
    <CardHeader className="gap-2 border-b border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <Badge
          className={summary.isComplete ? statusToneClasses.success : statusToneClasses.attention}
          variant="outline"
        >
          {summary.approvedCount}/{summary.requiredCount} {labels.approved}
        </Badge>
      </div>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </CardHeader>
    <CardContent className="grid gap-4 p-4">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <DocumentMetric label={labels.missing} value={summary.requiredMissingCount} />
        <DocumentMetric label={labels.rejected} value={summary.requiredRejectedCount} />
        <DocumentMetric label={labels.underReview} value={summary.underReviewCount} />
      </div>
      {requirements.length > 0 ? (
        <ul className="grid gap-2">
          {requirements.map((requirement) => (
            <li
              className="grid gap-2 rounded-md border border-border bg-background px-3 py-2.5"
              data-slot="document-requirement-item"
              key={requirement.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-foreground">{requirement.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {labels.owner[requirement.owner]} /{' '}
                    {requirement.required ? labels.required : labels.optional}
                  </p>
                </div>
                <Badge
                  className={
                    statusToneClasses[getDocumentRequirementStatusTone(requirement.status)]
                  }
                  variant="outline"
                >
                  {labels.status[requirement.status]}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          {labels.empty}
        </p>
      )}
      <span className="sr-only">
        {labels.expired}: {summary.expiredCount}
      </span>
    </CardContent>
  </Card>
)

const DocumentMetric = ({ label, value }: { readonly label: string; readonly value: number }) => (
  <div className="grid gap-1 rounded-md border border-border bg-muted/60 p-3">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-lg font-semibold tabular-nums text-foreground">{value}</span>
  </div>
)
