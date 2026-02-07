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

// Calculate love percentage based on message quality and effort
function calculateLovePercentage(p1Answer: string, p2Answer: string): number {
  const avgLength = (p1Answer.length + p2Answer.length) / 2;
  
  // Base score around 70-80%
  let score = 70;
  
  // Bonus for meaningful length (15-150 chars is ideal)
  if (avgLength >= 15 && avgLength <= 150) {
    score += 10;
  }
  
  // Bonus for longer, thoughtful responses
  if (avgLength > 100) {
    score += 5;
  }
  
  // Random variation for authenticity (85-98%)
  score = Math.min(98, Math.max(85, score + Math.floor(Math.random() * 10) - 5));
  
  return score;
}

// Calculate star rating (1-5)
function calculateStarRating(p1Answer: string, p2Answer: string): number {
  const avgLength = (p1Answer.length + p2Answer.length) / 2;
  
  let stars = 4;
  
  if (avgLength >= 20 && avgLength <= 150) {
    stars = 5;
  }
  
  if (avgLength < 15) {
    stars = 3;
  }
  
  return stars;
}

// Fallback reflections when AI is unavailable
function createFallbackReflection(day: number, player1Answer: string, player2Answer: string): string {
  const lovePercent = calculateLovePercentage(player1Answer, player2Answer);
  const stars = calculateStarRating(player1Answer, player2Answer);
  
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
  
  return `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars ${emojis[day] || '❤️'}\n\nDay ${day}: ${dayNames[day] || 'Valentine Week'}\n\nYour messages:\n"${player1Answer}"\n"${player2Answer}"\n\nYour connection is special. Keep nurturing it! 💗`;
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
