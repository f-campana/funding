type DealPendingWorkspaceSectionProps = {
  readonly description: string
  readonly sectionLabel: string
}

export function DealPendingWorkspaceSection({
  description,
  sectionLabel,
}: DealPendingWorkspaceSectionProps) {
  return (
    <section className="grid gap-4" data-slot="deal-pending-workspace-section">
      <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card sm:p-6">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {sectionLabel}
        </p>
        <div className="mt-3 grid gap-2">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            {sectionLabel} workflow not available yet
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <PendingWorkspaceItem
          label="Route"
          value="The deal header, tabs, right rail, loading, error, and not-found states remain active."
        />
        <PendingWorkspaceItem
          label="Scope"
          value={`${sectionLabel} records stay outside the active overview workflow.`}
        />
        <PendingWorkspaceItem
          label="Next step"
          value={`Use the ${sectionLabel.toLowerCase()} route when this workflow opens.`}
        />
      </div>
    </section>
  )
}

const PendingWorkspaceItem = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div className="rounded-lg border border-border bg-background p-4 shadow-card">
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
  </div>
)
