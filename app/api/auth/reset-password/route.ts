import { NextResponse } from 'next/server'
import { validatePasswordResetToken, markTokenAsUsed } from '@/lib/server/passwordReset'
import { findUserByEmail, hashPassword } from '@/lib/server/auth'
import { readJson, writeJson } from '@/lib/server/db'
import { User } from '@/lib/server/auth'
import { checkMutationRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'
import { isStrongPassword } from '@/lib/security/validation'
import { addSecurityHeaders, getRateLimitHeaders } from '@/lib/security/headers'

const USERS_PATH = 'data/users.json'

/**
 * POST /api/auth/reset-password
 * รีเซ็ตรหัสผ่านด้วย token
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
    const { token, password } = body

    // Input validation
    if (!token || !password) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
      )
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return addSecurityHeaders(
        NextResponse.json({ error: passwordCheck.message }, { status: 400 })
      )
    }

    // ตรวจสอบ token
    const resetToken = await validatePasswordResetToken(token)

    if (!resetToken) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        )
      )
    }

    // ค้นหา user
    const user = await findUserByEmail(resetToken.email)

    if (!user) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'User not found' }, { status: 404 })
      )
    }

    // Hash รหัสผ่านใหม่
    const salt = user.salt
    const hash = hashPassword(password, salt)

    // อัพเดทรหัสผ่านใน database
    const users = (await readJson<User[]>(USERS_PATH)) || []
    const userIndex = users.findIndex(u => u.id === user.id)

    if (userIndex === -1) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'User not found' }, { status: 404 })
      )
    }

    users[userIndex].hash = hash
    await writeJson(USERS_PATH, users)

    // ทำเครื่องหมายว่า token ถูกใช้แล้ว
    await markTokenAsUsed(token)

    console.log(`✅ Password reset successful for user: ${user.email}`)

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'Password has been reset successfully'
      })
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return addSecurityHeaders(
      NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    )
  }
}
