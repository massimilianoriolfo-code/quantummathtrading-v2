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
  const [theme, setThemeState] = useState<CRPMTheme>('light')

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
          data-[crpm-theme=light]:[--crpm-panel-2:#ffffff]
          data-[crpm-theme=light]:[--crpm-soft:#eff6ff]
          data-[crpm-theme=light]:[--crpm-cell:#ffffff]
          data-[crpm-theme=light]:[--crpm-border:#d7dee8]
          data-[crpm-theme=light]:[--crpm-text:#0b1220]
          data-[crpm-theme=light]:[--crpm-muted:#26364d]
          data-[crpm-theme=light]:[--crpm-faint:#4b5f7a]
          data-[crpm-theme=light]:[--crpm-heading:#081225]
          data-[crpm-theme=light]:[--crpm-green:#009a57]
          data-[crpm-theme=light]:[--crpm-red:#ff1f2d]
          data-[crpm-theme=light]:[--crpm-blue:#004fc4]
          data-[crpm-theme=light]:[--crpm-purple:#6d3fd1]
          data-[crpm-theme=light]:[--crpm-yellow:#f59e0b]
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
