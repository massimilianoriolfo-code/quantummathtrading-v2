import Link from 'next/link'
import DashboardNav from '@/components/dashboard/DashboardNav'
import {
  Bot,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from 'lucide-react'

const assistantComponents = [
  {
    label: 'Knowledge Base',
    status: 'Not Connected',
  },
  {
    label: 'Portfolio Context',
    status: 'Not Connected',
  },
  {
    label: 'Watchlist Context',
    status: 'Not Connected',
  },
  {
    label: 'Analysis History',
    status: 'Not Connected',
  },
]

const consoleItems = [
  'Expected Move interpretation',
  'Implied Volatility analysis',
  'CRPM Machine selection support',
  'Portfolio context review',
  'Historical analysis review',
  'Probability cone interpretation',
]

export default function CRPMAssistantPage() {
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

            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">
                  QuantumMathTrading
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  CRPM Assistant
                </h1>

                <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                  Portfolio-aware assistant based on the{' '}
                  <span className="font-bold text-slate-700">
                    Calculated Risk and Profit Machines (CRPM)
                  </span>{' '}
                  methodology, historical analysis and future knowledge base integration.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-700 md:inline-flex">
                <ShieldCheck size={16} />
                Under Development
              </div>
            </div>

            <DashboardNav active="dashboard" />
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700 text-white">
                <Bot size={22} />
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                  Assistant Console
                </div>

                <h2 className="mt-1 text-xl font-bold text-zinc-950">
                  CRPM Assistant is being prepared
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                  This section will become the analytical assistant for the CRPM
                  methodology. It will not execute trades. Its purpose is to
                  support quantitative reasoning, portfolio interpretation,
                  watchlist review and historical simulation analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                System Status
              </div>

              <h3 className="mt-2 text-[18px] font-bold text-zinc-950">
                CRPM Assistant Components
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                {assistantComponents.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 text-zinc-700">
                      <Circle size={10} className="text-amber-500" />
                      <span>{item.label}</span>
                    </div>

                    <span className="whitespace-nowrap text-[12px] font-semibold text-amber-600">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                Assistant Console
              </div>

              <h3 className="mt-2 text-[18px] font-bold text-zinc-950">
                Coming Soon
              </h3>

              <div className="mt-4 space-y-2 text-sm text-zinc-600">
                {consoleItems.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              Product Boundary
            </div>

            <p className="mt-2 text-[12px] leading-5 text-zinc-600">
              The CRPM Assistant is designed for analysis, interpretation and
              decision support. It is not a broker, it does not execute trades,
              and it does not replace independent financial judgment.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
