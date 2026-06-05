import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const yahooFinance = new YahooFinance()

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ticker } = await req.json()

    if (!id || !ticker) {
      return NextResponse.json(
        { error: 'Missing position id or ticker' },
        { status: 400 }
      )
    }

    const quote = await yahooFinance.quote(String(ticker).toUpperCase())

    const price =
      quote.regularMarketPrice ||
      quote.postMarketPrice ||
      quote.preMarketPrice ||
      quote.regularMarketPreviousClose

    if (!price) {
      return NextResponse.json({ error: 'Price unavailable' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('portfolio')
      .update({
        market_price: Number(price),
        snapshot_time: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clerk_user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      marketPrice: Number(price),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Refresh price failed', details: error.message },
      { status: 500 }
    )
  }
}