type CRPMBadgeProps = {
  children: React.ReactNode
  tone?: 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'neutral'
}

const tones = {
  green: 'border-[var(--crpm-green)]/60 bg-[var(--crpm-green)]/10 text-[var(--crpm-green)]',
  red: 'border-[var(--crpm-red)]/60 bg-[var(--crpm-red)]/10 text-[var(--crpm-red)]',
  blue: 'border-[var(--crpm-blue)]/60 bg-[var(--crpm-blue)]/10 text-[var(--crpm-blue)]',
  purple: 'border-[var(--crpm-purple)]/60 bg-[var(--crpm-purple)]/10 text-[var(--crpm-purple)]',
  yellow: 'border-[var(--crpm-yellow)]/60 bg-[var(--crpm-yellow)]/10 text-[var(--crpm-yellow)]',
  neutral: 'border-[var(--crpm-border)] bg-[var(--crpm-soft)] text-[var(--crpm-muted)]',
}

export default function CRPMBadge({
  children,
  tone = 'neutral',
}: CRPMBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
