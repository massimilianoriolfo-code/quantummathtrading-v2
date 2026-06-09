'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

type Props = {
  watchlistId: string
  ticker: string
}

export default function DeleteWatchlistButton({
  watchlistId,
  ticker,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(`Remove ${ticker} from watchlist?`)
    if (!confirmed) return

    setLoading(true)

    const response = await fetch('/api/watchlist/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: watchlistId }),
    })

    if (!response.ok) {
      alert('Unable to delete ticker')
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title={`Delete ${ticker} from watchlist`}
      aria-label={`Delete ${ticker} from watchlist`}
      className="group relative inline-flex h-8 min-w-[68px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-500 bg-slate-600 px-2 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={13} strokeWidth={2.2} className="text-red-300" />

      <span>Delete</span>

      <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-md group-hover:block">
        Delete ticker
      </span>
    </button>
  )
}