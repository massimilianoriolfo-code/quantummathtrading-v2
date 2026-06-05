'use client'

import { useState } from 'react'

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
    const confirmed = window.confirm(
      `Delete ${ticker} from portfolio?`
    )

    if (!confirmed) return

    setLoading(true)

    const response = await fetch('/api/portfolio/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      className="rounded-lg border px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}