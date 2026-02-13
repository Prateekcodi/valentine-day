'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Heart {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
}

interface BalloonType {
  id: number;
  x: number;
  dur: number;
  delay: number;
  sway: number;
  size: number;
  color: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BALLOON_COLORS = [
  ['#ff6b9d', '#ff8fb1'],
  ['#ff9a3c', '#ffb86c'],
  ['#a855f7', '#c084fc'],
  ['#22d3ee', '#67e8f9'],
  ['#4ade80', '#86efac'],
  ['#f43f5e', '#fb7185'],
  ['#facc15', '#fde68a'],
];

const HEART_EMOJIS = ['💕', '💗', '💖', '✨', '🌸', '💞', '❤️'];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @keyframes heartFloat {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -150%) scale(0.3); }
    }
    @keyframes balloonFloat {
      0% { bottom: -20vh; opacity: 0; }
      5% { opacity: 1; }
      100% { bottom: 110vh; opacity: 0.7; }
    }
    @keyframes balloonSway {
      0% { margin-left: 0px; }
      100% { margin-left: 35px; }
    }
    @keyframes balloonPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.4); }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes popStar {
      0% { transform: scale(0); }
      50% { transform: scale(1.6); }
      100% { transform: scale(0); opacity: 0; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 1; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { 
      background: linear-gradient(135deg, #1a0a2e 0%, #120525 35%, #2d0a1f 70%, #1a0a2e 100%) !important;
      min-height: 100vh;
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// HEART CURSOR TRAIL
// ─────────────────────────────────────────────────────────────────────────────

function HeartCursorTrail() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const id = ++idRef.current;
      const emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      
      setHearts((prev) => {
        const newHearts = [
          ...prev.slice(-20),
          {
            id,
            x: e.clientX + (Math.random() - 0.5) * 30,
            y: e.clientY + (Math.random() - 0.5) * 30,
            emoji,
            size: Math.random() * 12 + 12,
          },
        ];
        return newHearts;
      });

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9999 }}>
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            left: h.x,
            top: h.y,
            fontSize: h.size,
            transform: 'translate(-50%, -50%)',
            animation: 'heartFloat 1s ease-out forwards',
            userSelect: 'none',
            filter: 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.6))',
          }}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING BALLOONS
// ─────────────────────────────────────────────────────────────────────────────

function Balloon({ id, onPop }: { id: number; onPop: (id: number) => void }) {
  const [popped, setPopped] = useState(false);
  const [pos] = useState(() => ({
    x: Math.random() * 85 + 5,
    dur: Math.random() * 10 + 12,
    delay: Math.random() * 5,
    sway: Math.random() * 50 + 20,
    size: Math.random() * 25 + 55,
  }));
  const [colors] = useState(() => BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]);

  const handlePop = useCallback(() => {
    if (popped) return;
    setPopped(true);
    setTimeout(() => onPop(id), 450);
  }, [popped, id, onPop]);

  return (
    <div
      onClick={handlePop}
      style={{
        position: 'fixed',
        left: `${pos.x}vw`,
        bottom: popped ? '110vh' : '-20vh',
        width: pos.size,
        height: pos.size * 1.25,
        cursor: 'pointer',
        zIndex: 50,
        animation: popped
          ? `balloonPop 0.45s forwards`
          : `balloonFloat ${pos.dur}s ${pos.delay}s linear forwards, balloonSway ${pos.sway * 0.08}s ease-in-out infinite alternate`,
        userSelect: 'none',
      }}
    >
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <defs>
          <radialGradient id={`bg${id}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors[0]} />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="45" ry="50" fill={`url(#bg${id})`} stroke={colors[1]} strokeWidth="1.5" />
        <ellipse cx="35" cy="30" rx="12" ry="8" fill="white" opacity="0.3" />
        <line x1="50" y1="100" x2="50" y2="125" stroke={colors[1]} strokeWidth="1.5" />
        <path d="M45 100 Q50 105 55 100" fill="none" stroke={colors[1]} strokeWidth="1.5" />
      </svg>
      {popped && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            animation: 'popStar 0.45s forwards',
          }}
        >
          💥
        </div>
      )}
    </div>
  );
}

function BalloonField() {
  const [balloons, setBalloons] = useState<number[]>(() =>
    Array.from({ length: 4 }, (_, i) => i)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons((prev) => [...prev, prev.length > 0 ? Math.max(...prev) + 1 : 0]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePop = useCallback((id: number) => {
    setBalloons((prev) => prev.filter((b) => b !== id));
  }, []);

  return (
    <>
      {balloons.map((id) => (
        <Balloon key={id} id={id} onPop={handlePop} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STARFIELD
// ─────────────────────────────────────────────────────────────────────────────

function StarField() {
  const [stars] = useState<{id: number; left: string; top: string; size: number; duration: number; delay: number}[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    }))
  );

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s) => (
        <div key={s.id} style={{ position: 'absolute', left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: '50%', background: 'white', animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite` }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ValentineEffects({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalStyles />
      <StarField />
      <HeartCursorTrail />
      <BalloonField />
      {children}
    </>
  );
}
