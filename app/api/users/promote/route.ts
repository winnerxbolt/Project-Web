import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔼 Promoting user to admin:', userId)

    const { error } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)

    if (error) {
      console.error('❌ Error promoting user:', error)
      return NextResponse.json({ error: 'Failed to promote user', details: error.message }, { status: 500 })
    }

    console.log('✅ User promoted successfully')
    return NextResponse.json({ success: true, message: 'User promoted to admin' })
  } catch (error) {
    console.error('Error in POST /api/users/promote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
