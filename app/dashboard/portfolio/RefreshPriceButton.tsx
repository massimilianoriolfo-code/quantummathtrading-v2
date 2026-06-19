'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import CRPMActionButton from '@/components/crpm/CRPMActionButton'

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
    <CRPMActionButton
      onClick={handleRefresh}
      disabled={loading}
      grouped
      grouped
      variant="neutral"
    >
      <RefreshCw size={12} strokeWidth={2.1} className={loading ? 'animate-spin' : ''} />
    </CRPMActionButton>
  )
}
