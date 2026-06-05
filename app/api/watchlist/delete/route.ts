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

    const id = body.id

    if (!id) {
      return NextResponse.json(
        { error: 'Missing watchlist id' },
        { status: 400 }
      )
    }

    const { error } =
      await supabaseAdmin
        .from('watchlist')
        .delete()
        .eq('id', id)
        .eq('clerk_user_id', userId)

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
        error: 'Delete error',
        details: error.message
      },
      { status: 500 }
    )
  }
}