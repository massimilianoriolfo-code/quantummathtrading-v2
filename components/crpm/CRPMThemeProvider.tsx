'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type CRPMTheme = 'dark' | 'light'

type CRPMThemeContextValue = {
  theme: CRPMTheme
  setTheme: (theme: CRPMTheme) => void
}

const CRPMThemeContext = createContext<CRPMThemeContextValue | null>(null)

export function CRPMThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<CRPMTheme>('dark')

  useEffect(() => {
    const saved = window.localStorage.getItem('crpm-theme')

    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved)
    }
  }, [])

  function setTheme(nextTheme: CRPMTheme) {
    setThemeState(nextTheme)
    window.localStorage.setItem('crpm-theme', nextTheme)
  }

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return (
    <CRPMThemeContext.Provider value={value}>
      <div
        data-crpm-theme={theme}
        className="
          min-h-screen
          [--crpm-bg:#07090b]
          [--crpm-panel:#12171d]
          [--crpm-panel-2:#0d1116]
          [--crpm-soft:rgba(255,255,255,0.04)]
          [--crpm-cell:rgba(0,0,0,0.10)]
          [--crpm-border:rgba(63,63,70,0.90)]
          [--crpm-text:#f8fafc]
          [--crpm-muted:#cbd5e1]
          [--crpm-faint:#94a3b8]
          [--crpm-heading:#ffffff]
          [--crpm-green:#5eead4]
          [--crpm-red:#fca5a5]
          [--crpm-blue:#93c5fd]
          [--crpm-purple:#d8b4fe]
          [--crpm-yellow:#fde047]
          data-[crpm-theme=light]:[--crpm-bg:#ffffff]
          data-[crpm-theme=light]:[--crpm-panel:#ffffff]
          data-[crpm-theme=light]:[--crpm-panel-2:#f8fafc]
          data-[crpm-theme=light]:[--crpm-soft:#f1f5f9]
          data-[crpm-theme=light]:[--crpm-cell:#e2e8f0]
          data-[crpm-theme=light]:[--crpm-border:#cbd5e1]
          data-[crpm-theme=light]:[--crpm-text:#0f172a]
          data-[crpm-theme=light]:[--crpm-muted:#334155]
          data-[crpm-theme=light]:[--crpm-faint:#64748b]
          data-[crpm-theme=light]:[--crpm-heading:#020617]
          data-[crpm-theme=light]:[--crpm-green:#047857]
          data-[crpm-theme=light]:[--crpm-red:#b91c1c]
          data-[crpm-theme=light]:[--crpm-blue:#1d4ed8]
          data-[crpm-theme=light]:[--crpm-purple:#7e22ce]
          data-[crpm-theme=light]:[--crpm-yellow:#78350f]
        "
      >
        {children}
      </div>
    </CRPMThemeContext.Provider>
  )
}

export function useCRPMTheme() {
  const context = useContext(CRPMThemeContext)

  if (!context) {
    throw new Error('useCRPMTheme must be used inside CRPMThemeProvider')
  }

  return context
}
