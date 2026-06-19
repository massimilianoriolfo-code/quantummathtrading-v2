'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import CRPMActionButton from '@/components/crpm/CRPMActionButton'

type Props = {
  count: number
}

export default function DeleteAllSimulationSnapshotsButton({ count }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDeleteAll() {
    if (count <= 0) return

    const confirmed = window.confirm(
      `Delete ALL ${count} saved CRPM snapshots? This action cannot be undone.`
    )

    if (!confirmed) return

    setLoading(true)

    const response = await fetch('/api/simulations/delete-all', {
      method: 'DELETE',
    })

    if (!response.ok) {
      alert('Unable to delete all snapshots.')
      setLoading(false)
      return
    }

    router.push('/dashboard/simulations')
    router.refresh()
  }

  return (
    <CRPMActionButton
      onClick={handleDeleteAll}
      disabled={loading || count <= 0}
      variant="danger"
    >
      <Trash2 size={12} strokeWidth={2.1} />
    </CRPMActionButton>
  )
}
