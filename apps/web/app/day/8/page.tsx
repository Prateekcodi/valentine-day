'use client';
import { useState, useEffect, useRef, useCallback, ReactNode } from "react";

// Type definitions
interface Heart { id: number; x: number; y: number; emoji: string; size: number; }
interface Spark { id: number; angle: number; }
interface GameHeart { id: number; x: number; speed: number; emoji: string; top: number; }
interface Card { id: number; pairId: number; val: string; type: string; }
interface BalloonPos { x: number; dur: number; delay: number; sway: number; size: number; }

// ─── HEART CURSOR TRAIL ──────────────────────────────────────────────────────
function HeartCursorTrail() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      const id = ++idRef.current;
      const emojis = ["💕", "💗", "💖", "✨", "🌸", "💞", "❤️"];
      setHearts((h) => [
        ...h.slice(-18),
        {
          id,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          size: Math.random() * 14 + 10,
        },
      ]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 900);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 9999 }}>
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            left: h.x,
            top: h.y,
            fontSize: h.size,
            transform: "translate(-50%,-50%)",
            animation: "heartFloat 0.9s ease-out forwards",
            userSelect: "none",
          }}
        >
          {h.emoji}
        </div>
      ))}
      <style>{`
        @keyframes heartFloat {
          0%   { opacity:1; transform:translate(-50%,-50%) scale(1) }
          100% { opacity:0; transform:translate(-50%,-130%) scale(0.4) }
        }
      `}</style>
    </div>
  );
}

// ─── FLOATING BALLOONS ───────────────────────────────────────────────────────
const BALLOON_COLORS = [
  ["#ff6b9d","#ff8fb1"],["#ff9a3c","#ffb86c"],["#a855f7","#c084fc"],
  ["#22d3ee","#67e8f9"],["#4ade80","#86efac"],["#f43f5e","#fb7185"],
  ["#facc15","#fde68a"],
];

function Balloon({ id, onPop }: { id: number; onPop: (id: number) => void }) {
  const [popped, setPopped] = useState(false);
  const [pos] = useState(() => ({
    x: Math.random() * 90 + 5,
    dur: Math.random() * 8 + 10,
    delay: Math.random() * 5,
    sway: Math.random() * 40 + 20,
    size: Math.random() * 30 + 50,
  }));
  const [col] = useState(() => BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]);

  const handlePop = () => {
    if (popped) return;
    setPopped(true);
    setTimeout(() => onPop(id), 400);
  };

  return (
    <div
      onClick={handlePop}
      style={{
        position: "fixed",
        left: `${pos.x}vw`,
        bottom: popped ? "110vh" : "-20vh",
        width: pos.size,
        height: pos.size * 1.2,
        cursor: "pointer",
        zIndex: 50,
        animation: popped
          ? `balloonPop 0.4s forwards`
          : `balloonFloat ${pos.dur}s ${pos.delay}s linear forwards, balloonSway ${pos.sway * 0.1}s ease-in-out infinite alternate`,
        userSelect: "none",
      }}
    >
      <svg viewBox="0 0 100 130" width="100%" height="100%">
        <defs>
          <radialGradient id={`bg${id}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor={col[0]} />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="45" ry="50" fill={`url(#bg${id})`} stroke={col[1]} strokeWidth="1.5" />
        <ellipse cx="35" cy="30" rx="12" ry="8" fill="white" opacity="0.3" />
        <line x1="50" y1="100" x2="50" y2="125" stroke={col[1]} strokeWidth="1.5" />
        <path d="M45 100 Q50 105 55 100" fill="none" stroke={col[1]} strokeWidth="1.5" />
      </svg>
      {popped && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, animation:"popStar 0.4s forwards" }}>
          💥
        </div>
      )}
      <style>{`
        @keyframes balloonFloat { 0%{bottom:-20vh;opacity:0} 5%{opacity:1} 100%{bottom:110vh;opacity:0.8} }
        @keyframes balloonSway { 0%{margin-left:0px} 100%{margin-left:30px} }
        @keyframes balloonPop  { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(0);opacity:0} }
        @keyframes popStar     { 0%{transform:scale(0)} 50%{transform:scale(1.5)} 100%{transform:scale(0);opacity:0} }
      `}</style>
    </div>
  );
}

function BalloonField() {
  const [balloons, setBalloons] = useState<number[]>(() =>
    Array.from({ length: 8 }, (_, i) => i)
  );

  useEffect(() => {
    const t = setInterval(() => {
      setBalloons((b) => [...b, b.length > 0 ? Math.max(...b) + 1 : 0]);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {balloons.map((id) => (
        <Balloon key={id} id={id} onPop={(id) => setBalloons((b) => b.filter((x) => x !== id))} />
      ))}
    </>
  );
}

// ─── CONFETTI BURST ──────────────────────────────────────────────────────────
function ConfettiBurst({ active, origin = { x: 50, y: 50 } }: { active?: boolean; origin?: { x: number; y: number } }) {
  const pieces = Array.from({ length: 40 });
  const colors = ["#ff6b9d","#ffd700","#a855f7","#22d3ee","#4ade80","#f43f5e"];
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1000 }}>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const dist = Math.random() * 200 + 100;
        const col = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 6;
        return (
          <div
            key={i}
            style={{
              position:"absolute",
              left:`${origin.x}%`,
              top:`${origin.y}%`,
              width:size,
              height:size * (Math.random() > 0.5 ? 2 : 1),
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background:col,
              animation:`confettiPiece 1.2s ${Math.random() * 0.3}s ease-out forwards`,
              ["--dx"]: `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              ["--dy"]: `${Math.sin((angle * Math.PI) / 180) * dist}px`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiPiece {
          0%   { transform:translate(0,0) rotate(0deg); opacity:1 }
          100% { transform:translate(var(--dx),var(--dy)) rotate(720deg); opacity:0 }
        }
      `}</style>
    </div>
  );
}

// ─── SPARKLE BUTTON ──────────────────────────────────────────────────────────
function SparkleButton({ children, onClick, color = "#ff6b9d", disabled = false }: { children: ReactNode; onClick?: () => void; color?: string; disabled?: boolean }) {
  const [sparks, setSparks] = useState([]);
  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const items = Array.from({ length: 8 }, (_, i) => ({ id: id + i, angle: (i / 8) * 360 }));
    setSparks((s) => [...s, ...items]);
    setTimeout(() => setSparks((s) => s.filter((x) => !items.map((i) => i.id).includes(x.id))), 700);
    onClick?.();
  };
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        position:"relative",
        background: disabled ? "rgba(255,255,255,0.2)" : `linear-gradient(135deg, ${color}, ${color}cc)`,
        border:"2px solid rgba(255,255,255,0.5)",
        borderRadius:50,
        padding:"14px 32px",
        fontSize:16,
        fontWeight:700,
        color:"white",
        cursor: disabled ? "not-allowed" : "pointer",
        backdropFilter:"blur(10px)",
        transition:"all 0.2s",
        letterSpacing:"0.5px",
        boxShadow:`0 8px 30px ${color}55`,
        opacity: disabled ? 0.5 : 1,
        overflow:"visible",
      }}
    >
      {children}
      {sparks.map((s) => (
        <div
          key={s.id}
          style={{
            position:"absolute",
            top:"50%", left:"50%",
            width:8, height:8,
            borderRadius:"50%",
            background:color,
            animation:`sparkle 0.7s ease-out forwards`,
            ["--sa"]: `${Math.cos((s.angle * Math.PI) / 180) * 50}px`,
            ["--sb"]: `${Math.sin((s.angle * Math.PI) / 180) * 50}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle {
          0%   { transform:translate(-50%,-50%) scale(1); opacity:1 }
          100% { transform:translate(calc(-50% + var(--sa)), calc(-50% + var(--sb))) scale(0); opacity:0 }
        }
      `}</style>
    </button>
  );
}

// ─── HEART CATCH MINI GAME ────────────────────────────────────────────────────
function HeartCatchGame({ onScore }: { onScore?: (score: number) => void }) {
  const [hearts, setHearts] = useState<GameHeart[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [running, setRunning] = useState(false);
  const idRef = useRef(0);
  const gameAreaRef = useRef(null);

  const start = () => {
    setScore(0); setTimeLeft(20); setHearts([]); setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const spawnT = setInterval(() => {
      const id = ++idRef.current;
      setHearts((h) => [...h, {
        id,
        x: Math.random() * 85 + 5,
        speed: Math.random() * 3 + 2,
        emoji: Math.random() > 0.3 ? "💖" : Math.random() > 0.5 ? "💀" : "💔",
        top: -10,
      }]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 4000);
    }, 700);
    const timeT = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setRunning(false); clearInterval(timeT); clearInterval(spawnT); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawnT); clearInterval(timeT); };
  }, [running]);

  const catchHeart = (id, emoji) => {
    setHearts((h) => h.filter((x) => x.id !== id));
    if (emoji === "💖") { setScore((s) => { const ns = s + 1; if (ns % 5 === 0) onScore?.(ns); return ns; }); }
    else if (emoji === "💀") setScore((s) => Math.max(0, s - 2));
  };

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:18, fontWeight:700, color:"white" }}>
        <span>❤️ Score: {score}</span>
        <span>⏱ {timeLeft}s</span>
      </div>
      {!running && timeLeft === 0 && (
        <div style={{ marginBottom:10, color:"#ffd700", fontSize:24, fontWeight:800 }}>
          🎉 Final Score: {score}!
        </div>
      )}
      <div
        ref={gameAreaRef}
        style={{
          position:"relative",
          width:"100%",
          height:220,
          background:"rgba(255,255,255,0.1)",
          borderRadius:16,
          overflow:"hidden",
          border:"2px solid rgba(255,255,255,0.3)",
          marginBottom:12,
        }}
      >
        {hearts.map((h) => (
          <div
            key={h.id}
            onClick={() => catchHeart(h.id, h.emoji)}
            style={{
              position:"absolute",
              left:`${h.x}%`,
              fontSize:28,
              cursor:"pointer",
              animation:`dropDown ${h.speed}s linear forwards`,
              userSelect:"none",
            }}
          >
            {h.emoji}
          </div>
        ))}
        {!running && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <SparkleButton onClick={start} color="#e11d48">
              {timeLeft === 20 ? "🎮 Play Game" : "🔄 Play Again"}
            </SparkleButton>
          </div>
        )}
        <style>{`@keyframes dropDown { 0%{top:-5%} 100%{top:105%} }`}</style>
      </div>
      <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>
        Catch 💖 (+1) · Avoid 💀 (-2) · 💔 = 0
      </p>
    </div>
  );
}

// ─── LOVE PUZZLE MINI GAME ─────────────────────────────────────────────────
const PUZZLE_PAIRS = [
  ["🌹","Rose"],["💌","Letter"],["🍫","Chocolate"],["🧸","Teddy"],
  ["💍","Ring"],["🌟","Star"],["💕","Love"],["🎵","Music"],
];

function MatchingGame() {
  const [pairs] = useState(() => PUZZLE_PAIRS.slice(0, 6));
  const [cards] = useState<Card[]>(() => {
    const all = pairs.flatMap((p, i) => [
      { id: i * 2, pairId: i, val: p[0], type: "emoji" },
      { id: i * 2 + 1, pairId: i, val: p[1], type: "word" },
    ]);
    return all.sort(() => Math.random() - 0.5);
  });
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const flip = (card) => {
    if (matched.includes(card.pairId)) return;
    if (flipped.length === 1 && flipped[0].id === card.id) return;
    if (flipped.length === 2) return;
    const nf = [...flipped, card];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      if (nf[0].pairId === nf[1].pairId) {
        const nm = [...matched, nf[0].pairId];
        setMatched(nm);
        setFlipped([]);
        if (nm.length === pairs.length) setTimeout(() => setWon(true), 400);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const isFlipped = (card) => flipped.some((f) => f.id === card.id) || matched.includes(card.pairId);

  return (
    <div style={{ textAlign:"center" }}>
      <p style={{ color:"rgba(255,255,255,0.8)", marginBottom:10, fontSize:14 }}>
        Moves: {moves} · Matched: {matched.length}/{pairs.length}
      </p>
      {won && <div style={{ fontSize:28, marginBottom:10, animation:"pulse 0.5s ease infinite alternate" }}>🎉 You Won! 🎉</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => flip(card)}
            style={{
              height:70,
              borderRadius:12,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: card.type === "emoji" ? 28 : 13,
              fontWeight:700,
              cursor: matched.includes(card.pairId) ? "default" : "pointer",
              background: matched.includes(card.pairId)
                ? "rgba(74,222,128,0.4)"
                : isFlipped(card)
                ? "rgba(255,107,157,0.5)"
                : "rgba(255,255,255,0.15)",
              border: `2px solid ${matched.includes(card.pairId) ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.3)"}`,
              backdropFilter:"blur(10px)",
              color:"white",
              transition:"all 0.2s",
              transform: isFlipped(card) ? "scale(1.05)" : "scale(1)",
              userSelect:"none",
            }}
          >
            {isFlipped(card) ? card.val : "💝"}
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%{transform:scale(1)} 100%{transform:scale(1.05)} }`}</style>
    </div>
  );
}

// ─── LOVE QUIZ GAME ──────────────────────────────────────────────────────────
const QUIZ = [
  { q:"What is the symbol of love?", opts:["💀","💖","🌵","🎃"], ans:1 },
  { q:"Valentine's Day is on which date?", opts:["Feb 10","Feb 14","Feb 20","Mar 1"], ans:1 },
  { q:"Which flower means love?", opts:["🌻 Sunflower","🌷 Tulip","🌹 Rose","🌸 Cherry"], ans:2 },
  { q:"What do couples exchange?", opts:["Handshakes","Gifts & cards","Business cards","None"], ans:1 },
];

function LoveQuiz() {
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);

  const pick = (i) => {
    if (sel !== null) return;
    setSel(i);
    if (i === QUIZ[q].ans) setScore((s) => s + 1);
    setTimeout(() => {
      if (q + 1 >= QUIZ.length) setDone(true);
      else { setQ((q) => q + 1); setSel(null); }
    }, 900);
  };

  const reset = () => { setQ(0); setScore(0); setSel(null); setDone(false); };

  if (done) return (
    <div style={{ textAlign:"center", padding:20 }}>
      <div style={{ fontSize:60, marginBottom:10 }}>{score >= 3 ? "🏆" : "💪"}</div>
      <p style={{ color:"white", fontSize:22, fontWeight:800 }}>{score}/{QUIZ.length} Correct!</p>
      <p style={{ color:"rgba(255,255,255,0.7)", marginBottom:16 }}>
        {score === 4 ? "You're a love expert! 💕" : score >= 2 ? "Great job! 🌸" : "Keep trying! 💖"}
      </p>
      <SparkleButton onClick={reset} color="#a855f7">Try Again 🔄</SparkleButton>
    </div>
  );

  const curr = QUIZ[q];
  return (
    <div>
      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:8 }}>Q{q+1}/{QUIZ.length}</p>
      <p style={{ color:"white", fontWeight:700, fontSize:16, marginBottom:14 }}>{curr.q}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {curr.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            style={{
              padding:"10px 6px",
              borderRadius:12,
              border:`2px solid ${sel === null ? "rgba(255,255,255,0.3)" : i === curr.ans ? "rgba(74,222,128,0.8)" : sel === i ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.2)"}`,
              background: sel === null ? "rgba(255,255,255,0.1)" : i === curr.ans ? "rgba(74,222,128,0.2)" : sel === i ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
              color:"white", cursor:"pointer", fontSize:14, fontWeight:600,
              transition:"all 0.2s",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:10 }}>Score: {score}</p>
    </div>
  );
}

// ─── WORD SCRAMBLE GAME ───────────────────────────────────────────────────────
const LOVE_WORDS = ["ROMANCE","PASSION","CHERISH","DARLING","BELOVED","SWEETHEART"];

function WordScramble() {
  const [word] = useState(() => LOVE_WORDS[Math.floor(Math.random() * LOVE_WORDS.length)]);
  const [scrambled] = useState(() => word.split("").sort(() => Math.random() - 0.5).join(""));
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  const check = () => {
    setTries((t) => t + 1);
    if (guess.toUpperCase() === word) setStatus("win");
    else setStatus("fail");
    setTimeout(() => setStatus(null), 800);
  };

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ letterSpacing:8, fontSize:28, fontWeight:800, color:"#ffd700", marginBottom:16 }}>
        {scrambled}
      </div>
      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:12 }}>Unscramble the love word!</p>
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="Type your answer..."
        maxLength={word.length}
        style={{
          background:"rgba(255,255,255,0.15)",
          border:`2px solid ${status === "win" ? "rgba(74,222,128,0.8)" : status === "fail" ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.3)"}`,
          borderRadius:50,
          padding:"10px 20px",
          color:"white",
          fontSize:16,
          fontWeight:700,
          letterSpacing:4,
          textAlign:"center",
          outline:"none",
          width:"80%",
          marginBottom:12,
          backdropFilter:"blur(10px)",
        }}
      />
      <br/>
      <SparkleButton onClick={check} color="#f59e0b" disabled={!guess}>Check ✨</SparkleButton>
      {status === "win" && <p style={{ color:"#4ade80", marginTop:10, fontWeight:700 }}>🎉 Correct! Amazing!</p>}
      {status === "fail" && <p style={{ color:"#f87171", marginTop:10 }}>💔 Try again! ({tries} tries)</p>}
      {tries > 3 && status !== "win" && <p style={{ color:"rgba(255,255,255,0.4)", marginTop:6, fontSize:12 }}>Hint: {word[0]}...{word[word.length-1]}</p>}
    </div>
  );
}

// ─── CHAT COMPONENT ───────────────────────────────────────────────────────────
const BOT_REPLIES = [
  "You make my heart flutter 💕",
  "Every moment with you is magical ✨",
  "You're my favorite person in the world 🌸",
  "I fall for you more every single day 💖",
  "You complete me in every way 🥰",
  "You're the reason I smile 😊",
  "Forever and always, I choose you 💍",
];

function Chat() {
  const [messages, setMessages] = useState<{id: number; from: string; text: string; time: string}[]>([
    { id: 1, from:"partner", text:"Happy Valentine's Day! 💕", time:"just now" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const msg = { id: Date.now(), from:"me", text:input, time:"just now" };
    setMessages((m) => [...m, msg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: Date.now() + 1,
        from:"partner",
        text: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
        time:"just now",
      }]);
    }, 1500);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:320 }}>
      <div style={{ flex:1, overflowY:"auto", padding:"0 4px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display:"flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            {m.from === "partner" && (
              <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,107,157,0.5)", display:"flex", alignItems:"center", justifyContent:"center", marginRight:8, fontSize:16, flexShrink:0 }}>💕</div>
            )}
            <div style={{
              maxWidth:"70%",
              padding:"10px 16px",
              borderRadius: m.from === "me" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              background: m.from === "me" ? "rgba(255,107,157,0.5)" : "rgba(255,255,255,0.2)",
              backdropFilter:"blur(10px)",
              border:"1px solid rgba(255,255,255,0.3)",
              color:"white",
              fontSize:14,
              lineHeight:1.5,
            }}>
              {m.text}
            </div>
            {m.from === "me" && (
              <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(168,85,247,0.5)", display:"flex", alignItems:"center", justifyContent:"center", marginLeft:8, fontSize:16, flexShrink:0 }}>😊</div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,107,157,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💕</div>
            <div style={{ padding:"10px 16px", borderRadius:"20px 20px 20px 4px", background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.3)", display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"white", animation:`typingDot 1s ${i*0.15}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say something sweet... 💌"
          style={{
            flex:1,
            background:"rgba(255,255,255,0.15)",
            border:"1.5px solid rgba(255,255,255,0.3)",
            borderRadius:50,
            padding:"10px 18px",
            color:"white",
            fontSize:14,
            outline:"none",
            backdropFilter:"blur(10px)",
          }}
        />
        <button
          onClick={send}
          style={{
            width:44, height:44,
            borderRadius:"50%",
            background:"rgba(255,107,157,0.6)",
            border:"1.5px solid rgba(255,255,255,0.4)",
            color:"white",
            fontSize:18,
            cursor:"pointer",
            backdropFilter:"blur(10px)",
            flexShrink:0,
          }}
        >
          💌
        </button>
      </div>
      <style>{`
        @keyframes typingDot {
          0%,100% { transform:translateY(0); opacity:0.5 }
          50%      { transform:translateY(-5px); opacity:1 }
        }
      `}</style>
    </div>
  );
}

// ─── LOVE METER ───────────────────────────────────────────────────────────────
function LoveMeter() {
  const [value, setValue] = useState(0);
  const [pumping, setPumping] = useState(false);
  const [message, setMessage] = useState("");

  const msgs = ["💔 Try harder...", "💛 Getting warmer!", "🧡 Almost there!", "❤️ So in love!", "💖 SOULMATES! 💖"];
  const cols = ["#ef4444","#f97316","#f59e0b","#ec4899","#a855f7"];

  const pump = () => {
    setPumping(true);
    setValue((v) => {
      const nv = Math.min(100, v + Math.random() * 20 + 5);
      setMessage(msgs[Math.floor(nv / 21)]);
      return nv;
    });
    setTimeout(() => setPumping(false), 300);
  };

  const pct = Math.round(value);
  const col = cols[Math.floor(pct / 21)];

  return (
    <div style={{ textAlign:"center" }}>
      <div style={{
        fontSize:80,
        animation: pumping ? "heartbeat 0.3s ease" : pct > 80 ? "heartbeat 1s ease infinite" : "none",
        marginBottom:10,
        filter: `drop-shadow(0 0 ${pct/5}px ${col})`,
      }}>
        {pct >= 100 ? "💞" : pct > 60 ? "💖" : pct > 30 ? "💛" : "🤍"}
      </div>
      <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:50, height:20, marginBottom:12, overflow:"hidden", border:"2px solid rgba(255,255,255,0.3)" }}>
        <div style={{
          height:"100%",
          width:`${pct}%`,
          background:`linear-gradient(90deg, #f43f5e, ${col})`,
          borderRadius:50,
          transition:"width 0.4s ease",
          position:"relative",
          overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation:"shimmer 1.5s infinite" }} />
        </div>
      </div>
      <p style={{ fontSize:22, fontWeight:800, color:col, marginBottom:14 }}>{pct}% 💕</p>
      {message && <p style={{ color:"rgba(255,255,255,0.85)", marginBottom:14, fontSize:16, fontWeight:600 }}>{message}</p>}
      <SparkleButton onClick={pump} color={col} disabled={pct >= 100}>
        {pct >= 100 ? "💞 Perfect Match!" : "❤️ Measure Love"}
      </SparkleButton>
      <style>{`
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  );
}

// ─── DAY ACTIVITY COMPONENT ───────────────────────────────────────────────────
function DayActivity({ day, onComplete }: { day: {id: number; name: string; emoji: string; color: string}; onComplete?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState("");
  const [choice, setChoice] = useState(null);

  const activities = {
    8: { type:"both", prompt:"On Valentine's Day, what do you love most about your partner?", placeholder:"The thing I love most is...", btn:"Celebrate Love 💕", color:"#9d174d" },
  };

    const act = { type: "text", prompt: "On Valentine's Day, what do you love most about your partner?", placeholder: "The thing I love most is...", btn: "Celebrate Love 💕", color: "#9d174d" };

  const handleSubmit = () => {
    if ((act.type === "text" || act.type === "both") && !text.trim()) return;
    if (act.type === "choice" && choice === null) return;
    setSubmitted(true);
    onComplete?.();
  };

  if (submitted) {
    return (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:60, marginBottom:16, animation:"bounce 0.6s ease" }}>🎉</div>
        <h3 style={{ color:"white", fontSize:20, fontWeight:800, marginBottom:8 }}>Submitted!</h3>
        <p style={{ color:"rgba(255,255,255,0.6)", marginBottom:20 }}>Waiting for your partner... 💕</p>
        <div style={{
          background:"rgba(255,255,255,0.1)",
          borderRadius:16,
          padding:20,
          border:"1px solid rgba(255,255,255,0.2)",
        }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:8 }}>YOUR RESPONSE</p>
          <p style={{ color:"white", fontStyle:"italic", fontSize:16 }}>
            {act.type === "choice" ? act.opts?.[choice] || text : text}
          </p>
        </div>
        <style>{`
          @keyframes bounce { 0%{transform:scale(0.5)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color:"rgba(255,255,255,0.8)", fontSize:15, marginBottom:18, lineHeight:1.6 }}>{act.prompt}</p>

      {(act.type === "text" || act.type === "both") && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={act.placeholder}
          maxLength={200}
          rows={3}
          style={{
            width:"100%",
            background:"rgba(255,255,255,0.1)",
            border:"1.5px solid rgba(255,255,255,0.25)",
            borderRadius:16,
            padding:14,
            color:"white",
            fontSize:15,
            resize:"none",
            outline:"none",
            backdropFilter:"blur(10px)",
            marginBottom:16,
            fontFamily:"inherit",
            lineHeight:1.6,
          }}
        />
      )}

      <SparkleButton
        onClick={handleSubmit}
        color={act.color}
        disabled={act.type === "text" ? !text.trim() : false}
      >
        {act.btn}
      </SparkleButton>
    </div>
  );
}

// ─── DAY DATA ────────────────────────────────────────────────────────────────
const DAYS = [
  { id:1, name:"Rose Day", emoji:"🌹", color:"#e11d48" },
  { id:2, name:"Propose Day", emoji:"💌", color:"#db2777" },
  { id:3, name:"Chocolate Day", emoji:"🍫", color:"#92400e" },
  { id:4, name:"Teddy Day", emoji:"🧸", color:"#b45309" },
  { id:5, name:"Promise Day", emoji:"💎", color:"#7c3aed" },
  { id:6, name:"Kiss Day", emoji:"💋", color:"#be123c" },
  { id:7, name:"Hug Day", emoji:"🤗", color:"#c2410c" },
  { id:8, name:"Valentine's Day", emoji:"💕", color:"#9d174d" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ValentineExperience() {
  const [activeDay, setActiveDay] = useState(8);
  const [activeTab, setActiveTab] = useState("activities");
  const [confetti, setConfetti] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const currentDay = 8;

  const day = DAYS[activeDay - 1];

  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1500);
  };

  const tabs = [
    { id:"activities", label:"💝 Activity", icon:"💝" },
    { id:"game1", label:"🎮 Catch!", icon:"🎮" },
    { id:"game2", label:"🃏 Match", icon:"🃏" },
    { id:"game3", label:"❓ Quiz", icon:"❓" },
    { id:"game4", label:"🔤 Word", icon:"🔤" },
    { id:"meter", label:"💖 Meter", icon:"💖" },
    { id:"chat", label:"💬 Chat", icon:"💬" },
  ];

  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(135deg, #1a0a2e 0%, #16032a 40%, #300820 100%)`,
      fontFamily:"'Segoe UI', sans-serif",
      cursor:"none",
      overflowX:"hidden",
    }}>
      {/* Global styles */}
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.05) }
        ::-webkit-scrollbar-thumb { background:rgba(255,107,157,0.5); border-radius:2px }
        input::placeholder { color:rgba(255,255,255,0.4) }
        textarea::placeholder { color:rgba(255,255,255,0.4) }
      `}</style>

      {/* Animated background stars */}
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            position:"absolute",
            left:`${Math.random() * 100}%`,
            top:`${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            borderRadius:"50%",
            background:"white",
            animation:`twinkle ${Math.random() * 3 + 2}s ${Math.random() * 3}s ease-in-out infinite`,
          }} />
        ))}
        <style>{`@keyframes twinkle { 0%,100%{opacity:0.1} 50%{opacity:1} }`}</style>
      </div>

      {/* Cursor */}
      <HeartCursorTrail />

      {/* Balloons */}
      <BalloonField />

      {/* Confetti */}
      <ConfettiBurst active={confetti} />

      {/* Welcome screen */}
      {showWelcome && (
        <div style={{
          position:"fixed", inset:0, zIndex:500,
          background:"rgba(0,0,0,0.85)",
          backdropFilter:"blur(20px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexDirection:"column",
        }}>
          <div style={{ animation:"welcomePop 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards", textAlign:"center" }}>
            <div style={{ fontSize:80, marginBottom:20, animation:"heartbeat 1s ease infinite" }}>💕</div>
            <h1 style={{ color:"white", fontSize:36, fontWeight:900, marginBottom:8, letterSpacing:2 }}>
              Valentine's Day 2026
            </h1>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:18, marginBottom:30 }}>
              The most romantic day of the year ✨
            </p>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:24 }}>
              🎈 Pop the balloons · 💖 Move your cursor · 🎮 Play games
            </p>
            <SparkleButton onClick={() => { setShowWelcome(false); triggerConfetti(); }} color="#e11d48">
              Celebrate Love 💕
            </SparkleButton>
          </div>
          <style>{`
            @keyframes welcomePop { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }
            @keyframes heartbeat  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
          `}</style>
        </div>
      )}

      {/* Main content */}
      <div style={{ position:"relative", zIndex:10, maxWidth:700, margin:"0 auto", padding:"20px 16px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <h1 style={{ color:"white", fontSize:28, fontWeight:900, letterSpacing:2 }}>
            💕 Valentine's Day 2026
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginTop:4 }}>
            The grand finale · Click balloons to pop them 🎈
          </p>
        </div>

        {/* Day Selector */}
        <div style={{
          display:"flex", gap:6, overflowX:"auto", paddingBottom:8,
          marginBottom:20, scrollbarWidth:"none",
        }}>
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => { setActiveDay(d.id); setActiveTab("activities"); }}
              style={{
                flexShrink:0,
                width:64,
                padding:"10px 4px",
                borderRadius:16,
                background: activeDay === d.id
                  ? `rgba(255,107,157,0.3)`
                  : d.id <= currentDay ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                border: activeDay === d.id
                  ? `2px solid ${d.color}`
                  : "2px solid rgba(255,255,255,0.15)",
                color: d.id <= currentDay ? "white" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                backdropFilter:"blur(10px)",
                transition:"all 0.2s",
                textAlign:"center",
                transform: activeDay === d.id ? "scale(1.08)" : "scale(1)",
                boxShadow: activeDay === d.id ? `0 0 20px ${d.color}55` : "none",
              }}
            >
              <div style={{ fontSize:22 }}>{d.emoji}</div>
              <div style={{ fontSize:9, marginTop:4, fontWeight:700, opacity:0.8 }}>Day {d.id}</div>
              <div style={{ fontSize:9, opacity:0.6 }}>{d.name.split(" ")[0]}</div>
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div style={{
          background:"rgba(255,255,255,0.08)",
          backdropFilter:"blur(30px)",
          borderRadius:28,
          border:`1px solid rgba(255,255,255,0.15)`,
          overflow:"hidden",
          boxShadow:`0 20px 80px rgba(0,0,0,0.4), 0 0 40px ${day.color}22`,
        }}>
          {/* Card header */}
          <div style={{
            padding:"24px 24px 18px",
            background:`linear-gradient(135deg, ${day.color}33, transparent)`,
            borderBottom:"1px solid rgba(255,255,255,0.1)",
            textAlign:"center",
          }}>
            <div style={{ fontSize:52, marginBottom:6, animation:"dayEmoji 2s ease-in-out infinite" }}>
              {day.emoji}
            </div>
            <h2 style={{ color:"white", fontSize:22, fontWeight:800 }}>Day {day.id} — {day.name}</h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginTop:4 }}>
              Celebrate your love journey together 💕
            </p>
            <style>{`@keyframes dayEmoji { 0%,100%{transform:rotate(-5deg) scale(1)} 50%{transform:rotate(5deg) scale(1.1)} }`}</style>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid rgba(255,255,255,0.1)", scrollbarWidth:"none" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flexShrink:0,
                  padding:"12px 16px",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
                  border:"none",
                  borderBottom: activeTab === tab.id ? `2px solid ${day.color}` : "2px solid transparent",
                  color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.5)",
                  cursor:"pointer",
                  fontSize:13,
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  whiteSpace:"nowrap",
                  transition:"all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding:24 }}>
            {activeTab === "activities" && (
              <div>
                <DayActivity day={day} onComplete={triggerConfetti} />
              </div>
            )}
            {activeTab === "game1" && <HeartCatchGame onScore={triggerConfetti} />}
            {activeTab === "game2" && <MatchingGame />}
            {activeTab === "game3" && <LoveQuiz />}
            {activeTab === "game4" && <WordScramble />}
            {activeTab === "meter" && <LoveMeter />}
            {activeTab === "chat" && <Chat />}
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{ textAlign:"center", marginTop:20, color:"rgba(255,255,255,0.3)", fontSize:13 }}>
          🎈 Pop the floating balloons · Move cursor for hearts ✨
        </div>
      </div>
    </div>
  );
}
