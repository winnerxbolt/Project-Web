import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/server/auth'
import { createPasswordResetToken, generateResetLink } from '@/lib/server/passwordReset'
import { checkMutationRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'
import { isValidEmail, sanitizeString } from '@/lib/security/validation'
import { addSecurityHeaders, getRateLimitHeaders } from '@/lib/security/headers'

/**
 * POST /api/auth/forgot-password
 * ส่ง reset password link ไปยัง email
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = checkMutationRateLimit(clientId)
    
    if (rateLimit.limited) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      const rateLimitHeaders = getRateLimitHeaders(30, rateLimit.remaining, rateLimit.resetTime)
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return addSecurityHeaders(response)
    }

    const body = await request.json()
    const email = body.email?.trim()

    // Input validation
    if (!email) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Email is required' }, { status: 400 })
      )
    }

    if (!isValidEmail(email)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      )
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email)

    // ค้นหา user (ไม่บอก error กรณีไม่เจอ เพื่อป้องกัน email enumeration)
    const user = await findUserByEmail(sanitizedEmail)

    // ส่ง success response เสมอ แม้ไม่เจอ user (security best practice)
    if (!user) {
      // Log แต่ไม่บอก user
      console.log(`Password reset requested for non-existent email: ${sanitizedEmail}`)
      
      return addSecurityHeaders(
        NextResponse.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        })
      )
    }

    // สร้าง reset token
    const resetToken = await createPasswordResetToken(user.id, user.email)
    const resetLink = generateResetLink(resetToken.token)

    // ในโปรเจคจริงควรส่ง email
    // สำหรับ demo ให้ log ไว้ใน console
    console.log('='.repeat(60))
    console.log('🔐 PASSWORD RESET REQUEST')
    console.log('='.repeat(60))
    console.log('User:', user.name)
    console.log('Email:', user.email)
    console.log('Reset Link:', resetLink)
    console.log('Token expires in: 1 hour')
    console.log('='.repeat(60))

    // TODO: ส่ง email จริง (ถ้ามีการตั้งค่า SMTP)
    // await sendPasswordResetEmail(user.email, user.name, resetLink)

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        // เฉพาะ development mode ให้แสดง link
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      })
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return addSecurityHeaders(
      NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    )
  }
}
