import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } =
      await supabaseAdmin
        .from('watchlist')
        .select('id, ticker, company, created_at')
        .eq('clerk_user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      watchlist: data
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Watchlist list error',
        details: error.message
      },
      { status: 500 }
    )
  }
}