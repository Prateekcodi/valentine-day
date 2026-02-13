'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DayStatusType {
  submitted?: boolean;
  partnerSubmitted?: boolean;
  reflection?: string;
  playerAffection?: string;
  partnerAffection?: string;
  playerMessage?: string;
  partnerMessage?: string;
}

export default function Day6Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  const dayNumber = 6;
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [affection, setAffection] = useState('words');
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
      } else if (submitted && partnerSubmitted && !dayStatus?.partnerAffection) {
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
      const res = await fetch(API_URL + '/api/day/' + dayNumber + '/status?room=' + roomId + '&playerId=' + (pid || ''));
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
        if (data.playerAffection) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            playerAffection: data.playerAffection,
            playerMessage: data.playerMessage,
            partnerAffection: data.partnerAffection || prev?.partnerAffection || '',
            partnerMessage: data.partnerMessage || prev?.partnerMessage || ''
          }));
        }
        
        // If partner submitted, update their data
        if (data.partnerAffection) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            partnerAffection: data.partnerAffection,
            partnerMessage: data.partnerMessage
          }));
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
        body: JSON.stringify({ 
          roomId: roomId, 
          playerId: pid, 
          day: dayNumber,
          data: { affection, message }
        }),
      });
      const data = await res.json();
      setSubmitted(true);
      
      // Update our own data immediately
      setDayStatus((prev: DayStatusType | null) => ({
        ...(prev || {}),
        submitted: true,
        playerAffection: affection,
        playerMessage: message
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

  const affectionTypes = [
    { value: 'words', emoji: '💬', label: 'Words', desc: 'I show love through words' },
    { value: 'time', emoji: '⏰', label: 'Time', desc: 'I show love by being present' },
    { value: 'actions', emoji: '✨', label: 'Actions', desc: 'I show love through deeds' },
    { value: 'touch', emoji: '💫', label: 'Touch', desc: 'I show love through hugs' },
    { value: 'gifts', emoji: '🎁', label: 'Gifts', desc: 'I show love through gifts' },
    { value: 'service', emoji: '🤝', label: 'Service', desc: 'I show love by helping' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
      <SoundPlayer autoPlay={true} />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <GlassCard variant="medium" colored dayTheme={6} className="p-8 text-center">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-widest text-white/60 mb-2">Day 6 - February 12</div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Kiss Day</h1>
            <p className="text-white/80">How do you show affection?</p>
          </div>
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-red-400" />
              <div className="relative text-6xl">💋</div>
            </div>
          </div>
          
          {!submitted ? (
            <div className="space-y-6 text-left">
              {/* Affection type selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">How do you show love?</label>
                <div className="grid grid-cols-3 gap-2">
                  {affectionTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={function() { setAffection(type.value); }}
                      className={'p-3 rounded-xl border-2 transition-all text-center ' + (affection === type.value ? 'border-white bg-white/30' : 'border-white/20 bg-white/10 hover:bg-white/20')}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="text-xs">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Tell them more about how you express love</label>
                <textarea
                  value={message}
                  onChange={function(e) { setMessage(e.target.value); }}
                  placeholder="I show my love by..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={3}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{message.length}/200</div>
              </div>
              
              <div className="text-center">
                <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading}>
                  Share My Love 💋
                </GlassButton>
              </div>
            </div>
          ) : !reflection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-white/80">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>{partnerSubmitted ? 'Creating reflection...' : 'Waiting for partner...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Message slider - show both messages */}
              <div className="mb-6">
                <MessageSlider
                  player1Message={dayStatus?.playerAffection ? `${dayStatus.playerAffection}: ${dayStatus.playerMessage || ''}` : 'Your affection style'}
                  player2Message={dayStatus?.partnerAffection ? `${dayStatus.partnerAffection}: ${dayStatus.partnerMessage || ''}` : 'Waiting for partner...'}
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
