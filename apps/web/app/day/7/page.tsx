'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// For day status, we need to use the Railway backend API which has all endpoints
const getStatusUrl = (dayNum: number, room: string, pid: string) => {
  return `${API_URL}/api/room/${room}?playerId=${pid}`;
};

interface DayStatusType {
  submitted?: boolean;
  partnerSubmitted?: boolean;
  reflection?: string;
  playerNeed?: string;
  playerResponse?: string;
  partnerNeed?: string;
  partnerResponse?: string;
}

export default function Day7Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  const dayNumber = 7;
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [need, setNeed] = useState('');
  const [response, setResponse] = useState('');
  const [dayStatus, setDayStatus] = useState<DayStatusType | null>(null);

  useEffect(function() {
    setMounted(true);
    
    const pid = localStorage.getItem('playerId');
    if (!pid) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExisting();
    
    // Poll every 2 seconds for partner data (faster)
    const poll = setInterval(function() {
      if (!reflection) {
        checkExisting();
      } else if (submitted && partnerSubmitted && !dayStatus?.partnerNeed) {
        // Keep polling for partner data even after completion
        checkExisting();
      } else {
        clearInterval(poll);
      }
    }, 2000);
    
    return function() { clearInterval(poll); };
  }, []);

  const checkExisting = async function() {
    try {
      const pid = localStorage.getItem('playerId');
      // Use Railway backend API which has the room endpoint
      const res = await fetch(getStatusUrl(dayNumber, roomId, pid || ''));
      const roomData = await res.json();
      
      // Get day progress from room data
      const dayProgress = roomData.progress?.[dayNumber - 1];
      const data = dayProgress?.data || {};
      
      // Check if player has submitted
      const isPlayer1 = roomData.player1?.id === pid;
      const playerSubmitted = isPlayer1 ? data.p1Need : data.p2Need;
      const partnerSubmitted = isPlayer1 ? data.p2Need : data.p1Need;
      
      // Update states
      setDayStatus({
        submitted: !!playerSubmitted,
        partnerSubmitted: !!partnerSubmitted,
        reflection: dayProgress?.aiReflection || null,
        playerNeed: isPlayer1 ? data.p1Need : data.p2Need,
        playerResponse: isPlayer1 ? data.p1Response : data.p2Response,
        partnerNeed: isPlayer1 ? data.p2Need : data.p1Need,
        partnerResponse: isPlayer1 ? data.p2Response : data.p1Response,
      });
      
      if (playerSubmitted) {
        setSubmitted(true);
      }
      if (partnerSubmitted) {
        setPartnerSubmitted(true);
        if (dayProgress?.aiReflection) {
          setReflection(dayProgress.aiReflection);
        }
      }
    } catch (e) { console.error('Check failed:', e); }
  };

  const handleSubmit = async function() {
    if (!need.trim()) return alert('Please share what support you need');
    if (!response.trim()) return alert('Please share how you support your partner');
    
    setLoading(true);
    try {
      const pid = localStorage.getItem('playerId');
      // Use Railway backend API
      const res = await fetch(API_URL + '/api/day/' + dayNumber + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: roomId, 
          playerId: pid, 
          day: dayNumber,
          data: { need, response }
        }),
      });
      const data = await res.json();
      setSubmitted(true);
      
      // Update our own data immediately
      setDayStatus((prev: DayStatusType | null) => ({
        ...(prev || {}),
        submitted: true,
        playerNeed: need,
        playerResponse: response
      }));
      
      if (data.completed) {
        setPartnerSubmitted(true);
        setReflection(data.reflection || null);
        // Fetch partner data after a short delay
        setTimeout(() => checkExisting(), 1000);
      }
    } catch (e) { console.error('Submit failed:', e); }
    finally { setLoading(false); }
  };

  const handleContinue = function() { router.push('/room/' + roomId); };
  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-rose-900 to-pink-900">
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="medium" colored dayTheme={7} className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-white/60 mb-2">Day 7 - February 13</div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Hug Day</h1>
            <p className="text-white/80">How do you offer support to each other?</p>
          </div>
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-orange-400" />
              <div className="relative text-6xl">🤗</div>
            </div>
          </div>
          
          {!submitted ? (
            <div className="space-y-6 text-left">
              {/* What support I need */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">When I need support, I prefer...</label>
                <textarea
                  value={need}
                  onChange={function(e) { setNeed(e.target.value); }}
                  placeholder="When I'm sad, I need you to..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{need.length}/200</div>
              </div>
              
              {/* How I support partner */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">When my partner needs support, I...</label>
                <textarea
                  value={response}
                  onChange={function(e) { setResponse(e.target.value); }}
                  placeholder="When they're sad, I support them by..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{response.length}/200</div>
              </div>
              
              <div className="text-center">
                <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading} disabled={!need.trim() || !response.trim()}>
                  Share Our Support 🤗
                </GlassButton>
              </div>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-white/80">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span>{partnerSubmitted ? 'Creating reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message slider - show both support styles */}
              <div className="mb-6">
                <MessageSlider
                  player1Message={dayStatus?.playerNeed ? `I need: ${dayStatus.playerNeed}. I give: ${dayStatus.playerResponse || ''}` : 'Your support style'}
                  player2Message={dayStatus?.partnerNeed ? `They need: ${dayStatus.partnerNeed}. They give: ${dayStatus.partnerResponse || ''}` : 'Waiting for partner...'}
                  player1Name={localStorage.getItem('playerName') || 'You'}
                  player2Name="Partner"
                />
              </div>
              
              <GlassCard variant="subtle" className="p-6">
                <div className="text-sm uppercase tracking-widest text-white/60 mb-3">AI Reflection</div>
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
