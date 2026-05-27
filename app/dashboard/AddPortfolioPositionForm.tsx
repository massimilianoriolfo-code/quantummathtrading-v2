'use client'

import { useState } from 'react'

export default function AddPortfolioPositionForm() {
  const [ticker, setTicker] = useState('')
  const [company, setCompany] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costBasis, setCostBasis] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const response = await fetch('/api/portfolio/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker,
        company,
        quantity: Number(quantity),
        averageCost: Number(costBasis),
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
    setCostBasis('')

    window.location.reload()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-3 md:grid-cols-5"
    >
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        placeholder="Ticker"
        className="rounded-xl border px-3 py-2"
      />

      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        className="rounded-xl border px-3 py-2"
      />

      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Quantity"
        type="number"
        className="rounded-xl border px-3 py-2"
      />

      <input
        value={costBasis}
        onChange={(e) => setCostBasis(e.target.value)}
        placeholder="Cost Basis"
        type="number"
        className="rounded-xl border px-3 py-2"
      />

      <button
        type="submit"
        className="rounded-xl bg-black px-4 py-2 font-bold text-white"
      >
        Add Position
      </button>

      {message && (
        <div className="md:col-span-5 text-sm font-bold text-green-700">
          {message}
        </div>
      )}
    </form>
  )
}