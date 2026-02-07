'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { DAYS, isDayUnlocked } from '@/lib/datelock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RoomData {
  id: string;
  player1: { id: string; name: string } | null;
  player2: { id: string; name: string } | null;
  progress: any[];
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Check for welcome back message
    const savedMessage = localStorage.getItem('welcomeMessage');
    if (savedMessage) {
      setWelcomeMessage(savedMessage);
      localStorage.removeItem('welcomeMessage');
    }
    
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}`);
      const data = await response.json();
      
      if (data.error) {
        router.push('/');
        return;
      }
      
      setRoom(data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day: number) => {
    if (isDayUnlocked(day)) {
      router.push(`/day/${day}?room=${roomId}`);
    }
  };

  if (!mounted || loading) {
    return null;
  }

  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') : null;
  const playerName = typeof window !== 'undefined' ? localStorage.getItem('playerName') : null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50" />
      
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Room: {roomId}
          </h1>
          <p className="text-gray-600">
            {welcomeMessage ? (
              <span className="text-green-600 font-medium">✨ {welcomeMessage}</span>
            ) : (
              playerName ? `Welcome, ${playerName}` : 'Welcome'
            )}
          </p>
        </div>

        {/* Partner info */}
        <GlassCard variant="medium" className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Journey</h2>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                {room?.player1?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{room?.player1?.name || 'Waiting...'}</p>
                <p className="text-sm text-gray-500">Player 1</p>
              </div>
            </div>
            
            <div className="text-gray-400">❤️</div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                {room?.player2?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{room?.player2?.name || 'Waiting...'}</p>
                <p className="text-sm text-gray-500">Player 2</p>
              </div>
            </div>
          </div>

          {!room?.player2 && (
            <div className="text-center p-4 bg-white/20 rounded-xl">
              <p className="text-gray-700">
                Share this room code with your partner:
              </p>
              <p className="text-2xl font-bold text-gray-900 tracking-widest mt-2">
                {roomId}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Days grid */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Days</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {DAYS.map((dayInfo) => {
            const unlocked = isDayUnlocked(dayInfo.day);
            const completed = room?.progress?.[dayInfo.day - 1]?.completed;
            
            return (
              <GlassCard
                key={dayInfo.day}
                variant={unlocked ? 'medium' : 'subtle'}
                dayTheme={dayInfo.day}
                className={`
                  p-4 text-center
                  ${unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60'}
                  ${completed ? 'ring-2 ring-green-400' : ''}
                `}
                onClick={() => handleDayClick(dayInfo.day)}
              >
                <div className="text-3xl mb-2">{dayInfo.emoji}</div>
                <div className="text-sm font-medium text-gray-900">Day {dayInfo.day}</div>
                <div className="text-xs text-gray-600 mb-2">{dayInfo.name}</div>
                
                {completed ? (
                  <div className="text-green-600 text-sm">✓ Complete</div>
                ) : unlocked ? (
                  <div className="text-gray-500 text-sm">Ready</div>
                ) : (
                  <div className="text-gray-400 text-sm">🔒 Locked</div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <GlassButton variant="secondary" onClick={() => router.push('/')}>
            Leave Room
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
