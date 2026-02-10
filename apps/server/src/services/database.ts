import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'valentine_week';

let client: MongoClient | null = null;
let db: Db | null = null;

// Room interface
export interface Room {
  _id?: ObjectId;
  id: string;
  player1: {
    id: string;
    name: string;
    joinedAt: Date;
  } | null;
  player2: {
    id: string;
    name: string;
    joinedAt: Date;
  } | null;
  progress: DayProgress[];
  createdAt: Date;
  expiresAt: Date;
}

export interface DayProgress {
  day: number;
  completed: boolean;
  data: any;
  aiReflection?: string;
  completedAt?: Date;
}

// Connect to MongoDB
export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    await db.collection('rooms').createIndex({ id: 1 }, { unique: true });
    await db.collection('rooms').createIndex({ createdAt: 1 }, { expireAfterSeconds: 691200 }); // 8 days TTL
    await db.collection('rooms').createIndex({ 'player1.id': 1 });
    await db.collection('rooms').createIndex({ 'player2.id': 1 });
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Get rooms collection
export function getRoomsCollection(): Collection<Room> {
  if (!db) throw new Error('Database not connected');
  return db.collection<Room>('rooms');
}

// Save room to database
export async function saveRoom(room: Room): Promise<void> {
  const collection = getRoomsCollection();
  await collection.updateOne(
    { id: room.id },
    { $set: room },
    { upsert: true }
  );
}

// Get room by ID
export async function getRoom(roomId: string): Promise<Room | null> {
  const collection = getRoomsCollection();
  return await collection.findOne({ id: roomId.toUpperCase() });
}

// Delete room
export async function deleteRoom(roomId: string): Promise<boolean> {
  const collection = getRoomsCollection();
  const result = await collection.deleteOne({ id: roomId.toUpperCase() });
  return result.deletedCount > 0;
}

// Initialize room progress
export function initializeProgress(): DayProgress[] {
  return Array.from({ length: 8 }, (_, i) => ({
    day: i + 1,
    completed: false,
    data: null
  }));
}

// Close connection
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
