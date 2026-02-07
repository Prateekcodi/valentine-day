// Gemini AI Reflection Service
// This service generates thoughtful reflections based on user interactions

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (optional - will fallback to mock if no API key)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Fallback reflections for when API is unavailable
const FALLBACK_REFLECTIONS: Record<number, string[]> = {
  1: [
    "This moment marks the beginning of something thoughtful. Thank you for showing up, together.",
    "A rose accepted together is a promise shared. May your journey be filled with quiet moments.",
    "Sometimes the smallest gestures carry the deepest meaning. This is one of those moments.",
  ],
  2: [
    "Your words reveal intention and care. That's what matters most in any connection.",
    "Honesty creates the foundation for something real. You've both taken a meaningful step.",
  ],
  3: [
    "The thought behind a gift often matters more than the gift itself. You both showed up.",
    "Small choices reveal big truths about how we understand each other.",
  ],
  4: [
    "Comfort looks different for everyone. That you took time to share yours is meaningful.",
    "Understanding how you each give and receive care is a gift in itself.",
  ],
  5: [
    "Real promises aren't grand declarations—they're quiet commitments kept over time.",
    "You've both chosen to show up for each other. That's what matters.",
  ],
  6: [
    "Love has many languages. You've each shared yours in your own beautiful way.",
    "The way you express care is uniquely yours. That's something to celebrate.",
  ],
  7: [
    "Being there for someone isn't about fixing—it's about showing up. You both did that.",
    "Sometimes the best support is simply being present. You understood that.",
  ],
  8: [
    "This week has been a journey of small moments, thoughtful choices, and shared vulnerability.",
    "What you've built together is rare: intentional connection, one day at a time.",
    "May this be just the beginning of many more journeys, big and small.",
  ],
};

export async function generateGeminiReflection(prompt: string): Promise<string> {
  if (!genAI) {
    console.log('No Gemini API key, using fallback reflection');
    return getFallbackReflection(prompt);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const reflection = result.response.text();
    
    console.log('Generated AI reflection:', reflection.substring(0, 50) + '...');
    return reflection;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackReflection(prompt);
  }
}

function getFallbackReflection(prompt: string): string {
  // Extract day number from prompt or use default
  const dayMatch = prompt.match(/Day\s*(\d+)/i) || prompt.match(/(\d+)\s*days?/i);
  const day = dayMatch ? parseInt(dayMatch[1]) : 1;
  
  const reflections = FALLBACK_REFLECTIONS[day] || FALLBACK_REFLECTIONS[1];
  return reflections[Math.floor(Math.random() * reflections.length)];
}

// Cache for rate limiting
const reflectionCache = new Map<string, { reflection: string; timestamp: number }>();

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
