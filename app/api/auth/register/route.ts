import { NextResponse } from 'next/server'
import { createUser, findUserByEmail, createSession } from '../../../../lib/server/auth'

type Body = { name?: string; email?: string; password?: string }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const { name, email, password } = body || {}

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exists = await findUserByEmail(email)
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const user = await createUser(name, email, password)
    const session = await createSession(user.id)

    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email })
    res.headers.set('Set-Cookie', `session=${session.token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`)
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}