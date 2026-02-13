'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { SoundPlayer } from '@/components/ui/SoundPlayer';
import { DAYS, isDayUnlocked } from '@/lib/datelock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface GameHeart {
  id: number;
  x: number;
  speed: number;
  emoji: string;
  top: number;
}

interface Card {
  id: number;
  pairId: number;
  val: string;
  type: 'emoji' | 'word';
}

interface Message {
  id: number;
  from: 'me' | 'partner';
  text: string;
  time: string;
}

interface RoomData {
  id: string;
  player1: { id: string; name: string } | null;
  player2: { id: string; name: string } | null;
  progress: any[];
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

const PUZZLE_PAIRS: [string, string][] = [
  ['🌹', 'Rose'],
  ['💌', 'Letter'],
  ['🍫', 'Chocolate'],
  ['🧸', 'Teddy'],
  ['💍', 'Ring'],
  ['🌟', 'Star'],
  ['💕', 'Love'],
  ['🎵', 'Music'],
];

const QUIZ_DATA = [
  { q: 'What is the symbol of love?', opts: ['💀', '💖', '🌵', '🎃'], ans: 1 },
  { q: "Valentine's Day is on which date?", opts: ['Feb 10', 'Feb 14', 'Feb 20', 'Mar 1'], ans: 1 },
  { q: 'Which flower means love?', opts: ['🌻 Sunflower', '🌷 Tulip', '🌹 Rose', '🌸 Cherry'], ans: 2 },
  { q: 'What do couples exchange?', opts: ['Handshakes', 'Gifts & cards', 'Business cards', 'None'], ans: 1 },
];

const LOVE_WORDS = ['ROMANCE', 'PASSION', 'CHERISH', 'DARLING', 'BELOVED', 'SWEETHEART'];

const BOT_REPLIES = [
  'You make my heart flutter 💕',
  'Every moment with you is magical ✨',
  "You're my favorite person in the world 🌸",
  'I fall for you more every single day 💖',
  'You complete me in every way 🥰',
  "You're the reason I smile 😊",
  'Forever and always, I choose you 💍',
  'My heart beats for you ❤️',
  "You're my everything 💞",
];

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
    @keyframes dropDown {
      0% { top: -5%; }
      100% { top: 105%; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 1; }
    }
    @keyframes typingDot {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-6px); opacity: 1; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.05); }
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(250%); }
    }
    @keyframes sparkle {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(calc(-50% + var(--sa)), calc(-50% + var(--sb))) scale(0); opacity: 0; }
    }
    @keyframes confettiPiece {
      0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) rotate(720deg); opacity: 0; }
    }
    @keyframes dayEmoji {
      0%, 100% { transform: rotate(-6deg) scale(1); }
      50% { transform: rotate(6deg) scale(1.12); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 107, 157, 0.5); border-radius: 2px; }
    input::placeholder, textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
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
    Array.from({ length: 5 }, (_, i) => i)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons((prev) => [...prev, prev.length > 0 ? Math.max(...prev) + 1 : 0]);
    }, 3500);
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
// CONFETTI BURST
// ─────────────────────────────────────────────────────────────────────────────

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = Array.from({ length: 40 });
  const colors = ['#ff6b9d', '#ffd700', '#a855f7', '#22d3ee', '#4ade80', '#f43f5e'];
  
  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }}>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const dist = Math.random() * 200 + 100;
        const col = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 6;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size * (Math.random() > 0.5 ? 2 : 1),
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: col,
              animation: `confettiPiece 1.2s ${Math.random() * 0.3}s ease-out forwards`,
              ['--dx' as string]: `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              ['--dy' as string]: `${Math.sin((angle * Math.PI) / 180) * dist}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function SparkleButton({ children, onClick, color = '#ff6b9d', disabled = false }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  color?: string; 
  disabled?: boolean;
}) {
  const [sparks, setSparks] = useState<{ id: number; angle: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !onClick) return;
    
    const id = Date.now();
    const items = Array.from({ length: 8 }, (_, i) => ({ id: id + i, angle: (i / 8) * 360 }));
    setSparks((s) => [...s, ...items]);
    setTimeout(() => setSparks((s) => s.filter((x) => !items.map((i) => i.id).includes(x.id))), 700);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        position: 'relative',
        background: disabled ? 'rgba(255,255,255,0.15)' : `linear-gradient(135deg, ${color}, ${color}cc)`,
        border: '2px solid rgba(255,255,255,0.5)',
        borderRadius: 50,
        padding: '12px 28px',
        fontSize: 15,
        fontWeight: 700,
        color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s',
        letterSpacing: '0.5px',
        boxShadow: disabled ? 'none' : `0 8px 30px ${color}55`,
        opacity: disabled ? 0.5 : 1,
        overflow: 'visible',
      }}
    >
      {children}
      {sparks.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            animation: `sparkle 0.7s ease-out forwards`,
            ['--sa' as string]: `${Math.cos((s.angle * Math.PI) / 180) * 50}px`,
            ['--sb' as string]: `${Math.sin((s.angle * Math.PI) / 180) * 50}px`,
          }}
        />
      ))}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEART CATCH GAME
// ─────────────────────────────────────────────────────────────────────────────

function HeartCatchGame() {
  const [hearts, setHearts] = useState<GameHeart[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [running, setRunning] = useState(false);
  const idRef = useRef(0);

  const start = useCallback(() => {
    setScore(0);
    setTimeLeft(20);
    setHearts([]);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;

    const spawnInterval = setInterval(() => {
      const id = ++idRef.current;
      const rand = Math.random();
      const emoji = rand > 0.3 ? '💖' : rand > 0.5 ? '💀' : '💔';
      
      setHearts((h) => [
        ...h,
        {
          id,
          x: Math.random() * 85 + 5,
          speed: Math.random() * 3 + 2,
          emoji,
          top: -10,
        },
      ]);

      setTimeout(() => {
        setHearts((h) => h.filter((x) => x.id !== id));
      }, 4500);
    }, 700);

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          clearInterval(timerInterval);
          clearInterval(spawnInterval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [running]);

  const catchHeart = useCallback((id: number, emoji: string) => {
    setHearts((h) => h.filter((x) => x.id !== id));
    
    if (emoji === '💖') {
      setScore((s) => s + 1);
    } else if (emoji === '💀') {
      setScore((s) => Math.max(0, s - 2));
    }
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 18, fontWeight: 700, color: 'white' }}>
        <span>❤️ Score: {score}</span>
        <span>⏱ {timeLeft}s</span>
      </div>
      
      {!running && timeLeft === 0 && (
        <div style={{ marginBottom: 10, color: '#ffd700', fontSize: 24, fontWeight: 800 }}>
          🎉 Final Score: {score}!
        </div>
      )}
      
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 200,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.25)',
          marginBottom: 12,
        }}
      >
        {hearts.map((h) => (
          <div
            key={h.id}
            onClick={() => catchHeart(h.id, h.emoji)}
            style={{
              position: 'absolute',
              left: `${h.x}%`,
              top: h.top,
              fontSize: 28,
              cursor: 'pointer',
              animation: `dropDown ${h.speed}s linear forwards`,
              userSelect: 'none',
            }}
          >
            {h.emoji}
          </div>
        ))}
        
        {!running && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
            <SparkleButton onClick={start} color="#e11d48">
              {timeLeft === 20 ? '🎮 Play' : '🔄 Again'}
            </SparkleButton>
          </div>
        )}
      </div>
      
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
        Catch 💖 (+1) · Avoid 💀 (-2)
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY MATCHING GAME
// ─────────────────────────────────────────────────────────────────────────────

function MatchingGame() {
  const [pairs] = useState(() => PUZZLE_PAIRS.slice(0, 6));
  const [cards] = useState(() => {
    const all: Card[] = pairs.flatMap((p, i) => [
      { id: i * 2, pairId: i, val: p[0], type: 'emoji' as const },
      { id: i * 2 + 1, pairId: i, val: p[1], type: 'word' as const },
    ]);
    return all.sort(() => Math.random() - 0.5);
  });
  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const flip = useCallback((card: Card) => {
    if (matched.includes(card.pairId)) return;
    if (flipped.length === 1 && flipped[0].id === card.id) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      if (newFlipped[0].pairId === newFlipped[1].pairId) {
        const newMatched = [...matched, newFlipped[0].pairId];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === pairs.length) {
          setTimeout(() => setWon(true), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }, [flipped, matched, pairs.length]);

  const isFlipped = useCallback((card: Card) => 
    flipped.some((f) => f.id === card.id) || matched.includes(card.pairId),
    [flipped, matched]
  );

  const restart = useCallback(() => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 10, fontSize: 14 }}>
        Moves: {moves} · Matched: {matched.length}/{pairs.length}
      </p>
      
      {won && <div style={{ fontSize: 28, marginBottom: 10, color: '#ffd700' }}>🎉 You Won! 🎉</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => flip(card)}
            style={{
              height: 65,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: card.type === 'emoji' ? 26 : 12,
              fontWeight: 700,
              cursor: matched.includes(card.pairId) ? 'default' : 'pointer',
              background: matched.includes(card.pairId)
                ? 'rgba(74, 222, 128, 0.35)'
                : isFlipped(card)
                ? 'rgba(255, 107, 157, 0.45)'
                : 'rgba(255, 255, 255, 0.12)',
              border: `2px solid ${matched.includes(card.pairId) ? 'rgba(74, 222, 128, 0.7)' : 'rgba(255, 255, 255, 0.25)'}`,
              backdropFilter: 'blur(10px)',
              color: 'white',
              transition: 'all 0.2s',
              transform: isFlipped(card) ? 'scale(1.05)' : 'scale(1)',
              userSelect: 'none',
            }}
          >
            {isFlipped(card) ? card.val : '💝'}
          </div>
        ))}
      </div>
      
      {won && (
        <div style={{ marginTop: 16 }}>
          <SparkleButton onClick={restart} color="#a855f7">Play Again 🔄</SparkleButton>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOVE QUIZ GAME
// ─────────────────────────────────────────────────────────────────────────────

function LoveQuiz() {
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === QUIZ_DATA[q].ans) setScore((s) => s + 1);
    
    setTimeout(() => {
      if (q + 1 >= QUIZ_DATA.length) {
        setDone(true);
      } else {
        setQ((q) => q + 1);
        setSelected(null);
      }
    }, 1000);
  };

  const reset = () => { setQ(0); setScore(0); setSelected(null); setDone(false); };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>{score >= 3 ? '🏆' : '💪'}</div>
        <p style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>{score}/{QUIZ_DATA.length} Correct!</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
          {score === 4 ? "You're a love expert! 💕" : score >= 2 ? 'Great job! 🌸' : 'Keep trying! 💖'}
        </p>
        <SparkleButton onClick={reset} color="#a855f7">Try Again 🔄</SparkleButton>
      </div>
    );
  }

  const current = QUIZ_DATA[q];

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 8 }}>Q{q + 1}/{QUIZ_DATA.length}</p>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{current.q}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {current.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={selected !== null}
            style={{
              padding: '12px 8px',
              borderRadius: 14,
              border: `2px solid ${
                selected === null
                  ? 'rgba(255,255,255,0.25)'
                  : i === current.ans
                  ? 'rgba(74, 222, 128, 0.8)'
                  : selected === i
                  ? 'rgba(239, 68, 68, 0.8)'
                  : 'rgba(255,255,255,0.15)'
              }`,
              background:
                selected === null
                  ? 'rgba(255,255,255,0.08)'
                  : i === current.ans
                  ? 'rgba(74, 222, 128, 0.2)'
                  : selected === i
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(255,255,255,0.04)',
              color: 'white',
              cursor: selected !== null ? 'default' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 12 }}>Score: {score}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD SCRAMBLE GAME
// ─────────────────────────────────────────────────────────────────────────────

function WordScramble() {
  const [targetWord] = useState(() => LOVE_WORDS[Math.floor(Math.random() * LOVE_WORDS.length)]);
  const [scrambled] = useState(() =>
    targetWord.split('').sort(() => Math.random() - 0.5).join('')
  );
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState<'win' | 'fail' | null>(null);
  const [tries, setTries] = useState(0);

  const check = () => {
    setTries((t) => t + 1);
    if (guess.toUpperCase().trim() === targetWord) {
      setStatus('win');
    } else {
      setStatus('fail');
    }
    setTimeout(() => setStatus(null), 1000);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ letterSpacing: 10, fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 14 }}>
        {scrambled}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14 }}>Unscramble the love word!</p>
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && guess.trim() && check()}
        placeholder="Type answer..."
        maxLength={targetWord.length}
        disabled={status === 'win'}
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: `2px solid ${
            status === 'win' ? 'rgba(74, 222, 128, 0.8)' : status === 'fail' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255,255,255,0.25)'
          }`,
          borderRadius: 50,
          padding: '10px 18px',
          color: 'white',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 4,
          textAlign: 'center',
          outline: 'none',
          width: '80%',
          marginBottom: 14,
          backdropFilter: 'blur(10px)',
        }}
      />
      <br />
      <SparkleButton onClick={check} color="#f59e0b" disabled={!guess.trim() || status === 'win'}>Check ✨</SparkleButton>
      {status === 'win' && <p style={{ color: '#4ade80', marginTop: 12, fontWeight: 700 }}>🎉 Correct! {targetWord} 💕</p>}
      {status === 'fail' && <p style={{ color: '#f87171', marginTop: 12 }}>💔 Try again! ({tries})</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'partner', text: 'Happy Valentine Week! 💕', time: 'now' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    
    const msg: Message = { id: Date.now(), from: 'me', text: input, time: 'now' };
    setMessages((m) => [...m, msg]);
    setInput('');
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: 'partner',
          text: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
          time: 'now',
        },
      ]);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 300 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
            {m.from === 'partner' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255, 107, 157, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 6, fontSize: 14 }}>💕</div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '10px 14px',
              borderRadius: m.from === 'me' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              background: m.from === 'me' ? 'rgba(255, 107, 157, 0.45)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {m.text}
            </div>
            {m.from === 'me' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6, fontSize: 14 }}>😊</div>
            )}
          </div>
        ))}
        
        {typing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255, 107, 157, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💕</div>
            <div style={{ padding: '10px 14px', borderRadius: '20px 20px 20px 6px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: `typingDot 1s ${i * 0.15}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Say something sweet..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '10px 16px', color: 'white', fontSize: 13, outline: 'none' }}
        />
        <button onClick={send} disabled={!input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() ? 'rgba(255, 107, 157, 0.6)' : 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 16, cursor: input.trim() ? 'pointer' : 'not-allowed' }}>💌</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOVE METER
// ─────────────────────────────────────────────────────────────────────────────

function LoveMeter() {
  const [value, setValue] = useState(0);
  const [pumping, setPumping] = useState(false);
  const [message, setMessage] = useState('');

  const msgs = ['💔 Keep pumping...', '💛 Getting warmer!', '🧡 Almost there!', '❤️ So in love!', '💖 SOULMATES! 💖'];
  const cols = ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#a855f7'];

  const pump = () => {
    setPumping(true);
    setValue((v) => {
      const newValue = Math.min(100, v + Math.random() * 18 + 7);
      const idx = Math.floor(newValue / 21);
      setMessage(msgs[Math.min(idx, msgs.length - 1)]);
      return newValue;
    });
    setTimeout(() => setPumping(false), 350);
  };

  const reset = () => { setValue(0); setMessage(''); };

  const pct = Math.round(value);
  const col = cols[Math.min(Math.floor(pct / 21), cols.length - 1)];
  const getHeart = () => { if (pct >= 100) return '💞'; if (pct > 75) return '💖'; if (pct > 50) return '💗'; if (pct > 25) return '💛'; return '🤍'; };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 70, animation: pumping ? 'heartbeat 0.35s ease' : pct > 80 ? 'heartbeat 1.2s ease infinite' : 'none', marginBottom: 10, filter: `drop-shadow(0 0 ${pct / 4}px ${col})` }}>
        {getHeart()}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 50, height: 20, marginBottom: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.25)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, #f43f5e, ${col})`, borderRadius: 50, transition: 'width 0.5s ease', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: col, marginBottom: 8 }}>{pct}% 💕</p>
      {message && <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 14, fontSize: 15 }}>{message}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <SparkleButton onClick={pump} color={col} disabled={pct >= 100 || pumping}>{pct >= 100 ? '💞 Perfect!' : '❤️ Pump'}</SparkleButton>
        {pct > 0 && <button onClick={reset} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Reset</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STARFIELD
// ─────────────────────────────────────────────────────────────────────────────

function StarField() {
  const [stars] = useState<{id: number; left: string; top: string; size: number; duration: number; delay: number}[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
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
// MAIN ROOM PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [activeTab, setActiveTab] = useState('days');
  const [activeGame, setActiveGame] = useState('catch');
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedMessage = localStorage.getItem('welcomeMessage');
    if (savedMessage) {
      setWelcomeMessage(savedMessage);
      localStorage.removeItem('welcomeMessage');
    }
    
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}`);
      const data = await response.json();
      
      if (data.error) {
        router.push('/');
        return;
      }
      
      setRoom(data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day: number) => {
    if (isDayUnlocked(day)) {
      router.push(`/day/${day}?room=${roomId}`);
    }
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 1600);
  };

  if (!mounted || loading) {
    return null;
  }

  const playerName = typeof window !== 'undefined' ? localStorage.getItem('playerName') : null;

  const tabs = [
    { id: 'days', label: '📅 Days', icon: '📅' },
    { id: 'games', label: '🎮 Games', icon: '🎮' },
    { id: 'meter', label: '💖 Meter', icon: '💖' },
    { id: 'chat', label: '💬 Chat', icon: '💬' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a2e 0%, #120525 35%, #2d0a1f 70%, #1a0a2e 100%)', cursor: 'none', overflowX: 'hidden' }}>
      <GlobalStyles />
      <StarField />
      <HeartCursorTrail />
      <BalloonField />
      <ConfettiBurst active={confettiActive} />
      
      <SoundPlayer autoPlay={true} />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 900, letterSpacing: 2, textShadow: '0 0 30px rgba(255, 107, 157, 0.4)' }}>
            💕 Valentine Week 2026
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 6 }}>
            Room: <span style={{ fontWeight: 700, letterSpacing: 2 }}>{roomId}</span>
          </p>
        </div>

        {/* Partner Card */}
        <div style={{ padding: '20px', marginBottom: 20, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b9d, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                {room?.player1?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'white' }}>{room?.player1?.name || 'Waiting...'}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Player 1</p>
              </div>
            </div>
            <div style={{ fontSize: 24 }}>❤️</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 600, color: 'white', textAlign: 'right' }}>{room?.player2?.name || 'Waiting...'}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Player 2</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                {room?.player2?.name?.charAt(0) || '?'}
              </div>
            </div>
          </div>
          {!room?.player2 && (
            <div style={{ textAlign: 'center', padding: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 14 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Share room code with your partner:</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: 4, marginTop: 6 }}>{roomId}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'none' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '12px 20px',
                background: activeTab === tab.id ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: 14,
                borderBottom: activeTab === tab.id ? '3px solid #ff6b9d' : '3px solid transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 700 : 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.12)', padding: 20 }}>
          
          {/* DAYS TAB */}
          {activeTab === 'days' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {DAYS.map((dayInfo) => {
                  const unlocked = isDayUnlocked(dayInfo.day);
                  const completed = room?.progress?.[dayInfo.day - 1]?.completed;
                  
                  return (
                    <div
                      key={dayInfo.day}
                      onClick={() => handleDayClick(dayInfo.day)}
                      style={{
                        padding: '14px 8px',
                        borderRadius: 16,
                        background: unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${unlocked ? 'rgba(255,107,157,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        textAlign: 'center',
                        cursor: unlocked ? 'pointer' : 'not-allowed',
                        opacity: unlocked ? 1 : 0.5,
                        transition: 'all 0.2s',
                        transform: unlocked ? 'scale(1)' : 'scale(0.98)',
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6, animation: unlocked ? 'dayEmoji 2.5s ease-in-out infinite' : 'none' }}>
                        {unlocked ? dayInfo.emoji : '🔒'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Day {dayInfo.day}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{dayInfo.name}</div>
                      {completed ? (
                        <div style={{ fontSize: 10, color: '#4ade80' }}>✓ Complete</div>
                      ) : unlocked ? (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Ready</div>
                      ) : (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>🔒 Locked</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GAMES TAB */}
          {activeTab === 'games' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
                <button 
                  onClick={() => setActiveGame('catch')} 
                  style={{ 
                    padding: '8px 14px', 
                    background: activeGame === 'catch' ? 'rgba(255,107,157,0.3)' : 'rgba(255,255,255,0.08)', 
                    border: 'none', 
                    borderRadius: 20, 
                    color: 'white', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  🎮 Catch
                </button>
                <button 
                  onClick={() => setActiveGame('match')} 
                  style={{ 
                    padding: '8px 14px', 
                    background: activeGame === 'match' ? 'rgba(255,107,157,0.3)' : 'rgba(255,255,255,0.08)', 
                    border: 'none', 
                    borderRadius: 20, 
                    color: 'white', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  🃏 Match
                </button>
                <button 
                  onClick={() => setActiveGame('quiz')} 
                  style={{ 
                    padding: '8px 14px', 
                    background: activeGame === 'quiz' ? 'rgba(255,107,157,0.3)' : 'rgba(255,255,255,0.08)', 
                    border: 'none', 
                    borderRadius: 20, 
                    color: 'white', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  ❓ Quiz
                </button>
                <button 
                  onClick={() => setActiveGame('word')} 
                  style={{ 
                    padding: '8px 14px', 
                    background: activeGame === 'word' ? 'rgba(255,107,157,0.3)' : 'rgba(255,255,255,0.08)', 
                    border: 'none', 
                    borderRadius: 20, 
                    color: 'white', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  🔤 Word
                </button>
              </div>
              {activeGame === 'catch' && <HeartCatchGame />}
              {activeGame === 'match' && <MatchingGame />}
              {activeGame === 'quiz' && <LoveQuiz />}
              {activeGame === 'word' && <WordScramble />}
            </div>
          )}

          {/* METER TAB */}
          {activeTab === 'meter' && <LoveMeter />}

          {/* CHAT TAB */}
          {activeTab === 'chat' && <Chat />}

        </div>

        {/* Leave Button */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <GlassButton variant="secondary" onClick={() => router.push('/')}>
            Leave Room
          </GlassButton>
        </div>

        {/* Hint */}
        <div style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          🎈 Pop balloons · Move cursor for hearts ✨
        </div>
      </div>
    </div>
  );
}
