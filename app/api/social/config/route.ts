import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { SocialConfig } from '@/types/social'

// GET - Read social config
export async function GET() {
  try {
    const { data: config, error } = await supabase
      .from('social_config')
      .select('*')
      .single()

    if (error) {
      // If no config exists, return default
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          config: {
            facebook: { appId: '', appSecret: '', pageId: '' },
            instagram: { accessToken: '', userId: '' },
            google: { clientId: '', clientSecret: '' },
            line: { channelId: '' }
          }
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Failed to read social config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to read config' },
      { status: 500 }
    )
  }
}

// POST - Update social config
export async function POST(request: Request) {
  try {
    const config = await request.json()

    // Try to update, if not exists, insert
    const { data: existing } = await supabase
      .from('social_config')
      .select('id')
      .single()

    let result
    if (existing) {
      result = await supabaseAdmin
        .from('social_config')
        .update(config)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabaseAdmin
        .from('social_config')
        .insert(config)
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      message: 'Config updated successfully'
    })
  } catch (error) {
    console.error('Failed to update social config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update config' },
      { status: 500 }
    )
  }
}
