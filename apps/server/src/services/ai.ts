// AI Reflection Service
// Priority: Gemini → OpenRouter → Groq → Claude (Anthropic) → Fallback

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// ✅ Fix: Separate keys correctly — no more MiniMax/Anthropic confusion
const geminiKey = process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

// ✅ Fix: Funny + romantic system prompt used everywhere
const REFLECTION_SYSTEM_PROMPT = `You are a witty, warm-hearted love storyteller who writes reflections that are equal parts funny and deeply romantic. Your style is like a best friend who also happens to be a poet — you tease gently, celebrate honestly, and always leave people feeling seen, smiled at, and loved. 

Your reflections should:
- Mix humor with genuine emotion (funny observations + heartfelt truths)
- Feel personal, not generic — react to what was actually shared
- Include playful digs, sweet moments, and at least one line that makes them laugh
- Be written in a warm conversational tone, like someone who truly knows them
- End with something that hits emotionally after the laughs

Never be formal. Never be boring. Be the friend they wish wrote their wedding speech.`;

const LETTER_SYSTEM_PROMPT = `You write love letters in Hinglish — a natural, warm mix of Hindi and English that Indians use when texting someone they love. 

Your style rules:
- Mix Hindi phrases naturally with English sentences (e.g. "tum meri favorite notification ho", "bina tumhare main boot hi nahi hota")
- Use tech/modern metaphors for love: buffering, full storage, password-protected folder, notifications, boot, uninstall, logout, WiFi, update, reboot
- Be funny first, then hit them with something genuinely emotional
- Use emojis naturally like a real person texting — ❤️ 😌 😄 💘 🫶 ✨
- Short punchy lines, not long paragraphs
- Tone: like a best friend who is deeply in love and slightly dramatic about it
- Bold key emotional lines using **bold** markdown

Example phrases to inspire (don't copy, just match the vibe):
- "mera dil literally *buffering… please wait* mode mein chala jaata hai"
- "tum ho meri morning coffee — bina tumhare main boot hi nahi hota"  
- "main wahan full storage occupy karne aa raha hoon, no uninstall, no logout"
- "tum mera ghar ho, meri peace ho, aur meri favorite notification ho"
- "Is lifetime, next lifetime, aur universe ke har reboot ke baad bhi — I'd still choose you"`;

console.log('═'.repeat(50));
console.log('🤖 AI SERVICE STATUS');
console.log('═'.repeat(50));
console.log(`Gemini:     ${geminiKey ? '✓ (' + geminiKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`OpenRouter: ${openRouterKey ? '✓ (' + openRouterKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`Groq:       ${groqKey ? '✓ (' + groqKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`Anthropic:  ${anthropicKey ? '✓ (' + anthropicKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`Fallback:   ✓ Always available`);
console.log('═'.repeat(50));

// ═════════════════════════════════════════════════════════════
// SENTIMENT ANALYSIS
// ═════════════════════════════════════════════════════════════

interface SentimentResult {
  loveScore: number;
  honestyScore: number;
  tone: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary: string;
}

function analyzeMessages(p1Answer: string, p2Answer: string): SentimentResult {
  const combined = (p1Answer + ' ' + p2Answer).toLowerCase();

  const negativeWords = [
    'bhag', 'pagal', 'chutiya', 'fuck', 'shit', 'hate',
    'leave', 'go away', 'dont love', "don't love",
    'nahi karta', 'pyaar nahi', 'bhag jaa', 'nikal', 'chale jao',
    'bewakoof', 'idiot',
  ];

  const positiveWords = [
    'love', 'care', 'miss', 'beautiful', 'sweet', 'dear', 'baby',
    'happy', 'together', 'always', 'pyar', 'pyaar', 'dil', 'sacchi',
    'cute', 'lovely', 'special', 'favorite', 'best', 'amazing',
  ];

  let negCount = 0, posCount = 0;
  negativeWords.forEach(w => { if (combined.includes(w)) negCount++; });
  positiveWords.forEach(w => { if (combined.includes(w)) posCount++; });

  let loveScore = 55, honestyScore = 80;
  let tone: SentimentResult['tone'] = 'neutral';
  let summary = '';

  if (negCount > 0 && posCount === 0) {
    loveScore = Math.max(5, 50 - negCount * 12);
    honestyScore = 95; tone = 'negative';
    summary = '⚠️ Messages contain negative content. Please communicate with kindness.';
  } else if (negCount > posCount) {
    loveScore = Math.max(10, 50 + posCount * 5 - negCount * 10);
    tone = 'negative';
    summary = '⚠️ Messages lean negative. Signs of tension.';
  } else if (negCount > 0 && posCount > 0) {
    loveScore = Math.min(90, 50 + posCount * 8 - negCount * 5);
    tone = 'mixed';
    summary = 'Mixed vibes — some warmth, some edge. All good if it\'s playful!';
  } else if (posCount > 0) {
    loveScore = Math.min(95, 60 + posCount * 8);
    honestyScore = 90; tone = 'positive';
    summary = '✨ Genuine warmth and care in every word!';
  } else {
    summary = 'Quiet and steady — sometimes love doesn\'t need many words.';
  }

  return {
    loveScore: Math.max(5, Math.min(95, loveScore)),
    honestyScore: Math.max(50, Math.min(99, honestyScore)),
    tone, summary,
  };
}

export function calculateLovePercentage(p1Answer: string, p2Answer: string): number {
  return analyzeMessages(p1Answer, p2Answer).loveScore;
}

export function calculateHonestyScore(p1Answer: string, p2Answer: string): number {
  return analyzeMessages(p1Answer, p2Answer).honestyScore;
}

// ═════════════════════════════════════════════════════════════
// FALLBACK REFLECTION (funny + romantic, no API needed)
// ═════════════════════════════════════════════════════════════

function createFallbackReflection(day: number, p1Answer: string, p2Answer: string): string {
  const analysis = analyzeMessages(p1Answer, p2Answer);

  const dayFallbacks: Record<number, string> = {
    1: `★ Love Score: ${analysis.loveScore}% 💕

Rose Day. The most dramatic flower for the most dramatic emotion. You both showed up — and honestly? That already puts you ahead of 90% of love stories that never even started. 🌹

There's something quietly brave about beginning. No grand gestures yet, just the quiet decision to say "yes, let's try this." And that? That's the whole thing. That's love in its simplest, most honest form.

Keep showing up for each other. The roses will follow. 💕`,

    2: `★ Love Score: ${analysis.loveScore}% 💕

Propose Day. And look at you two — actually saying the thing. Out loud. In writing. While your heart was probably doing its best impression of a notification sound. 🔔💘

What you shared today wasn't just words — it was a tiny act of courage. Because saying "here's how I feel" and clicking send is terrifying... and you did it anyway.

${analysis.summary}

That's not nothing. That's everything. 💕`,

    3: `★ Love Score: ${analysis.loveScore}% 🍫

Chocolate Day. Which means today we find out what kind of person you really are. Dark chocolate? You're intense and probably send voice notes. Milk chocolate? Soft and loveable. White chocolate? Chaotic good energy — we respect it. 😄

The real sweetness though? You're here, doing this together. And that's sweeter than any chocolate they make. 🍫💕`,

    4: `★ Love Score: ${analysis.loveScore}% 🧸

Teddy Day — the holiday invented for people who communicate feelings through stuffed animals rather than words (no judgment, it works). 🧸

What you shared today says something real: you know how to make each other feel safe. That's rarer than any love language quiz will tell you. Keep being each other's soft landing. 💕`,

    5: `★ Love Score: ${analysis.loveScore}% 💎

Promise Day. The boldest day of the week, honestly. Because promises are easy to make and hard to keep — and you still made them. 

${analysis.summary}

A promise between two people who actually mean it? That's not romantic. That's revolutionary. 💎💕`,

    6: `★ Love Score: ${analysis.loveScore}% 💋

Kiss Day. And somehow you managed to be sweet about it without being weird. Respect. 😄

The way you express affection says everything about how you love — gently, specifically, with attention. That matters more than grand gestures ever will. 💋💕`,

    7: `★ Love Score: ${analysis.loveScore}% 🤗

Hug Day. The love language for people who run out of words (which is most of us, most of the time).

What you shared today is proof that you see each other — not just the highlight reel, but the tired, the scared, the "I just need five minutes" version too. That's the whole game right there. 🤗💕`,

    8: `★ Love Score: ${analysis.loveScore}% 💝

Valentine's Day. The finale. The boss level. The day where every cheesy thing suddenly feels completely justified. 🎉

You made it through a whole week of showing up, being honest, being vulnerable, and somehow still choosing each other at the end of every day. That's not a coincidence. That's a choice — made over and over again.

Here's to every ordinary day that becomes extraordinary because you're in it together. 

Happy Valentine's Day. You earned this. 💝✨`,
  };

  return dayFallbacks[day] || dayFallbacks[2];
}

// ═════════════════════════════════════════════════════════════
// API 1: GEMINI
// ═════════════════════════════════════════════════════════════

async function generateGeminiReflection(prompt: string, day: number): Promise<string | null> {
  if (!genAI) {
    console.log(`[Day ${day}] ⏭️ Skipping Gemini - no key`);
    return null;
  }
  console.log(`[Day ${day}] 🔄 Trying Gemini...`);
  try {
    // ✅ Fix: correct model name
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: REFLECTION_SYSTEM_PROMPT,
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (text && text.length > 50) {
      console.log(`[Day ${day}] ✅ Gemini SUCCESS (${text.length} chars)`);
      return text;
    }
    console.log(`[Day ${day}] ❌ Gemini empty response`);
    return null;
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ Gemini ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 2: OPENROUTER
// ═════════════════════════════════════════════════════════════

async function generateOpenRouterReflection(prompt: string, day: number): Promise<string | null> {
  if (!openRouterKey) {
    console.log(`[Day ${day}] ⏭️ Skipping OpenRouter - no key`);
    return null;
  }
  console.log(`[Day ${day}] 🔄 Trying OpenRouter...`);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://valentine-day-sandy-seven.vercel.app',
        'X-Title': 'Valentine Week AI',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        // ✅ Fix: increased tokens + funny romantic system prompt
        max_tokens: 900,
        messages: [
          { role: 'system', content: REFLECTION_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.log(`[Day ${day}] ❌ OpenRouter HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (text && text.length > 50) {
      console.log(`[Day ${day}] ✅ OpenRouter SUCCESS (${text.length} chars)`);
      return text;
    }
    console.log(`[Day ${day}] ❌ OpenRouter empty response`);
    return null;
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ OpenRouter ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 3: GROQ
// ═════════════════════════════════════════════════════════════

async function generateGroqReflection(prompt: string, day: number): Promise<string | null> {
  if (!groqKey) {
    console.log(`[Day ${day}] ⏭️ Skipping Groq - no key`);
    return null;
  }
  console.log(`[Day ${day}] 🔄 Trying Groq...`);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // ✅ consistent model everywhere
        max_tokens: 900, // ✅ Fix: enough for full reflection
        temperature: 0.85, // ✅ slightly higher for more personality
        messages: [
          { role: 'system', content: REFLECTION_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.log(`[Day ${day}] ❌ Groq HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (text && text.length > 50) {
      console.log(`[Day ${day}] ✅ Groq SUCCESS (${text.length} chars)`);
      return text;
    }
    console.log(`[Day ${day}] ❌ Groq empty response`);
    return null;
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ Groq ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 4: ANTHROPIC (Claude) — renamed from broken "MiniMax"
// ═════════════════════════════════════════════════════════════

async function generateAnthropicReflection(prompt: string, day: number): Promise<string | null> {
  // ✅ Fix: check the correct key (anthropic, not miniMaxKey)
  if (!anthropic) {
    console.log(`[Day ${day}] ⏭️ Skipping Anthropic - no key`);
    return null;
  }
  console.log(`[Day ${day}] 🔄 Trying Anthropic (Claude)...`);
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // ✅ Fix: valid Anthropic model
      max_tokens: 900,                     // ✅ Fix: enough tokens
      system: REFLECTION_SYSTEM_PROMPT,    // ✅ Fix: use funny+romantic prompt
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    if (text && text.length > 50) {
      console.log(`[Day ${day}] ✅ Anthropic SUCCESS (${text.length} chars)`);
      return text;
    }
    console.log(`[Day ${day}] ❌ Anthropic empty response`);
    return null;
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ Anthropic ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// MAIN REFLECTION FUNCTION
// ═════════════════════════════════════════════════════════════

export async function generateAIReflection(
  prompt: string,
  player1Answer: string,
  player2Answer: string,
  day: number
): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[Day ${day}] 🤖 GENERATING AI REFLECTION`);
  console.log(`${'═'.repeat(50)}\n`);

  if (geminiKey) {
    const r = await generateGeminiReflection(prompt, day);
    if (r) return r;
  }
  if (openRouterKey) {
    const r = await generateOpenRouterReflection(prompt, day);
    if (r) return r;
  }
  if (groqKey) {
    const r = await generateGroqReflection(prompt, day);
    if (r) return r;
  }
  // ✅ Fix: check anthropicKey, call renamed function
  if (anthropicKey) {
    const r = await generateAnthropicReflection(prompt, day);
    if (r) return r;
  }

  console.log(`[Day ${day}] ⚠️ All APIs failed - using fallback\n`);
  return createFallbackReflection(day, player1Answer, player2Answer);
}

// ═════════════════════════════════════════════════════════════
// LOVE LETTER GENERATION
// ═════════════════════════════════════════════════════════════

const LOVE_LETTER_PROMPT_TEMPLATE = `Write a Hinglish love letter from {senderName} to {recipientName} for Valentine's Day.

Hinglish = Hindi + English mixed naturally, like how Indian couples actually text each other.

Style: Funny, warm, slightly dramatic, deeply romantic. Use tech metaphors for love. Mix Hindi lines with English. Use emojis naturally. Bold the most emotional line.

Structure (follow loosely):
1. Opening line — something funny or relatable about how they make you feel
2. 2-3 lines mixing Hindi + English about what they mean to you (use a tech/modern metaphor)
3. One bold line that's genuinely emotionally moving
4. Sign off from {senderName} with a fitting emoji

Length: 120-180 words. Write ONLY the letter, nothing else.`;

function buildLetterPrompt(senderName: string, recipientName: string): string {
  const s = senderName || 'My Love';
  const r = recipientName || 'Darling';
  return LOVE_LETTER_PROMPT_TEMPLATE
    .replace(/{senderName}/g, s)
    .replace(/{recipientName}/g, r);
}

async function generateGeminiLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!genAI) return null;
  try {
    // ✅ Fix: correct model + system prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: LETTER_SYSTEM_PROMPT,
    });
    const result = await model.generateContent(buildLetterPrompt(senderName, recipientName));
    const text = result.response.text();
    if (text && text.length > 50) return text.trim();
  } catch (e) {
    console.log('[LoveLetter] Gemini failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

async function generateOpenRouterLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!openRouterKey) return null;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://valentine-days.vercel.app',
        'X-Title': 'Valentine Days',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: LETTER_SYSTEM_PROMPT },
          { role: 'user', content: buildLetterPrompt(senderName, recipientName) },
        ],
        max_tokens: 400, // ✅ enough for 200 word letter
      }),
    });
    const data: ChatCompletionResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (text && text.length > 50) return text.trim();
  } catch (e) {
    console.log('[LoveLetter] OpenRouter failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

async function generateGroqLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!groqKey) return null;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // ✅ Fix: consistent model
        messages: [
          { role: 'system', content: LETTER_SYSTEM_PROMPT },
          { role: 'user', content: buildLetterPrompt(senderName, recipientName) },
        ],
        max_tokens: 400,
        temperature: 0.9, // ✅ higher creativity for letters
      }),
    });
    const data: ChatCompletionResponse = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (text && text.length > 50) return text.trim();
  } catch (e) {
    console.log('[LoveLetter] Groq failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

async function generateAnthropicLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  // ✅ Fix: check anthropic client, use real model
  if (!anthropic) return null;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: LETTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildLetterPrompt(senderName, recipientName) }],
    });
    const text = message.content[0]?.type === 'text' ? message.content[0].text : null;
    if (text && text.length > 50) return text.trim();
  } catch (e) {
    console.log('[LoveLetter] Anthropic failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

function createFallbackLoveLetter(senderName: string, recipientName: string): string {
  const s = senderName || 'Your Love';
  const r = recipientName || 'Darling';

  const templates = [
    `My dearest ${r},

Har baar tumhara message padhte hi mera dil literally *buffering… please wait* mode mein chala jaata hai ❤️

Tum kehte ho main overreact karta hoon — but sach bataun?
**Tum ho meri morning coffee** — bina tumhare main boot hi nahi hota ☕😌

The way you exist in my life, so quietly and so completely —
main wahan **full storage occupy** karne aa gaya hoon. No uninstall. No logout. No terms & conditions. 💘

Is lifetime, next lifetime, aur universe ke har reboot ke baad bhi —
I'd still choose *you*.

Forever yours (with bad jokes, extra hugs, and zero chill),
${s} 💖`,

    `To ${r},

Main words dhoondhne nikla tha tumhare liye,
par tum itne perfect nikle ki **dictionary bhi hang ho gayi** 😅✨

Tum woh notification ho jo main kabhi snooze nahi karta.
Woh song jo bina play kiye dil mein bajta rahe. 🎶

**Agar love ek universe hota — tum hi uska WiFi password hote.**
Sabse important. Sabse secret. Sabse zaroori. 💫

Always and infinitely,
${s} 🌟`,

    `Darling ${r},

Log poori zindagi dhoondhte hain jo humein itna naturally mil gaya —
yeh easy, beautiful, thoda sa **pagal sa love** ❤️😄

Universe ne jab humein same story mein likha,
tab se mujhe yaqeen ho gaya — plot bilkul perfect hai 😌

Tumhari hasi, tumhari baatein, aur woh sparkle jab tum smile karte ho —
sab maine apne dil ke **password-protected folder** mein save kar liya hai. 🔐💕

Thank you for being you.
For choosing me. For tolerating my nonsense 😅

Yours in every season (and every WiFi outage),
${s} 🌹`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export async function generateLoveLetter(senderName: string, recipientName: string): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[LoveLetter] 🤖 GENERATING`);
  console.log(`From: "${senderName}" To: "${recipientName}"`);
  console.log(`${'═'.repeat(50)}\n`);

  if (geminiKey) {
    const r = await generateGeminiLoveLetter(senderName, recipientName);
    if (r) { console.log('[LoveLetter] 🎉 Using Gemini'); return r; }
  }
  if (openRouterKey) {
    const r = await generateOpenRouterLoveLetter(senderName, recipientName);
    if (r) { console.log('[LoveLetter] 🎉 Using OpenRouter'); return r; }
  }
  if (groqKey) {
    const r = await generateGroqLoveLetter(senderName, recipientName);
    if (r) { console.log('[LoveLetter] 🎉 Using Groq'); return r; }
  }
  // ✅ Fix: check anthropicKey, use renamed function
  if (anthropicKey) {
    const r = await generateAnthropicLoveLetter(senderName, recipientName);
    if (r) { console.log('[LoveLetter] 🎉 Using Anthropic'); return r; }
  }

  console.log('[LoveLetter] ⚠️ All APIs failed - using fallback');
  return createFallbackLoveLetter(senderName, recipientName);
}

// ═════════════════════════════════════════════════════════════
// CACHE
// ═════════════════════════════════════════════════════════════

const reflectionCache = new Map<string, { reflection: string; timestamp: number }>();

export function getCachedReflection(cacheKey: string): string | null {
  const cached = reflectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) return cached.reflection;
  return null;
}

export function cacheReflection(cacheKey: string, reflection: string): void {
  reflectionCache.set(cacheKey, { reflection, timestamp: Date.now() });
}

export function clearCache(): void {
  reflectionCache.clear();
  console.log('🗑️ AI reflection cache cleared');
}