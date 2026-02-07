import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRoomId, generatePlayerId, REFLECTION_PROMPTS } from './utils';
import { setupSocketHandlers } from './socket/handlers';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json());

// In-memory storage
const rooms = new Map<string, any>();

// Clean markdown formatting from AI responses while preserving paragraph structure
function cleanMarkdown(text: string): string {
  // First, normalize line breaks
  let cleaned = text.replace(/\r\n/g, '\n');
  
  // Remove bold markdown **text** → text (but keep emojis)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  
  // Remove italic markdown *text* → text (but keep single asterisks in text)
  cleaned = cleaned.replace(/(?!\S)\*(\*?)(?!\S)/g, '');
  
  // Remove inline code `text` → text
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  
  // Remove headers ###, ##, # at start of lines
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  
  // Remove horizontal rules --- or *** on their own line
  cleaned = cleaned.replace(/^\s*[-*]{3,}\s*$/gm, '');
  
  // Remove bullet markers at start of lines
  cleaned = cleaned.replace(/^\s*[•*+-]\s+/gm, '');
  
  // Clean up multiple spaces to single space (but not in quotes)
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Remove empty lines that are just whitespace
  cleaned = cleaned.replace(/^\s*$/gm, '');
  
  // Join multiple empty lines into single empty line
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

// Helper function to generate reflection
async function generateReflection(day: number, dayData: any): Promise<string> {
  let prompt = REFLECTION_PROMPTS[day] || '';
  
  if (!prompt) {
    return 'Reflection generated.';
  }
  
  // Customize prompt with actual data - Propose Day (most romantic)
  if (day === 2 && dayData) {
    // Propose Day - add messages with romantic personalization
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    
    prompt = `You are a romantic storyteller helping ${p1Name} and ${p2Name} express their feelings.

This is Propose Day - a moment for honest, heartfelt words between two people who care about each other.

${p1Name} wrote: "${dayData.player1Message || ''}"
${p2Name} wrote: "${dayData.player2Message || ''}"

Your task:
1. Acknowledge what each person expressed with their name
2. Give a LOVE PERCENTAGE (1-100%) based on sincerity and depth
3. Give a STARS RATING (1-5 stars) for emotional connection
4. Comment on the emotional tone and authenticity
5. Speak directly to their hearts in a romantic way

IMPORTANT: Always use their names when addressing them. Make it deeply personal.

Format your response with:
★ Love Percentage: XX%
☆ Star Rating: X/5 stars
Then your heartfelt reflection.

Remember: These are real feelings. Be tender, poetic, and uplifting.`;
  } else if (day === 3 && dayData) {
    // Chocolate Day - with percentage and names and messages
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    prompt = `${p1Name} and ${p2Name} are sharing sweet moments on Chocolate Day.

${p1Name} chose: "${dayData.player1Choice || ''}"
${p1Name} said: "${dayData.player1Message || ''}"

${p2Name} chose: "${dayData.player2Choice || ''}"
${p2Name} said: "${dayData.player2Message || ''}"

Give them sweet ratings:
★ Love Sweetness: XX%
☆ Connection Stars: X/5

Be warm, sweet, and personal.`;
  } else if (day === 4 && dayData) {
    // Teddy Day - comfort percentage and names
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    prompt = `${p1Name} and ${p2Name} are learning about each other's comfort styles.

${p1Name} offers comfort through: "${dayData.player1Data?.offering || ''}"
${p1Name} receives comfort as: "${dayData.player1Data?.receiving || ''}"
${p2Name} offers comfort through: "${dayData.player2Data?.offering || ''}"
${p2Name} receives comfort as: "${dayData.player2Data?.receiving || ''}"

Rate their understanding:
★ Understanding Percentage: XX%
☆ Harmony Stars: X/5

Be warm and reassuring.`;
  } else if (day === 5 && dayData) {
    // Promise Day - trust percentage and names
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    prompt = `${p1Name} and ${p2Name} are making promises to each other.

${p1Name}'s promise: "${dayData.player1Data || ''}"
${p2Name}'s promise: "${dayData.player2Data || ''}"

Rate their commitment:
★ Trust Percentage: XX%
☆ Commitment Stars: X/5

Be grounded, sincere, and encouraging.`;
  } else if (day === 6 && dayData) {
    // Kiss Day - affection percentage and names
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    prompt = `${p1Name} and ${p2Name} are expressing how they show love.

${p1Name} shows love through: "${dayData.player1Data || ''}"
${p2Name} shows love through: "${dayData.player2Data || ''}"

Rate their affection:
★ Affection Percentage: XX%
☆ Love Language Stars: X/5

Be tender, tasteful, and warm.`;
  } else if (day === 7 && dayData) {
    // Hug Day - support percentage and names
    const p1Name = dayData.player1Name || 'Player 1';
    const p2Name = dayData.player2Name || 'Player 2';
    prompt = `${p1Name} and ${p2Name} are learning how to support each other.

${p1Name} needs: "${dayData.player1Data || ''}"
${p2Name} responded: "${dayData.player2Data || ''}"
${p2Name} needs: "${dayData.player2Data || ''}"
${p1Name} responded: "${dayData.player1Data || ''}"

Rate their support:
★ Support Percentage: XX%
☆ Care Stars: X/5

Be warm, reassuring, and gentle.`;
  } else if (day === 8 && Array.isArray(dayData)) {
    // Valentine's Day - add all data
    prompt += `

Journey Summary:`;
    dayData.forEach((d: any, i: number) => {
      if (d) {
        prompt += `\nDay ${i + 1}: ${JSON.stringify(d).substring(0, 100)}...`;
      }
    });
  }
  
  // Try to use Gemini API if key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey.startsWith('AIza')) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        systemInstruction: "You are writing heartfelt reflections for a Valentine's Day experience. Write in clean, simple text without any markdown formatting. Do NOT use **bold**, *italic*, # headers, --- separators, or any markdown syntax. Use plain paragraphs with line breaks. Keep it romantic but natural."
      });
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      return cleanMarkdown(rawText);
    } catch (error) {
      console.error('Failed to generate reflection:', error);
    }
  }
  
  // Fallback to predefined reflections with percentages
  const reflections: Record<number, string> = {
    1: `★ Love Percentage: 85%
☆ Star Rating: 4/5 stars

This moment marks the beginning of something beautiful. Thank you for showing up, together.`,
    
    2: `★ Love Percentage: 92%
☆ Star Rating: 5/5 stars

Your words reveal deep sincerity and care. That's what matters most in any connection.`,
    
    3: `★ Love Sweetness: 88%
☆ Connection Stars: 4/5 stars

The thought you put into your choice shows genuine understanding of each other.`,
    
    4: `★ Understanding Percentage: 90%
☆ Harmony Stars: 5/5 stars

Your comfort styles complement each other beautifully, creating space for both connection and individuality.`,
    
    5: `★ Trust Percentage: 94%
☆ Commitment Stars: 5/5 stars

Real promises are built on small, consistent actions. This one feels grounded and achievable.`,
    
    6: `★ Affection Percentage: 91%
☆ Love Stars: 5/5 stars

Love shows itself in many ways. Your expression of it is uniquely your own.`,
    
    7: `★ Support Percentage: 89%
☆ Care Stars: 4/5 stars

Being present for each other, in whatever way is needed, is a beautiful form of love.`,
    
    8: `★ Overall Connection: 96%
☆ Journey Stars: 5/5 stars

This week together has been a testament to your beautiful connection. May it continue to grow and flourish.`
  };
  
  return reflections[day] || 'Thank you for sharing this journey.';
}

// Socket.IO handlers
setupSocketHandlers(io);

// REST API endpoints
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/room/create', (req: express.Request, res: express.Response) => {
  const { playerName } = req.body;

  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const roomId = generateRoomId();
  const playerId = generatePlayerId();

  const room = {
    id: roomId,
    player1: {
      id: playerId,
      name: playerName.trim(),
      joinedAt: new Date().toISOString(),
    },
    player2: null,
    progress: Array.from({ length: 8 }, (_, i) => ({
      day: i + 1,
      completed: false,
      data: null,
      aiReflection: null,
      completedAt: null,
    })),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  };

  rooms.set(roomId, room);

  res.json({ roomId, playerId });
});

app.post('/api/room/join', (req: express.Request, res: express.Response) => {
  const { roomId, playerName } = req.body;

  if (!roomId || roomId.length !== 6) {
    return res.status(400).json({ error: 'Invalid room code' });
  }

  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const trimmedName = playerName.trim();

  // Check if player with same name already exists in the room
  // This allows rejoining if user left and came back
  if (room.player1 && room.player1.name.toLowerCase() === trimmedName.toLowerCase()) {
    // Player 1 rejoining - return their existing playerId
    return res.json({ 
      roomId: roomId.toUpperCase(), 
      playerId: room.player1.id,
      rejoined: true,
      message: 'Welcome back!'
    });
  }

  if (room.player2 && room.player2.name.toLowerCase() === trimmedName.toLowerCase()) {
    // Player 2 rejoining - return their existing playerId
    return res.json({ 
      roomId: roomId.toUpperCase(), 
      playerId: room.player2.id,
      rejoined: true,
      message: 'Welcome back!'
    });
  }

  // Check if room is full with different players
  if (room.player1 && room.player2) {
    return res.status(400).json({ error: 'Room is full' });
  }

  // New player joining
  const playerId = generatePlayerId();

  if (!room.player1) {
    room.player1 = {
      id: playerId,
      name: trimmedName,
      joinedAt: new Date().toISOString(),
    };
  } else {
    room.player2 = {
      id: playerId,
      name: trimmedName,
      joinedAt: new Date().toISOString(),
    };
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({ 
    roomId: roomId.toUpperCase(), 
    playerId,
    rejoined: false
  });
});

app.get('/api/room/:roomId', (req: express.Request, res: express.Response) => {
  const room = rooms.get(req.params.roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(room);
});

// Day 1: Accept Rose endpoint
app.post('/api/day/1/accept', async (req: express.Request, res: express.Response) => {
  const { roomId, playerId } = req.body;

  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID and Player ID are required' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = 0; // Day 1 is index 0
  const dayProgress = room.progress[dayIndex];

  if (!dayProgress.data) {
    dayProgress.data = {};
  }

  // Mark player's acceptance
  const isPlayer1 = room.player1?.id === playerId;
  if (isPlayer1) {
    dayProgress.data.player1Accepted = true;
  } else {
    dayProgress.data.player2Accepted = true;
  }

  // Check if both players have accepted
  const bothAccepted = dayProgress.data.player1Accepted && dayProgress.data.player2Accepted;

  if (bothAccepted) {
    // Generate AI reflection
    const reflection = await generateReflection(1, dayProgress.data);
    
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    
    // Emit socket event for real-time updates
    io.to(roomId.toUpperCase()).emit('day-completed', {
      day: 1,
      reflection,
      nextDayUnlocked: true
    });
  } else {
    // Notify partner
    io.to(roomId.toUpperCase()).emit('partner-acted', {
      playerId,
      day: 1,
      action: 'accept-rose'
    });
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({
    completed: bothAccepted,
    reflection: bothAccepted ? dayProgress.aiReflection : null,
    partnerAccepted: bothAccepted
  });
});

// Day 1: Status endpoint
app.get('/api/day/1/status', (req: express.Request, res: express.Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[0];

  // Check if THIS specific player has accepted
  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerAccepted = isPlayer1 
    ? dayProgress.data?.player1Accepted 
    : dayProgress.data?.player2Accepted;
  
  const hasPartnerAccepted = isPlayer1
    ? dayProgress.data?.player2Accepted
    : dayProgress.data?.player1Accepted;

  res.json({
    accepted: hasThisPlayerAccepted || false,
    partnerAccepted: hasPartnerAccepted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed
  });
});

// Day 2: Submit endpoint
app.post('/api/day/2/submit', async (req: express.Request, res: express.Response) => {
  const { roomId, playerId, message } = req.body;

  if (!roomId || !playerId || !message) {
    return res.status(400).json({ error: 'Room ID, Player ID, and message are required' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = 1; // Day 2 is index 1
  const dayProgress = room.progress[dayIndex];

  if (!dayProgress.data) {
    dayProgress.data = {};
  }

  // Mark player's submission with name
  const isPlayer1 = room.player1?.id === playerId;
  const playerName = isPlayer1 ? room.player1?.name : room.player2?.name;
  
  if (isPlayer1) {
    dayProgress.data.player1Submitted = true;
    dayProgress.data.player1Message = message;
    dayProgress.data.player1Name = playerName;
  } else {
    dayProgress.data.player2Submitted = true;
    dayProgress.data.player2Message = message;
    dayProgress.data.player2Name = playerName;
  }

  // Check if both players have submitted
  const bothSubmitted = dayProgress.data.player1Submitted && dayProgress.data.player2Submitted;

  if (bothSubmitted) {
    // Generate AI reflection
    const reflection = await generateReflection(2, dayProgress.data);
    
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    
    // Emit socket event for real-time updates
    io.to(roomId.toUpperCase()).emit('day-completed', {
      day: 2,
      reflection,
      nextDayUnlocked: true
    });
  } else {
    // Notify partner
    io.to(roomId.toUpperCase()).emit('partner-acted', {
      playerId,
      day: 2,
      action: 'submit'
    });
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({
    completed: bothSubmitted,
    reflection: bothSubmitted ? dayProgress.aiReflection : null
  });
});

// Day 2: Status endpoint
app.get('/api/day/2/status', (req: express.Request, res: express.Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[1];

  // Check if THIS specific player has submitted
  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerSubmitted = isPlayer1 
    ? dayProgress.data?.player1Submitted 
    : dayProgress.data?.player2Submitted;
  
  const hasPartnerSubmitted = isPlayer1
    ? dayProgress.data?.player2Submitted
    : dayProgress.data?.player1Submitted;

  res.json({
    submitted: hasThisPlayerSubmitted || false,
    partnerSubmitted: hasPartnerSubmitted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed
  });
});

// Day 3: Submit endpoint
app.post('/api/day/3/submit', async (req: express.Request, res: express.Response) => {
  const { roomId, playerId, choice, message } = req.body;

  if (!roomId || !playerId || !choice) {
    return res.status(400).json({ error: 'Room ID, Player ID, and choice are required' });
  }

  const room = rooms.get(roomId.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = 2;
  const dayProgress = room.progress[dayIndex];

  if (!dayProgress.data) {
    dayProgress.data = {};
  }

  const isPlayer1 = room.player1?.id === playerId;
  const playerName = isPlayer1 ? room.player1?.name : room.player2?.name;
  
  if (isPlayer1) {
    dayProgress.data.player1Choice = choice;
    dayProgress.data.player1Submitted = true;
    dayProgress.data.player1Name = playerName;
    dayProgress.data.player1Message = message || ''; // Save message
  } else {
    dayProgress.data.player2Choice = choice;
    dayProgress.data.player2Submitted = true;
    dayProgress.data.player2Name = playerName;
    dayProgress.data.player2Message = message || ''; // Save message
  }

  const bothSubmitted = dayProgress.data.player1Submitted && dayProgress.data.player2Submitted;

  if (bothSubmitted) {
    const reflection = await generateReflection(3, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    io.to(roomId.toUpperCase()).emit('day-completed', { day: 3, reflection, nextDayUnlocked: true });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 3, action: 'choice' });
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null });
});

// Day 3: Status endpoint
app.get('/api/day/3/status', (req: express.Request, res: express.Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  if (!roomId) return res.status(400).json({ error: 'Room ID is required' });

  const room = rooms.get(roomId.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const dayProgress = room.progress[2];
  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerSubmitted = isPlayer1 ? dayProgress.data?.player1Submitted : dayProgress.data?.player2Submitted;
  const hasPartnerSubmitted = isPlayer1 ? dayProgress.data?.player2Submitted : dayProgress.data?.player1Submitted;

  res.json({
    submitted: hasThisPlayerSubmitted || false,
    partnerSubmitted: hasPartnerSubmitted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed
  });
});

// Generic Day Submit endpoint (for days 4-7)
app.post('/api/day/:dayNumber/submit', async (req: express.Request, res: express.Response) => {
  const { roomId, playerId, data } = req.body;
  const dayNumber = parseInt(req.params.dayNumber);
  
  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID and Player ID are required' });
  }

  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = dayNumber - 1;
  const dayProgress = room.progress[dayIndex];

  if (!dayProgress.data) {
    dayProgress.data = {};
  }

  const isPlayer1 = room.player1?.id === playerId;
  const playerName = isPlayer1 ? room.player1?.name : room.player2?.name;
  
  if (isPlayer1) {
    dayProgress.data.player1Data = data;
    dayProgress.data.player1Submitted = true;
    dayProgress.data.player1Name = playerName;
  } else {
    dayProgress.data.player2Data = data;
    dayProgress.data.player2Submitted = true;
    dayProgress.data.player2Name = playerName;
  }

  const bothSubmitted = dayProgress.data.player1Submitted && dayProgress.data.player2Submitted;

  if (bothSubmitted) {
    const reflection = await generateReflection(dayNumber, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    io.to(roomId.toUpperCase()).emit('day-completed', { day: dayNumber, reflection, nextDayUnlocked: dayNumber < 8 });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: dayNumber, action: 'submit' });
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null });
});

// Generic Day Status endpoint (for days 4-7)
app.get('/api/day/:dayNumber/status', (req: express.Request, res: express.Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;
  const dayNumber = parseInt(req.params.dayNumber);

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = dayNumber - 1;
  const dayProgress = room.progress[dayIndex];

  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerSubmitted = isPlayer1 
    ? dayProgress.data?.player1Submitted 
    : dayProgress.data?.player2Submitted;
  
  const hasPartnerSubmitted = isPlayer1
    ? dayProgress.data?.player2Submitted
    : dayProgress.data?.player1Submitted;

  res.json({
    submitted: hasThisPlayerSubmitted || false,
    partnerSubmitted: hasPartnerSubmitted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed
  });
});

// Day 8: Valentine's Day submit endpoint
app.post('/api/day/8/submit', async (req: express.Request, res: express.Response) => {
  const { roomId, playerId } = req.body;

  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID and Player ID are required' });
  }

  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayIndex = 7; // Day 8 is index 7
  const dayProgress = room.progress[dayIndex];

  if (!dayProgress.data) {
    dayProgress.data = {};
  }

  const isPlayer1 = room.player1?.id === playerId;
  if (isPlayer1) {
    dayProgress.data.player1Viewed = true;
  } else {
    dayProgress.data.player2Viewed = true;
  }

  const bothViewed = dayProgress.data.player1Viewed && dayProgress.data.player2Viewed;

  if (bothViewed) {
    // Generate final reflection combining all days
    const allData = room.progress.map((p: any) => p.data);
    const reflection = await generateReflection(8, allData);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    io.to(roomId.toUpperCase()).emit('journey-complete', { 
      day: 8, 
      reflection,
      message: 'Congratulations! You have completed the Valentine Week journey together!'
    });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 8, action: 'view' });
  }

  rooms.set(roomId.toUpperCase(), room);

  res.json({ 
    completed: bothViewed, 
    reflection: bothViewed ? dayProgress.aiReflection : null 
  });
});

// Day 8: Status endpoint
app.get('/api/day/8/status', (req: express.Request, res: express.Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[7];

  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerViewed = isPlayer1 
    ? dayProgress.data?.player1Viewed 
    : dayProgress.data?.player2Viewed;
  
  const hasPartnerViewed = isPlayer1
    ? dayProgress.data?.player2Viewed
    : dayProgress.data?.player1Viewed;

  res.json({
    submitted: hasThisPlayerViewed || false,
    partnerSubmitted: hasPartnerViewed || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Valentine Week Server running on port ${PORT}`);
  console.log('Socket.IO ready for connections');
});

export { io, rooms };
