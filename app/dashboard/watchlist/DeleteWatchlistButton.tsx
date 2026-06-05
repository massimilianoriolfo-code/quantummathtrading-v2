'use client'

type Props = {
  watchlistId: string
  ticker: string
}

export default function DeleteWatchlistButton({
  watchlistId,
  ticker,
}: Props) {
  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Remove ${ticker} from watchlist?`
      )

    if (!confirmed) return

    const response =
      await fetch('/api/watchlist/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: watchlistId,
        }),
      })

    if (!response.ok) {
      alert('Unable to delete ticker')
      return
    }

    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-red-700"
    >
      Delete
    </button>
  )
}