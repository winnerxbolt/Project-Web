import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { RedemptionItem, Redemption, LoyaltyMember } from '@/types/loyalty'

const DATA_DIR = path.join(process.cwd(), 'data')
const CATALOG_FILE = path.join(DATA_DIR, 'redemption-catalog.json')
const REDEMPTIONS_FILE = path.join(DATA_DIR, 'redemptions.json')
const MEMBERS_FILE = path.join(DATA_DIR, 'loyalty-members.json')
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'points-transactions.json')

// GET - ดึงรายการของรางวัล
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    const data = await fs.readFile(CATALOG_FILE, 'utf-8')
    let items: RedemptionItem[] = JSON.parse(data)

    // Filter by category
    if (category) {
      items = items.filter(item => item.category === category)
    }

    // Filter by available
    items = items.filter(item => item.isAvailable && item.stock > 0)

    // If userId provided, filter by tier
    if (userId) {
      const membersData = await fs.readFile(MEMBERS_FILE, 'utf-8')
      const members: LoyaltyMember[] = JSON.parse(membersData)
      const member = members.find(m => m.userId === userId)
      
      if (member) {
        const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
        const memberTierIndex = tierOrder.indexOf(member.tier)
        
        items = items.filter(item => {
          if (!item.minTier) return true
          const itemTierIndex = tierOrder.indexOf(item.minTier)
          return memberTierIndex >= itemTierIndex
        })
      }
    }

    return NextResponse.json({
      success: true,
      items
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch catalog'
    }, { status: 500 })
  }
}

// POST - แลกของรางวัล
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId } = body

    // Load data
    const catalogData = await fs.readFile(CATALOG_FILE, 'utf-8')
    const catalog: RedemptionItem[] = JSON.parse(catalogData)
    
    const membersData = await fs.readFile(MEMBERS_FILE, 'utf-8')
    const members: LoyaltyMember[] = JSON.parse(membersData)

    // Find item
    const itemIndex = catalog.findIndex(i => i.id === itemId)
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    const item = catalog[itemIndex]

    // Check availability
    if (!item.isAvailable || item.stock <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Item not available'
      }, { status: 400 })
    }

    // Find member
    const memberIndex = members.findIndex(m => m.userId === userId)
    if (memberIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Member not found'
      }, { status: 404 })
    }

    const member = members[memberIndex]

    // Check tier requirement
    if (item.minTier) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
      const memberTierIndex = tierOrder.indexOf(member.tier)
      const itemTierIndex = tierOrder.indexOf(item.minTier)
      
      if (memberTierIndex < itemTierIndex) {
        return NextResponse.json({
          success: false,
          error: `ต้องเป็นสมาชิก ${item.minTier} ขึ้นไป`
        }, { status: 400 })
      }
    }

    // Check points
    if (member.points < item.pointsCost) {
      return NextResponse.json({
        success: false,
        error: 'คะแนนไม่เพียงพอ'
      }, { status: 400 })
    }

    // Deduct points
    member.points -= item.pointsCost
    member.lastActivity = new Date().toISOString()
    members[memberIndex] = member
    await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2))

    // Reduce stock
    catalog[itemIndex].stock -= 1
    await fs.writeFile(CATALOG_FILE, JSON.stringify(catalog, null, 2))

    // Generate voucher code
    const voucherCode = `VOC${Date.now().toString().slice(-8)}`

    // Create redemption record
    const redemption: Redemption = {
      id: `red-${Date.now()}`,
      userId,
      itemId,
      itemName: item.name,
      pointsCost: item.pointsCost,
      status: 'pending',
      redeemedAt: new Date().toISOString(),
      voucherCode,
      expiresAt: item.validUntil
    }

    const redemptionsData = await fs.readFile(REDEMPTIONS_FILE, 'utf-8')
    const redemptions: Redemption[] = JSON.parse(redemptionsData)
    redemptions.push(redemption)
    await fs.writeFile(REDEMPTIONS_FILE, JSON.stringify(redemptions, null, 2))

    // Log transaction
    const transactionsData = await fs.readFile(TRANSACTIONS_FILE, 'utf-8')
    const transactions = JSON.parse(transactionsData)
    transactions.push({
      id: `txn-${Date.now()}`,
      userId,
      type: 'redeem',
      points: -item.pointsCost,
      description: `แลก: ${item.name}`,
      referenceId: redemption.id,
      createdAt: new Date().toISOString()
    })
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2))

    return NextResponse.json({
      success: true,
      redemption,
      member,
      message: 'แลกของรางวัลสำเร็จ!'
    })
  } catch (error) {
    console.error('Error redeeming item:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to redeem item'
    }, { status: 500 })
  }
}
