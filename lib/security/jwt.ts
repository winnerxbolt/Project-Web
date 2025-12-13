/**
 * 🔐 SECURE JWT MANAGER
 * จัดการ JWT แบบปลอดภัย พร้อมการเข้ารหัส payload
 */

import jwt from 'jsonwebtoken'
import { encryptJWTPayload, decryptJWTPayload, generateSecureToken } from './encryption'

// JWT Secrets (หลายชั้น)
const JWT_SECRET_PRIMARY = process.env.JWT_SECRET || 'WinnerBoy-JWT-Primary-Secret-2025'
const JWT_SECRET_SECONDARY = process.env.JWT_SECRET_SECONDARY || 'WinnerBoy-JWT-Secondary-Secret-2025'
const JWT_ISSUER = 'winnerboy-resort'
const JWT_AUDIENCE = 'winnerboy-users'

interface TokenPayload {
  id: string
  email: string
  name: string
  role: string
}

/**
 * 🔒 สร้าง JWT Token แบบหลายชั้น
 * 1. Encrypt payload with AES
 * 2. Sign with JWT (Primary Secret)
 * 3. Add fingerprint
 */
export function createSecureToken(payload: TokenPayload): string {
  try {
    // เพิ่ม fingerprint (random token)
    const fingerprint = generateSecureToken(32)
    
    // Encrypt payload
    const encryptedPayload = encryptJWTPayload({
      ...payload,
      fp: fingerprint, // fingerprint
      iat: Date.now(),
      ver: '2.0' // version
    })

    // สร้าง JWT ด้วย encrypted payload
    const token = jwt.sign(
      {
        data: encryptedPayload,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE
      },
      JWT_SECRET_PRIMARY,
      {
        expiresIn: '365d',
        algorithm: 'HS256'
      }
    )

    // Double-sign (ชั้นที่ 2)
    const doubleSignedToken = jwt.sign(
      { token },
      JWT_SECRET_SECONDARY,
      { expiresIn: '365d' }
    )

    return doubleSignedToken
  } catch (error) {
    console.error('Token creation error:', error)
    throw new Error('Failed to create secure token')
  }
}

/**
 * 🔓 ตรวจสอบและถอดรหัส JWT Token
 * รองรับทั้ง token แบบใหม่ (double-signed) และแบบเก่า (single-signed)
 */
export function verifySecureToken(token: string): TokenPayload | null {
  try {
    // พยายาม Verify แบบใหม่ (Double-sign) ก่อน
    try {
      const decoded2 = jwt.verify(token, JWT_SECRET_SECONDARY) as any
      
      if (decoded2 && decoded2.token) {
        // Verify ชั้นที่ 1 (Primary sign)
        const decoded1 = jwt.verify(decoded2.token, JWT_SECRET_PRIMARY) as any

        if (decoded1 && decoded1.data) {
          // Verify issuer and audience
          if (decoded1.iss === JWT_ISSUER && decoded1.aud === JWT_AUDIENCE) {
            // Decrypt payload
            const decryptedPayload = decryptJWTPayload(decoded1.data)

            if (decryptedPayload && decryptedPayload.ver === '2.0') {
              return {
                id: decryptedPayload.id,
                email: decryptedPayload.email,
                name: decryptedPayload.name,
                role: decryptedPayload.role
              }
            }
          }
        }
      }
    } catch (newTokenError) {
      // Token แบบใหม่ verify ไม่ผ่าน ลอง fallback เป็นแบบเก่า
      console.log('New token format failed, trying old format...')
    }

    // Fallback: ลอง verify แบบเก่า (single-signed)
    try {
      const decoded = jwt.verify(token, JWT_SECRET_PRIMARY) as any
      
      if (decoded && decoded.id) {
        console.log('Using old token format - will upgrade on next login')
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      }
    } catch (oldTokenError) {
      console.log('Old token format also failed')
    }

    return null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * 🔄 Refresh Token
 */
export function refreshToken(oldToken: string): string | null {
  try {
    const payload = verifySecureToken(oldToken)
    
    if (!payload) {
      return null
    }

    // สร้าง token ใหม่
    return createSecureToken(payload)
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

/**
 * 🕐 Get Token Expiry Time
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any
    return decoded?.exp || null
  } catch (error) {
    return null
  }
}
