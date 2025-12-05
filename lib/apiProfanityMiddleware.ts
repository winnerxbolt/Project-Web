import { NextResponse } from 'next/server'
import { containsProfanity } from './profanityFilter'

/**
 * Middleware to check for profanity in API request body
 * Use this in API routes that accept user input
 */
export async function checkProfanityInBody(req: Request): Promise<NextResponse | null> {
  try {
    const body = await req.json()
    
    // Check all string fields in the body
    const checkFields = (obj: any, parentKey = ''): string | null => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = parentKey ? `${parentKey}.${key}` : key
        
        if (typeof value === 'string' && containsProfanity(value)) {
          // Translate common field names to Thai
          const fieldNames: Record<string, string> = {
            name: 'ชื่อ',
            email: 'อีเมล',
            message: 'ข้อความ',
            comment: 'ความคิดเห็น',
            description: 'คำอธิบาย',
            guestName: 'ชื่อผู้เข้าพัก',
            roomName: 'ชื่อห้อง',
            location: 'ที่ตั้ง',
            note: 'หมายเหตุ',
            discountReason: 'เหตุผลการลดราคา',
            reason: 'เหตุผล'
          }
          
          const fieldNameThai = fieldNames[key] || fieldPath
          return fieldNameThai
        }
        
        // Recursively check nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const nestedResult = checkFields(value, fieldPath)
          if (nestedResult) return nestedResult
        }
        
        // Check arrays
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] === 'string' && containsProfanity(value[i])) {
              return `${fieldPath}[${i}]`
            }
            if (value[i] && typeof value[i] === 'object') {
              const nestedResult = checkFields(value[i], `${fieldPath}[${i}]`)
              if (nestedResult) return nestedResult
            }
          }
        }
      }
      return null
    }
    
    const profaneField = checkFields(body)
    if (profaneField) {
      return NextResponse.json(
        { 
          error: `${profaneField}มีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม`,
          field: profaneField
        }, 
        { status: 400 }
      )
    }
    
    return null // No profanity found
  } catch (error) {
    // If JSON parsing fails, let the route handler deal with it
    return null
  }
}
