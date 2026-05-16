import {
  getCommitmentLifecycleLabel,
  getCommitmentLifecycleTone,
  getKybOperationalStatusLabel,
  getKybOperationalStatusTone,
  getKycOperationalStatusLabel,
  getKycOperationalStatusTone,
  getSignatureOperationalStatusLabel,
  getSignatureOperationalStatusTone,
  getWireOperationalStatusLabel,
  getWireOperationalStatusTone,
  type InvestorOperationsRecord,
} from '@repo/domain/commitments'
import type { ClosingBlocker } from '@repo/domain/deals'
import { type DocumentRequirement, getDocumentRequirementStatusTone } from '@repo/domain/documents'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ReactNode } from 'react'

import type { ActivityTimelineItem } from '../activity'
import { MoneyDisplay } from '../money'
import { statusToneClasses } from '../status/status-tone'

export type CommitmentInspectorProps = {
  readonly title: string
  readonly record?: InvestorOperationsRecord
  readonly blockers?: readonly ClosingBlocker[]
  readonly documentRequirements?: readonly DocumentRequirement[]
  readonly activityItems?: readonly ActivityTimelineItem[]
  readonly labels: {
    readonly empty: string
    readonly identity: string
    readonly legalEntity: string
    readonly commitment: string
    readonly statuses: string
    readonly blockers: string
    readonly documents: string
    readonly activity: string
    readonly actions: string
    readonly noLegalEntity: string
    readonly noBlockers: string
    readonly noDocuments: string
    readonly noActivity: string
    readonly remind: string
    readonly approve: string
    readonly openDocuments: string
    readonly status: {
      readonly commitment: string
      readonly kyc: string
      readonly kyb: string
      readonly signature: string
      readonly wire: string
    }
    readonly documentStatus: Record<DocumentRequirement['status'], string>
  }
  readonly className?: string
  readonly locale?: string
}

export const CommitmentInspector = ({
  activityItems = [],
  blockers = [],
  className,
  documentRequirements = [],
  labels,
  locale = 'fr-FR',
  record,
  title,
}: CommitmentInspectorProps) => {
  const recordBlockers = record
    ? blockers.filter((blocker) => record.blockerIds.includes(blocker.id))
    : []

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)} data-slot="commitment-inspector">
      <CardHeader className="gap-2 border-b border-border bg-muted/30 p-4">
        <CardTitle>{title}</CardTitle>
        {record ? (
          <p className="text-sm leading-6 text-muted-foreground">{record.investorName}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        {record ? (
          <>
            <section
              className="grid gap-3 rounded-md border border-border bg-background p-3"
              aria-labelledby="commitment-inspector-identity"
            >
              <h3
                className="text-sm font-semibold text-foreground"
                id="commitment-inspector-identity"
              >
                {labels.identity}
              </h3>
              <dl className="grid gap-2 text-sm">
                <InspectorRow label={labels.legalEntity}>
                  {record.legalEntityName ?? labels.noLegalEntity}
                </InspectorRow>
                <InspectorRow label={labels.commitment}>
                  <MoneyDisplay amount={record.commitmentAmountCents} locale={locale} />
                </InspectorRow>
              </dl>
            </section>
            <section
              className="grid gap-3 rounded-md border border-border bg-background p-3"
              aria-labelledby="commitment-inspector-statuses"
            >
              <h3
                className="text-sm font-semibold text-foreground"
                id="commitment-inspector-statuses"
              >
                {labels.statuses}
              </h3>
              <div className="grid gap-2">
                <StatusLine
                  label={labels.status.commitment}
                  statusLabel={getCommitmentLifecycleLabel(record.commitmentStatus)}
                  tone={getCommitmentLifecycleTone(record.commitmentStatus)}
                />
                <StatusLine
                  label={labels.status.kyc}
                  statusLabel={getKycOperationalStatusLabel(record.kycStatus)}
                  tone={getKycOperationalStatusTone(record.kycStatus)}
                />
                {record.kybStatus ? (
                  <StatusLine
                    label={labels.status.kyb}
                    statusLabel={getKybOperationalStatusLabel(record.kybStatus)}
                    tone={getKybOperationalStatusTone(record.kybStatus)}
                  />
                ) : null}
                <StatusLine
                  label={labels.status.signature}
                  statusLabel={getSignatureOperationalStatusLabel(record.signatureStatus)}
                  tone={getSignatureOperationalStatusTone(record.signatureStatus)}
                />
                <StatusLine
                  label={labels.status.wire}
                  statusLabel={getWireOperationalStatusLabel(record.wireStatus)}
                  tone={getWireOperationalStatusTone(record.wireStatus)}
                />
              </div>
            </section>
            <InspectorList title={labels.blockers} emptyLabel={labels.noBlockers}>
              {recordBlockers.map((blocker) => (
                <li
                  className="grid gap-1 rounded-md border border-border bg-background p-3"
                  key={blocker.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{blocker.title}</span>
                    <Badge
                      className={
                        statusToneClasses[
                          blocker.severity === 'critical'
                            ? 'danger'
                            : blocker.severity === 'warning'
                              ? 'attention'
                              : 'info'
                        ]
                      }
                      variant="outline"
                    >
                      {blocker.severity}
                    </Badge>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">{blocker.description}</p>
                </li>
              ))}
            </InspectorList>
            <InspectorList title={labels.documents} emptyLabel={labels.noDocuments}>
              {documentRequirements.slice(0, 4).map((requirement) => (
                <li
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-background p-3"
                  key={requirement.id}
                >
                  <span className="text-sm font-medium text-foreground">{requirement.label}</span>
                  <Badge
                    className={
                      statusToneClasses[getDocumentRequirementStatusTone(requirement.status)]
                    }
                    variant="outline"
                  >
                    {labels.documentStatus[requirement.status]}
                  </Badge>
                </li>
              ))}
            </InspectorList>
            <InspectorList title={labels.activity} emptyLabel={labels.noActivity}>
              {activityItems.slice(0, 3).map((item) => (
                <li
                  className="grid gap-1 rounded-md border border-border bg-background p-3"
                  key={item.id}
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{item.timestamp}</span>
                </li>
              ))}
            </InspectorList>
            <section className="grid gap-2" aria-label={labels.actions}>
              <Button type="button" variant="outline">
                {labels.remind}
              </Button>
              <Button type="button" variant="outline">
                {labels.approve}
              </Button>
              <Button type="button">{labels.openDocuments}</Button>
            </section>
          </>
        ) : (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {labels.empty}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const InspectorRow = ({
  children,
  label,
}: {
  readonly children: ReactNode
  readonly label: string
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="text-right font-medium text-foreground">{children}</dd>
  </div>
)

const StatusLine = ({
  label,
  statusLabel,
  tone,
}: {
  readonly label: string
  readonly statusLabel: string
  readonly tone: keyof typeof statusToneClasses
}) => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Badge className={statusToneClasses[tone]} variant="outline">
      {statusLabel}
    </Badge>
  </div>
)

const InspectorList = ({
  children,
  emptyLabel,
  title,
}: {
  readonly children: ReactNode
  readonly emptyLabel: string
  readonly title: string
}) => {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children)

  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {hasItems ? (
        <ul className="grid gap-2">{children}</ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </section>
  )
}
