import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔽 Demoting user to regular user:', userId)

    const { error } = await supabaseAdmin
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId)

    if (error) {
      console.error('❌ Error demoting user:', error)
      return NextResponse.json({ error: 'Failed to demote user', details: error.message }, { status: 500 })
    }

    console.log('✅ User demoted successfully')
    return NextResponse.json({ success: true, message: 'User demoted from admin' })
  } catch (error) {
    console.error('Error in POST /api/users/demote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
