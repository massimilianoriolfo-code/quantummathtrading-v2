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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type ConeMachine = {
  strike: number | string
}

export type CRPMConeData = {
  spot: number
  iv: number
  dte: number
  machines: ConeMachine[]
}

function parseStrikeLevels(strike: number | string) {
  return String(strike)
    .split('/')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value))
}

function buildConeChart(data: CRPMConeData) {
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

export default function CRPMProbabilityCone({ data }: { data: CRPMConeData }) {
  return (
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
            title: {
              display: true,
              text: 'Underlying Price',
              color: '#111',
              font: { size: 14, weight: 'bold' },
            },
          },
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#222' },
            title: {
              display: true,
              text: 'Days to Expiration',
              color: '#111',
              font: { size: 14, weight: 'bold' },
            },
          },
        },
      }}
    />
  )
}
