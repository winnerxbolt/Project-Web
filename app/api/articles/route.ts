import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { verifySecureToken } from '@/lib/security/jwt'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  coverImage?: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  views: number
}

const ARTICLES_FILE = 'data/articles.json'

// GET - ดึงบทความทั้งหมด (public) หรือตาม query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    
    const articles = await readJson<Article[]>(ARTICLES_FILE) || []
    
    let filtered = articles
    
    // Filter by published status
    if (published === 'true') {
      filtered = filtered.filter(a => a.published)
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(a => a.category === category)
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Limit results
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit))
    }
    
    return NextResponse.json({ articles: filtered, total: filtered.length })
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
    
    const articles = await readJson<Article[]>(ARTICLES_FILE) || []
    
    const newArticle: Article = {
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      author: payload.name,
      authorId: payload.id,
      coverImage: coverImage || '',
      category: category || 'general',
      tags: tags || [],
      published: published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    }
    
    articles.push(newArticle)
    await writeJson(ARTICLES_FILE, articles)
    
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
    
    const articles = await readJson<Article[]>(ARTICLES_FILE) || []
    const articleIndex = articles.findIndex(a => a.id === id)
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    // Update article
    articles[articleIndex] = {
      ...articles[articleIndex],
      title: title || articles[articleIndex].title,
      content: content || articles[articleIndex].content,
      excerpt: excerpt || articles[articleIndex].excerpt,
      coverImage: coverImage !== undefined ? coverImage : articles[articleIndex].coverImage,
      category: category || articles[articleIndex].category,
      tags: tags || articles[articleIndex].tags,
      published: published !== undefined ? published : articles[articleIndex].published,
      updatedAt: new Date().toISOString()
    }
    
    await writeJson(ARTICLES_FILE, articles)
    
    return NextResponse.json({ success: true, article: articles[articleIndex] })
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
    
    const articles = await readJson<Article[]>(ARTICLES_FILE) || []
    const filtered = articles.filter(a => a.id !== id)
    
    if (filtered.length === articles.length) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    await writeJson(ARTICLES_FILE, filtered)
    
    return NextResponse.json({ success: true, message: 'Article deleted' })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
