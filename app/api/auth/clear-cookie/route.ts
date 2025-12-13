import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 🗑️ Clear Auth Cookie - สำหรับลบ token เก่าที่มีปัญหา
 */
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // ลบ auth cookie
    cookieStore.delete('auth_token')
    cookieStore.delete('csrf_token')

    return NextResponse.json({ 
      success: true,
      message: 'Auth cookie cleared successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Clear cookie error:', error)
    return NextResponse.json({ 
      error: 'Failed to clear cookie' 
    }, { status: 500 })
  }
}
