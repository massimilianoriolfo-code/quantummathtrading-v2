'use client'

import { useCRPMTheme } from './CRPMThemeProvider'

export default function CRPMThemeToggle() {
  const { theme, setTheme } = useCRPMTheme()

  return (
    <div className="inline-flex rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-soft)] p-1">
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`rounded px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
          theme === 'dark'
            ? 'bg-blue-600 text-white'
            : 'text-[var(--crpm-muted)] hover:text-[var(--crpm-text)]'
        }`}
      >
        Dark
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`rounded px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
          theme === 'light'
            ? 'bg-blue-600 text-white'
            : 'text-[var(--crpm-muted)] hover:text-[var(--crpm-text)]'
        }`}
      >
        Light
      </button>
    </div>
  )
}
