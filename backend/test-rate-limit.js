// Test file to verify express-rate-limit import
console.log('Testing express-rate-limit import...');

// Test file to verify express-rate-limit import
console.log('Testing express-rate-limit import...');

import('express-rate-limit').then(rateLimit => {
  console.log('✅ express-rate-limit imported successfully');
  
  // Test creating a limiter
  const limiter = rateLimit.default({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  console.log('✅ Rate limiter created successfully');
  console.log('Limiter:', typeof limiter);
}).catch(error => {
  console.error('❌ Failed to import express-rate-limit:', error);
  console.error('Error code:', error.code);
  console.error('Error path:', error.path);
});