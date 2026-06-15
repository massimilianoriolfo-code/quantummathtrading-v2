import Link from 'next/link'

type CRPMMachineCardProps = {
  href: string
  index: number
  icon: React.ReactNode
  name: string
  tag?: React.ReactNode
  strike: React.ReactNode
  premium: React.ReactNode
  maxProfit: React.ReactNode
  maxRisk: React.ReactNode
  maxRiskClassName?: string
  payoffLabel?: string
}

/**
 * Presentational CRPM machine row.
 *
 * This component intentionally contains no financial logic.
 * It only renders an already-computed CRPM Machine.
 *
 * Current status:
 * - created as reusable design-system component
 * - not wired yet into Simulations page
 * - no UI change until explicitly imported and used
 */
export default function CRPMMachineCard({
  href,
  index,
  icon,
  name,
  tag,
  strike,
  premium,
  maxProfit,
  maxRisk,
  maxRiskClassName = 'text-[var(--crpm-red)]',
  payoffLabel = 'P/L',
}: CRPMMachineCardProps) {
  return (
    <div className="group relative rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-cell)] px-3 py-3">
      <div className="grid grid-cols-[minmax(260px,1fr)_92px_92px_124px_132px_56px] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--crpm-border)] text-[11px] font-black text-[var(--crpm-blue)]">
              {index + 1}
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--crpm-border)] text-[var(--crpm-blue)]">
              {icon}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <div className="truncate text-sm font-black text-[var(--crpm-heading)]">
                {name}
              </div>
              {tag}
            </div>
          </div>
        </div>

        <MachineMetric label="Strike" value={strike} />
        <MachineMetric label="Premium" value={premium} />
        <MachineMetric
          label="Max Profit"
          value={maxProfit}
          className="text-[var(--crpm-green)]"
        />
        <MachineMetric
          label="Max Risk"
          value={maxRisk}
          className={maxRiskClassName}
        />

        <Link
          href={href}
          className="inline-flex h-8 items-center justify-center rounded-md border border-sky-500/70 bg-sky-500/10 px-3 text-[11px] font-black text-sky-100 transition hover:bg-sky-500/20 data-[crpm-theme=light]:text-sky-800"
        >
          {payoffLabel}
        </Link>
      </div>
    </div>
  )
}

function MachineMetric({
  label,
  value,
  className = 'text-[var(--crpm-heading)]',
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="border-l border-[var(--crpm-border)] px-2">
      <div className="text-[8px] font-black uppercase tracking-wide text-[var(--crpm-faint)]">
        {label}
      </div>
      <div className={`mt-0.5 text-[12px] font-black leading-4 ${className}`}>
        {value}
      </div>
    </div>
  )
}
