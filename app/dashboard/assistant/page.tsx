import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import CRPMAppNav from '@/components/crpm/CRPMAppNav'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  Bot,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Eye,
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

function ContextCard({
  label,
  value,
  status,
  icon,
}: {
  label: string
  value: string
  status: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {icon}
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              {label}
            </div>
            <div className="mt-1 text-[20px] font-bold text-zinc-950">
              {value}
            </div>
          </div>
        </div>

        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-bold uppercase text-zinc-500">
          {status}
        </span>
      </div>
    </div>
  )
}

export default async function CRPMAssistantPage() {
  const user = await currentUser()

  const { data: portfolio } = user
    ? await supabaseAdmin
        .from('portfolio')
        .select('id')
        .eq('clerk_user_id', user.id)
    : { data: [] }

  const { data: watchlist } = user
    ? await supabaseAdmin
        .from('watchlist')
        .select('id')
        .eq('clerk_user_id', user.id)
    : { data: [] }

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('id, ticker, company, created_at')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  const latestAnalysis = simulations?.[0] || null

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-[12px] text-zinc-950">
      <div className="mx-auto w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <header className="flex items-start justify-between border-b border-zinc-200 pb-4">
          <div>
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

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                CRPM Assistant
              </h1>

              <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                Portfolio-aware analytical assistant prepared for CRPM methodology, portfolio context, watchlist context and historical simulations.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <CRPMAppNav active="assistant" />
          </div>
        </header>

        <section className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700 text-white">
              <Bot size={22} />
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                Assistant Console v0.3
              </div>

              <h2 className="mt-1 text-xl font-bold text-zinc-950">
                Context layer connected
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                This step connects the Assistant page to the SaaS data context. No AI reasoning is active yet. The page now reads portfolio, watchlist and historical simulation context from Supabase.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-4">
          <ContextCard
            label="Portfolio Context"
            value={`${portfolio?.length || 0} positions`}
            status="Loaded"
            icon={<BriefcaseBusiness size={20} />}
          />

          <ContextCard
            label="Watchlist Context"
            value={`${watchlist?.length || 0} tickers`}
            status="Loaded"
            icon={<Eye size={20} />}
          />

          <ContextCard
            label="Analysis History"
            value={`${simulations?.length || 0} snapshots`}
            status="Loaded"
            icon={<Clock3 size={20} />}
          />

          <ContextCard
            label="Knowledge Base"
            value="Coming soon"
            status="Pending"
            icon={<BookOpen size={20} />}
          />
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              Latest Available Analysis
            </div>

            <h3 className="mt-2 text-[18px] font-bold text-zinc-950">
              {latestAnalysis ? latestAnalysis.ticker : 'No analysis available'}
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              {latestAnalysis
                ? `${latestAnalysis.company || 'Latest CRPM snapshot'} · ${formatDate(latestAnalysis.created_at)}`
                : 'Run a CRPM simulation to create the first analysis context.'}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              <ShieldCheck size={15} />
              Product Boundary
            </div>

            <p className="mt-2 text-[12px] leading-5 text-zinc-600">
              The CRPM Assistant is designed for analysis, interpretation and decision support. It does not execute trades, does not connect to brokers and does not replace independent financial judgment.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
