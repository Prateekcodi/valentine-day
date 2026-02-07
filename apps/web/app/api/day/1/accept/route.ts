import { NextRequest, NextResponse } from 'next/server';

// Proxy to backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, playerId } = body;

    if (!roomId || !playerId) {
      return NextResponse.json(
        { error: 'Room ID and Player ID are required' },
        { status: 400 }
      );
    }

    // Proxy to backend server
    const response = await fetch(`${API_URL}/api/day/1/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, playerId }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to accept rose:', error);
    return NextResponse.json(
      { error: 'Failed to process acceptance' },
      { status: 500 }
    );
  }
}
