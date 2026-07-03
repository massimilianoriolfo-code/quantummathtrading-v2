'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

type SymbolResult = {
  ticker: string
  company: string
  exchange: string
}

type SymbolSearchProps = {
  onSelect: (result: SymbolResult) => void
  placeholder?: string
}

export default function SymbolSearch({
  onSelect,
  placeholder = 'Search ticker or company...',
}: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SymbolResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)

        const response = await fetch(
          `/api/symbol-search?q=${encodeURIComponent(query)}`
        )

        const json = await response.json()

        if (Array.isArray(json)) {
          setResults(json)
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(result: SymbolResult) {
    setQuery(`${result.ticker} — ${result.company}`)
    setResults([])
    onSelect(result)
  }

  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-10 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-xl">
          {results.map((result) => (
            <button
              key={`${result.ticker}-${result.exchange}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="flex w-full items-start justify-between gap-3 border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-zinc-50"
            >
              <div>
                <div className="font-bold">{result.ticker}</div>
                <div className="text-xs text-zinc-500">{result.company}</div>
              </div>

              <div className="whitespace-nowrap text-xs text-zinc-400">
                {result.exchange}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}