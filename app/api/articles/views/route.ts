import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'

interface Article {
  id: string
  views: number
  [key: string]: any
}

// POST - เพิ่ม view count
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }
    
    const articles = await readJson<Article[]>('data/articles.json') || []
    const articleIndex = articles.findIndex(a => a.id === id)
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    articles[articleIndex].views = (articles[articleIndex].views || 0) + 1
    await writeJson('data/articles.json', articles)
    
    return NextResponse.json({ success: true, views: articles[articleIndex].views })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}
