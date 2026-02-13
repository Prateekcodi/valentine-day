'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SoundPlayer } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = {
  black: '#050208',
  deep: '#12051e',
  burgundy: '#5c0a1e',
  crimson: '#9b1b30',
  rose: '#e0476b',
  blush: '#f9a8c4',
  gold: '#d4af37',
  champagne: '#f7e7ce',
  cream: '#fdf6ec',
  midnight: '#0d0d2b',
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Trail {
  id: number;
  x: number;
  y: number;
  shape: string;
  s: number;
}

interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

const ALL_BADGES: Badge[] = [
  { id: 'letter', icon: '💌', name: 'Love Poet', desc: 'Generated a love letter' },
  { id: 'lantern', icon: '🏮', name: 'Wish Maker', desc: 'Released a wish lantern' },
  { id: 'constellation', icon: '⭐', name: 'Star Gazer', desc: 'Found the love constellation' },
  { id: 'fortune', icon: '🥠', name: 'Fortune Seeker', desc: 'Opened a fortune cookie' },
  { id: 'quiz', icon: '💝', name: 'Love Expert', desc: 'Completed the quiz' },
  { id: 'promise', icon: '💎', name: 'Promise Keeper', desc: 'Made a star promise' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @keyframes trailFade { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -200%) scale(0.2); } }
    @keyframes particleFloat { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(10px, -20px); } 50% { transform: translate(-10px, -40px); } 75% { transform: translate(20px, -20px); } }
    @keyframes petalFall { 0% { top: -5%; transform: translateX(0) rotate(0deg); opacity: 1; } 100% { top: 105%; transform: translateX(var(--drift)) rotate(720deg); opacity: 0; } }
    @keyframes toastSlide { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
    @keyframes roseBlossom { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
    @keyframes ekg { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes fadeInUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes sparkOut { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(0); opacity: 0; } }
    @keyframes floatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes cookieWiggle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
    @keyframes starPop { 0% { transform: translate(-50%, -50%) scale(0); } 100% { transform: translate(-50%, -50%) scale(1); } }
    @keyframes lanternRise { 0% { bottom: 0; opacity: 1; transform: rotate(0); } 50% { transform: rotate(-5deg); } 100% { bottom: 110%; opacity: 0; transform: rotate(5deg); } }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
    @keyframes shimmerText { 0% { background-position: 0%; } 100% { background-position: 200%; } }
    @keyframes cardFlip { 0% { transform: rotateY(0); } 100% { transform: rotateY(180deg); } }
    @keyframes fireworkParticle { 0% { transform: rotate(var(--fa)) translateY(0); opacity: 1; } 100% { transform: rotate(var(--fa)) translateY(-80px); opacity: 0; } }
    @keyframes lineGlow { 0% { opacity: 0; } 100% { opacity: 0.7; } }
    @keyframes shootingStar { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(224,71,107,0.4); border-radius: 2px; }
    input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); font-style: italic; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// CURSOR TRAIL
// ─────────────────────────────────────────────────────────────────────────────

function CursorTrail() {
  const [trail, setTrail] = useState<Trail[]>([]);
  const id = useRef(0);
  const shapes = ['💖', '✨', '🌸', '💫', '❤️', '🌟', '💕', '⭐'];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const n = ++id.current;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      setTrail(t => [...t.slice(-25), { id: n, x: e.clientX, y: e.clientY, shape, s: Math.random() * 12 + 8 }]);
      setTimeout(() => setTrail(t => t.filter(x => x.id !== n)), 800);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {trail.map(t => (
        <div key={t.id} style={{
          position: 'absolute', left: t.x, top: t.y, fontSize: t.s,
          transform: 'translate(-50%, -50%)',
          animation: 'trailFade 0.8s ease-out forwards',
          userSelect: 'none',
        }}>{t.shape}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE UNIVERSE
// ─────────────────────────────────────────────────────────────────────────────

function ParticleUniverse() {
  const particles = useRef(Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 14 + 4,
    dur: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    shape: ['💕', '✨', '🌸', '⭐', '💫', '🌺', '💗', '🌟'][Math.floor(Math.random() * 8)],
  }))).current;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          fontSize: p.size, opacity: 0.6,
          animation: `particleFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
          userSelect: 'none', filter: 'blur(0.3px)',
        }}>{p.shape}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROSE PETAL RAIN
// ─────────────────────────────────────────────────────────────────────────────

function PetalRain({ active }: { active: boolean }) {
  const petals = useRef(Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 110 - 5,
    dur: Math.random() * 6 + 5,
    delay: Math.random() * 8,
    size: Math.random() * 20 + 12,
    drift: Math.random() * 100 - 50,
  }))).current;

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      {petals.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-5%', fontSize: p.size,
          animation: `petalFall ${p.dur}s ${p.delay}s linear infinite`,
          ['--drift' as string]: `${p.drift}px`,
        }}>🌸</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIREWORKS
// ─────────────────────────────────────────────────────────────────────────────

function Fireworks({ active }: { active: boolean }) {
  if (!active) return null;

  const bursts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 60 + 5,
    color: ['#e0476b', '#d4af37', '#a855f7', '#22d3ee', '#f9a8c4', '#4ade80'][i % 6],
    delay: Math.random() * 1.5,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {bursts.map(b => (
        <div key={b.id} style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, animation: `fadeInUp 0.3s ${b.delay}s forwards` }}>
          {Array.from({ length: 12 }, (_, j) => (
            <div key={j} style={{
              position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: b.color,
              animation: `fireworkParticle 1.2s ${b.delay}s ease-out forwards`,
              ['--fa' as string]: `${(j / 12) * 360}deg`,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT TOAST
// ─────────────────────────────────────────────────────────────────────────────

function AchievementToast({ badge, onDone }: { badge: Badge; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9998,
      background: 'linear-gradient(135deg, #d4af37, #f7e7ce)',
      borderRadius: 16, padding: '14px 20px',
      boxShadow: '0 10px 40px rgba(212,175,55,0.5)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'toastSlide 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
      maxWidth: 280,
    }}>
      <div style={{ fontSize: 36 }}>{badge.icon}</div>
      <div>
        <div style={{ fontWeight: 900, color: '#12051e', fontSize: 14 }}>Achievement Unlocked!</div>
        <div style={{ fontWeight: 700, color: '#5c0a1e', fontSize: 16 }}>{badge.name}</div>
        <div style={{ color: '#7b4e2b', fontSize: 12 }}>{badge.desc}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function SparkBtn({ children, onClick, color = '#e0476b', small, disabled, style = {} }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  color?: string; 
  small?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [sparks, setSparks] = useState<{ id: number; a: number }[]>([]);

  const click = (e: React.MouseEvent) => {
    if (disabled) return;
    const ns = Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + i, a: (i / 10) * 360 }));
    setSparks(s => [...s, ...ns]);
    setTimeout(() => setSparks(s => s.filter(x => !ns.map(n => n.id).includes(x.id))), 700);
    onClick?.();
  };

  return (
    <button onClick={click} disabled={disabled} style={{
      position: 'relative', overflow: 'visible',
      background: disabled ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${color}, ${color}bb)`,
      border: `2px solid ${disabled ? 'rgba(255,255,255,0.2)' : color}`,
      borderRadius: 50, padding: small ? '10px 22px' : '14px 34px',
      fontSize: small ? 13 : 16, fontWeight: 800, color: 'white', cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : `0 6px 30px ${color}55,inset 0 1px 0 rgba(255,255,255,0.3)`,
      transition: 'all 0.2s', fontFamily: 'Georgia,serif', letterSpacing: 1,
      opacity: disabled ? 0.4 : 1, ...style,
    }}>
      {children}
      {sparks.map(s => (
        <div key={s.id} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 6, height: 6, borderRadius: '50%', background: color,
          animation: 'sparkOut 0.7s ease-out forwards',
          ['--sx' as string]: `${Math.cos(s.a * Math.PI / 180) * 45}px`,
          ['--sy' as string]: `${Math.sin(s.a * Math.PI / 180) * 45}px`,
        }} />
      ))}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────

function GCard({ children, style = {}, glow = PALETTE.rose }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{
      background: 'rgba(12,3,24,0.75)',
      backdropFilter: 'blur(24px)',
      borderRadius: 24,
      border: `1px solid rgba(224,71,107,0.25)`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.08)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <div style={{ fontSize: 48, marginBottom: 8, animation: 'floatBob 3s ease-in-out infinite' }}>{icon}</div>
      <h2 style={{
        fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 900,
        background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: 2, marginBottom: 6,
      }}>{title}</h2>
      {subtitle && <p style={{ color: 'rgba(249,168,196,0.7)', fontSize: 14, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOVE LETTER GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const LETTER_TEMPLATES = [
  (n1: string, n2: string) => `My dearest ${n2 || 'love'},

Every sunrise reminds me of you — warm, golden, impossible to look away from. In this lifetime and every one after, I would choose you again.

You are not just my Valentine — you are my home.

Forever yours,
${n1 || 'Your Love'} 💕`,
  (n1: string, n2: string) => `To ${n2 || 'the one I love'},

I have searched every constellation for words worthy of you, and still the stars fall short. You are the poetry I never knew I needed.

If love were a universe, you would be every star in it.

Always and infinitely,
${n1 || 'Your Love'} 🌟`,
];

function LoveLetter({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const [letter, setLetter] = useState('');
  const [typed, setTyped] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const tmpl = LETTER_TEMPLATES[Math.floor(Math.random() * LETTER_TEMPLATES.length)];
    const full = tmpl(n1, n2);
    setLetter(full);
    setTyped('');
    setGenerating(true);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(t);
        setGenerating(false);
        onUnlock('letter');
      }
    }, 18);
  };

  const copy = () => {
    navigator.clipboard.writeText(typed).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <SectionHead icon="💌" title="Love Letter Generator" subtitle="Let your heart speak in words..." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input value={n1} onChange={e => setN1(e.target.value)} placeholder="Your name..." style={inputStyle} />
        <input value={n2} onChange={e => setN2(e.target.value)} placeholder="Their name..." style={inputStyle} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <SparkBtn onClick={generate} color={PALETTE.crimson} disabled={generating}>
          {generating ? 'Writing...' : '✍️ Write Our Story'}
        </SparkBtn>
      </div>
      {letter && (
        <div style={{
          background: 'rgba(247,231,206,0.07)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 20, padding: 24,
          fontFamily: 'Georgia,serif', lineHeight: 1.9,
          color: PALETTE.champagne, fontSize: 15,
          whiteSpace: 'pre-wrap',
          marginBottom: 16,
        }}>
          <div style={{ paddingTop: 8 }}>{typed}</div>
        </div>
      )}
      {typed && !generating && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <SparkBtn small onClick={copy} color={PALETTE.gold}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </SparkBtn>
          <SparkBtn small onClick={generate} color={PALETTE.burgundy}>🔄 New</SparkBtn>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(224,71,107,0.3)', borderRadius: 50,
  padding: '12px 20px', color: 'white', fontSize: 14,
  outline: 'none', backdropFilter: 'blur(10px)',
  fontFamily: 'Georgia,serif',
};

// ─────────────────────────────────────────────────────────────────────────────
// WISH LANTERNS
// ─────────────────────────────────────────────────────────────────────────────

function WishLanterns({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [wish, setWish] = useState('');
  const [lanterns, setLanterns] = useState<{ id: number; text: string; x: number; color: string }[]>([]);
  const idRef = useRef(0);

  const release = () => {
    if (!wish.trim()) return;
    const id = ++idRef.current;
    setLanterns(l => [...l, { id, text: wish, x: Math.random() * 70 + 15, color: ['#e0476b', '#d4af37', '#a855f7', '#22d3ee'][id % 4] }]);
    setWish('');
    onUnlock('lantern');
    setTimeout(() => setLanterns(l => l.filter(x => x.id !== id)), 8000);
  };

  return (
    <div>
      <SectionHead icon="🏮" title="Wish Lanterns" subtitle="Write your wish, set it free..." />
      <div style={{ position: 'relative', height: 200, background: 'rgba(5,2,8,0.5)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`, width: 2, height: 2, borderRadius: '50%', background: 'white', animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`, opacity: Math.random() * 0.8 + 0.2 }} />
        ))}
        {lanterns.map(l => (
          <div key={l.id} style={{ position: 'absolute', bottom: 0, left: `${l.x}%`, animation: 'lanternRise 8s ease-in forwards', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'white', background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '3px 8px', marginBottom: 4 }}>{l.text}</div>
            <div style={{ fontSize: 32, filter: `drop-shadow(0 0 10px ${l.color})` }}>🏮</div>
          </div>
        ))}
      </div>
      <textarea value={wish} onChange={e => setWish(e.target.value)} placeholder="Write your wish or promise... 💫" maxLength={100} rows={2} style={{ ...inputStyle, borderRadius: 16, resize: 'none', marginBottom: 16 }} />
      <div style={{ textAlign: 'center' }}>
        <SparkBtn onClick={release} color="#d4af37" disabled={!wish.trim()}>🏮 Release Your Wish</SparkBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR CONSTELLATION
// ─────────────────────────────────────────────────────────────────────────────

const HEART_STARS = [
  { x: 50, y: 20 }, { x: 35, y: 30 }, { x: 25, y: 45 }, { x: 30, y: 62 }, { x: 50, y: 78 },
  { x: 70, y: 62 }, { x: 75, y: 45 }, { x: 65, y: 30 },
];

function StarConstellation({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [connected, setConnected] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [shooting, setShooting] = useState<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setShooting({ id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 40 + 5 });
      setTimeout(() => setShooting(null), 1000);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const clickStar = (i: number) => {
    if (done) return;
    if (connected.includes(i)) return;
    const nc = [...connected, i];
    setConnected(nc);
    if (nc.length === HEART_STARS.length) {
      setDone(true);
      onUnlock('constellation');
    }
  };

  return (
    <div>
      <SectionHead icon="⭐" title="Love Constellation" subtitle="Connect the stars..." />
      <div style={{ position: 'relative', height: 260, background: 'radial-gradient(ellipse at center, #0d0d2b 0%, #050208 100%)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, borderRadius: '50%', background: 'white', opacity: Math.random() * 0.5 + 0.1 }} />
        ))}
        {shooting && <div style={{ position: 'absolute', left: `${shooting.x}%`, top: `${shooting.y}%`, width: 80, height: 2, background: 'linear-gradient(90deg,rgba(255,255,255,0),white)', borderRadius: 2, animation: 'shootingStar 1s ease-out forwards' }} />}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {connected.map((starIdx, i) => {
            if (i === 0) return null;
            const from = HEART_STARS[connected[i - 1]];
            const to = HEART_STARS[starIdx];
            return <line key={i} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke={done ? '#d4af37' : '#e0476b'} strokeWidth="1.5" opacity="0.7" style={{ animation: 'lineGlow 1s forwards' }} />;
          })}
          {done && <text x="50%" y="92%" textAnchor="middle" fill="#d4af37" fontSize="12" fontFamily="Georgia,serif" fontStyle="italic">Written in the stars 💫</text>}
        </svg>
        {HEART_STARS.map((s, i) => (
          <div key={i} onClick={() => clickStar(i)} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 20, height: 20, borderRadius: '50%',
            background: connected.includes(i) ? (done ? 'radial-gradient(circle,#ffd700,#d4af37)' : 'radial-gradient(circle,#ff6b9d,#e0476b)') : 'radial-gradient(circle,rgba(255,255,255,0.8),rgba(255,255,255,0.2))',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, boxShadow: connected.includes(i) ? `0 0 16px ${done ? '#d4af37' : '#e0476b'}` : '0 0 6px rgba(255,255,255,0.4)',
            transition: 'all 0.3s', zIndex: 10,
          }}>
            {connected.includes(i) ? '⭐' : '·'}
          </div>
        ))}
      </div>
      {done ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: PALETTE.gold, fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700 }}>💫 The universe wrote your love in the stars!</p>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'rgba(249,168,196,0.5)', fontSize: 13 }}>Click stars in order ({connected.length}/{HEART_STARS.length})</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORTUNE COOKIES
// ─────────────────────────────────────────────────────────────────────────────

const FORTUNES = [
  '💕 Your love story is the greatest one ever told.',
  '✨ The stars aligned the day you two met.',
  '🌹 A single rose speaks louder than a thousand words.',
  '💫 Love is not something you find — it finds you.',
  '🌟 Your hearts beat in perfect harmony.',
  '💖 Every ending is a new beginning.',
  '🦋 When two souls recognise each other, time stands still.',
];

function FortuneCookies({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [cracked, setCracked] = useState(false);
  const [fortune, setFortune] = useState('');

  const crack = () => {
    setCracked(true);
    const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setFortune(f);
    onUnlock('fortune');
  };

  const reset = () => { setCracked(false); setFortune(''); };

  return (
    <div>
      <SectionHead icon="🥠" title="Fortune Cookies" subtitle="Crack open your love fortune..." />
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {!cracked ? (
          <div onClick={crack} style={{ display: 'inline-block', fontSize: 100, cursor: 'pointer', animation: 'cookieWiggle 2s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))' }}>🥠</div>
        ) : (
          <div style={{ animation: 'fadeInUp 0.5s forwards' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✨</div>
            <div style={{ background: 'rgba(247,231,206,0.1)', border: `1px solid ${PALETTE.gold}44`, borderRadius: 20, padding: 24, fontFamily: 'Georgia,serif', fontStyle: 'italic', color: PALETTE.champagne, fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>{fortune}</div>
            <SparkBtn small onClick={reset} color={PALETTE.burgundy}>🥠 Another Fortune</SparkBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOVE LANGUAGE QUIZ
// ─────────────────────────────────────────────────────────────────────────────

const LOVE_Q = [
  { q: 'When your partner is sad, you...', opts: ['Hold them close 🤗', 'Say "I love you" 💬', 'Do their chores 🏠', 'Give a gift 🎁'] },
  { q: 'Your ideal Valentine\'s Day is...', opts: ['Long slow dance 💃', 'Heartfelt letter 📝', 'A cooked meal 🍝', 'Surprise gift 🎁'] },
  { q: 'You feel most loved when...', opts: ['They hold your hand 🤝', 'They say kind words 💌', 'They help you out 🛠️', 'They give surprises 🎉'] },
];
const LOVE_LANGS = ['Physical Touch 🤗', 'Words of Affirmation 💬', 'Acts of Service 🏠', 'Gift Giving 🎁'];

function LoveLanguageQuiz({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [q, setQ] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [result, setResult] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);

  const pick = (i: number) => {
    if (sel !== null) return;
    setSel(i);
    const ns = [...scores];
    ns[i]++;
    setScores(ns);
    setTimeout(() => {
      if (q + 1 >= LOVE_Q.length) {
        const max = Math.max(...ns);
        setResult(ns.indexOf(max));
        onUnlock('quiz');
      } else {
        setQ(q + 1);
        setSel(null);
      }
    }, 700);
  };

  const reset = () => { setQ(0); setScores([0, 0, 0, 0]); setResult(null); setSel(null); };

  if (result !== null) return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Your result is in..." />
      <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
        <div style={{ fontSize: 60, marginBottom: 12, animation: 'floatBob 2s ease-in-out infinite' }}>{['🤗', '💬', '🏠', '🎁'][result]}</div>
        <h3 style={{ color: PALETTE.gold, fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{LOVE_LANGS[result]}</h3>
        <SparkBtn small onClick={reset} color={PALETTE.crimson}>🔄 Retake</SparkBtn>
      </div>
    </div>
  );

  const curr = LOVE_Q[q];
  return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Discover how you love..." />
      <div style={{ marginBottom: 6, display: 'flex', gap: 4, justifyContent: 'center' }}>
        {LOVE_Q.map((_, i) => (
          <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i < q ? PALETTE.rose : i === q ? PALETTE.gold : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginBottom: 18 }}>Q{q + 1}/{LOVE_Q.length}</p>
      <p style={{ color: PALETTE.champagne, fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, marginBottom: 18, textAlign: 'center', lineHeight: 1.6 }}>{curr.q}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {curr.opts.map((opt, i) => (
          <button key={i} onClick={() => pick(i)} style={{
            padding: '14px 10px', borderRadius: 16,
            border: `2px solid ${sel === i ? 'rgba(212,175,55,0.8)' : 'rgba(255,255,255,0.15)'}`,
            background: sel === i ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
            color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s', fontFamily: 'Georgia,serif',
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMISE STARS
// ─────────────────────────────────────────────────────────────────────────────

function PromiseStars({ onUnlock }: { onUnlock: (id: string) => void }) {
  const [promise, setPromise] = useState('');
  const [stars, setStars] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const addStar = () => {
    if (!promise.trim()) return;
    setStars(s => [...s, { id: Date.now(), text: promise, x: Math.random() * 80 + 10, y: Math.random() * 70 + 10 }]);
    setPromise('');
    onUnlock('promise');
  };

  return (
    <div>
      <SectionHead icon="💎" title="Promise Stars" subtitle="Write a promise — it becomes a star..." />
      <div style={{ position: 'relative', height: 200, background: 'radial-gradient(ellipse at center, #0d0d2b, #050208)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 18 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1.5, height: 1.5, borderRadius: '50%', background: 'white', opacity: 0.3 }} />
        ))}
        {stars.map(s => (
          <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)', fontSize: 20, animation: 'starPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards', cursor: 'default', filter: 'drop-shadow(0 0 6px #d4af37)' }} title={s.text}>⭐</div>
        ))}
        {stars.length === 0 && <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: 13 }}>Your promises will shine here ✨</p>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={promise} onChange={e => setPromise(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStar()} placeholder="I promise to always..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addStar} disabled={!promise.trim()} style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'rgba(212,175,55,0.3)', border: '1px solid rgba(212,175,55,0.5)', color: 'white', fontSize: 20, cursor: promise.trim() ? 'pointer' : 'not-allowed', opacity: promise.trim() ? 1 : 0.4 }}>⭐</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION TABS
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'letter', label: '💌', name: 'Letter' },
  { id: 'lanterns', label: '🏮', name: 'Lanterns' },
  { id: 'constellation', label: '⭐', name: 'Stars' },
  { id: 'fortune', label: '🥠', name: 'Fortune' },
  { id: 'quiz', label: '💝', name: 'Quiz' },
  { id: 'promises', label: '💎', name: 'Promises' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ValentineDayPage() {
  const [section, setSection] = useState('letter');
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [toastBadge, setToastBadge] = useState<Badge | null>(null);
  const [petalRain, setPetalRain] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const [mounted, setMounted] = useState(false);

  const unlock = useCallback((id: string) => {
    setUnlocked(u => {
      if (u.includes(id)) return u;
      const nu = [...u, id];
      const badge = ALL_BADGES.find(b => b.id === id);
      if (badge) setToastBadge(badge);
      if (nu.length >= ALL_BADGES.length) {
        setPetalRain(true);
        setFireworks(true);
        setTimeout(() => { setPetalRain(false); setFireworks(false); }, 5000);
      }
      return nu;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      // Router would redirect here but we skip for now
    }
  }, []);

  const renderSection = () => {
    switch (section) {
      case 'letter': return <LoveLetter onUnlock={unlock} />;
      case 'lanterns': return <WishLanterns onUnlock={unlock} />;
      case 'constellation': return <StarConstellation onUnlock={unlock} />;
      case 'fortune': return <FortuneCookies onUnlock={unlock} />;
      case 'quiz': return <LoveLanguageQuiz onUnlock={unlock} />;
      case 'promises': return <PromiseStars onUnlock={unlock} />;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 20%, #1a0515 0%, #050208 50%, #0a0015 100%)', cursor: 'none', fontFamily: 'Georgia,serif', overflowX: 'hidden' }}>
      <GlobalStyles />
      <CursorTrail />
      <ParticleUniverse />
      <PetalRain active={petalRain} />
      <Fireworks active={fireworks} />
      {toastBadge && <AchievementToast badge={toastBadge} onDone={() => setToastBadge(null)} />}

      <SoundPlayer autoPlay={true} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 14px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '28px 0 20px', animation: 'fadeInUp 0.8s forwards' }}>
          <div style={{ fontSize: 52, marginBottom: 10, animation: 'floatBob 3s ease-in-out infinite', filter: `drop-shadow(0 0 20px ${PALETTE.rose})` }}>💕</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: 28, letterSpacing: 3, background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush},${PALETTE.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'shimmerText 3s linear infinite' }}>
            Valentine's Day 2026
          </h1>
          <p style={{ color: 'rgba(249,168,196,0.6)', fontSize: 14, marginTop: 6, fontStyle: 'italic' }}>A world built just for us ✨</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 50, padding: '6px 16px', marginTop: 10, fontSize: 12, color: PALETTE.gold }}>
            🏆 {unlocked.length}/{ALL_BADGES.length} Achievements
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8, marginBottom: 20, scrollbarWidth: 'none' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 12px', borderRadius: 16,
              background: section === s.id ? 'rgba(224,71,107,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${section === s.id ? PALETTE.rose : 'rgba(255,255,255,0.1)'}`,
              color: section === s.id ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.2s', minWidth: 60,
              boxShadow: section === s.id ? `0 0 20px ${PALETTE.rose}33` : 'none',
              transform: section === s.id ? 'scale(1.05)' : 'scale(1)',
            }}>
              <span style={{ fontSize: 22 }}>{s.label}</span>
              <span style={{ fontSize: 10, marginTop: 3 }}>{s.name}</span>
              {unlocked.includes(s.id) && <span style={{ fontSize: 8, color: PALETTE.gold }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Main section card */}
        <GCard style={{ padding: 28, animation: 'fadeInUp 0.5s forwards' }}>
          {renderSection()}
        </GCard>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.2)', fontSize: 12, fontStyle: 'italic' }}>
          Move your cursor · Find all achievements 💕
        </div>
      </div>

      {/* Fixed bottom nav hint */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5,2,8,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', textAlign: 'center', color: 'rgba(249,168,196,0.4)', fontSize: 11, fontStyle: 'italic' }}>
        Built with infinite love · Valentine's Day 2026 💕
      </div>
    </div>
  );
}
