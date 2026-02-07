import { Server, Socket } from 'socket.io';
import { rooms } from '../index';
import { formatPrompt } from '../utils';
import { generateAIReflection } from '../services/ai';

interface DayActionData {
  roomId: string;
  playerId: string;
  day: number;
  action: string;
  data: any;
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    // Join room
    socket.on('join-room', ({ roomId, playerId }) => {
      socket.join(roomId);
      
      const room = rooms.get(roomId);
      if (room) {
        socket.emit('room-state', room);
        
        // Notify partner
        socket.to(roomId).emit('partner-joined', {
          playerId,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Day action
    socket.on('day-action', async ({ roomId, playerId, day, action, data }: DayActionData) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      const dayIndex = day - 1;
      const dayProgress = room.progress[dayIndex];
      
      if (!dayProgress.data) {
        dayProgress.data = {};
      }
      
      // Store player's action
      if (action === 'accept-rose') {
        const isPlayer1 = room.player1?.id === playerId;
        if (isPlayer1) {
          dayProgress.data.player1Accepted = true;
        } else {
          dayProgress.data.player2Accepted = true;
        }
      } else if (action === 'submit-message') {
        const isPlayer1 = room.player1?.id === playerId;
        if (isPlayer1) {
          dayProgress.data.player1Message = data.message;
        } else {
          dayProgress.data.player2Message = data.message;
        }
      } else {
        // Generic action storage
        dayProgress.data[playerId] = { action, ...data };
      }
      
      // Check if both completed
      const bothCompleted = checkDayCompletion(day, dayProgress.data);
      
      if (bothCompleted) {
        // Generate AI reflection
        try {
          const prompt = formatPrompt(day, dayProgress.data);
          
          // Get both players' answers for personalized reflection
          const player1Answer = dayProgress.data.player1Message || 
                               dayProgress.data.player1Choice ||
                               dayProgress.data.player1Style ||
                               dayProgress.data.player1Promise ||
                               dayProgress.data.player1Affection ||
                               dayProgress.data.player1Support ||
                               dayProgress.data.player1Accepted ? 'Accepted the rose' : '';
                               
          const player2Answer = dayProgress.data.player2Message || 
                               dayProgress.data.player2Choice ||
                               dayProgress.data.player2Style ||
                               dayProgress.data.player2Promise ||
                               dayProgress.data.player2Affection ||
                               dayProgress.data.player2Support ||
                               dayProgress.data.player2Accepted ? 'Accepted the rose' : '';
          
          const reflection = await generateAIReflection(prompt, player1Answer, player2Answer, day);
          
          dayProgress.completed = true;
          dayProgress.aiReflection = reflection;
          dayProgress.completedAt = new Date().toISOString();
          
          // Notify both players
          io.to(roomId).emit('day-completed', {
            day,
            reflection,
            nextDayUnlocked: day < 8
          });
        } catch (error) {
          console.error('Failed to generate reflection:', error);
          socket.emit('error', { message: 'Failed to generate reflection' });
        }
      } else {
        // Notify partner of action
        socket.to(roomId).emit('partner-acted', {
          playerId,
          day,
          action
        });
      }
      
      rooms.set(roomId, room);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function checkDayCompletion(day: number, data: any): boolean {
  switch (day) {
    case 1: // Rose Day
      return data.player1Accepted && data.player2Accepted;
    case 2: // Propose Day
      return data.player1Message && data.player2Message;
    case 3: // Chocolate Day
      return data.player1Choice && data.player2Choice;
    case 4: // Teddy Day
      return data.player1Style && data.player2Style;
    case 5: // Promise Day
      return data.player1Promise && data.player2Promise;
    case 6: // Kiss Day
      return data.player1Affection && data.player2Affection;
    case 7: // Hug Day
      return data.player1Support && data.player2Support;
    case 8: // Valentine's Day
      return true; // Final day
    default:
      return false;
  }
}
