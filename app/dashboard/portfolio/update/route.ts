import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, quantity, averageCost, company } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing position id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('portfolio')
      .update({
        quantity: Number(quantity),
        average_cost: Number(averageCost),
        company,
      })
      .eq('id', id)
      .eq('clerk_user_id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Update position failed', details: error.message },
      { status: 500 }
    )
  }
}