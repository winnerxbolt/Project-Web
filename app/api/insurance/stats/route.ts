import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { BookingInsurance, InsuranceClaim } from '@/types/insurance'
import { InsuranceStats } from '@/types/insurance'

export async function GET(request: Request) {
  try {
    const { data: insurances } = await supabase.from('booking_insurance').select('*')
    const { data: claims } = await supabase.from('insurance_claims').select('*')

    const totalPolicies = insurances?.length || 0
    const activePolicies = insurances?.filter(i => i.status === 'active').length || 0
    const expiredPolicies = insurances?.filter(i => i.status === 'expired').length || 0
    const claimedPolicies = insurances?.filter(i => i.status === 'claimed').length || 0

    const totalPremium = insurances?.reduce((sum, i) => sum + i.premium, 0) || 0
    const totalClaims = claims?.length || 0
    const totalPaid = claims?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.refund_amount, 0) || 0

    // Claims by type
    const claimsByType: Record<string, number> = {}
    claims?.forEach(c => {
      claimsByType[c.claim_type] = (claimsByType[c.claim_type] || 0) + 1
    })

    // Claims by status
    const claimsByStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      processing: 0,
      paid: 0,
    }
    claims?.forEach(c => {
      claimsByStatus[c.status]++
    })

    // Average claim amount
    const averageClaimAmount = claims && claims.length > 0
      ? claims.reduce((sum, c) => sum + c.claim_amount, 0) / claims.length
      : 0

    // Average processing time (in days)
    const processedClaims = claims?.filter(c => c.processed_date) || []
    const averageProcessingTime = processedClaims.length > 0
      ? processedClaims.reduce((sum, c) => {
          const submitted = new Date(c.submitted_date).getTime()
          const processed = new Date(c.processed_date!).getTime()
          return sum + (processed - submitted) / (1000 * 60 * 60 * 24)
        }, 0) / processedClaims.length
      : 0

    // Claim approval rate
    const decidedClaims = claims?.filter(c => c.status === 'approved' || c.status === 'rejected') || []
    const approvedClaims = claims?.filter(c => c.status === 'approved' || c.status === 'paid') || []
    const claimApprovalRate = decidedClaims.length > 0
      ? (approvedClaims.length / decidedClaims.length) * 100
      : 0

    // Top reasons
    const reasonCounts: Record<string, number> = {}
    claims?.forEach(c => {
      reasonCounts[c.reason] = (reasonCounts[c.reason] || 0) + 1
    })
    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Monthly stats (last 6 months)
    const monthlyStats: { month: string; policies: number; claims: number; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toISOString().substring(0, 7)

      const monthPolicies = insurances?.filter(ins => 
        ins.purchase_date?.substring(0, 7) === month
      ).length || 0

      const monthClaims = claims?.filter(c => 
        c.submitted_date?.substring(0, 7) === month
      ).length || 0

      const monthRevenue = insurances
        ?.filter(ins => ins.purchase_date?.substring(0, 7) === month)
        .reduce((sum, ins) => sum + ins.premium, 0) || 0

      monthlyStats.push({ month, policies: monthPolicies, claims: monthClaims, revenue: monthRevenue })
    }

    const stats: InsuranceStats = {
      totalPolicies,
      activePolicies,
      expiredPolicies,
      claimedPolicies,
      totalPremium,
      totalClaims,
      totalPaid,
      claimsByType,
      claimsByStatus,
      averageClaimAmount,
      averageProcessingTime,
      claimApprovalRate,
      topReasons,
      monthlyStats,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching insurance stats:', error)
    return NextResponse.json({ error: 'Failed to fetch insurance stats' }, { status: 500 })
  }
}
