// Gemini AI Reflection Service
// This service generates thoughtful reflections based on user interactions

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (optional - will fallback to mock if no API key)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Fallback reflections - show BOTH players' messages when AI is unavailable
function createFallbackReflection(day: number, player1Answer: string, player2Answer: string): string {
  const responses: Record<number, string> = {
    1: `You both accepted the rose together. 🌹\n\nThis simple gesture speaks volumes about your connection. Thank you for showing up, together.\n\n"${player1Answer}" + "${player2Answer}" = A journey begins.`,
    
    2: `Here's what you both wrote:\n\n📝 ${player1Answer}\n📝 ${player2Answer}\n\nYour words reveal intention and care. That's what matters most in any connection.`,
    
    3: `Your chocolate choices:\n\n🍫 ${player1Answer}\n🍫 ${player2Answer}\n\nThe thought behind a gift matters more than the gift itself. You both showed up.`,
    
    4: `Your comfort styles:\n\n🧸 ${player1Answer}\n🧸 ${player2Answer}\n\nComfort looks different for everyone. Understanding how you each give and receive care is a gift.`,
    
    5: `Your promises:\n\n💎 ${player1Answer}\n💎 ${player2Answer}\n\nReal promises aren't grand declarations—they're quiet commitments kept over time.`,
    
    6: `Your expressions of affection:\n\n💋 ${player1Answer}\n💋 ${player2Answer}\n\nLove has many languages. You've each shared yours in your own beautiful way.`,
    
    7: `Your support preferences:\n\n🤗 ${player1Answer}\n🤗 ${player2Answer}\n\nBeing there isn't about fixing—it's about showing up. You understood that.`,
    
    8: `Your Valentine's Week journey:\n\n❤️ ${player1Answer}\n❤️ ${player2Answer}\n\nThis week has been a journey of small moments, thoughtful choices, and shared vulnerability.\n\nWhat you've built together is rare: intentional connection, one day at a time.`,
  };
  
  return responses[day] || responses[1];
}

// Cache for rate limiting
const reflectionCache = new Map<string, { reflection: string; timestamp: number }>();

export async function generateGeminiReflection(
  prompt: string,
  player1Answer?: string,
  player2Answer?: string,
  day?: number
): Promise<string> {
  // Extract day number from prompt
  const dayMatch = prompt.match(/Day\s*(\d+)/i) || prompt.match(/(\d+)\s*days?/i);
  const dayNumber = day || (dayMatch ? parseInt(dayMatch[1]) : 1);
  
  if (!genAI) {
    console.log('No Gemini API key, using fallback with both answers');
    return createFallbackReflection(dayNumber, player1Answer || '...', player2Answer || '...');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const reflection = result.response.text();
    
    console.log('Generated AI reflection:', reflection.substring(0, 50) + '...');
    return reflection;
  } catch (error) {
    console.error('Gemini API error:', error);
    return createFallbackReflection(dayNumber, player1Answer || '...', player2Answer || '...');
  }
}

export function getCachedReflection(cacheKey: string): string | null {
  const cached = reflectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
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
