// Shared TypeScript types for Valentine Week

export interface Player {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface Room {
  id: string;
  player1: Player | null;
  player2: Player | null;
  progress: DayProgress[];
  createdAt: Date;
  expiresAt: Date;
}

export interface DayProgress {
  day: number;
  completed: boolean;
  data: DayData | null;
  aiReflection?: string;
  completedAt?: Date;
}

export interface DayData {
  // Day 1 - Rose Day
  roseAccepted?: { [playerId: string]: boolean };
  
  // Day 2 - Propose Day
  messages?: { [playerId: string]: string };
  
  // Day 3 - Chocolate Day
  chocolateChoice?: { [playerId: string]: ChocolateChoice };
  
  // Day 4 - Teddy Day
  comfortStyle?: { [playerId: string]: ComfortStyle };
  
  // Day 5 - Promise Day
  promise?: { [playerId: string]: PromiseChoice };
  
  // Day 6 - Kiss Day
  affectionStyle?: { [playerId: string]: AffectionStyle };
  
  // Day 7 - Hug Day
  supportPreference?: { [playerId: string]: SupportPreference };
  supportResponse?: { [playerId: string]: string };
  
  // Day 8 - Valentine's Day
  final?: {
    personalMessage?: string;
    celebration?: boolean;
  };
}

export interface ChocolateChoice {
  type: 'comfort' | 'sweet' | 'dark' | 'surprise';
  reasoning?: string;
}

export interface ComfortStyle {
  offering: 'talk' | 'silence' | 'distraction' | 'reassurance';
  receiving: 'talk' | 'silence' | 'distraction' | 'reassurance';
}

export interface PromiseChoice {
  value: 'patience' | 'honesty' | 'respect' | 'consistency';
  commitment: string;
}

export interface AffectionStyle {
  primary: 'words' | 'time' | 'support' | 'care';
  example: string;
}

export interface SupportPreference {
  need: string;
}

// Socket events
export interface ServerToClientEvents {
  'room-state': (room: Room) => void;
  'partner-joined': (player: Player) => void;
  'partner-acted': (data: { playerId: string; day: number; action: string }) => void;
  'day-completed': (data: { day: number; reflection: string; nextDayUnlocked: boolean }) => void;
  'partner-message': (data: { type: string; payload: any }) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { playerName: string }, callback: (response: { roomId: string; playerId: string } | { error: string }) => void) => void;
  'join-room': (data: { roomId: string; playerName: string }, callback: (response: { roomId: string; playerId: string } | { error: string }) => void) => void;
  'day-action': (data: { day: number; action: string; data: any }, callback: (response: { error?: string } | { reflection?: string; completed?: boolean }) => void) => void;
}

export interface DayInfo {
  day: number;
  name: string;
  theme: string;
  description: string;
  emoji: string;
}

export const DAYS: DayInfo[] = [
  { day: 1, name: 'Rose Day', theme: 'rose', description: 'A quiet beginning', emoji: '🌹' },
  { day: 2, name: 'Propose Day', theme: 'propose', description: 'One honest sentence', emoji: '💌' },
  { day: 3, name: 'Chocolate Day', theme: 'chocolate', description: 'Sweet choices', emoji: '🍫' },
  { day: 4, name: 'Teddy Day', theme: 'teddy', description: 'Comfort & care', emoji: '🧸' },
  { day: 5, name: 'Promise Day', theme: 'promise', description: 'Real commitments', emoji: '💫' },
  { day: 6, name: 'Kiss Day', theme: 'kiss', description: 'Love languages', emoji: '💋' },
  { day: 7, name: 'Hug Day', theme: 'hug', description: 'Emotional support', emoji: '🤗' },
  { day: 8, name: "Valentine's Day", theme: 'valentine', description: 'The final celebration', emoji: '💝' },
];
