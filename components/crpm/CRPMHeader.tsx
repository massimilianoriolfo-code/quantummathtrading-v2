import { UserButton } from '@clerk/nextjs'
import CRPMAppNav from './CRPMAppNav'

type ActiveNav =
  | 'dashboard'
  | 'portfolio'
  | 'watchlist'
  | 'simulations'
  | 'assistant'
  | 'simulator'

export default function CRPMHeader({
  active,
  title,
  subtitle,
}: {
  active: ActiveNav
  title: string
  subtitle?: string
}) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#4b5f7a]">
          QuantumMathTrading
        </div>

        <h1 className="text-2xl font-black leading-tight tracking-tight text-[#081225]">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 max-w-3xl text-[12px] font-semibold text-[#4b5f7a]">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <CRPMAppNav active={active} />
        <UserButton />
      </div>
    </header>
  )
}
