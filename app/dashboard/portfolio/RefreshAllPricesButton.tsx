'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type Position = {
  id: string
  ticker: string
}

type Props = {
  positions: Position[]
}

export default function RefreshAllPricesButton({ positions }: Props) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState('')
  const [done, setDone] = useState(0)

  const total = positions.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleRefreshAll() {
    if (loading || positions.length === 0) return

    setLoading(true)
    setDone(0)

    try {
      for (const position of positions) {
        setCurrent(position.ticker)

        const response = await fetch('/api/portfolio/refresh-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: position.id,
            ticker: position.ticker,
          }),
        })

        if (response.ok) {
          setDone((prev) => prev + 1)
        }
      }

      window.location.reload()
    } catch (error) {
      console.error(error)
      alert('Unable to refresh all prices')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRefreshAll}
        disabled={loading || positions.length === 0}
className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-500 bg-slate-600 px-4 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
  size={16}
  className={loading ? 'animate-spin text-white' : 'text-white'}
/>
        {loading ? `Refreshing ${done}/${total}` : 'Refresh All Prices'}
      </button>

      {loading && (
        <div className="w-[190px] text-right text-[11px] text-zinc-500">
          <div>Updating {current}</div>

          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-zinc-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div>{progress}% completed</div>
        </div>
      )}
    </div>
  )
}