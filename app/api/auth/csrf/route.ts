import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(_request: NextRequest) {
  try {
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex')
    
    const cookieStore = await cookies()
    
    // Set CSRF token in httpOnly cookie
    cookieStore.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({ 
      csrfToken 
    }, { status: 200 })
  } catch (error) {
    console.error('CSRF generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate CSRF token' 
    }, { status: 500 })
  }
}
