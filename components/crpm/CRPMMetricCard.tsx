type CRPMMetricCardProps = {
  label: string
  value: React.ReactNode
  subvalue?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export default function CRPMMetricCard({
  label,
  value,
  subvalue,
  icon,
  className = '',
}: CRPMMetricCardProps) {
  return (
    <div
      className={`rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-soft)] px-3 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-panel)] text-[var(--crpm-muted)]">
            {icon}
          </div>
        ) : null}

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--crpm-faint)]">
            {label}
          </div>

          <div className="mt-1 text-xl font-black text-[var(--crpm-heading)]">
            {value}
          </div>

          {subvalue ? (
            <div className="text-[11px] font-semibold text-[var(--crpm-muted)]">
              {subvalue}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
