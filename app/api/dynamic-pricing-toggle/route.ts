import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'dynamic-pricing-settings.json')

interface DynamicPricingSettings {
  enabled: boolean
  lastUpdated: string
  updatedBy: string
}

// GET - ดึงสถานะ Dynamic Pricing
export async function GET() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8')
    const settings: DynamicPricingSettings = JSON.parse(data)
    
    return NextResponse.json({
      success: true,
      enabled: settings.enabled,
      lastUpdated: settings.lastUpdated
    })
  } catch (error) {
    // ถ้าไฟล์ไม่มี ให้เปิดเป็นค่าเริ่มต้น
    return NextResponse.json({
      success: true,
      enabled: true,
      lastUpdated: new Date().toISOString()
    })
  }
}

// POST - เปิด/ปิด Dynamic Pricing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled must be boolean' },
        { status: 400 }
      )
    }
    
    const settings: DynamicPricingSettings = {
      enabled,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    }
    
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    
    return NextResponse.json({
      success: true,
      message: `Dynamic Pricing ${enabled ? 'เปิด' : 'ปิด'} แล้ว`,
      enabled: settings.enabled,
      lastUpdated: settings.lastUpdated
    })
  } catch (error) {
    console.error('Error toggling dynamic pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
