import { NextResponse } from 'next/server'
import { findUserByEmail, verifyUserPassword, createSession } from '../../../../lib/server/auth'
import { 
  checkLoginRateLimit, 
  getClientIdentifier
} from '../../../../lib/security/rateLimit'
import {
  checkFailedLoginDelay,
  recordFailedLoginAttempt,
  clearFailedLoginAttempt
} from '../../../../lib/server/failedLoginAttempts'
import { isValidEmail, sanitizeString } from '../../../../lib/security/validation'
import { addSecurityHeaders, getRateLimitHeaders } from '../../../../lib/security/headers'
import { createSecureToken } from '../../../../lib/security/jwt'
import { cookies } from 'next/headers'

type Body = { email?: string; password?: string }

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req)
    
    // ตรวจสอบว่าต้อง delay หรือไม่ (หลังจาก login ผิด) - จาก Database
    const delayCheck = await checkFailedLoginDelay(clientId)
    if (!delayCheck.allowed) {
      const response = NextResponse.json(
        { 
          error: `กรุณารอ ${delayCheck.remainingSeconds} วินาที ก่อนลองอีกครั้ง`,
          remainingSeconds: delayCheck.remainingSeconds
        },
        { status: 429 }
      )
      response.headers.set('Retry-After', delayCheck.remainingSeconds.toString())
      return addSecurityHeaders(response)
    }
    
    const rateLimit = checkLoginRateLimit(clientId)
    
    if (rateLimit.limited) {
      const response = NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
      const rateLimitHeaders = getRateLimitHeaders(5, rateLimit.remaining, rateLimit.resetTime)
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return addSecurityHeaders(response)
    }

    const body = (await req.json()) as Body
    const email = body.email?.trim()
    const password = body.password

    // Input validation
    if (!email || !password) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      )
    }

    if (!isValidEmail(email)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      )
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email)

    const user = await findUserByEmail(sanitizedEmail)
    if (!user) {
      // บันทึก failed login attempt ลง database
      await recordFailedLoginAttempt(clientId)
      // Generic error message to prevent email enumeration
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      )
    }

    const ok = await verifyUserPassword(user, password)
    if (!ok) {
      // บันทึก failed login attempt ลง database
      await recordFailedLoginAttempt(clientId)
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      )
    }

    // ✅ Login สำเร็จ - ล้างข้อมูล failed attempts จาก database
    await clearFailedLoginAttempt(clientId)

    // 🔒 สร้าง Secure JWT Token (Double-signed + Encrypted Payload)
    const token = createSecureToken({
      id: user.id,
      email: user.email,
      name: sanitizeString(user.name),
      role: user.role || 'user'
    })

    // 💾 บันทึก session ลง database
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const forwarded = req.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'Unknown'
    
    await createSession(user.id, token, ipAddress, userAgent)

    const userData = { 
      id: user.id, 
      name: sanitizeString(user.name), 
      email: user.email,
      role: user.role || 'user'
    }
    
    const cookieStore = await cookies()
    
    // 🍪 Set secure cookie (httpOnly + sameSite + secure)
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 365 days
      path: '/'
    })
    
    const res = NextResponse.json({ user: userData })
    return addSecurityHeaders(res)
  } catch (err) {
    console.error('Login error:', err)
    return addSecurityHeaders(
      NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    )
  }
}