import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Fetching users from database...')
    
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, phone, picture, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${users?.length || 0} users`)

    // Map snake_case to camelCase
    const formattedUsers = users?.map(user => ({
      id: user.id,
      name: user.name || 'ไม่ระบุ',
      email: user.email,
      role: user.role || 'user',
      phone: user.phone,
      picture: user.picture,
      isVerified: true, // Assume verified if they exist in DB
      createdAt: user.created_at,
      updatedAt: user.updated_at
    })) || []

    return NextResponse.json({ users: formattedUsers, count: formattedUsers.length })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
