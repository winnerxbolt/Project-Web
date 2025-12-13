import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import type { SocialLoginProvider } from '@/types/social'
import { createSecureToken } from '@/lib/security/jwt'
import { cookies } from 'next/headers'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  phone?: string
  picture?: string
  socialProvider?: {
    provider: 'google' | 'facebook'
    providerId: string
  }
  createdAt: string
}

// POST - Handle social login (Google/Facebook)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { provider, token, profile } = body

    if (!provider || !token || !profile) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { success: false, message: 'Invalid provider' },
        { status: 400 }
      )
    }

    const users = await readJson<User[]>('data/users.json') || []

    // Check if user already exists by email or social provider ID
    let user = users.find(u => 
      u.email === profile.email || 
      (u.socialProvider?.provider === provider && u.socialProvider?.providerId === profile.id)
    )

    if (user) {
      // Update existing user with social provider info if not set
      if (!user.socialProvider) {
        user.socialProvider = {
          provider: provider as 'google' | 'facebook',
          providerId: profile.id
        }
        user.picture = profile.picture || user.picture
        await writeJson('data/users.json', users)
      }
    } else {
      // Create new user from social login
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        role: 'user',
        picture: profile.picture,
        socialProvider: {
          provider: provider as 'google' | 'facebook',
          providerId: profile.id
        },
        createdAt: new Date().toISOString()
      }
      
      users.push(user)
      await writeJson('data/users.json', users)
    }

    // 🔒 สร้าง Secure JWT Token
    const token = createSecureToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    const cookieStore = await cookies()
    
    // 🍪 Set secure cookie
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 365 days
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
      },
      message: 'Social login successful'
    })

  } catch (error) {
    console.error('Social login error:', error)
    return NextResponse.json(
      { success: false, message: 'Social login failed' },
      { status: 500 }
    )
  }
}
