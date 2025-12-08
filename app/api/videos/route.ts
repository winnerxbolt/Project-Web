import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const videosPath = path.join(process.cwd(), 'data', 'videos.json');
const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category: 'poolvilla' | 'room_tour' | 'amenities' | 'promotion' | 'other';
  tags: string[];
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  notification?: {
    enabled: boolean;
    type: 'promotion' | 'discount' | 'special_event' | 'new_video';
    reason: string;
    couponCode?: string;
    discount?: string;
    channels: ('web' | 'email' | 'line' | 'sms')[];
  };
}

function readVideos(): Video[] {
  try {
    const data = fs.readFileSync(videosPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeVideos(videos: Video[]) {
  fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2));
}

function readNotifications(): any[] {
  try {
    const data = fs.readFileSync(notificationsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeNotifications(notifications: any[]) {
  fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));
}

// GET - Fetch videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let videos = readVideos();

    if (category) {
      videos = videos.filter(v => v.category === category);
    }

    if (activeOnly) {
      videos = videos.filter(v => v.isActive);
    }

    // Sort by created date (newest first)
    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST - Create video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const videos = readVideos();

    const newVideo: Video = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description,
      youtubeUrl: body.youtubeUrl,
      thumbnailUrl: body.thumbnailUrl || extractYoutubeThumbnail(body.youtubeUrl),
      category: body.category || 'other',
      tags: body.tags || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      notification: body.notification,
    };

    videos.push(newVideo);
    writeVideos(videos);

    // Create notification if enabled
    if (newVideo.notification?.enabled) {
      await createVideoNotification(newVideo);
    }

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}

// PUT - Update video
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, ...updateData } = body;

    const videos = readVideos();
    const index = videos.findIndex(v => v.id === videoId);

    if (index === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    videos[index] = {
      ...videos[index],
      ...updateData,
      id: videoId, // Preserve ID
      createdAt: videos[index].createdAt, // Preserve creation date
    };

    writeVideos(videos);

    // Create notification if enabled and notification settings changed
    if (updateData.notification?.enabled && updateData.notifyUsers) {
      await createVideoNotification(videos[index]);
    }

    return NextResponse.json({ success: true, video: videos[index] });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const videos = readVideos();
    const filtered = videos.filter(v => v.id !== videoId);

    writeVideos(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

// PATCH - Increment view count
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    const videos = readVideos();
    const index = videos.findIndex(v => v.id === videoId);

    if (index === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    videos[index].viewCount = (videos[index].viewCount || 0) + 1;
    writeVideos(videos);

    return NextResponse.json({ success: true, viewCount: videos[index].viewCount });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
  }
}

// Helper function to create notification for video
async function createVideoNotification(video: Video) {
  if (!video.notification?.enabled) return;

  const notifications = readNotifications();
  
  let title = '';
  let message = '';

  switch (video.notification.type) {
    case 'promotion':
      title = '🎉 โปรโมชั่นพิเศษ!';
      message = `${video.title}${video.notification.reason ? ` - ${video.notification.reason}` : ''}`;
      break;
    case 'discount':
      title = '💰 ส่วนลดพิเศษ!';
      message = `${video.title}${video.notification.discount ? ` ลด ${video.notification.discount}` : ''}`;
      break;
    case 'special_event':
      title = '✨ กิจกรรมพิเศษ!';
      message = `${video.title} - ${video.notification.reason || ''}`;
      break;
    case 'new_video':
      title = '📹 วิดีโอใหม่!';
      message = video.title;
      break;
  }

  if (video.notification.couponCode) {
    message += ` | โค้ด: ${video.notification.couponCode}`;
  }

  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'video',
    title,
    message,
    recipientType: 'all',
    videoId: video.id,
    couponCode: video.notification.couponCode,
    priority: video.notification.type === 'promotion' ? 'high' : 'normal',
    channels: video.notification.channels || ['web'],
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: {
      reason: video.notification.reason,
      discount: video.notification.discount,
      imageUrl: video.thumbnailUrl,
      actionUrl: `/reviews/videos?videoId=${video.id}`,
    },
  };

  notifications.push(newNotification);
  writeNotifications(notifications);
}

// Helper function to extract YouTube thumbnail
function extractYoutubeThumbnail(url: string): string {
  const videoId = extractYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
}

function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
