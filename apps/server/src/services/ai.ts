// AI Reflection Service
// Priority: Gemini → OpenRouter → Groq → MiniMax → Fallback
// All API keys must be set in environment variables (Render dashboard)

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Type definitions for API responses
interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Initialize APIs from environment variables
// Keys should be set in Render dashboard, NOT in .env files
const geminiKey = process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
const miniMaxKey = process.env.MINIMAX_API_KEY;

// Configure APIs only if keys exist
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const anthropic = anthropicKey 
  ? new Anthropic({ apiKey: anthropicKey }) 
  : null;

// Log available APIs (show only first 5 chars, never full keys!)
console.log('═'.repeat(50));
console.log('🤖 AI SERVICE STATUS');
console.log('═'.repeat(50));
console.log(`Gemini API:    ${geminiKey ? '✓ Configured (' + geminiKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`OpenRouter API: ${openRouterKey ? '✓ Configured (' + openRouterKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`Groq API:       ${groqKey ? '✓ Configured (' + groqKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`MiniMax API:    ${miniMaxKey ? '✓ Configured (' + miniMaxKey.substring(0, 5) + '...)' : '✗ Not set'}`);
console.log(`Fallback:       ✓ Always available`);
console.log('═'.repeat(50));

// ═════════════════════════════════════════════════════════════
// SENTIMENT ANALYSIS (Always available, no API needed)
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
    'bhag', 'pagal', 'chutiya', 'madarchod', 'fuck', 'shit', 'hell', 'hate', 
    'leave', 'go away', 'dont love', "don't love", '废物', '傻瓜', '滚', '不爱',
    'nahi', 'nhi', 'nahi karta', 'nhi karta', 'pyaar nahi', 'pyar nahi',
    'bahg jaa', 'bhag jaa', 'nikal', 'jao', 'jhho', 'uttar', 'chale jao',
    'besharmi', 'sharam', 'mujhse', 'mere se', 'tere se',
    'sorry', 'pagli', 'bewakoof', 'idiot', 'dummy'
  ];
  
  const positiveWords = [
    'love', 'care', 'miss', 'beautiful', 'sweet', 'dear', 'baby', 
    'prateek', 'nidhi', 'happy', 'together', 'always', 'pyar', 'pyaar', 
    'dil', 'dost', 'sacchi', 'sach', 'cute', 'lovely', 'special',
    'favorite', 'favourite', 'best', 'amazing', 'wonderful'
  ];
  
  let negativeCount = 0;
  let positiveCount = 0;
  
  negativeWords.forEach(word => {
    if (combined.includes(word)) negativeCount++;
  });
  
  positiveWords.forEach(word => {
    if (combined.includes(word)) positiveCount++;
  });
  
  let loveScore = 50;
  let honestyScore = 80;
  let tone: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  let summary = '';
  
  if (negativeCount > 0 && positiveCount === 0) {
    loveScore = Math.max(5, 50 - (negativeCount * 12));
    honestyScore = 95;
    tone = 'negative';
    summary = '⚠️ Today\'s messages contain negative content. This is NOT a healthy expression of love. Please communicate with respect and kindness.';
  } else if (negativeCount > positiveCount) {
    loveScore = Math.max(10, 50 + (positiveCount * 5) - (negativeCount * 10));
    honestyScore = 80;
    tone = 'negative';
    summary = '⚠️ Today\'s messages lean negative. There are signs of tension or teasing that borders on hurtful.';
  } else if (negativeCount > 0 && positiveCount > 0) {
    loveScore = 50 + (positiveCount * 8) - (negativeCount * 5);
    honestyScore = 75;
    tone = 'mixed';
    summary = 'Today\'s conversation is mixed - positive words and some teasing. If playful, make sure both are comfortable.';
  } else if (positiveCount > 0) {
    loveScore = 60 + (positiveCount * 8);
    honestyScore = 90;
    tone = 'positive';
    summary = '✨ Today\'s conversation shows genuine positive feelings and care between you two!';
  } else {
    loveScore = 55;
    summary = 'Today\'s conversation was relatively neutral. The messages didn\'t strongly express love or negativity.';
  }
  
  loveScore = Math.max(5, Math.min(95, loveScore));
  honestyScore = Math.max(50, Math.min(99, honestyScore));
  
  return { loveScore, honestyScore, tone, summary };
}

export function calculateLovePercentage(p1Answer: string, p2Answer: string): number {
  return analyzeMessages(p1Answer, p2Answer).loveScore;
}

export function calculateHonestyScore(p1Answer: string, p2Answer: string): number {
  return analyzeMessages(p1Answer, p2Answer).honestyScore;
}

// ═════════════════════════════════════════════════════════════
// FALLBACK REFLECTION (No API needed)
// ═════════════════════════════════════════════════════════════

function createFallbackReflection(day: number, player1Answer: string, player2Answer: string): string {
  const analysis = analyzeMessages(player1Answer, player2Answer);
  
  const dayNames: Record<number, string> = {
    1: 'Rose Day', 2: 'Propose Day', 3: 'Chocolate Day', 4: 'Teddy Day',
    5: 'Promise Day', 6: 'Kiss Day', 7: 'Hug Day', 8: "Valentine's Day"
  };
  
  const emojis: Record<number, string> = {
    1: '🌹', 2: '💕', 3: '🍫', 4: '🧸',
    5: '💎', 6: '💋', 7: '🤗', 8: '💝'
  };
  
  return `★ Love Score: ${analysis.loveScore}% ☆ Honesty: ${analysis.honestyScore}% ${emojis[day] || '❤️'}

📅 Day ${day}: ${dayNames[day] || 'Valentine Week'}

💬 "${player1Answer}"
💬 "${player2Answer}"

${analysis.summary}

🤖 Generated by fallback system (AI unavailable)`;
}

// ═════════════════════════════════════════════════════════════
// API 1: GEMINI (Google) - Try first
// ═════════════════════════════════════════════════════════════

async function generateGeminiReflection(prompt: string, day: number): Promise<string | null> {
  if (!genAI) {
    console.log(`[Day ${day}] ⏭️ Skipping Gemini - no API key`);
    return null;
  }
  
  console.log(`[Day ${day}] 🔄 Trying Gemini API...`);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const optimizedPrompt = prompt.length > 3000 ? prompt.substring(0, 3000) + '\n[Content truncated]' : prompt;
    
    const result = await model.generateContent(optimizedPrompt);
    const reflection = result.response.text();
    
    if (reflection && reflection.length > 10) {
      console.log(`[Day ${day}] ✅ Gemini SUCCESS (${reflection.length} chars)`);
      return reflection;
    } else {
      console.log(`[Day ${day}] ❌ Gemini returned empty response`);
      return null;
    }
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ Gemini ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 2: OPENROUTER - Try second
// ═════════════════════════════════════════════════════════════

async function generateOpenRouterReflection(prompt: string, day: number): Promise<string | null> {
  if (!openRouterKey) {
    console.log(`[Day ${day}] ⏭️ Skipping OpenRouter - no API key`);
    return null;
  }
  
  console.log(`[Day ${day}] 🔄 Trying OpenRouter API...`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://valentine-day-sandy-seven.vercel.app',
        'X-Title': 'Valentine Week AI'
      },
      body: JSON.stringify({
        model: 'arcee-ai/trinity-large-preview:free',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You are a warm, reflective emotional intelligence guide. Write heartfelt, concise reflections about love. Keep responses under 100 words. Be warm, poetic, and genuine.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Day ${day}] ❌ OpenRouter HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      return null;
    }
    
    const data = await response.json();
    const reflection = data.choices?.[0]?.message?.content || '';
    
    if (reflection && reflection.length > 10) {
      console.log(`[Day ${day}] ✅ OpenRouter SUCCESS (${reflection.length} chars)`);
      return reflection;
    } else {
      console.log(`[Day ${day}] ❌ OpenRouter returned empty response`);
      return null;
    }
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ OpenRouter ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 3: GROQ (Llama) - Try third
// ═════════════════════════════════════════════════════════════

async function generateGroqReflection(prompt: string, day: number): Promise<string | null> {
  if (!groqKey) {
    console.log(`[Day ${day}] ⏭️ Skipping Groq - no API key`);
    return null;
  }
  
  console.log(`[Day ${day}] 🔄 Trying Groq API (Llama 3.3)...`);
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a warm, reflective emotional intelligence guide. Write heartfelt, concise reflections about love. Keep responses under 100 words. Be warm, poetic, and genuine.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Day ${day}] ❌ Groq HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      return null;
    }
    
    const data = await response.json();
    const reflection = data.choices?.[0]?.message?.content || '';
    
    if (reflection && reflection.length > 10) {
      console.log(`[Day ${day}] ✅ Groq SUCCESS (${reflection.length} chars)`);
      return reflection;
    } else {
      console.log(`[Day ${day}] ❌ Groq returned empty response`);
      return null;
    }
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ Groq ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// API 4: MINIMAX - Try fourth
// ═════════════════════════════════════════════════════════════

async function generateMiniMaxReflection(prompt: string, day: number): Promise<string | null> {
  if (!anthropic) {
    console.log(`[Day ${day}] ⏭️ Skipping MiniMax - no API key`);
    return null;
  }
  
  console.log(`[Day ${day}] 🔄 Trying MiniMax API...`);
  
  try {
    const msg = await anthropic.messages.create({
      model: 'mini-max-m2.1',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const reflection = msg.content[0].type === 'text' ? msg.content[0].text : '';
    
    if (reflection && reflection.length > 10) {
      console.log(`[Day ${day}] ✅ MiniMax SUCCESS (${reflection.length} chars)`);
      return reflection;
    } else {
      console.log(`[Day ${day}] ❌ MiniMax returned empty response`);
      return null;
    }
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ MiniMax ERROR: ${error.message}`);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// MAIN FUNCTION: Try APIs in priority order
// ═════════════════════════════════════════════════════════════

export async function generateAIReflection(
  prompt: string,
  player1Answer: string,
  player2Answer: string,
  day: number
): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[Day ${day}] 🤖 GENERATING AI REFLECTION`);
  console.log(`Player 1: "${player1Answer.substring(0, 50)}..."`);
  console.log(`Player 2: "${player2Answer.substring(0, 50)}..."`);
  console.log(`${'═'.repeat(50)}\n`);
  
  // Priority 1: Gemini
  if (geminiKey) {
    const result = await generateGeminiReflection(prompt, day);
    if (result) {
      console.log(`[Day ${day}] 🎉 Using Gemini reflection\n`);
      return result;
    }
  }
  
  // Priority 2: OpenRouter
  if (openRouterKey) {
    const result = await generateOpenRouterReflection(prompt, day);
    if (result) {
      console.log(`[Day ${day}] 🎉 Using OpenRouter reflection\n`);
      return result;
    }
  }
  
  // Priority 3: Groq
  if (groqKey) {
    const result = await generateGroqReflection(prompt, day);
    if (result) {
      console.log(`[Day ${day}] 🎉 Using Groq reflection\n`);
      return result;
    }
  }
  
  // Priority 4: MiniMax
  if (miniMaxKey) {
    const result = await generateMiniMaxReflection(prompt, day);
    if (result) {
      console.log(`[Day ${day}] 🎉 Using MiniMax reflection\n`);
      return result;
    }
  }
  
  // Fallback: No APIs available
  console.log(`[Day ${day}] ⚠️ All APIs failed - using fallback\n`);
  return createFallbackReflection(day, player1Answer, player2Answer);
}

// ═════════════════════════════════════════════════════════════
// CACHE FOR RATE LIMITING
// ═════════════════════════════════════════════════════════════

const reflectionCache = new Map<string, { reflection: string; timestamp: number }>();

export function getCachedReflection(cacheKey: string): string | null {
  const cached = reflectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.reflection;
  }
  return null;
}

// ═════════════════════════════════════════════════════════════
// LOVE LETTER GENERATION - Valentine's Day
// ═════════════════════════════════════════════════════════════

const LOVE_LETTER_PROMPT = `You are writing a romantic, personalized love letter for Valentine's Day. 
The writer's name is: {senderName}
The recipient's name is: {recipientName}

Write a beautiful, heartfelt love letter (150-200 words) that:
- Is romantic and poetic but not cheesy
- Mentions specific feelings about the relationship
- Ends with a loving sign-off from {senderName}
- Is written as a genuine personal letter, not a template

Write ONLY the letter content, no introductions or explanations.`;

async function generateGeminiLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!genAI) return null;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = LOVE_LETTER_PROMPT
      .replace('{senderName}', senderName || 'My Love')
      .replace('{recipientName}', recipientName || 'Darling')
      .replace(/{senderName}/g, senderName || 'My Love');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    if (response && response.length > 50) {
      return response.trim();
    }
  } catch (error) {
    console.log('[LoveLetter] Gemini failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

async function generateOpenRouterLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!openRouterKey) return null;
  
  try {
    const prompt = LOVE_LETTER_PROMPT
      .replace('{senderName}', senderName || 'My Love')
      .replace('{recipientName}', recipientName || 'Darling')
      .replace(/{senderName}/g, senderName || 'My Love');
    
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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });
    
    const data: ChatCompletionResponse = await response.json();
    const letter = data.choices?.[0]?.message?.content;
    
    if (letter && letter.length > 50) {
      return letter.trim();
    }
  } catch (error) {
    console.log('[LoveLetter] OpenRouter failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

async function generateGroqLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!groqKey) return null;
  
  try {
    const prompt = LOVE_LETTER_PROMPT
      .replace('{senderName}', senderName || 'My Love')
      .replace('{recipientName}', recipientName || 'Darling')
      .replace(/{senderName}/g, senderName || 'My Love');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });
    
    const data: ChatCompletionResponse = await response.json();
    const letter = data.choices?.[0]?.message?.content;
    
    if (letter && letter.length > 50) {
      return letter.trim();
    }
  } catch (error) {
    console.log('[LoveLetter] Groq failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

async function generateMiniMaxLoveLetter(senderName: string, recipientName: string): Promise<string | null> {
  if (!anthropic) return null;
  
  try {
    const prompt = LOVE_LETTER_PROMPT
      .replace('{senderName}', senderName || 'My Love')
      .replace('{recipientName}', recipientName || 'Darling')
      .replace(/{senderName}/g, senderName || 'My Love');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const letter = message.content[0]?.type === 'text' ? message.content[0].text : null;
    
    if (letter && letter.length > 50) {
      return letter.trim();
    }
  } catch (error) {
    console.log('[LoveLetter] MiniMax failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

function createFallbackLoveLetter(senderName: string, recipientName: string): string {
  const sender = senderName || 'Your Love';
  const recipient = recipientName || 'Darling';
  
  const templates = [
    `My dearest ${recipient},

Every sunrise reminds me of you — warm, golden, impossible to look away from. In this lifetime and every one after, I would choose you again. The way you laugh, the way your eyes light up when you're happy — these are the things I keep locked in the safest corner of my heart.

You are not just my Valentine — you are my home.

Forever yours,
${sender} 💕`,
    
    `To ${recipient},

I have searched every constellation for words worthy of you, and still the stars fall short. You are the poetry I never knew I needed, the song that plays in the quiet moments when the world goes still.

If love were a universe, you would be every star in it.

Always and infinitely,
${sender} 🌟`,
    
    `Darling ${recipient},

Some people search their whole lives for what we have — this easy, beautiful, ridiculous love. I am grateful every single day that the universe was kind enough to write us into the same story.

Thank you for being you. For choosing me.

Yours in every season,
${sender} 🌹`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function generateLoveLetter(
  senderName: string,
  recipientName: string
): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[LoveLetter] 🤖 GENERATING AI LOVE LETTER`);
  console.log(`From: "${senderName}" To: "${recipientName}"`);
  console.log(`${'═'.repeat(50)}\n`);
  
  // Priority 1: Gemini
  if (geminiKey) {
    const result = await generateGeminiLoveLetter(senderName, recipientName);
    if (result) {
      console.log(`[LoveLetter] 🎉 Using Gemini\n`);
      return result;
    }
  }
  
  // Priority 2: OpenRouter
  if (openRouterKey) {
    const result = await generateOpenRouterLoveLetter(senderName, recipientName);
    if (result) {
      console.log(`[LoveLetter] 🎉 Using OpenRouter\n`);
      return result;
    }
  }
  
  // Priority 3: Groq
  if (groqKey) {
    const result = await generateGroqLoveLetter(senderName, recipientName);
    if (result) {
      console.log(`[LoveLetter] 🎉 Using Groq\n`);
      return result;
    }
  }
  
  // Priority 4: MiniMax
  if (miniMaxKey) {
    const result = await generateMiniMaxLoveLetter(senderName, recipientName);
    if (result) {
      console.log(`[LoveLetter] 🎉 Using MiniMax\n`);
      return result;
    }
  }
  
  // Fallback
  console.log(`[LoveLetter] ⚠️ All APIs failed - using fallback\n`);
  return createFallbackLoveLetter(senderName, recipientName);
}

export function cacheReflection(cacheKey: string, reflection: string): void {
  reflectionCache.set(cacheKey, { reflection, timestamp: Date.now() });
}

export function clearCache(): void {
  reflectionCache.clear();
  console.log('🗑️ AI reflection cache cleared');
}
