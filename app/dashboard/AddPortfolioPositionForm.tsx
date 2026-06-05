'use client'

import { useState } from 'react'
import { PlusCircle, Search } from 'lucide-react'
import SymbolSearch from '@/components/SymbolSearch'
import InfoTooltip from '@/components/InfoTooltip'

type SymbolResult = {
  ticker: string
  company: string
  exchange: string
}

export default function AddPortfolioPositionForm() {
  const [ticker, setTicker] = useState('')
  const [company, setCompany] = useState('')
  const [quantity, setQuantity] = useState('')
  const [averagePrice, setAveragePrice] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const response = await fetch('/api/portfolio/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        company,
        quantity: Number(quantity),
        averageCost: Number(averagePrice),
      }),
    })

    const json = await response.json()

    if (!response.ok) {
      setMessage(json.error || 'Unable to add position')
      return
    }

    setMessage('Portfolio position added')
    setTicker('')
    setCompany('')
    setQuantity('')
    setAveragePrice('')
    window.location.reload()
  }

  function handleSymbolSelect(result: SymbolResult) {
    setTicker(result.ticker)
    setCompany(result.company)
  }

  return (
    <div className="border-b border-zinc-200 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <PlusCircle size={20} />
        </div>

        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold">Add Position</h2>
            <InfoTooltip text="Add a new portfolio position with ticker, quantity and average acquisition price" />
          </div>

          
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-zinc-700">
            Company or Ticker
            <InfoTooltip text="Search and select a listed company or ticker symbol" />
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400">
              <Search size={18} />
            </div>

            <SymbolSearch
              onSelect={handleSymbolSelect}
              placeholder="Search company or ticker (e.g., Apple, Microsoft, Nvidia, AAPL...)"
            />
          </div>
        </div>

        <div className="grid items-end gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-zinc-700">
              Ticker
              <InfoTooltip text="Selected ticker symbol" />
            </label>

            <input
              value={ticker}
              readOnly
              placeholder="Ticker"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-zinc-700">
              Company
              <InfoTooltip text="Selected company name" />
            </label>

            <input
              value={company}
              readOnly
              placeholder="Company name"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-zinc-700">
              Quantity
              <InfoTooltip text="Number of shares to add to portfolio" />
            </label>

            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              type="number"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-zinc-700">
              Avg Price
              <InfoTooltip text="Average price paid per share" />
            </label>

            <input
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              placeholder="Average price paid"
              type="number"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            title="Save this position into your portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-zinc-800"
          >
            <PlusCircle size={17} />
            Add Position
          </button>
        </div>

        {message && (
          <div className="text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}
      </form>
    </div>
  )
}