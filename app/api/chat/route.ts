import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(process.cwd(), 'data', 'chat-messages.json');
const autoRepliesFilePath = path.join(process.cwd(), 'data', 'auto-replies.json');
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

interface AutoReply {
  id: string;
  keywords: string[];
  response: string;
  isActive: boolean;
  priority: number;
}

interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'active' | 'resolved' | 'waiting';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
}

// Get all messages or filter by roomId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');
    const getRooms = searchParams.get('getRooms');

    const messages: ChatMessage[] = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));

    // Get chat rooms list
    if (getRooms === 'true') {
      const rooms: { [key: string]: ChatRoom } = {};

      messages.forEach((msg) => {
        if (!rooms[msg.roomId]) {
          rooms[msg.roomId] = {
            id: msg.roomId,
            userId: msg.userId,
            userName: msg.userName,
            userEmail: msg.userEmail,
            status: 'active',
            lastMessage: msg.message,
            lastMessageTime: msg.timestamp,
            unreadCount: 0,
            createdAt: msg.timestamp,
          };
        } else {
          if (new Date(msg.timestamp) > new Date(rooms[msg.roomId].lastMessageTime)) {
            rooms[msg.roomId].lastMessage = msg.message;
            rooms[msg.roomId].lastMessageTime = msg.timestamp;
          }
        }

        if (!msg.isAdmin && msg.status !== 'read') {
          rooms[msg.roomId].unreadCount++;
        }
      });

      return NextResponse.json(Object.values(rooms).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ));
    }

    // Get messages for specific room
    if (roomId) {
      const roomMessages = messages.filter((msg) => msg.roomId === roomId);
      return NextResponse.json(roomMessages);
    }

    // Get messages for specific user (create room if not exists)
    if (userId) {
      const userMessages = messages.filter((msg) => msg.userId === userId);
      return NextResponse.json(userMessages);
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error reading messages:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// Send new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userId, userName, userEmail, message, isAdmin, attachments } = body;

    const messages: ChatMessage[] = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: roomId || `room_${userId}_${Date.now()}`,
      userId,
      userName,
      userEmail,
      message,
      isAdmin: isAdmin || false,
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachments: attachments || [],
    };

    messages.push(newMessage);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

    // Check for auto-reply (only for user messages)
    if (!isAdmin) {
      const autoReply = await checkAutoReply(message);
      if (autoReply) {
        const autoReplyMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          roomId: newMessage.roomId,
          userId: 'system',
          userName: 'ระบบตอบกลับอัตโนมัติ',
          userEmail: 'system@poolvilla.com',
          message: autoReply,
          isAdmin: true,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          status: 'sent',
        };

        messages.push(autoReplyMessage);
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

        return NextResponse.json({ message: newMessage, autoReply: autoReplyMessage });
      }
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Update message status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const action = searchParams.get('action');

    const messages: ChatMessage[] = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));

    if (action === 'markAsRead' && roomId) {
      messages.forEach((msg) => {
        if (msg.roomId === roomId && !msg.isAdmin) {
          msg.status = 'read';
        }
      });

      fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// Delete message or room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const roomId = searchParams.get('roomId');

    let messages: ChatMessage[] = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));

    if (messageId) {
      messages = messages.filter((msg) => msg.id !== messageId);
    } else if (roomId) {
      messages = messages.filter((msg) => msg.roomId !== roomId);
    }

    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// Check for auto-reply
async function checkAutoReply(message: string): Promise<string | null> {
  try {
    const autoReplies: AutoReply[] = JSON.parse(fs.readFileSync(autoRepliesFilePath, 'utf-8'));
    const messageLower = message.toLowerCase();

    // Sort by priority (higher first)
    const sortedReplies = autoReplies
      .filter((reply) => reply.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const reply of sortedReplies) {
      for (const keyword of reply.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          return reply.response;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking auto-reply:', error);
    return null;
  }
}
