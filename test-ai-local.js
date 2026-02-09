// Test AI APIs locally using environment variables
// Run: GEMINI_API_KEY=xxx OPENROUTER_API_KEY=yyy GROQ_API_KEY=zzz MINIMAX_API_KEY=aaa node test-ai-local.js

const https = require('https');

// Get API keys from environment
const keys = {
  gemini: process.env.GEMINI_API_KEY || '',
  openrouter: process.env.OPENROUTER_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
  minimax: process.env.MINIMAX_API_KEY || ''
};

console.log('═'.repeat(60));
console.log('🧪 TESTING AI APIs LOCALLY');
console.log('═'.repeat(60));
console.log('API Keys configured:');
console.log(`  Gemini:     ${keys.gemini ? '✓ (' + keys.gemini.substring(0, 8) + '...)' : '✗ Not set'}`);
console.log(`  OpenRouter: ${keys.openrouter ? '✓ (' + keys.openrouter.substring(0, 8) + '...)' : '✗ Not set'}`);
console.log(`  Groq:       ${keys.groq ? '✓ (' + keys.groq.substring(0, 8) + '...)' : '✗ Not set'}`);
console.log(`  MiniMax:    ${keys.minimax ? '✓ (' + keys.minimax.substring(0, 8) + '...)' : '✗ Not set'}`);
console.log('');

// Test Gemini
async function testGemini() {
  if (!keys.gemini) {
    console.log('🔄 Gemini: ⏭️ SKIPPED (no key)');
    return false;
  }
  console.log('🔄 Testing Gemini API...');
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say exactly: "Gemini is working!"' }] }]
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.candidates) {
      console.log('✅ Gemini SUCCESS[0]:', data.candidates?.content?.parts[0]?.text);
      return true;
    }
    throw new Error('No candidates');
  } catch (e) {
    console.log('❌ Gemini FAILED:', e.message);
    return false;
  }
}

// Test OpenRouter
async function testOpenRouter() {
  if (!keys.openrouter) {
    console.log('🔄 OpenRouter: ⏭️ SKIPPED (no key)');
    return false;
  }
  console.log('🔄 Testing OpenRouter API...');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.openrouter}`,
        'HTTP-Referer': 'https://valentine-day-sandy-seven.vercel.app',
        'X-Title': 'Valentine Week Test'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: 'Say exactly: "OpenRouter is working!"' }]
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.choices) {
      console.log('✅ OpenRouter SUCCESS:', data.choices[0]?.message?.content);
      return true;
    }
    throw new Error('No choices');
  } catch (e) {
    console.log('❌ OpenRouter FAILED:', e.message);
    return false;
  }
}

// Test Groq
async function testGroq() {
  if (!keys.groq) {
    console.log('🔄 Groq: ⏭️ SKIPPED (no key)');
    return false;
  }
  console.log('🔄 Testing Groq API...');
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.groq}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say exactly: "Groq is working!"' }],
        max_tokens: 50
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.choices) {
      console.log('✅ Groq SUCCESS:', data.choices[0]?.message?.content);
      return true;
    }
    throw new Error('No choices');
  } catch (e) {
    console.log('❌ Groq FAILED:', e.message);
    return false;
  }
}

// Test MiniMax
async function testMiniMax() {
  if (!keys.minimax) {
    console.log('🔄 MiniMax: ⏭️ SKIPPED (no key)');
    return false;
  }
  console.log('🔄 Testing MiniMax API...');
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keys.minimax}`
      },
      body: JSON.stringify({
        model: 'mini-max-m2.1',
        prompt: 'Say exactly: "MiniMax is working!"',
        max_tokens: 50
      })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.completion) {
      console.log('✅ MiniMax SUCCESS:', data.completion);
      return true;
    }
    throw new Error('No completion');
  } catch (e) {
    console.log('❌ MiniMax FAILED:', e.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('');
  const results = {
    gemini: await testGemini(),
    openrouter: await testOpenRouter(),
    groq: await testGroq(),
    minimax: await testMiniMax()
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('═'.repeat(60));
  
  let working = 0;
  for (const [api, success] of Object.entries(results)) {
    console.log(`${api.padEnd(12)}: ${success ? '✅ WORKING' : '❌ FAILED'}`);
    if (success) working++;
  }

  console.log(`\nTotal: ${working}/4 APIs working`);
  
  if (working === 0) {
    console.log('\n⚠️  No APIs working! Check your API keys.');
    console.log('Set keys like this:');
    console.log('  GEMINI_API_KEY=xxx node test-ai-local.js');
  } else {
    console.log('\n🎉 Your AI system is ready!');
  }
}

runTests();
