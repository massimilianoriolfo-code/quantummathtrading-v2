'use client'

import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type Machine = {
  name: string
  action: string
  strike: number | string
  expiry: string
  premium: number
  maxProfit: string
  maxRisk: string
  description: string
  note: string
}

export type SavedAnalysisData = {
  ticker: string
  company: string
  spot: number
  iv: number
  expiration: string
  dte: number
  expectedMove: number
  lowerBoundary: number
  upperBoundary: number
  atmCall?: { strike: number; premium: number; iv: number }
  atmPut?: { strike: number; premium: number; iv: number }
  machines: Machine[]
  method?: string
}

function parseStrikeLevels(strike: number | string) {
  return String(strike).split('/').map((item) => Number(item.trim())).filter(Number.isFinite)
}

function buildConeChart(data: SavedAnalysisData) {
  const labels: string[] = []
  const upper: number[] = []
  const lower: number[] = []
  const spotLine: number[] = []

  const ivDecimal = data.iv / 100
  const spot = data.spot

  for (let day = 0; day <= data.dte; day++) {
    labels.push(`${day}d`)
    const move = spot * ivDecimal * Math.sqrt(day / 365)
    upper.push(Number((spot + move).toFixed(2)))
    lower.push(Number((spot - move).toFixed(2)))
    spotLine.push(spot)
  }

  const machineStrikeDatasets = data.machines.flatMap((machine, index) =>
    parseStrikeLevels(machine.strike).map((strike, strikeIndex) => ({
      label: `M${index + 1}${strikeIndex > 0 ? `.${strikeIndex + 1}` : ''} Strike ${strike}`,
      data: labels.map(() => strike),
      borderColor: 'rgba(37,99,235,0.55)',
      backgroundColor: 'rgba(37,99,235,0.06)',
      borderDash: [4, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0,
    }))
  )

  return {
    labels,
    datasets: [
      {
        label: '+1σ Boundary',
        data: upper,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.10)',
        fill: '+1',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.25,
      },
      {
        label: '-1σ Boundary',
        data: lower,
        borderColor: 'rgb(239,68,68)',
        backgroundColor: 'rgba(239,68,68,0.10)',
        fill: false,
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.25,
      },
      {
        label: 'Spot Price',
        data: spotLine,
        borderColor: 'rgb(120,120,120)',
        borderDash: [8, 6],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
      },
      ...machineStrikeDatasets,
    ],
  }
}

export default function CRPMAnalysisView({
  data,
  generatedAt,
}: {
  data: SavedAnalysisData
  generatedAt: string | null
}) {
  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard/simulations" className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-bold transition hover:bg-zinc-300">
            ← Back
          </Link>
        </div>

        <h1 className="text-center text-4xl font-bold">CRPM Quantitative Analysis</h1>

        <div className="mt-8 flex justify-center gap-4">
          <input value={data.ticker} readOnly className="w-64 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3" />
          <button disabled className="rounded-xl bg-black px-6 py-3 text-white opacity-80">Saved Analysis</button>
        </div>

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-bold">{data.company}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Analysis generated on{' '}
                {generatedAt ? new Date(generatedAt).toLocaleDateString() : '-'} at{' '}
                {generatedAt ? new Date(generatedAt).toLocaleTimeString() : '-'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Metric label="Spot Price" value={`$${data.spot}`} />
            <Metric label="ATM 30DTE IV" value={`${data.iv}%`} />
            <Metric label="Expiration" value={new Date(data.expiration).toLocaleDateString()} />
            <Metric label="DTE" value={String(data.dte)} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoBox label="Expected Move" value={`$${data.expectedMove}`} />
            <InfoBox label="Lower 1σ Boundary" value={`$${data.lowerBoundary}`} />
            <InfoBox label="Upper 1σ Boundary" value={`$${data.upperBoundary}`} />
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-xl font-bold">1-Sigma Probability Cone</h3>
            <div className="h-[420px]">
              <Line
                data={buildConeChart(data)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#111',
                        filter: (legendItem) => !String(legendItem.text || '').includes('Strike'),
                        font: { size: 13, weight: 'bold' },
                      },
                    },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    y: {
                      grid: { color: 'rgba(0,0,0,0.06)' },
                      ticks: { color: '#222' },
                      title: { display: true, text: 'Underlying Price', color: '#111', font: { size: 14, weight: 'bold' } },
                    },
                    x: {
                      grid: { color: 'rgba(0,0,0,0.04)' },
                      ticks: { color: '#222' },
                      title: { display: true, text: 'Days to Expiration', color: '#111', font: { size: 14, weight: 'bold' } },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold">Machine Strike Overlay</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200">
              <div className="grid grid-cols-4 bg-zinc-100 px-3 py-2 text-xs font-black uppercase text-zinc-500">
                <div>Machine</div>
                <div className="text-right">Strike</div>
                <div className="text-right">Distance</div>
                <div className="text-right">Action</div>
              </div>
              {data.machines.flatMap((machine, index) =>
                parseStrikeLevels(machine.strike).map((strike, strikeIndex) => (
                  <div key={`${index}-${strikeIndex}`} className="grid grid-cols-4 border-t border-zinc-200 px-3 py-2 text-sm font-bold">
                    <div>M{index + 1}{strikeIndex > 0 ? `.${strikeIndex + 1}` : ''}</div>
                    <div className="text-right">${strike.toFixed(2)}</div>
                    <div className="text-right">{(((strike - data.spot) / data.spot) * 100).toFixed(2)}%</div>
                    <div className="truncate text-right">{machine.action}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {(data.atmCall || data.atmPut) && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.atmCall && <OptionBox title="ATM Call" option={data.atmCall} />}
              {data.atmPut && <OptionBox title="ATM Put" option={data.atmPut} />}
            </div>
          )}

          {data.method && <p className="mt-6 text-sm text-zinc-500">{data.method}</p>}
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Calculated Risk and Profit Machines</h2>
          <div className="space-y-5">
            {data.machines.map((machine, index) => (
              <div key={index} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h3 className="text-xl font-bold">{machine.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{machine.description}</p>
                  </div>
                  <div className="text-right text-sm font-bold uppercase text-zinc-400">{machine.action}</div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-5">
                  <MachineMetric label="Strike" value={String(machine.strike)} />
                  <MachineMetric label="Expiry" value={new Date(machine.expiry).toLocaleDateString()} />
                  <MachineMetric label="Premium" value={`$${machine.premium}`} />
                  <MachineMetric label="Max Profit" value={machine.maxProfit} />
                  <MachineMetric label="Max Risk" value={machine.maxRisk} danger />
                </div>

                <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-900">
                  <strong>Note:</strong> {machine.note}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-100 p-4"><div className="text-sm text-zinc-500">{label}</div><div className="text-xl font-bold">{value}</div></div>
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border p-4"><h3 className="font-bold">{label}</h3><p>{value}</p></div>
}

function OptionBox({ title, option }: { title: string; option: { strike: number; premium: number; iv: number } }) {
  return <div className="rounded-xl border p-4"><h3 className="font-bold">{title}</h3><p>Strike: ${option.strike}</p><p>Premium: ${option.premium}</p><p>IV: {option.iv}%</p></div>
}

function MachineMetric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className="rounded-xl bg-zinc-100 p-4"><div className="text-sm text-zinc-500">{label}</div><div className={`font-bold ${danger ? 'text-red-700' : ''}`}>{value}</div></div>
}
