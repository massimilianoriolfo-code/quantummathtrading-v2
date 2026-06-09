import Link from 'next/link'

type Props = {
  active: 'dashboard' | 'portfolio' | 'watchlist' | 'simulator'
}

const items = [
  { key: 'dashboard', label: 'Control Center', href: '/dashboard' },
  { key: 'portfolio', label: 'Portfolio', href: '/dashboard/portfolio' },
  { key: 'watchlist', label: 'Watchlist', href: '/dashboard/watchlist' },
  { key: 'simulator', label: 'CRPM Simulator', href: '/simulatore-pro' },
] as const

export default function DashboardNav({ active }: Props) {
  return (
    <nav className="mt-4 flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = item.key === active

        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              isActive
                ? 'inline-flex h-8 items-center justify-center rounded-md border border-slate-700 bg-slate-700 px-3 text-[12px] font-semibold text-white shadow-sm'
                : 'inline-flex h-8 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-[12px] font-semibold text-zinc-700 shadow-sm transition hover:border-slate-500 hover:bg-zinc-50 hover:text-zinc-950'
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
