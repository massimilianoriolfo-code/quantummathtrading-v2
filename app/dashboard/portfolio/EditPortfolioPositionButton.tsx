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
className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-500 bg-slate-600 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"  
    >
      <Pencil size={15} strokeWidth={2.2} />
    </button>
  )
}