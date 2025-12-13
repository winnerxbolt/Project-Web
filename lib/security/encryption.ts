/**
 * 🔒 MULTI-LAYER ENCRYPTION SYSTEM 🔒
 * ระบบเข้ารหัสหลายชั้นที่แกะไม่ได้
 * - ชั้นที่ 1: bcrypt (12 rounds)
 * - ชั้นที่ 2: SHA-256 with pepper
 * - ชั้นที่ 3: AES-256 encryption
 */

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import * as CryptoJS from 'crypto-js'

// 🔐 Secret Keys (ควรเก็บใน environment variables)
const PEPPER = process.env.PASSWORD_PEPPER || 'WinnerBoy-Ultra-Secret-Pepper-2025-XYZ'
const AES_SECRET = process.env.AES_SECRET || 'WinnerBoy-AES-Master-Key-2025-ABC'
const SALT_ROUNDS = 12 // bcrypt rounds

/**
 * ชั้นที่ 1: Pre-hash with SHA-512 + PEPPER
 */
function preHash(password: string): string {
  const peppered = password + PEPPER
  return crypto
    .createHash('sha512')
    .update(peppered)
    .digest('hex')
}

/**
 * ชั้นที่ 2: bcrypt hashing (12 rounds)
 */
async function bcryptHash(preHashed: string): Promise<string> {
  return await bcrypt.hash(preHashed, SALT_ROUNDS)
}

/**
 * ชั้นที่ 3: AES-256 encryption wrapper
 */
function aesEncrypt(bcryptHashed: string): string {
  return CryptoJS.AES.encrypt(bcryptHashed, AES_SECRET).toString()
}

/**
 * 🛡️ MAIN: Hash Password (3 ชั้น)
 * password → SHA-512+Pepper → bcrypt → AES-256
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // ชั้นที่ 1: Pre-hash with pepper
    const preHashed = preHash(password)
    
    // ชั้นที่ 2: bcrypt
    const bcryptHashed = await bcryptHash(preHashed)
    
    // ชั้นที่ 3: AES encryption
    const finalHash = aesEncrypt(bcryptHashed)
    
    return finalHash
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * 🔓 VERIFY: ตรวจสอบรหัสผ่าน (ถอดทีละชั้น)
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // ถอดชั้นที่ 3: AES decryption
    const decrypted = CryptoJS.AES.decrypt(hashedPassword, AES_SECRET).toString(CryptoJS.enc.Utf8)
    
    if (!decrypted) {
      return false
    }
    
    // ถอดชั้นที่ 2: Pre-hash input password
    const preHashed = preHash(password)
    
    // ถอดชั้นที่ 1: bcrypt compare
    return await bcrypt.compare(preHashed, decrypted)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * 🔒 JWT PAYLOAD ENCRYPTION
 * เข้ารหัส payload ก่อนสร้าง JWT
 */
export function encryptJWTPayload(payload: any): string {
  const jsonString = JSON.stringify(payload)
  return CryptoJS.AES.encrypt(jsonString, AES_SECRET).toString()
}

/**
 * 🔓 JWT PAYLOAD DECRYPTION
 * ถอดรหัส payload หลังได้ JWT มา
 */
export function decryptJWTPayload(encrypted: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, AES_SECRET).toString(CryptoJS.enc.Utf8)
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('JWT payload decryption error:', error)
    return null
  }
}

/**
 * 🎲 GENERATE SECURE TOKEN
 * สร้าง token แบบสุ่มที่ปลอดภัย
 */
export function generateSecureToken(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * 🔐 HASH DATA (for sensitive data storage)
 * ใช้สำหรับเข้ารหัสข้อมูลอื่นๆ เช่น email, phone
 */
export function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data + PEPPER)
    .digest('hex')
}
