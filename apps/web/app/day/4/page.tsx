'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SoundPlayer, MessageSlider } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DAY_NUMBER = 4;
const DAY_TITLE = 'Teddy Day';
const DAY_DESCRIPTION = 'Share how you offer and receive comfort';
const DAY_EMOJI = '🧸';

export default function Day4Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('room') || '';
  
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [offering, setOffering] = useState('talk');
  const [receiving, setReceiving] = useState('talk');
  const [message, setMessage] = useState('');
  interface DayStatusType {
    submitted?: boolean;
    partnerSubmitted?: boolean;
    reflection?: string;
    playerOffering?: string;
    playerReceiving?: string;
    playerMessage?: string;
    partnerOffering?: string;
    partnerReceiving?: string;
    partnerMessage?: string;
  }
  
  const [dayStatus, setDayStatus] = useState<DayStatusType | null>(null);

  useEffect(function() {
    setMounted(true);
    
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    checkExisting();
    
    // Poll every 2 seconds for partner data (faster)
    const poll = setInterval(function() {
      if (!reflection) {
        checkExisting();
      } else if (submitted && partnerSubmitted && !dayStatus?.partnerOffering) {
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
        if (data.playerOffering) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            playerOffering: data.playerOffering,
            playerReceiving: data.playerReceiving,
            partnerOffering: data.partnerOffering || prev?.partnerOffering || '',
            partnerReceiving: data.partnerReceiving || prev?.partnerReceiving || ''
          }));
        }
        
        // If partner submitted, update their data
        if (data.partnerOffering) {
          setDayStatus((prev: DayStatusType | null) => ({
            ...(prev || {}),
            partnerOffering: data.partnerOffering,
            partnerReceiving: data.partnerReceiving
          }));
        }
      }
    } catch (e) { console.error('Check failed:', e); }
  };

  const handleSubmit = async function() {
    setLoading(true);
    try {
      const pid = localStorage.getItem('playerId');
      const res = await fetch(API_URL + '/api/day/' + DAY_NUMBER + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: roomId, 
          playerId: pid, 
          day: DAY_NUMBER,
          data: { offering, receiving, message }
        }),
      });
      const data = await res.json();
      setSubmitted(true);
      
      // Update our own data immediately
      setDayStatus((prev: DayStatusType | null) => ({
        ...(prev || {}),
        submitted: true,
        playerOffering: offering,
        playerReceiving: receiving,
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

  const comfortOptions = [
    { value: 'talk', label: '💬 Talking', desc: 'I comfort through conversation' },
    { value: 'silence', label: '🤫 Silence', desc: 'I comfort through quiet presence' },
    { value: 'hugs', label: '🤗 Hugs', desc: 'I comfort through physical touch' },
    { value: 'action', label: '✨ Actions', desc: 'I comfort by doing things' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-peach-50 to-orange-100">
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
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-orange-400" />
              <div className="relative text-6xl">{DAY_EMOJI}</div>
            </div>
          </div>
          
          {!submitted ? (
            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How do you offer comfort?</label>
                <div className="grid grid-cols-2 gap-2">
                  {comfortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={function() { setOffering(opt.value); }}
                      className={'p-3 rounded-xl border-2 transition-all ' + (offering === opt.value ? 'border-white bg-white/30' : 'border-white/20 bg-white/10 hover:bg-white/20')}
                    >
                      <div className="text-xl mb-1">{opt.label.split(' ')[0]}</div>
                      <div className="text-xs">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How do you prefer to receive comfort?</label>
                <div className="grid grid-cols-2 gap-2">
                  {comfortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={function() { setReceiving(opt.value); }}
                      className={'p-3 rounded-xl border-2 transition-all ' + (receiving === opt.value ? 'border-white bg-white/30' : 'border-white/20 bg-white/10 hover:bg-white/20')}
                    >
                      <div className="text-xl mb-1">{opt.label.split(' ')[0]}</div>
                      <div className="text-xs">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell them more about your comfort style</label>
                <textarea
                  value={message}
                  onChange={function(e) { setMessage(e.target.value); }}
                  placeholder="What comfort means to you..."
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-500 text-right mt-1">{message.length}/200</div>
              </div>
              
              <div className="text-center">
                <GlassButton variant="primary" size="lg" onClick={handleSubmit} loading={loading}>
                  Share Comfort 🧸
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
              {/* Message slider - show both messages */}
              <div className="mb-6">
                <MessageSlider
                  player1Message={dayStatus?.playerOffering ? `I offer: ${dayStatus.playerOffering}, I receive: ${dayStatus.playerReceiving}${dayStatus.playerMessage ? '. ' + dayStatus.playerMessage : ''}` : 'Your comfort style'}
                  player2Message={dayStatus?.partnerOffering ? `They offer: ${dayStatus.partnerOffering}, They receive: ${dayStatus.partnerReceiving}${dayStatus.partnerMessage ? '. ' + dayStatus.partnerMessage : ''}` : 'Waiting for partner...'}
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
