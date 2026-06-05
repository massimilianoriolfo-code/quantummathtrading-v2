import RefreshAllWatchlistButton from './RefreshAllWatchlistButton'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import DeleteWatchlistButton from './DeleteWatchlistButton'
import AddWatchlistTickerForm from './AddWatchlistTickerForm'
import RefreshWatchlistTickerButton from './RefreshWatchlistTickerButton'


function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getAnalysisAgeBadge(value: string | null | undefined) {
  if (!value) {
    return <span className="font-bold text-red-600">🔴 N/A</span>
  }

  const diffDays = Math.floor(
    (new Date().getTime() - new Date(value).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (diffDays < 3) {
    return <span className="font-bold text-green-600">🟢 {diffDays}d</span>
  }

  if (diffDays < 7) {
    return <span className="font-bold text-yellow-600">🟡 {diffDays}d</span>
  }

  return <span className="font-bold text-red-600">🔴 {diffDays}d</span>
}

export default async function WatchlistPage() {
  const user = await currentUser()

  const { data: watchlist } = user
    ? await supabaseAdmin
        .from('watchlist')
        .select('id, ticker, company, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, spot, iv, expected_move, dte, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)
    : { data: [] }

  const { data: portfolio } = user
    ? await supabaseAdmin
        .from('portfolio')
        .select('ticker')
        .eq('clerk_user_id', user.id)
    : { data: [] }

  const portfolioTickerSet = new Set(
    portfolio?.map((p) => p.ticker)
  )

  const latestSimulationMap = new Map()

  simulations?.forEach((simulation) => {
    if (!latestSimulationMap.has(simulation.ticker)) {
      latestSimulationMap.set(simulation.ticker, simulation)
    }
  })

  const analyzedCount =
    watchlist?.filter((item) =>
      latestSimulationMap.has(item.ticker)
    ).length || 0

  const latestWatchlistSnapshot =
    watchlist
      ?.map((item) => latestSimulationMap.get(item.ticker)?.created_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] || null

      const watchlistTickers =
  watchlist?.map((item) => item.ticker) || []

const sortedWatchlist =
  [...(watchlist || [])].sort((a, b) => {
    const aSim = latestSimulationMap.get(a.ticker)
    const bSim = latestSimulationMap.get(b.ticker)

    const aMove =
      aSim && Number(aSim.spot) !== 0
        ? (Number(aSim.expected_move) / Number(aSim.spot)) * 100
        : 0

    const bMove =
      bSim && Number(bSim.spot) !== 0
        ? (Number(bSim.expected_move) / Number(bSim.spot)) * 100
        : 0

    return bMove - aMove
  })

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-700"
            >
              ← Back to Control Center
            </Link>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Watchlist
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Monitored tickers with latest CRPM market snapshot.
            </p>
          </div>

          <Link
            href="/simulatore-pro"
            className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
          >
            Open Simulator
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase text-zinc-500">
              Watchlist Tickers
            </div>
            <div className="mt-1 text-xl font-bold">
              {watchlist?.length || 0}
            </div>
          </div>

          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase text-zinc-500">
              Analyzed
            </div>
            <div className="mt-1 text-xl font-bold">
              {analyzedCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase text-zinc-500">
              Latest Snapshot
            </div>
            <div className="mt-1 text-sm font-bold">
              {formatDate(latestWatchlistSnapshot)}
            </div>
          </div>

          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase text-zinc-500">
              Opportunity Rank
            </div>
            <div className="mt-1 text-xl font-bold text-zinc-400">
              Coming Soon
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border bg-zinc-50 p-4">
          <h2 className="text-sm font-bold">Add Ticker</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Add a ticker directly to the watchlist.
          </p>
          <AddWatchlistTickerForm />
        </div>

        <div className="mt-4 rounded-2xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
  <div>
    <h2 className="text-sm font-bold">
      Watchlist Tickers
    </h2>

    <p className="mt-1 text-xs text-zinc-500">
      Latest available CRPM snapshot for each monitored ticker.
    </p>
  </div>

<RefreshAllWatchlistButton tickers={watchlist.map((item) => item.ticker)} />
  
</div>

          {watchlist && watchlist.length > 0 ? (
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full table-fixed text-left text-[9px]">
                <thead className="sticky top-0 z-10 bg-zinc-100 text-zinc-500">
                  <tr className="border-b">
                    <th className="w-[8%] px-2 py-2 font-bold uppercase">
                      Ticker
                    </th>
                    <th className="w-[17%] px-2 py-2 font-bold uppercase">
                      Company
                    </th>
                    <th className="w-[7%] px-2 py-2 font-bold uppercase">
                      In Portfolio
                    </th>
                    <th className="w-[9%] px-2 py-2 font-bold uppercase">
                      Spot
                    </th>
                    <th className="w-[8%] px-2 py-2 font-bold uppercase">
                      IV
                    </th>
                    <th className="w-[17%] px-2 py-2 font-bold uppercase">
                      Exp. Move
                    </th>
                    <th className="w-[10%] px-2 py-2 font-bold uppercase">
                      Analysis
                    </th>
                    <th className="w-[8%] px-2 py-2 font-bold uppercase">
                      Age
                    </th>
                    <th className="w-[16%] px-2 py-2 font-bold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedWatchlist.map((item) => {
                    const latest =
                      latestSimulationMap.get(item.ticker)

                    const inPortfolio =
                      portfolioTickerSet.has(item.ticker)

                    const expectedMovePercent =
                      latest && Number(latest.spot) !== 0
                        ? (Number(latest.expected_move) /
                            Number(latest.spot)) *
                          100
                        : 0

                    return (
                      <tr
                        key={item.id}
                        className="h-10 border-b last:border-0 hover:bg-zinc-50"
                      >
                        <td className="px-2 py-2 font-bold">
                          {item.ticker}
                        </td>

                        <td className="truncate px-2 py-2 text-zinc-600">
                          {item.company || '-'}
                        </td>

                        <td className="px-2 py-2">
                          {inPortfolio && (
  <span
    style={{
      marginLeft: '6px',
      padding: '2px 6px',
      fontSize: '10px',
      fontWeight: 700,
      borderRadius: '999px',
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #86efac',
      whiteSpace: 'nowrap',
    }}
  >
    Yes
  </span>
)}
                        </td>

                        <td className="px-2 py-2 font-bold">
                          {latest
                            ? `$${Number(latest.spot).toFixed(2)}`
                            : '-'}
                        </td>

                        <td className="px-2 py-2">
                          {latest
                            ? `${Number(latest.iv).toFixed(2)}%`
                            : '-'}
                        </td>

                        <td className="px-2 py-2 leading-tight">
                          {latest ? (
                            <>
                              <div>
                                ${Number(latest.expected_move).toFixed(2)}
                              </div>
                              <div className="text-zinc-500">
                                {expectedMovePercent.toFixed(2)}% / {latest.dte}D
                              </div>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="px-2 py-2 text-zinc-500">
                          {latest
                            ? formatDate(latest.created_at)
                            : 'N/A'}
                        </td>

                        <td className="px-2 py-2">
                          {getAnalysisAgeBadge(latest?.created_at)}
                        </td>

                        <td className="px-2 py-2">
                          <div className="flex gap-1 whitespace-nowrap">
                            <Link
                              href={`/simulatore-pro?ticker=${item.ticker}&returnTo=/dashboard/watchlist`}
                              className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-bold text-white"
                            >
                              Analyze
                            </Link>

                            <RefreshWatchlistTickerButton
                              ticker={item.ticker}
                            />

                            <DeleteWatchlistButton
                              watchlistId={item.id}
                              ticker={item.ticker}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
              No watchlist tickers saved yet.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}