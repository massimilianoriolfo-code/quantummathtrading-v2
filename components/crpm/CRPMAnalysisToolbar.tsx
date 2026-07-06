'use client'

import SymbolSearch from '@/components/SymbolSearch'

type CRPMAnalysisToolbarProps = {
  ticker?: string
  loading?: boolean
  onSelectTicker?: (ticker: string) => void
  onRunAnalysis?: () => void
  leftSlot?: React.ReactNode
  centerSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  children?: React.ReactNode
}

export default function CRPMAnalysisToolbar({
  ticker = '',
  loading = false,
  onSelectTicker,
  onRunAnalysis,
  leftSlot,
  centerSlot,
  rightSlot,
  children,
}: CRPMAnalysisToolbarProps) {
  if (children) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {leftSlot ?? (
        <div className="w-80">
          <SymbolSearch
            placeholder="Search company, ticker or ISIN..."
            onSelect={(result) => onSelectTicker?.(result.ticker.toUpperCase())}
          />
        </div>
      )}

      {centerSlot ?? (
        <button
          onClick={onRunAnalysis}
          disabled={!ticker || loading}
          className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-40"
        >
          {loading ? 'Loading...' : 'Run Analysis'}
        </button>
      )}

      {rightSlot}
    </div>
  )
}
