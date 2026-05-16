import { Badge, cn, Progress } from '@repo/ui'

import type { DealOperationsRouteData } from './data'
import {
  formatDateTimeLabel,
  formatMoney,
  getDimensionStateLabel,
  getReadinessLabel,
} from './deal-operational-adapters'

type DealAboutOverviewProps = {
  readonly data: DealOperationsRouteData
}

export function DealAboutOverview({ data }: DealAboutOverviewProps) {
  const unresolvedBlockers = data.blockers.filter((blocker) => !blocker.resolved)
  const aboutBlockers = unresolvedBlockers.filter((blocker) => blocker.routeHint === 'about')
  const primaryBlockers = aboutBlockers.length > 0 ? aboutBlockers : unresolvedBlockers
  const progressValue = progressPercent(
    data.capital.committedAmount.amountMinor,
    data.capital.targetAmount.amountMinor,
  )

  return (
    <section className="grid gap-4" data-slot="deal-about-overview">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section
          className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card"
          data-slot="closing-readiness-summary"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Closing readiness
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {getReadinessLabel(data.readiness.state)}
              </h2>
            </div>
            <Badge
              className={cn('capitalize', readinessBadgeClassName(data.readiness.state))}
              variant="outline"
            >
              {data.readiness.unresolvedBlockerCount} open blockers
            </Badge>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {data.readiness.nextActionLabel}
          </p>

          <dl className="mt-5 grid gap-2 sm:grid-cols-3">
            <SummaryMetric label="Critical" value={String(data.readiness.criticalBlockerCount)} />
            <SummaryMetric label="Warning" value={String(data.readiness.warningBlockerCount)} />
            <SummaryMetric label="Info" value={String(data.readiness.infoBlockerCount)} />
          </dl>

          <div className="mt-5 grid gap-2" data-slot="readiness-dimensions">
            {data.readiness.dimensions.map((dimension) => (
              <div
                className="grid gap-2 rounded-md border border-border bg-background px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                data-state={dimension.state}
                key={dimension.id}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{dimension.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {dimension.blockerCount} blocker{dimension.blockerCount === 1 ? '' : 's'}
                  </p>
                </div>
                <Badge className={readinessBadgeClassName(dimension.state)} variant="outline">
                  {getDimensionStateLabel(dimension.state)}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card"
          data-slot="capital-summary"
        >
          <div className="grid gap-1">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Capital reconciliation
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              {formatMoney(data.capital.committedAmount)} committed
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Target {formatMoney(data.capital.targetAmount)} - matched{' '}
              {formatMoney(data.capital.matchedAmount)}
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{progressValue}% of target</span>
              <span className="font-mono text-muted-foreground">
                {formatMoney(data.capital.remainingToTarget)} remaining
              </span>
            </div>
            <Progress aria-label="Committed capital progress" value={progressValue} />
          </div>

          <dl className="mt-5 grid gap-2 sm:grid-cols-2">
            <SummaryMetric label="Signed" value={formatMoney(data.capital.signedAmount)} />
            <SummaryMetric label="Received" value={formatMoney(data.capital.receivedAmount)} />
            <SummaryMetric
              label="Unreceived signed"
              value={formatMoney(data.capital.unreceivedSigned)}
            />
            <SummaryMetric
              label="Unmatched received"
              value={formatMoney(data.capital.unmatchedReceived)}
            />
          </dl>

          <dl className="mt-5 grid gap-2 rounded-md border border-border bg-muted/35 p-3">
            <CompactMetric
              label="Net investable"
              value={formatMoney(data.capital.economics.netInvestableAmount)}
            />
            <CompactMetric
              label="Entry fees"
              value={formatMoney(data.capital.economics.entryFees)}
            />
            <CompactMetric label="SPV fee" value={formatMoney(data.capital.economics.spvFee)} />
            <CompactMetric label="Carry" value={`${data.capital.economics.carryPercent}%`} />
          </dl>
        </section>
      </div>

      <section
        className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card"
        data-slot="closing-blocker-summary"
      >
        <div className="grid gap-1">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Blocker summary
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {unresolvedBlockers.length} unresolved closing blockers
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            About-route blockers are shown first, followed by investor and document exceptions that
            still affect close readiness.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {primaryBlockers.map((blocker) => (
            <article
              className="grid gap-3 rounded-md border border-border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
              data-severity={blocker.severity}
              key={blocker.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{blocker.title}</h3>
                  <Badge className={blockerBadgeClassName(blocker.severity)} variant="outline">
                    {blocker.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {blocker.description}
                </p>
              </div>
              <dl className="grid gap-1 text-sm md:min-w-40">
                <CompactMetric label="Owner" value={ownerLabel(blocker.owner)} />
                <CompactMetric label="Surface" value={routeLabel(blocker.routeHint)} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section
        className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card"
        data-slot="activity-summary"
      >
        <div className="grid gap-1">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Latest operations
          </p>
          <h2 className="text-xl font-semibold text-foreground">Recent activity</h2>
        </div>
        <ol className="mt-5 grid gap-3">
          {data.activity.slice(0, 4).map((event) => (
            <li
              className="grid gap-1 rounded-md border border-border bg-background px-4 py-3"
              key={event.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{event.summary}</p>
                <time className="text-xs text-muted-foreground" dateTime={event.occurredAt}>
                  {formatDateTimeLabel(event.occurredAt)}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">{event.actorLabel}</p>
            </li>
          ))}
        </ol>
      </section>
    </section>
  )
}

const SummaryMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="grid gap-1 rounded-md border border-border bg-background px-3 py-3">
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="break-words font-mono text-lg font-semibold tabular-nums text-foreground">
      {value}
    </dd>
  </div>
)

const CompactMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex min-w-0 items-baseline justify-between gap-3">
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
      {value}
    </dd>
  </div>
)

const progressPercent = (part: number, total: number): number => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((part / total) * 100)))
}

const readinessBadgeClassName = (state: string): string =>
  ({
    attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
    blocked: 'border-status-danger-border bg-status-danger-muted text-status-danger',
    not_started: 'border-border bg-muted text-muted-foreground',
    ready: 'border-status-success-border bg-status-success-muted text-status-success',
  })[state] ?? 'border-border bg-muted text-muted-foreground'

const blockerBadgeClassName = (severity: string): string =>
  ({
    critical: 'border-status-danger-border bg-status-danger-muted text-status-danger',
    info: 'border-status-info-border bg-status-info-muted text-status-info',
    warning: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  })[severity] ?? 'border-border bg-muted text-muted-foreground'

const ownerLabel = (owner: string): string =>
  owner
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const routeLabel = (routeHint: string): string =>
  ({
    about: 'About',
    commitments: 'Commitments',
    documents: 'Documents',
  })[routeHint] ?? routeHint
