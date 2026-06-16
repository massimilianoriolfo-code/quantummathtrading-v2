import { currentUser } from '@clerk/nextjs/server'
import CRPMHeader from '@/components/crpm/CRPMHeader'
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
    <div className="rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#334155]">
            {icon}
          </div>

          <div>
            <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
              {label}
            </div>
            <div className="mt-0.5 text-[18px] font-black text-[#081225]">
              {value}
            </div>
          </div>
        </div>

        <span className="rounded-md border border-[#d7dee8] bg-[#f8fafc] px-2 py-1 text-[10px] font-black uppercase text-[#4b5f7a]">
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
    <main className="min-h-screen bg-zinc-50 p-4 text-[#0b1220]">
      <div className="mx-auto w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
        <CRPMHeader
          active="assistant"
          title="CRPM Assistant"
          subtitle="Portfolio-aware analytical assistant prepared for CRPM methodology, portfolio context, watchlist context and historical simulations."
        />

        <section className="rounded-2xl border border-[#d7dee8] bg-white p-3 shadow-sm">
          <div className="rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#334155] text-white">
                <Bot size={22} />
              </div>

              <div>
                <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
                  Assistant Console v0.3
                </div>

                <h2 className="mt-0.5 text-lg font-black text-[#081225]">
                  Context layer connected
                </h2>

                <p className="mt-1 max-w-4xl text-[12px] font-semibold leading-5 text-[#4b5f7a]">
                  This step connects the Assistant page to the SaaS data context. No AI reasoning is active yet. The page now reads portfolio, watchlist and historical simulation context from Supabase.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-3 grid gap-3 md:grid-cols-4">
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

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
              <div className="text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
                Latest Available Analysis
              </div>

              <h3 className="mt-1 text-[18px] font-black text-[#081225]">
                {latestAnalysis ? latestAnalysis.ticker : 'No analysis available'}
              </h3>

              <p className="mt-1 text-[12px] font-semibold text-[#4b5f7a]">
                {latestAnalysis
                  ? `${latestAnalysis.company || 'Latest CRPM snapshot'} · ${formatDate(latestAnalysis.created_at)}`
                  : 'Run a CRPM simulation to create the first analysis context.'}
              </p>
            </div>

            <div className="rounded-xl border border-[#d7dee8] bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-[#4b5f7a]">
                <ShieldCheck size={15} />
                Product Boundary
              </div>

              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#4b5f7a]">
                The CRPM Assistant is designed for analysis, interpretation and decision support. It does not execute trades, does not connect to brokers and does not replace independent financial judgment.
              </p>
            </div>
          </section>
        </section>
        </div>
      </div>
    </main>
  )
}
