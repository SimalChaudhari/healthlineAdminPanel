import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME || 'healthline';

if (!MONGODB_URL) {
  throw new Error('MONGODB_URL is not set');
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Don't cache a failed connect — on Vercel the warm function would fail every request after one glitch.
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
