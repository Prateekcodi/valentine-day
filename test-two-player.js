const { chromium } = require('playwright');

async function testTwoPlayerFlow() {
  console.log('🧪 FULL TWO-PLAYER FLOW TEST\n');
  console.log('='.repeat(50));

  // Launch browser with two separate contexts
  const browser = await chromium.launch({ headless: true });
  const player1Context = await browser.newContext();
  const player2Context = await browser.newContext();

  const player1Page = await player1Context.newPage();
  const player2Page = await player2Context.newPage();

  // Error tracking
  const errors = [];
  player1Page.on('pageerror', e => errors.push({ player: 1, error: e.message }));
  player2Page.on('pageerror', e => errors.push({ player: 2, error: e.message }));

  try {
    // ==========================================
    // STEP 1: Player 1 - Open landing page
    // ==========================================
    console.log('\n📍 PLAYER 1: Opening landing page...');
    await player1Page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await player1Page.waitForTimeout(3000);
    console.log('   ✅ Page loaded');

    // ==========================================
    // STEP 2: Player 1 - Create room
    // ==========================================
    console.log('\n📍 PLAYER 1: Creating room...');
    await player1Page.fill('input[placeholder="Enter your name"]', 'Prateek');
    await player1Page.click('button:has-text("Create Room")');
    
    // Wait for navigation
    await player1Page.waitForURL(/\/room\//, { timeout: 15000 });
    const roomUrl = player1Page.url();
    const roomId = roomUrl.split('/room/')[1];
    console.log(`   ✅ Room created: ${roomId}`);

    // Get Player 1 ID
    const player1Id = await player1Page.evaluate(() => localStorage.getItem('playerId'));
    console.log(`   👤 Player 1 ID saved: ${player1Id?.substring(0, 20)}...`);

    // ==========================================
    // STEP 3: Player 2 - Open landing page
    // ==========================================
    console.log('\n📍 PLAYER 2: Opening landing page...');
    await player2Page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await player2Page.waitForTimeout(3000);
    console.log('   ✅ Page loaded');

    // ==========================================
    // STEP 4: Player 2 - Join room
    // ==========================================
    console.log('\n📍 PLAYER 2: Joining room...');
    await player2Page.click('button:has-text("Join Existing Room")');
    await player2Page.waitForTimeout(1000);
    await player2Page.fill('input[placeholder="Enter your name"]', 'Nidhi');
    await player2Page.fill('input[placeholder="Enter 6-character code"]', roomId);
    await player2Page.click('button:has-text("Join Room")');

    // Wait for navigation
    await player2Page.waitForURL(/\/room\//, { timeout: 15000 });
    console.log(`   ✅ Player 2 joined: ${roomId}`);

    const player2Id = await player2Page.evaluate(() => localStorage.getItem('playerId'));
    console.log(`   👤 Player 2 ID saved: ${player2Id?.substring(0, 20)}...`);

    // ==========================================
    // STEP 5: Both go to Day 1
    // ==========================================
    console.log('\n📍 BOTH PLAYERS: Navigating to Day 1...');
    await player1Page.goto(`http://localhost:3000/day/1?room=${roomId}`, { waitUntil: 'networkidle', timeout: 30000 });
    await player2Page.goto(`http://localhost:3000/day/1?room=${roomId}`, { waitUntil: 'networkidle', timeout: 30000 });
    
    await player1Page.waitForTimeout(3000);
    await player2Page.waitForTimeout(3000);
    console.log('   ✅ Both on Day 1');

    // ==========================================
    // STEP 6: Player 1 accepts
    // ==========================================
    console.log('\n📍 PLAYER 1: Accepting rose...');
    const p1AcceptBtn = player1Page.locator('button:has-text("Accept This Rose")');
    const p1AcceptVisible = await p1AcceptBtn.isVisible().catch(() => false);
    
    if (p1AcceptVisible) {
      await p1AcceptBtn.click();
      console.log('   ✅ Player 1 clicked Accept');
      await player1Page.waitForTimeout(2000);
    } else {
      console.log('   ⚠️ Accept button not visible for Player 1');
    }

    // ==========================================
    // STEP 7: Player 2 accepts
    // ==========================================
    console.log('\n📍 PLAYER 2: Accepting rose...');
    const p2AcceptBtn = player2Page.locator('button:has-text("Accept This Rose")');
    const p2AcceptVisible = await p2AcceptBtn.isVisible().catch(() => false);
    
    if (p2AcceptVisible) {
      await p2AcceptBtn.click();
      console.log('   ✅ Player 2 clicked Accept');
      await player2Page.waitForTimeout(2000);
    } else {
      console.log('   ⚠️ Accept button not visible for Player 2');
    }

    // ==========================================
    // STEP 8: Verify completion via API
    // ==========================================
    console.log('\n📍 VERIFYING: Checking completion status...');
    
    const response = await player1Page.evaluate(async (rId) => {
      const res = await fetch(`http://localhost:3001/api/room/${rId}`);
      return res.json();
    }, roomId);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`\n📍 Room: ${response.id}`);
    console.log(`👤 Player 1: ${response.player1.name}`);
    console.log(`👤 Player 2: ${response.player2.name}`);
    console.log(`\n🌹 Day 1: ${response.progress[0].completed ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    
    if (response.progress[0].aiReflection) {
      console.log(`\n💬 "${response.progress[0].aiReflection}"`);
    }

    console.log('\n' + '='.repeat(50));
    
    if (response.progress[0].completed) {
      console.log('🎉 TWO-PLAYER FLOW TEST - SUCCESS!');
    } else {
      console.log('⚠️ Day not marked complete');
    }
    
    console.log('='.repeat(50) + '\n');

    // Report errors
    if (errors.length > 0) {
      console.log('❌ Page Errors:');
      errors.forEach(e => console.log(`   Player ${e.player}: ${e.error}`));
    } else {
      console.log('✅ No page errors');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Test complete - browser closed');
  }
}

testTwoPlayerFlow();
