'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import CRPMActionButton from '@/components/crpm/CRPMActionButton'

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
    <CRPMActionButton
      onClick={handleEdit}
      disabled={loading}
      grouped
      grouped
      variant="neutral"
    >
      <Pencil size={12} strokeWidth={2.1} />
    </CRPMActionButton>
  )
}
