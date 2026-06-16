import Link from 'next/link'
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Clock3,
  LayoutDashboard,
  Star,
} from 'lucide-react'

type ActiveNav =
  | 'dashboard'
  | 'portfolio'
  | 'watchlist'
  | 'simulations'
  | 'assistant'
  | 'simulator'

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
    <nav className="flex flex-nowrap items-center justify-end gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = active === item.active

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-500 bg-white px-3 text-[12px] font-black text-slate-950 shadow-sm transition hover:bg-slate-50 active:translate-y-px'
                : 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-[12px] font-black text-slate-950 shadow-sm transition hover:border-slate-500 hover:bg-slate-50 active:translate-y-px'
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
