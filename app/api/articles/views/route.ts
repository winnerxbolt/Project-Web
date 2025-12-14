import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST - เพิ่ม view count
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }
    
    // Get current article
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('views')
      .eq('id', id)
      .single()
    
    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    // Increment views
    const newViews = (article.views || 0) + 1
    
    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({ views: newViews })
      .eq('id', id)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, views: newViews })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}
