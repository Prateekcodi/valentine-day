// AI Reflection Service
// Uses Gemini, OpenRouter, or MiniMax APIs

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize APIs
const geminiKey = process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;
const miniMaxKey = process.env.MINIMAX_API_KEY;

// Configure Gemini
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Configure MiniMax with Anthropic SDK
const anthropic = miniMaxKey 
  ? new Anthropic({
      apiKey: miniMaxKey,
      baseURL: 'https://api.minimax.io/anthropic'
    }) 
  : null;

// Log API status
if (geminiKey) {
  console.log(`Gemini API configured: ${geminiKey.substring(0, 5)}...`);
} else if (openRouterKey) {
  console.log(`OpenRouter API configured: ${openRouterKey.substring(0, 10)}...`);
} else if (miniMaxKey) {
  console.log(`MiniMax API configured: ${miniMaxKey.substring(0, 5)}...`);
} else {
  console.log('No AI APIs found - using fallback reflections');
}

// Analyze message sentiment and content honesty
function analyzeMessages(p1Answer: string, p2Answer: string): {
  loveScore: number;
  honestyScore: number;
  tone: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary: string;
} {
  const combined = (p1Answer + ' ' + p2Answer).toLowerCase();
  
  // Hindi negative words (comprehensive list)
  const negativeWords = [
    'bhag', 'pagal', 'chutiya', 'madarchod', 'fuck', 'shit', 'hell', 'hate', 
    'leave', 'go away', 'dont love', "don't love", '废物', '傻瓜', '滚', '不爱',
    'nahi', 'nhi', 'nahi karta', 'nhi karta', 'pyaar nahi', 'pyar nahi',
    'bahg jaa', 'bhag jaa', 'nikal', 'jao', 'jhho', 'uttar', 'chale jao',
    'besharmi', 'sharam', 'mujhse', 'mere se', 'tere se',
    'sorry',  // Saying sorry without context can be negative
    'pagli', 'pagli', 'bewakoof', 'idiot', 'dummy'
  ];
  
  const positiveWords = ['love', 'care', 'miss', 'beautiful', 'sweet', 'dear', 'baby', 'prateek', 'nidhi', 'happy', 'together', 'always', 'pyar', 'pyaar', 'dil', 'dost', 'sacchi', 'sach'];
  
  let negativeCount = 0;
  let positiveCount = 0;
  
  negativeWords.forEach(word => {
    if (combined.includes(word)) negativeCount++;
  });
  
  positiveWords.forEach(word => {
    if (combined.includes(word)) positiveCount++;
  });
  
  // Calculate scores
  let loveScore = 50; // Neutral baseline
  let honestyScore = 80;
  let tone: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  let summary = '';
  
  if (negativeCount > 0 && positiveCount === 0) {
    // Clearly negative - being honest about it
    loveScore = Math.max(5, 50 - (negativeCount * 12));
    honestyScore = 95;
    tone = 'negative';
    summary = `⚠️ TODAY\'S MESSAGES CONTAIN NEGATIVE CONTENT. The messages say things like "go away" or "I don\'t love you." This is NOT a healthy expression of love. Please communicate with respect and kindness.`;
  } else if (negativeCount > positiveCount) {
    // More negative than positive
    loveScore = Math.max(10, 50 + (positiveCount * 5) - (negativeCount * 10));
    honestyScore = 80;
    tone = 'negative';
    summary = '⚠️ The messages today lean negative. There are signs of tension or teasing that borders on hurtful. Please be kind to each other.';
  } else if (negativeCount > 0 && positiveCount > 0) {
    // Mixed - could be playful or genuine conflict
    loveScore = 50 + (positiveCount * 8) - (negativeCount * 5);
    honestyScore = 75;
    tone = 'mixed';
    summary = 'Today\'s conversation was mixed - some positive words and some negative or teasing words. If this is playful banter, make sure both are comfortable.';
  } else if (positiveCount > 0) {
    // Positive messages
    loveScore = 60 + (positiveCount * 8);
    honestyScore = 90;
    tone = 'positive';
    summary = 'Today\'s conversation showed genuine positive feelings and care between you two.';
  } else {
    // Neutral/no strong indicators
    loveScore = 55;
    summary = 'Today\'s conversation was relatively neutral. The messages didn\'t strongly express love or negativity.';
  }
  
  // Clamp scores
  loveScore = Math.max(5, Math.min(95, loveScore));
  honestyScore = Math.max(50, Math.min(99, honestyScore));
  
  return { loveScore, honestyScore, tone, summary };
}

// Calculate love percentage based on ACTUAL content analysis
function calculateLovePercentage(p1Answer: string, p2Answer: string): number {
  const analysis = analyzeMessages(p1Answer, p2Answer);
  return analysis.loveScore;
}

// Calculate honesty score
function calculateHonestyScore(p1Answer: string, p2Answer: string): number {
  const analysis = analyzeMessages(p1Answer, p2Answer);
  return analysis.honestyScore;
}

// Get tone description
function getToneDescription(p1Answer: string, p2Answer: string): string {
  const analysis = analyzeMessages(p1Answer, p2Answer);
  return analysis.summary;
}

// Fallback reflections when AI is unavailable
function createFallbackReflection(day: number, player1Answer: string, player2Answer: string): string {
  const lovePercent = calculateLovePercentage(player1Answer, player2Answer);
  const honesty = calculateHonestyScore(player1Answer, player2Answer);
  const toneDesc = getToneDescription(player1Answer, player2Answer);
  
  const dayNames: Record<number, string> = {
    1: 'Rose Day',
    2: 'Propose Day',
    3: 'Chocolate Day',
    4: 'Teddy Day',
    5: 'Promise Day',
    6: 'Kiss Day',
    7: 'Hug Day',
    8: "Valentine's Day"
  };
  
  const emojis: Record<number, string> = {
    1: '🌹',
    2: '💕',
    3: '🍫',
    4: '🧸',
    5: '💎',
    6: '💋',
    7: '🤗',
    8: '💝'
  };
  
  return `★ Love Score: ${lovePercent}% ☆ Honesty: ${honesty}% ${emojis[day] || '❤️'}

Day ${day}: ${dayNames[day] || 'Valentine Week'}

"${player1Answer}"
"${player2Answer}"

${toneDesc}`;
}

// Generate reflection using MiniMax API
async function generateMiniMaxReflection(prompt: string, day: number): Promise<string | null> {
  if (!anthropic) {
    return null;
  }
  
  try {
    console.log(`[Day ${day}] Generating MiniMax reflection...`);
    
    const msg = await anthropic.messages.create({
      model: 'mini-max-m2.1',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const reflection = msg.content[0].type === 'text' ? msg.content[0].text : '';
    console.log(`[Day ${day}] MiniMax reflection generated (${reflection.length} chars)`);
    return reflection;
  } catch (error: any) {
    console.error(`[Day ${day}] MiniMax API error:`, error.message);
    return null;
  }
}

// Generate reflection using Gemini API
async function generateGeminiReflection(prompt: string, day: number): Promise<string | null> {
  if (!genAI) {
    return null;
  }
  
  try {
    console.log(`[Day ${day}] Generating Gemini reflection...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const optimizedPrompt = prompt.length > 3000 
      ? prompt.substring(0, 3000) + '\n[Content truncated]'
      : prompt;
    
    const result = await model.generateContent(optimizedPrompt);
    const reflection = result.response.text();
    
    console.log(`[Day ${day}] Gemini reflection generated (${reflection.length} chars)`);
    return reflection;
  } catch (error: any) {
    console.error(`[Day ${day}] Gemini API error:`, error.message);
    return null;
  }
}

// Generate reflection using OpenRouter API
async function generateOpenRouterReflection(prompt: string, day: number): Promise<string | null> {
  if (!openRouterKey) {
    return null;
  }
  
  try {
    console.log(`[Day ${day}] Generating OpenRouter reflection...`);
    
    // Using Claude Haiku (free model)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://valentine-day-sandy-seven.vercel.app',
        'X-Title': 'Valentine Week'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    const reflection = data.choices?.[0]?.message?.content || '';
    
    console.log(`[Day ${day}] OpenRouter reflection generated (${reflection.length} chars)`);
    return reflection;
  } catch (error: any) {
    console.error(`[Day ${day}] OpenRouter API error:`, error.message);
    return null;
  }
}

// Main function - tries Gemini → OpenRouter → MiniMax → fallback
export async function generateAIReflection(
  prompt: string,
  player1Answer: string,
  player2Answer: string,
  day: number
): Promise<string> {
  // Try Gemini first
  if (geminiKey) {
    const result = await generateGeminiReflection(prompt, day);
    if (result) {
      return result;
    }
  }
  
  // Try OpenRouter as second option
  if (openRouterKey) {
    const result = await generateOpenRouterReflection(prompt, day);
    if (result) {
      return result;
    }
  }
  
  // Try MiniMax as third option
  if (miniMaxKey) {
    const result = await generateMiniMaxReflection(prompt, day);
    if (result) {
      return result;
    }
  }
  
  // Use fallback
  console.log(`[Day ${day}] Using fallback reflection`);
  return createFallbackReflection(day, player1Answer, player2Answer);
}

// Cache for rate limiting
const reflectionCache = new Map<string, { reflection: string; timestamp: number }>();

export function getCachedReflection(cacheKey: string): string | null {
  const cached = reflectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.reflection;
  }
  return null;
}

export function cacheReflection(cacheKey: string, reflection: string): void {
  reflectionCache.set(cacheKey, {
    reflection,
    timestamp: Date.now()
  });
}
