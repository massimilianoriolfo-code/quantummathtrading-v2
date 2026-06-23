'use client'

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

function parseStrikeLevels(strike: number | string) {
  return String(strike)
    .split('/')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value))
}

function buildConeChart(result: any) {
  const labels: string[] = []
  const upper: number[] = []
  const lower: number[] = []
  const spotLine: number[] = []

  const spot = Number(result?.spot)
  const ivDecimal = Number(result?.iv) / 100
  const dte = Number(result?.dte || 30)

  for (let day = 0; day <= dte; day++) {
    labels.push(`${day}d`)

    const move = spot * ivDecimal * Math.sqrt(day / 365)

    upper.push(Number((spot + move).toFixed(2)))
    lower.push(Number((spot - move).toFixed(2)))
    spotLine.push(spot)
  }

  const strikeDatasets = (result?.machines || []).flatMap((machine: any, index: number) =>
    parseStrikeLevels(machine.strike).map((strike, strikeIndex) => ({
      label: `M${index + 1}${strikeIndex > 0 ? `.${strikeIndex + 1}` : ''} Strike ${strike}`,
      data: labels.map(() => strike),
      borderColor: 'rgba(37,99,235,0.42)',
      borderDash: [4, 4],
      borderWidth: 1.2,
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
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.25,
      },
      {
        label: '-1σ Boundary',
        data: lower,
        borderColor: 'rgb(239,68,68)',
        backgroundColor: 'rgba(239,68,68,0.10)',
        fill: false,
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.25,
      },
      {
        label: 'Spot Price',
        data: spotLine,
        borderColor: 'rgb(100,116,139)',
        borderDash: [8, 6],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
      },
      ...strikeDatasets,
    ],
  }
}

export default function CRPMSnapshotCone({ result }: { result: any }) {
  if (!result?.spot || !result?.iv || !result?.machines?.length) return null

  const spot = Number(result.spot)

  return (
    <div className="mt-3 rounded-xl border border-[var(--crpm-border)] bg-[var(--crpm-panel)] p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.20em] text-[var(--crpm-faint)]">
            Probability Cone
          </div>
          <h3 className="text-[15px] font-black text-[var(--crpm-heading)]">
            Snapshot cone with CRPM strike levels
          </h3>
        </div>

        <div className="text-right text-[11px] font-bold text-[var(--crpm-muted)]">
          ± ${Number(result.expectedMove || result.expected_move || 0).toFixed(2)} · {Number(result.dte || 0)}D
        </div>
      </div>

      <div className="h-[260px] rounded-lg border border-[var(--crpm-border)] bg-white p-2">
        <Line
          data={buildConeChart(result)}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  filter: (legendItem) =>
                    !String(legendItem.text || '').includes('Strike'),
                  boxWidth: 18,
                  color: '#111827',
                  font: {
                    size: 11,
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
                ticks: { color: '#111827' },
                grid: { color: 'rgba(0,0,0,0.06)' },
              },
              x: {
                ticks: { color: '#111827', maxTicksLimit: 8 },
                grid: { color: 'rgba(0,0,0,0.04)' },
              },
            },
          }}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {(result.machines || []).flatMap((machine: any, index: number) =>
          parseStrikeLevels(machine.strike).map((strike, strikeIndex) => (
            <div
              key={`${index}-${strikeIndex}`}
              className="rounded-lg border border-[var(--crpm-border)] bg-[var(--crpm-cell)] px-2 py-1.5"
            >
              <div className="text-[9px] font-black uppercase text-[var(--crpm-faint)]">
                M{index + 1}{strikeIndex > 0 ? `.${strikeIndex + 1}` : ''}
              </div>
              <div className="text-[12px] font-black text-[var(--crpm-heading)]">
                ${strike.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-[var(--crpm-muted)]">
                {(((strike - spot) / spot) * 100).toFixed(2)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
