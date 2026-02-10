'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DAY_NUMBER = 5;
const DAY_TITLE = 'Promise Day';
const DAY_DESCRIPTION = 'Make a realistic promise to each other';
const DAY_EMOJI = '💍';

interface DayStatusType {
  submitted?: boolean;
  partnerSubmitted?: boolean;
  reflection?: string;
  playerPromise?: string;
  partnerPromise?: string;
}

export default function Day5Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
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
      } else if (submitted && partnerSubmitted && !dayStatus?.partnerPromise) {
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
      const res = await fetch(API_URL + '/api/day/' + DAY_NUMBER + '/status?room=' + roomId + '&playerId=' + (pid || ''));
      const data = await res.json();
      
      // Update dayStatus with all data
      setDayStatus(data);
      
      if (data.submitted) {
        setSubmitted(true);
        
        if (data.partnerSubmitted) {
          setPartnerSubmitted(true);
          if (data.reflection) setReflection(data.reflection);
        }
        
        // If we have player data, update the slider
        if (data.playerPromise) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            playerPromise: data.playerPromise,
            partnerPromise: data.partnerPromise || prev?.partnerPromise || ''
          }));
        }
        
        // If partner submitted, update their data
        if (data.partnerPromise) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            partnerPromise: data.partnerPromise
          }));
        }
      }
    } catch (e) { console.error('Check failed:', e); }
  };

  const handleSubmit = async function() {
    if (!message.trim()) return alert('Please write your promise');
    if (message.length < 20) return alert('Please write at least 20 characters');
    
    setLoading(true);
    try {
      const pid = localStorage.getItem('playerId');
      const res = await fetch(API_URL + '/api/day/' + DAY_NUMBER + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomId, playerId: pid, day: DAY_NUMBER, data: message }),
      });
      const data = await res.json();
      setSubmitted(true);
      
      // Update our own data immediately
      setDayStatus((prev: DayStatusType | null) => ({
        ...(prev || {}),
        submitted: true,
        playerPromise: message
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Sound player */}
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="medium" colored dayTheme={DAY_NUMBER} className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">Day {DAY_NUMBER} - February {6 + DAY_NUMBER}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{DAY_TITLE}</h1>
            <p className="text-gray-700">{DAY_DESCRIPTION}</p>
          </div>
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-rose-400" />
              <div className="relative text-6xl">{DAY_EMOJI}</div>
            </div>
          </div>
          {!submitted ? (
            <div className="space-y-4 text-left">
              <p className="text-gray-700 mb-4">Write a realistic promise to your partner. Be specific and heartfelt.</p>
              
              <textarea
                value={message}
                onChange={function(e) { setMessage(e.target.value); }}
                placeholder="I promise to... (be specific and realistic)"
                maxLength={300}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                rows={4}
              />
              <div className="text-xs text-gray-500 text-right">{message.length}/300</div>
              
              <div className="text-center">
                <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading} disabled={message.length < 20}>
                  Make My Promise 💍
                </GlassButton>
              </div>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                <span>{partnerSubmitted ? 'Creating reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message slider - show both promises */}
              <div className="mb-6">
                <MessageSlider
                  player1Message={dayStatus?.playerPromise || 'Your promise'}
                  player2Message={dayStatus?.partnerPromise || 'Waiting for partner...'}
                  player1Name={localStorage.getItem('playerName') || 'You'}
                  player2Name="Partner"
                />
              </div>
              
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
