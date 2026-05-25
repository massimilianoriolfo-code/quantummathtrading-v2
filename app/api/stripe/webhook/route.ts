import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function setPremiumStatus(
  clerkUserId: string,
  isPremium: boolean,
  subscriptionStatus: string,
  customerId?: string | null,
  subscriptionId?: string | null
) {
  const client = await clerkClient()

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      isPremium,
      subscriptionStatus,
    },
    privateMetadata: {
      stripeCustomerId: customerId || undefined,
      stripeSubscriptionId: subscriptionId || undefined,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const clerkUserId =
        session.client_reference_id ||
        session.metadata?.clerkUserId

      if (clerkUserId) {
        await setPremiumStatus(
          clerkUserId,
          true,
          'active',
          typeof session.customer === 'string' ? session.customer : null,
          typeof session.subscription === 'string' ? session.subscription : null
        )
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const clerkUserId = subscription.metadata?.clerkUserId

      if (clerkUserId) {
        const isActive =
          subscription.status === 'active' ||
          subscription.status === 'trialing'

        await setPremiumStatus(
          clerkUserId,
          isActive,
          subscription.status,
          typeof subscription.customer === 'string'
            ? subscription.customer
            : null,
          subscription.id
        )
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const clerkUserId = subscription.metadata?.clerkUserId

      if (clerkUserId) {
        await setPremiumStatus(
          clerkUserId,
          false,
          'canceled',
          typeof subscription.customer === 'string'
            ? subscription.customer
            : null,
          subscription.id
        )
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription

      if (typeof subscriptionId === 'string') {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId)

        const clerkUserId = subscription.metadata?.clerkUserId

        if (clerkUserId) {
          await setPremiumStatus(
            clerkUserId,
            false,
            'payment_failed',
            typeof subscription.customer === 'string'
              ? subscription.customer
              : null,
            subscription.id
          )
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}