import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (replace with MongoDB in production)
const rooms = new Map();

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || playerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    const roomId = generateRoomId();
    const playerId = generatePlayerId();

    const room = {
      id: roomId,
      player1: {
        id: playerId,
        name: playerName.trim(),
        joinedAt: new Date().toISOString(),
      },
      player2: null,
      progress: Array.from({ length: 8 }, (_, i) => ({
        day: i + 1,
        completed: false,
        data: null,
        aiReflection: null,
        completedAt: null,
      })),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    };

    rooms.set(roomId, room);

    return NextResponse.json({
      roomId,
      playerId,
    });
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
