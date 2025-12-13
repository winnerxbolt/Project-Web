import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySecureToken, createSecureToken } from '@/lib/security/jwt'
import fs from 'fs/promises'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // 🔓 Verify secure token
    const payload = verifySecureToken(token.value)
    
    if (!payload) {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 401 })
    }

    const { name, email } = await request.json()

    // Read users file
    const usersData = await fs.readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(usersData)

    // Update user
    const userIndex = users.findIndex((u: any) => u.id === payload.id)
    if (userIndex === -1) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      email
    }

    // Save updated users
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))

    // 🔒 สร้าง token ใหม่ด้วยข้อมูลที่อัปเดต
    const newToken = createSecureToken({
      id: payload.id,
      email,
      name,
      role: payload.role
    })

    // Update cookie
    cookieStore.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 365 days
      path: '/'
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: payload.id,
        email,
        name,
        role: payload.role
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ 
      error: 'Update failed' 
    }, { status: 500 })
  }
}
