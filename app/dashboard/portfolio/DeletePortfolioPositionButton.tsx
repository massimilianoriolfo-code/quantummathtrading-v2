'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

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
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete this position from portfolio"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  )
}