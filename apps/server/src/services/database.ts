import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'valentine_week';

let client: MongoClient | null = null;
let db: Db | null = null;
let mongoAvailable = false;

// In-memory fallback storage
const memoryRooms = new Map<string, any>();

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

// Connect to MongoDB (optional)
export async function connectToDatabase(): Promise<Db | null> {
  if (db) return db;
  
  // If no MongoDB URI provided, use memory storage
  if (!MONGODB_URI) {
    console.log('ℹ️  No MongoDB URI found. Using in-memory storage.');
    mongoAvailable = false;
    return null;
  }
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    mongoAvailable = true;
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    try {
      await db.collection('rooms').createIndex({ id: 1 }, { unique: true });
      await db.collection('rooms').createIndex({ createdAt: 1 }, { expireAfterSeconds: 691200 }); // 8 days TTL
      await db.collection('rooms').createIndex({ 'player1.id': 1 });
      await db.collection('rooms').createIndex({ 'player2.id': 1 });
    } catch (indexError) {
      console.warn('Warning: Could not create indexes:', indexError);
    }
    
    return db;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed, using in-memory storage instead.');
    console.warn('   Set MONGODB_URI environment variable for persistent storage.');
    mongoAvailable = false;
    return null;
  }
}

// Check if MongoDB is available
export function isMongoAvailable(): boolean {
  return mongoAvailable;
}

// Get rooms collection (or throw if not available)
export function getRoomsCollection(): Collection<Room> {
  if (!db || !mongoAvailable) {
    throw new Error('MongoDB not available. Room operations cannot be persisted.');
  }
  return db.collection<Room>('rooms');
}

// Save room to database OR memory
export async function saveRoom(room: Room): Promise<void> {
  if (mongoAvailable && db) {
    try {
      const collection = getRoomsCollection();
      await collection.updateOne(
        { id: room.id },
        { $set: room },
        { upsert: true }
      );
    } catch (error) {
      console.warn('MongoDB save failed, using memory:', error);
      memoryRooms.set(room.id, room);
    }
  } else {
    memoryRooms.set(room.id, room);
  }
}

// Get room by ID from database OR memory
export async function getRoom(roomId: string): Promise<Room | null> {
  const id = roomId.toUpperCase();
  
  if (mongoAvailable && db) {
    try {
      const collection = getRoomsCollection();
      return await collection.findOne({ id });
    } catch (error) {
      console.warn('MongoDB get failed, using memory:', error);
      return memoryRooms.get(id) || null;
    }
  } else {
    return memoryRooms.get(id) || null;
  }
}

// Delete room from database OR memory
export async function deleteRoom(roomId: string): Promise<boolean> {
  const id = roomId.toUpperCase();
  
  if (mongoAvailable && db) {
    try {
      const collection = getRoomsCollection();
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.warn('MongoDB delete failed, using memory:', error);
      return memoryRooms.delete(id);
    }
  } else {
    return memoryRooms.delete(id);
  }
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
    mongoAvailable = false;
  }
}
