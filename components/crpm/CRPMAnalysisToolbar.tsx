'use client'

import SymbolSearch from '@/components/SymbolSearch'

type CRPMAnalysisToolbarProps = {
  ticker: string
  loading: boolean
  onSelectTicker: (ticker: string) => void
  onRunAnalysis: () => void
}

export default function CRPMAnalysisToolbar({
  ticker,
  loading,
  onSelectTicker,
  onRunAnalysis,
}: CRPMAnalysisToolbarProps) {
  return (
    <>
      <div className="w-80">
        <SymbolSearch
          placeholder="Search company, ticker or ISIN..."
          onSelect={(result) => onSelectTicker(result.ticker.toUpperCase())}
        />
      </div>

      <button
        onClick={onRunAnalysis}
        disabled={!ticker || loading}
        className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-40"
      >
        {loading ? 'Loading...' : 'Run Analysis'}
      </button>
    </>
  )
}
