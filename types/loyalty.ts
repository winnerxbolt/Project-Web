export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface LoyaltyMember {
  id: string
  userId: string
  points: number
  tier: LoyaltyTier
  tierProgress: number // Percentage to next tier
  lifetimePoints: number
  joinedAt: string
  lastActivity: string
  benefits: string[]
}

export interface LoyaltyTierConfig {
  tier: LoyaltyTier
  name: string
  nameLocal: string
  minPoints: number
  color: string
  icon: string
  benefits: TierBenefit[]
  earnRate: number // Points multiplier (e.g., 1.5x for gold)
  redemptionDiscount: number // Percentage discount on redemptions
}

export interface TierBenefit {
  id: string
  title: string
  description: string
  icon: string
  tier: LoyaltyTier[]
}

export interface RedemptionItem {
  id: string
  name: string
  description: string
  image: string
  pointsCost: number
  category: 'discount' | 'upgrade' | 'amenity' | 'experience' | 'gift'
  value: number
  stock: number
  isAvailable: boolean
  minTier?: LoyaltyTier
  validUntil?: string
  terms?: string
}

export interface PointsTransaction {
  id: string
  userId: string
  type: 'earn' | 'redeem' | 'expire' | 'adjust'
  points: number
  description: string
  referenceId?: string // booking ID, redemption ID, etc.
  createdAt: string
}

export interface Redemption {
  id: string
  userId: string
  itemId: string
  itemName: string
  pointsCost: number
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled'
  redeemedAt: string
  fulfilledAt?: string
  voucherCode?: string
  expiresAt?: string
  notes?: string
}
