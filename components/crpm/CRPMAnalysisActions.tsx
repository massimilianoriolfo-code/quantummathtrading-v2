'use client'

type CRPMAnalysisActionsProps = {
  onAddToWatchlist?: () => void
}

export default function CRPMAnalysisActions({
  onAddToWatchlist,
}: CRPMAnalysisActionsProps) {
  return (
    <>
      {onAddToWatchlist ? (
        <button
          onClick={onAddToWatchlist}
          className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          Add to Watchlist
        </button>
      ) : null}
    </>
  )
}
