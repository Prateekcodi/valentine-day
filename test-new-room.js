const { chromium } = require('playwright');

async function testNewRoomAPI() {
  console.log('🧪 Testing NEW room creation and Rose Day completion via API...\n');

  const browser = await chromium.launch({ headless: true });

  // Create two separate browser contexts for two players
  const player1Context = await browser.newContext();
  const player2Context = await browser.newContext();

  const player1Page = await player1Context.newPage();
  const player2Page = await player2Context.newPage();

  // Collect console errors
  const player1Errors = [];
  const player2Errors = [];

  player1Page.on('pageerror', error => player1Errors.push(error.message));
  player2Page.on('pageerror', error => player2Errors.push(error.message));

  try {
    // ==========================================
    // STEP 1: Player 1 creates a room via API
    // ==========================================
    console.log('📝 Step 1: Player 1 creates a room...');
    await player1Page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await player1Page.waitForTimeout(2000);

    // Execute API call directly in browser context
    const createResult = await player1Page.evaluate(async () => {
      const res = await fetch('http://localhost:3001/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'Player1' })
      });
      return res.json();
    });

    const roomId = createResult.roomId;
    const player1Id = createResult.playerId;
    console.log(`   ✅ Room created: ${roomId}`);
    console.log(`   👤 Player 1 ID: ${player1Id}`);

    // Save to localStorage
    await player1Page.evaluate(([rId, p1Id]) => {
      localStorage.setItem('roomId', rId);
      localStorage.setItem('playerId', p1Id);
      localStorage.setItem('playerName', 'Player1');
    }, [roomId, player1Id]);

    // ==========================================
    // STEP 2: Player 2 joins the room via API
    // ==========================================
    console.log('\n📝 Step 2: Player 2 joins the room...');
    await player2Page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await player2Page.waitForTimeout(2000);

    const joinResult = await player2Page.evaluate(async (rId) => {
      const res = await fetch('http://localhost:3001/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rId, playerName: 'Player2' })
      });
      return res.json();
    }, roomId);

    const player2Id = joinResult.playerId;
    console.log(`   ✅ Player 2 joined room: ${roomId}`);
    console.log(`   👤 Player 2 ID: ${player2Id}`);

    // Save to localStorage
    await player2Page.evaluate(([rId, p2Id]) => {
      localStorage.setItem('roomId', rId);
      localStorage.setItem('playerId', p2Id);
      localStorage.setItem('playerName', 'Player2');
    }, [roomId, player2Id]);

    // ==========================================
    // STEP 3: Both players navigate to Day 1
    // ==========================================
    console.log('\n📝 Step 3: Both players navigate to Day 1...');
    await player1Page.goto(`http://localhost:3000/day/1?room=${roomId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await player2Page.goto(`http://localhost:3000/day/1?room=${roomId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });

    await player1Page.waitForTimeout(3000);
    await player2Page.waitForTimeout(3000);

    // Check for Accept button
    const p1HasButton = await player1Page.locator('button:has-text("Accept This Rose")').count();
    const p2HasButton = await player2Page.locator('button:has-text("Accept This Rose")').count();
    console.log(`   ✅ Player 1 sees Accept button: ${p1HasButton > 0 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Player 2 sees Accept button: ${p2HasButton > 0 ? 'YES' : 'NO'}`);

    // ==========================================
    // STEP 4: Player 1 accepts via API
    // ==========================================
    console.log('\n📝 Step 4: Player 1 accepts the rose...');
    await player1Page.evaluate(async ([rId, p1Id]) => {
      await fetch('http://localhost:3001/api/day/1/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rId, playerId: p1Id })
      });
    }, [roomId, player1Id]);

    await player1Page.waitForTimeout(2000);

    // Check status
    const p1State = await player1Page.evaluate(async (rId) => {
      const res = await fetch(`http://localhost:3001/api/room/${rId}`);
      return res.json();
    }, roomId);

    if (p1State.progress[0].data?.player1Accepted) {
      console.log('   ✅ Player 1: Rose accepted');
    }
    if (!p1State.progress[0].completed) {
      console.log('   ⏳ Waiting for Player 2...');
    }

    // ==========================================
    // STEP 5: Player 2 accepts via API
    // ==========================================
    console.log('📝 Step 5: Player 2 accepts the rose...');
    await player2Page.evaluate(async ([rId, p2Id]) => {
      await fetch('http://localhost:3001/api/day/1/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rId, playerId: p2Id })
      });
    }, [roomId, player2Id]);

    await player2Page.waitForTimeout(2000);

    // ==========================================
    // STEP 6: Verify completion
    // ==========================================
    console.log('\n📝 Step 6: Verifying completion...');

    const finalState = await player1Page.evaluate(async (rId) => {
      const res = await fetch(`http://localhost:3001/api/room/${rId}`);
      return res.json();
    }, roomId);

    console.log(`\n   📍 Room: ${finalState.id}`);
    console.log(`   👤 Player 1: ${finalState.player1.name}`);
    console.log(`   👤 Player 2: ${finalState.player2.name}`);
    console.log(`   🌹 Day 1: ${finalState.progress[0].completed ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    if (finalState.progress[0].aiReflection) {
      console.log(`   💬 "${finalState.progress[0].aiReflection}"`);
    }

    // ==========================================
    // FINAL RESULTS
    // ==========================================
    console.log('\n========================================');
    if (finalState.progress[0].completed) {
      console.log('🎉 NEW ROOM TEST - SUCCESS!');
      console.log('========================================\n');
      console.log(`📍 Room Code: ${roomId}`);
      console.log(`🌹 Rose Day: COMPLETE`);
      console.log(`💬 AI Reflection Generated`);
    } else {
      console.log('⚠️ Day not marked complete');
    }

    // Report errors
    if (player1Errors.length > 0) {
      console.log('\n❌ Player 1 page errors:', player1Errors);
    }
    if (player2Errors.length > 0) {
      console.log('❌ Player 2 page errors:', player2Errors);
    }
    if (player1Errors.length === 0 && player2Errors.length === 0) {
      console.log('✅ No page errors from either player');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNewRoomAPI();
