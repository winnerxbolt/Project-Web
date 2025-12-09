import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import type { SocialConfig } from '@/types/social'

const CONFIG_FILE = 'data/social-config.json'

// GET - Read social config
export async function GET() {
  try {
    const config = await readJson<SocialConfig>(CONFIG_FILE) || {
      facebook: { appId: '', appSecret: '', pageId: '' },
      instagram: { accessToken: '', userId: '' },
      google: { clientId: '', clientSecret: '' },
      line: { channelId: '' }
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

    await writeJson(CONFIG_FILE, config)

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
