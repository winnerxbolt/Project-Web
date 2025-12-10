import { NextResponse } from 'next/server'
import { createUser, findUserByEmail, createSession } from '../../../../lib/server/auth'
import { containsProfanity } from '@/lib/profanityFilter'
import { checkMutationRateLimit, getClientIdentifier } from '../../../../lib/security/rateLimit'
import { isValidEmail, sanitizeString, isStrongPassword } from '../../../../lib/security/validation'
import { addSecurityHeaders, getRateLimitHeaders } from '../../../../lib/security/headers'

type Body = { name?: string; email?: string; password?: string }

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req)
    const rateLimit = checkMutationRateLimit(clientId)
    
    if (rateLimit.limited) {
      const response = NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
      const rateLimitHeaders = getRateLimitHeaders(30, rateLimit.remaining, rateLimit.resetTime)
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return addSecurityHeaders(response)
    }

    const body = (await req.json()) as Body
    const name = body.name?.trim()
    const email = body.email?.trim()
    const password = body.password

    // Input validation
    if (!name || !email || !password) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      )
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return addSecurityHeaders(
        NextResponse.json({ error: passwordCheck.message }, { status: 400 })
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name)
    const sanitizedEmail = sanitizeString(email)

    // Check for profanity
    if (containsProfanity(sanitizedName)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' }, { status: 400 })
      )
    }

    // Check if email already exists
    const exists = await findUserByEmail(sanitizedEmail)
    if (exists) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      )
    }

    // Create user with sanitized inputs
    const user = await createUser(sanitizedName, sanitizedEmail, password)
    const session = await createSession(user.id)

    const userData = { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role
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
    console.error('Register error:', err)
    return addSecurityHeaders(
      NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    )
  }
}