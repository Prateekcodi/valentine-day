import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
declare global {
  var __rooms: Map<string, any> | undefined;
}

const rooms = global.__rooms || new Map();

if (process.env.NODE_ENV !== 'production') {
  global.__rooms = rooms;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId.toUpperCase();
    const room = rooms.get(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Failed to get room:', error);
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    );
  }
}
