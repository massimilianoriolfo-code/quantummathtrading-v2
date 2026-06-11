type CRPMBadgeProps = {
  children: React.ReactNode
  tone?: 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'neutral'
}

const tones = {
  green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  red: 'border-red-500/50 bg-red-500/10 text-red-300',
  blue: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  purple: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  yellow: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  neutral: 'border-zinc-700 bg-white/[0.03] text-zinc-300',
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
