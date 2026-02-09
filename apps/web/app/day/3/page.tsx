'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';
import { DAYS, getThemeColors } from '@/lib/datelock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChocolateDayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  const dayNumber = 3;
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState('comfort');
  const [message, setMessage] = useState('');
  const [dayStatus, setDayStatus] = useState<any>(null);

  useEffect(function() {
    setMounted(true);
    
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExistingSubmission();
    const pollInterval = setInterval(function() {
      if (!reflection) checkExistingSubmission();
      else clearInterval(pollInterval);
    }, 10000);
    return function() { clearInterval(pollInterval); };
  }, []);

  const checkExistingSubmission = async function() {
    try {
      const playerId = localStorage.getItem('playerId');
      const response = await fetch(API_URL + '/api/day/' + dayNumber + '/status?room=' + roomId + '&playerId=' + (playerId || ''));
      const data = await response.json();
      setDayStatus(data);
      if (data.submitted) {
        setSubmitted(true);
        if (data.partnerSubmitted) {
          setPartnerSubmitted(true);
          if (data.reflection) setReflection(data.reflection);
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const handleSubmit = async function() {
    setLoading(true);
    try {
      const playerId = localStorage.getItem('playerId');
      const response = await fetch(API_URL + '/api/day/' + dayNumber + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: roomId, 
          playerId: playerId, 
          choice: choice,
          message: message  // Send message to AI
        }),
      });
      const data = await response.json();
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

  const handleContinue = function() { router.push('/room/' + roomId); };

  if (!mounted) return null;

  const dayInfo = DAYS[2];
  const theme = getThemeColors(dayInfo.theme);

  const chocolateTypes: Record<string, { emoji: string; label: string; desc: string }> = {
    comfort: { emoji: '🍫', label: 'Comfort', desc: 'Warmth & reassurance' },
    sweet: { emoji: '🍬', label: 'Sweet', desc: 'Joy & playfulness' },
    dark: { emoji: '🍫', label: 'Dark', desc: 'Depth & intensity' },
    surprise: { emoji: '🎁', label: 'Surprise', desc: 'Adventure & spontaneity' }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, ' + theme.secondary + ' 0%, ' + theme.primary + '20 100%)' }}>
      {/* Sound player */}
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="medium" colored dayTheme={dayNumber} className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">Day {dayNumber} - February 9</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{dayInfo.name}</h1>
            <p className="text-gray-700">Choose a chocolate for your partner</p>
          </div>
          
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: theme.primary }} />
              <div className="relative text-6xl">{dayInfo.emoji}</div>
            </div>
          </div>
          
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">What kind of chocolate represents your love?</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(chocolateTypes).map(function([key, type]) {
                  return (
                    <button
                      key={key}
                      onClick={function() { setChoice(key); }}
                      className={'p-4 rounded-xl border-2 transition-all ' + (choice === key ? 'border-white bg-white/30' : 'border-white/20 bg-white/10 hover:bg-white/20')}
                    >
                      <div className="text-3xl mb-1">{type.emoji}</div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-600">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
              
              {/* Message Box - Why you chose this chocolate */}
              <div className="mt-6 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why did you choose this? (optional)
                </label>
                <textarea
                  value={message}
                  onChange={function(e) { setMessage(e.target.value); }}
                  placeholder="Tell them why this chocolate represents your love..."
                  maxLength={150}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">{message.length}/150</div>
              </div>
              
              <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading} className="mt-4">
                Send Chocolate 💝
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
              {/* Message slider to see each other's choices */}
              {dayStatus?.playerChoice && dayStatus?.partnerChoice && (
                <div className="mb-6">
                  <MessageSlider
                    player1Message={dayStatus.playerChoice}
                    player2Message={dayStatus.partnerChoice}
                    player1Name={localStorage.getItem('playerName') || 'You'}
                    player2Name="Partner"
                  />
                </div>
              )}
              
              <GlassCard variant="subtle" className="p-6">
                <div className="text-sm uppercase tracking-widest text-gray-600 mb-3">AI Reflection</div>
                <p className="text-gray-800 leading-relaxed italic">{reflection}</p>
              </GlassCard>
              <GlassButton variant="primary" size="md" onClick={handleContinue}>Continue Journey</GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
