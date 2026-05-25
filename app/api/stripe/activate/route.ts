import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const sessionId = body.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session id' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.client_reference_id !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      )
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      )
    }

    const client = await clerkClient()

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        isPremium: true,
        subscriptionStatus: 'active',
      },
      privateMetadata: {
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}