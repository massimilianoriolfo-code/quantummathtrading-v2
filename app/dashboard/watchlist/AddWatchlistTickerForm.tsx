'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import SymbolSearch from '@/components/SymbolSearch'
import InfoTooltip from '@/components/InfoTooltip'

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
    <div className="border-b border-zinc-200 px-4 py-3">
      <div className="grid items-center gap-3 md:grid-cols-[180px_1fr]">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-bold leading-tight">
            Add Ticker
          </h2>

          <InfoTooltip text="Add ticker: search by company, ticker or ISIN and add it to the watchlist." />
        </div>

        <SymbolSearch
          placeholder="Search company, ticker or ISIN (e.g., Apple, AAPL, US0378331005...)"
          onSelect={addSelectedTicker}
        />
      </div>

      {(loadingTicker || message) && (
        <div className="mt-2 text-[12px] font-semibold">
          {loadingTicker && (
            <span className="text-zinc-500">Adding {loadingTicker}...</span>
          )}

          {message && (
            <span className="text-emerald-700">{message}</span>
          )}
        </div>
      )}
    </div>
  )
}
