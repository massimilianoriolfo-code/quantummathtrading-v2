import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import DashboardNav from '@/components/dashboard/DashboardNav'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Clock3,
  CreditCard,
  Eye,
} from 'lucide-react'

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


function formatMoney(value: number | null | undefined) {
  if (value == null) return '-'

  return `$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-bold leading-tight text-zinc-950">
        {value}
      </div>
    </div>
  )
}

function ControlCard({
  title,
  stat,
  description,
  href,
  icon,
}: {
  title: string
  stat: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[128px] flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              {stat}
            </div>
            <h2 className="mt-1 text-[16px] font-bold text-zinc-950">
              {title}
            </h2>
          </div>

          <div className="text-slate-500">
            {icon}
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-5 text-zinc-500">
          {description}
        </p>
      </div>

     <div className="mt-3 h-4" />
    </Link>
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

  const controlCards = [
    {
      title: 'Portfolio',
      stat: 'PORTFOLIO',
      description: `${formatNumber(portfolioCount)} positions monitored as portfolio context for CRPM decision support.`,
      href: '/dashboard/portfolio',
      icon: <BriefcaseBusiness size={19} />,
    },
    {
      title: 'Watchlist',
      stat: 'WATCHLIST',
      description: `${formatNumber(watchlistCount)} tickers monitored with CRPM expected move, implied volatility and analysis age.`,
      href: '/dashboard/watchlist',
      icon: <Eye size={19} />,
    },
    {
      title: 'CRPM Simulator',
      stat: 'ANALYSIS ENGINE',
      description: 'Run quantitative options analysis and generate CRPM machine projections.',
      href: '/simulatore-pro',
      icon: <BarChart3 size={19} />,
    },
    {
      title: 'Simulations History',
      stat: 'CRPM ANALYSIS',
      description: `${formatNumber(simulationsCount)} saved snapshots with spot, IV, expected move and timestamp.`,
      href: '/dashboard/simulations',
      icon: <Clock3 size={19} />,
    },
    {
  title: 'CRPM Assistant',
  stat: 'UNDER DEVELOPMENT',
  description:
    'Portfolio-aware assistant based on the CRPM methodology and historical analysis.',
  href: '/dashboard/assistant',
  icon: <Bot size={19} />,
},
    {
      title: 'Subscription / Account',
      stat: isPremium ? 'PREMIUM ACTIVE' : 'ACCESS STATUS',
      description: 'Subscription status, account access and billing management.',
      href: '/dashboard/account',
      icon: <CreditCard size={19} />,
    },
  ]

  return (
    <main className="min-h-screen bg-zinc-100 p-4 text-zinc-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="border-b border-zinc-200 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">
                  QuantumMathTrading
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  CRPM Control Center
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Quantitative options analysis,{' '}
                  <span className="font-bold text-slate-700">
                    Calculated Risk and Profit Machines (CRPM)
                  </span>{' '}
                  simulations, and portfolio decision support.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={
                    isPremium
                      ? 'hidden rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 md:inline-flex'
                      : 'hidden rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 md:inline-flex'
                  }
                >
                  {isPremium ? 'Premium Active' : 'Free / Not Active'}
                </span>

                <UserButton />
              </div>
            </div>

            <DashboardNav active="dashboard" />
          </div>

          {latestAnalysis && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    LATEST CRPM SNAPSHOT
                  </div>

                  <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    {latestAnalysis.ticker}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {latestAnalysis.company || 'Most recent quantitative analysis generated by the CRPM engine.'}
                  </p>
                </div>
<div>
  <div className="text-[11px] uppercase text-zinc-400">
    Machines
  </div>
  <div className="font-semibold">
    {Array.isArray(latestAnalysis.result?.machines)
      ? `${latestAnalysis.result.machines.length} available`
      : 'Not available'}
  </div>
</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm lg:grid-cols-5">
                  <div>
                    <div className="text-[11px] uppercase text-zinc-400">
                      Spot
                    </div>
                    <div className="font-semibold">
                      {formatMoney(Number(latestAnalysis.spot))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-zinc-400">
                      IV
                    </div>
                    <div className="font-semibold">
                      {Number(latestAnalysis.iv).toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-zinc-400">
                      Expected Move
                    </div>
                    <div className="font-semibold">
                    ± {formatMoney(Number(latestAnalysis.expected_move))}
<span className="ml-1 text-[12px] font-medium text-zinc-500">
  (
  {Number(latestAnalysis.spot) !== 0
    ? `${((Number(latestAnalysis.expected_move) / Number(latestAnalysis.spot)) * 100).toFixed(2)}%`
    : '-'}
  )
</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase text-zinc-400">
                      DTE
                    </div>
                    <div className="font-semibold">
                      {latestAnalysis.dte}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <div className="text-xs text-zinc-500">
                    {formatDate(latestAnalysis.created_at)}
                  </div>

                  <Link
                    href={`/dashboard/simulations/${latestAnalysis.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-slate-600 bg-slate-700 px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-slate-600"
                  >
                    Open Analysis
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-4">
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
              label="Last Snapshot"
              value={formatDate(latestSnapshot)}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {controlCards.map((card) => (
              <ControlCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
