// Test OpenRouter API Connection
// Run: node test-openrouter.js <YOUR_API_KEY>

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('❌ Usage: node test-openrouter.js <YOUR_OPENROUTER_API_KEY>');
  console.log('   Get API key from: https://openrouter.ai/');
  process.exit(1);
}

console.log('🔄 Testing OpenRouter API...');
console.log('API Key:', apiKey.substring(0, 10) + '...\n');

const postData = JSON.stringify({
  model: 'anthropic/claude-3-haiku', // Free model
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: 'Say hello and tell me you are working!'
    }
  ]
});

const options = {
  hostname: 'openrouter.ai',
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(postData),
    'HTTP-Referer': 'https://valentine-day-sandy-seven.vercel.app',
    'X-Title': 'Valentine Week'
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
        console.log('✅ SUCCESS! OpenRouter API is working!');
        console.log('\nResponse:');
        console.log(response.choices?.[0]?.message?.content || JSON.stringify(response, null, 2));
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
