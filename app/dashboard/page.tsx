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
        .select('id, ticker, spot, iv, dte, expected_move, created_at')
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

    totalMarketValue += marketValue
    totalCostBasis += costBasis
    totalUnrealizedPL += marketValue - costBasis
  })

  const portfolioPLPercent =
    totalCostBasis > 0
      ? (totalUnrealizedPL / totalCostBasis) * 100
      : 0

  const controlCards = [
    {
      title: 'Portfolio',
      description:
        'Positions, cost basis, market value, unrealized P/L and portfolio analytics.',
      href: '/dashboard/portfolio',
      stat: `${portfolio?.length || 0} positions`,
      action: 'Open Portfolio',
    },
    {
      title: 'Watchlist',
      description:
        'Opportunity list ranked by CRPM score, latest snapshot and refresh actions.',
      href: '/dashboard/watchlist',
      stat: `${watchlist?.length || 0} tickers`,
      action: 'Open Watchlist',
    },
    {
      title: 'Simulations History',
      description:
        'Latest CRPM simulations, snapshots, IV, expected move and timestamp history.',
      href: '/dashboard/simulations',
      stat: `${simulations?.length || 0} records`,
      action: 'Open History',
    },
    {
      title: 'CRPM Assistant',
      description:
        'AI assistant connected to the CRPM book, portfolio and simulation history.',
      href: '/dashboard/assistant',
      stat: 'Book KB ready',
      action: 'Open Assistant',
    },
    {
      title: 'Subscription / Account',
      description:
        'Premium status, billing portal, invoices, payment method and account access.',
      href: '/dashboard/account',
      stat: isPremium ? 'Premium Active' : 'Free / Not Active',
      action: 'Manage Account',
    },
  ]

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
                QuantumMathTrading
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                CRPM Control Center
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Portfolio intelligence, watchlist, simulations and CRPM assistant.
              </p>
            </div>

            <UserButton />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                Market Value
              </div>
              <div className="mt-1 text-xl font-bold">
                ${totalMarketValue.toFixed(2)}
              </div>
            </div>

            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                Cost Basis
              </div>
              <div className="mt-1 text-xl font-bold">
                ${totalCostBasis.toFixed(2)}
              </div>
            </div>

            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                Unrealized P/L
              </div>
              <div
                className={
                  totalUnrealizedPL >= 0
                    ? 'mt-1 text-xl font-bold text-green-700'
                    : 'mt-1 text-xl font-bold text-red-700'
                }
              >
                ${totalUnrealizedPL.toFixed(2)}
              </div>
            </div>

            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="text-xs font-semibold uppercase text-zinc-500">
                Portfolio P/L %
              </div>
              <div
                className={
                  portfolioPLPercent >= 0
                    ? 'mt-1 text-xl font-bold text-green-700'
                    : 'mt-1 text-xl font-bold text-red-700'
                }
              >
                {portfolioPLPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {controlCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md"
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                      {card.stat}
                    </div>

                    <h2 className="mt-2 text-base font-bold">
                      {card.title}
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-5 inline-flex w-fit rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition group-hover:opacity-90">
                    {card.action}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link
              href="/simulatore-pro"
              className="rounded-2xl bg-black p-5 text-white shadow-sm transition hover:opacity-90"
            >
              <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Simulator
              </div>

              <h2 className="mt-2 text-lg font-bold">
                Open CRPM Simulator
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-300">
                Run quantitative options analysis, refresh snapshots and generate CRPM machine outputs.
              </p>
            </Link>

            <ManageSubscriptionButton />
          </div>

          <div className="mt-6 rounded-2xl border bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">
                  Subscription Status
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Current account access level.
                </p>
              </div>

              <span
                className={
                  isPremium
                    ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700'
                    : 'rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700'
                }
              >
                {isPremium ? 'Premium Active' : 'Free / Not Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}