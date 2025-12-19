// middleware.ts - Enhanced Security Middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCSPHeaders, getHSTSHeader } from './lib/security/contentSecurityPolicy'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add Security Headers
  const securityHeaders = {
    ...getCSPHeaders(),
    ...getHSTSHeader(),
    'X-DNS-Prefetch-Control': 'on',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none'
  }
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // CSRF Protection: ตรวจสอบ Origin header สำหรับ state-changing requests
  const method = request.method
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // อนุญาตเฉพาะ same-origin requests
    if (origin && !origin.includes(host || '')) {
      // ยกเว้น API routes ที่ต้องการ CORS
      if (!request.nextUrl.pathname.startsWith('/api/webhook')) {
        return new NextResponse('CSRF validation failed', { status: 403 })
      }
    }
  }
  
  // ป้องกัน Directory Listing
  if (request.nextUrl.pathname.endsWith('/')) {
    // ไม่อนุญาตให้ list directories
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
