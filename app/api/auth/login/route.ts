import { NextResponse } from 'next/server'
import { findUserByEmail, verifyUserPassword, createSession } from '../../../../lib/server/auth'

type Body = { email?: string; password?: string }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const ok = await verifyUserPassword(user, password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const session = await createSession(user.id)
    const userData = { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      role: user.role || 'user' // Use role from database, default to 'user'
    }
    const res = NextResponse.json({ user: userData })
    res.headers.set('Set-Cookie', `session=${session.token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`)
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}