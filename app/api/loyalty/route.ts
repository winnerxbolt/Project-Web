import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { LoyaltyMember, LoyaltyTierConfig, PointsTransaction } from '@/types/loyalty'

// GET - ดึงข้อมูลสมาชิก
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const tier = searchParams.get('tier')

    if (userId) {
      // ค้นหาสมาชิกจาก database
      const { data: member, error } = await supabase
        .from('loyalty_members')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !member) {
        // สร้างสมาชิกใหม่
        const newMember = {
          user_id: userId,
          points: 0,
          tier: 'bronze',
          tier_progress: 0,
          lifetime_points: 0,
          joined_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        }

        const { data: created, error: createError } = await supabaseAdmin
          .from('loyalty_members')
          .insert(newMember)
          .select()
          .single()

        if (createError) {
          console.error('Error creating member:', createError)
          return NextResponse.json({
            success: false,
            error: 'Failed to create member'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          member: created
        })
      }

      return NextResponse.json({
        success: true,
        member
      })
    }

    // ดึงสมาชิกทั้งหมด (กรองตาม tier ถ้ามี)
    let query = supabase.from('loyalty_members').select('*')
    
    if (tier) {
      query = query.eq('tier', tier)
    }

    const { data: members, error } = await query

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch members'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      members
    })
  } catch (error) {
    console.error('Error fetching loyalty members:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch members'
    }, { status: 500 })
  }
}

// POST - เพิ่มคะแนน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, points, description, referenceId } = body

    // Load member
    const { data: member, error: memberError } = await supabase
      .from('loyalty_members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({
        success: false,
        error: 'Member not found'
      }, { status: 404 })
    }

    // Load tiers config
    const { data: tiers, error: tiersError } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .order('min_points', { ascending: true })

    if (tiersError) {
      console.error('Error loading tiers:', tiersError)
      return NextResponse.json({
        success: false,
        error: 'Failed to load tiers'
      }, { status: 500 })
    }

    // Calculate points with tier multiplier
    const currentTierConfig = tiers?.find((t: any) => t.tier === member.tier)
    const earnRate = currentTierConfig?.earn_rate || 1
    const earnedPoints = Math.floor(points * earnRate)

    // Update points
    const newPoints = (member.points || 0) + earnedPoints
    const newLifetimePoints = (member.lifetime_points || 0) + earnedPoints

    // Check tier upgrade
    const sortedTiers = tiers ? [...tiers].sort((a: any, b: any) => b.min_points - a.min_points) : []
    let newTier = member.tier
    for (const tier of sortedTiers) {
      if (newLifetimePoints >= tier.min_points) {
        newTier = tier.tier
        break
      }
    }

    // Calculate progress to next tier
    let tierProgress = 100
    const nextTierConfig = sortedTiers.find((t: any) => t.min_points > newLifetimePoints)
    if (nextTierConfig) {
      const currentTierMin = currentTierConfig?.min_points || 0
      const nextTierMin = nextTierConfig.min_points
      const progress = ((newLifetimePoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100
      tierProgress = Math.min(100, Math.max(0, progress))
    }

    // Update member in database
    const { error: updateError } = await supabaseAdmin
      .from('loyalty_members')
      .update({
        points: newPoints,
        lifetime_points: newLifetimePoints,
        tier: newTier,
        tier_progress: tierProgress,
        last_activity: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update points'
      }, { status: 500 })
    }

    // Log transaction in database
    const transaction = {
      user_id: userId,
      type: 'earn',
      points: earnedPoints,
      description: description || 'Points earned',
      reference_id: referenceId || null,
      created_at: new Date().toISOString()
    }

    const { error: txError } = await supabaseAdmin
      .from('points_transactions')
      .insert(transaction)

    if (txError) {
      console.error('Error logging transaction:', txError)
    }

    // Get updated member
    const { data: updatedMember } = await supabase
      .from('loyalty_members')
      .select('*')
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      success: true,
      member: updatedMember,
      earnedPoints,
      tierUpgraded: newTier !== member.tier
    })
  } catch (error) {
    console.error('Error adding points:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add points'
    }, { status: 500 })
  }
}
    const transaction: PointsTransaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'earn',
      points: earnedPoints,
      description,
      referenceId,
      createdAt: new Date().toISOString()
    }

    const transactionsData = await fs.readFile(TRANSACTIONS_FILE, 'utf-8')
    const transactions: PointsTransaction[] = JSON.parse(transactionsData)
    transactions.push(transaction)
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2))

    return NextResponse.json({
      success: true,
      member,
      transaction,
      message: `ได้รับคะแนน ${earnedPoints} คะแนน!`
    })
  } catch (error) {
    console.error('Error adding points:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add points'
    }, { status: 500 })
  }
}
