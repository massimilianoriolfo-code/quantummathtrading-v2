'use client'

import { useState } from 'react'
import SymbolSearch from '@/components/SymbolSearch'

type SymbolResult = {
  ticker: string
  company: string
  exchange: string
}

export default function AddWatchlistTickerForm() {
  const [message, setMessage] = useState('')
  const [loadingTicker, setLoadingTicker] = useState('')

  async function addSelectedTicker(result: SymbolResult) {
    setMessage('')
    setLoadingTicker(result.ticker)

    const response = await fetch('/api/watchlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: result.ticker,
        company: result.company,
      }),
    })

    const json = await response.json()

    if (!response.ok) {
      setMessage(json.error || 'Unable to add ticker')
      setLoadingTicker('')
      return
    }

    setMessage(json.message || `Added ${result.ticker}`)
    window.location.reload()
  }

  return (
    <div className="mt-3">
      <SymbolSearch
        placeholder="Search ticker or company..."
        onSelect={addSelectedTicker}
      />

      {loadingTicker && (
        <div className="mt-2 text-xs font-bold text-zinc-500">
          Adding {loadingTicker}...
        </div>
      )}

      {message && (
        <div className="mt-2 text-xs font-bold text-green-700">
          {message}
        </div>
      )}
    </div>
  )
}