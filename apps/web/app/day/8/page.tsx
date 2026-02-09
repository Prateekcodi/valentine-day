'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Day8Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  const dayNumber = 8;
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setLoading(true);
    try {
      const pid = localStorage.getItem('playerId');
      const res = await fetch(API_URL + '/api/day/' + dayNumber + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomId, playerId: pid, day: dayNumber }),
      });
      const data = await res.json();
      setSubmitted(true);
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-100 via-pink-100 to-rose-200">
      <SoundPlayer autoPlay={true} />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-300/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="strong" className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-gray-600 mb-2">February 14</div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Valentine's Day</h1>
            <p className="text-gray-700 text-lg">The final day of your journey</p>
          </div>
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-full blur-3xl opacity-40 animate-pulse" />
              <div className="relative text-8xl">💝</div>
            </div>
          </div>
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-gray-700">Click below to complete your journey together</p>
              <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading}>Complete Our Journey</GlassButton>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>{partnerSubmitted ? 'Creating your final reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <GlassCard variant="subtle" className="p-6">
                <div className="text-sm uppercase tracking-widest text-gray-600 mb-3">Your Journey Together</div>
                <p className="text-gray-800 leading-relaxed italic text-lg">{reflection}</p>
              </GlassCard>
              <GlassCard variant="medium" colored dayTheme={8} className="p-6">
                <div className="text-gray-800">
                  <p className="font-semibold mb-2">💝 Happy Valentine's Day!</p>
                  <p className="text-sm">Thank you for sharing this journey together.</p>
                </div>
              </GlassCard>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
