import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function money(value: number) {
  if (!Number.isFinite(value)) return '-'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function parseResult(raw: any) {
  if (!raw) return {}

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  return raw
}

function normalizeMachines(result: any) {
  const machines =
    result?.machines ||
    result?.crpmMachines ||
    result?.CRPMMachines ||
    result?.crpm_machines ||
    result?.analysis?.machines ||
    result?.result?.machines ||
    []

  if (Array.isArray(machines)) return machines.slice(0, 5)
  if (machines && typeof machines === 'object') return Object.values(machines).slice(0, 5)

  return []
}

function valueOrDash(value: any) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function companyDomain(ticker: string) {
  const domains: Record<string, string> = {
    AAPL: 'apple.com',
    MSFT: 'microsoft.com',
    NFLX: 'netflix.com',
    NVDA: 'nvidia.com',
    SPY: 'ssga.com',
    BLK: 'blackrock.com',
    AMZN: 'amazon.com',
    GOOGL: 'abc.xyz',
    GOOG: 'abc.xyz',
    META: 'meta.com',
    TSLA: 'tesla.com',
    AVGO: 'broadcom.com',
    AMD: 'amd.com',
    JPM: 'jpmorganchase.com',
    V: 'visa.com',
    MA: 'mastercard.com',
    UNH: 'unitedhealthgroup.com',
    XOM: 'exxonmobil.com',
    COST: 'costco.com',
    LLY: 'lilly.com',
    WMT: 'walmart.com',
    HD: 'homedepot.com',
    PG: 'pg.com',
    KO: 'coca-cola.com',
    PEP: 'pepsico.com',
    MCD: 'mcdonalds.com',
    CRM: 'salesforce.com',
    ORCL: 'oracle.com',
    CSCO: 'cisco.com',
    BAC: 'bankofamerica.com',
    DIS: 'disney.com',
    NKE: 'nike.com',
    IBM: 'ibm.com',
  }

  return domains[ticker.toUpperCase()]
}

function logoSrc(ticker: string) {
  const domain = companyDomain(ticker)
  if (!domain) return null
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

function machineTone(action: any) {
  const text = String(action || '').toUpperCase()

  if (text.includes('SELL PUT')) {
    return {
      badge: 'border-red-500/50 bg-red-500/10 text-red-300',
      action: 'text-red-300',
      profit: 'text-emerald-300',
      risk: 'text-red-300',
      icon: '◆',
      iconColor: 'text-amber-300',
    }
  }

  if (text.includes('BUY PUT')) {
    return {
      badge: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
      action: 'text-blue-300',
      profit: 'text-emerald-300',
      risk: 'text-red-300',
      icon: '◇',
      iconColor: 'text-blue-300',
    }
  }

  if (text.includes('SELL CALL')) {
    return {
      badge: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
      action: 'text-purple-300',
      profit: 'text-emerald-300',
      risk: 'text-amber-300',
      icon: '▥',
      iconColor: 'text-purple-300',
    }
  }

  if (text.includes('COMBINED')) {
    return {
      badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
      action: 'text-yellow-300',
      profit: 'text-emerald-300',
      risk: 'text-blue-300',
      icon: '◎',
      iconColor: 'text-yellow-300',
    }
  }

  return {
    badge: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    action: 'text-emerald-300',
    profit: 'text-emerald-300',
    risk: 'text-red-300',
    icon: '↗',
    iconColor: 'text-blue-300',
  }
}

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-sm text-zinc-300">
        NO USER ID ON SIMULATION DETAIL PAGE
      </div>
    )
  }

  const { data: simulation } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single()

  if (!simulation) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-sm text-zinc-300">
        SIMULATION NOT FOUND
      </div>
    )
  }

  const result = parseResult(simulation.result)
  const machines = normalizeMachines(result)
  const ticker = String(simulation.ticker || '').toUpperCase()
  const logo = logoSrc(ticker)

  const expectedMovePct =
    Number(simulation.spot) > 0 &&
    Number.isFinite(Number(simulation.expected_move))
      ? (
          (Number(simulation.expected_move) / Number(simulation.spot)) *
          100
        ).toFixed(2)
      : '-'

  return (
    <main
      className="
        min-h-screen px-4 py-3
        bg-[#07090b] text-zinc-100
        [--panel:#12171d]
        [--panel-2:#0d1116]
        [--border:rgba(63,63,70,0.85)]
      "
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/dashboard/simulations"
            className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-zinc-200"
          >
            ← Back to History
          </Link>

          <div className="rounded-md border border-[var(--border)] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Theme ready
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-gradient-to-br from-[var(--panel)] to-[var(--panel-2)] p-3 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-white">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${ticker} logo`}
                    className="h-9 w-9 object-contain"
                  />
                ) : (
                  <span className="text-sm font-black text-zinc-900">
                    {ticker.slice(0, 2)}
                  </span>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                  CRPM Snapshot Detail
                </div>

                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <h1 className="text-3xl font-black leading-none tracking-tight text-white">
                    {ticker}
                  </h1>

                  <div className="pb-0.5 text-sm font-medium text-zinc-400">
                    {simulation.company || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                Snapshot
              </div>

              <div className="mt-1 text-sm font-bold text-white">
                {simulation.created_at
                  ? new Date(simulation.created_at).toLocaleString()
                  : '-'}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <MetricCard label="Spot" value={money(Number(simulation.spot))} />
            <MetricCard
              label="IV"
              value={
                Number.isFinite(Number(simulation.iv))
                  ? `${Number(simulation.iv).toFixed(2)}%`
                  : '-'
              }
            />
            <MetricCard
              label="Expected Move"
              value={`± ${money(Number(simulation.expected_move))}`}
              subvalue={`${expectedMovePct}%`}
            />
            <MetricCard label="DTE" value={simulation.dte ?? '-'} />
            <MetricCard label="Machines" value={`${machines.length}/5`} />
          </div>
        </section>

        <section className="mt-2 rounded-lg border border-[var(--border)] bg-gradient-to-br from-[var(--panel)] to-[var(--panel-2)] p-3 shadow-[0_0_30px_rgba(0,0,0,0.25)]">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                CRPM Machines
              </div>

              <h2 className="text-base font-bold text-white">
                Saved machine analysis
              </h2>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
              <span className="mr-2 text-emerald-300">✓</span>
              {machines.length} loaded
            </div>
          </div>

          {machines.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-zinc-400">
              No CRPM Machines found in saved result.
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {machines.map((machine: any, index: number) => {
                const tone = machineTone(machine.action)

                return (
                  <article
                    key={index}
                    className={`rounded-lg border border-[var(--border)] bg-white/[0.025] p-3 ${
                      index === 4 ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300/80">
                          Machine {index + 1}
                        </div>

                        <h3 className="mt-0.5 text-base font-bold leading-tight text-white">
                          {machine.name ||
                            machine.title ||
                            `Machine ${index + 1}`}
                        </h3>
                      </div>

                      <div
                        className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}
                      >
                        {valueOrDash(machine.action)}
                      </div>
                    </div>

                    <p className="mt-2 min-h-[32px] text-sm leading-5 text-zinc-300">
                      {machine.description ||
                        machine.summary ||
                        machine.explanation ||
                        '-'}
                    </p>

                    <div className="mt-3 grid grid-cols-5 overflow-hidden rounded-md border border-[var(--border)]">
                      <MachineCell
                        label="Action"
                        value={valueOrDash(machine.action)}
                        className={tone.action}
                      />
                      <MachineCell
                        label="Strike"
                        value={valueOrDash(machine.strike)}
                      />
                      <MachineCell
                        label="Premium"
                        value={
                          machine.premium !== undefined &&
                          machine.premium !== null
                            ? `$${machine.premium}`
                            : '-'
                        }
                      />
                      <MachineCell
                        label="Max Profit"
                        value={valueOrDash(
                          machine.maxProfit ?? machine.max_profit
                        )}
                        className={tone.profit}
                      />
                      <MachineCell
                        label="Max Risk"
                        value={valueOrDash(
                          machine.maxRisk ?? machine.max_risk
                        )}
                        className={tone.risk}
                        last
                      />
                    </div>

                    {(machine.note || machine.notes) && (
                      <div className="mt-2 flex items-start gap-2 text-sm leading-5 text-zinc-300">
                        <span className={`mt-0.5 shrink-0 ${tone.iconColor}`}>
                          {tone.icon}
                        </span>
                        <span>{machine.note || machine.notes}</span>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  subvalue,
}: {
  label: string
  value: React.ReactNode
  subvalue?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-white/[0.03] px-3 py-3">
      <div className="text-[10px] font-semibold uppercase text-zinc-400">
        {label}
      </div>

      <div className="mt-1 text-xl font-black text-white">
        {value}
      </div>

      {subvalue ? (
        <div className="text-[11px] font-medium text-zinc-400">
          {subvalue}
        </div>
      ) : null}
    </div>
  )
}

function MachineCell({
  label,
  value,
  className = 'text-white',
  last = false,
}: {
  label: string
  value: React.ReactNode
  className?: string
  last?: boolean
}) {
  return (
    <div
      className={`bg-black/[0.08] p-2.5 ${
        last ? '' : 'border-r border-[var(--border)]'
      }`}
    >
      <div className="text-[9px] font-semibold uppercase text-zinc-500">
        {label}
      </div>

      <div className={`mt-1 text-xs font-black leading-4 ${className}`}>
        {value}
      </div>
    </div>
  )
}
