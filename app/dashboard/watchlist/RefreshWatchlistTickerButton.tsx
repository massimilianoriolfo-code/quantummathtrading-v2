'use client'

import { useState } from 'react'

type Props = {
  ticker: string
}

export default function RefreshWatchlistTickerButton({ ticker }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)

    const response = await fetch(`/api/simulator?ticker=${ticker}`)

    if (!response.ok) {
      alert('Unable to refresh ticker')
      setLoading(false)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
     className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? '...' : 'Refresh'}
    </button>
  )
}