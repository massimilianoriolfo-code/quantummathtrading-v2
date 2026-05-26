import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'
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
        .limit(5)
    : { data: [] }

  const { data: watchlist } = user
    ? await supabaseAdmin
        .from('watchlist')
        .select('id, ticker, company, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const latestSimulationMap = new Map()

  simulations?.forEach((simulation) => {
    if (!latestSimulationMap.has(simulation.ticker)) {
      latestSimulationMap.set(simulation.ticker, simulation)
    }
  })

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

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <h2 className="text-xl font-bold">
            Opportunity Watchlist
          </h2>

          {watchlist && watchlist.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[1250px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="py-3 pr-4">Ticker</th>
                    <th className="py-3 pr-4">Spot</th>
                    <th className="py-3 pr-4">IV</th>
                    <th className="py-3 pr-4">Expected Move</th>
                    <th className="py-3 pr-4">DTE</th>
                    <th className="py-3 pr-4">Bias</th>
                    <th className="py-3 pr-4">Best Machine</th>
                    <th className="py-3 pr-4">Est. Yield</th>
                    <th className="py-3 pr-4">Last Update</th>
                    <th className="py-3 pr-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {watchlist.map((item) => {
                    const latest =
                      latestSimulationMap.get(item.ticker)

                    let bias = '-'
                    let bestMachine = '-'
                    let estimatedYield = '-'
                    let biasClass =
                      'bg-zinc-100 text-zinc-700'
                    let machineClass =
                      'bg-zinc-100 text-zinc-700'

                    if (latest) {
                      const iv = Number(latest.iv)
                      const dte = Number(latest.dte)

                      estimatedYield =
                        `${(
                          (iv / 100) *
                          Math.sqrt(dte / 365) *
                          0.35 *
                          100
                        ).toFixed(2)}%`

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
                        <td className="py-4 pr-4 font-bold">
                          {item.ticker}
                        </td>

                        <td className="py-4 pr-4">
                          {latest
                            ? `$${Number(latest.spot).toFixed(2)}`
                            : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          {latest
                            ? `${Number(latest.iv).toFixed(2)}%`
                            : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          {latest
                            ? `$${Number(latest.expected_move).toFixed(2)}`
                            : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          {latest ? latest.dte : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${biasClass}`}
                          >
                            {bias}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${machineClass}`}
                          >
                            {bestMachine}
                          </span>
                        </td>

                        <td className="py-4 pr-4 font-bold text-green-700">
                          {estimatedYield}
                        </td>

                        <td className="py-4 pr-4 text-xs text-zinc-500">
                          {latest
                            ? new Date(latest.created_at).toLocaleString()
                            : '-'}
                        </td>

                        <td className="py-4 pr-4">
                          <Link
                            href={`/simulatore-pro?ticker=${item.ticker}`}
                            className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                          >
                            Run Analysis
                          </Link>
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
            Recent Simulations
          </h2>

          {simulations && simulations.length > 0 ? (
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
                  {simulations.map((simulation) => (
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
            Portfolio history and CRPM AI Assistant.
          </p>
        </div>
      </div>
    </main>
  )
}