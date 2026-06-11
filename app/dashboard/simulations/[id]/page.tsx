import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import CRPMBadge from '@/components/crpm/CRPMBadge'
import CRPMLogo from '@/components/crpm/CRPMLogo'
import CRPMMetricCard from '@/components/crpm/CRPMMetricCard'
import CRPMPanel from '@/components/crpm/CRPMPanel'
import { CRPMThemeProvider } from '@/components/crpm/CRPMThemeProvider'
import CRPMThemeToggle from '@/components/crpm/CRPMThemeToggle'

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

function machineTone(action: any) {
  const text = String(action || '').toUpperCase()

  if (text.includes('SELL PUT')) {
    return {
      badge: 'red' as const,
      action: 'text-red-300',
      profit: 'text-emerald-300',
      risk: 'text-red-300',
      icon: '◆',
      iconColor: 'text-amber-300',
    }
  }

  if (text.includes('BUY PUT')) {
    return {
      badge: 'blue' as const,
      action: 'text-blue-300',
      profit: 'text-emerald-300',
      risk: 'text-red-300',
      icon: '◇',
      iconColor: 'text-blue-300',
    }
  }

  if (text.includes('SELL CALL')) {
    return {
      badge: 'purple' as const,
      action: 'text-purple-300',
      profit: 'text-emerald-300',
      risk: 'text-amber-300',
      icon: '▥',
      iconColor: 'text-purple-300',
    }
  }

  if (text.includes('COMBINED')) {
    return {
      badge: 'yellow' as const,
      action: 'text-yellow-300',
      profit: 'text-emerald-300',
      risk: 'text-blue-300',
      icon: '◎',
      iconColor: 'text-yellow-300',
    }
  }

  return {
    badge: 'green' as const,
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
      <div className="min-h-screen bg-zinc-950 p-6 text-sm text-[var(--crpm-muted)]">
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
      <div className="min-h-screen bg-zinc-950 p-6 text-sm text-[var(--crpm-muted)]">
        SIMULATION NOT FOUND
      </div>
    )
  }

  const result = parseResult(simulation.result)
  const machines = normalizeMachines(result)
  const ticker = String(simulation.ticker || '').toUpperCase()

  const expectedMovePct =
    Number(simulation.spot) > 0 &&
    Number.isFinite(Number(simulation.expected_move))
      ? (
          (Number(simulation.expected_move) / Number(simulation.spot)) *
          100
        ).toFixed(2)
      : '-'

  return (
    <CRPMThemeProvider>
      <main className="min-h-screen bg-[var(--crpm-bg)] px-4 py-3 text-[var(--crpm-text)]">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/dashboard/simulations"
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--crpm-faint)] transition hover:text-zinc-200"
          >
            ← Back to History
          </Link>

          <CRPMThemeToggle />
        </div>

        <CRPMPanel className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CRPMLogo ticker={ticker} size="lg" />

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--crpm-muted)]">
                  CRPM Snapshot Detail
                </div>

                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <h1 className="text-3xl font-black leading-none tracking-tight text-[var(--crpm-text)]">
                    {ticker}
                  </h1>

                  <div className="pb-0.5 text-sm font-medium text-[var(--crpm-muted)]">
                    {simulation.company || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--crpm-muted)]">
                Snapshot
              </div>

              <div className="mt-1 text-sm font-bold text-[var(--crpm-text)]">
                {simulation.created_at
                  ? new Date(simulation.created_at).toLocaleString()
                  : '-'}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <CRPMMetricCard
              label="Spot"
              value={money(Number(simulation.spot))}
            />

            <CRPMMetricCard
              label="IV"
              value={
                Number.isFinite(Number(simulation.iv))
                  ? `${Number(simulation.iv).toFixed(2)}%`
                  : '-'
              }
            />

            <CRPMMetricCard
              label="Expected Move"
              value={`± ${money(Number(simulation.expected_move))}`}
              subvalue={`${expectedMovePct}%`}
            />

            <CRPMMetricCard label="DTE" value={simulation.dte ?? '-'} />

            <CRPMMetricCard label="Machines" value={`${machines.length}/5`} />
          </div>
        </CRPMPanel>

        <CRPMPanel className="mt-2 p-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--crpm-muted)]">
                CRPM Machines
              </div>

              <h2 className="text-base font-bold text-[var(--crpm-text)]">
                Saved machine analysis
              </h2>
            </div>

            <div className="rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-soft)] px-3 py-1 text-xs font-semibold text-[var(--crpm-muted)]">
              <span className="mr-2 text-emerald-300">✓</span>
              {machines.length} loaded
            </div>
          </div>

          {machines.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--crpm-border)] p-4 text-sm text-[var(--crpm-muted)]">
              No CRPM Machines found in saved result.
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {machines.map((machine: any, index: number) => {
                const tone = machineTone(machine.action)

                return (
                  <article
                    key={index}
                    className={`rounded-lg border border-[var(--crpm-border)] bg-[var(--crpm-soft)] p-3 ${
                      index === 4 ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300/80">
                          Machine {index + 1}
                        </div>

                        <h3 className="mt-0.5 text-base font-bold leading-tight text-[var(--crpm-text)]">
                          {machine.name ||
                            machine.title ||
                            `Machine ${index + 1}`}
                        </h3>
                      </div>

                      <CRPMBadge tone={tone.badge}>
                        {valueOrDash(machine.action)}
                      </CRPMBadge>
                    </div>

                    <p className="mt-2 min-h-[32px] text-sm leading-5 text-[var(--crpm-muted)]">
                      {machine.description ||
                        machine.summary ||
                        machine.explanation ||
                        '-'}
                    </p>

                    <div className="mt-3 grid grid-cols-5 overflow-hidden rounded-md border border-[var(--crpm-border)]">
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
                      <div className="mt-2 flex items-start gap-2 text-sm leading-5 text-[var(--crpm-muted)]">
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
        </CRPMPanel>
      </div>
    </main>
    </CRPMThemeProvider>
  )
}

function MachineCell({
  label,
  value,
  className = 'text-[var(--crpm-text)]',
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
        last ? '' : 'border-r border-[var(--crpm-border)]'
      }`}
    >
      <div className="text-[9px] font-semibold uppercase text-[var(--crpm-faint)]">
        {label}
      </div>

      <div className={`mt-1 text-xs font-black leading-4 ${className}`}>
        {value}
      </div>
    </div>
  )
}
