import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Fetching system settings')

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('system_key', { ascending: true })

    if (error) {
      console.error('❌ Error fetching system settings:', error)
      return NextResponse.json({ error: 'Failed to fetch system settings', details: error.message }, { status: 500 })
    }

    console.log('✅ Found', data?.length || 0, 'system settings')

    // Convert snake_case to camelCase
    const settings = data?.map(setting => ({
      id: setting.id,
      systemKey: setting.system_key,
      systemName: setting.system_name,
      description: setting.description,
      isEnabled: setting.is_enabled,
      createdAt: setting.created_at,
      updatedAt: setting.updated_at
    })) || []

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { systemKey, isEnabled } = await request.json()

    if (!systemKey || typeof isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'System key and isEnabled are required' }, { status: 400 })
    }

    console.log('🔄 Updating system setting:', systemKey, '→', isEnabled)

    const { error } = await supabaseAdmin
      .from('system_settings')
      .update({ is_enabled: isEnabled })
      .eq('system_key', systemKey)

    if (error) {
      console.error('❌ Error updating system setting:', error)
      return NextResponse.json({ error: 'Failed to update system setting', details: error.message }, { status: 500 })
    }

    console.log('✅ System setting updated successfully')
    return NextResponse.json({ success: true, message: 'System setting updated' })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
