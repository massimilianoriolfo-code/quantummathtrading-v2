import type { ReactNode } from 'react'
import InfoTooltip from '@/components/InfoTooltip'
import RefreshAllPricesButton from './RefreshAllPricesButton'
import EditPortfolioPositionButton from './EditPortfolioPositionButton'
import DeletePortfolioPositionButton from './DeletePortfolioPositionButton'
import RefreshPriceButton from './RefreshPriceButton'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import AddPortfolioPositionForm from '../AddPortfolioPositionForm'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  Apple,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  Percent,
  PieChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

function formatSnapshotDate(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function formatMoney(value: number) {
  return `$ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

function formatPercent(value: number) {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
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
    return <Apple size={20} className="text-black" />
  }

  if (symbol === 'MSFT') {
    return (
      <div className="grid h-5 w-5 grid-cols-2 gap-[2px]">
        <span className="bg-red-500" />
        <span className="bg-green-500" />
        <span className="bg-blue-500" />
        <span className="bg-yellow-400" />
      </div>
    )
  }

  if (symbol === 'NVDA') {
    return (
      <div className="flex h-5 w-7 items-center justify-center rounded-sm bg-green-500 text-[8px] font-bold text-white">
        NV
      </div>
    )
  }

  if (symbol === 'SPY') {
    return (
      <div className="text-[9px] font-black leading-none text-zinc-700">
        SPDR
      </div>
    )
  }

  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-600">
      {symbol.slice(0, 1)}
    </div>
  )
}

export default async function PortfolioPage() {
  const user = await currentUser()

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, company, spot, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  const { data: portfolio } = user
    ? await supabaseAdmin
        .from('portfolio')
        .select('id, ticker, company, quantity, average_cost, market_price, snapshot_time, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const latestSimulationMap = new Map()

  simulations?.forEach((simulation) => {
    if (!latestSimulationMap.has(simulation.ticker)) {
      latestSimulationMap.set(simulation.ticker, simulation)
    }
  })

  let totalMarketValue = 0
  let totalCostBasis = 0
  let totalUnrealizedPL = 0

  portfolio?.forEach((position) => {
    const latest = latestSimulationMap.get(position.ticker)

    if (!latest && !position.market_price) return

    const quantity = Number(position.quantity)
    const averagePrice = Number(position.average_cost)

    const marketPrice = position.market_price
      ? Number(position.market_price)
      : latest
        ? Number(latest.spot)
        : 0

    const marketValue = quantity * marketPrice
    const costBasis = quantity * averagePrice

    totalMarketValue += marketValue
    totalCostBasis += costBasis
    totalUnrealizedPL += marketValue - costBasis
  })

  const portfolioPLPercent =
    totalCostBasis !== 0
      ? (totalUnrealizedPL / Math.abs(totalCostBasis)) * 100
      : 0

  const latestPortfolioSnapshot =
    portfolio
      ?.map((position) => position.snapshot_time)
      .filter(Boolean)
      .sort()
      .reverse()[0] || null

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-[12px] text-zinc-950">
      <div className="mx-auto w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4 pr-2">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-900"
            >
              ← Back to Control Center
            </Link>

            <div className="mt-3 flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
              <InfoTooltip text="Portfolio overview: positions, cost basis, market value and unrealized profit or loss." />
            </div>
          </div>

          <Link
            href="/simulatore-pro"
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-500 bg-slate-600 px-4 text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-amber-400 hover:shadow-[0_6px_12px_rgba(0,0,0,0.22)] active:translate-y-[2px] active:shadow-[0_1px_3px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50">
            <BarChart3 size={16} />
            Open Simulator
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-5">
          <KpiCard
            label="Positions"
            value={formatNumber(portfolio?.length || 0)}
            tooltip="Positions: number of currently open portfolio positions."
            icon={<BriefcaseBusiness size={22} className="text-slate-600" />}
            iconBgClass="bg-slate-100"
          />

          <KpiCard
            label="Market Value"
            value={formatMoney(totalMarketValue)}
            tooltip="Market value: current market value of all portfolio positions."
            icon={<BadgeDollarSign size={22} className="text-emerald-700" />}
            iconBgClass="bg-emerald-50"
          />

          <KpiCard
            label="Cost Basis"
            value={formatMoney(totalCostBasis)}
            tooltip="Cost basis: total capital invested in the portfolio."
            icon={<PieChart size={22} className="text-stone-700" />}
            iconBgClass="bg-stone-100"
          />

          <KpiCard
            label="Unrealized P/L"
            value={formatMoney(totalUnrealizedPL)}
            tooltip="Unrealized P/L: profit or loss if positions were closed now."
            icon={
              totalUnrealizedPL >= 0 ? (
                <TrendingUp size={22} className="text-emerald-600" />
              ) : (
                <TrendingDown size={22} className="text-red-600" />
              )
            }
            iconBgClass={totalUnrealizedPL >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
            valueClass={totalUnrealizedPL >= 0 ? 'text-emerald-700' : 'text-red-600'}
          />

          <KpiCard
            label="Portfolio P/L %"
            value={formatPercent(portfolioPLPercent)}
            tooltip="Portfolio P/L %: unrealized return relative to invested capital."
            icon={<Percent size={22} className="text-amber-700" />}
            iconBgClass="bg-amber-50"
            valueClass={portfolioPLPercent >= 0 ? 'text-emerald-700' : 'text-red-600'}
          />
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white">
          <AddPortfolioPositionForm />

          <div className="border-t border-zinc-200">
            <div className="flex items-center justify-between py-2.5 pl-4 pr-2">
              <div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={20} className="text-slate-600" />
                  <h2 className="text-lg font-bold">Portfolio Positions</h2>
                  <InfoTooltip text="Portfolio positions: saved positions with market value and unrealized profit or loss." />
                </div>
              </div>

              <div className="flex items-center gap-3 pr-0">
                <div className="text-right text-xs text-zinc-600">
                  <div className="flex items-center justify-end gap-1 font-semibold tracking-normal">
                    Last Refresh
                    <InfoTooltip text="Last refresh: date and time when portfolio prices were last refreshed." />
                  </div>
                  <div>{formatSnapshotDate(latestPortfolioSnapshot)}</div>
                </div>

                <RefreshAllPricesButton
                  positions={
                    portfolio?.map((p) => ({
                      id: p.id,
                      ticker: p.ticker,
                    })) || []
                  }
                />
              </div>
            </div>

            {portfolio && portfolio.length > 0 ? (
              <div className="max-h-[460px] overflow-auto">
                <table className="w-full min-w-[1080px] table-fixed border-collapse text-[12px]">
                  <thead className="sticky top-0 z-10 bg-zinc-50 text-[10px] text-zinc-700">
                    <tr className="border-y border-zinc-200">
                      <th className="w-[9%] px-2 py-2 text-left font-semibold uppercase">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          Ticker
                          <InfoTooltip text="Ticker: ticker symbol of the position." />
                        </span>
                      </th>

                      <th className="w-[17%] px-2 py-2 text-left font-semibold uppercase">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          Company
                          <InfoTooltip text="Company: company name associated with the ticker." />
                        </span>
                      </th>

                      <th className="w-[6%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Qty
                          <InfoTooltip text="Quantity: number of shares currently held." />
                        </span>
                      </th>

                      <th className="w-[8%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Avg Price
                          <InfoTooltip text="Avg price: average acquisition price per share." />
                        </span>
                      </th>

                      <th className="w-[10%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Cost Basis
                          <InfoTooltip text="Cost basis: quantity multiplied by average price." />
                        </span>
                      </th>

                      <th className="w-[12%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Market Price
                          <InfoTooltip text="Market price: latest available price. The percentage shows the gain or loss versus Avg Price." />
                        </span>
                      </th>

                      <th className="w-[12%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Snapshot
                          <InfoTooltip text="Snapshot: date and time when market price was last refreshed." />
                        </span>
                      </th>

                      <th className="w-[10%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Market Value
                          <InfoTooltip text="Market value: current position value based on latest market price." />
                        </span>
                      </th>

                      <th className="w-[10%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Unreal. P/L
                          <InfoTooltip text="Unrealized P/L: current unrealized profit or loss." />
                        </span>
                      </th>

                      <th className="w-[6%] px-2 py-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          P/L %
                          <InfoTooltip text="P/L %: unrealized profit or loss expressed as percentage of cost basis." />
                        </span>
                      </th>

                      <th className="w-[8%] py-2 pl-2 pr-2 text-right font-semibold uppercase">
                        <span className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                          Actions
                          <InfoTooltip text="Actions: update, edit or delete this position." />
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {portfolio.map((position) => {
                      const latest = latestSimulationMap.get(position.ticker)
                      const hasPrice = Boolean(position.market_price) || Boolean(latest)

                      const quantity = Number(position.quantity)
                      const averagePrice = Number(position.average_cost)

                      const marketPrice = position.market_price
                        ? Number(position.market_price)
                        : latest
                          ? Number(latest.spot)
                          : 0

                      const marketValue = hasPrice ? quantity * marketPrice : 0
                      const totalPositionCostBasis = quantity * averagePrice

                      const unrealizedPL = hasPrice
                        ? marketValue - totalPositionCostBasis
                        : 0

                      const plPercent =
                        totalPositionCostBasis !== 0
                          ? (unrealizedPL / Math.abs(totalPositionCostBasis)) * 100
                          : 0

                      const priceVsAveragePercent =
                        averagePrice !== 0
                          ? ((marketPrice - averagePrice) / Math.abs(averagePrice)) * 100
                          : 0

                      const priceIsAboveAverage = priceVsAveragePercent >= 0

                      return (
                        <tr
                          key={position.id}
                          className="border-b border-zinc-200 hover:bg-zinc-50"
                        >
                          <td className="px-2 py-2 font-bold">
                            <div className="flex items-center gap-2">
                              <TickerLogo ticker={position.ticker} />
                              <span>{position.ticker}</span>
                            </div>
                          </td>

                          <td className="truncate px-2 py-2 text-zinc-700">
                            {position.company || '-'}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {formatNumber(quantity)}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {formatMoney(averagePrice)}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {formatMoney(totalPositionCostBasis)}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {hasPrice ? (
                              <span className="inline-flex items-center justify-end gap-1.5">
                                <span>{formatMoney(marketPrice)}</span>

                                <span
                                  className={
                                    priceIsAboveAverage
                                      ? 'inline-flex items-center gap-1 text-emerald-700'
                                      : 'inline-flex items-center gap-1 text-red-600'
                                  }
                                >
                                  {priceIsAboveAverage ? (
                                    <TrendingUp size={14} />
                                  ) : (
                                    <TrendingDown size={14} />
                                  )}

                                  <span className="text-[11px] font-bold">
                                    ({formatPercent(priceVsAveragePercent)})
                                  </span>
                                </span>
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right text-zinc-500">
                            {position.snapshot_time
                              ? formatSnapshotDate(position.snapshot_time)
                              : latest
                                ? formatSnapshotDate(latest.created_at)
                                : '-'}
                          </td>

                          <td className="whitespace-nowrap px-2 py-2 text-right">
                            {hasPrice ? formatMoney(marketValue) : '-'}
                          </td>

                          <td
                            className={
                              unrealizedPL >= 0
                                ? 'whitespace-nowrap px-2 py-2 text-right font-bold text-emerald-700'
                                : 'whitespace-nowrap px-2 py-2 text-right font-bold text-red-600'
                            }
                          >
                            {hasPrice ? formatMoney(unrealizedPL) : '-'}
                          </td>

                          <td
                            className={
                              plPercent >= 0
                                ? 'whitespace-nowrap px-2 py-2 text-right font-bold text-emerald-700'
                                : 'whitespace-nowrap px-2 py-2 text-right font-bold text-red-600'
                            }
                          >
                            {hasPrice ? formatPercent(plPercent) : '-'}
                          </td>

                          <td className="whitespace-nowrap py-2 pl-2 pr-2 text-right">
                            <div className="flex justify-end gap-1">
                              <RefreshPriceButton
                                positionId={position.id}
                                ticker={position.ticker}
                              />

                              <EditPortfolioPositionButton
                                positionId={position.id}
                                ticker={position.ticker}
                                company={position.company}
                                quantity={quantity}
                                averageCost={averagePrice}
                              />

                              <DeletePortfolioPositionButton
                                positionId={position.id}
                                ticker={position.ticker}
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
              <div className="p-4 text-center text-sm text-zinc-500">
                No portfolio positions saved yet.
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
