// Gemini AI Reflection Service
// This service generates thoughtful reflections based on user interactions

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (optional - will fallback to mock if no API key)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Calculate love percentage based on message quality and effort
function calculateLovePercentage(p1Answer: string, p2Answer: string): number {
  const avgLength = (p1Answer.length + p2Answer.length) / 2;
  
  // Base score around 70-80%
  let score = 70;
  
  // Bonus for meaningful length (15-150 chars is ideal)
  if (avgLength >= 15 && avgLength <= 150) {
    score += 10;
  }
  
  // Bonus for longer, thoughtful responses (up to 20%)
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
  
  // Base 4 stars
  let stars = 4;
  
  // Bonus for good length
  if (avgLength >= 20 && avgLength <= 150) {
    stars = 5;
  }
  
  // Slight reduction for very short
  if (avgLength < 15) {
    stars = 3;
  }
  
  return stars;
}

// Fallback reflections - show BOTH players' messages when AI is unavailable
function createFallbackReflection(day: number, player1Answer: string, player2Answer: string): string {
  const lovePercent = calculateLovePercentage(player1Answer, player2Answer);
  const stars = calculateStarRating(player1Answer, player2Answer);
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  
  const responses: Record<number, string> = {
    1: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n${player1Answer}\n${player2Answer}\n\nThis simple gesture speaks volumes about your connection. Thank you for showing up, together. 🌹`,
    
    2: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n📝 "${player1Answer}"\n📝 "${player2Answer}"\n\nYour words reveal intention and care. That's what matters most in any connection. 💕`,
    
    3: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n🍫 "${player1Answer}"\n🍫 "${player2Answer}"\n\nThe thought behind a gift matters more than the gift itself. You both showed up beautifully. 🍫💝`,
    
    4: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n🧸 "${player1Answer}"\n🧸 "${player2Answer}"\n\nComfort looks different for everyone. Understanding how you each give and receive care is a gift. 🤗`,
    
    5: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n💎 "${player1Answer}"\n💎 "${player2Answer}"\n\nReal promises aren't grand declarations—they're quiet commitments kept over time. 💍`,
    
    6: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n💋 "${player1Answer}"\n💋 "${player2Answer}"\n\nLove has many languages. You've each shared yours in your own beautiful way. 💗`,
    
    7: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n🤗 "${player1Answer}"\n🤗 "${player2Answer}"\n\nBeing there isn't about fixing—it's about showing up. You understood that. 🌟`,
    
    8: `★ Love Percentage: ${lovePercent}% ☆ Star Rating: ${stars}/5 stars\n\n❤️ "${player1Answer}"\n❤️ "${player2Answer}"\n\nThis week has been a journey of small moments, thoughtful choices, and shared vulnerability.\n\nWhat you've built together is rare: intentional connection, one day at a time. Happy Valentine's Day! 💝`,
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
