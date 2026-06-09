import type { ReactNode } from 'react'
import RefreshAllWatchlistButton from './RefreshAllWatchlistButton'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import DeleteWatchlistButton from './DeleteWatchlistButton'
import AddWatchlistTickerForm from './AddWatchlistTickerForm'
import RefreshWatchlistTickerButton from './RefreshWatchlistTickerButton'
import InfoTooltip from '@/components/InfoTooltip'
import {
  Apple,
  BarChart3,
  BookmarkCheck,
  BriefcaseBusiness,
  Eye,
  LineChart,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react'

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

function formatMoney(value: number) {
  return `$ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value: number) {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function getAnalysisAgeBadge(value: string | null | undefined) {
  if (!value) {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
        N/A
      </span>
    )
  }

  const diffDays = Math.floor(
    (new Date().getTime() - new Date(value).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (diffDays < 3) {
    return (
  <span className="text-[11px] font-semibold text-emerald-700">
    {diffDays}d
  </span>
)
  }

  if (diffDays < 7) {
    return (
  <span className="text-[11px] font-semibold text-amber-700">
    {diffDays}d
  </span>
)  }

  return (
  <span className="text-[11px] font-semibold text-red-700">
    {diffDays}d
  </span>
)
}

function KpiCard({
  label,
  value,
  tooltip,
  icon,
  iconBgClass,
  valueClass = 'text-zinc-950',
}: {
  label: string
  value: string
  tooltip: string
  icon: ReactNode
  iconBgClass: string
  valueClass?: string
}) {
  return (
    <div className="grid min-h-[94px] grid-cols-[44px_1fr] items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}
      >
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-1 text-[12px] font-semibold leading-tight text-zinc-600">
          {label}
          <InfoTooltip text={tooltip} />
        </div>

        <div className={`mt-2 text-[17px] font-bold leading-tight ${valueClass}`}>
          {value}
        </div>
      </div>
    </div>
  )
}
function TickerLogo({ ticker }: { ticker: string }) {
  const symbol = ticker.toUpperCase()

  if (symbol === 'AAPL') {
    return <Apple size={18} className="text-black" />
  }

  if (symbol === 'MSFT') {
    return (
      <div className="grid h-4 w-4 grid-cols-2 gap-[1px]">
        <span className="bg-red-500" />
        <span className="bg-green-500" />
        <span className="bg-blue-500" />
        <span className="bg-yellow-400" />
      </div>
    )
  }

  if (symbol === 'NFLX') {
    return (
      <div className="text-[14px] font-black leading-none text-red-600">
        N
      </div>
    )
  }

  if (symbol === 'BLK') {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[7px] font-bold text-white">
        BLK
      </div>
    )
  }

  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-600">
      {symbol.slice(0, 1)}
    </div>
  )
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

  const portfolioTickerSet = new Set(portfolio?.map((p) => p.ticker))

  const latestSimulationMap = new Map()

  simulations?.forEach((simulation) => {
    if (!latestSimulationMap.has(simulation.ticker)) {
      latestSimulationMap.set(simulation.ticker, simulation)
    }
  })

  const analyzedCount =
    watchlist?.filter((item) => latestSimulationMap.has(item.ticker)).length || 0

  const inPortfolioCount =
    watchlist?.filter((item) => portfolioTickerSet.has(item.ticker)).length || 0

  const latestWatchlistSnapshot =
    watchlist
      ?.map((item) => latestSimulationMap.get(item.ticker)?.created_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] || null

  const watchlistTickers = watchlist?.map((item) => item.ticker) || []

  const sortedWatchlist = [...(watchlist || [])].sort((a, b) => {
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
    <main className="min-h-screen bg-zinc-50 p-4 text-[12px] text-zinc-950">
      <div className="mx-auto w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-900"
            >
              ← Back to Control Center
            </Link>

            <div className="mt-3 flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
              <InfoTooltip text="Watchlist: monitored tickers with latest CRPM market snapshot, expected move and refresh actions." />
            </div>
          </div>

          <Link
            href="/simulatore-pro"
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-500 bg-slate-600 px-4 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BarChart3 size={16} />
            Open Simulator
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <KpiCard
            label="Watchlist"
            value={`${watchlist?.length || 0}`}
            tooltip="Watchlist: number of tickers currently monitored."
            icon={<Eye size={22} className="text-slate-600" />}
            iconBgClass="bg-slate-100"
          />

          <KpiCard
            label="Analyzed"
            value={`${analyzedCount}`}
            tooltip="Analyzed: number of watchlist tickers with at least one CRPM snapshot."
            icon={<LineChart size={22} className="text-emerald-700" />}
            iconBgClass="bg-emerald-50"
          />

          <KpiCard
            label="Latest Snapshot"
            value={formatDate(latestWatchlistSnapshot)}
            tooltip="Latest snapshot: most recent CRPM analysis date and time among watchlist tickers."
            icon={<RefreshCw size={22} className="text-stone-700" />}
            iconBgClass="bg-stone-100"
          />

          <KpiCard
            label="In Portfolio"
            value={`${inPortfolioCount}`}
            tooltip="In portfolio: watchlist tickers already present in your portfolio."
            icon={<BriefcaseBusiness size={22} className="text-amber-700" />}
            iconBgClass="bg-amber-50"
          />
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white">
          <AddWatchlistTickerForm />

          <div className="border-t border-zinc-200">
            <div className="flex items-center justify-between py-2.5 pl-4 pr-2">
              <div>
                <div className="flex items-center gap-2">
                  <BookmarkCheck size={20} className="text-slate-600" />
                  <h2 className="text-lg font-bold">Watchlist Tickers</h2>
                  <InfoTooltip text="Watchlist tickers: latest available CRPM snapshot for each monitored ticker." />
                </div>
              </div>

              <RefreshAllWatchlistButton tickers={watchlistTickers} />
            </div>

            {watchlist && watchlist.length > 0 ? (
              <div className="max-h-[460px] overflow-auto">
                <table className="w-full min-w-[1040px] table-fixed border-collapse text-[12px]">
                  <thead className="sticky top-0 z-10 bg-zinc-50 text-[10px] text-zinc-700">
                    <tr className="border-y border-zinc-200">
                      <th className="w-[8%] px-2 py-2 text-left font-semibold uppercase">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          Ticker
                          <InfoTooltip text="Ticker: ticker symbol of the monitored security." />
                        </span>
                      </th>

                      <th className="w-[10%] px-2 py-2 text-left font-semibold uppercase">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          Company
                          <InfoTooltip text="Company: company name associated with the ticker." />
                        </span>
                      </th>

                      <th className="w-[6%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
                          Port.
                          <InfoTooltip text="Portfolio flag: indicates whether this ticker is already in your portfolio." />
                        </span>
                      </th>

                      <th className="w-[8%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Spot
                          <InfoTooltip text="Spot: latest underlying price from the most recent CRPM analysis." />
                        </span>
                      </th>

                      <th className="w-[8%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          IV
                          <InfoTooltip text="IV: implied volatility from the latest available CRPM snapshot." />
                        </span>
                      </th>

                      <th className="w-[14%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          CRPM Expected Move
                          <InfoTooltip text="Expected move: estimated move over the shown DTE horizon, also expressed as percentage of spot." />
                        </span>
                      </th>

                      <th className="w-[10%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-right justify-end gap-1 whitespace-nowrap">
                          Analysis
                          <InfoTooltip text="Analysis: date and time of the latest CRPM analysis for this ticker." />
                        </span>
                      </th>

                      <th className="w-[7%] px-2 py-2 text-center font-semibold uppercase">
                        <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
                          Age
                          <InfoTooltip text="Age: freshness of the latest analysis. Green is recent, amber is aging, red is old or missing." />
                        </span>
                      </th>

                      <th className="w-[9%] py-2 pl-2 pr-2 text-center font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Actions
                          <InfoTooltip text="Actions: analyze, refresh or remove this ticker." />
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedWatchlist.map((item) => {
                      const latest = latestSimulationMap.get(item.ticker)
                      const inPortfolio = portfolioTickerSet.has(item.ticker)

                      const expectedMovePercent =
                        latest && Number(latest.spot) !== 0
                          ? (Number(latest.expected_move) / Number(latest.spot)) * 100
                          : 0

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-200 hover:bg-zinc-50"
                        >
                          <td className="px-2 py-2 font-bold">
  <div className="flex items-center gap-2">
    <TickerLogo ticker={item.ticker} />
    <span>{item.ticker}</span>
  </div>
</td>

                          <td className="truncate px-2 py-2 text-zinc-700">
                            {item.company || '-'}
                          </td>

                          <td className="px-2 py-2 text-center">
                            {inPortfolio ? (
                            <span className="text-[11px] font-semibold text-emerald-700">
  Yes
</span>
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right font-bold">
                            {latest ? formatMoney(Number(latest.spot)) : '-'}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {latest ? formatPercent(Number(latest.iv)) : '-'}
                          </td>

                         <td className="whitespace-nowrap px-2 py-2 text-right">
  {latest ? (
    <span className="font-semibold">
      ± {formatMoney(Number(latest.expected_move))}
      <span className="ml-1 text-[11px] font-medium text-zinc-500">
        ({formatPercent(expectedMovePercent)} / {latest.dte}D)
      </span>
    </span>
  ) : (
    '-'
  )}
</td>

                          <td className="whitespace-nowrap px-2 py-2 text-right text-zinc-500">
                            {latest ? formatDate(latest.created_at) : 'N/A'}
                          </td>

                          <td className="px-2 py-2 text-center">
                            {getAnalysisAgeBadge(latest?.created_at)}
                          </td>

                          <td className="whitespace-nowrap py-2 pl-2 pr-2 text-right">
                            <div className="flex justify-end gap-1">
                              

                              <RefreshWatchlistTickerButton ticker={item.ticker} />

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

          <div className="flex items-center justify-center gap-2 border-t border-zinc-200 px-4 py-3 text-xs text-zinc-500">
            <InfoTooltip text="Disclaimer: data shown for educational purposes only. This platform does not provide financial advice." />
            Data for educational purposes only. Not financial advice. Market data may be delayed.
          </div>
        </div>
      </div>
    </main>
  )
}
