import http from 'http';

console.log('🔍 Checking main application response...');

const req = http.get('http://localhost:5004', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content Length: ${data.length}`);
    console.log(`Content Type: ${res.headers['content-type']}`);
    console.log(`First 500 characters: ${data.substring(0, 500)}`);
    
    if (data.includes('<title>Akash Share</title>')) {
      console.log('✅ Main application is serving frontend correctly');
    } else if (data.includes('Akash Share')) {
      console.log('✅ Main application appears to be serving content with "Akash Share"');
    } else {
      console.log('❌ Main application is not serving expected content');
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Main application is not responding:', err.message);
});

req.setTimeout(5000, () => {
  console.log('❌ Main application timeout');
  req.destroy();
});