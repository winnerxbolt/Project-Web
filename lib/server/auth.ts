import crypto from 'crypto'
import { readJson, writeJson } from './db'
import { hashPassword as multiLayerHash, verifyPassword as multiLayerVerify } from '../security/encryption'

export type User = {
  id: string
  name: string
  email: string
  hash: string // Multi-layer encrypted password (3 ชั้น) หรือ old hash
  salt?: string // Optional - สำหรับ user เก่าที่ยังใช้ salt
  role: 'user' | 'admin'
  createdAt: string
  lastLogin?: string
}

export type Session = {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

const USERS_PATH = 'data/users.json'
const SESSIONS_PATH = 'data/sessions.json'
const SESSION_TTL_SEC = 60 * 60 * 24 * 7 // 7 days

export async function findUserByEmail(email: string) {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  return arr.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(name: string, email: string, password: string) {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  
  // 🔒 ใช้ระบบ encryption หลายชั้น (3 ชั้น)
  const hash = await multiLayerHash(password)
  
  const user: User = { 
    id: crypto.randomUUID(), 
    name, 
    email: email.toLowerCase(), 
    hash, // Multi-layer encrypted password
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
  arr.push(user)
  await writeJson(USERS_PATH, arr)
  return user
}

export async function verifyUserPassword(user: User, password: string) {
  // 🔓 ตรวจสอบว่าเป็น user เก่า (มี salt) หรือใหม่ (ไม่มี salt)
  
  if (user.salt) {
    // ✅ User เก่า - ใช้ pbkdf2 แบบเดิม
    try {
      const hash = crypto.pbkdf2Sync(password, user.salt, 600000, 32, 'sha256').toString('hex')
      const isValid = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'))
      
      if (isValid) {
        // 🔄 Auto-upgrade: อัปเดต password เป็นแบบใหม่ (multi-layer)
        console.log('Password verified with old method - upgrading to new format...')
        try {
          const newHash = await multiLayerHash(password)
          user.hash = newHash
          delete user.salt // ลบ salt เพราะไม่ใช้แล้ว
          
          // บันทึกลง database
          const users = await readJson<User[]>(USERS_PATH) || []
          const userIndex = users.findIndex(u => u.id === user.id)
          if (userIndex !== -1) {
            users[userIndex] = user
            await writeJson(USERS_PATH, users)
            console.log('Password upgraded to multi-layer encryption successfully')
          }
        } catch (upgradeError) {
          console.error('Failed to upgrade password:', upgradeError)
          // ยังคง return true เพราะ password ถูกต้อง
        }
      }
      
      return isValid
    } catch (error) {
      console.error('Old password verification error:', error)
      return false
    }
  } else {
    // ✅ User ใหม่ - ใช้ multi-layer encryption
    return await multiLayerVerify(password, user.hash)
  }
}

export async function createSession(userId: string) {
  const arr = (await readJson<Session[]>(SESSIONS_PATH)) || []
  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date()
  const session: Session = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_SEC * 1000).toISOString(),
  }
  arr.push(session)
  await writeJson(SESSIONS_PATH, arr)
  return session
}

export async function deleteSession(token: string) {
  const arr = (await readJson<Session[]>(SESSIONS_PATH)) || []
  const filtered = arr.filter((s) => s.token !== token)
  await writeJson(SESSIONS_PATH, filtered)
}

export async function findSession(token: string) {
  const arr = (await readJson<Session[]>(SESSIONS_PATH)) || []
  const s = arr.find((it) => it.token === token) || null
  if (!s) return null
  if (new Date(s.expiresAt) < new Date()) {
    await deleteSession(s.token)
    return null
  }
  return s
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  const user = arr.find((u) => u.id === userId)
  if (!user) return null
  
  user.role = role
  await writeJson(USERS_PATH, arr)
  return user
}

export async function findUserById(userId: string) {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  return arr.find((u) => u.id === userId) || null
}