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
      className={`rounded-md border border-zinc-700/80 bg-white/[0.03] px-3 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-white/[0.04] text-zinc-300">
            {icon}
          </div>
        ) : null}

        <div>
          <div className="text-[10px] font-semibold uppercase text-zinc-400">
            {label}
          </div>

          <div className="mt-1 text-xl font-black text-white">
            {value}
          </div>

          {subvalue ? (
            <div className="text-[11px] font-medium text-zinc-400">
              {subvalue}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
