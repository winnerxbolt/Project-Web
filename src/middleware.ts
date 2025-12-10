import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for authentication and security headers
 * Using recommended approach instead of deprecated middleware file
 */

// Protected paths that require authentication
const protectedPaths = ['/admin', '/api/admin']
const authPaths = ['/account', '/api/member']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // Get session from cookie
  const session = request.cookies.get('session')?.value
  
  // Redirect to login if no session and accessing protected paths
  if (!session && (isProtectedPath || isAuthPath)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// Matcher configuration
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
