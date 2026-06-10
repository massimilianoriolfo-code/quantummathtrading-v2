import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function SimulationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { data: simulation } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('id', params.id)
    .eq('clerk_user_id', userId)
    .single()

  if (!simulation) {
    redirect('/dashboard/simulations')
  }

  const result = simulation.result || {}

  const machines = result.machines || []

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
            {Number(simulation.iv).toFixed(2)}%
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
            {(
              (Number(simulation.expected_move) /
                Number(simulation.spot)) *
              100
            ).toFixed(2)}
            %
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            DTE
          </div>
          <div className="mt-2 text-3xl font-bold">
            {simulation.dte}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="text-xs uppercase text-zinc-400">
            Snapshot
          </div>
          <div className="mt-2 text-lg font-bold">
            {new Date(
              simulation.created_at
            ).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          CRPM Machines
        </div>

        <div className="space-y-4">
          {machines.map(
            (machine: any, index: number) => (
              <div
                key={index}
                className="rounded-lg border p-4"
              >
                <h3 className="text-lg font-bold">
                  {machine.name}
                </h3>

                <p className="mt-1 text-zinc-600">
                  {machine.description}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Action
                    </div>
                    <div className="font-semibold">
                      {machine.action}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Strike
                    </div>
                    <div className="font-semibold">
                      {machine.strike}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Premium
                    </div>
                    <div className="font-semibold">
                      ${machine.premium}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Max Profit
                    </div>
                    <div className="font-semibold">
                      {machine.maxProfit}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase text-zinc-400">
                      Max Risk
                    </div>
                    <div className="font-semibold">
                      {machine.maxRisk}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-zinc-500">
                  {machine.note}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}