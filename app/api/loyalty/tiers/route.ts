import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - ดึงข้อมูล tiers
export async function GET() {
  try {
    const { data: tiers, error } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .order('min_points', { ascending: true })

    if (error) {
      console.error('Error fetching tiers:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tiers'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tiers
    })
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tiers'
    }, { status: 500 })
  }
}
