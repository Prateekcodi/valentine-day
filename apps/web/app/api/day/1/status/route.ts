import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
declare global {
  var __rooms: Map<string, any> | undefined;
}

const rooms = global.__rooms || new Map();

if (process.env.NODE_ENV !== 'production') {
  global.__rooms = rooms;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
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

    const playerId = typeof window !== 'undefined'
      ? localStorage.getItem('playerId')
      : null;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player not identified' },
        { status: 401 }
      );
    }

    const dayProgress = room.progress[0]; // Day 1
    const data = dayProgress?.data || {};
    
    const isPlayer1 = room.player1?.id === playerId;
    const hasAccepted = isPlayer1 ? data.player1Accepted : data.player2Accepted;
    const partnerAccepted = isPlayer1 ? data.player2Accepted : data.player1Accepted;

    return NextResponse.json({
      accepted: hasAccepted,
      partnerAccepted: partnerAccepted || false,
      reflection: dayProgress?.aiReflection || null,
      completed: dayProgress?.completed || false,
    });
  } catch (error) {
    console.error('Failed to get day status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
