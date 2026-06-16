import Link from 'next/link'

export type CRPMNavKey = 'dashboard' | 'portfolio' | 'watchlist' | 'simulations' | 'simulator'

type Props = {
  active?: CRPMNavKey
  className?: string
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { key: 'portfolio', label: 'Portfolio', href: '/dashboard/portfolio', icon: 'briefcase' },
  { key: 'watchlist', label: 'Watchlist', href: '/dashboard/watchlist', icon: 'star' },
  { key: 'simulations', label: 'Simulations', href: '/dashboard/simulations', icon: 'clock' },
  { key: 'simulator', label: 'Simulator', href: '/simulatore-pro', icon: 'chart' },
] as const

function NavIcon({ icon }: { icon: (typeof navItems)[number]['icon'] }) {
  const className = 'h-3.5 w-3.5 stroke-[2.35]'

  if (icon === 'grid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M4 5h7v7H4V5Zm9 0h7v7h-7V5ZM4 14h7v5H4v-5Zm9 0h7v5h-7v-5Z" stroke="currentColor" />
      </svg>
    )
  }

  if (icon === 'briefcase') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M8 8V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V8M5 9h14v10H5V9Zm0 4h14" stroke="currentColor" />
      </svg>
    )
  }

  if (icon === 'star') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="m12 5 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2L7.8 18l.8-4.7L5.2 10l4.7-.7L12 5Z" stroke="currentColor" />
      </svg>
    )
  }

  if (icon === 'clock') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 17h16M5 14l4-4 3 3 6-7" stroke="currentColor" />
    </svg>
  )
}

export default function CRPMAppNav({ active, className = '' }: Props) {
  return (
    <nav className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      {navItems.map((item) => {
        const isActive = item.key === active

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#94a3b8] bg-white px-4 text-[12px] font-black text-[#081225] shadow-sm ring-1 ring-[#d7dee8] transition active:translate-y-px'
                : 'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d7dee8] bg-white px-4 text-[12px] font-black text-[#081225] shadow-sm transition hover:border-[#94a3b8] hover:bg-[#eff6ff] active:translate-y-px'
            }
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
