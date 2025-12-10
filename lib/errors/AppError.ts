/**
 * Centralized Error Handling
 * จัดการ error แบบรวมศูนย์และป้องกันการเปิดเผยข้อมูลที่ละเอียดอ่อน
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message)
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message)
  }
}

/**
 * Format error response สำหรับ production
 * ซ่อนรายละเอียดที่ละเอียดอ่อน
 */
export function formatErrorResponse(error: unknown) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // ถ้าเป็น AppError ที่เรา throw เอง
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      ...(isProduction ? {} : { stack: error.stack })
    }
  }
  
  // ถ้าเป็น Error ทั่วไป
  if (error instanceof Error) {
    // ใน production ไม่แสดง error message จริง
    return {
      error: isProduction ? 'An error occurred' : error.message,
      statusCode: 500,
      ...(isProduction ? {} : { stack: error.stack })
    }
  }
  
  // Unknown error
  return {
    error: 'An unexpected error occurred',
    statusCode: 500
  }
}

/**
 * Log error อย่างปลอดภัย (ไม่ log sensitive data)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const errorInfo = formatErrorResponse(error)
  
  console.error('Error:', {
    timestamp,
    ...errorInfo,
    context: sanitizeContext(context)
  })
}

/**
 * ลบข้อมูลที่ละเอียดอ่อนออกจาก context ก่อน log
 */
function sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
  if (!context) return undefined
  
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn']
  const sanitized = { ...context }
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    }
  })
  
  return sanitized
}

/**
 * Wrapper สำหรับ API route handlers
 * จัดการ error แบบ centralized
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      logError(error)
      throw error
    }
  }
}
