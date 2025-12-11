import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// POST - Calculate refund amount
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.bookingAmount || !body.checkInDate || !body.policyId) {
      return NextResponse.json({
        success: false,
        error: 'Booking amount, check-in date, and policy ID are required'
      }, { status: 400 })
    }
    
    const policiesPath = path.join(DATA_DIR, 'cancellation-policies.json')
    const policiesData = await fs.readFile(policiesPath, 'utf-8')
    const policies = JSON.parse(policiesData)
    
    const policy = policies.find((p: any) => p.id === body.policyId)
    if (!policy) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }
    
    const checkIn = new Date(body.checkInDate)
    const now = new Date()
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Find applicable rule
    let applicableRule = policy.rules[policy.rules.length - 1]
    for (const rule of policy.rules) {
      if (daysUntilCheckIn >= rule.daysBeforeCheckIn) {
        applicableRule = rule
        break
      }
    }
    
    const baseAmount = parseFloat(body.bookingAmount)
    const refundPercentage = applicableRule.refundPercentage
    const refundableAmount = (baseAmount * refundPercentage) / 100
    const deductionAmount = applicableRule.deductionAmount || 0
    const deductionPercentage = applicableRule.deductionPercentage || 0
    
    let totalDeduction = deductionAmount
    if (deductionPercentage > 0) {
      totalDeduction += (refundableAmount * deductionPercentage) / 100
    }
    
    const finalRefund = Math.max(0, refundableAmount - totalDeduction)
    const processingFee = policy.conditions.refundProcessingFee ? 0 : 100
    const netRefund = Math.max(0, finalRefund - processingFee)
    
    const breakdown = [
      {
        description: 'จำนวนเงินจองทั้งหมด',
        amount: baseAmount,
        type: 'addition'
      },
      {
        description: `เงินคืนตาม policy (${refundPercentage}%)`,
        amount: refundableAmount,
        type: 'addition'
      }
    ]
    
    if (totalDeduction > 0) {
      breakdown.push({
        description: 'ค่าใช้จ่ายที่หัก',
        amount: totalDeduction,
        type: 'deduction'
      })
    }
    
    if (processingFee > 0) {
      breakdown.push({
        description: 'ค่าธรรมเนียมการดำเนินการ',
        amount: processingFee,
        type: 'deduction'
      })
    }
    
    return NextResponse.json({
      success: true,
      calculation: {
        bookingAmount: baseAmount,
        daysUntilCheckIn,
        policyRules: policy.rules,
        calculation: {
          baseAmount,
          refundPercentage,
          refundableAmount,
          deductionAmount: totalDeduction,
          finalRefund,
          processingFee,
          netRefund
        },
        breakdown,
        appliedRule: {
          daysBeforeCheckIn: applicableRule.daysBeforeCheckIn,
          refundPercentage,
          description: `ยกเลิกก่อน ${applicableRule.daysBeforeCheckIn} วัน: คืนเงิน ${refundPercentage}%`
        },
        policy: {
          id: policy.id,
          name: policy.name,
          type: policy.type
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate refund'
    }, { status: 500 })
  }
}
