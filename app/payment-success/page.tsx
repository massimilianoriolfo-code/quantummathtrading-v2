'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState('Activating your premium access...')

  useEffect(() => {
    async function activatePremium() {
      if (!sessionId) {
        setStatus('Missing Stripe session.')
        return
      }

      const response = await fetch('/api/stripe/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus(data.error || 'Activation failed.')
        return
      }

      setStatus('Premium access activated. Redirecting...')

      setTimeout(() => {
        window.location.href = '/simulatore-pro'
      }, 1500)
    }

    activatePremium()
  }, [sessionId])

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-8 text-zinc-950">
      <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold">
          Payment Successful
        </h1>

        <p className="mt-4 text-zinc-600">
          {status}
        </p>
      </div>
    </main>
  )
}