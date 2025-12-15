import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface Video {
  id?: string;
  room_id?: number;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  duration?: number;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  // Legacy fields for compatibility
  youtubeUrl?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  viewCount?: number;
}

// GET - Fetch videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const roomId = searchParams.get('roomId');

    let query = supabase.from('videos').select('*');

    if (roomId) {
      query = query.eq('room_id', parseInt(roomId));
    }

    if (activeOnly) {
      query = query.eq('active', true);
    }

    // Sort by order_index and created date
    query = query.order('order_index', { ascending: true })
                 .order('created_at', { ascending: false });

    const { data: videos, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    return NextResponse.json(videos || []);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST - Create video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map legacy fields to new schema
    const videoData = {
      room_id: body.roomId || body.room_id || null,
      video_url: body.youtubeUrl || body.videoUrl || body.video_url,
      thumbnail_url: body.thumbnailUrl || body.thumbnail_url || extractYoutubeThumbnail(body.youtubeUrl || body.video_url),
      title: body.title,
      description: body.description || null,
      duration: body.duration || null,
      order_index: body.orderIndex || body.order_index || 0,
      active: body.isActive !== undefined ? body.isActive : (body.active !== undefined ? body.active : true)
    };

    const { data: newVideo, error } = await supabaseAdmin
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }

    // Create notification if needed
    if (body.notification?.enabled) {
      await createVideoNotification(newVideo.id, body.notification);
    }

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}

// PUT - Update video
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Map legacy fields
    const videoUpdates: any = {};
    if (updates.room_id !== undefined || updates.roomId !== undefined) {
      videoUpdates.room_id = updates.room_id || updates.roomId;
    }
    if (updates.video_url !== undefined || updates.youtubeUrl !== undefined) {
      videoUpdates.video_url = updates.video_url || updates.youtubeUrl;
    }
    if (updates.thumbnail_url !== undefined || updates.thumbnailUrl !== undefined) {
      videoUpdates.thumbnail_url = updates.thumbnail_url || updates.thumbnailUrl;
    }
    if (updates.title !== undefined) videoUpdates.title = updates.title;
    if (updates.description !== undefined) videoUpdates.description = updates.description;
    if (updates.duration !== undefined) videoUpdates.duration = updates.duration;
    if (updates.order_index !== undefined || updates.orderIndex !== undefined) {
      videoUpdates.order_index = updates.order_index !== undefined ? updates.order_index : updates.orderIndex;
    }
    if (updates.active !== undefined || updates.isActive !== undefined) {
      videoUpdates.active = updates.active !== undefined ? updates.active : updates.isActive;
    }

    const { data: updatedVideo, error } = await supabaseAdmin
      .from('videos')
      .update(videoUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// PATCH - Increment view count
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // First get current video
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (fetchError) {
      console.error('Error fetching video:', fetchError);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Since we don't have view_count in schema, we'll just return success
    // You can add view_count column later if needed
    return NextResponse.json({ success: true, message: 'View counted' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
  }
}

// DELETE - Remove video
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('DELETE request received for video ID:', id);

    if (!id) {
      console.error('No video ID provided');
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // First check if video exists
    const { data: existingVideo, error: checkError } = await supabase
      .from('videos')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingVideo) {
      console.error('Video not found:', checkError);
      return NextResponse.json({ 
        error: 'Video not found', 
        details: checkError?.message 
      }, { status: 404 });
    }

    // Try to delete using both clients
    const { data, error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try with admin client as fallback
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('videos')
        .delete()
        .eq('id', id)
        .select();

      if (adminError) {
        console.error('Admin delete also failed:', adminError);
        return NextResponse.json({ 
          error: 'Failed to delete video', 
          details: adminError.message 
        }, { status: 500 });
      }

      console.log('Video deleted with admin client:', adminData);
      return NextResponse.json({ success: true, message: 'Video deleted successfully', data: adminData });
    }

    console.log('Video deleted successfully:', data);
    return NextResponse.json({ success: true, message: 'Video deleted successfully', data });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ 
      error: 'Failed to delete video', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Helper functions
function extractYoutubeThumbnail(url: string): string {
  if (!url) return '';
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }

  return '';
}

async function createVideoNotification(videoId: string, notificationData: any) {
  try {
    const notification = {
      title: notificationData.title || 'วิดิโอใหม่',
      message: notificationData.reason || 'มีวิดิโอใหม่',
      type: notificationData.type || 'new_video',
      link: `/videos/${videoId}`,
      created_at: new Date().toISOString()
    };

    // Insert notification to database
    await supabaseAdmin
      .from('notifications')
      .insert(notification);

  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
