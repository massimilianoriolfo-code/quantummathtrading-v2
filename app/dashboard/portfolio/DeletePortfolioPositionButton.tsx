'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import CRPMActionButton from '@/components/crpm/CRPMActionButton'

type Props = {
  positionId: string
  ticker: string
}

export default function DeletePortfolioPositionButton({
  positionId,
  ticker,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${ticker} from portfolio?`)
    if (!confirmed) return

    setLoading(true)

    const response = await fetch('/api/portfolio/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: positionId }),
    })

    if (!response.ok) {
      alert('Unable to delete position')
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <CRPMActionButton
      onClick={handleDelete}
      disabled={loading}
      grouped
      grouped
      variant="danger"
    >
      <Trash2 size={12} strokeWidth={2.1} />
    </CRPMActionButton>
  )
}
