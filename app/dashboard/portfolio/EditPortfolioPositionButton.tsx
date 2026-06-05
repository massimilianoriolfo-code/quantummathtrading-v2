'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'

type Props = {
  positionId: string
  ticker: string
  company: string | null
  quantity: number
  averageCost: number
}

export default function EditPortfolioPositionButton({
  positionId,
  ticker,
  company,
  quantity,
  averageCost,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleEdit() {
    const newQuantity = window.prompt(`Quantity for ${ticker}`, String(quantity))
    if (newQuantity === null) return

    const newAverageCost = window.prompt(
      `Average price for ${ticker}`,
      String(averageCost)
    )
    if (newAverageCost === null) return

    const newCompany = window.prompt(`Company name for ${ticker}`, company || '')
    if (newCompany === null) return

    setLoading(true)

    const response = await fetch('/api/portfolio/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: positionId,
        quantity: Number(newQuantity),
        averageCost: Number(newAverageCost),
        company: newCompany,
      }),
    })

    if (!response.ok) {
      alert('Unable to update position')
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleEdit}
      disabled={loading}
      title="Edit quantity, average price and company name"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Pencil size={16} strokeWidth={2.2} />
    </button>
  )
}