/**
 * Input Validation & Sanitization
 * ป้องกัน XSS, SQL Injection, และ input attacks อื่นๆ
 */

/**
 * Sanitize string input - ลบ HTML tags และ special characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // ลบ < >
    .replace(/javascript:/gi, '') // ลบ javascript: protocol
    .replace(/on\w+=/gi, '') // ลบ event handlers
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate password strength
 * - อย่างน้อย 8 ตัวอักษร
 * - มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
 * - มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว
 * - มีตัวเลขอย่างน้อย 1 ตัว
 */
export function isStrongPassword(password: string): {
  valid: boolean
  message?: string
} {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string' }
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password is too long (max 128 characters)' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }

  return { valid: true }
}

/**
 * Validate phone number (Thai format)
 */
export function isValidThaiPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Thai phone: 0X-XXXX-XXXX (10 digits starting with 0)
  const thaiPhoneRegex = /^0[0-9]{9}$/
  return thaiPhoneRegex.test(cleaned)
}

/**
 * Validate date string (ISO format)
 */
export function isValidDate(dateString: string): boolean {
  if (typeof dateString !== 'string') return false
  
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max
}

/**
 * Sanitize filename - ป้องกัน path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return ''
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // เก็บเฉพาะ alphanumeric และ . _ -
    .replace(/\.{2,}/g, '.') // ป้องกัน ../
    .replace(/^\.+/, '') // ลบ . ที่ต้นชื่อ
    .substring(0, 255) // จำกัดความยาว
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (typeof uuid !== 'string') return false
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate Thai National ID (13 digits)
 */
export function isValidThaiNationalID(id: string): boolean {
  if (typeof id !== 'string') return false
  
  // Remove spaces and dashes
  const cleaned = id.replace(/[\s-]/g, '')
  
  // Must be 13 digits
  if (!/^\d{13}$/.test(cleaned)) return false
  
  // Validate checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }
  const checksum = (11 - (sum % 11)) % 10
  
  return checksum === parseInt(cleaned[12])
}

/**
 * Sanitize object - ลบ properties ที่ไม่ต้องการ
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[]
): Partial<T> {
  const sanitized: Partial<T> = {}
  
  allowedKeys.forEach(key => {
    if (key in obj) {
      sanitized[key as keyof T] = obj[key]
    }
  })
  
  return sanitized
}

/**
 * Validate booking date range
 */
export function isValidBookingDateRange(
  checkIn: string,
  checkOut: string
): { valid: boolean; message?: string } {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return { valid: false, message: 'Invalid date format' }
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check-in ต้องไม่เป็นอดีต
  if (checkInDate < today) {
    return { valid: false, message: 'Check-in date cannot be in the past' }
  }

  // Check-out ต้องหลัง check-in
  if (checkOutDate <= checkInDate) {
    return { valid: false, message: 'Check-out date must be after check-in date' }
  }

  // จำกัดระยะเวลาจองไม่เกิน 90 วัน
  const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > 90) {
    return { valid: false, message: 'Booking duration cannot exceed 90 days' }
  }

  return { valid: true }
}

/**
 * Validate price/amount
 */
export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && 
         amount >= 0 && 
         amount < Number.MAX_SAFE_INTEGER &&
         !isNaN(amount) &&
         isFinite(amount)
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return ''
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (typeof cardNumber !== 'string') return false
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '')
  
  // Must be 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) return false
  
  // Luhn algorithm
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}
