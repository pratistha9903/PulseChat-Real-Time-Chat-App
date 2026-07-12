import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulsechat';
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('.mongodb.net');
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected → database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    return;
  } catch (err) {
    if (isAtlas || process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to MongoDB Atlas. Data will NOT persist.');
      console.error('Check your MONGODB_URI, username, password, and Network Access in Atlas.');
      throw new Error(`MongoDB connection failed: ${err.message}`);
    }

    console.warn('Local MongoDB unavailable — starting in-memory database (dev only)');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri('pulsechat');
    await mongoose.connect(memUri);
    console.log('In-memory MongoDB ready (data resets on restart — not for production)');
  }
}

export default connectDB;
