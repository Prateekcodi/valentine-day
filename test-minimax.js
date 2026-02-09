// Test MiniMax API Connection
// Run: node test-minimax.js

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('❌ Usage: node test-minimax.js <YOUR_MINIMAX_API_KEY>');
  console.log('   Get API key from: https://www.minimaxi.com/');
  process.exit(1);
}

console.log('🔄 Testing MiniMax API...');
console.log('API Key:', apiKey.substring(0, 5) + '...\n');

const postData = JSON.stringify({
  model: 'MiniMax-M2.1',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: 'Say hello and tell me you are working!'
    }
  ]
});

const options = {
  hostname: 'api.minimax.io',
  path: '/anthropic/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(postData)
  }
 };

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('✅ SUCCESS! MiniMax API is working!');
        console.log('\nResponse:');
        console.log(response.content?.[0]?.text || JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('✅ API responded (check response below):');
        console.log(data);
      }
    } else {
      console.log('❌ FAILED!');
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
});

req.write(postData);
req.end();
