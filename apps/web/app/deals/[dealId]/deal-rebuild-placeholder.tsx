type DealRebuildPlaceholderProps = {
  readonly description: string
  readonly sectionLabel: string
}

export function DealRebuildPlaceholder({ description, sectionLabel }: DealRebuildPlaceholderProps) {
  return (
    <section className="grid gap-4" data-slot="deal-rebuild-placeholder">
      <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card sm:p-6">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {sectionLabel}
        </p>
        <div className="mt-3 grid gap-2">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            Deal Workspace rebuild in progress
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <PlaceholderItem
          label="Shell"
          value="The Next.js route, header, tabs, loading, error, and not-found states remain active."
        />
        <PlaceholderItem
          label="Baselines"
          value="Accepted kit baselines are available in Storybook for the rebuild pass."
        />
        <PlaceholderItem
          label="Data"
          value="Live data, adapters, and backend integration are intentionally out of scope here."
        />
      </div>
    </section>
  )
}

const PlaceholderItem = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="rounded-lg border border-border bg-background p-4 shadow-card">
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
  </div>
)
