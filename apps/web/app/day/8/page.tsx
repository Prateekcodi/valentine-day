import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   🌌 WORLD'S BEST VALENTINE'S DAY PAGE — 2026
   Features: Cinematic open · 200+ particles · Cursor trail ·
   Love Letter Gen · 3D Polaroids · Wish Lanterns ·
   Star Constellation · Time Capsule · Love Garden ·
   Fortune Cookies · Horoscope · Achievement badges ·
   Promise Stars · Love Language Quiz · Hidden Easter Eggs
═══════════════════════════════════════════════════════════ */

// ── GLOBALS ──────────────────────────────────────────────────
const PALETTE = {
  black:"#050208", deep:"#12051e", burgundy:"#5c0a1e",
  crimson:"#9b1b30", rose:"#e0476b", blush:"#f9a8c4",
  gold:"#d4af37", champagne:"#f7e7ce", cream:"#fdf6ec",
  midnight:"#0d0d2b",
};

// ── STAR CURSOR TRAIL ─────────────────────────────────────────
function CursorTrail() {
  const [trail, setTrail] = useState([]);
  const id = useRef(0);
  const shapes = ["💖","✨","🌸","💫","❤️","🌟","💕","⭐"];
  useEffect(() => {
    const h = (e) => {
      const n = ++id.current;
      const shape = shapes[Math.floor(Math.random()*shapes.length)];
      setTrail(t => [...t.slice(-25), { id:n, x:e.clientX, y:e.clientY, shape, s:Math.random()*12+8 }]);
      setTimeout(()=>setTrail(t=>t.filter(x=>x.id!==n)),800);
    };
    window.addEventListener("mousemove",h);
    return ()=>window.removeEventListener("mousemove",h);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {trail.map(t=>(
        <div key={t.id} style={{
          position:"absolute",left:t.x,top:t.y,fontSize:t.s,
          transform:"translate(-50%,-50%)",
          animation:"trailFade 0.8s ease-out forwards",
          userSelect:"none",
        }}>{t.shape}</div>
      ))}
      <style>{`@keyframes trailFade{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-200%) scale(0.2)}}`}</style>
    </div>
  );
}

// ── PARTICLE UNIVERSE ─────────────────────────────────────────
function ParticleUniverse() {
  const particles = useRef<{id:number;x:number;y:number;size:number;dur:number;delay:number;opacity:number;shape:string;drift:number}[]>(Array.from({length:120},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*14+4, dur:Math.random()*20+10,
    delay:Math.random()*10, opacity:Math.random()*0.5+0.1,
    shape:["💕","✨","🌸","⭐","💫","🌺","💗","🌟"][Math.floor(Math.random()*8)],
    drift:Math.random()*80-40,
  }))).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
          fontSize:p.size,opacity:p.opacity,
          animation:`particle${p.id%6} ${p.dur}s ${p.delay}s ease-in-out infinite`,
          userSelect:"none",filter:"blur(0.3px)",
        }}>{p.shape}</div>
      ))}
      <style>{`
        @keyframes particle0{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(30px,-40px) rotate(180deg)}}
        @keyframes particle1{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(-40px,-60px) rotate(-180deg)}}
        @keyframes particle2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-30px) scale(1.4)}}
        @keyframes particle3{0%,100%{transform:translate(0,0) rotate(0)}33%{transform:translate(-20px,-50px)}66%{transform:translate(40px,-20px)}}
        @keyframes particle4{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,-70px) rotate(360deg)}}
        @keyframes particle5{0%{transform:translate(0,0) scale(0.8)}50%{transform:translate(50px,-30px) scale(1.2)}100%{transform:translate(0,0) scale(0.8)}}
      `}</style>
    </div>
  );
}

// ── ROSE PETAL RAIN ───────────────────────────────────────────
function PetalRain({active}) {
  const petals = useRef(Array.from({length:30},(_,i)=>({
    id:i, x:Math.random()*110-5, dur:Math.random()*6+5,
    delay:Math.random()*8, size:Math.random()*20+12, rot:Math.random()*360,
    drift:Math.random()*100-50,
  }))).current;
  if(!active) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:2,overflow:"hidden"}}>
      {petals.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:"-5%",fontSize:p.size,
          animation:`petalFall ${p.dur}s ${p.delay}s linear infinite`,
          "--drift":`${p.drift}px`,userSelect:"none",
        }}>🌸</div>
      ))}
      <style>{`@keyframes petalFall{0%{top:-5%;transform:translateX(0) rotate(0deg);opacity:1}100%{top:105%;transform:translateX(var(--drift)) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

// ── ACHIEVEMENT SYSTEM ────────────────────────────────────────
const ALL_BADGES = [
  {id:"first",icon:"🌹",name:"First Bloom",desc:"Started your journey"},
  {id:"letter",icon:"💌",name:"Love Poet",desc:"Generated a love letter"},
  {id:"lantern",icon:"🏮",name:"Wish Maker",desc:"Released a wish lantern"},
  {id:"constellation",icon:"⭐",name:"Star Gazer",desc:"Found the love constellation"},
  {id:"capsule",icon:"📦",name:"Time Keeper",desc:"Sealed a time capsule"},
  {id:"garden",icon:"🌺",name:"Love Gardener",desc:"Grew your love garden"},
  {id:"fortune",icon:"🥠",name:"Fortune Seeker",desc:"Opened a fortune cookie"},
  {id:"quiz",icon:"💝",name:"Love Expert",desc:"Completed the love language quiz"},
  {id:"promise",icon:"💎",name:"Promise Keeper",desc:"Made a star promise"},
  {id:"secret",icon:"🔮",name:"Secret Finder",desc:"Found a hidden Easter egg"},
];

function AchievementToast({badge,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t)},[]);
  return (
    <div style={{
      position:"fixed",top:20,right:20,zIndex:9998,
      background:"linear-gradient(135deg,#d4af37,#f7e7ce)",
      borderRadius:16,padding:"14px 20px",
      boxShadow:"0 10px 40px rgba(212,175,55,0.5)",
      display:"flex",alignItems:"center",gap:12,
      animation:"toastSlide 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
      maxWidth:280,
    }}>
      <div style={{fontSize:36}}>{badge.icon}</div>
      <div>
        <div style={{fontWeight:900,color:"#12051e",fontSize:14}}>Achievement Unlocked!</div>
        <div style={{fontWeight:700,color:"#5c0a1e",fontSize:16}}>{badge.name}</div>
        <div style={{color:"#7b4e2b",fontSize:12}}>{badge.desc}</div>
      </div>
      <style>{`@keyframes toastSlide{0%{transform:translateX(120%);opacity:0}100%{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

// ── FIREWORKS ─────────────────────────────────────────────────
function Fireworks({active}) {
  if(!active) return null;
  const bursts = Array.from({length:12},(_,i)=>({
    id:i,x:Math.random()*90+5,y:Math.random()*60+5,
    color:["#e0476b","#d4af37","#a855f7","#22d3ee","#f9a8c4","#4ade80"][i%6],
    delay:Math.random()*1.5,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>
      {bursts.map(b=>(
        <div key={b.id} style={{position:"absolute",left:`${b.x}%`,top:`${b.y}%`,animation:`fireworkBurst 1.5s ${b.delay}s ease-out forwards`}}>
          {Array.from({length:12},(_,j)=>(
            <div key={j} style={{
              position:"absolute",width:6,height:6,borderRadius:"50%",background:b.color,
              animation:`fireworkParticle 1.2s ${b.delay}s ease-out forwards`,
              "--fa":`${(j/12)*360}deg`,
            }}/>
          ))}
        </div>
      ))}
      <style>{`
        @keyframes fireworkBurst{0%{transform:scale(0);opacity:1}100%{transform:scale(1);opacity:0}}
        @keyframes fireworkParticle{0%{transform:rotate(var(--fa)) translateY(0);opacity:1}100%{transform:rotate(var(--fa)) translateY(-80px);opacity:0}}
      `}</style>
    </div>
  );
}

// ── CINEMATIC OPENING ─────────────────────────────────────────
function CinematicOpening({onDone}) {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const name1 = "My Love";
  const msg = `Happy Valentine's Day, ${name1}...`;

  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),800);
    const t2=setTimeout(()=>setPhase(2),2200);
    const t3=setTimeout(()=>setPhase(3),3600);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3)};
  },[]);

  useEffect(()=>{
    if(phase!==3) return;
    let i=0;
    const t=setInterval(()=>{
      i++;setTyped(msg.slice(0,i));
      if(i>=msg.length){clearInterval(t);setTimeout(()=>setPhase(4),1000);}
    },60);
    return()=>clearInterval(t);
  },[phase]);

  useEffect(()=>{if(phase===4)setTimeout(onDone,1200);},[phase]);

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9000,background:"#050208",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      cursor:"none",
    }}>
      {/* Rose bloom */}
      {phase>=1&&(
        <div style={{fontSize:100,animation:"roseBlossom 1.2s cubic-bezier(0.175,0.885,0.32,1.275) forwards",marginBottom:30}}>
          🌹
        </div>
      )}
      {/* EKG heartbeat line */}
      {phase>=2&&(
        <div style={{width:300,height:50,marginBottom:24,overflow:"hidden",position:"relative"}}>
          <svg viewBox="0 0 300 50" style={{width:"100%"}}>
            <polyline
              points="0,25 40,25 55,5 65,45 75,20 85,25 130,25 145,5 155,45 165,20 175,25 220,25 235,5 245,45 255,20 265,25 300,25"
              fill="none" stroke="#e0476b" strokeWidth="2"
              style={{strokeDasharray:600,strokeDashoffset:600,animation:"ekg 1.5s ease forwards"}}
            />
          </svg>
          <style>{`@keyframes ekg{0%{stroke-dashoffset:600}100%{stroke-dashoffset:0}}`}</style>
        </div>
      )}
      {/* Typewriter */}
      {phase>=3&&(
        <div style={{
          fontSize:24,color:PALETTE.champagne,fontFamily:"Georgia,serif",
          letterSpacing:2,textAlign:"center",minHeight:36,
        }}>
          {typed}<span style={{animation:"blink 0.6s infinite"}}>|</span>
        </div>
      )}
      {phase>=4&&(
        <div style={{marginTop:30,animation:"fadeInUp 0.8s forwards"}}>
          <SparkBtn color={PALETTE.rose} onClick={onDone}>Enter Our World 💕</SparkBtn>
        </div>
      )}
      <style>{`
        @keyframes roseBlossom{0%{transform:scale(0) rotate(-180deg);opacity:0}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeInUp{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}}
      `}</style>
    </div>
  );
}

// ── SPARKLE BUTTON ────────────────────────────────────────────
function SparkBtn({children,onClick,color="#e0476b",small,disabled,style:ext={}}) {
  const [sparks,setSparks]=useState([]);
  const click=(e)=>{
    if(disabled)return;
    const ns=Array.from({length:10},(_,i)=>({id:Date.now()+i,a:(i/10)*360}));
    setSparks(s=>[...s,...ns]);
    setTimeout(()=>setSparks(s=>s.filter(x=>!ns.map(n=>n.id).includes(x.id))),700);
    onClick?.();
  };
  return (
    <button onClick={click} disabled={disabled} style={{
      position:"relative",overflow:"visible",
      background:disabled?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${color},${color}bb)`,
      border:`2px solid ${disabled?"rgba(255,255,255,0.2)":color}`,
      borderRadius:50,padding:small?"10px 22px":"14px 34px",
      fontSize:small?13:16,fontWeight:800,color:"white",cursor:disabled?"not-allowed":"pointer",
      boxShadow:disabled?"none":`0 6px 30px ${color}55,inset 0 1px 0 rgba(255,255,255,0.3)`,
      transition:"all 0.2s",fontFamily:"Georgia,serif",letterSpacing:1,
      opacity:disabled?0.4:1,...ext,
    }}>
      {children}
      {sparks.map(s=>(
        <div key={s.id} style={{
          position:"absolute",top:"50%",left:"50%",
          width:6,height:6,borderRadius:"50%",background:color,
          animation:"sparkOut 0.7s ease-out forwards",
          "--sx":`${Math.cos(s.a*Math.PI/180)*45}px`,
          "--sy":`${Math.sin(s.a*Math.PI/180)*45}px`,
        }}/>
      ))}
      <style>{`@keyframes sparkOut{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--sx)),calc(-50% + var(--sy))) scale(0);opacity:0}}`}</style>
    </button>
  );
}

// ── GLASS CARD ────────────────────────────────────────────────
function GCard({children,style:s={},glow=PALETTE.rose}) {
  return (
    <div style={{
      background:"rgba(12,3,24,0.75)",
      backdropFilter:"blur(24px)",
      borderRadius:24,
      border:`1px solid rgba(224,71,107,0.25)`,
      boxShadow:`0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.08)`,
      ...s,
    }}>
      {children}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────
function SectionHead({icon,title,subtitle}) {
  return (
    <div style={{textAlign:"center",marginBottom:28}}>
      <div style={{fontSize:48,marginBottom:8,animation:"floatBob 3s ease-in-out infinite"}}>{icon}</div>
      <h2 style={{
        fontFamily:"Georgia,serif",fontSize:26,fontWeight:900,
        background:`linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush})`,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        letterSpacing:2,marginBottom:6,
      }}>{title}</h2>
      {subtitle&&<p style={{color:"rgba(249,168,196,0.7)",fontSize:14,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{subtitle}</p>}
      <style>{`@keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 01. LOVE LETTER GENERATOR
// ══════════════════════════════════════════════════════════════
const LETTER_TEMPLATES = [
  (n1,n2)=>`My dearest ${n2 || "love"},\n\nEvery sunrise reminds me of you — warm, golden, impossible to look away from. In this lifetime and every one after, I would choose you again. The way you laugh, the way your eyes light up when you're happy — these are the things I keep locked in the safest corner of my heart.\n\nYou are not just my Valentine — you are my home.\n\nForever yours,\n${n1 || "Your Love"} 💕`,
  (n1,n2)=>`To ${n2 || "the one I love"},\n\nI have searched every constellation for words worthy of you, and still the stars fall short. You are the poetry I never knew I needed, the song that plays in the quiet moments when the world goes still.\n\nIf love were a universe, you would be every star in it.\n\nAlways and infinitely,\n${n1 || "Your Love"} 🌟`,
  (n1,n2)=>`Darling ${n2 || "heart"},\n\nSome people search their whole lives for what we have — this easy, beautiful, ridiculous love. I am grateful every single day that the universe was kind enough to write us into the same story.\n\nThank you for being you. For choosing me.\n\nYours in every season,\n${n1 || "Your Love"} 🌹`,
];

function LoveLetter({onUnlock}) {
  const [n1,setN1]=useState(""),n2=useRef("");
  const [letter,setLetter]=useState("");
  const [typed,setTyped]=useState("");
  const [generating,setGenerating]=useState(false);
  const [copied,setCopied]=useState(false);
  const [done,setDone]=useState(false);

  const generate=()=>{
    const tmpl=LETTER_TEMPLATES[Math.floor(Math.random()*LETTER_TEMPLATES.length)];
    const full=tmpl(n1,n2.current);
    setLetter(full);setTyped("");setGenerating(true);
    let i=0;
    const t=setInterval(()=>{
      i++;setTyped(full.slice(0,i));
      if(i>=full.length){clearInterval(t);setGenerating(false);if(!done){setDone(true);onUnlock("letter");}}
    },18);
  };

  const copy=()=>{
    navigator.clipboard.writeText(typed).catch(()=>{});
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div>
      <SectionHead icon="💌" title="Love Letter Generator" subtitle="Let your heart speak in words..."/>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
        <input value={n1} onChange={e=>setN1(e.target.value)} placeholder="Your name..."
          style={inputStyle}/>
        <input onChange={e=>n2.current=e.target.value} placeholder="Their name..."
          style={inputStyle}/>
      </div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <SparkBtn onClick={generate} color={PALETTE.crimson} disabled={generating}>
          {generating?"Writing...":"✍️ Write Our Story"}
        </SparkBtn>
      </div>
      {letter&&(
        <div style={{
          background:"rgba(247,231,206,0.07)",
          border:"1px solid rgba(212,175,55,0.3)",
          borderRadius:20,padding:24,
          fontFamily:"Georgia,serif",lineHeight:1.9,
          color:PALETTE.champagne,fontSize:15,
          whiteSpace:"pre-wrap",
          boxShadow:"inset 0 0 40px rgba(212,175,55,0.05)",
          position:"relative",marginBottom:16,
        }}>
          <div style={{fontSize:30,position:"absolute",top:12,left:16,opacity:0.2}}>💌</div>
          <div style={{fontSize:30,position:"absolute",bottom:12,right:16,opacity:0.2}}>🌹</div>
          <div style={{paddingTop:8}}>{typed}</div>
        </div>
      )}
      {typed&&!generating&&(
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <SparkBtn small onClick={copy} color={PALETTE.gold}>
            {copied?"✓ Copied!":"📋 Copy Letter"}
          </SparkBtn>
          <SparkBtn small onClick={generate} color={PALETTE.burgundy}>🔄 New Letter</SparkBtn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 02. 3D MEMORY SCRAPBOOK
// ══════════════════════════════════════════════════════════════
const MEMORIES = [
  {emoji:"🌅",front:"Our First Date",back:"The night we first talked until 3am and forgot the whole world existed 💕"},
  {emoji:"🌹",front:"When We First Met",back:"You smiled at me and I knew — this person is going to change everything ✨"},
  {emoji:"✈️",front:"Our First Trip",back:"Getting lost together and somehow finding the most beautiful place we'd ever seen 🗺️"},
  {emoji:"🌧️",front:"Rainy Sunday",back:"Staying in, making coffee, watching the rain — the most perfect ordinary day 🍵"},
  {emoji:"🎂",front:"Your Birthday",back:"Watching your face light up — that memory lives in my heart forever 🎉"},
  {emoji:"💫",front:"Our Future",back:"Every dream I have now, you're in it. Every plan I make, it's us. Always us 💞"},
];

function MemoryCard({mem,index}) {
  const [flipped,setFlipped]=useState(false);
  const colors=["#9b1b30","#5c0a1e","#7c3aed","#0e7490","#92400e","#166534"];
  const rots=["-3deg","2deg","-1deg","4deg","-2deg","3deg"];
  return (
    <div onClick={()=>setFlipped(f=>!f)} style={{
      cursor:"pointer",perspective:1000,
      transform:`rotate(${rots[index%rots.length]})`,
      transition:"transform 0.2s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="rotate(0) scale(1.05) translateY(-6px)"}}
    onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${rots[index%rots.length]})`}}
    >
      <div style={{
        width:"100%",height:160,position:"relative",
        transformStyle:"preserve-3d",
        transition:"transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275)",
        transform:flipped?"rotateY(180deg)":"rotateY(0)",
      }}>
        {/* Front */}
        <div style={{
          position:"absolute",inset:0,backfaceVisibility:"hidden",
          background:`linear-gradient(135deg,${colors[index%colors.length]}33,rgba(12,3,24,0.9))`,
          border:"1px solid rgba(212,175,55,0.3)",borderRadius:16,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:16,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{width:60,height:60,borderRadius:12,
            background:`linear-gradient(135deg,${colors[index%colors.length]},rgba(12,3,24,0.5))`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,
            marginBottom:10,border:"1px solid rgba(255,255,255,0.1)",
          }}>{mem.emoji}</div>
          <p style={{color:PALETTE.champagne,fontFamily:"Georgia,serif",fontWeight:700,fontSize:14,textAlign:"center"}}>{mem.front}</p>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:6}}>tap to flip 💕</p>
          {/* Tape decoration */}
          <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
            width:40,height:16,background:"rgba(212,175,55,0.3)",borderRadius:2,
          }}/>
        </div>
        {/* Back */}
        <div style={{
          position:"absolute",inset:0,backfaceVisibility:"hidden",
          transform:"rotateY(180deg)",
          background:"linear-gradient(135deg,rgba(212,175,55,0.15),rgba(224,71,107,0.15))",
          border:`1px solid ${PALETTE.gold}44`,borderRadius:16,
          display:"flex",alignItems:"center",justifyContent:"center",padding:20,
          boxShadow:"0 8px 32px rgba(212,175,55,0.2)",
        }}>
          <p style={{color:PALETTE.champagne,fontFamily:"Georgia,serif",fontStyle:"italic",
            fontSize:13,lineHeight:1.8,textAlign:"center"}}>{mem.back}</p>
        </div>
      </div>
    </div>
  );
}

function MemoryScrapbook() {
  return (
    <div>
      <SectionHead icon="📸" title="Memory Scrapbook" subtitle="Every moment we've shared, preserved forever..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {MEMORIES.map((m,i)=><MemoryCard key={i} mem={m} index={i}/>)}
      </div>
      <p style={{textAlign:"center",color:"rgba(249,168,196,0.5)",fontSize:12,marginTop:16,fontStyle:"italic"}}>
        Tap any card to reveal the memory ✨
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 03. WISH LANTERNS
// ══════════════════════════════════════════════════════════════
function WishLanterns({onUnlock}) {
  const [wish,setWish]=useState("");
  const [lanterns,setLanterns]=useState([]);
  const [released,setReleased]=useState(false);
  const idRef=useRef(0);

  const release=()=>{
    if(!wish.trim())return;
    const id=++idRef.current;
    setLanterns(l=>[...l,{id,text:wish,x:Math.random()*70+15,color:["#e0476b","#d4af37","#a855f7","#22d3ee"][id%4]}]);
    setWish("");setReleased(true);
    onUnlock("lantern");
    setTimeout(()=>setLanterns(l=>l.filter(x=>x.id!==id)),8000);
  };

  return (
    <div>
      <SectionHead icon="🏮" title="Wish Lanterns" subtitle="Write your wish, set it free into the universe..."/>
      <div style={{position:"relative",height:200,background:"rgba(5,2,8,0.5)",
        borderRadius:20,border:"1px solid rgba(255,255,255,0.08)",
        overflow:"hidden",marginBottom:20}}>
        {/* Stars in sky */}
        {Array.from({length:20}).map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*80}%`,
            width:2,height:2,borderRadius:"50%",background:"white",
            animation:`twinkle ${Math.random()*2+1}s ease-in-out infinite`,opacity:Math.random()*0.8+0.2}}/>
        ))}
        {lanterns.map(l=>(
          <div key={l.id} style={{
            position:"absolute",bottom:0,left:`${l.x}%`,
            animation:"lanternRise 8s ease-in forwards",
            display:"flex",flexDirection:"column",alignItems:"center",
          }}>
            <div style={{fontSize:11,color:"white",background:"rgba(0,0,0,0.6)",
              borderRadius:8,padding:"3px 8px",marginBottom:4,whiteSpace:"nowrap",maxWidth:100,
              overflow:"hidden",textOverflow:"ellipsis"}}>{l.text}</div>
            <div style={{fontSize:32,filter:`drop-shadow(0 0 10px ${l.color})`}}>🏮</div>
          </div>
        ))}
        <style>{`
          @keyframes lanternRise{0%{bottom:0;opacity:1;transform:rotate(0)}50%{transform:rotate(-5deg)}100%{bottom:110%;opacity:0;transform:rotate(5deg)}}
          @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:1}}
        `}</style>
      </div>
      <textarea value={wish} onChange={e=>setWish(e.target.value)}
        placeholder="Write your wish or promise for the year... 💫"
        maxLength={100} rows={3} style={{...inputStyle,borderRadius:16,resize:"none",marginBottom:16}}/>
      <div style={{textAlign:"center"}}>
        <SparkBtn onClick={release} color="#d4af37" disabled={!wish.trim()}>
          🏮 Release Your Wish
        </SparkBtn>
      </div>
      {released&&<p style={{textAlign:"center",color:PALETTE.gold,marginTop:12,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:14}}>
        Your wish is flying to the stars ✨
      </p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 04. STAR CONSTELLATION
// ══════════════════════════════════════════════════════════════
const HEART_STARS=[
  {x:50,y:20},{x:35,y:30},{x:25,y:45},{x:30,y:62},{x:50,y:78},
  {x:70,y:62},{x:75,y:45},{x:65,y:30},
];

function StarConstellation({onUnlock}) {
  const [connected,setConnected]=useState([]);
  const [done,setDone]=useState(false);
  const [shooting,setShooting]=useState(null);

  useEffect(()=>{
    const t=setInterval(()=>{
      setShooting({id:Date.now(),x:Math.random()*80+10,y:Math.random()*40+5});
      setTimeout(()=>setShooting(null),1000);
    },3500);
    return()=>clearInterval(t);
  },[]);

  const clickStar=(i)=>{
    if(done)return;
    if(connected.includes(i))return;
    const nc=[...connected,i];
    setConnected(nc);
    if(nc.length===HEART_STARS.length){
      setDone(true);onUnlock("constellation");
    }
  };

  return (
    <div>
      <SectionHead icon="⭐" title="Love Constellation" subtitle="Connect the stars to reveal what's hidden..."/>
      <div style={{
        position:"relative",height:260,
        background:"radial-gradient(ellipse at center,#0d0d2b 0%,#050208 100%)",
        borderRadius:20,border:"1px solid rgba(255,255,255,0.08)",
        overflow:"hidden",marginBottom:16,
      }}>
        {/* Background stars */}
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
            width:Math.random()*2+1,height:Math.random()*2+1,borderRadius:"50%",background:"white",opacity:Math.random()*0.5+0.1}}/>
        ))}
        {/* Shooting star */}
        {shooting&&<div style={{
          position:"absolute",left:`${shooting.x}%`,top:`${shooting.y}%`,
          width:80,height:2,background:"linear-gradient(90deg,rgba(255,255,255,0),white)",
          borderRadius:2,animation:"shootingStar 1s ease-out forwards",
        }}/>}
        {/* SVG lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
          {connected.map((starIdx,i)=>{
            if(i===0)return null;
            const from=HEART_STARS[connected[i-1]];
            const to=HEART_STARS[starIdx];
            return <line key={i}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={done?"#d4af37":"#e0476b"} strokeWidth="1.5" opacity="0.7"
              style={{animation:"lineGlow 1s forwards"}}
            />;
          })}
          {done&&<text x="50%" y="92%" textAnchor="middle" fill="#d4af37" fontSize="12"
            fontFamily="Georgia,serif" fontStyle="italic">
            Written in the stars 💫
          </text>}
        </svg>
        {/* Stars */}
        {HEART_STARS.map((s,i)=>(
          <div key={i} onClick={()=>clickStar(i)} style={{
            position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
            transform:"translate(-50%,-50%)",
            width:20,height:20,borderRadius:"50%",
            background:connected.includes(i)
              ?(done?"radial-gradient(circle,#ffd700,#d4af37)":"radial-gradient(circle,#ff6b9d,#e0476b)")
              :"radial-gradient(circle,rgba(255,255,255,0.8),rgba(255,255,255,0.2))",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,boxShadow:connected.includes(i)?`0 0 16px ${done?"#d4af37":"#e0476b"}`:"0 0 6px rgba(255,255,255,0.4)",
            transition:"all 0.3s",zIndex:10,
          }}>
            {connected.includes(i)?"⭐":"·"}
          </div>
        ))}
        <style>{`
          @keyframes lineGlow{0%{opacity:0}100%{opacity:0.7}}
          @keyframes shootingStar{0%{transform:translateX(0);opacity:1}100%{transform:translateX(120px);opacity:0}}
        `}</style>
      </div>
      {done?(
        <div style={{textAlign:"center",animation:"fadeInUp 0.6s forwards"}}>
          <p style={{color:PALETTE.gold,fontFamily:"Georgia,serif",fontSize:16,fontWeight:700}}>
            💫 The universe wrote your love story in the stars!
          </p>
        </div>
      ):(
        <p style={{textAlign:"center",color:"rgba(249,168,196,0.5)",fontSize:13}}>
          Click stars in order to connect them ({connected.length}/{HEART_STARS.length})
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 05. LOVE GARDEN
// ══════════════════════════════════════════════════════════════
const SEEDS=[
  {id:"rose",emoji:"🌹",name:"Love Rose",cost:1,msg:"Pure love blooms here"},
  {id:"tulip",emoji:"🌷",name:"Passion Tulip",cost:2,msg:"Your passion is beautiful"},
  {id:"sunflower",emoji:"🌻",name:"Happiness",cost:3,msg:"You light up my world"},
  {id:"cherry",emoji:"🌸",name:"Cherry Blossom",cost:5,msg:"Fleeting and precious as us"},
];

function LoveGarden({onUnlock}) {
  const [water,setWater]=useState(10);
  const [plants,setPlants]=useState([]);
  const [stage,setStage]=useState({});
  const [watered,setWatered]=useState(false);

  const plant=(seed)=>{
    if(water<seed.cost)return;
    const id=Date.now();
    setWater(w=>w-seed.cost);
    setPlants(p=>[...p,{id,seed,age:0}]);
    setStage(s=>({...s,[id]:0}));
    // Grow stages
    setTimeout(()=>setStage(s=>({...s,[id]:1})),1200);
    setTimeout(()=>setStage(s=>({...s,[id]:2})),2800);
    setTimeout(()=>setStage(s=>({...s,[id]:3})),4500);
    onUnlock("garden");
  };

  const waterGarden=()=>{
    setWater(w=>Math.min(20,w+3));
    setWatered(true);setTimeout(()=>setWatered(false),1000);
  };

  const sizes=["0.4","0.7","1.0","1.3"];

  return (
    <div>
      <SectionHead icon="🌺" title="Love Garden" subtitle="Plant seeds of love, watch them grow..."/>
      {/* Garden bed */}
      <div style={{
        position:"relative",height:140,
        background:"linear-gradient(to bottom,rgba(5,2,8,0) 0%,rgba(34,20,5,0.8) 100%)",
        borderRadius:"0 0 20px 20px",
        borderTop:"none",border:"1px solid rgba(255,255,255,0.08)",
        borderTop:"3px solid rgba(100,60,20,0.5)",
        marginBottom:16,overflow:"hidden",
        display:"flex",alignItems:"flex-end",gap:8,padding:"0 12px 12px",
      }}>
        {plants.slice(-8).map(p=>(
          <div key={p.id} style={{
            display:"flex",flexDirection:"column",alignItems:"center",
            animation:`plantGrow 0.5s ease`,flexShrink:0,
          }}>
            <div style={{
              fontSize:28*parseFloat(sizes[stage[p.id]||0]),
              transition:"font-size 0.8s cubic-bezier(0.175,0.885,0.32,1.275)",
              filter:`drop-shadow(0 0 8px ${["#e0476b","#ff69b4","#ffd700","#ffb6c1"][p.seed.cost-1]})`,
            }}>{p.seed.emoji}</div>
          </div>
        ))}
        {plants.length===0&&(
          <p style={{color:"rgba(255,255,255,0.2)",fontSize:13,margin:"auto",fontStyle:"italic"}}>
            Your garden awaits... 🌱
          </p>
        )}
      </div>
      {/* Seeds */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {SEEDS.map(s=>(
          <button key={s.id} onClick={()=>plant(s)} disabled={water<s.cost} style={{
            flex:1,minWidth:70,padding:"10px 6px",
            background:water>=s.cost?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)",
            border:`1px solid ${water>=s.cost?"rgba(212,175,55,0.4)":"rgba(255,255,255,0.1)"}`,
            borderRadius:14,color:"white",cursor:water>=s.cost?"pointer":"not-allowed",
            opacity:water>=s.cost?1:0.4,fontSize:13,transition:"all 0.2s",
          }}>
            <div style={{fontSize:24,marginBottom:4}}>{s.emoji}</div>
            <div style={{fontSize:10,opacity:0.7}}>{s.cost}💧</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:PALETTE.blush,fontSize:14}}>💧 Water: {water}</span>
        </div>
        <SparkBtn small onClick={waterGarden} color="#0e7490">
          {watered?"💦 Watered!":"💧 Water Garden"}
        </SparkBtn>
      </div>
      <style>{`@keyframes plantGrow{0%{transform:scale(0) translateY(10px)}100%{transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 06. FORTUNE COOKIES
// ══════════════════════════════════════════════════════════════
const FORTUNES=[
  "💕 Your love story is the greatest one ever told.",
  "✨ The stars aligned the day you two met.",
  "🌹 A single rose speaks louder than a thousand words.",
  "💫 Love is not something you find — it finds you.",
  "🌟 Your hearts beat in perfect harmony.",
  "💖 Every ending is a new beginning for the two of you.",
  "🌸 The most beautiful journeys begin with us.",
  "💎 True love is rare — you have found it.",
  "🌙 Even the moon knows your love is extraordinary.",
  "🦋 When two souls recognise each other, time stands still.",
];

function FortuneCookies({onUnlock}) {
  const [cracked,setCracked]=useState(null);
  const [fortune,setFortune]=useState("");
  const [done,setDone]=useState(false);

  const crack=()=>{
    setCracked(true);
    const f=FORTUNES[Math.floor(Math.random()*FORTUNES.length)];
    setFortune(f);
    if(!done){setDone(true);onUnlock("fortune");}
  };

  const reset=()=>{setCracked(null);setFortune("")};

  return (
    <div>
      <SectionHead icon="🥠" title="Fortune Cookies" subtitle="Crack open your love fortune..."/>
      <div style={{textAlign:"center",padding:"20px 0"}}>
        {!cracked?(
          <div onClick={crack} style={{
            display:"inline-block",fontSize:100,cursor:"pointer",
            animation:"cookieWiggle 2s ease-in-out infinite",
            filter:"drop-shadow(0 0 20px rgba(212,175,55,0.4))",
          }}>🥠</div>
        ):(
          <div style={{animation:"crackOpen 0.5s ease"}}>
            <div style={{fontSize:80,marginBottom:16,
              animation:"crackApart 0.4s ease forwards"}}>✨</div>
            <div style={{
              background:"rgba(247,231,206,0.1)",
              border:`1px solid ${PALETTE.gold}44`,
              borderRadius:20,padding:24,
              fontFamily:"Georgia,serif",fontStyle:"italic",
              color:PALETTE.champagne,fontSize:18,lineHeight:1.8,
              marginBottom:20,
            }}>{fortune}</div>
            <SparkBtn small onClick={reset} color={PALETTE.burgundy}>
              🥠 Another Fortune
            </SparkBtn>
          </div>
        )}
      </div>
      <style>{`
        @keyframes cookieWiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes crackOpen{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 07. LOVE LANGUAGE QUIZ
// ══════════════════════════════════════════════════════════════
const LOVE_Q=[
  {q:"When your partner is sad, you...",opts:["Hold them close 🤗","Say 'I love you' 💬","Do their chores 🏠","Give a gift 🎁"],scores:[0,1,2,3]},
  {q:"Your ideal Valentine's Day is...",opts:["Long slow dance 💃","Heartfelt letter 📝","A cooked meal 🍝","Surprise gift 🎁"],scores:[0,1,2,3]},
  {q:"You feel most loved when...",opts:["They hold your hand 🤝","They say kind words 💌","They help you out 🛠️","They give surprises 🎉"],scores:[0,1,2,3]},
  {q:"In arguments, you need...",opts:["A long hug 🤗","Apology words 🗣️","Acts of making up 🧹","A peace offering 🕊️"],scores:[0,1,2,3]},
  {q:"Your love superpower is...",opts:["Physical warmth 🌡️","Beautiful words 🌺","Acts of service 🌟","Thoughtful gifts 💝"],scores:[0,1,2,3]},
];
const LOVE_LANGS=["Physical Touch 🤗","Words of Affirmation 💬","Acts of Service 🏠","Gift Giving 🎁"];
const LOVE_DESC=[
  "You express and receive love most through touch — hugs, holding hands, physical presence. Your love language is the most instinctive human connection.",
  "Words mean everything to you. Hearing 'I love you,' receiving heartfelt notes, or being verbally affirmed fills your love tank completely.",
  "Love is shown through actions. You feel most loved when someone goes out of their way to help — and you show love the same way.",
  "Thoughtful gifts are your love language — not for materialism, but for the meaning behind them. A carefully chosen gift says 'I was thinking of you.'",
];

function LoveLanguageQuiz({onUnlock}) {
  const [q,setQ]=useState(0);
  const [scores,setScores]=useState([0,0,0,0]);
  const [result,setResult]=useState(null);
  const [sel,setSel]=useState(null);

  const pick=(score,i)=>{
    if(sel!==null)return;
    setSel(i);
    const ns=[...scores];ns[score]++;setScores(ns);
    setTimeout(()=>{
      if(q+1>=LOVE_Q.length){
        const max=Math.max(...ns);
        setResult(ns.indexOf(max));
        onUnlock("quiz");
      }else{setQ(q=>q+1);setSel(null);}
    },700);
  };

  const reset=()=>{setQ(0);setScores([0,0,0,0]);setResult(null);setSel(null)};

  if(result!==null) return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Your result is in..."/>
      <div style={{textAlign:"center",padding:"10px 0 20px"}}>
        <div style={{fontSize:60,marginBottom:12,animation:"floatBob 2s ease-in-out infinite"}}>
          {["🤗","💬","🏠","🎁"][result]}
        </div>
        <h3 style={{color:PALETTE.gold,fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,marginBottom:10}}>
          {LOVE_LANGS[result]}
        </h3>
        <p style={{color:PALETTE.champagne,fontFamily:"Georgia,serif",fontStyle:"italic",
          fontSize:14,lineHeight:1.8,marginBottom:20}}>{LOVE_DESC[result]}</p>
        <SparkBtn small onClick={reset} color={PALETTE.crimson}>🔄 Retake Quiz</SparkBtn>
      </div>
    </div>
  );

  const curr=LOVE_Q[q];
  return (
    <div>
      <SectionHead icon="💝" title="Love Language Quiz" subtitle="Discover how you love..."/>
      <div style={{marginBottom:6,display:"flex",gap:4,justifyContent:"center"}}>
        {LOVE_Q.map((_,i)=>(
          <div key={i} style={{width:32,height:4,borderRadius:2,
            background:i<q?PALETTE.rose:i===q?PALETTE.gold:"rgba(255,255,255,0.1)",transition:"all 0.3s"}}/>
        ))}
      </div>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,textAlign:"center",marginBottom:18}}>Q{q+1}/{LOVE_Q.length}</p>
      <p style={{color:PALETTE.champagne,fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,
        marginBottom:18,textAlign:"center",lineHeight:1.6}}>{curr.q}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {curr.opts.map((opt,i)=>(
          <button key={i} onClick={()=>pick(curr.scores[i],i)} style={{
            padding:"14px 10px",borderRadius:16,
            border:`2px solid ${sel===i?"rgba(212,175,55,0.8)":"rgba(255,255,255,0.15)"}`,
            background:sel===i?"rgba(212,175,55,0.2)":"rgba(255,255,255,0.04)",
            color:"white",cursor:"pointer",fontSize:13,fontWeight:600,
            transition:"all 0.2s",fontFamily:"Georgia,serif",
            transform:sel===i?"scale(1.02)":"scale(1)",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 08. PROMISE STARS
// ══════════════════════════════════════════════════════════════
function PromiseStars({onUnlock}) {
  const [promise,setPromise]=useState("");
  const [stars,setStars]=useState([]);
  const [done,setDone]=useState(false);

  const addStar=()=>{
    if(!promise.trim())return;
    const ns=[...stars,{id:Date.now(),text:promise,
      x:Math.random()*80+10,y:Math.random()*70+10,
      size:Math.random()*10+14,
    }];
    setStars(ns);setPromise("");
    if(!done){setDone(true);onUnlock("promise");}
  };

  return (
    <div>
      <SectionHead icon="💎" title="Promise Stars" subtitle="Write a promise — it becomes a star in our sky..."/>
      <div style={{
        position:"relative",height:200,
        background:"radial-gradient(ellipse at center,#0d0d2b,#050208)",
        borderRadius:20,border:"1px solid rgba(255,255,255,0.08)",
        overflow:"hidden",marginBottom:18,
      }}>
        {Array.from({length:30}).map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
            width:1.5,height:1.5,borderRadius:"50%",background:"white",opacity:0.3}}/>
        ))}
        {stars.map(s=>(
          <div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
            transform:"translate(-50%,-50%)",fontSize:s.size,
            animation:"starPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            cursor:"default",filter:"drop-shadow(0 0 6px #d4af37)",
          }} title={s.text}>⭐</div>
        ))}
        {stars.length===0&&<p style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
          justifyContent:"center",color:"rgba(255,255,255,0.2)",fontStyle:"italic",fontSize:13}}>
          Your promises will shine here ✨</p>}
        <style>{`@keyframes starPop{0%{transform:translate(-50%,-50%) scale(0)}100%{transform:translate(-50%,-50%) scale(1)}}`}</style>
      </div>
      <div style={{display:"flex",gap:10}}>
        <input value={promise} onChange={e=>setPromise(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&addStar()}
          placeholder="I promise to always..." style={{...inputStyle,flex:1}}/>
        <button onClick={addStar} disabled={!promise.trim()} style={{
          width:48,height:48,borderRadius:"50%",flexShrink:0,
          background:"rgba(212,175,55,0.3)",border:"1px solid rgba(212,175,55,0.5)",
          color:"white",fontSize:20,cursor:promise.trim()?"pointer":"not-allowed",
          opacity:promise.trim()?1:0.4,
        }}>⭐</button>
      </div>
      {stars.length>0&&<p style={{textAlign:"center",color:"rgba(212,175,55,0.6)",fontSize:13,marginTop:12,fontStyle:"italic"}}>
        {stars.length} promise{stars.length>1?"s":""} shining in the sky 💫
      </p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 09. TIME CAPSULE
// ══════════════════════════════════════════════════════════════
function TimeCapsule({onUnlock}) {
  const [msg,setMsg]=useState("");
  const [sealed,setSealed]=useState(false);
  const [done,setDone]=useState(false);

  const seal=()=>{
    if(!msg.trim())return;
    setSealed(true);
    if(!done){setDone(true);onUnlock("capsule");}
  };

  return (
    <div>
      <SectionHead icon="📦" title="Time Capsule" subtitle="A message to your future selves..."/>
      {!sealed?(
        <div>
          <div style={{
            textAlign:"center",fontSize:72,marginBottom:20,
            animation:"envelopeFloat 3s ease-in-out infinite",
          }}>💌</div>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            placeholder="Dear us, one year from today... What do you hope for? What do you promise? Write to your future selves..."
            maxLength={400} rows={5} style={{...inputStyle,borderRadius:16,resize:"none",marginBottom:16}}/>
          <div style={{textAlign:"center"}}>
            <SparkBtn onClick={seal} color={PALETTE.burgundy} disabled={!msg.trim()}>
              🔐 Seal the Capsule
            </SparkBtn>
          </div>
          <style>{`@keyframes envelopeFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}`}</style>
        </div>
      ):(
        <div style={{textAlign:"center",animation:"sealReveal 0.8s cubic-bezier(0.175,0.885,0.32,1.275)"}}>
          <div style={{fontSize:80,marginBottom:16,filter:"drop-shadow(0 0 20px #d4af37)"}}>📬</div>
          <div style={{
            background:"rgba(212,175,55,0.1)",border:`1px solid ${PALETTE.gold}44`,
            borderRadius:20,padding:24,marginBottom:20,
          }}>
            <div style={{color:PALETTE.gold,fontWeight:700,fontSize:14,marginBottom:6}}>📦 SEALED</div>
            <div style={{color:PALETTE.champagne,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:15}}>
              To be opened on Valentine's Day 2027 💌
            </div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:8}}>
              "Some things are worth waiting for."
            </div>
          </div>
          <div style={{
            width:60,height:60,borderRadius:"50%",background:"rgba(212,175,55,0.2)",
            border:`2px solid ${PALETTE.gold}`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:24,margin:"0 auto",
          }}>🔒</div>
          <style>{`@keyframes sealReveal{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 10. ACHIEVEMENTS PANEL
// ══════════════════════════════════════════════════════════════
function AchievementsPanel({unlocked}) {
  return (
    <div>
      <SectionHead icon="🏆" title="Your Achievements" subtitle={`${unlocked.length}/${ALL_BADGES.length} unlocked`}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {ALL_BADGES.map(b=>{
          const got=unlocked.includes(b.id);
          return (
            <div key={b.id} style={{
              padding:"14px 12px",borderRadius:16,
              background:got?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)",
              border:`1px solid ${got?"rgba(212,175,55,0.4)":"rgba(255,255,255,0.08)"}`,
              display:"flex",alignItems:"center",gap:10,
              transition:"all 0.3s",
              filter:got?"none":"grayscale(1)",
              opacity:got?1:0.5,
            }}>
              <div style={{fontSize:26,flexShrink:0}}>{b.icon}</div>
              <div>
                <div style={{color:got?PALETTE.gold:PALETTE.champagne,fontWeight:700,fontSize:12}}>{b.name}</div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      {unlocked.length===ALL_BADGES.length&&(
        <div style={{
          marginTop:20,textAlign:"center",
          background:"rgba(212,175,55,0.15)",border:`1px solid ${PALETTE.gold}44`,
          borderRadius:20,padding:20,
        }}>
          <div style={{fontSize:48,marginBottom:8}}>👑</div>
          <p style={{color:PALETTE.gold,fontFamily:"Georgia,serif",fontWeight:900,fontSize:18}}>
            Love Master Achieved!
          </p>
          <p style={{color:PALETTE.champagne,fontSize:14,fontStyle:"italic",marginTop:6}}>
            You've explored every corner of this love story 💕
          </p>
        </div>
      )}
    </div>
  );
}

// ── HIDDEN EASTER EGG ────────────────────────────────────────
const KONAMI=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

// ── SHARED STYLES ────────────────────────────────────────────
const inputStyle={
  width:"100%",background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(224,71,107,0.3)",borderRadius:50,
  padding:"12px 20px",color:"white",fontSize:14,
  outline:"none",backdropFilter:"blur(10px)",
  fontFamily:"Georgia,serif",
};

// ══════════════════════════════════════════════════════════════
// NAVIGATION TABS
// ══════════════════════════════════════════════════════════════
const SECTIONS=[
  {id:"letter",label:"💌",name:"Letter"},
  {id:"scrapbook",label:"📸",name:"Memories"},
  {id:"lanterns",label:"🏮",name:"Lanterns"},
  {id:"constellation",label:"⭐",name:"Stars"},
  {id:"garden",label:"🌺",name:"Garden"},
  {id:"fortune",label:"🥠",name:"Fortune"},
  {id:"quiz",label:"💝",name:"Quiz"},
  {id:"promises",label:"💎",name:"Promises"},
  {id:"capsule",label:"📦",name:"Capsule"},
  {id:"achievements",label:"🏆",name:"Awards"},
];

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [opened,setOpened]=useState(false);
  const [section,setSection]=useState("letter");
  const [unlocked,setUnlocked]=useState(["first"]);
  const [toastBadge,setToastBadge]=useState(null);
  const [petalRain,setPetalRain]=useState(false);
  const [fireworks,setFireworks]=useState(false);
  const [konamiProgress,setKonamiProgress]=useState(0);
  const [easterEgg,setEasterEgg]=useState(false);

  // Konami code
  useEffect(()=>{
    const h=(e)=>{
      if(e.key===KONAMI[konamiProgress]){
        const np=konamiProgress+1;
        setKonamiProgress(np);
        if(np>=KONAMI.length){
          setEasterEgg(true);setKonamiProgress(0);
          unlock("secret");
        }
      } else setKonamiProgress(0);
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[konamiProgress]);

  const unlock=useCallback((id)=>{
    setUnlocked(u=>{
      if(u.includes(id))return u;
      const nu=[...u,id];
      const badge=ALL_BADGES.find(b=>b.id===id);
      if(badge)setToastBadge(badge);
      // Check for full completion
      if(nu.length>=ALL_BADGES.length){
        setPetalRain(true);setFireworks(true);
        setTimeout(()=>{setPetalRain(false);setFireworks(false);},5000);
      }
      return nu;
    });
  },[]);

  useEffect(()=>{if(opened)unlock("first");},[opened]);

  const sectionProps={onUnlock:unlock};

  const renderSection=()=>{
    switch(section){
      case "letter":      return <LoveLetter {...sectionProps}/>;
      case "scrapbook":   return <MemoryScrapbook/>;
      case "lanterns":    return <WishLanterns {...sectionProps}/>;
      case "constellation": return <StarConstellation {...sectionProps}/>;
      case "garden":      return <LoveGarden {...sectionProps}/>;
      case "fortune":     return <FortuneCookies {...sectionProps}/>;
      case "quiz":        return <LoveLanguageQuiz {...sectionProps}/>;
      case "promises":    return <PromiseStars {...sectionProps}/>;
      case "capsule":     return <TimeCapsule {...sectionProps}/>;
      case "achievements":return <AchievementsPanel unlocked={unlocked}/>;
      default:            return null;
    }
  };

  if(!opened) return (
    <div style={{minHeight:"100vh",background:PALETTE.black,cursor:"none"}}>
      <CursorTrail/>
      <CinematicOpening onDone={()=>setOpened(true)}/>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 20% 20%,#1a0515 0%,${PALETTE.black} 50%,#0a0015 100%)`,
      cursor:"none",fontFamily:"Georgia,serif",
      overflowX:"hidden",
    }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(224,71,107,0.4);border-radius:2px}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3);font-style:italic}
        @keyframes fadeInUp{0%{transform:translateY(24px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      <CursorTrail/>
      <ParticleUniverse/>
      <PetalRain active={petalRain}/>
      <Fireworks active={fireworks}/>
      {toastBadge&&<AchievementToast badge={toastBadge} onDone={()=>setToastBadge(null)}/>}

      {/* Easter egg overlay */}
      {easterEgg&&(
        <div style={{
          position:"fixed",inset:0,zIndex:9997,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.9)",backdropFilter:"blur(20px)",flexDirection:"column",
        }} onClick={()=>setEasterEgg(false)}>
          <div style={{fontSize:80,marginBottom:20,animation:"floatBob 2s ease-in-out infinite"}}>🔮</div>
          <h2 style={{color:PALETTE.gold,fontFamily:"Georgia,serif",fontSize:28,marginBottom:12}}>
            Secret Discovered!
          </h2>
          <p style={{color:PALETTE.champagne,fontSize:16,fontStyle:"italic",marginBottom:20,textAlign:"center",maxWidth:300,lineHeight:1.8}}>
            "The greatest love stories are the ones that were never supposed to happen — yet did anyway."
          </p>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:13}}>Click anywhere to close</p>
        </div>
      )}

      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 14px 80px"}}>
        {/* Header */}
        <div style={{textAlign:"center",padding:"28px 0 20px",animation:"fadeInUp 0.8s forwards"}}>
          <div style={{fontSize:52,marginBottom:10,animation:"floatBob 3s ease-in-out infinite",
            filter:`drop-shadow(0 0 20px ${PALETTE.rose})`}}>💕</div>
          <h1 style={{
            fontFamily:"Georgia,serif",fontWeight:900,fontSize:28,letterSpacing:3,
            background:`linear-gradient(135deg,${PALETTE.gold},${PALETTE.blush},${PALETTE.gold})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            backgroundSize:"200%",animation:"shimmerText 3s linear infinite",
          }}>
            Valentine's Day 2026
          </h1>
          <p style={{color:"rgba(249,168,196,0.6)",fontSize:14,marginTop:6,fontStyle:"italic"}}>
            A world built just for us ✨
          </p>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,
            background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.3)",
            borderRadius:50,padding:"6px 16px",marginTop:10,fontSize:12,color:PALETTE.gold,
          }}>
            🏆 {unlocked.length}/{ALL_BADGES.length} Achievements · <span style={{opacity:0.6}}>↑↑↓↓←→←→BA for secret 🔮</span>
          </div>
          <style>{`@keyframes shimmerText{0%{background-position:0%}100%{background-position:200%}}`}</style>
        </div>

        {/* Navigation */}
        <div style={{
          display:"flex",gap:4,overflowX:"auto",paddingBottom:8,marginBottom:20,
          scrollbarWidth:"none",WebkitOverflowScrolling:"touch",
        }}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{
              flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
              padding:"10px 12px",borderRadius:16,
              background:section===s.id?"rgba(224,71,107,0.2)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${section===s.id?PALETTE.rose:"rgba(255,255,255,0.1)"}`,
              color:section===s.id?"white":"rgba(255,255,255,0.4)",
              cursor:"pointer",transition:"all 0.2s",minWidth:60,
              boxShadow:section===s.id?`0 0 20px ${PALETTE.rose}33`:"none",
              transform:section===s.id?"scale(1.05)":"scale(1)",
            }}>
              <span style={{fontSize:22}}>{s.label}</span>
              <span style={{fontSize:10,marginTop:3,fontFamily:"sans-serif"}}>{s.name}</span>
              {unlocked.includes(s.id)&&<span style={{fontSize:8,color:PALETTE.gold}}>✓</span>}
            </button>
          ))}
        </div>

        {/* Main section card */}
        <GCard style={{padding:28,animation:"fadeInUp 0.5s forwards"}}>
          {renderSection()}
        </GCard>

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:24,color:"rgba(255,255,255,0.2)",fontSize:12,fontStyle:"italic"}}>
          Move your cursor · Pop balloons · Find the secret code 🔮
        </div>
      </div>

      {/* Fixed bottom nav hint */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        background:"rgba(5,2,8,0.8)",backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.05)",
        padding:"8px 16px",textAlign:"center",
        color:"rgba(249,168,196,0.4)",fontSize:11,fontStyle:"italic",
      }}>
        Built with infinite love · Valentine's Day 2026 💕
      </div>
    </div>
  );
}
