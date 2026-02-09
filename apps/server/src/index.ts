import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRoomId, generatePlayerId } from './utils';
import { setupSocketHandlers } from './socket/handlers';
import { generateAIReflection } from './services/ai';

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

// In-memory storage (exported for socket handlers)
export const rooms = new Map<string, any>();

// Clean markdown formatting
function cleanMarkdown(text: string): string {
  let cleaned = text.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/(?!\S)\*(\*?)(?!\S)/g, '');
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  cleaned = cleaned.replace(/^\s*[-*]{3,}\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*[•*+-]\s+/gm, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/^\s*$/gm, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

// Helper function to generate reflection using multi-AI system
async function generateReflection(day: number, dayData: any): Promise<string> {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[Day ${day}] 🎯 GENERATING REFLECTION`);
  console.log(`${'═'.repeat(50)}\n`);

  let prompt = '';
  const p1Name = dayData.player1Name || 'Player 1';
  const p2Name = dayData.player2Name || 'Player 2';

  if (day === 1) {
    prompt = `You are writing a heartfelt reflection for Rose Day.
${p1Name} and ${p2Name} just accepted a rose together.
Write a warm, poetic reflection under 80 words.`;
  } else if (day === 2) {
    prompt = `You are helping ${p1Name} and ${p2Name} reflect on Propose Day.
${p1Name} wrote: "${dayData.player1Message || ''}"
${p2Name} wrote: "${dayData.player2Message || ''}"
Format: ★ Love Percentage: XX% ☆ Star Rating: X/5 stars
Then heartfelt reflection.`;
  } else if (day === 3) {
    prompt = `${p1Name} and ${p2Name} shared Chocolate Day.
${p1Name} chose: "${dayData.player1Choice || ''}" - "${dayData.player1Message || ''}"
${p2Name} chose: "${dayData.player2Choice || ''}" - "${dayData.player2Message || ''}"
Give sweet ratings and warm feedback.`;
  } else if (day === 4) {
    prompt = `${p1Name} and ${p2Name} shared comfort styles.
${p1Name} offers: "${dayData.player1Data?.offering || ''}" receives: "${dayData.player1Data?.receiving || ''}"
${p2Name} offers: "${dayData.player2Data?.offering || ''}" receives: "${dayData.player2Data?.receiving || ''}"
Rate understanding and give warm feedback.`;
  } else if (day === 5) {
    prompt = `${p1Name} and ${p2Name} made promises.
${p1Name}: "${dayData.player1Data || ''}"
${p2Name}: "${dayData.player2Data || ''}"
Rate commitment and give sincere feedback.`;
  } else if (day === 6) {
    prompt = `${p1Name} and ${p2Name} expressed affection.
${p1Name}: "${dayData.player1Data || ''}"
${p2Name}: "${dayData.player2Data || ''}"
Rate affection and give tender feedback.`;
  } else if (day === 7) {
    prompt = `${p1Name} and ${p2Name} shared support needs.
${p1Name} needs: "${dayData.player1Data || ''}" ${p2Name} responded: "${dayData.player2Data || ''}"
${p2Name} needs: "${dayData.player2Data || ''}" ${p1Name} responded: "${dayData.player1Data || ''}"
Rate support and give warm feedback.`;
  } else if (day === 8 && Array.isArray(dayData)) {
    prompt = `Final reflection for Valentine's Day between ${p1Name} and ${p2Name}.
Give beautiful reflection about their complete journey. Under 150 words.`;
  }

  const p1Answer = dayData.player1Message || dayData.player1Data || dayData.player1Choice || '';
  const p2Answer = dayData.player2Message || dayData.player2Data || dayData.player2Choice || '';

  const reflection = await generateAIReflection(prompt, p1Answer, p2Answer, day);
  return cleanMarkdown(reflection);
}

// Socket.IO handlers
setupSocketHandlers(io);

// REST API endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/room/create', (req: Request, res: Response) => {
  const { playerName } = req.body;

  if (!playerName || playerName.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const roomId = generateRoomId();
  const playerId = generatePlayerId();

  const room = {
    id: roomId,
    player1: { id: playerId, name: playerName.trim(), joinedAt: new Date().toISOString() },
    player2: null,
    progress: Array.from({ length: 8 }, (_, i) => ({
      day: i + 1, completed: false, data: null, aiReflection: null, completedAt: null,
    })),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  };

  rooms.set(roomId, room);
  res.json({ roomId, playerId });
});

app.post('/api/room/join', (req: Request, res: Response) => {
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
    room.player1 = { id: playerId, name: trimmedName, joinedAt: new Date().toISOString() };
  } else {
    room.player2 = { id: playerId, name: trimmedName, joinedAt: new Date().toISOString() };
  }

  rooms.set(roomId.toUpperCase(), room);
  res.json({ roomId: roomId.toUpperCase(), playerId, rejoined: false });
});

app.get('/api/room/:roomId', (req: Request, res: Response) => {
  const room = rooms.get(req.params.roomId.toUpperCase());
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

  const room = rooms.get(roomId.toUpperCase());
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
    const reflection = await generateReflection(1, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    
    io.to(roomId.toUpperCase()).emit('day-completed', { day: 1, reflection, nextDayUnlocked: true });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 1, action: 'accept-rose' });
  }

  rooms.set(roomId.toUpperCase(), room);
  res.json({ completed: bothAccepted, reflection: bothAccepted ? dayProgress.aiReflection : null, partnerAccepted: bothAccepted });
});

// Day 1: Status
app.get('/api/day/1/status', (req: Request, res: Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  const room = rooms.get(roomId?.toUpperCase());
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

  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[1];
  if (!dayProgress.data) dayProgress.data = {};

  const isPlayer1 = room.player1?.id === playerId;
  if (isPlayer1) {
    dayProgress.data.player1Message = message;
    dayProgress.data.player1Name = room.player1.name;
  } else {
    dayProgress.data.player2Message = message;
    dayProgress.data.player2Name = room.player2?.name || 'Player 2';
  }

  const bothSubmitted = dayProgress.data.player1Message && dayProgress.data.player2Message;

  if (bothSubmitted) {
    const reflection = await generateReflection(2, dayProgress.data);
    dayProgress.completed = true;
    dayProgress.aiReflection = reflection;
    dayProgress.completedAt = new Date().toISOString();
    io.to(roomId.toUpperCase()).emit('day-completed', { day: 2, reflection, nextDayUnlocked: true });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day: 2, action: 'submit-message' });
  }

  rooms.set(roomId.toUpperCase(), room);
  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null, partnerSubmitted: bothSubmitted });
});

// Day 2: Status
app.get('/api/day/2/status', (req: Request, res: Response) => {
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  const room = rooms.get(roomId?.toUpperCase());
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

// Generic day submission
app.post('/api/day/:day/submit', async (req: Request, res: Response) => {
  const day = parseInt(req.params.day);
  const { roomId, playerId, data } = req.body;

  if (!roomId || !playerId || day < 1 || day > 8) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  const room = rooms.get(roomId.toUpperCase());
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
    dayProgress.completedAt = new Date().toISOString();
    io.to(roomId.toUpperCase()).emit('day-completed', { day, reflection, nextDayUnlocked: day < 8 });
  } else {
    io.to(roomId.toUpperCase()).emit('partner-acted', { playerId, day, action: 'submit-data' });
  }

  rooms.set(roomId.toUpperCase(), room);
  res.json({ completed: bothSubmitted, reflection: bothSubmitted ? dayProgress.aiReflection : null, partnerSubmitted: bothSubmitted });
});

// Generic day status
app.get('/api/day/:day/status', (req: Request, res: Response) => {
  const day = parseInt(req.params.day);
  const roomId = req.query.room as string;
  const playerId = req.query.playerId as string;

  const room = rooms.get(roomId?.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const dayProgress = room.progress[day - 1];
  const isPlayer1 = room.player1?.id === playerId;

  let hasThisPlayerSubmitted = false, hasPartnerSubmitted = false;
  let playerMessage: string | null = null;
  let partnerMessage: string | null = null;

  if (day === 2) {
    hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Message : !!dayProgress.data?.player2Message;
    hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Message : !!dayProgress.data?.player1Message;
    playerMessage = isPlayer1 ? dayProgress.data?.player1Message : dayProgress.data?.player2Message;
    partnerMessage = isPlayer1 ? dayProgress.data?.player2Message : dayProgress.data?.player1Message;
  } else if ([3, 5, 6].includes(day)) {
    hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Choice : !!dayProgress.data?.player2Choice;
    hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Choice : !!dayProgress.data?.player1Choice;
    playerMessage = isPlayer1 ? dayProgress.data?.player1Choice : dayProgress.data?.player2Choice;
    partnerMessage = isPlayer1 ? dayProgress.data?.player2Choice : dayProgress.data?.player1Choice;
  } else if ([4, 7].includes(day)) {
    hasThisPlayerSubmitted = isPlayer1 ? !!dayProgress.data?.player1Data : !!dayProgress.data?.player2Data;
    hasPartnerSubmitted = isPlayer1 ? !!dayProgress.data?.player2Data : !!dayProgress.data?.player1Data;
    playerMessage = isPlayer1 ? JSON.stringify(dayProgress.data?.player1Data) : JSON.stringify(dayProgress.data?.player2Data);
    partnerMessage = isPlayer1 ? JSON.stringify(dayProgress.data?.player2Data) : JSON.stringify(dayProgress.data?.player1Data);
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

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('💕 Valentine Week Server');
  console.log(`${'═'.repeat(60)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`${'═'.repeat(60)}\n`);
});
