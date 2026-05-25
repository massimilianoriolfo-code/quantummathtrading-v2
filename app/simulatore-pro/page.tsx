'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

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

type SimulatorData = {
  ticker: string
  company: string
  spot: number
  iv: number
  expiration: string
  dte: number
  capital: number
  expectedMove: number
  upperBoundary: number
  lowerBoundary: number
  atmCall: {
    strike: number
    premium: number
    iv: number
  }
  atmPut: {
    strike: number
    premium: number
    iv: number
  }
  machines: Machine[]
  method: string
}

function buildConeChart(data: SimulatorData) {
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
    ],
  }
}

export default function SimulatorPage() {
  const [ticker, setTicker] = useState('')
  const [data, setData] = useState<SimulatorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [details, setDetails] = useState('')

  async function runAnalysis() {
    try {
      setLoading(true)
      setError('')
      setDetails('')
      setData(null)

      const response = await fetch(`/api/simulator?ticker=${ticker}`)
      const json = await response.json()

      if (!response.ok) {
        setDetails(json.details || '')
        throw new Error(json.error || 'API error')
      }

      setData(json)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load analysis'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-bold transition hover:bg-zinc-300"
          >
            ← Dashboard
          </Link>

          <UserButton />
        </div>

        <h1 className="text-center text-4xl font-bold">
          CRPM Quantitative Analysis
        </h1>

        <div className="mt-8 flex justify-center gap-4">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="ENTER TICKER"
            className="w-64 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3"
          />

          <button
            onClick={runAnalysis}
            disabled={!ticker || loading}
            className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-40"
          >
            {loading ? 'Loading...' : 'Run Analysis'}
          </button>
        </div>

        {error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="font-bold">{error}</div>
            {details && <div className="mt-2 text-sm">{details}</div>}
          </div>
        )}

        {data && (
          <>
            <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-2xl font-bold">{data.company}</h2>

              <p className="mt-2 text-sm text-zinc-500">
                Analysis generated on{' '}
                {new Date().toLocaleDateString()} at{' '}
                {new Date().toLocaleTimeString()}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-zinc-100 p-4">
                  <div className="text-sm text-zinc-500">Spot Price</div>
                  <div className="text-xl font-bold">${data.spot}</div>
                </div>

                <div className="rounded-xl bg-zinc-100 p-4">
                  <div className="text-sm text-zinc-500">ATM 30DTE IV</div>
                  <div className="text-xl font-bold">{data.iv}%</div>
                </div>

                <div className="rounded-xl bg-zinc-100 p-4">
                  <div className="text-sm text-zinc-500">Expiration</div>
                  <div className="text-xl font-bold">
                    {new Date(data.expiration).toLocaleDateString()}
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-100 p-4">
                  <div className="text-sm text-zinc-500">DTE</div>
                  <div className="text-xl font-bold">{data.dte}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">Expected Move</h3>
                  <p>${data.expectedMove}</p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">Lower 1σ Boundary</h3>
                  <p>${data.lowerBoundary}</p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">Upper 1σ Boundary</h3>
                  <p>${data.upperBoundary}</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-xl font-bold">
                  1-Sigma Probability Cone
                </h3>

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
                            font: {
                              size: 13,
                              weight: 'bold',
                            },
                          },
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        },
                      },
                      scales: {
                        y: {
                          grid: {
                            color: 'rgba(0,0,0,0.06)',
                          },
                          ticks: {
                            color: '#222',
                          },
                          title: {
                            display: true,
                            text: 'Underlying Price',
                            color: '#111',
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                          },
                        },
                        x: {
                          grid: {
                            color: 'rgba(0,0,0,0.04)',
                          },
                          ticks: {
                            color: '#222',
                          },
                          title: {
                            display: true,
                            text: 'Days to Expiration',
                            color: '#111',
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">ATM Call</h3>
                  <p>Strike: ${data.atmCall.strike}</p>
                  <p>Premium: ${data.atmCall.premium}</p>
                  <p>IV: {data.atmCall.iv}%</p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">ATM Put</h3>
                  <p>Strike: ${data.atmPut.strike}</p>
                  <p>Premium: ${data.atmPut.premium}</p>
                  <p>IV: {data.atmPut.iv}%</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-zinc-500">
                {data.method}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 text-2xl font-bold">
                Calculated Risk and Profit Machines
              </h2>

              <div className="space-y-5">
                {data.machines.map((machine, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h3 className="text-xl font-bold">
                          {machine.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {machine.description}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black px-4 py-2 text-center text-sm font-bold text-white">
                        {machine.action}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-5">
                      <div className="rounded-xl bg-zinc-100 p-4">
                        <div className="text-sm text-zinc-500">Strike</div>
                        <div className="font-bold">{machine.strike}</div>
                      </div>

                      <div className="rounded-xl bg-zinc-100 p-4">
                        <div className="text-sm text-zinc-500">Expiry</div>
                        <div className="font-bold">
                          {new Date(machine.expiry).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-100 p-4">
                        <div className="text-sm text-zinc-500">Premium</div>
                        <div className="font-bold">${machine.premium}</div>
                      </div>

                      <div className="rounded-xl bg-zinc-100 p-4">
                        <div className="text-sm text-zinc-500">Max Profit</div>
                        <div className="font-bold">{machine.maxProfit}</div>
                      </div>

                      <div className="rounded-xl bg-zinc-100 p-4">
                        <div className="text-sm text-zinc-500">Max Risk</div>
                        <div className="font-bold text-red-700">
                          {machine.maxRisk}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-900">
                      <strong>Note:</strong> {machine.note}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}