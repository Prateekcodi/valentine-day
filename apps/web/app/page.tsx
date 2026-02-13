'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { SoundPlayer } from '@/components/ui/SoundPlayer';
import { validateName, validateRoomCode } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = async () => {
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      setError(nameValidation.message || 'Invalid name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);
      localStorage.setItem('roomId', data.roomId);

      router.push(`/room/${data.roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      setError(nameValidation.message || 'Invalid name');
      return;
    }

    const codeValidation = validateRoomCode(roomCode);
    if (!codeValidation.valid) {
      setError(codeValidation.message || 'Invalid room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode.toUpperCase(), playerName: name }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem('playerId', data.playerId);
      localStorage.setItem('playerName', name);
      localStorage.setItem('roomId', roomCode.toUpperCase());

      // Store welcome back message if rejoining
      if (data.rejoined && data.message) {
        localStorage.setItem('welcomeMessage', data.message);
      }

      router.push(`/room/${roomCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-rose-900 to-pink-900" />
      
      {/* Sound player */}
      <SoundPlayer autoPlay={true} />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            7 Days, One Choice
          </h1>
          <p className="text-xl text-white/80 mb-2">
            A time-locked Valentine Week experience
          </p>
          <p className="text-white/60">
            February 7–14, 2026
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <GlassCard variant="medium" hover className="p-6 text-center">
            <div className="text-4xl mb-3">🗓️</div>
            <h3 className="font-semibold text-white mb-2">
              8 Days
            </h3>
            <p className="text-sm text-white/70">
              Each day unlocks a new chapter of your journey together
            </p>
          </GlassCard>
          
          <GlassCard variant="medium" hover className="p-6 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-white mb-2">
              AI Reflections
            </h3>
            <p className="text-sm text-white/70">
              Thoughtful insights powered by emotional intelligence
            </p>
          </GlassCard>
          
          <GlassCard variant="medium" hover className="p-6 text-center">
            <div className="text-4xl mb-3">💝</div>
            <h3 className="font-semibold text-white mb-2">
              Shared Experience
            </h3>
            <p className="text-sm text-white/70">
              Real-time sync keeps you connected every step
            </p>
          </GlassCard>
        </div>
        
        <GlassCard variant="strong" className="max-w-md mx-auto p-8">
          {!mode ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                Start Your Journey
              </h2>
              
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => setMode('create')}
                className="w-full"
              >
                Create New Room
              </GlassButton>
              
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/30" />
                <span className="text-sm text-gray-600">or</span>
                <div className="h-px flex-1 bg-white/30" />
              </div>
              
              <GlassButton
                variant="secondary"
                size="lg"
                onClick={() => setMode('join')}
                className="w-full"
              >
                Join Existing Room
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setMode(null);
                  setError('');
                }}
                className="text-sm text-white/60 hover:text-white flex items-center gap-2"
              >
                ← Back
              </button>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Your Name
                </label>
                <GlassInput
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  maxLength={30}
                />
              </div>
              
              {mode === 'join' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Room Code
                  </label>
                  <GlassInput
                    value={roomCode}
                    onChange={(v) => {
                      setRoomCode(v.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                  />
                </div>
              )}
              
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <GlassButton
                variant="primary"
                size="lg"
                disabled={!name.trim() || (mode === 'join' && roomCode.length !== 6)}
                loading={loading}
                onClick={mode === 'create' ? handleCreate : handleJoin}
                className="w-full"
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </GlassButton>
            </div>
          )}
        </GlassCard>
        
        <div className="mt-12 text-center">
          <GlassCard variant="subtle" className="inline-block px-6 py-3">
            <p className="text-sm text-white/60">
              ✨ Created with intention • Built with care
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
