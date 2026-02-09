'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer } from '@/components/ui/SoundPlayer';
import { DAYS } from '@/lib/datelock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReflectionResponse {
  reflection: string;
  completed: boolean;
}

export default function RoseDayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  
  const [accepted, setAccepted] = useState(false);
  const [partnerAccepted, setPartnerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if player has joined through room
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      // Redirect to home if not in a room
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExistingAcceptance();
    
    // Poll for updates every 10 seconds (reduce API calls to save Gemini quota)
    const pollInterval = setInterval(() => {
      if (!reflection) {
        checkExistingAcceptance();
      } else {
        clearInterval(pollInterval); // Stop polling once we have the reflection
      }
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const checkExistingAcceptance = async () => {
    try {
      const playerId = localStorage.getItem('playerId');
      const url = `${API_URL}/api/day/1/status?room=${roomId}&playerId=${playerId || ''}`;
      console.log('Checking status:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Status response:', data);
      
      if (data.accepted) {
        setAccepted(true);
        if (data.partnerAccepted) {
          setPartnerAccepted(true);
          if (data.reflection) {
            setReflection(data.reflection);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check acceptance status:', error);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    
    try {
      const playerId = localStorage.getItem('playerId');
      
      if (!playerId) {
        throw new Error('Player ID not found');
      }
      
      const response = await fetch(`${API_URL}/api/day/1/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });

      const data: ReflectionResponse = await response.json();

      setAccepted(true);
      
      if (data.completed) {
        setPartnerAccepted(true);
        setReflection(data.reflection || null);
      }
    } catch (error) {
      console.error('Failed to accept rose:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/room/${roomId}`);
  };

  if (!mounted) {
    return null;
  }

  const dayInfo = DAYS[0];
  const dayNumber = 1;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50" />
      
      {/* Sound player */}
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard 
          variant="medium" 
          colored 
          dayTheme={dayNumber}
          className="p-8 text-center"
        >
          {/* Day header */}
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">
              Day 1 • February 7
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Rose Day
            </h1>
            <p className="text-gray-700">
              A quiet beginning
            </p>
          </div>
          
          {/* Rose illustration/animation area */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              {/* Animated rose glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse-soft" />
              
              {/* Rose icon */}
              <div className="relative text-8xl">
                🌹
              </div>
            </div>
          </div>
          
          {!accepted ? (
            <div className="space-y-4">
              <p className="text-gray-700 mb-6">
                Accept this rose to begin your journey together
              </p>
              
              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleAccept}
                loading={loading}
              >
                Accept This Rose
              </GlassButton>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                <span>
                  {partnerAccepted 
                    ? 'Creating your reflection...'
                    : 'Waiting for your partner...'}
                </span>
              </div>
              
              {partnerAccepted && (
                <div className="mt-4">
                  <div className="animate-spin mx-auto h-8 w-8 border-4 border-rose-400 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <GlassCard variant="subtle" className="p-6">
                <div className="text-sm uppercase tracking-widest text-gray-600 mb-3">
                  AI Reflection
                </div>
                <p className="text-gray-800 leading-relaxed italic">
                  {reflection}
                </p>
              </GlassCard>
              
              <GlassButton
                variant="primary"
                size="md"
                onClick={handleContinue}
              >
                Continue Journey →
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
