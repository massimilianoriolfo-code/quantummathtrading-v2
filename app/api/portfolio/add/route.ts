import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

    const ticker = body.ticker?.toUpperCase()
    const company = body.company || ''
    const quantity = Number(body.quantity)
    const averageCost = Number(body.averageCost)

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker missing' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('portfolio')
      .insert({
        clerk_user_id: userId,
        ticker,
        company,
        quantity,
        average_cost: averageCost,
      })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Portfolio add error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}