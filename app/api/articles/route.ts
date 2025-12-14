import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySecureToken } from '@/lib/security/jwt'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - ดึงบทความทั้งหมด (public) หรือตาม query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    
    let query = supabase.from('articles').select('*')
    
    // Filter by published status
    if (published === 'true') {
      query = query.eq('published', true)
    }
    
    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }
    
    // Sort by date (newest first)
    query = query.order('created_at', { ascending: false })
    
    // Limit results
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data: articles, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch articles' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, articles: articles || [], total: articles?.length || 0 })
  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST - สร้างบทความใหม่ (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = verifySecureToken(token.value)
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const body = await request.json()
    const { title, content, excerpt, coverImage, category, tags, published } = body
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    
    const { data: newArticle, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        author: payload.name,
        author_id: payload.id,
        cover_image: coverImage || '',
        category: category || 'general',
        tags: tags || [],
        published: published ?? true,
        views: 0
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, article: newArticle })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}

// PUT - อัปเดตบทความ (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = verifySecureToken(token.value)
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, title, content, excerpt, coverImage, category, tags, published } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }
    
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (coverImage !== undefined) updates.cover_image = coverImage
    if (category !== undefined) updates.category = category
    if (tags !== undefined) updates.tags = tags
    if (published !== undefined) updates.published = published
    updates.updated_at = new Date().toISOString()
    
    const { data: updatedArticle, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
    }
    
    if (!updatedArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, article: updatedArticle })
  } catch (error) {
    console.error('Update article error:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE - ลบบทความ (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = verifySecureToken(token.value)
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Article deleted' })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
