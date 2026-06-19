import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import CRPMBadge from '@/components/crpm/CRPMBadge'
import CRPMLogo from '@/components/crpm/CRPMLogo'
import CRPMPanel from '@/components/crpm/CRPMPanel'
import CRPMHeader from '@/components/crpm/CRPMHeader'
import DeleteSimulationSnapshotButton from './DeleteSimulationSnapshotButton'
import DeleteAllSimulationSnapshotsButton from './DeleteAllSimulationSnapshotsButton'
import { CRPMThemeProvider } from '@/components/crpm/CRPMThemeProvider'
import { supabaseAdmin } from '@/lib/supabaseAdmin'


type PayoffKind = 'longCall' | 'shortPut' | 'marriedPut' | 'coveredCall' | 'assigned'

type MachineVisual = {
  tone: 'green' | 'red' | 'blue' | 'purple' | 'yellow'
  tag: string
  text: string
  line: string
  border: string
  bg: string
  active: string
  payoffKind: PayoffKind
  icon: React.ReactNode
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '-'

  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '-'

  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
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

function cleanMachineName(value: string) {
  return value
    .replace(/^Machine\s*\d+\s*:\s*/i, '')
    .replace('Assigned Short Put + Covered Call', 'Assigned Strategy')
}

function machineVisual(action: any): MachineVisual {
  const text = String(action || '').toUpperCase()

  if (text.includes('SELL PUT')) {
    return {
      tone: 'red',
      tag: 'INCOME',
      text: 'text-[var(--crpm-red)]',
      line: 'stroke-rose-300 data-[crpm-theme=light]:stroke-rose-700',
      border: 'border-rose-400/45',
      bg: 'bg-rose-500/[0.035]',
      active: 'shadow-[inset_2px_0_0_rgb(251,113,133)]',
      payoffKind: 'shortPut',
      icon: <PutIncomeIcon />,
    }
  }

  if (text.includes('BUY PUT')) {
    return {
      tone: 'blue',
      tag: 'PROTECTION',
      text: 'text-[var(--crpm-blue)]',
      line: 'stroke-sky-300 data-[crpm-theme=light]:stroke-sky-700',
      border: 'border-sky-400/45',
      bg: 'bg-sky-500/[0.035]',
      active: 'shadow-[inset_2px_0_0_rgb(56,189,248)]',
      payoffKind: 'marriedPut',
      icon: <ProtectionIcon />,
    }
  }

  if (text.includes('SELL CALL')) {
    return {
      tone: 'purple',
      tag: 'YIELD',
      text: 'text-[var(--crpm-purple)]',
      line: 'stroke-violet-300 data-[crpm-theme=light]:stroke-violet-700',
      border: 'border-violet-400/45',
      bg: 'bg-violet-500/[0.035]',
      active: 'shadow-[inset_2px_0_0_rgb(167,139,250)]',
      payoffKind: 'coveredCall',
      icon: <YieldIcon />,
    }
  }

  if (text.includes('COMBINED')) {
    return {
      tone: 'yellow',
      tag: 'NEUTRAL',
      text: 'text-[var(--crpm-yellow)]',
      line: 'stroke-amber-300 data-[crpm-theme=light]:stroke-amber-800',
      border: 'border-amber-400/50',
      bg: 'bg-amber-500/[0.035]',
      active: 'shadow-[inset_2px_0_0_rgb(251,191,36)]',
      payoffKind: 'assigned',
      icon: <BalanceIcon />,
    }
  }

  return {
    tone: 'green',
    tag: 'BULLISH',
    text: 'text-[var(--crpm-green)]',
    line: 'stroke-emerald-300 data-[crpm-theme=light]:stroke-emerald-700',
    border: 'border-emerald-400/45',
    bg: 'bg-emerald-500/[0.035]',
    active: 'shadow-[inset_2px_0_0_rgb(52,211,153)]',
    payoffKind: 'longCall',
    icon: <DirectionalIcon />,
  }
}

export default async function SimulationsHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ selected?: string; machine?: string }>
}) {
  const user = await currentUser()
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const selectedId = resolvedSearchParams?.selected || null
  const selectedMachineIndex =
    resolvedSearchParams?.machine !== undefined
      ? Math.max(0, Number(resolvedSearchParams.machine))
      : -1

  const { data: simulations } = user
    ? await supabaseAdmin
        .from('simulations')
        .select('*')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  const rows = simulations || []
  const total = rows.length
  const uniqueTickers = new Set(rows.map((s) => s.ticker)).size

  const selectedSimulation =
    selectedId ? rows.find((item) => item.id === selectedId) ?? null : null


  const selectedResult = parseResult(selectedSimulation?.result)
  const selectedMachines = normalizeMachines(selectedResult)

  const selectedSpot = Number(selectedSimulation?.spot)
  const selectedExpectedMove = Number(selectedSimulation?.expected_move)
  const selectedExpectedMovePct =
    selectedSpot > 0 && Number.isFinite(selectedExpectedMove)
      ? (selectedExpectedMove / selectedSpot) * 100
      : 0

  return (
    <CRPMThemeProvider>
      <main className="crpm-simulations-page h-screen overflow-hidden bg-zinc-50 p-4 text-[var(--crpm-text)]">
        <div className="mx-auto mt-8 flex h-full w-full max-w-[1920px] flex-col gap-3 overflow-visible rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <CRPMHeader
            active="simulations"
            title="Simulations History & Detail"
          />

          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden xl:grid-cols-[minmax(500px,0.40fr)_minmax(0,0.60fr)]">
            <section className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
              <CRPMPanel className="shrink-0 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-[var(--crpm-heading)] whitespace-nowrap whitespace-nowrap">
                    Saved CRPM Snapshots
                  </h2>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-[var(--crpm-muted)]">
                      <span>{total} snapshots · {uniqueTickers} tickers</span>
                      <DeleteAllSimulationSnapshotsButton count={total} />
                    </div>
                    <div className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--crpm-blue)]">
                      Click a row to inspect details ▶
                    </div>
                  </div>
                </div>
              </CRPMPanel>

              <CRPMPanel className="flex min-h-0 flex-1 flex-col overflow-visible">
                {rows.length > 0 ? (
                  <div className="min-h-0 flex-1 overflow-auto">
                    <div className="sticky top-0 z-10 grid grid-cols-[72px_76px_58px_98px_82px_38px] border-b border-[var(--crpm-border)] bg-[var(--crpm-panel-2)] px-3 py-2 text-[9px] font-black uppercase tracking-wide text-[var(--crpm-faint)]">
                      <div>Ticker</div>
                      <div className="text-right">Spot</div>
                      <div className="text-right">IV</div>
                      <div className="text-right">EXPECTED MOVE</div>
                      <div className="text-right">Time</div>
                      <div className="text-right">DTE</div>
                    </div>

                    <div>
                      {rows.map((item) => {
                        const spot = Number(item.spot)
                        const expectedMove = Number(item.expected_move)
                        const expectedMovePercent =
                          spot !== 0 ? (expectedMove / spot) * 100 : 0
                        const isSelected = selectedSimulation?.id === item.id

                        return (
                          <div
                            key={item.id}
                            className={`grid grid-cols-[72px_76px_58px_98px_82px_38px] relative items-center border-b border-[var(--crpm-border)] px-3 py-2 pr-10 text-[12px] transition ${
                              isSelected
                                ? 'bg-[var(--crpm-soft)] ring-1 ring-inset ring-[var(--crpm-blue)] shadow-[inset_4px_0_0_var(--crpm-blue)]'
                                : 'hover:bg-[var(--crpm-soft)]'
                            }`}
                          >
                            <Link href={`/dashboard/simulations?selected=${item.id}`} className="contents">
                            <div className="flex items-center gap-2">
                              <CRPMLogo ticker={item.ticker} size="xs" />
                              <span className="font-black text-[var(--crpm-heading)] whitespace-nowrap whitespace-nowrap">
                                {item.ticker}
                              </span>
                              {isSelected ? (
                                <span className="text-[10px] font-black text-[var(--crpm-blue)]">▶</span>
                              ) : null}
                            </div>

                            <div className="text-right font-bold text-[var(--crpm-heading)]">
                              {formatMoney(spot)}
                            </div>

                            <div className="text-right font-semibold text-[var(--crpm-muted)]">
                              {formatPercent(Number(item.iv))}
                            </div>

                            <div className="text-right font-bold text-[var(--crpm-heading)]">
                              ± {formatMoney(expectedMove)}
                              <div className="text-[10px] font-semibold text-[var(--crpm-muted)]">
                                {formatPercent(expectedMovePercent)}
                              </div>
                            </div>

                            <div className="text-right font-medium text-[var(--crpm-muted)]">
                              {formatDate(item.created_at)}
                            </div>

                            <div className="text-right font-bold text-[var(--crpm-muted)]">
                              {item.dte}D
                            </div>
                            </Link>

                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <DeleteSimulationSnapshotButton id={item.id} ticker={item.ticker} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-[var(--crpm-muted)]">
                    No CRPM snapshots saved yet.
                  </div>
                )}
              </CRPMPanel>
            </section>

            <section className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
              {selectedSimulation ? (
                <>
                  <CRPMPanel className="min-w-0 shrink-0 px-4 py-2 shadow-sm !bg-none !bg-[#eaf3ff] !from-transparent !to-transparent ring-1 ring-inset ring-[var(--crpm-blue)] border-l-4 border-l-[var(--crpm-blue)]">
                    <div className="grid grid-cols-[minmax(260px,1fr)_minmax(92px,0.42fr)_minmax(82px,0.36fr)_minmax(148px,0.62fr)_minmax(70px,0.30fr)] items-center gap-0">
                      <div className="flex items-center gap-4">
                        <CRPMLogo ticker={selectedSimulation.ticker} size="md" />

                        <div className="min-w-0">
                          <div className="flex items-end gap-2">
                            <h2 className="text-[28px] font-black leading-none tracking-tight text-[var(--crpm-heading)]">
                              {selectedSimulation.ticker}
                            </h2>
                            <span className="truncate text-[15px] font-bold text-[var(--crpm-heading)]/90">
                              {selectedSimulation.company || '-'}
                            </span>
                          </div>
                          <div className="mt-1 text-[12px] font-bold text-[var(--crpm-muted)]">
                            Generated: {formatDateTime(selectedSimulation.created_at)}
                          </div>
                        </div>
                      </div>

                      <TopMini label="Spot" value={formatMoney(Number(selectedSimulation.spot))} />
                      <TopMini label="IV" value={formatPercent(Number(selectedSimulation.iv))} />
                      <TopMini
                        label="EXPECTED MOVE"
                        value={`± ${formatMoney(Number(selectedSimulation.expected_move))}`}
                        subvalue={formatPercent(selectedExpectedMovePct)}
                      />
                      <TopMini label="DTE" value={`${selectedSimulation.dte ?? '-'}D`} />
                    </div>
                  </CRPMPanel>

                  <CRPMPanel className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 shadow-sm !bg-none !bg-[#eaf3ff] !from-transparent !to-transparent ring-1 ring-inset ring-[var(--crpm-blue)] border-l-4 border-l-[var(--crpm-blue)]">
                    <div className="mb-3 flex shrink-0 items-center gap-2">
                      <h2 className="text-base font-black uppercase tracking-[0.20em] text-[var(--crpm-blue)]">
                        CRPM Machines
                      </h2>
                      <span
                        className="text-[11px] font-black text-[var(--crpm-muted)]"
                        title="Click a P/L button to open the payoff analysis."
                      >
                        ⓘ
                      </span>
                    </div>

                    {selectedMachines.length > 0 ? (
                      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1 pb-3">
                        {selectedMachines.map((machine: any, index: number) => {
                          const visual = machineVisual(machine.action)
                          const isActiveMachine = selectedMachineIndex === index
                          const name = cleanMachineName(machine.name || machine.title || `Machine ${index + 1}`)

                          return (
                            <article
                              key={index}
                              className={`rounded-xl border border-[var(--crpm-border)] bg-[var(--crpm-panel)] shadow-sm transition ${
                                ''
                              }`}
                            >
                              <div className="grid min-h-[58px] grid-cols-[38px_minmax(150px,1fr)_56px_58px_88px_116px_46px] items-center gap-2 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border border-[var(--crpm-border)] text-[11px] font-black ${visual.text}`}>
                                    {index + 1}
                                  </span>
                                  <div className={`flex h-7 w-7 items-center justify-center rounded-md border border-[var(--crpm-border)] ${visual.text}`}>
                                    {visual.icon}
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="truncate text-[13px] font-black text-[var(--crpm-heading)] whitespace-nowrap whitespace-nowrap">
                                      {name}
                                    </h3>
                                    <span className={`rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-panel)] px-2 py-0.5 text-[9px] font-black shadow-sm ${visual.text}`}>
                                      {visual.tag}
                                    </span>
                                  </div>
                                </div>

                                <MachineCell label="Strike" value={valueOrDash(machine.strike)} />
                                <MachineCell
                                  label="Premium"
                                  value={
                                    machine.premium !== undefined && machine.premium !== null
                                      ? `$${machine.premium}`
                                      : '-'
                                  }
                                />
                                <MachineCell
                                  label="Max Profit"
                                  value={valueOrDash(machine.maxProfit ?? machine.max_profit)}
                                  className="text-[var(--crpm-green)]"
                                />
                                <MachineCell
                                  label="Max Risk"
                                  value={valueOrDash(machine.maxRisk ?? machine.max_risk)}
                                  className={visual.tone === 'purple' ? 'text-[var(--crpm-yellow)]' : 'text-[var(--crpm-red)]'}
                                />

                                <Link
                                  href={`/dashboard/simulations?selected=${selectedSimulation.id}&machine=${index}`}
                                  className="inline-flex h-8 w-[44px] shrink-0 items-center justify-center justify-self-end rounded-md border border-[var(--crpm-blue)] bg-[var(--crpm-blue)] px-2 text-[10px] font-black text-white shadow-sm transition hover:brightness-90 active:translate-y-px"
                                >
                                  P/L
                                </Link>
                              </div>
                            </article>
                          )
                        })}

                        {selectedMachineIndex >= 0 && selectedMachines[selectedMachineIndex] ? (
                          <PayoffAnalysisPanel
                            selectedSimulation={selectedSimulation}
                            machine={selectedMachines[selectedMachineIndex]}
                            visual={machineVisual(selectedMachines[selectedMachineIndex]?.action)}
                            machineIndex={selectedMachineIndex}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[var(--crpm-border)] p-4 text-sm text-[var(--crpm-muted)]">
                        No CRPM Machines found in saved result.
                      </div>
                    )}
                  </CRPMPanel>
                </>
              ) : (
                <CRPMPanel className="flex min-h-full flex-1 items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--crpm-faint)]">
          No snapshot selected
        </div>

        <h2 className="mt-2 text-2xl font-black text-[var(--crpm-heading)]">
          Select a snapshot from the table on the left
        </h2>

        <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-[var(--crpm-muted)]">
          Choose any saved simulation to review Expected Move, ATM IV, CRPM Machines and Payoff Analysis.
        </p>
      </div>
    </CRPMPanel>
              )}
            </section>
          </div>
        </div>
      </main>
    </CRPMThemeProvider>
  )
}


function EmptySimulationSelection() {
  return (
    <CRPMPanel className="flex min-h-full flex-1 items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--crpm-faint)]">
          No snapshot selected
        </div>

        <h2 className="mt-2 text-2xl font-black text-[var(--crpm-heading)]">
          Select a snapshot from the table on the left
        </h2>

        <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-[var(--crpm-muted)]">
          Choose any saved simulation to review Expected Move, ATM IV, CRPM Machines and Payoff Analysis.
        </p>
      </div>
    </CRPMPanel>
  )
}

function TopMini({
  label,
  value,
  subvalue,
}: {
  label: string
  value: React.ReactNode
  subvalue?: React.ReactNode
}) {
  const showInlineSubvalue = label === 'EXPECTED MOVE' && subvalue

  return (
    <div className="border-l border-[var(--crpm-border)]/45 px-4 py-1 first:border-l-0">
      <div className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.08em] text-[var(--crpm-faint)]">
        {label}
      </div>
      <div className="mt-0.5 whitespace-nowrap text-[12px] font-black leading-tight text-[var(--crpm-heading)]">
        {value}
        {showInlineSubvalue ? (
          <span className="ml-1 text-[10px] font-semibold text-[var(--crpm-muted)]">
            ({subvalue})
          </span>
        ) : null}
      </div>
      {subvalue && !showInlineSubvalue ? (
        <div className="text-[9px] font-semibold leading-tight text-[var(--crpm-muted)]">
          {subvalue}
        </div>
      ) : null}
    </div>
  )
}

function MachineCell({
  label,
  value,
  className = 'text-[var(--crpm-heading)]',
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="border-l border-[var(--crpm-border)] px-2.5">
      <div className="text-[8px] font-black uppercase tracking-wide text-[var(--crpm-muted)]">
        {label}
      </div>
      <div className={`mt-0.5 text-[11px] font-black leading-4 ${className}`}>
        {value}
      </div>
    </div>
  )
}











function PayoffAnalysisPanel({
  selectedSimulation,
  machine,
  visual,
  machineIndex,
}: {
  selectedSimulation: any
  machine: any
  visual: MachineVisual
  machineIndex: number
}) {
  const spot = Number(selectedSimulation?.spot)
  const premium = Number(machine.premium)
  const strikes = parseStrikes(machine.strike)
  const strike = strikes[0] ?? spot
  const secondStrike = strikes[1] ?? strike
  const cleanPremium = Number.isFinite(premium) ? premium : 0
  const multiplier = 100

  const breakEven = getBreakEven({
    kind: visual.payoffKind,
    spot,
    strike,
    secondStrike,
    premium: cleanPremium,
  })

  return (
    <div className="mt-3 rounded-xl border border-[var(--crpm-border)] bg-[var(--crpm-panel)] p-3 text-left shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--crpm-faint)]">
            Option P/L - Machine {machineIndex + 1}
          </div>
          <div className="mt-0.5 truncate text-base font-black text-[var(--crpm-heading)] whitespace-nowrap whitespace-nowrap">
            {cleanMachineName(machine.name || machine.title || 'Selected Machine')}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--crpm-muted)]">
            <CRPMLogo ticker={selectedSimulation.ticker} size="xs" />
            <span>{selectedSimulation.ticker}</span>
            <span>-</span>
            <span>{formatDate(selectedSimulation.created_at)}</span>
          </div>
        </div>

        <CRPMBadge tone={visual.tone}>{visual.tag}</CRPMBadge>
      </div>

      <div className="grid gap-3 lg:grid-cols-[132px_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <HoverMetric label="Spot" value={formatMoney(spot)} />
          <HoverMetric label="Strike" value={valueOrDash(machine.strike)} />
          <HoverMetric label="Premium" value={Number.isFinite(cleanPremium) ? `$${cleanPremium}` : '-'} />
          <HoverMetric label="B/E" value={Number.isFinite(breakEven) ? formatMoney(breakEven) : '-'} />
          <HoverMetric label="Max Profit" value={valueOrDash(machine.maxProfit ?? machine.max_profit)} className="text-[var(--crpm-green)]" />
          <HoverMetric label="Max Risk" value={valueOrDash(machine.maxRisk ?? machine.max_risk)} className={visual.tone === 'purple' ? 'text-[var(--crpm-yellow)]' : 'text-[var(--crpm-red)]'} />
        </div>

        <PayoffChart
          kind={visual.payoffKind}
          visual={visual}
          spot={spot}
          strike={strike}
          secondStrike={secondStrike}
          premium={cleanPremium}
          multiplier={multiplier}
          breakEven={breakEven}
        />
      </div>
    </div>
  )
}

function HoverMetric({
  label,
  value,
  className = 'text-[var(--crpm-heading)]',
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="rounded-md border border-[var(--crpm-border)]/60 bg-[var(--crpm-panel)] px-2 py-1">
      <div className="text-[8px] font-black uppercase tracking-wide text-[var(--crpm-muted)]">
        {label}
      </div>
      <div className={`mt-0.5 text-[12px] font-black leading-tight ${className}`}>
        {value}
      </div>
    </div>
  )
}

function parseStrikes(value: any) {
  const matches = String(value ?? '').match(/\d+(\.\d+)?/g)
  if (!matches) return []
  return matches.map((item) => Number(item)).filter((item) => Number.isFinite(item))
}

function getBreakEven({
  kind,
  spot,
  strike,
  secondStrike,
  premium,
}: {
  kind: PayoffKind
  spot: number
  strike: number
  secondStrike: number
  premium: number
}) {
  if (kind === 'longCall') return strike + premium
  if (kind === 'shortPut') return strike - premium
  if (kind === 'coveredCall') return spot - premium
  if (kind === 'marriedPut') return spot + premium
  if (kind === 'assigned') return Math.min(strike, secondStrike) - premium
  return strike
}

function payoffAtPrice({
  kind,
  price,
  spot,
  strike,
  secondStrike,
  premium,
  multiplier,
}: {
  kind: PayoffKind
  price: number
  spot: number
  strike: number
  secondStrike: number
  premium: number
  multiplier: number
}) {
  if (kind === 'longCall') {
    return (Math.max(price - strike, 0) - premium) * multiplier
  }

  if (kind === 'shortPut') {
    return (premium - Math.max(strike - price, 0)) * multiplier
  }

  if (kind === 'marriedPut') {
    return ((price - spot) + Math.max(strike - price, 0) - premium) * multiplier
  }

  if (kind === 'coveredCall') {
    return ((price - spot) - Math.max(price - strike, 0) + premium) * multiplier
  }

  const lowerStrike = Math.min(strike, secondStrike)
  const upperStrike = Math.max(strike, secondStrike)

  return (
    premium -
    Math.max(lowerStrike - price, 0) -
    Math.max(price - upperStrike, 0)
  ) * multiplier
}

function PayoffChart({
  kind,
  visual,
  spot,
  strike,
  secondStrike,
  premium,
  multiplier,
  breakEven,
}: {
  kind: PayoffKind
  visual: MachineVisual
  spot: number
  strike: number
  secondStrike: number
  premium: number
  multiplier: number
  breakEven: number
}) {
  const referencePrices = [spot, strike, secondStrike, breakEven].filter(Number.isFinite)
  const minRef = Math.min(...referencePrices)
  const maxRef = Math.max(...referencePrices)
  const referenceWidth = Math.max(maxRef - minRef, Math.max(spot * 0.14, 14))
  const minPrice = Math.max(0, minRef - referenceWidth * 0.9)
  const maxPrice = maxRef + referenceWidth * 0.9

  const samples = Array.from({ length: 181 }, (_, index) => {
    const price = minPrice + ((maxPrice - minPrice) * index) / 180
    return {
      price,
      payoff: payoffAtPrice({ kind, price, spot, strike, secondStrike, premium, multiplier }),
    }
  })

  const rawMinY = Math.min(0, ...samples.map((item) => item.payoff))
  const rawMaxY = Math.max(0, ...samples.map((item) => item.payoff))
  const yPadding = Math.max((rawMaxY - rawMinY) * 0.18, 120)
  const minY = rawMinY - yPadding
  const maxY = rawMaxY + yPadding

  const plot = { x: 58, y: 24, w: 438, h: 256 }

  const xScale = (price: number) =>
    plot.x + ((price - minPrice) / (maxPrice - minPrice)) * plot.w

  const yScale = (payoff: number) =>
    plot.y + ((maxY - payoff) / (maxY - minY)) * plot.h

  const zeroY = yScale(0)
  const spotX = xScale(spot)
  const strikeX = xScale(strike)
  const breakEvenX = xScale(breakEven)

  const linePoints = samples
    .map((item) => `${xScale(item.price).toFixed(2)},${yScale(item.payoff).toFixed(2)}`)
    .join(' ')

  const profitAreaPoints = `${plot.x},${zeroY.toFixed(2)} ${samples
    .map((item) => `${xScale(item.price).toFixed(2)},${Math.min(yScale(Math.max(item.payoff, 0)), zeroY).toFixed(2)}`)
    .join(' ')} ${plot.x + plot.w},${zeroY.toFixed(2)}`

  const lossAreaPoints = `${plot.x},${zeroY.toFixed(2)} ${samples
    .map((item) => `${xScale(item.price).toFixed(2)},${Math.max(yScale(Math.min(item.payoff, 0)), zeroY).toFixed(2)}`)
    .join(' ')} ${plot.x + plot.w},${zeroY.toFixed(2)}`

  const xLabels = Array.from({ length: 5 }, (_, index) =>
    minPrice + ((maxPrice - minPrice) * index) / 4
  )

  return (
    <div className="rounded-md border border-[var(--crpm-border)] bg-[var(--crpm-cell)] p-2">
      <svg viewBox="0 0 535 374" className="h-[358px] w-full">
        <defs>
          <linearGradient id="crpmProfitAreaReadable" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.035" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="crpmLossAreaReadable" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.13" />
            <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0.025" />
          </linearGradient>
        </defs>

        <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} rx="6" fill="transparent" stroke="currentColor" strokeOpacity="0.10" />

        {[0, 1, 2, 3, 4].map((index) => {
          const y = plot.y + (plot.h * index) / 4
          return <line key={`h-${index}`} x1={plot.x} y1={y} x2={plot.x + plot.w} y2={y} stroke="currentColor" strokeOpacity="0.06" />
        })}

        {[0, 1, 2, 3, 4].map((index) => {
          const x = plot.x + (plot.w * index) / 4
          return <line key={`v-${index}`} x1={x} y1={plot.y} x2={x} y2={plot.y + plot.h} stroke="currentColor" strokeOpacity="0.045" />
        })}

        <line x1={plot.x} y1={zeroY} x2={plot.x + plot.w} y2={zeroY} stroke="currentColor" strokeOpacity="0.42" strokeDasharray="4 5" />

        <polygon points={profitAreaPoints} fill="url(#crpmProfitAreaReadable)" />
        <polygon points={lossAreaPoints} fill="url(#crpmLossAreaReadable)" />
        <polyline points={linePoints} fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" className={visual.line} />

        <PayoffVerticalLine x={strikeX} y1={plot.y} y2={plot.y + plot.h} />
        <PayoffVerticalLine x={spotX} y1={plot.y} y2={plot.y + plot.h} color="rgb(168,85,247)" />
        <PayoffVerticalLine x={breakEvenX} y1={plot.y} y2={plot.y + plot.h} />

        <circle cx={spotX} cy={zeroY} r="3" fill="rgb(168,85,247)" />
        <circle cx={breakEvenX} cy={zeroY} r="3" fill="currentColor" className={visual.text} />

        <text x={plot.x - 8} y={plot.y + 5} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">{formatCompactMoney(maxY)}</text>
        <text x={plot.x - 8} y={zeroY + 4} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">$0</text>
        <text x={plot.x - 8} y={plot.y + plot.h} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">{formatCompactMoney(minY)}</text>

        {xLabels.map((price, index) => {
          const x = xScale(price)
          return <text key={index} x={x} y={plot.y + plot.h + 24} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-semibold">{Math.round(price)}</text>
        })}

        <text x={spotX} y={plot.y + plot.h + 48} textAnchor="middle" className="fill-[var(--crpm-purple)] text-[11px] font-black">
          Spot {formatMoney(spot)}
        </text>

        <text x={breakEvenX} y={plot.y + plot.h + 66} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[11px] font-black">
          B/E {formatMoney(breakEven)}
        </text>

        <text x={plot.x + plot.w / 2} y="370" textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-bold">Underlying price at expiration</text>
        <text x="14" y={plot.y + plot.h / 2} transform={`rotate(-90 14 ${plot.y + plot.h / 2})`} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-bold">P/L ($)</text>
      </svg>
    </div>
  )
}

function PayoffVerticalLine({
  x,
  y1,
  y2,
  color,
}: {
  x: number
  y1: number
  y2: number
  color?: string
}) {
  if (!Number.isFinite(x)) return null

  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke={color || 'currentColor'}
      strokeOpacity={color ? 0.65 : 0.28}
      strokeDasharray="3 4"
    />
  )
}

function formatCompactMoney(value: number) {
  if (!Number.isFinite(value)) return '-'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`
  return `${sign}$${abs.toFixed(0)}`
}

function DirectionalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M4 17h4l4-6 3 3 5-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6h4v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PutIncomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M5 6l14 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 18h4v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.7" fill="currentColor" />
    </svg>
  )
}

function ProtectionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function YieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M5 19V9M12 19V5M19 19v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BalanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M12 4v16M6 8h12M7 8l-3 6h6L7 8zM17 8l-3 6h6l-3-6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
