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
    <div className="border-b border-zinc-200 py-3 pl-4 pr-2">
      <form onSubmit={handleSubmit} className="grid gap-2.5">
        <div className="grid items-center gap-3 md:grid-cols-[180px_1fr]">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold leading-tight">
              Add Position
            </h2>

            <InfoTooltip text="Add position: search by company, ticker or ISIN, then enter quantity and average purchase price." />
          </div>

          <SymbolSearch
            onSelect={handleSymbolSelect}
            placeholder="Search company, ticker or ISIN (e.g., Apple, AAPL, US0378331005...)"
          />
        </div>

        <div className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase text-zinc-700">
              Ticker
              <InfoTooltip text="Ticker: selected ticker symbol." />
            </label>

            <input
              value={ticker}
              readOnly
              placeholder="Ticker"
              className="h-9 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-[13px] text-zinc-900"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase text-zinc-700">
              Company
              <InfoTooltip text="Company: selected company name." />
            </label>

            <input
              value={company}
              readOnly
              placeholder="Company name"
              className="h-9 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-[13px] text-zinc-900"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase text-zinc-700">
              Quantity
              <InfoTooltip text="Quantity: number of shares to add to the portfolio." />
            </label>

            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              type="number"
              className="h-9 w-full rounded-lg border border-zinc-300 px-3 text-[13px] text-zinc-900"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase text-zinc-700">
              Avg Price
              <InfoTooltip text="Avg price: average price paid per share." />
            </label>

            <input
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              placeholder="Average price paid"
              type="number"
              className="h-9 w-full rounded-lg border border-zinc-300 px-3 text-[13px] text-zinc-900"
            />
          </div>

          <button
            type="submit"
            title="Save this position into your portfolio"
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-500 bg-slate-600 px-4 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusCircle size={15} />
            Add Position
          </button>
        </div>

        {message && (
          <div className="text-[13px] font-semibold text-emerald-700">
            {message}
          </div>
        )}
      </form>
    </div>
  )
}