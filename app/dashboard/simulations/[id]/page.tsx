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

  if (Array.isArray(machines)) {
    return machines.slice(0, 5)
  }

  if (machines && typeof machines === 'object') {
    return Object.values(machines).slice(0, 5)
  }

  return []
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
      <div className="p-6 text-sm">
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
      <div className="p-6 text-sm">
        SIMULATION NOT FOUND
      </div>
    )
  }

  const result = parseResult(simulation.result)
  const machines = normalizeMachines(result)

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Link
        href="/dashboard/simulations"
        className="mb-6 inline-block text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        ← Back to History
      </Link>

      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          CRPM Snapshot
        </div>

        <h1 className="mt-2 text-4xl font-bold">
          {simulation.ticker}
        </h1>

        <div className="mt-1 text-lg text-zinc-500">
          {simulation.company}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            Spot
          </div>
          <div className="mt-2 text-3xl font-bold">
            {money(Number(simulation.spot))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            IV
          </div>
          <div className="mt-2 text-3xl font-bold">
            {Number.isFinite(Number(simulation.iv))
              ? `${Number(simulation.iv).toFixed(2)}%`
              : '-'}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            Expected Move
          </div>
          <div className="mt-2 text-3xl font-bold">
            ± {money(Number(simulation.expected_move))}
          </div>
          <div className="text-sm text-zinc-500">
            {Number(simulation.spot) > 0 &&
            Number.isFinite(Number(simulation.expected_move))
              ? `${(
                  (Number(simulation.expected_move) /
                    Number(simulation.spot)) *
                  100
                ).toFixed(2)}%`
              : '-'}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            DTE
          </div>
          <div className="mt-2 text-3xl font-bold">
            {simulation.dte ?? '-'}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            Snapshot
          </div>
          <div className="mt-2 text-lg font-bold">
            {simulation.created_at
              ? new Date(simulation.created_at).toLocaleString()
              : '-'}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          CRPM Machines
        </div>

        {machines.length === 0 ? (
          <div className="text-sm text-zinc-500">
            No CRPM Machines found in saved result.
          </div>
        ) : (
          <div className="space-y-4">
            {machines.map((machine: any, index: number) => (
              <div
                key={index}
                className="rounded-lg border p-4"
              >
                <h3 className="text-lg font-bold">
                  {machine.name ||
                    machine.title ||
                    `Machine ${index + 1}`}
                </h3>

                <p className="mt-1 text-zinc-600">
                  {machine.description ||
                    machine.summary ||
                    machine.explanation ||
                    '-'}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Action
                    </div>
                    <div className="font-semibold">
                      {machine.action ?? '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Strike
                    </div>
                    <div className="font-semibold">
                      {machine.strike ?? '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Premium
                    </div>
                    <div className="font-semibold">
                      {machine.premium !== undefined
                        ? `$${machine.premium}`
                        : '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Max Profit
                    </div>
                    <div className="font-semibold">
                      {machine.maxProfit ??
                        machine.max_profit ??
                        '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Max Risk
                    </div>
                    <div className="font-semibold">
                      {machine.maxRisk ??
                        machine.max_risk ??
                        '-'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-zinc-500">
                  {machine.note || machine.notes || ''}
                </div>

                <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">
                  {JSON.stringify(machine, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
