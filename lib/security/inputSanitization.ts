// lib/security/inputSanitization.ts
/**
 * ระบบทำความสะอาด Input ขั้นสูง
 * ป้องกัน XSS, SQL Injection, และ Code Injection
 */

/**
 * ทำความสะอาด HTML tags ออกจาก string
 */
export function stripHtmlTags(input: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
  if (!input) return ''
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * ทำความสะอาด SQL special characters
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return ''
  // ลบ special characters ที่อันตราย
  return input
    .replace(/['";\\]/g, '') // เอา quotes และ backslash ออก
    .replace(/--/g, '') // เอา SQL comments ออก
    .replace(/\/\*/g, '') // เอา multi-line comments ออก
    .replace(/\*\//g, '')
    .trim()
}

/**
 * Validate และ sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  // เอาเฉพาะตัวอักษร ตัวเลข และ special chars ที่ valid ใน email
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '')
    .trim()
}

/**
 * Validate และ sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return ''
  // เอาเฉพาะตัวเลข, +, -, (, )
  return phone.replace(/[^0-9+\-()]/g, '').trim()
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  try {
    const parsedUrl = new URL(url)
    // อนุญาตเฉพาะ http, https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return ''
    }
    return parsedUrl.href
  } catch {
    return ''
  }
}

/**
 * ป้องกัน Path Traversal
 */
export function sanitizeFilePath(path: string): string {
  if (!path) return ''
  // ลบ ../ และ special characters ที่อันตราย
  return path
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\\/g, '/')
    .trim()
}

/**
 * Sanitize JSON string
 */
export function sanitizeJson(input: string): string {
  if (!input) return ''
  
  try {
    // พยายาม parse เพื่อ validate
    const parsed = JSON.parse(input)
    // ส่งกลับเป็น JSON string ที่ clean
    return JSON.stringify(parsed)
  } catch {
    // ถ้า parse ไม่ได้ แปลว่า invalid JSON
    return ''
  }
}

/**
 * ลบ JavaScript ออกจาก string
 */
export function removeJavaScript(input: string): string {
  if (!input) return ''
  
  const dangerousPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ]
  
  let cleaned = input
  dangerousPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })
  
  return cleaned
}

/**
 * Validate integer input
 */
export function sanitizeInteger(input: any): number | null {
  const num = parseInt(String(input), 10)
  if (isNaN(num)) return null
  return num
}

/**
 * Validate float input
 */
export function sanitizeFloat(input: any): number | null {
  const num = parseFloat(String(input))
  if (isNaN(num)) return null
  return num
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input
  if (input === 'true' || input === '1' || input === 1) return true
  return false
}

/**
 * ทำความสะอาด array
 */
export function sanitizeArray<T>(
  input: any[],
  sanitizer: (item: any) => T
): T[] {
  if (!Array.isArray(input)) return []
  return input.map(sanitizer).filter(item => item != null)
}

/**
 * Validate และ sanitize credit card number
 */
export function sanitizeCreditCard(cardNumber: string): string {
  if (!cardNumber) return ''
  // เอาเฉพาะตัวเลข
  return cardNumber.replace(/[^0-9]/g, '').trim()
}

/**
 * Sanitize user input สำหรับ search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return ''
  
  // ลบ special regex characters
  return query
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .trim()
    .substring(0, 100) // จำกัดความยาว
}

/**
 * ป้องกัน NoSQL Injection
 */
export function sanitizeNoSqlInput(input: any): any {
  if (typeof input === 'string') {
    return input
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeNoSqlInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(input)) {
      // ลบ MongoDB operators
      if (!key.startsWith('$')) {
        cleaned[key] = sanitizeNoSqlInput(value)
      }
    }
    return cleaned
  }
  
  return input
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean
    maxLength?: number
    type?: 'text' | 'email' | 'phone' | 'url' | 'number'
  } = {}
): string {
  if (!input) return ''
  
  let sanitized = String(input).trim()
  
  // Remove HTML tags unless explicitly allowed
  if (!options.allowHtml) {
    sanitized = stripHtmlTags(sanitized)
    sanitized = removeJavaScript(sanitized)
  }
  
  // Type-specific sanitization
  switch (options.type) {
    case 'email':
      sanitized = sanitizeEmail(sanitized)
      break
    case 'phone':
      sanitized = sanitizePhoneNumber(sanitized)
      break
    case 'url':
      sanitized = sanitizeUrl(sanitized)
      break
    case 'number':
      sanitized = String(sanitizeInteger(sanitized) || 0)
      break
  }
  
  // Limit length
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }
  
  return sanitized
}
