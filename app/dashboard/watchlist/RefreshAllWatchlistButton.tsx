'use client'

import { useState } from 'react'

type Props = {
  tickers?: string[]
}

export default function RefreshAllWatchlistButton({ tickers = [] }: Props) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState('')
  const [done, setDone] = useState(0)

  const total = tickers.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleRefreshAll() {
    if (!tickers.length || loading) return

    setLoading(true)
    setDone(0)
    setCurrent('')

    try {
      for (const ticker of tickers) {
        setCurrent(ticker)

        await fetch('/api/watchlist/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker }),
        })

        setDone((prev) => prev + 1)
      }

      window.location.reload()
    } catch (error) {
      console.error('Refresh all watchlist error:', error)
      alert('Unable to refresh all watchlist tickers.')
    } finally {
      setLoading(false)
      setCurrent('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <button
        onClick={handleRefreshAll}
        disabled={loading || tickers.length === 0}
        style={{
          padding: '6px 10px',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '6px',
          border: '1px solid #333',
          background: loading ? '#ddd' : '#111',
          color: loading ? '#555' : '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? `Refreshing ${done}/${total}` : 'Refresh All'}
      </button>

      {loading && (
        <div style={{ fontSize: '11px', color: '#555' }}>
          {current && <div>Updating: {current}</div>}
          <div
            style={{
              width: '160px',
              height: '6px',
              background: '#e5e5e5',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#111',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div>{progress}% completed</div>
        </div>
      )}
    </div>
  )
}