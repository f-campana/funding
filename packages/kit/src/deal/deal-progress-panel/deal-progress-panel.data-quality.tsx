import { cn } from '@repo/ui'
import { AlertCircle } from 'lucide-react'

import { dataQualityClasses } from './deal-progress-panel.styles'
import type { DealProgressDataQuality } from './deal-progress-panel.types'

export const DataQualityNotice = ({
  dataQuality,
}: {
  readonly dataQuality: Exclude<DealProgressDataQuality, { readonly kind: 'fresh' }>
}) => (
  <div
    className={cn(
      'flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5',
      dataQualityClasses[dataQuality.kind],
    )}
    data-slot="deal-progress-data-quality"
    data-state={dataQuality.kind}
  >
    <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
    <div className="grid gap-0.5">
      <p className="font-medium">{dataQuality.label}</p>
      {dataQuality.description ? <p>{dataQuality.description}</p> : null}
    </div>
  </div>
)
