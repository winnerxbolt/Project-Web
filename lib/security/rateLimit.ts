/**
 * Rate Limiting Middleware
 * ป้องกัน brute force attacks และ DDoS
 */

type RateLimitStore = {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// ทำความสะอาด store ทุก 15 นาที
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 15 * 60 * 1000)

export interface RateLimitConfig {
  windowMs?: number // เวลาหน้าต่าง (default: 15 นาที)
  maxRequests?: number // จำนวน requests สูงสุด (default: 100)
}

/**
 * ตรวจสอบ rate limit
 * @returns true ถ้าเกิน limit, false ถ้ายังไม่เกิน
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { limited: boolean; remaining: number; resetTime: number } {
  const windowMs = config.windowMs || 15 * 60 * 1000 // 15 minutes
  const maxRequests = config.maxRequests || 100
  const now = Date.now()

  if (!store[identifier] || store[identifier].resetTime < now) {
    // สร้าง window ใหม่
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs
    }
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetTime: store[identifier].resetTime
    }
  }

  // เพิ่ม count
  store[identifier].count++

  const limited = store[identifier].count > maxRequests
  const remaining = Math.max(0, maxRequests - store[identifier].count)

  return {
    limited,
    remaining,
    resetTime: store[identifier].resetTime
  }
}

/**
 * Rate limit สำหรับ login attempts
 * เข้มงวดกว่า: 5 ครั้งต่อ 15 นาที
 */
export function checkLoginRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts
  })
}

/**
 * Rate limit สำหรับ API calls ทั่วไป
 * 100 requests ต่อ 15 นาที
 */
export function checkApiRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  })
}

/**
 * Rate limit สำหรับการสร้างข้อมูล (POST/PUT/DELETE)
 * เข้มงวดกว่า: 30 ครั้งต่อ 15 นาที
 */
export function checkMutationRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30
  })
}

/**
 * ดึง IP address จาก request
 */
export function getClientIdentifier(request: Request): string {
  // ลองดึง IP จาก headers ต่างๆ
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cloudflare = request.headers.get('cf-connecting-ip')
  
  if (cloudflare) return cloudflare
  if (forwarded) return forwarded.split(',')[0].trim()
  if (real) return real
  
  // Fallback: ใช้ user agent + language เป็น identifier
  const ua = request.headers.get('user-agent') || 'unknown'
  const lang = request.headers.get('accept-language') || 'unknown'
  return `${ua}-${lang}`.substring(0, 100)
}

/**
 * Reset rate limit สำหรับ identifier นั้นๆ
 */
export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}
