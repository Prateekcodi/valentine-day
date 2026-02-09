// AI Reflection Service
// Supports MiniMax API (primary) and Gemini API (fallback)

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize APIs
const miniMaxKey = process.env.MINIMAX_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

const anthropic = miniMaxKey ? new Anthropic({ apiKey: miniMaxKey }) : null;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Log API status
if (miniMaxKey) {
  console.log(`MiniMax API key configured: ${miniMaxKey.substring(0, 5)}...`);
} else if (geminiKey) {
  console.log(`Gemini API key configured: ${geminiKey.substring(0, 5)}...`);
} else {
  console.log('No AI API keys found - using fallback reflections');
}

// Analyze message sentiment and content honesty
function analyzeMessages(p1Answer: string, p2Answer: string): {
  loveScore: number;
  honestyScore: number;
  tone: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary: string;
} {
  const combined = (p1Answer + ' ' + p2Answer).toLowerCase();
  
  // Negative/hurtful words to detect
  const negativeWords = ['bhag', 'pagal', 'chutiya', 'madarchod', 'fuck', 'shit', 'hell', 'hate', 'leave', 'go away', 'dont love', "don't love", '废物', '傻瓜', '滚', '不爱'];
  const positiveWords = ['love', 'care', 'miss', 'beautiful', 'sweet', 'dear', 'baby', 'prateek', 'nidhi', 'happy', 'together', 'always'];
  
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
    // Clearly negative or fighting
    loveScore = Math.max(10, 50 - (negativeCount * 15));
    honestyScore = 90;
    tone = 'negative';
    summary = 'Today\'s conversation had a negative or playful fighting tone. The messages suggest some tension or teasing that might need attention.';
  } else if (negativeCount > 0 && positiveCount > 0) {
    // Mixed - could be playful or genuine conflict
    loveScore = 50 + (positiveCount * 5) - (negativeCount * 5);
    honestyScore = 75;
    tone = 'mixed';
    summary = 'Today\'s conversation was mixed - some positive words and some negative or teasing words. This could be playful banter or genuine tension.';
  } else if (positiveCount > 0) {
    // Positive messages
    loveScore = 60 + (positiveCount * 10);
    honestyScore = 85;
    tone = 'positive';
    summary = 'Today\'s conversation showed genuine positive feelings and care between you two.';
  } else {
    // Neutral/no strong indicators
    loveScore = 55;
    summary = 'Today\'s conversation was relatively neutral. The messages didn\'t strongly express love or negativity.';
  }
  
  // Clamp scores
  loveScore = Math.max(5, Math.min(99, loveScore));
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
    
    // Use gemini-1.5-flash for better compatibility
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Truncate prompt to save tokens
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

// Main function - tries MiniMax first, then Gemini, then fallback
export async function generateAIReflection(
  prompt: string,
  player1Answer: string,
  player2Answer: string,
  day: number
): Promise<string> {
  // Try MiniMax first
  if (miniMaxKey) {
    const result = await generateMiniMaxReflection(prompt, day);
    if (result) {
      return result;
    }
  }
  
  // Try Gemini as fallback
  if (geminiKey) {
    const result = await generateGeminiReflection(prompt, day);
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
