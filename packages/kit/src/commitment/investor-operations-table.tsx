'use client'

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
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'

import { MoneyDisplay } from '../money'
import { statusToneClasses } from '../status/status-tone'

export type InvestorOperationsTableProps = {
  readonly title: string
  readonly records: readonly InvestorOperationsRecord[]
  readonly labels: {
    readonly empty: string
    readonly noLegalEntity: string
    readonly notApplicable: string
    readonly inspectAction: string
    readonly columns: {
      readonly investor: string
      readonly legalEntity: string
      readonly commitmentAmount: string
      readonly commitmentStatus: string
      readonly kyc: string
      readonly kyb: string
      readonly signature: string
      readonly wire: string
      readonly actions: string
    }
  }
  readonly description?: string
  readonly selectedRecordId?: string
  readonly onSelectRecord?: (record: InvestorOperationsRecord) => void
  readonly locale?: string
  readonly className?: string
}

export const InvestorOperationsTable = ({
  className,
  description,
  labels,
  locale = 'fr-FR',
  onSelectRecord,
  records,
  selectedRecordId,
  title,
}: InvestorOperationsTableProps) => (
  <Card
    className={cn('gap-0 overflow-hidden py-0', className)}
    data-slot="investor-operations-table"
  >
    <CardHeader className="gap-2 border-b border-border p-4">
      <CardTitle>{title}</CardTitle>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </CardHeader>
    <CardContent className="p-0">
      {records.length > 0 ? (
        <Table className="min-w-[54rem]">
          <TableHeader className="bg-muted/45">
            <TableRow className="hover:bg-muted/45">
              <TableHead className="h-9 text-xs font-semibold text-muted-foreground">
                {labels.columns.investor}
              </TableHead>
              <TableHead className="hidden h-9 text-xs font-semibold text-muted-foreground lg:table-cell">
                {labels.columns.legalEntity}
              </TableHead>
              <TableHead className="h-9 text-right text-xs font-semibold text-muted-foreground">
                {labels.columns.commitmentAmount}
              </TableHead>
              <TableHead className="h-9 text-xs font-semibold text-muted-foreground">
                {labels.columns.commitmentStatus}
              </TableHead>
              <TableHead className="h-9 text-xs font-semibold text-muted-foreground">
                {labels.columns.kyc}
              </TableHead>
              <TableHead className="hidden h-9 text-xs font-semibold text-muted-foreground 2xl:table-cell">
                {labels.columns.kyb}
              </TableHead>
              <TableHead className="hidden h-9 text-xs font-semibold text-muted-foreground 2xl:table-cell">
                {labels.columns.signature}
              </TableHead>
              <TableHead className="h-9 text-xs font-semibold text-muted-foreground">
                {labels.columns.wire}
              </TableHead>
              <TableHead className="h-9 text-right text-xs font-semibold text-muted-foreground">
                {labels.columns.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                className="hover:bg-muted/45 data-[state=selected]:bg-muted"
                data-state={selectedRecordId === record.id ? 'selected' : undefined}
                key={record.id}
              >
                <TableCell className="py-2.5">
                  <div className="grid gap-1">
                    <span className="font-medium text-foreground">{record.investorName}</span>
                    {record.investorEmail ? (
                      <span className="text-xs text-muted-foreground">{record.investorEmail}</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-64 truncate text-muted-foreground lg:table-cell">
                  {record.legalEntityName ?? labels.noLegalEntity}
                </TableCell>
                <TableCell className="font-mono text-right text-sm font-semibold tabular-nums">
                  <MoneyDisplay amount={record.commitmentAmountCents} locale={locale} />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={getCommitmentLifecycleLabel(record.commitmentStatus)}
                    tone={getCommitmentLifecycleTone(record.commitmentStatus)}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={getKycOperationalStatusLabel(record.kycStatus)}
                    tone={getKycOperationalStatusTone(record.kycStatus)}
                  />
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  {record.kybStatus ? (
                    <StatusBadge
                      label={getKybOperationalStatusLabel(record.kybStatus)}
                      tone={getKybOperationalStatusTone(record.kybStatus)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{labels.notApplicable}</span>
                  )}
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  <StatusBadge
                    label={getSignatureOperationalStatusLabel(record.signatureStatus)}
                    tone={getSignatureOperationalStatusTone(record.signatureStatus)}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={getWireOperationalStatusLabel(record.wireStatus)}
                    tone={getWireOperationalStatusTone(record.wireStatus)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    aria-pressed={selectedRecordId === record.id}
                    className="h-8"
                    onClick={() => onSelectRecord?.(record)}
                    size="sm"
                    type="button"
                    variant={selectedRecordId === record.id ? 'secondary' : 'outline'}
                  >
                    {labels.inspectAction}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="p-4 text-sm text-muted-foreground">{labels.empty}</p>
      )}
    </CardContent>
  </Card>
)

const StatusBadge = ({
  label,
  tone,
}: {
  readonly label: string
  readonly tone: keyof typeof statusToneClasses
}) => (
  <Badge className={cn('whitespace-nowrap', statusToneClasses[tone])} variant="outline">
    {label}
  </Badge>
)
