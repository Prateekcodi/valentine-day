'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const [dayStatus, setDayStatus] = useState<any>(null);

  useEffect(function() {
    setMounted(true);
    
    const pid = localStorage.getItem('playerId');
    if (!pid) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExisting();
    const poll = setInterval(function() { if (!reflection) checkExisting(); else clearInterval(poll); }, 10000);
    return function() { clearInterval(poll); };
  }, []);

  const checkExisting = async function() {
    try {
      const pid = localStorage.getItem('playerId');
      const res = await fetch(API_URL + '/api/day/' + dayNumber + '/status?room=' + roomId + '&playerId=' + (pid || ''));
      const data = await res.json();
      setDayStatus(data);
      if (data.submitted) {
        setSubmitted(true);
        if (data.partnerSubmitted) {
          setPartnerSubmitted(true);
          if (data.reflection) setReflection(data.reflection);
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
      
      // Update dayStatus with our need so MessageSlider works
      setDayStatus({
        submitted: true,
        partnerSubmitted: data.completed,
        reflection: data.reflection || null,
        playerNeed: need,
        partnerNeed: data.completed ? dayStatus?.partnerNeed || '' : ''
      });
      
      if (data.completed) {
        setPartnerSubmitted(true);
        setReflection(data.reflection || null);
      }
    } catch (e) { console.error('Submit failed:', e); }
    finally { setLoading(false); }
  };

  const handleContinue = function() { router.push('/room/' + roomId); };
  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-rose-50 to-rose-100">
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="medium" colored dayTheme={7} className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">Day 7 - February 13</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Hug Day</h1>
            <p className="text-gray-700">How do you offer support to each other?</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">When I need support, I prefer...</label>
                <textarea
                  value={need}
                  onChange={function(e) { setNeed(e.target.value); }}
                  placeholder="When I'm sad, I need you to..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{need.length}/200</div>
              </div>
              
              {/* How I support partner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When my partner needs support, I...</label>
                <textarea
                  value={response}
                  onChange={function(e) { setResponse(e.target.value); }}
                  placeholder="When they're sad, I support them by..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
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
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span>{partnerSubmitted ? 'Creating reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {dayStatus?.playerNeed && (
                <div className="mb-6">
                  <MessageSlider
                    player1Message={dayStatus.playerNeed || ''}
                    player2Message={dayStatus.partnerNeed || 'Waiting for partner...'}
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
