'use client'

import CRPMBadge from '@/components/crpm/CRPMBadge'
import CRPMLogo from '@/components/crpm/CRPMLogo'

type PayoffKind = 'longCall' | 'shortPut' | 'marriedPut' | 'coveredCall' | 'assigned'

type MachineVisual = {
  tone: 'green' | 'red' | 'blue' | 'purple' | 'yellow'
  tag: string
  text: string
  line: string
  payoffKind: PayoffKind
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '-'
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function valueOrDash(value: any) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function cleanMachineName(value: string) {
  return value.replace(/^Machine\s*\d+\s*:\s*/i, '').replace('Assigned Short Put + Covered Call', 'Assigned Strategy')
}

function machineVisual(action: any): MachineVisual {
  const text = String(action || '').toUpperCase()

  if (text.includes('SELL PUT')) return { tone: 'red', tag: 'INCOME', text: 'text-[var(--crpm-red)]', line: 'stroke-rose-300 data-[crpm-theme=light]:stroke-rose-700', payoffKind: 'shortPut' }
  if (text.includes('BUY PUT')) return { tone: 'blue', tag: 'PROTECTION', text: 'text-[var(--crpm-blue)]', line: 'stroke-sky-300 data-[crpm-theme=light]:stroke-sky-700', payoffKind: 'marriedPut' }
  if (text.includes('SELL CALL')) return { tone: 'purple', tag: 'YIELD', text: 'text-[var(--crpm-purple)]', line: 'stroke-violet-300 data-[crpm-theme=light]:stroke-violet-700', payoffKind: 'coveredCall' }
  if (text.includes('COMBINED')) return { tone: 'yellow', tag: 'NEUTRAL', text: 'text-[var(--crpm-yellow)]', line: 'stroke-amber-300 data-[crpm-theme=light]:stroke-amber-800', payoffKind: 'assigned' }

  return { tone: 'green', tag: 'BULLISH', text: 'text-[var(--crpm-green)]', line: 'stroke-emerald-300 data-[crpm-theme=light]:stroke-emerald-700', payoffKind: 'longCall' }
}

function parseStrikes(value: any) {
  const matches = String(value ?? '').match(/\d+(\.\d+)?/g)
  if (!matches) return []
  return matches.map((item) => Number(item)).filter(Number.isFinite)
}

function getBreakEven({ kind, spot, strike, secondStrike, premium }: { kind: PayoffKind; spot: number; strike: number; secondStrike: number; premium: number }) {
  if (kind === 'longCall') return strike + premium
  if (kind === 'shortPut') return strike - premium
  if (kind === 'coveredCall') return spot - premium
  if (kind === 'marriedPut') return spot + premium
  if (kind === 'assigned') return Math.min(strike, secondStrike) - premium
  return strike
}

function payoffAtPrice({ kind, price, spot, strike, secondStrike, premium, multiplier }: { kind: PayoffKind; price: number; spot: number; strike: number; secondStrike: number; premium: number; multiplier: number }) {
  if (kind === 'longCall') return (Math.max(price - strike, 0) - premium) * multiplier
  if (kind === 'shortPut') return (premium - Math.max(strike - price, 0)) * multiplier
  if (kind === 'marriedPut') return ((price - spot) + Math.max(strike - price, 0) - premium) * multiplier
  if (kind === 'coveredCall') return ((price - spot) - Math.max(price - strike, 0) + premium) * multiplier

  const lowerStrike = Math.min(strike, secondStrike)
  const upperStrike = Math.max(strike, secondStrike)
  return (premium - Math.max(lowerStrike - price, 0) - Math.max(price - upperStrike, 0)) * multiplier
}

function formatCompactMoney(value: number) {
  if (!Number.isFinite(value)) return '-'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`
  return `${sign}$${abs.toFixed(0)}`
}

function HoverMetric({ label, value, className = 'text-[var(--crpm-heading)]' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="rounded-md border border-[var(--crpm-border)]/60 bg-[var(--crpm-panel)] px-2 py-1">
      <div className="text-[8px] font-black uppercase tracking-wide text-[var(--crpm-muted)]">{label}</div>
      <div className={`mt-0.5 text-[12px] font-black leading-tight ${className}`}>{value}</div>
    </div>
  )
}

function PayoffVerticalLine({ x, y1, y2, color }: { x: number; y1: number; y2: number; color?: string }) {
  if (!Number.isFinite(x)) return null
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color || 'currentColor'} strokeOpacity={color ? 0.65 : 0.28} strokeDasharray="3 4" />
}

function PayoffChart({ kind, visual, spot, strike, secondStrike, premium, multiplier, breakEven }: { kind: PayoffKind; visual: MachineVisual; spot: number; strike: number; secondStrike: number; premium: number; multiplier: number; breakEven: number }) {
  const referencePrices = [spot, strike, secondStrike, breakEven].filter(Number.isFinite)
  const minRef = Math.min(...referencePrices)
  const maxRef = Math.max(...referencePrices)
  const referenceWidth = Math.max(maxRef - minRef, Math.max(spot * 0.14, 14))
  const minPrice = Math.max(0, minRef - referenceWidth * 0.9)
  const maxPrice = maxRef + referenceWidth * 0.9

  const samples = Array.from({ length: 181 }, (_, index) => {
    const price = minPrice + ((maxPrice - minPrice) * index) / 180
    return { price, payoff: payoffAtPrice({ kind, price, spot, strike, secondStrike, premium, multiplier }) }
  })

  const rawMinY = Math.min(0, ...samples.map((item) => item.payoff))
  const rawMaxY = Math.max(0, ...samples.map((item) => item.payoff))
  const yPadding = Math.max((rawMaxY - rawMinY) * 0.18, 120)
  const minY = rawMinY - yPadding
  const maxY = rawMaxY + yPadding
  const plot = { x: 58, y: 24, w: 438, h: 256 }

  const xScale = (price: number) => plot.x + ((price - minPrice) / (maxPrice - minPrice)) * plot.w
  const yScale = (payoff: number) => plot.y + ((maxY - payoff) / (maxY - minY)) * plot.h

  const zeroY = yScale(0)
  const spotX = xScale(spot)
  const strikeX = xScale(strike)
  const breakEvenX = xScale(breakEven)

  const linePoints = samples.map((item) => `${xScale(item.price).toFixed(2)},${yScale(item.payoff).toFixed(2)}`).join(' ')
  const profitAreaPoints = `${plot.x},${zeroY.toFixed(2)} ${samples.map((item) => `${xScale(item.price).toFixed(2)},${Math.min(yScale(Math.max(item.payoff, 0)), zeroY).toFixed(2)}`).join(' ')} ${plot.x + plot.w},${zeroY.toFixed(2)}`
  const lossAreaPoints = `${plot.x},${zeroY.toFixed(2)} ${samples.map((item) => `${xScale(item.price).toFixed(2)},${Math.max(yScale(Math.min(item.payoff, 0)), zeroY).toFixed(2)}`).join(' ')} ${plot.x + plot.w},${zeroY.toFixed(2)}`
  const xLabels = Array.from({ length: 5 }, (_, index) => minPrice + ((maxPrice - minPrice) * index) / 4)

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
        {[0, 1, 2, 3, 4].map((index) => <line key={`h-${index}`} x1={plot.x} y1={plot.y + (plot.h * index) / 4} x2={plot.x + plot.w} y2={plot.y + (plot.h * index) / 4} stroke="currentColor" strokeOpacity="0.06" />)}
        {[0, 1, 2, 3, 4].map((index) => <line key={`v-${index}`} x1={plot.x + (plot.w * index) / 4} y1={plot.y} x2={plot.x + (plot.w * index) / 4} y2={plot.y + plot.h} stroke="currentColor" strokeOpacity="0.045" />)}

        <line x1={plot.x} y1={zeroY} x2={plot.x + plot.w} y2={zeroY} stroke="currentColor" strokeOpacity="0.42" strokeDasharray="4 5" />
        <polygon points={profitAreaPoints} fill="url(#crpmProfitAreaReadable)" />
        <polygon points={lossAreaPoints} fill="url(#crpmLossAreaReadable)" />
        <polyline points={linePoints} fill="none" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" className={visual.line} />

        <PayoffVerticalLine x={strikeX} y1={plot.y} y2={plot.y + plot.h} />
        <PayoffVerticalLine x={spotX} y1={plot.y} y2={plot.y + plot.h} color="rgb(168,85,247)" />
        <PayoffVerticalLine x={breakEvenX} y1={plot.y} y2={plot.y + plot.h} />

        <circle cx={spotX} cy={zeroY} r="3" fill="rgb(168,85,247)" />
        <circle cx={breakEvenX} cy={zeroY} r="3" fill="currentColor" className={visual.text} />

        <text x={plot.x - 8} y={plot.y + 5} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">{formatCompactMoney(maxY)}</text>
        <text x={plot.x - 8} y={zeroY + 4} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">$0</text>
        <text x={plot.x - 8} y={plot.y + plot.h} textAnchor="end" className="fill-[var(--crpm-muted)] text-[11px] font-semibold">{formatCompactMoney(minY)}</text>

        {xLabels.map((price, index) => <text key={index} x={xScale(price)} y={plot.y + plot.h + 24} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-semibold">{Math.round(price)}</text>)}

        <text x={spotX} y={plot.y + plot.h + 48} textAnchor="middle" className="fill-[var(--crpm-purple)] text-[11px] font-black">Spot {formatMoney(spot)}</text>
        <text x={breakEvenX} y={plot.y + plot.h + 66} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[11px] font-black">B/E {formatMoney(breakEven)}</text>
        <text x={plot.x + plot.w / 2} y="370" textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-bold">Underlying price at expiration</text>
        <text x="14" y={plot.y + plot.h / 2} transform={`rotate(-90 14 ${plot.y + plot.h / 2})`} textAnchor="middle" className="fill-[var(--crpm-muted)] text-[10px] font-bold">P/L ($)</text>
      </svg>
    </div>
  )
}

export default function CRPMPayoffAnalysis({
  simulation,
  machine,
  machineIndex,
}: {
  simulation: any
  machine: any
  machineIndex: number
}) {
  const visual = machineVisual(machine?.action)
  const spot = Number(simulation?.spot)
  const premium = Number(machine?.premium)
  const strikes = parseStrikes(machine?.strike)
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
          <div className="mt-0.5 truncate text-base font-black text-[var(--crpm-heading)] whitespace-nowrap">
            {cleanMachineName(machine?.name || machine?.title || 'Selected Machine')}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--crpm-muted)]">
            <CRPMLogo ticker={simulation?.ticker} size="xs" />
            <span>{simulation?.ticker}</span>
            <span>-</span>
            <span>{formatDate(simulation?.created_at)}</span>
          </div>
        </div>

        <CRPMBadge tone={visual.tone}>{visual.tag}</CRPMBadge>
      </div>

      <div className="grid gap-3 lg:grid-cols-[132px_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <HoverMetric label="Spot" value={formatMoney(spot)} />
          <HoverMetric label="Strike" value={valueOrDash(machine?.strike)} />
          <HoverMetric label="Premium" value={Number.isFinite(cleanPremium) ? `$${cleanPremium}` : '-'} />
          <HoverMetric label="B/E" value={Number.isFinite(breakEven) ? formatMoney(breakEven) : '-'} />
          <HoverMetric label="Max Profit" value={valueOrDash(machine?.maxProfit ?? machine?.max_profit)} className="text-[var(--crpm-green)]" />
          <HoverMetric label="Max Risk" value={valueOrDash(machine?.maxRisk ?? machine?.max_risk)} className={visual.tone === 'purple' ? 'text-[var(--crpm-yellow)]' : 'text-[var(--crpm-red)]'} />
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
