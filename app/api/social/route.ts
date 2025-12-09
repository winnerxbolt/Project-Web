import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/server/db'
import type { InstagramPost, FacebookPost } from '@/types/social'

// GET - Fetch social media feed
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'instagram'
    const limit = parseInt(searchParams.get('limit') || '12')

    if (platform === 'instagram') {
      // In production, fetch from Instagram Graph API
      // For now, return mock data
      const posts: InstagramPost[] = [
        {
          id: '1',
          caption: '🏖️ พักผ่อนริมทะเล ห้องพักสวยๆ วิวทะเล 180 องศา',
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          likeCount: 245,
          commentsCount: 18
        },
        {
          id: '2',
          caption: '🌅 พระอาทิตย์ตกดินที่หาดป่าตอง มุมมองจากห้องพักของเรา',
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example2',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          likeCount: 389,
          commentsCount: 24
        },
        {
          id: '3',
          caption: '✨ Luxury Pool Villa ส่วนตัว พร้อมสระว่ายน้ำส่วนตัว',
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example3',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          likeCount: 512,
          commentsCount: 31
        },
        {
          id: '4',
          caption: '🍹 เช้าวันนี้มาเริ่มต้นที่ Rooftop Bar ของเรากันเถอะ',
          mediaType: 'VIDEO',
          mediaUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example4',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          likeCount: 421,
          commentsCount: 27,
          thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=800&fit=crop'
        },
        {
          id: '5',
          caption: '🏝️ Weekend getaway ที่สมบูรณ์แบบ จองเลยวันนี้!',
          mediaType: 'CAROUSEL_ALBUM',
          mediaUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example5',
          timestamp: new Date(Date.now() - 432000000).toISOString(),
          likeCount: 678,
          commentsCount: 45
        },
        {
          id: '6',
          caption: '🌺 ห้อง Deluxe ของเรา ตกแต่งด้วยสไตล์โมเดิร์นทรอปิคอล',
          mediaType: 'IMAGE',
          mediaUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=800&fit=crop',
          permalink: 'https://instagram.com/p/example6',
          timestamp: new Date(Date.now() - 518400000).toISOString(),
          likeCount: 334,
          commentsCount: 19
        }
      ]

      return NextResponse.json({
        success: true,
        posts: posts.slice(0, limit),
        platform: 'instagram'
      })
    }

    if (platform === 'facebook') {
      // In production, fetch from Facebook Graph API
      const posts: FacebookPost[] = [
        {
          id: '1',
          message: 'โปรโมชั่นพิเศษ! จองห้องพัก 3 คืนขึ้นไป ลด 20% 🎉',
          fullPicture: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=630&fit=crop',
          createdTime: new Date(Date.now() - 86400000).toISOString(),
          type: 'photo',
          likes: 156,
          comments: 23,
          shares: 45
        },
        {
          id: '2',
          message: 'มาดูห้องพักใหม่ของเรากัน! Sea View Suite พร้อมอ่างจากุซซี่ส่วนตัว 🛁',
          fullPicture: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=630&fit=crop',
          createdTime: new Date(Date.now() - 172800000).toISOString(),
          type: 'photo',
          likes: 289,
          comments: 34,
          shares: 67
        }
      ]

      return NextResponse.json({
        success: true,
        posts: posts.slice(0, limit),
        platform: 'facebook'
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid platform' }, { status: 400 })

  } catch (error) {
    console.error('Social media API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch social media data' },
      { status: 500 }
    )
  }
}
