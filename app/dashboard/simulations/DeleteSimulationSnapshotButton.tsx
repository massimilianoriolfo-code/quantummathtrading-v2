'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import CRPMActionButton from '@/components/crpm/CRPMActionButton'

type Props = {
  id: string
  ticker: string
}

export default function DeleteSimulationSnapshotButton({ id, ticker }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete snapshot ${ticker}? This action cannot be undone.`)) return

    setLoading(true)

    const response = await fetch(`/api/simulations/delete?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      alert('Unable to delete snapshot.')
      setLoading(false)
      return
    }

    router.push('/dashboard/simulations')
    router.refresh()
  }

  return (
    <CRPMActionButton
      onClick={handleDelete}
      disabled={loading}
      title={`Delete ${ticker} snapshot`}
      variant="danger"
    >
      <Trash2 size={12} strokeWidth={2.1} />
    </CRPMActionButton>
  )
}
