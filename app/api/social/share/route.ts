import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { SocialStats } from '@/types/social'

// GET - Get share statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    let query = supabase.from('social_shares').select('*').order('created_at', { ascending: false })
    
    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data: shares, error } = await query

    if (error) throw error
    
    if (roomId) {
      // Get shares for specific room
      return NextResponse.json({
        success: true,
        shares: shares || [],
        count: shares?.length || 0
      })
    }

    // Get overall statistics
    const stats: SocialStats = {
      totalShares: shares?.length || 0,
      sharesByPlatform: [],
      topSharedRooms: [],
      recentShares: (shares || []).slice(0, 10)
    }

    // Count shares by platform
    const platformCounts = new Map<string, number>()
    shares?.forEach(share => {
      platformCounts.set(share.platform, (platformCounts.get(share.platform) || 0) + 1)
    })
    stats.sharesByPlatform = Array.from(platformCounts.entries()).map(([platform, count]) => ({
      platform,
      count
    }))

    // Get top shared rooms
    const roomCounts = new Map<string, { count: number, name: string }>()
    shares?.forEach(share => {
      const current = roomCounts.get(share.room_id) || { count: 0, name: share.room_id }
      roomCounts.set(share.room_id, { ...current, count: current.count + 1 })
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
    
    const newShare = {
      room_id: roomId,
      platform,
      user_id: userId || null,
      url
    }

    const { data: share, error } = await supabaseAdmin
      .from('social_shares')
      .insert(newShare)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      share,
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
