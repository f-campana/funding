'use client'

import type { EuroCents, InvestorId, QualificationType, SupportedCountry } from '@repo/domain'
import { Badge, Button, cn } from '@repo/ui'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { MoneyDisplay } from '../money'

export type InvestorCommitmentStatus =
  | 'invited'
  | 'reviewing'
  | 'committed'
  | 'kyc_pending'
  | 'signed'
  | 'wired'

export type InvestorRowDetail = {
  readonly id: string
  readonly label: string
  readonly value: ReactNode
  readonly description?: ReactNode
  readonly tone?: 'neutral' | 'success' | 'warning'
}

export type InvestorRowData = {
  readonly id: InvestorId
  readonly name: string
  readonly country: SupportedCountry
  readonly entityType: 'individual' | 'legal_entity'
  readonly qualificationType: QualificationType
  readonly status: InvestorCommitmentStatus
  readonly committedAmount: EuroCents
  readonly details?: readonly InvestorRowDetail[]
}

export type InvestorRowProps = {
  readonly investor: InvestorRowData
  readonly locale?: string
  readonly labels: {
    readonly expand: string
    readonly collapse: string
    readonly amount: string
    readonly country: string
    readonly entityType: string
    readonly qualification: string
    readonly status: Record<InvestorCommitmentStatus, string>
    readonly qualificationType: Record<QualificationType, string>
  }
  readonly className?: string
}

export const InvestorRow = ({
  className,
  investor,
  labels,
  locale = 'fr-FR',
}: InvestorRowProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const detailsId = `investor-${investor.id}-details`
  const disclosureLabel = isOpen ? labels.collapse : labels.expand
  const detailItems: readonly InvestorRowDetail[] =
    investor.details && investor.details.length > 0
      ? investor.details
      : [
          {
            id: 'entity-type',
            label: labels.entityType,
            value: investor.entityType,
          },
        ]

  return (
    <article
      className={cn(
        'border-b border-border bg-card text-card-foreground last:border-b-0',
        className,
      )}
      data-slot="investor-row"
      data-state={isOpen ? 'open' : 'closed'}
    >
      <div className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(12rem,1.4fr)_minmax(6rem,0.6fr)_minmax(9rem,1fr)_minmax(9rem,auto)_auto] md:items-center md:gap-4">
        <div className="grid min-w-0 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-sm font-semibold text-foreground md:truncate">
              {investor.name}
            </h3>
            <Badge variant="secondary">{labels.status[investor.status]}</Badge>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 md:block">
          <span className="text-xs font-medium text-muted-foreground md:sr-only">
            {labels.country}
          </span>
          <span className="text-sm font-medium text-foreground">{investor.country}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 md:block">
          <span className="text-xs font-medium text-muted-foreground md:sr-only">
            {labels.qualification}
          </span>
          <span className="min-w-0 text-sm text-foreground md:truncate">
            {labels.qualificationType[investor.qualificationType]}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-left md:block md:text-right">
          <span className="text-xs font-medium text-muted-foreground md:sr-only">
            {labels.amount}
          </span>
          <MoneyDisplay
            amount={investor.committedAmount}
            className="max-w-full whitespace-normal break-words text-sm md:whitespace-nowrap"
            locale={locale}
          />
        </div>
        <Button
          aria-controls={detailsId}
          aria-expanded={isOpen}
          aria-label={disclosureLabel}
          className="justify-self-start md:justify-self-end"
          onClick={() => setIsOpen((current) => !current)}
          size="icon"
          variant="ghost"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform', isOpen ? 'rotate-180' : null)}
          />
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            id={detailsId}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          >
            <dl
              className="grid gap-3 border-t border-border bg-muted p-4 text-sm sm:grid-cols-2"
              data-slot="investor-row-details"
            >
              {detailItems.map((detail) => (
                <div className="grid gap-1" data-tone={detail.tone ?? 'neutral'} key={detail.id}>
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="font-medium text-foreground">{detail.value}</dd>
                  {detail.description ? (
                    <dd className="text-xs leading-5 text-muted-foreground">
                      {detail.description}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  )
}
