import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySecureToken, createSecureToken } from '../../../../lib/security/jwt'

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // 🔓 Verify Secure Token (รองรับทั้งแบบเก่าและใหม่)
    const payload = verifySecureToken(token.value)
    
    if (!payload) {
      // Token ไม่ถูกต้อง - ลบ cookie เก่า
      cookieStore.delete('auth_token')
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // 🔄 Auto-upgrade: สร้าง token ใหม่ให้ user ที่ใช้ token เก่า
    const newToken = createSecureToken({
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role
    })

    // อัปเดต cookie ให้เป็นรูปแบบใหม่
    cookieStore.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 365 days
      path: '/'
    })
    
    return NextResponse.json({ 
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Session check error:', error)
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
