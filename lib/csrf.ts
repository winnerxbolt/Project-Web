import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * CSRF Protection Middleware
 * ตรวจสอบ CSRF token สำหรับ POST, PUT, DELETE requests
 */
export async function validateCSRF(request: NextRequest) {
  const method = request.method

  // ข้าม GET และ HEAD requests
  if (method === 'GET' || method === 'HEAD') {
    return null
  }

  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get('csrf_token')
  const csrfHeader = request.headers.get('x-csrf-token')

  if (!csrfCookie || !csrfHeader) {
    return NextResponse.json(
      { error: 'Missing CSRF token' },
      { status: 403 }
    )
  }

  if (csrfCookie.value !== csrfHeader) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null // CSRF token valid
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get('csrf_token')
  return csrfCookie?.value || null
}
