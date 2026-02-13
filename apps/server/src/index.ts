import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRoomId, generatePlayerId } from './utils';
import { setupSocketHandlers } from './socket/handlers';
import { connectToDatabase, saveRoom, getRoom, initializeProgress, Room, DayProgress, isMongoAvailable } from './services/database';
import { generateAIReflection, generateLoveLetter } from './services/ai';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allow CORS from any origin
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin) return callback(null, true);
    if (origin?.includes('localhost')) return callback(null, true);
    if (origin?.includes('.vercel.app') || origin?.includes('vercel.app')) return callback(null, true);
    if (origin?.includes('.onrender.com') || origin?.includes('onrender.com')) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST']
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// In-memory storage for Socket.IO (kept for real-time operations)
export const rooms = new Map<string, any>();

// Clean markdown formatting and remove incomplete text
function cleanMarkdown(text: string): string {
  let cleaned = text.replace(/\r\n/g, '\n');
  
  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/(?!\S)\*(\*?)(?!\S)/g, '');
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  cleaned = cleaned.replace(/^\s*[-*]{3,}\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*[•*+-]\s+/gm, '');
  
  // Fix em-dashes that break sentences
  cleaned = cleaned.replace(/—{2,}/g, '—');
  cleaned = cleaned.replace(/"\s*—\s*"/g, '"—"');
  
  // Remove incomplete sentences
  const sentences = cleaned.split(/[.!?]+\s*/);
  const validSentences: string[] = [];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    
    if (trimmed.length < 20) continue;
    if (trimmed.endsWith(',')) continue;
    if (trimmed.endsWith(':')) continue;
    if (trimmed.endsWith(';')) continue;
    if (trimmed.match(/^(and|but|or|so|then|because|since|while|although|though|if|when|where|who|what|which|how|why)\s/i)) continue;
    if (trimmed.match(/\s(then|and|or|but|so)$/i)) continue;
    
    validSentences.push(trimmed);
  }
  
  cleaned = validSentences.join('. ') + '.';
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/^\s*$/gm, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

// Helper function to generate reflection using AI service
async function generateReflection(day: number, dayData: any): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[Day ${day}] 🎯 GENERATING REFLECTION`);
  console.log(`${'═'.repeat(50)}\n`);

  let prompt = '';
  const p1Name = dayData.player1Name || 'Player 1';
  const p2Name = dayData.player2Name || 'Player 2';

  if (day === 1) {
    prompt = `You are writing a heartfelt, detailed reflection for Rose Day between ${p1Name} and ${p2Name}.
  
They just accepted a rose together, marking the beginning of their Valentine Week journey.
  
Write a warm, poetic, emotionally rich reflection (200-400 words) that:
- Celebrates this quiet beginning
- Reflects on what this first step means for their connection
- Acknowledges the intention behind showing up
- Makes them feel seen and valued
- Feels intimate and personal to their unique bond

Style: Tender, warm, intimate, celebrating their connection.`;
  } else if (day === 2) {
    prompt = `You are writing a heartfelt reflection for Propose Day between ${p1Name} and ${p2Name}.

${p1Name} wrote: "${dayData.player1Message || ''}"
${p2Name} wrote: "${dayData.player2Message || ''}"

Write a warm, poetic, emotionally rich reflection (200-400 words) that:
- Reflects on the honesty and vulnerability they shared
- Acknowledges the uniqueness of their bond
- Feels intimate and personal to them
- Makes them feel seen and understood

Format: ★ Love Percentage: XX% ☆ Star Rating: X/5 stars

Style: Poetic, warm, intimate, celebrating their love.`;
  } else if (day === 3) {
    prompt = `You are writing a sweet, simple reflection for Chocolate Day between ${p1Name} and ${p2Name}.

${p1Name} chose: "${dayData.player1Choice || ''}" and said: "${dayData.player1Message || ''}"
${p2Name} chose: "${dayData.player2Choice || ''}" and said: "${dayData.player2Message || ''}"

Write a simple, warm reflection (100-200 words) that:
- Says something nice about why they chose that chocolate
- Talks about how well they know each other
- Makes them smile and feel good
- Is easy to understand, like talking to a friend

Style: Sweet, simple, warm, like a friendly chat.`;
  } else if (day === 4) {
    prompt = `You are writing a heartfelt reflection for Teddy Day between ${p1Name} and ${p2Name}.

${p1Name} offers comfort through: "${dayData.player1Data?.offering || ''}" and receives comfort through: "${dayData.player1Data?.receiving || ''}"
${p2Name} offers comfort through: "${dayData.player2Data?.offering || ''}" and receives comfort through: "${dayData.player2Data?.receiving || ''}"

Write a warm, poetic reflection (200-400 words) that:
- Celebrates how they understand each other's comfort needs
- Reflects on the beauty of knowing how to be there for each other
- Makes them feel seen and understood
- Acknowledges the tender moments they share

Style: Tender, warm, intimate, celebrating their emotional connection.`;
  } else if (day === 5) {
    prompt = `You are writing a heartfelt reflection for Promise Day between ${p1Name} and ${p2Name}.

${p1Name}'s promise: "${dayData.player1Data || ''}"
${p2Name}'s promise: "${dayData.player2Data || ''}"

Write a warm, poetic reflection (200-400 words) that:
- Celebrates the sincerity and thoughtfulness of their promises
- Reflects on what these commitments reveal about their bond
- Makes them feel seen and valued
- Acknowledges the trust they have in each other
- Feels intimate and personal to their unique relationship

Style: Sincere, warm, intimate, celebrating their commitment.`;
  } else if (day === 6) {
    prompt = `You are writing a heartfelt reflection for Kiss Day between ${p1Name} and ${p2Name}.

${p1Name} expressed affection: "${dayData.player1Data || ''}"
${p2Name} expressed affection: "${dayData.player2Data || ''}"

Write a warm, poetic reflection (200-400 words) that:
- Celebrates how they express love and affection
- Reflects on the tenderness they share
- Makes them feel seen and adored
- Acknowledges the unique ways they show love
- Feels intimate and personal to their special bond

Style: Tender, warm, intimate, celebrating their love.`;
  } else if (day === 7) {
    prompt = `You are writing a heartfelt reflection for Hug Day between ${p1Name} and ${p2Name}.

${p1Name} shared: "${JSON.stringify(dayData.player1Data || {})}"
${p2Name} shared: "${JSON.stringify(dayData.player2Data || {})}"

Write a warm, poetic reflection (200-400 words) that:
- Celebrates their emotional vulnerability and trust
- Reflects on how they support each other
- Makes them feel deeply understood
- Acknowledges the power of their connection
- Feels intimate and meaningful to their relationship

Style: Tender, warm, intimate, celebrating their emotional bond.`;
  } else {
    prompt = `You are writing the final Valentine's Day reflection for ${p1Name} and ${p2Name} after their complete 7-day journey together.

Review what they shared each day:
- Day 1 (Rose): Both accepted the rose
- Day 2 (Propose): ${dayData.day2?.player1Message || ''} / ${dayData.day2?.player2Message || ''}
- Day 3 (Chocolate): ${dayData.day3?.player1Choice || ''} / ${dayData.day3?.player2Choice || ''}
- Day 4 (Teddy): ${dayData.day4?.player1Data?.offering || ''} / ${dayData.day4?.player2Data?.offering || ''}
- Day 5 (Promise): ${dayData.day5?.player1Data || ''} / ${dayData.day5?.player2Data || ''}
- Day 6 (Kiss): ${dayData.day6?.player1Data || ''} / ${dayData.day6?.player2Data || ''}
- Day 7 (Hug): ${dayData.day7?.player1Data?.need || ''} / ${dayData.day7?.player2Data?.need || ''}

Write a comprehensive, heartfelt final reflection (300-500 words) that:
- Celebrates their complete journey together
- Reflects on how their connection has grown
- Acknowledges their unique bond and love
- Makes them feel deeply seen and cherished
- Honors the effort and vulnerability they shared
- Feels like a beautiful conclusion to their Valentine's Week

Style: Poetic, warm, celebratory, deeply meaningful.`;
  }

  console.log(`[Day ${day}] 📝 Prompt prepared, calling AI...`);

  try {
    // Prepare answers for the AI service
    const player1Answer = prompt;
    const player2Answer = prompt;
    
    const reflection = await generateAIReflection(prompt, player1Answer, player2Answer, day);
    
    if (reflection && reflection.length > 50) {
      const cleaned = cleanMarkdown(reflection);
      console.log(`[Day ${day}] ✨ AI Reflection generated (${cleaned.length} chars)`);
      return cleaned;
    } else {
      console.log(`[Day ${day}] ⚠️ AI returned empty, using fallback`);
      return `Your connection shines through in every moment you share. ${p1Name} and ${p2Name}, this week has shown the depth of your bond. Keep cherishing each other. 💕`;
    }
  } catch (error: any) {
    console.error(`[Day ${day}] ❌ AI Error: ${error.message}`);
    return `Your connection shines through in every moment you share. ${p1Name} and ${p2Name}, this week has shown the depth of your bond. Keep cherishing each other. 💕`;
  }
}

// Load room from database into memory
async function loadRoomToMemory(roomId: string): Promise<any | null> {
  const room = await getRoom(roomId.toUpperCase());
  if (room) {
    rooms.set(roomId.toUpperCase(), room);
  }
  return room;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate AI Love Letter
app.post('/api/love-letter', async (req: Request, res: Response) => {
  const { senderName, recipientName } = req.body;
  
  if (!senderName || !recipientName) {
    res.status(400).json({ error: 'senderName and recipientName are required' });
    return;
  }
  
  try {
    const letter = await generateLoveLetter(senderName, recipientName);
    res.json({ letter });
  } catch (error) {
    console.error('Love letter generation error:', error);
    res.status(500).json({ error: 'Failed to generate love letter' });
  }
});

// MongoDB connection test
app.get('/mongo-test', async (req: Request, res: Response) => {
  try {
    const connected = isMongoAvailable();
    const state = connected ? 1 : 0;
    res.json({
      mongo: state === 1 ? 'CONNECTED' : 'NOT CONNECTED',
      state,
      message: state === 1 ? '✅ MongoDB is connected - data will be permanent!' : '⚠️ Using memory storage - data will be lost on restart'
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Root route - prevents 404 on domain visit
app.get('/', (req: Request, res: Response) => {
  res.send('💕 Valentine Week Backend Running!\nAPI: /api/room/create');
});

// Create room
app.post('/api/room/create', async (req: Request, res: Response) => {
  const { playerName } = req.body;
  
  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const roomId = generateRoomId();
  const playerId = generatePlayerId();
  const trimmedName = playerName.trim();

  const room: Room = {
    id: roomId.toUpperCase(),
    player1: { id: playerId, name: trimmedName, joinedAt: new Date() },
    player2: null,
    progress: initializeProgress(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 days
  };

  await saveRoom(room);
  rooms.set(roomId.toUpperCase(), room);

  console.log(`\n${'🌹'.repeat(15)}`);
  console.log(`Room ${roomId.toUpperCase()} created by ${trimmedName}`);
  console.log(`${'🌹'.repeat(15)}\n`);

  res.json({ roomId: roomId.toUpperCase(), playerId });
});

// Join room
app.post('/api/room/join', async (req: Request, res: Response) => {
  const { roomId, playerName } = req.body;
  
  if (!roomId || roomId.length !== 6) {
    return res.status(400).json({ error: 'Invalid room code' });
  }
  
  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  let room = await loadRoomToMemory(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const trimmedName = playerName.trim();

  // Check if rejoining
  if (room.player1 && room.player1.name.toLowerCase() === trimmedName.toLowerCase()) {
    return res.json({ roomId: roomId.toUpperCase(), playerId: room.player1.id, rejoined: true, message: 'Welcome back!' });
  }

  if (room.player2 && room.player2.name.toLowerCase() === trimmedName.toLowerCase()) {
    return res.json({ roomId: roomId.toUpperCase(), playerId: room.player2.id, rejoined: true, message: 'Welcome back!' });
  }

  if (room.player1 && room.player2) {
    return res.status(400).json({ error: 'Room is full' });
  }

  const playerId = generatePlayerId();

  if (!room.player1) {
    room.player1 = { id: playerId, name: trimmedName, joinedAt: new Date() };
  } else {
    room.player2 = { id: playerId, name: trimmedName, joinedAt: new Date() };
  }

  await saveRoom(room);
  rooms.set(roomId.toUpperCase(), room);
  res.json({ roomId: roomId.toUpperCase(), playerId, rejoined: false });
});

app.get('/api/room/:roomId', async (req: Request, res: Response) => {
  let room = rooms.get(req.params.roomId.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(req.params.roomId);
  }
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// Day 1: Accept Rose
app.post('/api/day/1/accept', async (req: Request, res: Response) => {
  const { roomId, playerId } = req.body;

  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID and Player ID are required' });
  }

  let room = rooms.get(roomId.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[0];
  if (!dayProgress.data) dayProgress.data = {};

  const isPlayer1 = room.player1?.id === playerId;
  if (isPlayer1) dayProgress.data.player1Accepted = true;
  else dayProgress.data.player2Accepted = true;

  const bothAccepted = dayProgress.data.player1Accepted && dayProgress.data.player2Accepted;

  if (bothAccepted) {
    dayProgress.data.player1Name = room.player1?.name;
    dayProgress.data.player2Name = room.player2?.name;
    const reflection = await generateReflection(1, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date();
    
    await saveRoom(room);
    rooms.set(roomId.toUpperCase(), room);
    
    io.to(roomId.toUpperCase()).emit('day-completed', { day: 1, reflection, nextDayUnlocked: true });
  } else {
    rooms.set(roomId.toUpperCase(), room);
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 1, action: 'accept-rose' });
  }

  res.json({ completed: bothAccepted, reflection: bothAccepted ? dayProgress.aiReflection : null, partnerAccepted: bothAccepted });
});

// Day 1: Status
app.get('/api/day/1/status', async (req: Request, res: Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  let room = rooms.get(roomId?.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[0];
  const isPlayer1 = room.player1?.id === playerId;
  const hasThisPlayerAccepted = isPlayer1 ? dayProgress.data?.player1Accepted : dayProgress.data?.player2Accepted;
  const hasPartnerAccepted = isPlayer1 ? dayProgress.data?.player2Accepted : dayProgress.data?.player1Accepted;

  res.json({ accepted: hasThisPlayerAccepted || false, partnerAccepted: hasPartnerAccepted || false, reflection: dayProgress.aiReflection || null, completed: dayProgress.completed });
});

// Day 2: Submit
app.post('/api/day/2/submit', async (req: Request, res: Response) => {
  const { roomId, playerId, message } = req.body;

  if (!roomId || !playerId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let room = rooms.get(roomId.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[1];
  if (!dayProgress.data) dayProgress.data = {};

  const isPlayer1 = room.player1?.id === playerId;
  if (isPlayer1) {
    dayProgress.data.player1Message = message;
    dayProgress.data.player1Name = room.player1?.name;
  } else {
    dayProgress.data.player2Message = message;
    dayProgress.data.player2Name = room.player2?.name || 'Player 2';
  }

  const bothSubmitted = dayProgress.data.player1Message && dayProgress.data.player2Message;

  if (bothSubmitted) {
    const reflection = await generateReflection(2, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date();
    
    await saveRoom(room);
    rooms.set(roomId.toUpperCase(), room);
    
    io.to(roomId.toUpperCase()).emit('day-completed', { day: 2, reflection, nextDayUnlocked: true });
  } else {
    rooms.set(roomId.toUpperCase(), room);
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 2, action: 'submit-message' });
  }

  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null, partnerSubmitted: bothSubmitted });
});

// Day 2: Status
app.get('/api/day/2/status', async (req: Request, res: Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  let room = rooms.get(roomId?.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[1];
  const isPlayer1 = room.player1?.id === playerId;
  
  const hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Message : !!dayProgress.data?.player2Message;
  const hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Message : !!dayProgress.data?.player1Message;
  
  const player1Message = dayProgress.data?.player1Message || null;
  const player2Message = dayProgress.data?.player2Message || null;
  
  res.json({
    submitted: hasThisPlayerSubmitted || false,
    partnerSubmitted: hasPartnerSubmitted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed,
    playerMessage: isPlayer1 ? player1Message : player2Message,
    partnerMessage: isPlayer1 ? player2Message : player1Message
  });
});

// Generic day submission (handles days 3-8)
app.post('/api/day/:day/submit', async (req: Request, res: Response) => {
  const day = parseInt(req.params.day);
  const { roomId, playerId, data } = req.body;

  if (!roomId || !playerId || day < 1 || day > 8) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  let room = rooms.get(roomId.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[day - 1];
  if (!dayProgress.data) dayProgress.data = {};

  const isPlayer1 = room.player1?.id === playerId;

  if ([3, 5, 6].includes(day)) {
    if (isPlayer1) { dayProgress.data.player1Choice = data?.choice || data; dayProgress.data.player1Message = data?.message || ''; }
    else { dayProgress.data.player2Choice = data?.choice || data; dayProgress.data.player2Message = data?.message || ''; }
  } else if ([4, 7].includes(day)) {
    if (isPlayer1) dayProgress.data.player1Data = data;
    else dayProgress.data.player2Data = data;
  }

  let bothSubmitted = false;
  if (day === 2) bothSubmitted = dayProgress.data.player1Message && dayProgress.data.player2Message;
  else if ([3, 5, 6].includes(day)) bothSubmitted = dayProgress.data.player1Choice && dayProgress.data.player2Choice;
  else if ([4, 7].includes(day)) bothSubmitted = dayProgress.data.player1Data && dayProgress.data.player2Data;

  if (bothSubmitted) {
    const reflection = await generateReflection(day, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date();
    
    await saveRoom(room);
    rooms.set(roomId.toUpperCase(), room);
    
    io.to(roomId.toUpperCase()).emit('day-completed', { day, reflection, nextDayUnlocked: day < 8 });
  } else {
    rooms.set(roomId.toUpperCase(), room);
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day, action: 'submit-data' });
  }

  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null, partnerSubmitted: bothSubmitted });
});

// Generic day status
app.get('/api/day/:day/status', async (req: Request, res: Response) => {
  const day = parseInt(req.params.day);
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  let room = rooms.get(roomId?.toUpperCase());
  if (!room) {
    room = await loadRoomToMemory(roomId);
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[day - 1];
  const isPlayer1 = room.player1?.id === playerId;

  let hasThisPlayerSubmitted = false, hasPartnerSubmitted = false;
  let playerMessage: string | null = null;
  let partnerMessage: string | null = null;

  // For Day 8 (Valentine's Day), return all responses
  if (day === 8) {
    hasThisPlayerSubmitted = true; // Day 8 doesn't require both to submit
    hasPartnerSubmitted = dayProgress.completed;
    
    const responses = {
      player1: {
        name: room.player1?.name || 'Player 1',
        letter: dayProgress.data?.player1Letter || null,
        lantern: dayProgress.data?.player1Lantern || null,
        promises: dayProgress.data?.player1Promises || [],
        capsule: dayProgress.data?.player1Capsule || null,
      },
      player2: {
        name: room.player2?.name || 'Player 2',
        letter: dayProgress.data?.player2Letter || null,
        lantern: dayProgress.data?.player2Lantern || null,
        promises: dayProgress.data?.player2Promises || [],
        capsule: dayProgress.data?.player2Capsule || null,
      }
    };
    
    res.json({
      submitted: hasThisPlayerSubmitted || false,
      partnerSubmitted: hasPartnerSubmitted || false,
      reflection: dayProgress.aiReflection || null,
      completed: dayProgress.completed,
      playerMessage: null,
      partnerMessage: null,
      responses
    });
    return;
  }

  if (day === 2) {
    hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Message : !!dayProgress.data?.player2Message;
    hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Message : !!dayProgress.data?.player1Message;
    playerMessage = isPlayer1 ? dayProgress.data?.player1Message : dayProgress.data?.player2Message;
    partnerMessage = isPlayer1 ? dayProgress.data?.player2Message : dayProgress.data?.player1Message;
  } else if ([3, 5, 6].includes(day)) {
    hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Choice : !!dayProgress.data?.player2Choice;
    hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Choice : !!dayProgress.data?.player1Choice;
    // Combine choice + message for display
    const p1Entry = dayProgress.data?.player1Choice + (dayProgress.data?.player1Message ? ' - "' + dayProgress.data?.player1Message + '"' : '');
    const p2Entry = dayProgress.data?.player2Choice + (dayProgress.data?.player2Message ? ' - "' + dayProgress.data?.player2Message + '"' : '');
    playerMessage = isPlayer1 ? p1Entry : p2Entry;
    partnerMessage = isPlayer1 ? p2Entry : p1Entry;
  } else if ([4, 7].includes(day)) {
    const playerData = isPlayer1 ? dayProgress.data?.player1Data : dayProgress.data?.player2Data;
    const partnerData = isPlayer1 ? dayProgress.data?.player2Data : dayProgress.data?.player1Data;
    hasThisPlayerSubmitted = !!playerData;
    hasPartnerSubmitted = !!partnerData;
    
    // For Day 4 (Teddy Day): offering, receiving, message
    // For Day 7 (Hug Day): need, response
    let playerOffering, playerReceiving, playerMsg, partnerOffering, partnerReceiving, partnerMsg;
    
    if (day === 4) {
      playerOffering = playerData?.offering || null;
      playerReceiving = playerData?.receiving || null;
      playerMsg = playerData?.message || null;
      partnerOffering = partnerData?.offering || null;
      partnerReceiving = partnerData?.receiving || null;
      partnerMsg = partnerData?.message || null;
    } else {
      // Day 7 - Hug Day
      playerOffering = playerData?.need || null;  // Map 'need' to 'offering' for frontend compatibility
      playerReceiving = playerData?.response || null;  // Map 'response' to 'receiving'
      playerMsg = playerData?.message || null;
      partnerOffering = partnerData?.need || null;
      partnerReceiving = partnerData?.response || null;
      partnerMsg = partnerData?.message || null;
    }
    
    res.json({
      submitted: hasThisPlayerSubmitted || false,
      partnerSubmitted: hasPartnerSubmitted || false,
      reflection: dayProgress.aiReflection || null,
      completed: dayProgress.completed,
      playerOffering,
      playerReceiving,
      playerMessage: playerMsg,
      partnerOffering,
      partnerReceiving,
      partnerMessage: partnerMsg,
      // Also include Day 7 specific fields
      playerNeed: playerData?.need || null,
      playerResponse: playerData?.response || null,
      partnerNeed: partnerData?.need || null,
      partnerResponse: partnerData?.response || null
    });
    return;
  } else if (day === 8) {
    // Day 8 - Valentine's Day: Return all activities
    hasThisPlayerSubmitted = !!dayProgress.data?.completed;
    hasPartnerSubmitted = isPlayer1 
      ? !!dayProgress.data?.player2Letter 
      : !!dayProgress.data?.player1Letter;
    
    const p1Letter = dayProgress.data?.player1Letter || null;
    const p2Letter = dayProgress.data?.player2Letter || null;
    const p1Lantern = dayProgress.data?.player1Lantern || null;
    const p2Lantern = dayProgress.data?.player2Lantern || null;
    const p1Promises = dayProgress.data?.player1Promises || [];
    const p2Promises = dayProgress.data?.player2Promises || [];
    const p1Capsule = dayProgress.data?.player1Capsule || null;
    const p2Capsule = dayProgress.data?.player2Capsule || null;
    const p1Garden = dayProgress.data?.player1Garden || [];
    const p2Garden = dayProgress.data?.player2Garden || [];
    const p1Quiz = dayProgress.data?.player1Quiz || null;
    const p2Quiz = dayProgress.data?.player2Quiz || null;
    const p1Constellation = dayProgress.data?.player1Constellation || null;
    const p2Constellation = dayProgress.data?.player2Constellation || null;
    const p1Fortune = dayProgress.data?.player1Fortune || null;
    const p2Fortune = dayProgress.data?.player2Fortune || null;
    
    res.json({
      submitted: hasThisPlayerSubmitted || false,
      partnerSubmitted: hasPartnerSubmitted || false,
      reflection: dayProgress.aiReflection || null,
      completed: dayProgress.completed,
      // Full responses for summary
      responses: {
        player1: {
          name: room.player1?.name || 'Player 1',
          letter: isPlayer1 ? p1Letter : p2Letter,
          lantern: isPlayer1 ? p1Lantern : p2Lantern,
          promises: isPlayer1 ? p1Promises : p2Promises,
          capsule: isPlayer1 ? p1Capsule : p2Capsule,
          garden: isPlayer1 ? p1Garden : p2Garden,
          quiz: isPlayer1 ? p1Quiz : p2Quiz,
          constellation: isPlayer1 ? p1Constellation : p2Constellation,
          fortune: isPlayer1 ? p1Fortune : p2Fortune,
        },
        player2: {
          name: room.player2?.name || 'Player 2',
          letter: isPlayer1 ? p2Letter : p1Letter,
          lantern: isPlayer1 ? p2Lantern : p1Lantern,
          promises: isPlayer1 ? p2Promises : p1Promises,
          capsule: isPlayer1 ? p2Capsule : p1Capsule,
          garden: isPlayer1 ? p2Garden : p1Garden,
          quiz: isPlayer1 ? p2Quiz : p1Quiz,
          constellation: isPlayer1 ? p2Constellation : p1Constellation,
          fortune: isPlayer1 ? p2Fortune : p1Fortune,
        }
      }
    });
    return;
  }

  res.json({
    submitted: hasThisPlayerSubmitted || false,
    partnerSubmitted: hasPartnerSubmitted || false,
    reflection: dayProgress.aiReflection || null,
    completed: dayProgress.completed,
    playerMessage,
    partnerMessage
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  // Try to connect to MongoDB (optional - will work without it)
  const db = await connectToDatabase();
  
  httpServer.listen(PORT, () => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('💕 Valentine Week Server');
    console.log(`🌐 Running on http://localhost:${PORT}`);
    console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
    console.log(`💾 Storage: ${isMongoAvailable() ? 'MongoDB (persistent)' : 'Memory (non-persistent)'}`);
    console.log(`${'═'.repeat(60)}\n`);
  });
}

startServer();
