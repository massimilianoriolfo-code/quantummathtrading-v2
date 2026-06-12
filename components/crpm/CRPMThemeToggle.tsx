'use client'

import { useCRPMTheme } from './CRPMThemeProvider'

export default function CRPMThemeToggle() {
  const { theme, setTheme } = useCRPMTheme()

  return (
    <div className="inline-flex rounded-lg border border-[var(--crpm-border)] bg-[var(--crpm-soft)] p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wide transition ${
          theme === 'dark'
            ? 'bg-slate-900 text-white shadow-sm ring-1 ring-white/20'
            : 'text-[var(--crpm-muted)] hover:text-[var(--crpm-heading)]'
        }`}
      >
        <span className="mr-1">☾</span>
        Dark
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wide transition ${
          theme === 'light'
            ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-300'
            : 'text-[var(--crpm-muted)] hover:text-[var(--crpm-heading)]'
        }`}
      >
        <span className="mr-1">☀</span>
        Light
      </button>
    </div>
  )
}
