import { UserButton } from '@clerk/nextjs'
import CRPMAppNav from './CRPMAppNav'

export type ActiveNav = 'dashboard' | 'portfolio' | 'watchlist' | 'simulations' | 'assistant' | 'simulator'

export default function CRPMHeader({ active, title, subtitle }: { active: ActiveNav; title: string; subtitle?: string }) {
  return (
    <header className="relative shrink-0 pb-4">
      <div className="absolute right-8 top-[-59px] z-50 flex items-end gap-3">
        <CRPMAppNav active={active} />
        <div className="mb-[2px]"><UserButton /></div>
      </div>

      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#4b5f7a]">QuantumMathTrading</div>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-[#081225]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-[12px] font-semibold text-[#4b5f7a]">{subtitle}</p> : null}
      </div>
    </header>
  )
}
