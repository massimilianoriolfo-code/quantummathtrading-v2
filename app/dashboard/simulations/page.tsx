import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { BarChart3, Clock3, Database, Search } from 'lucide-react'

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

export default async function SimulationsHistoryPage() {
  const user = await currentUser()

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, company, spot, iv, expected_move, dte, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  const total = simulations?.length || 0
  const uniqueTickers = new Set(simulations?.map((s) => s.ticker)).size
  const latestSnapshot = simulations?.[0]?.created_at || null

  return (
    <main className="min-h-screen bg-zinc-100 p-4 text-zinc-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="border-b border-zinc-200 pb-4">
            <Link
              href="/dashboard"
              className="text-xs font-bold uppercase tracking-wide text-zinc-500 hover:text-zinc-900"
            >
              ← Back to Control Center
            </Link>

            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">
                QuantumMathTrading
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Simulations History
              </h1>

              <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                Historical archive of saved{' '}
                <span className="font-bold text-slate-700">
                  Calculated Risk and Profit Machines (CRPM)
                </span>{' '}
                snapshots, including spot price, implied volatility, expected move and analysis timestamp.
              </p>
            </div>

            <DashboardNav active="dashboard" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                    CRPM Analysis
                  </div>
                  <div className="mt-1 text-[20px] font-bold">
                    {total} Snapshots
                  </div>
                </div>
                <Database size={20} className="text-slate-500" />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                    Unique Tickers
                  </div>
                  <div className="mt-1 text-[20px] font-bold">
                    {uniqueTickers}
                  </div>
                </div>
                <Search size={20} className="text-slate-500" />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                    Latest Snapshot
                  </div>
                  <div className="mt-1 text-[20px] font-bold">
                    {formatDate(latestSnapshot)}
                  </div>
                </div>
                <Clock3 size={20} className="text-slate-500" />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                  Historical Archive
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Saved CRPM Snapshots
                </h2>
              </div>
            </div>

            {simulations && simulations.length > 0 ? (
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[900px] table-fixed border-collapse text-[12px]">
                  <thead className="sticky top-0 z-10 bg-zinc-50 text-[10px] text-zinc-700">
                    <tr className="border-b border-zinc-200">
                      <th className="w-[13%] px-3 py-2 text-left font-semibold uppercase">
                        Ticker
                      </th>
                      <th className="w-[22%] px-3 py-2 text-left font-semibold uppercase">
                        Company
                      </th>
                      <th className="w-[12%] px-3 py-2 text-right font-semibold uppercase">
                        Spot
                      </th>
                      <th className="w-[10%] px-3 py-2 text-right font-semibold uppercase">
                        IV
                      </th>
                      <th className="w-[18%] px-3 py-2 text-right font-semibold uppercase">
                        Expected Move
                      </th>
                      <th className="w-[15%] px-3 py-2 text-right font-semibold uppercase">
                        Snapshot
                      </th>
                      <th className="w-[10%] px-3 py-2 text-right font-semibold uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {simulations.map((item) => {
                      const spot = Number(item.spot)
                      const expectedMove = Number(item.expected_move)
                      const expectedMovePercent =
                        spot !== 0 ? (expectedMove / spot) * 100 : 0

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-200 hover:bg-zinc-50"
                        >
                          <td className="px-3 py-2 font-bold">
                            {item.ticker}
                          </td>

                          <td className="truncate px-3 py-2 text-zinc-600">
                            {item.company || '-'}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                            {formatMoney(spot)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            {formatPercent(Number(item.iv))}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <span className="font-semibold">
                              ± {formatMoney(expectedMove)}
                            </span>
                            <span className="ml-1 text-[11px] text-zinc-500">
                              ({formatPercent(expectedMovePercent)} / {item.dte}D)
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-right text-zinc-500">
                            {formatDate(item.created_at)}
                          </td>

                          <td className="px-3 py-2 text-right">
                            <Link
                              href={`/dashboard/simulations/${item.id}`}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-500 bg-slate-600 px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-500"
                            >
                              <BarChart3 size={13} />
                              Open
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">
                No CRPM snapshots saved yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}