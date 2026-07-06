'use client'

import { useEffect, useState } from 'react'
import CRPMPageShell from '@/components/crpm/CRPMPageShell'
import CRPMAnalysisView from '@/components/crpm/CRPMAnalysisView'
import CRPMAnalysisToolbar from '@/components/crpm/CRPMAnalysisToolbar'
import CRPMAnalysisActions from '@/components/crpm/CRPMAnalysisActions'

type Machine = {
  name: string
  action: string
  strike: number | string
  expiry: string
  premium: number
  maxProfit: string
  maxRisk: string
  description: string
  note: string
}

type SimulatorData = {
  ticker: string
  company: string
  spot: number
  iv: number
  expiration: string
  dte: number
  capital: number
  expectedMove: number
  upperBoundary: number
  lowerBoundary: number
  atmCall: { strike: number; premium: number; iv: number }
  atmPut: { strike: number; premium: number; iv: number }
  machines: Machine[]
  method: string
}

export default function SimulatorPage() {
  const [ticker, setTicker] = useState('')
  const [data, setData] = useState<SimulatorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [details, setDetails] = useState('')
  const [watchlistMessage, setWatchlistMessage] = useState('')
  const [returnTo, setReturnTo] = useState('/dashboard')

  async function runAnalysis(forcedTicker?: string) {
    try {
      const currentTicker = (forcedTicker || ticker).toUpperCase()
      if (!currentTicker) return

      setLoading(true)
      setError('')
      setDetails('')
      setWatchlistMessage('')
      setData(null)

      const response = await fetch(`/api/simulator?ticker=${currentTicker}`)
      const json = await response.json()

      if (!response.ok) {
        setDetails(json.details || '')
        throw new Error(json.error || 'API error')
      }

      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnTarget = params.get('returnTo')

    if (returnTarget) setReturnTo(returnTarget)

    const urlTicker = params.get('ticker')
    const refresh = params.get('refresh') === 'true'

    if (urlTicker) {
      const cleanTicker = urlTicker.toUpperCase()
      setTicker(cleanTicker)

      if (refresh) {
        ;(async () => {
          await runAnalysis(cleanTicker)
          window.location.href = returnTarget || '/dashboard'
        })()
      }
    }
  }, [])

  async function addToWatchlist() {
    if (!data) return

    try {
      setWatchlistMessage('')

      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: data.ticker,
          company: data.company,
        }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Unable to add to watchlist')
      }

      setWatchlistMessage(json.message || 'Added to watchlist')
    } catch (err) {
      setWatchlistMessage(
        err instanceof Error ? err.message : 'Unable to add to watchlist'
      )
    }
  }

  return (
    <CRPMPageShell
      active="simulator"
      title="CRPM Quantitative Analysis"
      subtitle="Shared CRPM analysis workspace for live simulations and saved snapshots."
    >
        {data ? (
          <CRPMAnalysisView
            data={data}
            generatedAt={new Date().toISOString()}
            backHref={returnTo}
            backLabel="← Back"
            toolbarSlot={
              <CRPMAnalysisToolbar
                ticker={ticker}
                loading={loading}
                onSelectTicker={setTicker}
                onRunAnalysis={() => runAnalysis()}
                rightSlot={
                  <CRPMAnalysisActions onAddToWatchlist={addToWatchlist} />
                }
              />
            }
            noticeSlot={
              watchlistMessage ? (
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700">
                  {watchlistMessage}
                </div>
              ) : null
            }
          />
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between">
              <a
                href={returnTo}
                className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-bold transition hover:bg-zinc-300"
              >
                ← Back
              </a>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <CRPMAnalysisToolbar
                ticker={ticker}
                loading={loading}
                onSelectTicker={setTicker}
                onRunAnalysis={() => runAnalysis()}
              />
            </div>

            {error && (
              <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="font-bold">{error}</div>
                {details && <div className="mt-2 text-sm">{details}</div>}
              </div>
            )}
          </>
        )}
    </CRPMPageShell>
  )
}
