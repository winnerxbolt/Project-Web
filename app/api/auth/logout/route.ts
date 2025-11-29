import { NextResponse } from 'next/server'
import { deleteSession } from '../../../../lib/server/auth'

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const match = cookie.match(/session=([^;]+)/)
    if (match) {
      await deleteSession(match[1])
    }
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure')
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}