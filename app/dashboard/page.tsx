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

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
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
            My Watchlist
          </h2>

          {watchlist && watchlist.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="text-lg font-bold">
                    {item.ticker}
                  </div>

                  <div className="mt-1 text-sm text-zinc-600">
                    {item.company || 'Company not available'}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                   <div className="text-xs text-zinc-400">
                     Added on{' '}
                     {new Date(item.created_at).toLocaleDateString()}
                   </div>

                   <Link
                     href={`/simulatore-pro?ticker=${item.ticker}`}
                     className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                   >
                     Run Analysis
                   </Link>
                 </div>
                 </div>
              ))}
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