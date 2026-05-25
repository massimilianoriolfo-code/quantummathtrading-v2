'use client'

export default function ManageSubscriptionButton() {
  async function openPortal() {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Unable to open customer portal.')
    }
  }

  return (
    <button
      onClick={openPortal}
      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left shadow-sm transition hover:bg-zinc-100"
    >
      <h3 className="text-xl font-bold">
        Manage Subscription
      </h3>

      <p className="mt-2 text-sm text-zinc-600">
        Update payment method, view invoices, or cancel your subscription.
      </p>
    </button>
  )
}