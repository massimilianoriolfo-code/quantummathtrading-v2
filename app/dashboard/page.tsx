import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'
import AddPortfolioPositionForm from './AddPortfolioPositionForm'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export default async function DashboardPage() {
  const user = await currentUser()

  const isPremium =
    user?.publicMetadata?.isPremium === true

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, company, spot, iv, dte, expected_move, created_at')
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
        .limit(10)
    : { data: [] }

  const { data: portfolio } = user
    ? await supabaseAdmin
        .from('portfolio')
        .select('id, ticker, company, quantity, average_cost, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const latestSimulationMap = new Map()

  simulations?.forEach((simulation) => {
    if (!latestSimulationMap.has(simulation.ticker)) {
      latestSimulationMap.set(simulation.ticker, simulation)
    }
  })

  const latestUniqueSimulations =
    Array.from(latestSimulationMap.values())

  const sortedWatchlist =
    [...(watchlist || [])].sort((a, b) => {
      const latestA = latestSimulationMap.get(a.ticker)
      const latestB = latestSimulationMap.get(b.ticker)

      if (!latestA) return 1
      if (!latestB) return -1

      const scoreA =
        (Number(latestA.iv) / 100) *
        Math.sqrt(Number(latestA.dte) / 365) *
        0.35 *
        100

      const scoreB =
        (Number(latestB.iv) / 100) *
        Math.sqrt(Number(latestB.dte) / 365) *
        0.35 *
        100

      return scoreB - scoreA
    })

  let totalMarketValue = 0
  let totalCostBasis = 0
  let totalUnrealizedPL = 0

  portfolio?.forEach((position) => {
    const latest =
      latestSimulationMap.get(position.ticker)

    if (!latest) return

    const quantity =
      Number(position.quantity)

    const costBasisPerShare =
      Number(position.average_cost)

    const marketPrice =
      Number(latest.spot)

    const marketValue =
      quantity * marketPrice

    const costBasis =
      quantity * costBasisPerShare

    const unrealizedPL =
      marketValue - costBasis

    totalMarketValue += marketValue
    totalCostBasis += costBasis
    totalUnrealizedPL += unrealizedPL
  })

  const portfolioPLPercent =
    totalCostBasis > 0
      ? (totalUnrealizedPL / totalCostBasis) * 100
      : 0

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              User Dashboard
            </h1>

            <p className="mt-2 text-zinc-600">
              Welcome to QuantumMathTrading.
            </p>
          </div>

          <UserButton />
        </div>

        <div className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-bold">
            Subscription Status
          </h2>

          <p className="mt-3">
            Status:{' '}
            <span
              className={
                isPremium
                  ? 'font-bold text-green-600'
                  : 'font-bold text-red-600'
              }
            >
              {isPremium ? 'Premium Active' : 'Free / Not Active'}
            </span>
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/simulatore-pro"
            className="rounded-2xl bg-black p-6 text-white shadow-sm transition hover:opacity-90"
          >
            <h3 className="text-xl font-bold">
              Open CRPM Simulator
            </h3>

            <p className="mt-2 text-sm text-zinc-300">
              Access the quantitative options analysis engine.
            </p>
          </Link>

          <ManageSubscriptionButton />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">
              Total Market Value
            </div>

            <div className="mt-2 text-2xl font-bold text-zinc-950">
              ${totalMarketValue.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">
              Total Cost Basis
            </div>

            <div className="mt-2 text-2xl font-bold text-zinc-950">
              ${totalCostBasis.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">
              Total Unrealized P/L
            </div>

            <div
              className={
                totalUnrealizedPL >= 0
                  ? 'mt-2 text-2xl font-bold text-green-700'
                  : 'mt-2 text-2xl font-bold text-red-700'
              }
            >
              ${totalUnrealizedPL.toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">
              Portfolio P/L %
            </div>

            <div
              className={
                portfolioPLPercent >= 0
                  ? 'mt-2 text-2xl font-bold text-green-700'
                  : 'mt-2 text-2xl font-bold text-red-700'
              }
            >
              {portfolioPLPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Opportunity Watchlist
            </h2>

            <div className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
              Sorted by CRPM Score
            </div>
          </div>

          {sortedWatchlist.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="py-3 pr-4">Ticker</th>
                    <th className="py-3 pr-4">Snapshot</th>
                    <th className="py-3 pr-4">Opportunity</th>
                    <th className="py-3 pr-4">Strategy</th>
                    <th className="py-3 pr-4">Last Update</th>
                    <th className="py-3 pr-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedWatchlist.map((item) => {
                    const latest =
                      latestSimulationMap.get(item.ticker)

                    let bias = '-'
                    let bestMachine = '-'
                    let crpmScore = '-'
                    let biasClass =
                      'bg-zinc-100 text-zinc-700'
                    let machineClass =
                      'bg-zinc-100 text-zinc-700'

                    if (latest) {
                      const iv = Number(latest.iv)
                      const dte = Number(latest.dte)

                      const score =
                        (iv / 100) *
                        Math.sqrt(dte / 365) *
                        0.35 *
                        100

                      crpmScore = `${score.toFixed(2)}%`

                      if (iv < 20) {
                        bias = 'Low Vol'
                        bestMachine = 'Long Call'
                        biasClass =
                          'bg-blue-50 text-blue-700'
                        machineClass =
                          'bg-blue-50 text-blue-700'
                      } else if (iv <= 35) {
                        bias = 'Normal Vol'
                        bestMachine = 'Short Put'
                        biasClass =
                          'bg-green-50 text-green-700'
                        machineClass =
                          'bg-green-50 text-green-700'
                      } else {
                        bias = 'High Vol'
                        bestMachine = 'Premium Harvest'
                        biasClass =
                          'bg-yellow-50 text-yellow-800'
                        machineClass =
                          'bg-yellow-50 text-yellow-800'
                      }
                    }

                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-bold">
                            {item.ticker}
                          </div>

                          <div className="mt-1 text-xs text-zinc-500">
                            {item.company || 'Company not available'}
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          {latest ? (
                            <div className="space-y-1">
                              <div>
                                Spot:{' '}
                                <span className="font-bold">
                                  ${Number(latest.spot).toFixed(2)}
                                </span>
                              </div>

                              <div>
                                IV:{' '}
                                <span className="font-bold">
                                  {Number(latest.iv).toFixed(2)}%
                                </span>
                              </div>

                              <div>
                                DTE:{' '}
                                <span className="font-bold">
                                  {latest.dte}
                                </span>
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          {latest ? (
                            <div className="space-y-1">
                              <div>
                                EM:{' '}
                                <span className="font-bold">
                                  ${Number(latest.expected_move).toFixed(2)}
                                </span>
                              </div>

                              <div>
                                CRPM Score:{' '}
                                <span className="font-bold text-green-700">
                                  {crpmScore}
                                </span>
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${biasClass}`}
                            >
                              {bias}
                            </span>

                            <span
                              className={`w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${machineClass}`}
                            >
                              {bestMachine}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 pr-4 text-xs text-zinc-500">
                          {latest
                            ? new Date(latest.created_at).toLocaleString()
                            : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/simulatore-pro?ticker=${item.ticker}`}
                              className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
                            >
                              Run Analysis
                            </Link>

                            <Link
                              href={`/simulatore-pro?ticker=${item.ticker}&refresh=true`}
                              className="whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                              Refresh
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-zinc-600">
              No tickers saved yet.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <h2 className="text-xl font-bold">
            Portfolio Positions
          </h2>

          <AddPortfolioPositionForm />

          {portfolio && portfolio.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="py-2">Ticker</th>
                    <th className="py-2">Company</th>
                    <th className="py-2">Quantity</th>
                    <th className="py-2">Cost Basis</th>
                    <th className="py-2">Market Price</th>
                    <th className="py-2">Market Value</th>
                    <th className="py-2">Unrealized P/L</th>
                  </tr>
                </thead>

                <tbody>
                  {portfolio.map((position) => {
                    const latest =
                      latestSimulationMap.get(position.ticker)

                    const quantity =
                      Number(position.quantity)

                    const costBasisPerShare =
                      Number(position.average_cost)

                    const marketPrice =
                      latest
                        ? Number(latest.spot)
                        : 0

                    const marketValue =
                      latest
                        ? quantity * marketPrice
                        : 0

                    const totalCostBasis =
                      quantity * costBasisPerShare

                    const unrealizedPL =
                      latest
                        ? marketValue - totalCostBasis
                        : 0

                    return (
                      <tr
                        key={position.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 font-bold">
                          {position.ticker}
                        </td>

                        <td className="py-3">
                          {position.company || '-'}
                        </td>

                        <td className="py-3">
                          {quantity}
                        </td>

                        <td className="py-3">
                          ${costBasisPerShare.toFixed(2)}
                        </td>

                        <td className="py-3">
                          {latest
                            ? `$${marketPrice.toFixed(2)}`
                            : '-'}
                        </td>

                        <td className="py-3">
                          {latest
                            ? `$${marketValue.toFixed(2)}`
                            : '-'}
                        </td>

                        <td
                          className={
                            unrealizedPL >= 0
                              ? 'py-3 font-bold text-green-700'
                              : 'py-3 font-bold text-red-700'
                          }
                        >
                          {latest
                            ? `$${unrealizedPL.toFixed(2)}`
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-zinc-600">
              No portfolio positions saved yet.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <h2 className="text-xl font-bold">
            Latest Unique Simulations
          </h2>

          {latestUniqueSimulations.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="py-2">Ticker</th>
                    <th className="py-2">Company</th>
                    <th className="py-2">Spot</th>
                    <th className="py-2">IV</th>
                    <th className="py-2">DTE</th>
                    <th className="py-2">Expected Move</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {latestUniqueSimulations.map((simulation) => (
                    <tr
                      key={simulation.id}
                      className="border-b last:border-0"
                    >
                      <td className="py-3 font-bold">
                        {simulation.ticker}
                      </td>

                      <td className="py-3">
                        {simulation.company}
                      </td>

                      <td className="py-3">
                        ${Number(simulation.spot).toFixed(2)}
                      </td>

                      <td className="py-3">
                        {Number(simulation.iv).toFixed(2)}%
                      </td>

                      <td className="py-3">
                        {simulation.dte}
                      </td>

                      <td className="py-3">
                        ${Number(simulation.expected_move).toFixed(2)}
                      </td>

                      <td className="py-3">
                        {new Date(simulation.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-zinc-600">
              No simulations saved yet.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <h2 className="text-xl font-bold">
            Coming Soon
          </h2>

          <p className="mt-2 text-zinc-600">
            Theta Ratio, Protected Equity with real NLV, portfolio risk, and CRPM AI Assistant.
          </p>
        </div>
      </div>
    </main>
  )
}