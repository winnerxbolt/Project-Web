/**
 * Password Reset System
 * จัดการ reset tokens และการเปลี่ยนรหัสผ่าน
 */

import crypto from 'crypto'
import { readJson, writeJson } from './db'

export type PasswordResetToken = {
  token: string
  userId: string
  email: string
  createdAt: string
  expiresAt: string
  used: boolean
}

const RESET_TOKENS_PATH = 'data/password-reset-tokens.json'
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * สร้าง reset token สำหรับ user
 */
export async function createPasswordResetToken(userId: string, email: string): Promise<PasswordResetToken> {
  const tokens = (await readJson<PasswordResetToken[]>(RESET_TOKENS_PATH)) || []
  
  // ลบ tokens เก่าของ user นี้
  const filteredTokens = tokens.filter(t => t.userId !== userId || t.used)
  
  // สร้าง token ใหม่
  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS)
  
  const resetToken: PasswordResetToken = {
    token,
    userId,
    email,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false
  }
  
  filteredTokens.push(resetToken)
  await writeJson(RESET_TOKENS_PATH, filteredTokens)
  
  return resetToken
}

/**
 * ตรวจสอบและดึงข้อมูล reset token
 */
export async function validatePasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  const tokens = (await readJson<PasswordResetToken[]>(RESET_TOKENS_PATH)) || []
  
  const resetToken = tokens.find(t => t.token === token)
  
  if (!resetToken) {
    return null
  }
  
  // เช็คว่า token ถูกใช้ไปแล้วหรือยัง
  if (resetToken.used) {
    return null
  }
  
  // เช็คว่า token หมดอายุหรือยัง
  const now = new Date()
  const expiresAt = new Date(resetToken.expiresAt)
  
  if (now > expiresAt) {
    return null
  }
  
  return resetToken
}

/**
 * ทำเครื่องหมายว่า token ถูกใช้แล้ว
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  const tokens = (await readJson<PasswordResetToken[]>(RESET_TOKENS_PATH)) || []
  
  const resetToken = tokens.find(t => t.token === token)
  
  if (!resetToken) {
    return false
  }
  
  resetToken.used = true
  await writeJson(RESET_TOKENS_PATH, tokens)
  
  return true
}

/**
 * ลบ tokens ที่หมดอายุ
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const tokens = (await readJson<PasswordResetToken[]>(RESET_TOKENS_PATH)) || []
  const now = new Date()
  
  const validTokens = tokens.filter(t => {
    const expiresAt = new Date(t.expiresAt)
    return expiresAt > now
  })
  
  await writeJson(RESET_TOKENS_PATH, validTokens)
}

/**
 * สร้าง reset link สำหรับส่งให้ user
 */
export function generateResetLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/reset-password?token=${token}`
}
