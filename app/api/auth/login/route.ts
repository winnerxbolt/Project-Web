import { NextResponse } from 'next/server'
import { findUserByEmail, verifyUserPassword, createSession } from '../../../../lib/server/auth'
import { checkLoginRateLimit, getClientIdentifier } from '../../../../lib/security/rateLimit'
import { isValidEmail, sanitizeString } from '../../../../lib/security/validation'
import { addSecurityHeaders, getRateLimitHeaders } from '../../../../lib/security/headers'

type Body = { email?: string; password?: string }

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req)
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
      // Generic error message to prevent email enumeration
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      )
    }

    const ok = await verifyUserPassword(user, password)
    if (!ok) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      )
    }

    const session = await createSession(user.id)
    const userData = { 
      id: user.id, 
      name: sanitizeString(user.name), 
      email: user.email,
      role: user.role || 'user'
    }
    
    const res = NextResponse.json({ user: userData })
    
    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production'
    res.headers.set(
      'Set-Cookie',
      `session=${session.token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict${isProduction ? '; Secure' : ''}`
    )
    
    return addSecurityHeaders(res)
  } catch (err) {
    console.error('Login error:', err)
    return addSecurityHeaders(
      NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    )
  }
}