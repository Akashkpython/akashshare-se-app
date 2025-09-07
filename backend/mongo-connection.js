import mongoose from 'mongoose';

const connectToMongoDB = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;
  const startTime = Date.now();
  const MAX_RETRY_TIME = 5 * 60 * 1000; // 5 minutes maximum retry time
  
  while (retries < maxRetries && (Date.now() - startTime) < MAX_RETRY_TIME) {
    try {
      console.log(`🔗 Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);
      
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0 // Disable mongoose buffering
      });
      
      console.log('✅ Connected to MongoDB successfully');
      
      // Add connection event listeners for better monitoring
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });
      
      return;
    } catch (error) {
      retries++;
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ MongoDB Connection Error (attempt ${retries}/${maxRetries}, elapsed: ${Math.round(elapsedTime/1000)}s):`, error.message);
      
      if (retries >= maxRetries || elapsedTime >= MAX_RETRY_TIME) {
        console.error('❌ Max retries reached or timeout exceeded. Could not connect to MongoDB.');
        throw error;
      }
      
      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Exponential backoff: increase delay for next retry
      retryDelay = Math.min(retryDelay * 1.5, 30000); // Cap at 30 seconds
    }
  }
  
  // If we exit the loop without connecting, throw an error
  throw new Error('MongoDB connection failed: Maximum retry time exceeded');
};

export default connectToMongoDB;
