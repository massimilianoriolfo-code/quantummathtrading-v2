'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type Props = {
  positionId: string
  ticker: string
}

export default function RefreshPriceButton({ positionId, ticker }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)

    const response = await fetch('/api/portfolio/refresh-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: positionId, ticker }),
    })

    if (!response.ok) {
      alert('Unable to refresh price')
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
      title="Update market price for this position"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-slate-600 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
    </button>
  )
}