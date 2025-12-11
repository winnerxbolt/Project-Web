import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { LoyaltyMember, LoyaltyTierConfig, PointsTransaction } from '@/types/loyalty'

const DATA_DIR = path.join(process.cwd(), 'data')
const MEMBERS_FILE = path.join(DATA_DIR, 'loyalty-members.json')
const TIERS_FILE = path.join(DATA_DIR, 'loyalty-tiers.json')
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'points-transactions.json')

// GET - ดึงข้อมูลสมาชิก
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const tier = searchParams.get('tier')

    const data = await fs.readFile(MEMBERS_FILE, 'utf-8')
    let members: LoyaltyMember[] = JSON.parse(data)

    if (userId) {
      const member = members.find(m => m.userId === userId)
      if (!member) {
        // สร้างสมาชิกใหม่
        const newMember: LoyaltyMember = {
          id: `member-${Date.now()}`,
          userId,
          points: 0,
          tier: 'bronze',
          tierProgress: 0,
          lifetimePoints: 0,
          joinedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          benefits: []
        }
        members.push(newMember)
        await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2))
        
        return NextResponse.json({
          success: true,
          member: newMember
        })
      }
      
      return NextResponse.json({
        success: true,
        member
      })
    }

    if (tier) {
      members = members.filter(m => m.tier === tier)
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

    // Load data
    const membersData = await fs.readFile(MEMBERS_FILE, 'utf-8')
    const members: LoyaltyMember[] = JSON.parse(membersData)
    
    const tiersData = await fs.readFile(TIERS_FILE, 'utf-8')
    const tiers: LoyaltyTierConfig[] = JSON.parse(tiersData)

    // Find member
    const memberIndex = members.findIndex(m => m.userId === userId)
    if (memberIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Member not found'
      }, { status: 404 })
    }

    const member = members[memberIndex]
    
    // Calculate points with tier multiplier
    const currentTierConfig = tiers.find(t => t.tier === member.tier)
    const earnRate = currentTierConfig?.earnRate || 1
    const earnedPoints = Math.floor(points * earnRate)

    // Update points
    member.points += earnedPoints
    member.lifetimePoints += earnedPoints
    member.lastActivity = new Date().toISOString()

    // Check tier upgrade
    const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints)
    for (const tier of sortedTiers) {
      if (member.lifetimePoints >= tier.minPoints) {
        member.tier = tier.tier
        member.benefits = tier.benefits.map(b => b.title)
        break
      }
    }

    // Calculate progress to next tier
    const nextTierConfig = sortedTiers.find(t => t.minPoints > member.lifetimePoints)
    if (nextTierConfig) {
      const currentTierMin = currentTierConfig?.minPoints || 0
      const nextTierMin = nextTierConfig.minPoints
      const progress = ((member.lifetimePoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100
      member.tierProgress = Math.min(100, Math.max(0, progress))
    } else {
      member.tierProgress = 100 // Max tier
    }

    members[memberIndex] = member
    await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2))

    // Log transaction
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
