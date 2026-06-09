'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type Props = {
  ticker: string
}

export default function RefreshWatchlistTickerButton({ ticker }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    if (loading) return

    setLoading(true)

    const response = await fetch(`/api/simulator?ticker=${ticker}`)

    if (!response.ok) {
      alert(`Unable to refresh analysis for ${ticker}`)
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      title={`Update CRPM analysis for ${ticker}`}
      aria-label={`Update CRPM analysis for ${ticker}`}
      className="group relative inline-flex h-8 min-w-[68px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-500 bg-slate-600 px-2 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={13}
        strokeWidth={2.2}
        className={loading ? 'animate-spin text-white' : 'text-white'}
      />

    <span>{loading ? '...' : 'CRPM'}</span>

      <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-md group-hover:block">
        Update CRPM analysis
      </span>
    </button>
  )
}