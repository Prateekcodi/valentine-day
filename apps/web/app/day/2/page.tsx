'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer } from '@/components/ui/SoundPlayer';
import { MessageSlider } from '@/components/ui/SoundPlayer';
import { DAYS, getThemeColors } from '@/lib/datelock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReflectionResponse {
  reflection: string;
  completed: boolean;
}

interface DayStatus {
  submitted: boolean;
  partnerSubmitted: boolean;
  reflection: string | null;
  playerMessage?: string;
  partnerMessage?: string;
}

export default function ProposeDayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  const dayNumber = 2;
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dayStatus, setDayStatus] = useState<DayStatus | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExistingSubmission();
    
    const pollInterval = setInterval(() => {
      if (!reflection) {
        checkExistingSubmission();
      } else {
        clearInterval(pollInterval);
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const checkExistingSubmission = async () => {
    try {
      const playerId = localStorage.getItem('playerId');
      const response = await fetch(`${API_URL}/api/day/${dayNumber}/status?room=${roomId}&playerId=${playerId || ''}`);
      const data: DayStatus = await response.json();
      
      console.log('Day 2 status:', data);
      setDayStatus(data);
      
      if (data.submitted) {
        setSubmitted(true);
        if (data.partnerSubmitted) {
          setPartnerSubmitted(true);
          if (data.reflection) {
            setReflection(data.reflection);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check submission status:', error);
    }
  };

  const handleSubmit = async () => {
    if (message.trim().length < 15) {
      alert('Message must be at least 15 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const playerId = localStorage.getItem('playerId');
      
      if (!playerId) {
        throw new Error('Player ID not found');
      }
      
      const response = await fetch(`${API_URL}/api/day/${dayNumber}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, message }),
      });

      const data: ReflectionResponse = await response.json();

      setSubmitted(true);
      
      if (data.completed) {
        setPartnerSubmitted(true);
        setReflection(data.reflection || null);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
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

  const dayInfo = DAYS[1];
  const theme = getThemeColors(dayInfo.theme);
  const playerName = localStorage.getItem('playerName') || 'Player';
  const partnerName = dayStatus?.partnerSubmitted ? 'Partner' : '';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary}20 100%)` }}>
      {/* Sound player with nature sounds */}
      <SoundPlayer autoPlay={false} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard 
          variant="medium" 
          colored 
          dayTheme={dayNumber}
          className="p-8 text-center"
        >
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">
              Day {dayNumber} - February 8
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {dayInfo.name}
            </h1>
            <p className="text-gray-700">One honest sentence</p>
          </div>
          
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: theme.primary }} />
              <div className="relative text-6xl">{dayInfo.emoji}</div>
            </div>
          </div>
          
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">Write one honest sentence about how you feel (15-150 characters)</p>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                maxLength={150}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 h-32 resize-none"
              />
              
              <div className="text-sm text-gray-500">{message.length}/150 characters</div>
              
              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                disabled={message.trim().length < 15}
              >
                Send Message
              </GlassButton>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.primary }} />
                <span>{partnerSubmitted ? 'Creating reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message slider to see each other's messages */}
              {dayStatus?.playerMessage && dayStatus?.partnerMessage && (
                <div className="mb-6">
                  <MessageSlider
                    player1Message={dayStatus.playerMessage}
                    player2Message={dayStatus.partnerMessage}
                    player1Name={playerName}
                    player2Name="Partner"
                  />
                </div>
              )}
              
              <GlassCard variant="subtle" className="p-6">
                <div className="text-sm uppercase tracking-widest text-gray-600 mb-3">AI Reflection</div>
                <p className="text-gray-800 leading-relaxed italic">{reflection}</p>
              </GlassCard>
              
              <GlassButton variant="primary" size="md" onClick={handleContinue}>
                Continue Journey
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
