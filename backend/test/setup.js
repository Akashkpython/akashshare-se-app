import mongoose from 'mongoose';
import { connectToMongoDB } from '../mongo-connection.js';

// Set test environment
process.env.NODE_ENV = 'test';

// Use the Atlas URI from user
process.env.MONGO_URI = 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/akashshare_test?retryWrites=true&w=majority&appName=akashshare';

// Only enable rate limiting for rate limiting tests
if (process.argv.includes('--grep') && process.argv.includes('rate limiting')) {
  process.env.ENABLE_RATE_LIMIT_TEST = 'true';
} else {
  process.env.ENABLE_RATE_LIMIT_TEST = 'false';
}

// Export Mocha root hooks
export const mochaHooks = {
  async beforeAll() {
    this.timeout(60000); // Increase timeout for Atlas connection
    console.log('🔄 Connecting to MongoDB Atlas for tests...');
    try {
      await connectToMongoDB(process.env.MONGO_URI);
      console.log('✅ MongoDB Atlas connected for tests');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB Atlas:', error);
      throw error;
    }
  },

  async afterAll() {
    console.log('🔄 Closing MongoDB Atlas connection...');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB Atlas connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  },

  async afterEach() {
    if (mongoose.connection.readyState === 1) {
      try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          await collections[key].deleteMany({});
        }
      } catch (error) {
        console.error('❌ Error cleaning up database:', error);
      }
    }
  }
};
