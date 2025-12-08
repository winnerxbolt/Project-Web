import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const autoRepliesFilePath = path.join(process.cwd(), 'data', 'auto-replies.json');

interface AutoReply {
  id: string;
  keywords: string[];
  response: string;
  isActive: boolean;
  priority: number;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

// Get all auto-replies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly');

    let autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));

    if (activeOnly === 'true') {
      autoReplies = autoReplies.filter((reply) => reply.isActive);
    }

    // Sort by priority
    autoReplies.sort((a, b) => b.priority - a.priority);

    return NextResponse.json(autoReplies);
  } catch (error) {
    console.error('Error reading auto-replies:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// Create new auto-reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, response, priority, isActive } = body;

    if (!keywords || keywords.length === 0 || !response) {
      return NextResponse.json(
        { error: 'Keywords and response are required' },
        { status: 400 }
      );
    }

    const autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));

    const newAutoReply: AutoReply = {
      id: `auto_${Date.now()}`,
      keywords: keywords.map((k: string) => k.trim()),
      response,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 1,
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    autoReplies.push(newAutoReply);
    fs.writeFileSync(autoRepliesFilePath, JSON.stringify(autoReplies, null, 2));

    return NextResponse.json(newAutoReply);
  } catch (error) {
    console.error('Error creating auto-reply:', error);
    return NextResponse.json({ error: 'Failed to create auto-reply' }, { status: 500 });
  }
}

// Update auto-reply
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, keywords, response, priority, isActive } = body;

    const autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));
    const index = autoReplies.findIndex((reply) => reply.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Auto-reply not found' }, { status: 404 });
    }

    autoReplies[index] = {
      ...autoReplies[index],
      keywords: keywords ? keywords.map((k: string) => k.trim()) : autoReplies[index].keywords,
      response: response || autoReplies[index].response,
      priority: priority !== undefined ? priority : autoReplies[index].priority,
      isActive: isActive !== undefined ? isActive : autoReplies[index].isActive,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(autoRepliesFilePath, JSON.stringify(autoReplies, null, 2));
    return NextResponse.json(autoReplies[index]);
  } catch (error) {
    console.error('Error updating auto-reply:', error);
    return NextResponse.json({ error: 'Failed to update auto-reply' }, { status: 500 });
  }
}

// Increment use count
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));
    const index = autoReplies.findIndex((reply) => reply.id === id);

    if (index !== -1) {
      autoReplies[index].useCount++;
      fs.writeFileSync(autoRepliesFilePath, JSON.stringify(autoReplies, null, 2));
      return NextResponse.json(autoReplies[index]);
    }

    return NextResponse.json({ error: 'Auto-reply not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating use count:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// Delete auto-reply
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));
    autoReplies = autoReplies.filter((reply) => reply.id !== id);

    fs.writeFileSync(autoRepliesFilePath, JSON.stringify(autoReplies, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting auto-reply:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
