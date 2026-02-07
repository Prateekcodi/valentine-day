import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (shared with create route via global)
declare global {
  var __rooms: Map<string, any> | undefined;
}

const rooms = global.__rooms || new Map();

if (process.env.NODE_ENV !== 'production') {
  global.__rooms = rooms;
}

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, playerName } = body;

    if (!roomId || roomId.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid room code' },
        { status: 400 }
      );
    }

    if (!playerName || playerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.player2) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      );
    }

    const playerId = generatePlayerId();

    room.player2 = {
      id: playerId,
      name: playerName.trim(),
      joinedAt: new Date().toISOString(),
    };

    rooms.set(roomId.toUpperCase(), room);

    return NextResponse.json({
      roomId: roomId.toUpperCase(),
      playerId,
    });
  } catch (error) {
    console.error('Failed to join room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
