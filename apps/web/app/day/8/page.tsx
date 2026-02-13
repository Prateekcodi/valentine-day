'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { socketClient } from '@/lib/socket';
import { SoundPlayer } from '@/components/ui/SoundPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Cinematic opening sound
const CINEMATIC_SOUND = '/sound/lordsonny-cinematic-whoosh-reverse-161307.mp3';

// ═══════════════════════════════════════════════════════════
// PALETTE & COLORS
// ═══════════════════════════════════════════════════════════
const PALETTE = {
  black: "#050208",
  deep: "#12051e",
  burgundy: "#5c0a1e",
  crimson: "#9b1b30",
  rose: "#e0476b",
  blush: "#f9a8c4",
  gold: "#d4af37",
  champagne: "#f7e7ce",
  cream: "#fdf6ec",
  midnight: "#0d0d2b",
};

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT SYSTEM
// ═══════════════════════════════════════════════════════════
const ALL_BADGES = [
  { id: "first", icon: "🌹", name: "First Bloom", desc: "Started your journey" },
  { id: "letter", icon: "💌", name: "Love Poet", desc: "Generated a love letter" },
  { id: "lantern", icon: "🏮", name: "Wish Maker", desc: "Released a wish lantern" },
  { id: "constellation", icon: "⭐", name: "Star Gazer", desc: "Found the love constellation" },
  { id: "capsule", icon: "📦", name: "Time Keeper", desc: "Sealed a time capsule" },
  { id: "garden", icon: "🌺", name: "Love Gardener", desc: "Grew your love garden" },
  { id: "fortune", icon: "🥠", name: "Fortune Seeker", desc: "Opened a fortune cookie" },
  { id: "quiz", icon: "💝", name: "Love Expert", desc: "Completed the love language quiz" },
  { id: "promise", icon: "💎", name: "Promise Keeper", desc: "Made a star promise" },
  { id: "secret", icon: "🔮", name: "Secret Finder", desc: "Found a hidden Easter egg" },
];

// ═══════════════════════════════════════════════════════════
// 01. CURSOR TRAIL
// ═══════════════════════════════════════════════════════════
function CursorTrail() {
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number; shape: string; s: number }>>([]);
  const id = useRef(0);
  const shapes = ["💖", "✨", "🌸", "💫", "❤️", "🌟", "💕", "⭐"];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const n = ++id.current;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      setTrail(t => [...t.slice(-25), { id: n, x: e.clientX, y: e.clientY, shape, s: Math.random() * 12 + 8 }]);
      setTimeout(() => setTrail(t => t.filter(x => x.id !== n)), 800);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {trail.map(t => (
        <div key={t.id} style={{
          position: "absolute", left: t.x, top: t.y, fontSize: t.s,
          transform: "translate(-50%, -50%)",
          animation: "trailFade 0.8s ease-out forwards",
          userSelect: "none",
        }}>{t.shape}</div>
      ))}
      <style>{`
        @keyframes trailFade { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -200%) scale(0.2); } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 02. PARTICLE UNIVERSE
// ═══════════════════════════════════════════════════════════
function ParticleUniverse() {
  const particles = useRef(Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 14 + 4, dur: Math.random() * 20 + 10,
    delay: Math.random() * 10, opacity: Math.random() * 0.5 + 0.1,
    shape: ["💕", "✨", "🌸", "⭐", "💫", "🌺", "💗", "🌟"][Math.floor(Math.random() * 8)],
    drift: Math.random() * 80 - 40,
  }))).current;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          fontSize: p.size, opacity: p.opacity,
          animation: `particle${p.id % 6} ${p.dur}s ${p.delay}s ease-in-out infinite`,
          userSelect: "none", filter: "blur(0.3px)",
        }}>{p.shape}</div>
      ))}
      <style>{`
        @keyframes particle0 { 0%, 100% { transform: translate(0, 0) rotate(0); } 50% { transform: translate(30px, -40px) rotate(180deg); } }
        @keyframes particle1 { 0%, 100% { transform: translate(0, 0) rotate(0); } 50% { transform: translate(-40px, -60px) rotate(-180deg); } }
        @keyframes particle2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -30px) scale(1.4); } }
        @keyframes particle3 { 0%, 100% { transform: translate(0, 0) rotate(0); } 33% { transform: translate(-20px, -50px); } 66% { transform: translate(40px, -20px); } }
        @keyframes particle4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, -70px) rotate(360deg); } }
        @keyframes particle5 { 0% { transform: translate(0, 0) scale(0.8); } 50% { transform: translate(50px, -30px) scale(1.2); } 100% { transform: translate(0, 0) scale(0.8); } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 03. ROSE PETAL RAIN
// ═══════════════════════════════════════════════════════════
function PetalRain({ active }: { active: boolean }) {
  const petals = useRef(Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 110 - 5, dur: Math.random() * 6 + 5,
    delay: Math.random() * 8, size: Math.random() * 20 + 12, rot: Math.random() * 360,
    drift: Math.random() * 100 - 50,
  }))).current;

  if (!active) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
      {petals.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: "-5%", fontSize: p.size,
          animation: `petalFall ${p.dur}s ${p.delay}s linear infinite`,
          ['--drift' as string]: `${p.drift}px`, userSelect: "none",
        }}>🌸</div>
      ))}
      <style>{`@keyframes petalFall { 0% { top: -5%; transform: translateX(0) rotate(0deg); opacity: 1; } 100% { top: 105%; transform: translateX(var(--drift)) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 04. ACHIEVEMENT TOAST
// ═══════════════════════════════════════════════════════════
function AchievementToast({ badge, onDone }: { badge: typeof ALL_BADGES[0]; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9998,
      background: "linear-gradient(135deg, #d4af37, #f7e7ce)",
      borderRadius: 16, padding: "14px 20px",
      boxShadow: "0 10px 40px rgba(212,175,55,0.5)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "toastSlide 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
      maxWidth: 280,
    }}>
      <div style={{ fontSize: 36 }}>{badge.icon}</div>
      <div>
        <div style={{ fontWeight: 900, color: "#12051e", fontSize: 14 }}>Achievement Unlocked!</div>
        <div style={{ fontWeight: 700, color: "#5c0a1e", fontSize: 16 }}>{badge.name}</div>
        <div style={{ color: "#7b4e2b", fontSize: 12 }}>{badge.desc}</div>
      </div>
      <style>{`@keyframes toastSlide { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 05. FIREWORKS
// ═══════════════════════════════════════════════════════════
function Fireworks({ active }: { active: boolean }) {
  if (!active) return null;
  const bursts = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: Math.random() * 90 + 5, y: Math.random() * 60 + 5,
    color: ["#e0476b", "#d4af37", "#a855f7", "#22d3ee", "#f9a8c4", "#4ade80"][i % 6],
    delay: Math.random() * 1.5,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {bursts.map(b => (
        <div key={b.id} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, animation: `fireworkBurst 1.5s ${b.delay}s ease-out forwards` }}>
          {Array.from({ length: 12 }, (_, j) => (
            <div key={j} style={{
              position: "absolute", width: 6, height: 6, borderRadius: "50%", background: b.color,
              animation: `fireworkParticle 1.2s ${b.delay}s ease-out forwards`,
              ['--fa' as string]: `${(j / 12) * 360}deg`,
            }} />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes fireworkBurst { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        @keyframes fireworkParticle { 0% { transform: rotate(var(--fa)) translateY(0); opacity: 1; } 100% { transform: rotate(var(--fa)) translateY(-80px); opacity: 0; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 06. CINEMATIC OPENING
// ═══════════════════════════════════════════════════════════
function CinematicOpening({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const name1 = "My Love";
  const msg = `Happy Valentine's Day, ${name1}...`;

  useEffect(() => {
    // Play cinematic sound when opening starts
    audioRef.current = new Audio(CINEMATIC_SOUND);
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch(() => {});
    
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3600);
    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); 
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (phase !== 3) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) { clearInterval(t); setTimeout(() => setPhase(4), 1000); }
    }, 60);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => { if (phase === 4) setTimeout(onDone, 1200); }, [phase, onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000, background: "#050208",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "none",
    }}>
      {phase >= 1 && (
        <div style={{ fontSize: 100, animation: "roseBlossom 1.2s cubic-bezier(0.175,0.885,0.32,1.275) forwards", marginBottom: 30 }}>
          🌹
        </div>
      )}
      {phase >= 2 && (
        <div style={{ width: 300, height: 50, marginBottom: 24, overflow: "hidden", position: "relative" }}>
          <svg viewBox="0 0 300 50" style={{ width: "100%" }}>
            <polyline
              points="0,25 40,25 55,5 65,45 75,20 85,25 130,25 145,5 155,45 165,20 175,25 220,25 235,5 245,45 255,20 265,25 300,25"
              fill="none" stroke="#e0476b" strokeWidth="2"
              style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: "ekg 1.5s ease forwards" }}
            />
          </svg>
        </div>
      )}
      {phase >= 3 && (
        <div style={{
          fontSize: 24, color: PALETTE.champagne, fontFamily: "Georgia,serif",
          letterSpacing: 2, textAlign: "center", minHeight: 36,
        }}>
          {typed}<span style={{ animation: "blink 0.6s infinite" }}>|</span>
        </div>
      )}
      {phase >= 4 && (
        <div style={{ marginTop: 30, animation: "fadeInUp 0.8s forwards" }}>
          <SparkBtn color={PALETTE.rose} onClick={onDone}>Enter Our World 💕</SparkBtn>
        </div>
      )}
      <style>{`
        @keyframes roseBlossom { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes ekg { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
        @keyframes fadeInUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 07. SPARKLE BUTTON
// ═══════════════════════════════════════════════════════════
function SparkBtn({ children, onClick, color = "#e0476b", small, disabled, style: ext = {} }: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  small?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [sparks, setSparks] = useState<Array<{ id: number; a: number }>>([]);
  const click = (e: React.MouseEvent) => {
    if (disabled) return;
    const ns = Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + i, a: (i / 10) * 360 }));
    setSparks(s => [...s, ...ns]);
    setTimeout(() => setSparks(s => s.filter(x => !ns.map(n => n.id).includes(x.id))), 700);
    onClick?.();
  };

  return (
    <button onClick={click} disabled={disabled} style={{
      position: "relative", overflow: "visible",
      background: disabled ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${color},${color}bb)`,
      border: `2px solid ${disabled ? "rgba(255,255,255,0.2)" : color}`,
      borderRadius: 50, padding: small ? "10px 22px" : "14px 34px",
      fontSize: small ? 13 : 16, fontWeight: 800, color: "white", cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : `0 6px 30px ${color}55,inset 0 1px 0 rgba(255,255,255,0.3)`,
      transition: "all 0.2s", fontFamily: "Georgia,serif", letterSpacing: 1,
      opacity: disabled ? 0.4 : 1, ...ext,
    }}>
      {children}
      {sparks.map(s => (
        <div key={s.id} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 6, height: 6, borderRadius: "50%", background: color,
          animation: "sparkOut 0.7s ease-out forwards",
          ['--sx' as string]: `${Math.cos(s.a * Math.PI / 180) * 45}px`,
          ['--sy' as string]: `${Math.sin(s.a * Math.PI / 180) * 45}px`,
        }} />
      ))}
      <style>{`@keyframes sparkOut { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(0); opacity: 0; } }`}</style>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// 08. GLASS CARD
// ═══════════════════════════════════════════════════════════
function GCard({ children, style: s = {}, glow = PALETTE.rose }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{
      background: "rgba(12,3,24,0.75)",
      backdropFilter: "blur(24px)",
      borderRadius: 24,
      border: `1px solid rgba(224,71,107,0.25)`,
      boxShadow: `0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.08)`,
      ...s,
    }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 09. SECTION HEADER
// ═══════════════════════════════════════════════════════════
function SectionHead({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div style={{ fontSize: 48, marginBottom: 8, animation: "floatBob 3s ease-in-out infinite" }}>{icon}</div>
      <h2 style={{
        fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 900,
        background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        letterSpacing: 2, marginBottom: 6,
      }}>{title}</h2>
      {subtitle && <p style={{ color: "rgba(249,168,196,0.7)", fontSize: 14, fontFamily: "Georgia,serif", fontStyle: "italic" }}>{subtitle}</p>}
      <style>{`@keyframes floatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 10. LOVE LETTER GENERATOR
// ═══════════════════════════════════════════════════════════
const LETTER_TEMPLATES = [
  (n1: string, n2: string) => `My dearest ${n2 || "love"},

Har baar tumhara message padhte hi mera dil literally *buffering… please wait* mode mein chala jaata hai ❤️  
Tum kehti ho sunrise reminds you of me, but sach bataun — **tum ho meri morning coffee**, bina tumhare main boot hi nahi hota ☕😌  

The way you keep me in the safest corner of your heart is cute, but FYI —
main wahan **full storage occupy** karne aa raha hoon, no uninstall, no logout 😄💘  

You call me your home, and official confirmation:
**Lifetime warranty, zero rent, unlimited love supply** from my side 🏡❤️  

Is lifetime, next lifetime, aur universe ke har reboot ke baad bhi,
I’d still choose *you* — bina terms & conditions padhe 🫶  

Forever yours (with extra hugs, bad jokes, and unlimited smiles),
${n1 || "Your Love"} 💖`,

  (n1: string, n2: string) => `My dearest ${n2 || "love"},

Every sunrise reminds me of you — warm, golden, aur thoda sa distracting (kyunki tum pe nazar hi atak jaati hai 😌).  
Is lifetime mein kya, har lifetime mein main tumhe hi choose karunga, no second thoughts.  

Tumhari hasi, tumhari khushi, aur woh sparkle jab tum smile karti ho —
yeh sab maine apne dil ke **password-protected folder** mein save kar liya hai ❤️  

You are not just my Valentine —
**tum mera ghar ho, meri peace ho, aur meri favorite notification ho** 🫶  

Forever yours,
${n1 || "Your Love"} 💕`,

  (n1: string, n2: string) => `To ${n2 || "the one I love"},

Main words dhoondhne nikla tha tumhare liye,
par tum itni perfect nikli ki dictionary bhi hang ho gayi 😅✨  

Tum woh poetry ho jo bina padhe samajh aa jaaye,
aur woh song ho jo bina play kiye hi dil mein bajta rahe 🎶  

Agar love ek universe hota,
toh tum hi uska centre hoti — baaki sab bas orbit karte 💫  

Always and infinitely,
${n1 || "Your Love"} 🌟`,

  (n1: string, n2: string) => `Darling ${n2 || "heart"},

Log poori zindagi dhoondhte hain jo humein itna naturally mil gaya —
yeh easy, beautiful, thoda sa pagal sa love ❤️😄  

Universe ne jab humein same story mein likha,
tab se mujhe yaqeen ho gaya — plot perfect hai 😌  

Thank you for being you.
For choosing me.
For tolerating my nonsense 😅  

Yours in every season (and every mood),
${n1 || "Your Love"} 🌹`,
];

function LoveLetter({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [n1, setN1] = useState("");
  const n2 = useRef("");
  const [letter, setLetter] = useState("");
  const [typed, setTyped] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      // Call AI API for personalized love letter
      const res = await fetch(API_URL + '/api/love-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderName: n1 || 'My Love', 
          recipientName: n2.current || 'Darling' 
        }),
      });
      const data = await res.json();
      const full = data.letter || LETTER_TEMPLATES[Math.floor(Math.random() * LETTER_TEMPLATES.length)](n1, n2.current);
      setLetter(full);
      setTyped("");
      let i = 0;
      const t = setInterval(() => {
        i++;
        setTyped(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(t);
          setGenerating(false);
          if (!done) { setDone(true); onUnlock("letter"); }
          // Emit socket event
          if (roomId) {
            const pid = localStorage.getItem('playerId');
            socketClient.emit('day-action', { 
              roomId, 
              playerId: pid, 
              day: 8, 
              action: 'letter', 
              data: { message: full } 
            });
          }
        }
      }, 18);
    } catch (e) {
      console.error('Failed to generate letter:', e);
      // Fallback to template
      const tmpl = LETTER_TEMPLATES[Math.floor(Math.random() * LETTER_TEMPLATES.length)];
      const full = tmpl(n1, n2.current);
      setLetter(full);
      setTyped("");
      setGenerating(false);
      if (!done) { setDone(true); onUnlock("letter"); }
      if (roomId) {
        const pid = localStorage.getItem('playerId');
        socketClient.emit('day-action', { 
          roomId, 
          playerId: pid, 
          day: 8, 
          action: 'letter', 
          data: { message: full } 
        });
      }
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(typed).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <SectionHead icon="💌" title="Love Letter Generator" subtitle="Let your heart speak in words..." />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <input value={n1} onChange={e => setN1(e.target.value)} placeholder="Your name..." style={inputStyle} />
        <input onChange={e => n2.current = e.target.value} placeholder="Their name..." style={inputStyle} />
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <SparkBtn onClick={generate} color={PALETTE.crimson} disabled={generating}>
          {generating ? "Writing..." : "✍️ Write Our Story"}
        </SparkBtn>
      </div>
      {letter && (
        <div style={{
          background: "rgba(247,231,206,0.07)",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 20, padding: 24,
          fontFamily: "Georgia,serif", lineHeight: 1.9,
          color: PALETTE.champagne, fontSize: 15,
          whiteSpace: "pre-wrap",
          boxShadow: "inset 0 0 40px rgba(212,175,55,0.05)",
          position: "relative", marginBottom: 16,
        }}>
          <div style={{ fontSize: 30, position: "absolute", top: 12, left: 16, opacity: 0.2 }}>💌</div>
          <div style={{ fontSize: 30, position: "absolute", bottom: 12, right: 16, opacity: 0.2 }}>🌹</div>
          <div style={{ paddingTop: 8 }}>{typed}</div>
        </div>
      )}
      {typed && !generating && (
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <SparkBtn small onClick={copy} color={PALETTE.gold}>
            {copied ? "✓ Copied!" : "📋 Copy Letter"}
          </SparkBtn>
          <SparkBtn small onClick={generate} color={PALETTE.burgundy}>🔄 New Letter</SparkBtn>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 11. 3D MEMORY SCRAPBOOK
// ═══════════════════════════════════════════════════════════
const MEMORIES = [
  { emoji: "🌅", front: "Our First Chat", back: "Woh raat jab baat 3am tak chali, aur time ka concept hi khatam ho gaya 💕" },
  { emoji: "📱", front: "That First Vibe", back: "Face nahi dekha, par vibe itni strong thi ki dil ne turant yes bol diya ✨" },
  { emoji: "💬", front: "Endless Talks", back: "Good morning se good night tak chats — aur phir bhi topic khatam nahi hua 😄" },
  { emoji: "🌧️", front: "Late Night Calls", back: "Silent raat, dheemi awaaz, aur bas tumhari baatein — pure comfort 🍵" },
  { emoji: "🎂", front: "Your Birthday", back: "Door hokar bhi tumhari excitement feel hui — bina cake khaye bhi 🎉" },
  { emoji: "💫", front: "Our Future", back: "Aaj face unseen hai, kal milna likha hai. Sapno mein toh hum already saath hain 💞" },
];

function MemoryCard({ mem, index }: { mem: typeof MEMORIES[0]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const colors = ["#9b1b30", "#5c0a1e", "#7c3aed", "#0e7490", "#92400e", "#166534"];
  const rots = ["-3deg", "2deg", "-1deg", "4deg", "-2deg", "3deg"];

  return (
    <div onClick={() => setFlipped(f => !f)} style={{
      cursor: "pointer", perspective: 1000,
      transform: `rotate(${rots[index % rots.length]})`,
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0) scale(1.05) translateY(-6px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rots[index % rots.length]})`; }}
    >
      <div style={{
        width: "100%", height: 160, position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
      }}>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: `linear-gradient(135deg,${colors[index % colors.length]}33,rgba(12,3,24,0.9))`,
          border: "1px solid rgba(212,175,55,0.3)", borderRadius: 16,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ width: 60, height: 60, borderRadius: 12,
            background: `linear-gradient(135deg,${colors[index % colors.length]},rgba(12,3,24,0.5))`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
            marginBottom: 10, border: "1px solid rgba(255,255,255,0.1)",
          }}>{mem.emoji}</div>
          <p style={{ color: PALETTE.champagne, fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, textAlign: "center" }}>{mem.front}</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 6 }}>tap to flip 💕</p>
          <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
            width: 40, height: 16, background: "rgba(212,175,55,0.3)", borderRadius: 2,
          }} />
        </div>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: "linear-gradient(135deg,rgba(212,175,55,0.15),rgba(224,71,107,0.15))",
          border: `1px solid ${PALETTE.gold}44`, borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          boxShadow: "0 8px 32px rgba(212,175,55,0.2)",
        }}>
          <p style={{ color: PALETTE.champagne, fontFamily: "Georgia,serif", fontStyle: "italic",
            fontSize: 13, lineHeight: 1.8, textAlign: "center" }}>{mem.back}</p>
        </div>
      </div>
    </div>
  );
}

function MemoryScrapbook() {
  return (
    <div>
      <SectionHead icon="📸" title="Memory Scrapbook" subtitle="Every moment we've shared, preserved forever..." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {MEMORIES.map((m, i) => <MemoryCard key={i} mem={m} index={i} />)}
      </div>
      <p style={{ textAlign: "center", color: "rgba(249,168,196,0.5)", fontSize: 12, marginTop: 16, fontStyle: "italic" }}>
        Tap any card to reveal the memory ✨
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 12. WISH LANTERNS
// ═══════════════════════════════════════════════════════════
function WishLanterns({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [wish, setWish] = useState("");
  const [lanterns, setLanterns] = useState<Array<{ id: number; text: string; x: number; color: string }>>([]);
  const [released, setReleased] = useState(false);
  const idRef = useRef(0);

  const release = () => {
    if (!wish.trim()) return;
    const id = ++idRef.current;
    setLanterns(l => [...l, { id, text: wish, x: Math.random() * 70 + 15, color: ["#e0476b", "#d4af37", "#a855f7", "#22d3ee"][id % 4] }]);
    setWish("");
    setReleased(true);
    onUnlock("lantern");
    // Emit socket event
    if (roomId) {
      const pid = localStorage.getItem('playerId');
      socketClient.emit('day-action', { 
        roomId, 
        playerId: pid, 
        day: 8, 
        action: 'lantern', 
        data: { wish: wish } 
      });
    }
    setTimeout(() => setLanterns(l => l.filter(x => x.id !== id)), 8000);
  };

  return (
    <div>
      <SectionHead icon="🏮" title="Wish Lanterns" subtitle="Write your wish, set it free into the universe..." />
      <div style={{ position: "relative", height: 200, background: "rgba(5,2,8,0.5)",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden", marginBottom: 20 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`,
            width: 2, height: 2, borderRadius: "50%", background: "white",
            animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`, opacity: Math.random() * 0.8 + 0.2 }} />
        ))}
        {lanterns.map(l => (
          <div key={l.id} style={{
            position: "absolute", bottom: 0, left: `${l.x}%`,
            animation: "lanternRise 8s ease-in forwards",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 11, color: "white", background: "rgba(0,0,0,0.6)",
              borderRadius: 8, padding: "3px 8px", marginBottom: 4, whiteSpace: "nowrap", maxWidth: 100,
              overflow: "hidden", textOverflow: "ellipsis" }}>{l.text}</div>
            <div style={{ fontSize: 32, filter: `drop-shadow(0 0 10px ${l.color})` }}>🏮</div>
          </div>
        ))}
        <style>{`
          @keyframes lanternRise { 0% { bottom: 0; opacity: 1; transform: rotate(0); } 50% { transform: rotate(-5deg); } 100% { bottom: 110%; opacity: 0; transform: rotate(5deg); } }
          @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        `}</style>
      </div>
      <textarea value={wish} onChange={e => setWish(e.target.value)}
        placeholder="Write your wish or promise for the year... 💫"
        maxLength={100} rows={3} style={{ ...inputStyle, borderRadius: 16, resize: "none", marginBottom: 16 }} />
      <div style={{ textAlign: "center" }}>
        <SparkBtn onClick={release} color="#d4af37" disabled={!wish.trim()}>
          🏮 Release Your Wish
        </SparkBtn>
      </div>
      {released && <p style={{ textAlign: "center", color: PALETTE.gold, marginTop: 12, fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14 }}>
        Your wish is flying to the stars ✨
      </p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 13. STAR CONSTELLATION
// ═══════════════════════════════════════════════════════════
const HEART_STARS = [
  { x: 50, y: 20 }, { x: 35, y: 30 }, { x: 25, y: 45 }, { x: 30, y: 62 }, { x: 50, y: 78 },
  { x: 70, y: 62 }, { x: 75, y: 45 }, { x: 65, y: 30 },
];

function StarConstellation({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
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
      onUnlock("constellation");
      // Emit socket event
      if (roomId) {
        const pid = localStorage.getItem('playerId');
        socketClient.emit('day-action', { 
          roomId, 
          playerId: pid, 
          day: 8, 
          action: 'constellation', 
          data: { message: 'Connected all stars in the love constellation!' } 
        });
      }
    }
  };

  return (
    <div>
      <SectionHead icon="⭐" title="Love Constellation" subtitle="Connect the stars to reveal what's hidden..." />
      <div style={{
        position: "relative", height: 260,
        background: "radial-gradient(ellipse at center,#0d0d2b 0%,#050208 100%)",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden", marginBottom: 16,
      }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, borderRadius: "50%", background: "white", opacity: Math.random() * 0.5 + 0.1 }} />
        ))}
        {shooting && <div style={{
          position: "absolute", left: `${shooting.x}%`, top: `${shooting.y}%`,
          width: 80, height: 2, background: "linear-gradient(90deg,rgba(255,255,255,0),white)",
          borderRadius: 2, animation: "shootingStar 1s ease-out forwards",
        }} />}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {connected.map((starIdx, i) => {
            if (i === 0) return null;
            const from = HEART_STARS[connected[i - 1]];
            const to = HEART_STARS[starIdx];
            return <line key={i}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={done ? "#d4af37" : "#e0476b"} strokeWidth="1.5" opacity="0.7"
            />;
          })}
          {done && <text x="50%" y="92%" textAnchor="middle" fill="#d4af37" fontSize="12"
            fontFamily="Georgia,serif" fontStyle="italic">
            Written in the stars 💫
          </text>}
        </svg>
        {HEART_STARS.map((s, i) => (
          <div key={i} onClick={() => clickStar(i)} style={{
            position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
            transform: "translate(-50%, -50%)",
            width: 20, height: 20, borderRadius: "50%",
            background: connected.includes(i)
              ? (done ? "radial-gradient(circle,#ffd700,#d4af37)" : "radial-gradient(circle,#ff6b9d,#e0476b)")
              : "radial-gradient(circle,rgba(255,255,255,0.8),rgba(255,255,255,0.2))",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, boxShadow: connected.includes(i) ? `0 0 16px ${done ? "#d4af37" : "#e0476b"}` : "0 0 6px rgba(255,255,255,0.4)",
            transition: "all 0.3s", zIndex: 10,
          }}>
            {connected.includes(i) ? "⭐" : "·"}
          </div>
        ))}
        <style>{`
          @keyframes shootingStar { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
        `}</style>
      </div>
      {done ? (
        <div style={{ textAlign: "center", animation: "fadeInUp 0.6s forwards" }}>
          <p style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700 }}>
            💫 The universe wrote your love story in the stars!
          </p>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "rgba(249,168,196,0.5)", fontSize: 13 }}>
          Click stars in order to connect them ({connected.length}/{HEART_STARS.length})
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 14. LOVE GARDEN
// ═══════════════════════════════════════════════════════════
const SEEDS = [
  { id: "rose", emoji: "🌹", name: "Love Rose", cost: 1, msg: "Pure love blooms here" },
  { id: "tulip", emoji: "🌷", name: "Passion Tulip", cost: 2, msg: "Your passion is beautiful" },
  { id: "sunflower", emoji: "🌻", name: "Happiness", cost: 3, msg: "You light up my world" },
  { id: "cherry", emoji: "🌸", name: "Cherry Blossom", cost: 5, msg: "Fleeting and precious as us" },
];

function LoveGarden({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [water, setWater] = useState(10);
  const [plants, setPlants] = useState<Array<{ id: number; seed: typeof SEEDS[0]; age: number }>>([]);
  const [stage, setStage] = useState<Record<number, number>>({});
  const [watered, setWatered] = useState(false);

  const plant = (seed: typeof SEEDS[0]) => {
    if (water < seed.cost) return;
    const id = Date.now();
    setWater(w => w - seed.cost);
    setPlants(p => [...p, { id, seed, age: 0 }]);
    setStage(s => ({ ...s, [id]: 0 }));
    setTimeout(() => setStage(s => ({ ...s, [id]: 1 })), 1200);
    setTimeout(() => setStage(s => ({ ...s, [id]: 2 })), 2800);
    setTimeout(() => setStage(s => ({ ...s, [id]: 3 })), 4500);
    onUnlock("garden");
    // Emit socket event
    if (roomId) {
      const pid = localStorage.getItem('playerId');
      socketClient.emit('day-action', { 
        roomId, 
        playerId: pid, 
        day: 8, 
        action: 'garden', 
        data: { flower: seed.emoji, message: seed.msg } 
      });
    }
  };

  const waterGarden = () => {
    setWater(w => Math.min(20, w + 3));
    setWatered(true);
    setTimeout(() => setWatered(false), 1000);
  };

  const sizes = ["0.4", "0.7", "1.0", "1.3"];

  return (
    <div>
      <SectionHead icon="🌺" title="Love Garden" subtitle="Plant seeds of love, watch them grow..." />
      <div style={{
        position: "relative", height: 140,
        background: "linear-gradient(to bottom,rgba(5,2,8,0) 0%,rgba(34,20,5,0.8) 100%)",
        borderRadius: "0 0 20px 20px",
        borderTop: "3px solid rgba(100,60,20,0.5)",
        marginBottom: 16, overflow: "hidden",
        display: "flex", alignItems: "flex-end", gap: 8, padding: "0 12px 12px",
      }}>
        {plants.slice(-8).map(p => (
          <div key={p.id} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            animation: "plantGrow 0.5s ease", flexShrink: 0,
          }}>
            <div style={{
              fontSize: 28 * parseFloat(sizes[stage[p.id] || 0]),
              transition: "font-size 0.8s cubic-bezier(0.175,0.885,0.32,1.275)",
              filter: `drop-shadow(0 0 8px ${["#e0476b", "#ff69b4", "#ffd700", "#ffb6c1"][p.seed.cost - 1]})`,
            }}>{p.seed.emoji}</div>
          </div>
        ))}
        {plants.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, margin: "auto", fontStyle: "italic" }}>
            Your garden awaits... 🌱
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {SEEDS.map(s => (
          <button key={s.id} onClick={() => plant(s)} disabled={water < s.cost} style={{
            flex: 1, minWidth: 70, padding: "10px 6px",
            background: water >= s.cost ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${water >= s.cost ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14, color: "white", cursor: water >= s.cost ? "pointer" : "not-allowed",
            opacity: water >= s.cost ? 1 : 0.4, fontSize: 13, transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{s.cost}💧</div>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: PALETTE.blush, fontSize: 14 }}>💧 Water: {water}</span>
        </div>
        <SparkBtn small onClick={waterGarden} color="#0e7490">
          {watered ? "💦 Watered!" : "💧 Water Garden"}
        </SparkBtn>
      </div>
      <style>{`@keyframes plantGrow { 0% { transform: scale(0) translateY(10px); } 100% { transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 15. FORTUNE COOKIES
// ═══════════════════════════════════════════════════════════
const FORTUNES = [
  "💕 Pyaar aisa ho toh life full HD mode mein chalti hai.",
  "✨ Stars aligned nahi hue, bas tum dono ka vibe match ho gaya.",
  "🌹 Ek chhota sa message bhi kabhi-kabhi hazaar lafzon se zyada bol deta hai.",
  "💫 Love dhundhne se nahi milta — bas ek din *ping* ho jaata hai.",
  "🌟 Dil alag-alag, par timing surprisingly perfect hai.",
  "💖 Har ending nahi, par tum dono ke saath har chapter special lagta hai.",
  "🌸 Sabse khoobsurat journey wahi hoti hai jahan ‘hum’ shuru hota hai.",
  "💎 True love rare hota hai — aur yeh wali kaafi precious hai.",
  "🌙 Chaand bhi sochta hoga, itna pyaar bina mile kaise ho gaya?",
  "🦋 Jab vibe match ho jaaye, distance sirf ek word reh jaata hai.",
];

function FortuneCookies({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [cracked, setCracked] = useState<boolean | null>(null);
  const [fortune, setFortune] = useState("");
  const [done, setDone] = useState(false);

  const crack = () => {
    setCracked(true);
    const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    setFortune(f);
    if (!done) { setDone(true); onUnlock("fortune"); }
    // Emit socket event
    if (roomId) {
      const pid = localStorage.getItem('playerId');
      socketClient.emit('day-action', { 
        roomId, 
        playerId: pid, 
        day: 8, 
        action: 'fortune', 
        data: { message: f } 
      });
    }
  };

  const reset = () => { setCracked(null); setFortune(""); };

  return (
    <div>
      <SectionHead icon="🥠" title="Fortune Cookies" subtitle="Crack open your love fortune..." />
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        {cracked === null ? (
          <div onClick={crack} style={{
            display: "inline-block", fontSize: 100, cursor: "pointer",
            animation: "cookieWiggle 2s ease-in-out infinite",
            filter: "drop-shadow(0 0 20px rgba(212,175,55,0.4))",
          }}>🥠</div>
        ) : (
          <div style={{ animation: "crackOpen 0.5s ease" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✨</div>
            <div style={{
              background: "rgba(247,231,206,0.1)",
              border: `1px solid ${PALETTE.gold}44`,
              borderRadius: 20, padding: 24,
              fontFamily: "Georgia,serif", fontStyle: "italic",
              color: PALETTE.champagne, fontSize: 18, lineHeight: 1.8,
              marginBottom: 20,
            }}>{fortune}</div>
            <SparkBtn small onClick={reset} color={PALETTE.burgundy}>
              🥠 Another Fortune
            </SparkBtn>
          </div>
        )}
      </div>
      <style>{`
        @keyframes cookieWiggle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes crackOpen { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 16. LOVE LANGUAGE QUIZ
// ═══════════════════════════════════════════════════════════
const LOVE_Q = [
  { 
    q: "When your partner is sad, you...", 
    opts: ["Bas paas rehna 🤗", "Sweet words bolna 💬", "Unka kaam apna bana lena 🏠", "Chhota sa surprise 🎁"], 
    scores: [0, 1, 2, 3] 
  },
  { 
    q: "Your ideal Valentine's Day is...", 
    opts: ["Sirf saath rehna 💃", "Dil se likha message 📝", "Kuch effort unke liye 🍝", "Cute surprise 🎁"], 
    scores: [0, 1, 2, 3] 
  },
  { 
    q: "You feel most loved when...", 
    opts: ["Unki presence se 🤝", "Unki baaton se 💌", "Unke actions se 🛠️", "Unki yaadon se 🎉"], 
    scores: [0, 1, 2, 3] 
  },
  { 
    q: "In arguments, you need...", 
    opts: ["Ek tight hug 🤗", "Dil se sorry 🗣️", "Actions se manao 🧹", "Peace offering mode 🕊️"], 
    scores: [0, 1, 2, 3] 
  },
  { 
    q: "Your love superpower is...", 
    opts: ["Warmth aur comfort 🌡️", "Dil se nikle words 🌺", "Kaam se pyaar 🌟", "Meaningful surprises 💝"], 
    scores: [0, 1, 2, 3] 
  },
];

const LOVE_LANGS = [
  "Physical Touch 🤗",
  "Words of Affirmation 💬",
  "Acts of Service 🏠",
  "Gift Giving 🎁"
];

const LOVE_DESC = [
  "Tumhara pyaar presence mein dikhta hai — paas rehna, comfort dena, bina bole saath khade rehna. Tum ho toh sab theek lagta hai.",
  "Tumhare liye words magic jaise hote hain. Ek simple ‘I’m here’ bhi tumhara mood aur din dono better kar deta hai.",
  "Tum pyaar bolte kam ho, dikhate zyada ho. Help karna, effort lena — yahi tumhara sabse strong way hai love dikhane ka.",
  "Tumhare gifts chhote ho sakte hain, par feelings heavy hoti hain. Har gift ka matlab hota hai — ‘tum yaad the.’",
];

function LoveLanguageQuiz({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [q, setQ] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [result, setResult] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);

  const pick = (score: number, i: number) => {
    if (sel !== null) return;
    setSel(i);
    const ns = [...scores];
    ns[score]++;
    setScores(ns);
    setTimeout(() => {
      if (q + 1 >= LOVE_Q.length) {
        const max = Math.max(...ns);
        const res = ns.indexOf(max);
        setResult(res);
        onUnlock("quiz");
        // Emit socket event
        if (roomId) {
          const pid = localStorage.getItem('playerId');
          socketClient.emit('day-action', { 
            roomId, 
            playerId: pid, 
            day: 8, 
            action: 'quiz', 
            data: { answers: ns, result: LOVE_LANGS[res] } 
          });
        }
      } else { setQ(q => q + 1); setSel(null); }
    }, 700);
  };

  const reset = () => { setQ(0); setScores([0, 0, 0, 0]); setResult(null); setSel(null); };

  if (result !== null) return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Your result is in..." />
      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ fontSize: 60, marginBottom: 12, animation: "floatBob 2s ease-in-out infinite" }}>
          {["🤗", "💬", "🏠", "🎁"][result]}
        </div>
        <h3 style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
          {LOVE_LANGS[result]}
        </h3>
        <p style={{ color: PALETTE.champagne, fontFamily: "Georgia,serif", fontStyle: "italic",
          fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{LOVE_DESC[result]}</p>
        <SparkBtn small onClick={reset} color={PALETTE.crimson}>🔄 Retake Quiz</SparkBtn>
      </div>
    </div>
  );

  const curr = LOVE_Q[q];
  return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Discover how you love..." />
      <div style={{ marginBottom: 6, display: "flex", gap: 4, justifyContent: "center" }}>
        {LOVE_Q.map((_, i) => (
          <div key={i} style={{ width: 32, height: 4, borderRadius: 2,
            background: i < q ? PALETTE.rose : i === q ? PALETTE.gold : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
        ))}
      </div>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", marginBottom: 18 }}>Q{q + 1}/{LOVE_Q.length}</p>
      <p style={{ color: PALETTE.champagne, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700,
        marginBottom: 18, textAlign: "center", lineHeight: 1.6 }}>{curr.q}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {curr.opts.map((opt, i) => (
          <button key={i} onClick={() => pick(curr.scores[i], i)} style={{
            padding: "14px 10px", borderRadius: 16,
            border: `2px solid ${sel === i ? "rgba(212,175,55,0.8)" : "rgba(255,255,255,0.15)"}`,
            background: sel === i ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
            color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s", fontFamily: "Georgia,serif",
            transform: sel === i ? "scale(1.02)" : "scale(1)",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 17. PROMISE STARS
// ═══════════════════════════════════════════════════════════
function PromiseStars({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [promise, setPromise] = useState("");
  const [stars, setStars] = useState<Array<{ id: number; text: string; x: number; y: number; size: number }>>([]);
  const [done, setDone] = useState(false);

  const addStar = () => {
    if (!promise.trim()) return;
    const ns = [...stars, {
      id: Date.now(), text: promise,
      x: Math.random() * 80 + 10, y: Math.random() * 70 + 10,
      size: Math.random() * 10 + 14,
    }];
    setStars(ns);
    setPromise("");
    if (!done) { setDone(true); onUnlock("promise"); }
    // Emit socket event
    if (roomId) {
      const pid = localStorage.getItem('playerId');
      socketClient.emit('day-action', { 
        roomId, 
        playerId: pid, 
        day: 8, 
        action: 'promise', 
        data: { promise: promise } 
      });
    }
  };

  return (
    <div>
      <SectionHead icon="💎" title="Promise Stars" subtitle="Write a promise — it becomes a star in our sky..." />
      <div style={{
        position: "relative", height: 200,
        background: "radial-gradient(ellipse at center,#0d0d2b,#050208)",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden", marginBottom: 18,
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            width: 1.5, height: 1.5, borderRadius: "50%", background: "white", opacity: 0.3 }} />
        ))}
        {stars.map(s => (
          <div key={s.id} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
            transform: "translate(-50%, -50%)", fontSize: s.size,
            animation: "starPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            cursor: "default", filter: "drop-shadow(0 0 6px #d4af37)",
          }} title={s.text}>⭐</div>
        ))}
        {stars.length === 0 && <p style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", color: "rgba(255,255,255,0.2)", fontStyle: "italic", fontSize: 13 }}>
          Your promises will shine here ✨</p>}
        <style>{`@keyframes starPop { 0% { transform: translate(-50%, -50%) scale(0); } 100% { transform: translate(-50%, -50%) scale(1); } }`}</style>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={promise} onChange={e => setPromise(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addStar()}
          placeholder="I promise to always..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addStar} disabled={!promise.trim()} style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: "rgba(212,175,55,0.3)", border: "1px solid rgba(212,175,55,0.5)",
          color: "white", fontSize: 20, cursor: promise.trim() ? "pointer" : "not-allowed",
          opacity: promise.trim() ? 1 : 0.4,
        }}>⭐</button>
      </div>
      {stars.length > 0 && <p style={{ textAlign: "center", color: "rgba(212,175,55,0.6)", fontSize: 13, marginTop: 12, fontStyle: "italic" }}>
        {stars.length} promise{stars.length > 1 ? "s" : ""} shining in the sky 💫
      </p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 18. TIME CAPSULE
// ═══════════════════════════════════════════════════════════
function TimeCapsule({ onUnlock, roomId }: { onUnlock: (id: string) => void; roomId?: string }) {
  const [msg, setMsg] = useState("");
  const [sealed, setSealed] = useState(false);
  const [done, setDone] = useState(false);

  const seal = () => {
    if (!msg.trim()) return;
    setSealed(true);
    if (!done) { setDone(true); onUnlock("capsule"); }
    // Emit socket event
    if (roomId) {
      const pid = localStorage.getItem('playerId');
      socketClient.emit('day-action', { 
        roomId, 
        playerId: pid, 
        day: 8, 
        action: 'capsule', 
        data: { message: msg } 
      });
    }
  };

  return (
    <div>
      <SectionHead icon="📦" title="Time Capsule" subtitle="A message to your future selves..." />
      {!sealed ? (
        <div>
          <div style={{
            textAlign: "center", fontSize: 72, marginBottom: 20,
            animation: "floatBob 3s ease-in-out infinite",
          }}>💌</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Dear us, one year from today... What do you hope for? What do you promise? Write to your future selves..."
            maxLength={400} rows={5} style={{ ...inputStyle, borderRadius: 16, resize: "none", marginBottom: 16 }} />
          <div style={{ textAlign: "center" }}>
            <SparkBtn onClick={seal} color={PALETTE.burgundy} disabled={!msg.trim()}>
              🔐 Seal the Capsule
            </SparkBtn>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", animation: "sealReveal 0.8s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
          <div style={{ fontSize: 80, marginBottom: 16, filter: "drop-shadow(0 0 20px #d4af37)" }}>📬</div>
          <div style={{
            background: "rgba(212,175,55,0.1)", border: `1px solid ${PALETTE.gold}44`,
            borderRadius: 20, padding: 24, marginBottom: 20,
          }}>
            <div style={{ color: PALETTE.gold, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>📦 SEALED</div>
            <div style={{ color: PALETTE.champagne, fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 15 }}>
              To be opened on Valentine's Day 2027 💌
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>
              "Some things are worth waiting for."
            </div>
          </div>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", background: "rgba(212,175,55,0.2)",
            border: `2px solid ${PALETTE.gold}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24, margin: "0 auto",
          }}>🔒</div>
          <style>{`@keyframes sealReveal { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 19. ACHIEVEMENTS PANEL
// ═══════════════════════════════════════════════════════════
function AchievementsPanel({ unlocked }: { unlocked: string[] }) {
  return (
    <div>
      <SectionHead icon="🏆" title="Your Achievements" subtitle={`${unlocked.length}/${ALL_BADGES.length} unlocked`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ALL_BADGES.map(b => {
          const got = unlocked.includes(b.id);
          return (
            <div key={b.id} style={{
              padding: "14px 12px", borderRadius: 16,
              background: got ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${got ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: 10,
              transition: "all 0.3s",
              filter: got ? "none" : "grayscale(1)",
              opacity: got ? 1 : 0.5,
            }}>
              <div style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ color: got ? PALETTE.gold : PALETTE.champagne, fontWeight: 700, fontSize: 12 }}>{b.name}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      {unlocked.length === ALL_BADGES.length && (
        <div style={{
          marginTop: 20, textAlign: "center",
          background: "rgba(212,175,55,0.15)", border: `1px solid ${PALETTE.gold}44`,
          borderRadius: 20, padding: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👑</div>
          <p style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 18 }}>
            Love Master Achieved!
          </p>
          <p style={{ color: PALETTE.champagne, fontSize: 14, fontStyle: "italic", marginTop: 6 }}>
            You've explored every corner of this love story 💕
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INPUT STYLE
// ═══════════════════════════════════════════════════════════
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(224,71,107,0.3)",
  borderRadius: 50,
  padding: "12px 20px",
  color: "white",
  fontSize: 14,
  outline: "none",
  backdropFilter: "blur(10px)",
  fontFamily: "Georgia,serif",
};

// ═══════════════════════════════════════════════════════════
// NAVIGATION TABS
// ═══════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "letter", label: "💌", name: "Letter" },
  { id: "scrapbook", label: "📸", name: "Memories" },
  { id: "lanterns", label: "🏮", name: "Lanterns" },
  { id: "constellation", label: "⭐", name: "Stars" },
  { id: "garden", label: "🌺", name: "Garden" },
  { id: "fortune", label: "🥠", name: "Fortune" },
  { id: "quiz", label: "💝", name: "Quiz" },
  { id: "promises", label: "💎", name: "Promises" },
  { id: "capsule", label: "📦", name: "Capsule" },
  { id: "achievements", label: "🏆", name: "Awards" },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
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

  // Valentine features state
  const [opened, setOpened] = useState(false);
  const [romanticSound, setRomanticSound] = useState<string | null>(null);
  const [section, setSection] = useState("letter");
  const [unlocked, setUnlocked] = useState<string[]>(["first"]);
  const [toastBadge, setToastBadge] = useState<typeof ALL_BADGES[0] | null>(null);
  const [petalRain, setPetalRain] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Secret trigger refs
  const [secretHint, setSecretHint] = useState("");
  const titleTapRef = useRef(0);
  const titleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const heartLongPress = useRef<NodeJS.Timeout | null>(null);
  const shakeRef = useRef({lastX:0, lastY:0, lastZ:0, count:0});
  const konamiProgress = useRef(0);
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  
  // Partner real-time state
  const [partnerData, setPartnerData] = useState<{
    letter?: string;
    lantern?: string;
    promises?: string[];
    garden?: { flower: string; message: string }[];
    quizAnswers?: number[];
    capsule?: string;
    memory?: string;
  }>({});
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isPartnerActive, setIsPartnerActive] = useState(false);
  const [bothResponses, setBothResponses] = useState<{
    player1: { name: string; letter?: string; lantern?: string; promises?: string[]; capsule?: string; garden?: { flower: string; message: string }[]; quiz?: number[]; constellation?: string; fortune?: string };
    player2: { name: string; letter?: string; lantern?: string; promises?: string[]; capsule?: string; garden?: { flower: string; message: string }[]; quiz?: number[]; constellation?: string; fortune?: string };
  } | null>(null);

  // API check and socket setup
  useEffect(() => {
    setMounted(true);
    const pid = localStorage.getItem('playerId');
    if (!pid) {
      router.push('/?error=Please+join+a+room+first');
      return;
    }
    
    // Connect to socket
    const socket = socketClient.connect();
    
    // Join room for real-time updates
    if (roomId) {
      socket.emit('join-room', { roomId, playerId: pid });
      
      // Listen for partner actions
      socket.on('partner-acted', (data: { playerId: string; day: number; action: string; data: any }) => {
        if (data.day === 8) {
          setIsPartnerActive(true);
          setTimeout(() => setIsPartnerActive(false), 3000);
          
          // Update partner data based on action
          if (data.action === 'letter') {
            setPartnerData(prev => ({ ...prev, letter: data.data.message }));
          } else if (data.action === 'lantern') {
            setPartnerData(prev => ({ ...prev, lantern: data.data.wish }));
          } else if (data.action === 'promise') {
            setPartnerData(prev => ({ ...prev, promises: [...(prev.promises || []), data.data.promise] }));
          } else if (data.action === 'garden') {
            setPartnerData(prev => ({ ...prev, garden: [...(prev.garden || []), { flower: data.data.flower, message: data.data.message }] }));
          } else if (data.action === 'quiz') {
            setPartnerData(prev => ({ ...prev, quizAnswers: data.data.answers }));
          } else if (data.action === 'capsule') {
            setPartnerData(prev => ({ ...prev, capsule: data.data.message }));
          } else if (data.action === 'memory') {
            setPartnerData(prev => ({ ...prev, memory: data.data.memory }));
          }
        }
      });
      
      // Listen for day completion
      socket.on('day-completed', (data: { day: number; reflection: string }) => {
        if (data.day === 8) {
          setReflection(data.reflection);
          setPartnerSubmitted(true);
          checkExisting(); // Reload all data
        }
      });

      // Listen for partner submitting data - reload status
      socket.on('partner-acted', (data: { playerId: string; day: number; action: string; data: any }) => {
        if (data.day === 8 && data.action === 'submit-data') {
          // Partner submitted their data - reload to check status
          checkExisting();
        }
      });
      
      // Get partner name from room
      fetchRoomInfo();
    }
    
    checkExisting();
    const poll = setInterval(function () { if (!reflection) checkExisting(); else clearInterval(poll); }, 10000);
    return function () { 
      clearInterval(poll); 
      socketClient.removeAllListeners();
    };
  }, []);

  // Secret easter egg triggers
  // Tap logo 7 times handler
  const handleLogoClick = () => {
    if (titleTapTimer.current) clearTimeout(titleTapTimer.current);
    titleTapRef.current++;
    titleTapTimer.current = setTimeout(() => { titleTapRef.current = 0; }, 1000);
    if (titleTapRef.current >= 7) {
      titleTapRef.current = 0;
      setSecretHint("You tapped 7 times! 🎉 Try the others:");
      setEasterEgg(true);
      unlock("secret");
    }
  };

  // Long press (3 seconds) handler
  const handleLogoMouseDown = () => {
    heartLongPress.current = setTimeout(() => {
      setSecretHint("Long press detected! 🎉 Try the others:");
      setEasterEgg(true);
      unlock("secret");
    }, 3000);
  };
  const handleLogoMouseUp = () => {
    if (heartLongPress.current) clearTimeout(heartLongPress.current);
  };

  // Keyboard - Konami code handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === KONAMI[konamiProgress.current]) {
        konamiProgress.current++;
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0;
          setSecretHint("Konami code activated! 🎉 Try the others:");
          setEasterEgg(true);
          unlock("secret");
        }
      } else {
        konamiProgress.current = 0;
      }
    };

    // Shake detection handler
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const now = Date.now();
      const diff = now - shakeRef.current.count;
      if (diff < 1000) return;
      if (Math.abs(acc.x - shakeRef.current.lastX) > 20 || 
          Math.abs(acc.y - shakeRef.current.lastY) > 20 || 
          Math.abs(acc.z - shakeRef.current.lastZ) > 20) {
        shakeRef.current.lastX = acc.x;
        shakeRef.current.lastY = acc.y;
        shakeRef.current.lastZ = acc.z;
        shakeRef.current.count = now;
        setSecretHint("Shake detected! 🎉 Try the others:");
        setEasterEgg(true);
        unlock("secret");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, []);

  const checkExisting = async function () {
    try {
      const pid = localStorage.getItem('playerId');
      const res = await fetch(API_URL + '/api/day/' + dayNumber + '/status?room=' + roomId + '&playerId=' + (pid || ''));
      const data = await res.json();
      if (data.submitted) {
        setSubmitted(true);
        if (data.partnerSubmitted) {
          setPartnerSubmitted(true);
          if (data.reflection) setReflection(data.reflection);
          // Fetch both responses for summary
          if (data.responses) {
            setBothResponses(data.responses);
          }
        }
      }
    } catch (e) { console.error('Check failed:', e); }
  };
  
  const fetchRoomInfo = async function () {
    try {
      const res = await fetch(API_URL + '/api/room/' + roomId);
      const data = await res.json();
      const pid = localStorage.getItem('playerId');
      const myNameFromStorage = localStorage.getItem('playerName') || 'You';
      setMyName(myNameFromStorage);
      if (data.player1?.id !== pid && data.player1?.name) {
        setPartnerName(data.player1.name);
      } else if (data.player2?.name) {
        setPartnerName(data.player2.name);
      }
      // Store both players' names
      if (data.player1 && data.player2) {
        setBothResponses({
          player1: { name: data.player1.name || 'Player 1' },
          player2: { name: data.player2.name || 'Player 2' }
        });
      }
    } catch (e) { console.error('Fetch room failed:', e); }
  };

  const handleSubmit = async function () {
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
      // Reload data to get accurate status
      await checkExisting();
    } catch (e) { console.error('Submit failed:', e); }
    finally { setLoading(false); }
  };

  const handleContinue = function () { router.push('/room/' + roomId); };

  const handleDownload = function () {
    if (!bothResponses || !reflection) return;
    
    const p1 = bothResponses.player1;
    const p2 = bothResponses.player2;
    
    const content = `
╔══════════════════════════════════════════════════════════════╗
║            💕 VALENTINE'S DAY 2026 - OUR LOVE STORY 💕        ║
╚══════════════════════════════════════════════════════════════╝

📅 Generated on: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💝 AI REFLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reflection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 ${myName || 'Player 1'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💌 Love Letter:
${p1.letter || 'Not shared'}

🏮 Wish Lantern:
${p1.lantern || 'Not shared'}

⭐ Promises:
${p1.promises?.length ? p1.promises.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'No promises made'}

📦 Time Capsule:
${p1.capsule || 'Not shared'}

${p1.garden?.length ? `🌺 Love Garden:\n${p1.garden.map(g => `- ${g.flower}: ${g.message}`).join('\n')}` : ''}

${p1.quiz ? `💝 Love Language Quiz: Completed (scores: ${p1.quiz.join(', ')})` : ''}

${p1.constellation ? `⭐ Star Constellation: ${p1.constellation}` : ''}

${p1.fortune ? `🥠 Fortune: ${p1.fortune}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💕 ${partnerName || 'Player 2'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💌 Love Letter:
${p2.letter || 'Not shared'}

🏮 Wish Lantern:
${p2.lantern || 'Not shared'}

⭐ Promises:
${p2.promises?.length ? p2.promises.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'No promises made'}

📦 Time Capsule:
${p2.capsule || 'Not shared'}

${p2.garden?.length ? `🌺 Love Garden:\n${p2.garden.map(g => `- ${g.flower}: ${g.message}`).join('\n')}` : ''}

${p2.quiz ? `💝 Love Language Quiz: Completed (scores: ${p2.quiz.join(', ')})` : ''}

${p2.constellation ? `⭐ Star Constellation: ${p2.constellation}` : ''}

${p2.fortune ? `🥠 Fortune: ${p2.fortune}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💕 Thank you for sharing this beautiful journey together!
   Created with love for Valentine's Day 2026 💕
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valentine-2026-${roomId || 'love-story'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Achievement unlock
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

  useEffect(() => { if (opened) unlock("first"); }, [opened]);

  const sectionProps = { onUnlock: unlock, roomId };

  const renderSection = () => {
    switch (section) {
      case "letter": return <LoveLetter {...sectionProps} />;
      case "scrapbook": return <MemoryScrapbook />;
      case "lanterns": return <WishLanterns {...sectionProps} />;
      case "constellation": return <StarConstellation {...sectionProps} />;
      case "garden": return <LoveGarden {...sectionProps} />;
      case "fortune": return <FortuneCookies {...sectionProps} />;
      case "quiz": return <LoveLanguageQuiz {...sectionProps} />;
      case "promises": return <PromiseStars {...sectionProps} />;
      case "capsule": return <TimeCapsule {...sectionProps} />;
      case "achievements": return <AchievementsPanel unlocked={unlocked} />;
      default: return null;
    }
  };

  if (!mounted) return null;

  // Show wait for partner screen when only this player has submitted
  if (submitted && !partnerSubmitted && bothResponses) {
    return (
      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 20% 20%,#1a0515 0%,${PALETTE.black} 50%,#0a0015 100%)`,
        fontFamily: "Georgia,serif",
        cursor: "none",
        overflowX: "hidden",
      }}>
        <style>{globalStyles}</style>
        <CursorTrail />
        <ParticleUniverse />

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 80px" }}>
          <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 10, filter: `drop-shadow(0 0 20px ${PALETTE.rose})` }}>💕</div>
            <h1 style={{
              fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 28, letterSpacing: 3,
              background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush},${PALETTE.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Valentine's Day 2026
            </h1>
          </div>

          <GCard style={{ padding: 28 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 80, marginBottom: 20, animation: "floatBob 2s ease-in-out infinite" }}>⏳</div>
              <h2 style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 900, marginBottom: 16 }}>
                💝 Waiting for {partnerName || 'your partner'}...
              </h2>
              
              <p style={{ color: PALETTE.champagne, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                Your love letter and activities have been submitted! ✨
              </p>

              {/* Show your submitted data */}
              <div style={{
                background: "rgba(224,71,107,0.1)",
                borderRadius: 16, padding: 20, marginBottom: 20,
                border: "1px solid rgba(224,71,107,0.3)",
                textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>👤</span>
                  <span style={{ color: PALETTE.blush, fontWeight: 700, fontSize: 16 }}>{myName || 'You'}</span>
                  <span style={{ color: "rgba(46,204,113,0.8)", fontSize: 12 }}>✓ Submitted</span>
                </div>
                
                {bothResponses?.player1?.letter || bothResponses?.player2?.letter ? (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: PALETTE.gold, fontSize: 12 }}>💌 Love Letter:</span>
                    <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                      {(bothResponses?.player1?.letter || bothResponses?.player2?.letter || "").substring(0, 100)}...
                    </p>
                  </div>
                ) : null}
              </div>

              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontStyle: "italic" }}>
                When {partnerName || 'your partner'} completes their activities, you'll see each other's messages! 💕
              </p>

              <button
                onClick={handleContinue}
                style={{
                  marginTop: 24, padding: "14px 32px", fontSize: 16, fontWeight: 700,
                  background: `linear-gradient(135deg,${PALETTE.blush},${PALETTE.rose})`,
                  border: "none", borderRadius: 30, color: "white", cursor: "pointer",
                  boxShadow: `0 4px 20px ${PALETTE.rose}40`,
                }}
              >
                Back to Room
              </button>
            </div>
          </GCard>
        </div>
      </div>
    );
  }

  // Show both responses summary
  if (submitted && reflection && bothResponses) {
    return (
      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 20% 20%,#1a0515 0%,${PALETTE.black} 50%,#0a0015 100%)`,
        fontFamily: "Georgia,serif",
        cursor: "none",
        overflowX: "hidden",
      }}>
        <style>{globalStyles}</style>
        <CursorTrail />
        <ParticleUniverse />

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 80px" }}>
          <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 10, filter: `drop-shadow(0 0 20px ${PALETTE.rose})` }}>💕</div>
            <h1 style={{
              fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 28, letterSpacing: 3,
              background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush},${PALETTE.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Valentine's Day 2026
            </h1>
            <p style={{ color: "rgba(249,168,196,0.6)", fontSize: 14, marginTop: 6, fontStyle: "italic" }}>
              Your Journey Together ✨
            </p>
          </div>

          <GCard style={{ padding: 28 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 80, marginBottom: 20, animation: "floatBob 2s ease-in-out infinite" }}>💝</div>
              <h2 style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 900, marginBottom: 16 }}>
                💝 Happy Valentine's Day!
              </h2>
              
              {/* AI Reflection */}
              <div style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 20, padding: 24, marginBottom: 20,
                border: "1px solid rgba(212,175,55,0.3)",
              }}>
                <p style={{ color: PALETTE.champagne, fontSize: 16, lineHeight: 1.8, fontStyle: "italic" }}>
                  {reflection}
                </p>
              </div>
              
              {/* Your Response */}
              <div style={{
                background: "rgba(224,71,107,0.1)",
                borderRadius: 16, padding: 20, marginBottom: 16,
                border: "1px solid rgba(224,71,107,0.3)",
                textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>👤</span>
                  <span style={{ color: PALETTE.blush, fontWeight: 700, fontSize: 16 }}>{myName || 'You'}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Your journey</span>
                </div>
                
                {/* Love Letter */}
                {(bothResponses?.player1?.letter || bothResponses?.player2?.letter) && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: PALETTE.gold, fontSize: 12 }}>💌 Love Letter:</span>
                    <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                      {(bothResponses?.player1?.letter || bothResponses?.player2?.letter || "").substring(0, 150)}...
                    </p>
                  </div>
                )}
                
                {/* Lantern Wish */}
                {(bothResponses?.player1?.lantern || bothResponses?.player2?.lantern) && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: PALETTE.gold, fontSize: 12 }}>🏮 Wish Lantern:</span>
                    <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                      {bothResponses?.player1?.lantern || bothResponses?.player2?.lantern}
                    </p>
                  </div>
                )}
                
                {/* Promises */}
                {bothResponses?.player1?.promises && bothResponses.player1.promises.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: PALETTE.gold, fontSize: 12 }}>⭐ Promises:</span>
                    <ul style={{ color: PALETTE.champagne, fontSize: 13, marginTop: 6, paddingLeft: 16 }}>
                      {bothResponses.player1.promises?.slice(0, 3).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Capsule */}
                {(bothResponses?.player1?.capsule || bothResponses?.player2?.capsule) && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: PALETTE.gold, fontSize: 12 }}>📦 Time Capsule:</span>
                    <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                      {(bothResponses?.player1?.capsule || bothResponses?.player2?.capsule || "").substring(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
              
              {/* Partner's Response */}
              {partnerSubmitted && (
                <div style={{
                  background: "rgba(168,85,247,0.1)",
                  borderRadius: 16, padding: 20, marginBottom: 20,
                  border: "1px solid rgba(168,85,247,0.3)",
                  textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>💕</span>
                    <span style={{ color: "#c084fc", fontWeight: 700, fontSize: 16 }}>{partnerName || 'Partner'}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Their journey</span>
                  </div>
                  
                  {/* Love Letter */}
                  {(bothResponses?.player2?.letter || bothResponses?.player1?.letter) && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: PALETTE.gold, fontSize: 12 }}>💌 Love Letter:</span>
                      <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                        {(bothResponses?.player2?.letter || bothResponses?.player1?.letter || "").substring(0, 150)}...
                      </p>
                    </div>
                  )}
                  
                  {/* Lantern Wish */}
                  {(bothResponses?.player2?.lantern || bothResponses?.player1?.lantern) && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: PALETTE.gold, fontSize: 12 }}>🏮 Wish Lantern:</span>
                      <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                        {bothResponses?.player2?.lantern || bothResponses?.player1?.lantern}
                      </p>
                    </div>
                  )}
                  
                  {/* Promises */}
                  {bothResponses?.player2?.promises && bothResponses.player2.promises.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: PALETTE.gold, fontSize: 12 }}>⭐ Their promises:</span>
                      <ul style={{ color: PALETTE.champagne, fontSize: 13, marginTop: 6, paddingLeft: 16 }}>
                        {bothResponses.player2.promises?.slice(0, 3).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Capsule */}
                  {(bothResponses?.player2?.capsule || bothResponses?.player1?.capsule) && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ color: PALETTE.gold, fontSize: 12 }}>📦 Their Time Capsule:</span>
                      <p style={{ color: PALETTE.champagne, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginTop: 4 }}>
                        {(bothResponses?.player2?.capsule || bothResponses?.player1?.capsule || "").substring(0, 100)}...
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {!partnerSubmitted && (
                <div style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16, padding: 20, marginBottom: 20,
                  border: "1px dashed rgba(255,255,255,0.2)",
                  textAlign: "center",
                }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                    ⏳ Waiting for {partnerName || 'your partner'} to complete their journey...
                  </p>
                </div>
              )}
              
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20 }}>
                Thank you for sharing this journey together.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <SparkBtn onClick={handleDownload} color={PALETTE.gold}>
                  📥 Download Our Story 💕
                </SparkBtn>
                <SparkBtn onClick={handleContinue} color={PALETTE.rose}>
                  Continue to Room 🏠
                </SparkBtn>
              </div>
            </div>
          </GCard>
        </div>
      </div>
    );
  }

  // Show main experience
  if (!opened) return (
    <div style={{ minHeight: "100vh", background: PALETTE.black, cursor: "none" }}>
      <style>{globalStyles}</style>
      <CursorTrail />
      <CinematicOpening onDone={() => { setOpened(true); setRomanticSound(CINEMATIC_SOUND); }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 20% 20%,#1a0515 0%,${PALETTE.black} 50%,#0a0015 100%)`,
      fontFamily: "Georgia,serif",
      cursor: "none",
      overflowX: "hidden",
    }}>
      <style>{globalStyles}</style>

      <CursorTrail />
      <ParticleUniverse />
      <PetalRain active={petalRain} />
      <Fireworks active={fireworks} />
      {toastBadge && <AchievementToast badge={toastBadge} onDone={() => setToastBadge(null)} />}
      {romanticSound && <SoundPlayer autoPlay={true} defaultSoundId="romantic" />}
      {easterEgg && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9997, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", flexDirection: "column",
        }} onClick={() => setEasterEgg(false)}>
          <div style={{ fontSize: 80, marginBottom: 20, animation: "floatBob 2s ease-in-out infinite" }}>🔮</div>
          <h2 style={{ color: PALETTE.gold, fontFamily: "Georgia,serif", fontSize: 28, marginBottom: 12 }}>
            {secretHint || "Secret Discovered!"}
          </h2>
          <p style={{ color: PALETTE.champagne, fontSize: 16, fontStyle: "italic", marginBottom: 20, textAlign: "center", maxWidth: 300, lineHeight: 1.8 }}>
            "The greatest love stories are the ones that were never supposed to happen — yet did anyway."
          </p>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", lineHeight: 2 }}>
            <div>👆 Tap logo 7 times</div>
            <div>✋ Long press logo 3 seconds</div>
            <div>📱 Shake your phone</div>
            <div>⌨️ Konami: ↑↑↓↓←→←→BA</div>
          </div>
          {roomId && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/day/8/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert('Day 8 reset! Refresh the page to start fresh.');
                    setEasterEgg(false);
                  } else {
                    alert('Reset failed: ' + (data.error || 'Unknown error'));
                  }
                } catch (err) {
                  alert('Reset failed. Server may need redeploy.');
                }
              }}
              style={{
                marginTop: 20,
                padding: '12px 24px',
                background: PALETTE.rose,
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${PALETTE.rose}40`
              }}
            >
              🔄 Restart Day 8
            </button>
          )}
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 20 }}>Click anywhere to close</p>
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 14px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
          <div 
            ref={logoRef} 
            id="valentine-logo" 
            style={{ fontSize: 52, marginBottom: 10, animation: "floatBob 3s ease-in-out infinite",
              filter: `drop-shadow(0 0 20px ${PALETTE.rose})`, cursor: 'pointer' }}
            onClick={handleLogoClick}
            onMouseDown={handleLogoMouseDown}
            onMouseUp={handleLogoMouseUp}
            onTouchStart={handleLogoClick}
            onTouchEnd={handleLogoMouseUp}
          >💕</div>
          <h1 style={{
            fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 28, letterSpacing: 3,
            background: `linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush},${PALETTE.gold})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200%", animation: "shimmerText 3s linear infinite",
          }}>
            Valentine's Day 2026
          </h1>
          <p style={{ color: "rgba(249,168,196,0.6)", fontSize: 14, marginTop: 6, fontStyle: "italic" }}>
            A world built just for us ✨
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 50, padding: "6px 16px", marginTop: 10, fontSize: 12, color: PALETTE.gold,
          }}>
            🏆 {unlocked.length}/{ALL_BADGES.length} Achievements
          </div>
          {/* Partner indicator */}
          {roomId && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: isPartnerActive ? "rgba(224,71,107,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isPartnerActive ? PALETTE.rose : "rgba(255,255,255,0.1)"}`,
              borderRadius: 50, padding: "6px 16px", marginTop: 10, marginLeft: 10, fontSize: 12,
              color: isPartnerActive ? PALETTE.blush : "rgba(255,255,255,0.4)",
              transition: "all 0.3s",
            }}>
              <span style={{ animation: isPartnerActive ? "pulse 1s infinite" : "none" }}>💕</span>
              {partnerName ? partnerName : 'Partner'} {isPartnerActive ? 'is active now!' : 'is here'}
            </div>
          )}
        </div>

        {/* Submit section */}
        <GCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💝</div>
            <p style={{ color: PALETTE.champagne, fontSize: 15, marginBottom: 16 }}>
              Complete your journey together
            </p>
            <SparkBtn onClick={handleSubmit} color={PALETTE.crimson} disabled={loading}>
              {loading ? "Submitting..." : "Complete Our Journey 💕"}
            </SparkBtn>
          </div>
        </GCard>

        {/* Navigation */}
        <div style={{
          display: "flex", gap: 4, overflowX: "auto", paddingBottom: 8, marginBottom: 20,
          scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
        }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 12px", borderRadius: 16,
              background: section === s.id ? "rgba(224,71,107,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${section === s.id ? PALETTE.rose : "rgba(255,255,255,0.1)"}`,
              color: section === s.id ? "white" : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "all 0.2s", minWidth: 60,
              boxShadow: section === s.id ? `0 0 20px ${PALETTE.rose}33` : "none",
              transform: section === s.id ? "scale(1.05)" : "scale(1)",
            }}>
              <span style={{ fontSize: 22 }}>{s.label}</span>
              <span style={{ fontSize: 10, marginTop: 3, fontFamily: "sans-serif" }}>{s.name}</span>
              {unlocked.includes(s.id) && <span style={{ fontSize: 8, color: PALETTE.gold }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Main section card */}
        <GCard style={{ padding: 28 }}>
          {renderSection()}
        </GCard>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.2)", fontSize: 12, fontStyle: "italic" }}>
          Move your cursor · Explore all features 💕
        </div>
      </div>

      {/* Fixed bottom nav hint */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(5,2,8,0.8)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "8px 16px", textAlign: "center",
        color: "rgba(249,168,196,0.4)", fontSize: 11, fontStyle: "italic",
      }}>
        Built with infinite love · Valentine's Day 2026 💕
      </div>
    </div>
  );
}

// Global styles constant
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(224,71,107,0.4); border-radius: 2px; }
  input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); font-style: italic; }
  @keyframes fadeInUp { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes floatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes shimmerText { 0% { background-position: 0%; } 100% { background-position: 200%; } }
  @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
  @keyframes cookieWiggle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes cookieBreak { 0% { transform: scaleX(1); } 50% { transform: scaleX(0.2); } 100% { transform: scaleX(0); opacity: 0; } }
  @keyframes sparkOut { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(0); opacity: 0; } }
  @keyframes roseBlossom { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes ekg { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
  @keyframes lanternRise { 0% { bottom: 0; opacity: 1; transform: rotate(0); } 50% { transform: rotate(-5deg); } 100% { bottom: 110%; opacity: 0; transform: rotate(5deg); } }
  @keyframes starPop { 0% { transform: translate(-50%, -50%) scale(0); } 100% { transform: translate(-50%, -50%) scale(1); } }
  @keyframes sealReveal { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes lineGlow { 0% { opacity: 0; } 100% { opacity: 0.7; } }
  @keyframes shootingStar { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
  @keyframes plantGrow { 0% { transform: scale(0) translateY(10px); } 100% { transform: scale(1) translateY(0); } }
  @keyframes toastSlide { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
  @keyframes petalFall { 0% { top: -5%; transform: translateX(0) rotate(0deg); opacity: 1; } 100% { top: 105%; transform: translateX(var(--drift)) rotate(720deg); opacity: 0; } }
  @keyframes fireworkBurst { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
  @keyframes fireworkParticle { 0% { transform: rotate(var(--fa)) translateY(0); opacity: 1; } 100% { transform: rotate(var(--fa)) translateY(-80px); opacity: 0; } }
  @keyframes crackOpen { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
`;
