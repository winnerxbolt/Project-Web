// lib/security/contentSecurityPolicy.ts
/**
 * Content Security Policy (CSP) Headers
 * ป้องกัน XSS, Clickjacking, และ Code Injection
 */

export function getCSPHeaders(): Record<string, string> {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://connect.facebook.net https://www.youtube.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' https: data:",
    "connect-src 'self' https://*.supabase.co https://accounts.google.com https://www.facebook.com wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com https://www.facebook.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')

  return {
    'Content-Security-Policy': cspDirectives,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

/**
 * ป้องกัน Clickjacking
 */
export function preventClickjacking(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "frame-ancestors 'none'"
  }
}

/**
 * HTTPS Strict Transport Security
 */
export function getHSTSHeader(): Record<string, string> {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
}
