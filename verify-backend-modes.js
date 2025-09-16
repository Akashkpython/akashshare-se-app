#!/usr/bin/env node

/**
 * Verification script for Akash Share backend modes
 * Tests both local and public backend connectivity
 */

import http from 'http';
import https from 'https';

// Backend URLs to test
const BACKEND_URLS = {
  public: "https://akash-share-backend.onrender.com",
  local: "http://localhost:5004"
};

// Test function for backend connectivity
async function testBackend(mode, url) {
  console.log(`\n🔍 Testing ${mode} backend at ${url}...`);
  
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`✅ ${mode} backend is accessible`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(jsonData)}`);
            resolve(true);
          } else {
            console.log(`⚠️  ${mode} backend returned status ${res.statusCode}`);
            console.log(`   Response: ${data}`);
            resolve(false);
          }
        } catch (parseError) {
          console.log(`⚠️  ${mode} backend returned non-JSON response`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(res.statusCode === 200);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${mode} backend is not accessible`);
      console.log(`   Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${mode} backend request timed out`);
      req.destroy();
      resolve(false);
    });
    
    req.setTimeout(5000); // 5 second timeout
  });
}

// Test both backends
async function verifyBackends() {
  console.log('🧪 Akash Share Backend Mode Verification');
  console.log('========================================');
  
  const results = {
    public: await testBackend('public', BACKEND_URLS.public),
    local: await testBackend('local', BACKEND_URLS.local)
  };
  
  console.log('\n📊 Verification Results:');
  console.log('======================');
  
  if (results.public) {
    console.log('✅ Public backend is working correctly');
  } else {
    console.log('❌ Public backend is not accessible');
  }
  
  if (results.local) {
    console.log('✅ Local backend is working correctly');
  } else {
    console.log('❌ Local backend is not accessible');
  }
  
  if (results.public || results.local) {
    console.log('\n🎉 At least one backend is accessible. Application should work.');
  } else {
    console.log('\n💥 No backends are accessible. Please check your network configuration.');
  }
  
  return results;
}

// Run verification if script is executed directly
// Fixed the condition to work properly in different environments
if (process.argv[1] && process.argv[1].endsWith('verify-backend-modes.js')) {
  verifyBackends().then(() => {
    console.log('\n✅ Verification complete');
  }).catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
} else if (import.meta.url && import.meta.url === `file://${process.argv[1]}`) {
  verifyBackends().then(() => {
    console.log('\n✅ Verification complete');
  }).catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
}

export default verifyBackends;