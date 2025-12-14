import crypto from 'crypto'
import { hashPassword as multiLayerHash, verifyPassword as multiLayerVerify } from '../security/encryption'
import { supabaseAdmin } from '../supabase'

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

const SESSION_TTL_SEC = 60 * 60 * 24 * 7 // 7 days

export async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('email', email)
    .single()
  
  if (error || !data) return null
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    hash: data.hash,
    salt: data.salt || undefined,
    role: data.role as 'user' | 'admin',
    createdAt: data.created_at,
    lastLogin: data.last_login || undefined
  } as User
}

export async function createUser(name: string, email: string, password: string) {
  // 🔒 ใช้ระบบ encryption หลายชั้น (3 ชั้น)
  const hash = await multiLayerHash(password)
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      hash,
      role: 'user',
      last_login: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error || !data) {
    throw new Error('Failed to create user')
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    hash: data.hash,
    role: data.role as 'user' | 'admin',
    createdAt: data.created_at,
    lastLogin: data.last_login || undefined
  } as User
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
          
          // บันทึกลง Supabase
          const { error } = await supabaseAdmin
            .from('users')
            .update({ 
              hash: newHash,
              salt: null // ลบ salt เพราะไม่ใช้แล้ว
            })
            .eq('id', user.id)
          
          if (!error) {
            console.log('Password upgraded to multi-layer encryption successfully')
            user.hash = newHash
            delete user.salt
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
  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SEC * 1000).toISOString()
  
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      token,
      user_id: userId,
      expires_at: expiresAt
    })
    .select()
    .single()
  
  if (error || !data) {
    throw new Error('Failed to create session')
  }
  
  return {
    token: data.token,
    userId: data.user_id,
    createdAt: data.created_at,
    expiresAt: data.expires_at
  } as Session
}

export async function deleteSession(token: string) {
  await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('token', token)
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