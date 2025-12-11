import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'line-users.json')

// GET - Get all LINE users
export async function GET(request: NextRequest) {
  try {
    // Load users
    let users = []
    try {
      const data = await fs.readFile(USERS_FILE, 'utf-8')
      users = JSON.parse(data)
    } catch (error) {
      // File doesn't exist yet, return empty array
      users = []
    }

    // Filter by status if provided
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    if (status === 'active') {
      users = users.filter((u: any) => !u.isBlocked)
    } else if (status === 'blocked') {
      users = users.filter((u: any) => u.isBlocked)
    }

    return NextResponse.json({
      users,
      total: users.length
    })
  } catch (error) {
    console.error('Error loading LINE users:', error)
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    )
  }
}
