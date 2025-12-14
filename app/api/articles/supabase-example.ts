// app/api/articles/supabase-example.ts
// ตัวอย่างการแปลง Articles API ให้ใช้ Supabase

import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { verifySecureToken } from '@/lib/security/jwt'
import { cookies } from 'next/headers'

// GET - Fetch articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    // Start query
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (published === 'true') {
      query = query.eq('published', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST - Create article (Admin only)
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, tags, coverImage, published } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate article ID
    const articleId = `article_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt || content.substring(0, 150) + '...'

    // Insert into Supabase
    const { data: newArticle, error } = await supabaseAdmin
      .from('articles')
      .insert({
        id: articleId,
        title,
        content,
        excerpt: finalExcerpt,
        author: decoded.name || 'Admin',
        author_id: decoded.id,
        cover_image: coverImage || null,
        category: category || 'general',
        tags: tags || [],
        published: published !== undefined ? published : false,
        views: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, article: newArticle }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

// PUT - Update article (Admin only)
export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }

    // Update in Supabase
    const { data: updatedArticle, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, article: updatedArticle })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE - Delete article (Admin only)
export async function DELETE(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifySecureToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }

    // Delete from Supabase
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}

// Increment article views (Public)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 }
      )
    }

    // Get current article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    // Increment views
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, views: updatedArticle.views })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}
