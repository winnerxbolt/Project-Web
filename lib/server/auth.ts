import crypto from 'crypto'
import { readJson, writeJson } from './db'

export type User = {
  id: string
  name: string
  email: string
  salt: string
  hash: string
  role: 'user' | 'admin'
  createdAt: string
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

// Use 600,000 iterations as per OWASP 2023 recommendations
function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('hex')
}

export async function findUserByEmail(email: string) {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  return arr.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(name: string, email: string, password: string) {
  const arr = (await readJson<User[]>(USERS_PATH)) || []
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)
  const user: User = { 
    id: crypto.randomUUID(), 
    name, 
    email: email.toLowerCase(), 
    salt, 
    hash, 
    role: 'user', // Default role is 'user'
    createdAt: new Date().toISOString() 
  }
  arr.push(user)
  await writeJson(USERS_PATH, arr)
  return user
}

export async function verifyUserPassword(user: User, password: string) {
  const hash = hashPassword(password, user.salt)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'))
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