import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import CRPMHeader from '@/components/crpm/CRPMHeader'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

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

function formatShortDate(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatMoney(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return '-'

  return `$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return '-'
  return `${Number(value).toFixed(2)}%`
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#d7dee8] bg-white px-4 py-3 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-black leading-tight text-[#081225]">
        {value}
      </div>
    </div>
  )
}

function DashboardPanel({
  title,
  eyebrow,
  href,
  action,
  children,
}: {
  title: string
  eyebrow: string
  href: string
  action: string
  children: React.ReactNode
}) {
  return (
    <section className="flex h-[340px] min-h-0 flex-col overflow-hidden rounded-xl border border-[#d7dee8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d7dee8] px-3 py-2">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wide text-[#4b5f7a]">
            {eyebrow}
          </div>
          <h2 className="text-[15px] font-black text-[#081225]">
            {title}
          </h2>
        </div>

        <Link
          href={href}
          className="text-[11px] font-black uppercase text-[#004fc4] transition hover:text-[#003b94]"
        >
          {action}
        </Link>
      </div>

      <div className="min-h-0 flex-1 p-3">
        {children}
      </div>
    </section>
  )
}

function MiniTable({
  headers,
  rows,
  empty,
}: {
  headers: string[]
  rows: React.ReactNode[]
  empty: string
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-[#d7dee8]">
      <div
        className="grid shrink-0 border-b border-[#d7dee8] bg-[#f8fafc] px-2 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#4b5f7a]"
        style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}
      >
        {headers.map((header) => (
          <div key={header}>{header}</div>
        ))}
      </div>

      <div className="min-h-0 flex-1 divide-y divide-[#d7dee8] overflow-y-auto overscroll-contain">
        {rows.length > 0 ? (
          rows
        ) : (
          <div className="px-2 py-6 text-center text-[12px] font-semibold text-[#4b5f7a]">
            {empty}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await currentUser()

  const isPremium = user?.publicMetadata?.isPremium === true

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, company, spot, iv, dte, expected_move, created_at, result')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const { data: watchlist } = user
    ? await supabaseAdmin
        .from('watchlist')
        .select('id, ticker, company, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const { data: portfolio } = user
    ? await supabaseAdmin
        .from('portfolio')
        .select('id, ticker, company, quantity, average_cost, market_price, snapshot_time, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const latestSnapshot =
    [
      ...(simulations?.map((item) => item.created_at) || []),
      ...(portfolio?.map((item) => item.snapshot_time).filter(Boolean) || []),
    ]
      .filter(Boolean)
      .sort()
      .reverse()[0] || null

  const portfolioCount = portfolio?.length || 0
  const watchlistCount = watchlist?.length || 0
  const simulationsCount = simulations?.length || 0
  const latestAnalysis = simulations?.[0] || null

  const latestSimulationByTicker = new Map<string, any>()

  simulations?.forEach((item) => {
    const ticker = String(item.ticker || '').toUpperCase()
    if (ticker && !latestSimulationByTicker.has(ticker)) {
      latestSimulationByTicker.set(ticker, item)
    }
  })


  const portfolioRows =
    portfolio?.map((item) => {
      const quantity = Number(item.quantity || 0)
      const marketPrice = Number(item.market_price || 0)
      const averageCost = Number(item.average_cost || 0)
      const marketValue = quantity * marketPrice
      const unrealizedPL = quantity * (marketPrice - averageCost)

      return (
        <div
          key={item.id}
          className="grid grid-cols-4 items-center px-2 py-2 text-[12px] font-bold text-[#081225]"
        >
          <div className="truncate">{item.ticker}</div>
          <div className="text-right">{formatNumber(quantity)}</div>
          <div className="text-right">{formatMoney(marketValue)}</div>
          <div className={unrealizedPL >= 0 ? 'text-right text-[#009a57]' : 'text-right text-[#ff1f2d]'}>
            {formatMoney(unrealizedPL)}
          </div>
        </div>
      )
    }) || []

  const watchlistRows =
    watchlist?.map((item) => {
      const ticker = String(item.ticker || '').toUpperCase()
      const latest = latestSimulationByTicker.get(ticker)

      return (
        <div
          key={item.id}
          className="grid grid-cols-4 items-center px-2 py-2 text-[12px] font-bold text-[#081225]"
        >
          <div className="truncate">{ticker}</div>
          <div className="text-right">{latest ? formatMoney(Number(latest.spot)) : '-'}</div>
          <div className="text-right">{latest ? formatPercent(Number(latest.iv)) : '-'}</div>
          <div className="text-right">{latest ? formatShortDate(latest.created_at) : '-'}</div>
        </div>
      )
    }) || []

  const simulationRows =
    simulations?.map((item) => (
      <Link
        key={item.id}
        href={`/dashboard/simulations?selected=${item.id}`}
        className="grid grid-cols-4 items-center px-2 py-2 text-[12px] font-bold text-[#081225] transition hover:bg-[#eff6ff]"
      >
        <div className="truncate">{item.ticker}</div>
        <div className="text-right">{formatMoney(Number(item.spot))}</div>
        <div className="text-right">{formatPercent(Number(item.iv))}</div>
        <div className="text-right text-[#004fc4]">{formatShortDate(item.created_at)}</div>
      </Link>
    )) || []

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-[#0b1220]">
      <div className="mx-auto w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
        <CRPMHeader
          active="dashboard"
          title="CRPM Control Center"
        />

        <div className="min-h-0 flex-1 overflow-auto">

          {latestAnalysis && (
            <div className="mt-3 rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(520px,2fr)_140px] lg:items-center">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
                    Latest CRPM Snapshot
                  </div>

                  <h2 className="mt-1 text-xl font-black text-[#081225]">
                    {latestAnalysis.ticker}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-[#26364d]">
                    {latestAnalysis.company || 'Most recent quantitative analysis generated by the CRPM engine.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm lg:grid-cols-5">
                  <div>
                    <div className="text-[11px] uppercase text-[#4b5f7a]">
                      Machines
                    </div>
                    <div className="font-black text-[#081225]">
                      {Array.isArray(latestAnalysis.result?.machines)
                        ? `${latestAnalysis.result.machines.length} available`
                        : 'Not available'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-[#4b5f7a]">
                      Spot
                    </div>
                    <div className="font-black text-[#081225]">
                      {formatMoney(Number(latestAnalysis.spot))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-[#4b5f7a]">
                      IV
                    </div>
                    <div className="font-black text-[#081225]">
                      {Number(latestAnalysis.iv).toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-[#4b5f7a]">
                      Expected Move
                    </div>
                    <div className="font-black text-[#081225]">
                      ± {formatMoney(Number(latestAnalysis.expected_move))}
                      <span className="ml-1 text-[12px] font-semibold text-[#26364d]">
                        (
                        {Number(latestAnalysis.spot) !== 0
                          ? `${((Number(latestAnalysis.expected_move) / Number(latestAnalysis.spot)) * 100).toFixed(2)}%`
                          : '-'}
                        )
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-[#4b5f7a]">
                      DTE
                    </div>
                    <div className="font-black text-[#081225]">
                      {latestAnalysis.dte}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <div className="text-xs font-semibold text-[#26364d]">
                    {formatDate(latestAnalysis.created_at)}
                  </div>

                  <Link
                    href={`/dashboard/simulations/${latestAnalysis.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-[#004fc4] bg-[#004fc4] px-3 text-[12px] font-black text-white shadow-sm transition hover:bg-[#003b94]"
                  >
                    Open Analysis
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <MetricCard
              label="Portfolio"
              value={`${formatNumber(portfolioCount)} Positions`}
            />

            <MetricCard
              label="Watchlist"
              value={`${formatNumber(watchlistCount)} Tickers`}
            />

            <MetricCard
              label="CRPM Analysis"
              value={`${formatNumber(simulationsCount)} Snapshots`}
            />

            <MetricCard
              label="Premium Status"
              value={isPremium ? 'Active' : 'Not Active'}
            />
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-3">
            <DashboardPanel
              title="Portfolio Overview"
              eyebrow="Portfolio"
              href="/dashboard/portfolio"
              action="Open Portfolio"
            >
              <MiniTable
                headers={['Ticker', 'Qty', 'Mkt Value', 'P/L']}
                rows={portfolioRows}
                empty="No portfolio positions yet."
              />
            </DashboardPanel>

            <DashboardPanel
              title="Watchlist Overview"
              eyebrow="Watchlist"
              href="/dashboard/watchlist"
              action="Open Watchlist"
            >
              <MiniTable
                headers={['Ticker', 'Spot', 'IV', 'Analysis']}
                rows={watchlistRows}
                empty="No watchlist tickers yet."
              />
            </DashboardPanel>

            <DashboardPanel
              title="Recent Simulations"
              eyebrow="CRPM Analysis"
              href="/dashboard/simulations"
              action="Open History"
            >
              <MiniTable
                headers={['Ticker', 'Spot', 'IV', 'Time']}
                rows={simulationRows}
                empty="No saved simulations yet."
              />
            </DashboardPanel>
          </div>

          <div className="mt-3 rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
                  CRPM Assistant
                </div>
                <h2 className="text-[15px] font-black text-[#081225]">
                  Portfolio-aware assistant
                </h2>
                <p className="mt-1 text-[12px] font-semibold text-[#26364d]">
                  Assistant based on the CRPM methodology, portfolio context and historical analysis.
                </p>
              </div>

              <span className="rounded-md border border-[#d7dee8] bg-[#f8fafc] px-3 py-1 text-[11px] font-black uppercase text-[#4b5f7a]">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </main>
  )
}
