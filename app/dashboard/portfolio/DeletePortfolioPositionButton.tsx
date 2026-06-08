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
className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-500 bg-slate-600 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"   
    >
      <Trash2 size={15} strokeWidth={2.2} className="text-red-400" />
    </button>
  )
}