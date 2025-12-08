import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const pointsFilePath = path.join(process.cwd(), 'data', 'points.json');

// Points transaction interface
export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire';
  points: number;
  reason: string;
  bookingId?: string;
  couponId?: string;
  createdAt: string;
  expiresAt?: string;
}

// User points summary interface
export interface UserPointsSummary {
  userId: string;
  totalPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  transactions: PointsTransaction[];
}

// Read points from file
async function readPoints(): Promise<PointsTransaction[]> {
  try {
    const data = await fs.readFile(pointsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write points to file
async function writePoints(points: PointsTransaction[]): Promise<void> {
  await fs.writeFile(pointsFilePath, JSON.stringify(points, null, 2));
}

// Calculate user tier based on lifetime points
function calculateTier(lifetimePoints: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (lifetimePoints >= 50000) return 'platinum';
  if (lifetimePoints >= 25000) return 'gold';
  if (lifetimePoints >= 10000) return 'silver';
  return 'bronze';
}

// Get tier benefits
function getTierBenefits(tier: 'bronze' | 'silver' | 'gold' | 'platinum') {
  const benefits = {
    bronze: {
      earnRate: 1, // 1 point per 1 baht
      redeemRate: 1, // 1 point = 1 baht
      bonusMultiplier: 1,
      perks: ['รับคะแนนจากการจอง', 'แลกคะแนนเป็นส่วนลด']
    },
    silver: {
      earnRate: 1.2,
      redeemRate: 1,
      bonusMultiplier: 1.1,
      perks: ['รับคะแนน 20% เพิ่มเติม', 'Late Checkout ฟรี', 'อัพเกรดห้องพักแบบสุ่ม']
    },
    gold: {
      earnRate: 1.5,
      redeemRate: 1.1,
      bonusMultiplier: 1.25,
      perks: ['รับคะแนน 50% เพิ่มเติม', 'คะแนนแลกได้คุ้มกว่า 10%', 'Early Check-in ฟรี', 'Welcome Drink']
    },
    platinum: {
      earnRate: 2,
      redeemRate: 1.2,
      bonusMultiplier: 1.5,
      perks: ['รับคะแนนเพิ่ม 2 เท่า', 'คะแนนแลกได้คุ้มกว่า 20%', 'อัพเกรดห้องพักฟรี', 'ส่วนลดพิเศษ 10%']
    }
  };
  return benefits[tier];
}

// Get user points summary
async function getUserPointsSummary(userId: string): Promise<UserPointsSummary> {
  const allTransactions = await readPoints();
  const userTransactions = allTransactions.filter(t => t.userId === userId);

  // Calculate total points (exclude expired)
  const now = new Date();
  let totalPoints = 0;
  let lifetimeEarned = 0;

  userTransactions.forEach(t => {
    // Check if transaction is expired
    if (t.expiresAt && new Date(t.expiresAt) < now) {
      return; // Skip expired points
    }

    if (t.type === 'earn') {
      totalPoints += t.points;
      lifetimeEarned += t.points;
    } else if (t.type === 'redeem') {
      totalPoints -= t.points;
    }
  });

  const tier = calculateTier(lifetimeEarned);

  return {
    userId,
    totalPoints: Math.max(0, totalPoints),
    tier,
    lifetimePoints: lifetimeEarned,
    transactions: userTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  };
}

// GET - Get user points or all transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (action === 'summary' && userId) {
      const summary = await getUserPointsSummary(userId);
      const benefits = getTierBenefits(summary.tier);
      return NextResponse.json({ ...summary, benefits });
    }

    if (userId) {
      const summary = await getUserPointsSummary(userId);
      return NextResponse.json(summary);
    }

    // Get all transactions (admin only)
    const allTransactions = await readPoints();
    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    );
  }
}

// POST - Award or redeem points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, points, reason, bookingId, couponId } = body;

    if (!userId || !type || !points || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's current points
    const summary = await getUserPointsSummary(userId);

    // Check if user has enough points for redemption
    if (type === 'redeem' && summary.totalPoints < points) {
      return NextResponse.json(
        { error: 'คะแนนไม่เพียงพอ' },
        { status: 400 }
      );
    }

    const allTransactions = await readPoints();

    // Apply tier multiplier for earning
    let finalPoints = points;
    if (type === 'earn') {
      const benefits = getTierBenefits(summary.tier);
      finalPoints = Math.round(points * benefits.earnRate);
    }

    // Create new transaction
    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      userId,
      type,
      points: finalPoints,
      reason,
      bookingId,
      couponId,
      createdAt: new Date().toISOString(),
      // Points expire after 1 year for earned points
      expiresAt: type === 'earn' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
        : undefined
    };

    allTransactions.push(newTransaction);
    await writePoints(allTransactions);

    // Return updated summary
    const updatedSummary = await getUserPointsSummary(userId);
    const benefits = getTierBenefits(updatedSummary.tier);

    return NextResponse.json({ 
      transaction: newTransaction,
      summary: { ...updatedSummary, benefits }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating points transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create points transaction' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transaction (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const allTransactions = await readPoints();
    const filteredTransactions = allTransactions.filter(t => t.id !== id);

    if (filteredTransactions.length === allTransactions.length) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await writePoints(filteredTransactions);

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

// PATCH - Expire points (automated job)
export async function PATCH(request: NextRequest) {
  try {
    const allTransactions = await readPoints();
    const now = new Date();
    let expiredCount = 0;

    // Create new expire transactions for expired points
    const newExpireTransactions: PointsTransaction[] = [];
    
    allTransactions.forEach(t => {
      if (t.type === 'earn' && t.expiresAt && new Date(t.expiresAt) < now) {
        // Check if not already expired
        const alreadyExpired = allTransactions.some(
          expT => expT.type === 'expire' && 
                  expT.userId === t.userId && 
                  expT.reason === `คะแนนหมดอายุจาก transaction ${t.id}`
        );
        
        if (!alreadyExpired) {
          newExpireTransactions.push({
            id: `expire-${Date.now()}-${Math.random()}`,
            userId: t.userId,
            type: 'expire',
            points: t.points,
            reason: `คะแนนหมดอายุจาก transaction ${t.id}`,
            createdAt: now.toISOString()
          });
          expiredCount++;
        }
      }
    });

    if (newExpireTransactions.length > 0) {
      allTransactions.push(...newExpireTransactions);
      await writePoints(allTransactions);
    }

    return NextResponse.json({ 
      message: 'Points expiration check completed',
      expiredCount 
    });
  } catch (error) {
    console.error('Error expiring points:', error);
    return NextResponse.json(
      { error: 'Failed to expire points' },
      { status: 500 }
    );
  }
}
