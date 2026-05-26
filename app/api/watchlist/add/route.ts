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

    const ticker =
      body.ticker?.toUpperCase()

    const company =
      body.company || ''

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker missing' },
        { status: 400 }
      )
    }

    const { error } =
      await supabaseAdmin
        .from('watchlist')
        .insert({
          clerk_user_id: userId,
          ticker,
          company
        })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {

    return NextResponse.json(
      {
        error: 'Watchlist error',
        details: error.message
      },
      { status: 500 }
    )
  }
}