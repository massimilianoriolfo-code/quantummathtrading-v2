'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

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
   <button
  type="button"
  onClick={handleRefresh}
  disabled={loading}
  className="group relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-500 bg-slate-600 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
>
  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />

<span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-md group-hover:block">
  Refresh
</span>
</button>
  )
}