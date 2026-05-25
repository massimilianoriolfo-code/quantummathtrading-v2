'use client'

export default function PricingPage() {
  async function startCheckout() {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8 text-zinc-950">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold">
          QuantumMathTrading Pro
        </h1>

        <p className="mt-4 text-zinc-600">
          Premium access to the CRPM quantitative options simulator.
        </p>

        <div className="mt-8 text-4xl font-bold">
          €29
          <span className="text-lg font-normal text-zinc-500">
            {' '} / month
          </span>
        </div>

        <button
          onClick={startCheckout}
          className="mt-8 w-full rounded-xl bg-black px-6 py-4 font-bold text-white"
        >
          Subscribe Now
        </button>
      </div>
    </main>
  )
}