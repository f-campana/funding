import { Badge, cn } from '@repo/ui'
import { Eye } from 'lucide-react'
import { useId } from 'react'

import { ActionButton } from './deal-progress-panel.actions'
import { CapitalProgress } from './deal-progress-panel.capital'
import { DataQualityNotice } from './deal-progress-panel.data-quality'
import {
  getActionDisabledReason,
  getPrimaryAction,
  getSecondaryActions,
} from './deal-progress-panel.model'
import { commandStatusToneClasses } from './deal-progress-panel.styles'
import type {
  DealProgressAction,
  DealProgressActionHandler,
  DealProgressPanelProps,
  DealProgressReadyState,
} from './deal-progress-panel.types'

export const ReadyContent = ({
  labels,
  locale,
  onAction,
  state,
  titleId,
}: {
  readonly labels: DealProgressPanelProps['labels']
  readonly locale?: DealProgressPanelProps['locale']
  readonly onAction: DealProgressActionHandler | undefined
  readonly state: DealProgressReadyState
  readonly titleId: string
}) => {
  const primaryAction = getPrimaryAction(state)
  const secondaryActions = getSecondaryActions(state)
  const visibleActions = [primaryAction, ...secondaryActions].filter(
    (action): action is DealProgressAction => action !== undefined,
  )
  const disabledReasonBaseId = useId()
  const disabledReasonEntries = visibleActions
    .map((action) => getActionDisabledReason(action))
    .filter((reason): reason is string => reason !== undefined)
    .filter((reason, index, reasons) => reasons.indexOf(reason) === index)
    .map((reason, index) => ({
      id: `${disabledReasonBaseId}-${index}`,
      reason,
    }))
  const getDisabledReasonId = (action: DealProgressAction) => {
    const reason = getActionDisabledReason(action)

    return disabledReasonEntries.find((entry) => entry.reason === reason)?.id
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3" data-slot="deal-progress-header">
        <div className="grid gap-2">
          <h2 className="text-sm font-semibold text-command-foreground" id={titleId}>
            {labels.title}
          </h2>
          {state.visibility ? <VisibilityNote visibility={state.visibility} /> : null}
        </div>
        <Badge
          className={cn(
            'max-w-[12rem] justify-start truncate',
            commandStatusToneClasses[state.status.tone],
          )}
          data-slot="deal-progress-status"
          variant="outline"
        >
          {state.status.label}
        </Badge>
      </div>

      <CapitalProgress capital={state.capital} labels={labels} locale={locale} />

      {state.dataQuality.kind !== 'fresh' ? (
        <DataQualityNotice dataQuality={state.dataQuality} />
      ) : null}

      {visibleActions.length > 0 ? (
        <div className="grid gap-2" data-slot="deal-progress-actions">
          <div
            className={cn(
              'grid grid-cols-1 gap-2',
              visibleActions.length > 1 ? 'sm:grid-cols-2' : null,
            )}
          >
            {primaryAction ? (
              <ActionButton
                action={primaryAction}
                describedById={getDisabledReasonId(primaryAction)}
                onAction={onAction}
                primary={true}
              />
            ) : null}
            {secondaryActions.map((action) => (
              <ActionButton
                action={action}
                describedById={getDisabledReasonId(action)}
                key={action.kind}
                onAction={onAction}
              />
            ))}
          </div>
          {disabledReasonEntries.length > 0 ? (
            <div className="grid gap-2" data-slot="deal-progress-disabled-reasons">
              {disabledReasonEntries.map(({ id, reason }) => (
                <p
                  className="rounded-md border border-command-border bg-command-muted px-3 py-2 text-xs leading-5 text-command-foreground/75"
                  data-slot="deal-progress-disabled-reason"
                  id={id}
                  key={id}
                >
                  {reason}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

const VisibilityNote = ({
  visibility,
}: {
  readonly visibility: DealProgressReadyState['visibility']
}) => (
  <p
    className="flex min-w-0 items-center gap-2 text-sm leading-5 text-command-foreground/70"
    data-slot="deal-progress-visibility"
  >
    <Eye aria-hidden="true" className="size-4 shrink-0" />
    <span className="min-w-0 truncate">{visibility?.label}</span>
  </p>
)
