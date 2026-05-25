import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import ManageSubscriptionButton from './ManageSubscriptionButton'

export default async function DashboardPage() {
  const user = await currentUser()

  const isPremium =
    user?.publicMetadata?.isPremium === true

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              User Dashboard
            </h1>

            <p className="mt-2 text-zinc-600">
              Welcome to QuantumMathTrading.
            </p>
          </div>

          <UserButton />
        </div>

        <div className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-bold">
            Subscription Status
          </h2>

          <p className="mt-3">
            Status:{' '}
            <span
              className={
                isPremium
                  ? 'font-bold text-green-600'
                  : 'font-bold text-red-600'
              }
            >
              {isPremium ? 'Premium Active' : 'Free / Not Active'}
            </span>
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/simulatore-pro"
            className="rounded-2xl bg-black p-6 text-white shadow-sm transition hover:opacity-90"
          >
            <h3 className="text-xl font-bold">
              Open CRPM Simulator
            </h3>

            <p className="mt-2 text-sm text-zinc-300">
              Access the quantitative options analysis engine.
            </p>
          </Link>

          <ManageSubscriptionButton />
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
          <h2 className="text-xl font-bold">
            Coming Soon
          </h2>

          <p className="mt-2 text-zinc-600">
            Saved simulations, watchlist, portfolio history, and CRPM AI Assistant.
          </p>
        </div>
      </div>
    </main>
  )
}