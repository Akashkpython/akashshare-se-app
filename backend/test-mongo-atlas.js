// Test MongoDB Atlas Connection
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('🔗 Connection String:', process.env.MONGO_URI.replace(/:[^:]*@/, ':****@')); // Hide password

// Validate connection string
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

if (process.env.MONGO_URI.includes('<password>')) {
  console.error('❌ Placeholder value detected in MONGO_URI. Please replace <password> with actual password.');
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
  
  // List collections to verify database access
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`📋 Found ${collections.length} collections:`);
  collections.forEach(collection => {
    console.log(`   - ${collection.name}`);
  });
  
  // Close connection
  await mongoose.connection.close();
  console.log('🔒 Connection closed.');
  console.log('🎉 MongoDB Atlas test completed successfully!');
})
.catch(err => {
  console.error('❌ MongoDB Atlas connection failed:');
  console.error('   Error:', err.message);
  
  // Provide troubleshooting tips
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Check your internet connection');
  console.log('   2. Verify the connection string is correct');
  console.log('   3. Ensure the MongoDB Atlas cluster is running');
  console.log('   4. Check if IP whitelist includes your current IP');
  console.log('   5. Verify username and password are correct');
  process.exit(1);
});