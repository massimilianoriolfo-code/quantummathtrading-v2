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
          [--crpm-soft:rgba(255,255,255,0.035)]
          [--crpm-border:rgba(63,63,70,0.85)]
          [--crpm-text:#f4f4f5]
          [--crpm-muted:#a1a1aa]
          [--crpm-faint:#71717a]
          [--crpm-green:#6ee7b7]
          [--crpm-red:#fca5a5]
          [--crpm-blue:#93c5fd]
          [--crpm-purple:#d8b4fe]
          [--crpm-yellow:#fde68a]
          data-[crpm-theme=light]:[--crpm-bg:#f4f6f8]
          data-[crpm-theme=light]:[--crpm-panel:#ffffff]
          data-[crpm-theme=light]:[--crpm-panel-2:#f8fafc]
          data-[crpm-theme=light]:[--crpm-soft:rgba(15,23,42,0.04)]
          data-[crpm-theme=light]:[--crpm-border:rgba(203,213,225,0.95)]
          data-[crpm-theme=light]:[--crpm-text:#0f172a]
          data-[crpm-theme=light]:[--crpm-muted:#475569]
          data-[crpm-theme=light]:[--crpm-faint:#64748b]
          data-[crpm-theme=light]:[--crpm-green:#047857]
          data-[crpm-theme=light]:[--crpm-red:#b91c1c]
          data-[crpm-theme=light]:[--crpm-blue:#1d4ed8]
          data-[crpm-theme=light]:[--crpm-purple:#7e22ce]
          data-[crpm-theme=light]:[--crpm-yellow:#a16207]
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
