// lib/security/apiKeyProtection.ts
/**
 * ป้องกัน API Keys และ Secrets ที่สำคัญ
 */

/**
 * ตรวจสอบว่า API key ถูก expose หรือไม่
 */
export function validateApiKeyUsage() {
  // ตรวจสอบว่า Service Role Key ไม่ถูกใช้ใน client-side
  if (typeof window !== 'undefined') {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      console.error('⚠️ SECURITY WARNING: Service role key should never be used on client-side!')
      throw new Error('Service role key exposed on client-side')
    }
  }
}

/**
 * Mask sensitive data สำหรับ logging
 */
export function maskSensitiveData(data: string): string {
  if (!data || data.length < 8) return '***'
  return data.substring(0, 4) + '***' + data.substring(data.length - 4)
}

/**
 * ตรวจสอบว่า environment variables ครบหรือไม่
 */
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const serverRequired = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  // Client-side check
  if (typeof window !== 'undefined') {
    const missing = required.filter(key => !process.env[key])
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing)
      return false
    }
  } else {
    // Server-side check
    const missing = [...required, ...serverRequired].filter(key => !process.env[key])
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing)
      return false
    }
  }
  
  return true
}

/**
 * ซ่อน API keys ใน logs
 */
export function sanitizeLog(message: any): any {
  if (typeof message === 'string') {
    // ซ่อน API keys, tokens, passwords
    return message
      .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/g, 'Bearer [REDACTED]')
      .replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=[REDACTED]')
      .replace(/token[=:]\s*[\w-]+/gi, 'token=[REDACTED]')
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/secret[=:]\s*\S+/gi, 'secret=[REDACTED]')
  }
  
  if (typeof message === 'object' && message !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(message)) {
      if (['password', 'token', 'secret', 'api_key', 'apiKey'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeLog(value)
      }
    }
    return sanitized
  }
  
  return message
}
