import Link from 'next/link'
import { BarChart3, Bot, BriefcaseBusiness, Clock3, LayoutDashboard, Star } from 'lucide-react'

type ActiveNav = 'dashboard' | 'portfolio' | 'watchlist' | 'simulations' | 'assistant' | 'simulator'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', active: 'dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', active: 'portfolio', icon: BriefcaseBusiness },
  { label: 'Watchlist', href: '/dashboard/watchlist', active: 'watchlist', icon: Star },
  { label: 'Simulations', href: '/dashboard/simulations', active: 'simulations', icon: Clock3 },
  { label: 'Assistant', href: '/dashboard/assistant', active: 'assistant', icon: Bot },
  { label: 'Simulator', href: '/simulatore-pro', active: 'simulator', icon: BarChart3 },
] as const

export default function CRPMAppNav({ active }: { active?: ActiveNav }) {
  return (
    <nav className="flex flex-nowrap items-end justify-end gap-0">
      {navItems.map((item, index) => {
        const Icon = item.icon
        const isActive = active === item.active
        const isLast = index === navItems.length - 1

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? 'relative z-50 -mb-px inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-t-xl border border-[#d7e1ec] border-b-white bg-white px-5 text-[12px] font-black text-[#081225] shadow-none'
                : `relative z-40 inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-[#d7e1ec] bg-[#edf2f8] px-5 text-[12px] font-black text-[#4b5f7a] shadow-none hover:bg-[#edf2f8] hover:text-[#4b5f7a] ${isLast ? '' : 'border-r-0'}`
            }
          >
            <Icon size={14} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
