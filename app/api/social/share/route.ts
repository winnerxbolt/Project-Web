import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import type { SocialShare, SocialStats } from '@/types/social'

const SHARES_FILE = 'data/social-shares.json'

// GET - Get share statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    const shares = await readJson<SocialShare[]>(SHARES_FILE) || []
    
    if (roomId) {
      // Get shares for specific room
      const roomShares = shares.filter(s => s.roomId === roomId)
      return NextResponse.json({
        success: true,
        shares: roomShares,
        count: roomShares.length
      })
    }

    // Get overall statistics
    const stats: SocialStats = {
      totalShares: shares.length,
      sharesByPlatform: [],
      topSharedRooms: [],
      recentShares: shares.slice(-10).reverse()
    }

    // Count shares by platform
    const platformCounts = new Map<string, number>()
    shares.forEach(share => {
      platformCounts.set(share.platform, (platformCounts.get(share.platform) || 0) + 1)
    })
    stats.sharesByPlatform = Array.from(platformCounts.entries()).map(([platform, count]) => ({
      platform,
      count
    }))

    // Get top shared rooms
    const roomCounts = new Map<string, { count: number, name: string }>()
    shares.forEach(share => {
      const current = roomCounts.get(share.roomId) || { count: 0, name: share.roomId }
      roomCounts.set(share.roomId, { ...current, count: current.count + 1 })
    })
    
    stats.topSharedRooms = Array.from(roomCounts.entries())
      .map(([roomId, data]) => ({
        roomId,
        roomName: data.name,
        shares: data.count
      }))
      .sort((a, b) => b.shares - a.shares)
      .slice(0, 10)

    return NextResponse.json({ success: true, stats })

  } catch (error) {
    console.error('Share stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch share statistics' },
      { status: 500 }
    )
  }
}

// POST - Track a new share
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, platform, userId, url } = body

    if (!roomId || !platform || !url) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const shares = await readJson<SocialShare[]>(SHARES_FILE) || []
    
    const newShare: SocialShare = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      platform,
      timestamp: new Date().toISOString(),
      userId,
      url
    }

    shares.push(newShare)
    await writeJson(SHARES_FILE, shares)

    return NextResponse.json({
      success: true,
      share: newShare,
      message: 'Share tracked successfully'
    })

  } catch (error) {
    console.error('Track share error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to track share' },
      { status: 500 }
    )
  }
}
