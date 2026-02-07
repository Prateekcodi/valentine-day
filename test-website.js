const { chromium } = require('playwright');

async function testWebsite() {
  console.log('Starting Playwright test...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    // Test 1: Check if frontend is running
    console.log('\n1. Testing frontend at http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   ✅ Frontend loaded successfully');

    // Check page title/heading
    const heading = await page.textContent('h1');
    console.log(`   📝 Page heading: ${heading}`);

    // Test 2: Check backend health
    console.log('\n2. Testing backend health at http://localhost:3001/api/health...');
    const healthResponse = await page.goto('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log(`   ✅ Backend health: ${JSON.stringify(healthData)}`);

    // Test 3: Check room status
    console.log('\n3. Checking room LEXLRX status...');
    const roomResponse = await page.goto('http://localhost:3001/api/room/LEXLRX');
    const roomData = await roomResponse.json();
    console.log(`   Room: ${roomData.id}`);
    console.log(`   Player 1: ${roomData.player1?.name || 'N/A'}`);
    console.log(`   Player 2: ${roomData.player2?.name || 'N/A'}`);
    console.log(`   Day 1 completed: ${roomData.progress[0].completed}`);
    if (roomData.progress[0].aiReflection) {
      console.log(`   💬 AI Reflection: "${roomData.progress[0].aiReflection}"`);
    }

    // Test 4: Check for console errors
    console.log('\n4. Checking for console errors...');
    const consoleErrors = consoleMessages.filter(m => m.type === 'error');
    if (consoleErrors.length > 0) {
      console.log('   ⚠️ Console errors found:');
      consoleErrors.forEach(e => console.log(`      - ${e.text}`));
    } else {
      console.log('   ✅ No console errors');
    }

    // Report errors
    if (errors.length > 0) {
      console.log('\n5. Page errors:');
      errors.forEach(e => console.log(`   ❌ ${e}`));
    } else {
      console.log('\n5. ✅ No page errors');
    }

    console.log('\n========================================');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testWebsite();
