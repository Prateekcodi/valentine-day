// Complete End-to-End Test - Simulating Real User Journey
const http = require('http');

const API_URL = 'http://localhost:3001';

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function comprehensiveTest() {
  console.log('🧪 COMPREHENSIVE END-TO-END TEST\n');
  console.log('='.repeat(50));
  
  let allPassed = true;

  // Test 1: Health Check
  console.log('\n📡 SERVER TESTS');
  allPassed &= await test('1. Backend Health Check', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/health' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.status !== 'ok') throw new Error('Not ok');
  });

  // Test 2: Create Room
  console.log('\n🏠 ROOM TESTS');
  allPassed &= await test('2. Create Room', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/room/create',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { playerName: 'Prateek' });
    if (res.status !== 200) throw new Error(`Create failed: ${res.status}`);
    if (!res.data.roomId) throw new Error('No roomId');
    if (!res.data.playerId) throw new Error('No playerId');
    global.roomId = res.data.roomId;
    global.player1Id = res.data.playerId;
  });

  // Test 3: Join Room
  allPassed &= await test('3. Join Room', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/room/join',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerName: 'Nidhi' });
    if (res.status !== 200) throw new Error(`Join failed: ${res.status}`);
    if (!res.data.playerId) throw new Error('No playerId');
    global.player2Id = res.data.playerId;
  });

  // Test 4: Get Room
  allPassed &= await test('4. Get Room', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: `/api/room/${global.roomId}`
    });
    if (res.status !== 200) throw new Error('Room not found');
    if (!res.data.player1 || !res.data.player2) throw new Error('Both players not in room');
  });

  // Test 5: Rejoin
  allPassed &= await test('5. Rejoin (Prateek comes back)', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/room/join',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerName: 'Prateek' });
    if (res.status !== 200) throw new Error('Rejoin failed');
    if (!res.data.rejoined) throw new Error('Not marked as rejoined');
    if (res.data.playerId !== global.player1Id) throw new Error('Different playerId');
  });

  // Test 6: Room Full
  allPassed &= await test('6. Room Full Protection', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/room/join',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerName: 'Random' });
    if (res.status !== 400) throw new Error('Should reject');
    if (!res.data.error) throw new Error('No error message');
  });

  // Test 7: Day 1 - Accept Rose
  console.log('\n🌹 DAY 1 TESTS (Rose Day)');
  allPassed &= await test('7. Day 1 - Player 1 Accept', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/1/accept',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id });
    if (res.status !== 200) throw new Error('Accept failed');
    if (res.data.completed) throw new Error('Should not complete yet');
  });

  allPassed &= await test('8. Day 1 - Player 2 Accept', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/1/accept',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id });
    if (res.status !== 200) throw new Error('Accept failed');
    if (!res.data.completed) throw new Error('Should complete');
    if (!res.data.reflection) throw new Error('No reflection');
    console.log(`   Reflection: ${res.data.reflection.substring(0, 80)}...`);
  });

  allPassed &= await test('9. Day 1 - Status Check', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: `/api/day/1/status?room=${global.roomId}&playerId=${global.player1Id}`
    });
    if (res.status !== 200) throw new Error('Status check failed');
    if (!res.data.completed) throw new Error('Should be completed');
  });

  // Test 10: Day 2 - Propose Day
  console.log('\n💕 DAY 2 TESTS (Propose Day)');
  allPassed &= await test('10. Day 2 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/2/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, message: 'I love how we can be ourselves together' });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('11. Day 2 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/2/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, message: 'You make even boring days feel special' });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
    if (!res.data.reflection) throw new Error('No reflection');
    console.log(`   Reflection: ${res.data.reflection.substring(0, 80)}...`);
  });

  // Test 12: Day 3 - Chocolate Day
  console.log('\n🍫 DAY 3 TESTS (Chocolate Day)');
  allPassed &= await test('12. Day 3 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/3/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, choice: 'comfort', message: 'Like warm hug' });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('13. Day 3 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/3/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, choice: 'sweet', message: 'Just like you' });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
  });

  // Test 14: Day 4 - Teddy Day
  console.log('\n🧸 DAY 4 TESTS (Teddy Day)');
  allPassed &= await test('14. Day 4 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/4/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, day: 4, data: 'talk' });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('15. Day 4 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/4/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, day: 4, data: 'hugs' });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
  });

  // Test 16: Day 5 - Promise Day
  console.log('\n💍 DAY 5 TESTS (Promise Day)');
  allPassed &= await test('16. Day 5 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/5/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, day: 5, data: 'I promise to listen when you need to talk, and give space when you need it' });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('17. Day 5 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/5/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, day: 5, data: 'I promise to be honest with you, even when its hard' });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
  });

  // Test 18: Day 6 - Kiss Day
  console.log('\n💋 DAY 6 TESTS (Kiss Day)');
  allPassed &= await test('18. Day 6 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/6/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, day: 6, data: 'words|Every I love you means something' });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('19. Day 6 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/6/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, day: 6, data: 'time|Being with you is my happy place' });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
  });

  // Test 20: Day 7 - Hug Day
  console.log('\n🤗 DAY 7 TESTS (Hug Day)');
  allPassed &= await test('20. Day 7 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/7/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, day: 7, data: { need: 'Just hold me', response: 'I sit with you' } });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('21. Day 7 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/7/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, day: 7, data: { need: 'Tell me itll be ok', response: 'I remind you of your strength' } });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
  });

  // Test 22: Day 8 - Valentine's Day
  console.log('\n💝 DAY 8 TESTS (Valentine Day)');
  allPassed &= await test('22. Day 8 - Player 1 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/8/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player1Id, day: 8 });
    if (res.status !== 200) throw new Error('Submit failed');
  });

  allPassed &= await test('23. Day 8 - Player 2 Submit', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: '/api/day/8/submit',
      method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { roomId: global.roomId, playerId: global.player2Id, day: 8 });
    if (res.status !== 200) throw new Error('Submit failed');
    if (!res.data.completed) throw new Error('Should complete');
    if (!res.data.reflection) throw new Error('No final reflection');
    console.log(`   Final Reflection: ${res.data.reflection.substring(0, 100)}...`);
  });

  // Test 24: Check All Progress
  console.log('\n📊 FINAL PROGRESS CHECK');
  allPassed &= await test('24. All Days Completed', async () => {
    const res = await httpRequest({
      hostname: 'localhost', port: 3001, path: `/api/room/${global.roomId}`
    });
    const allComplete = res.data.progress.every((day, i) => day.completed);
    if (!allComplete) throw new Error('Not all days completed');
    
    console.log(`   Day Progress:`);
    res.data.progress.forEach(day => {
      const status = day.completed ? '✅' : '❌';
      console.log(`   ${status} Day ${day.day}: ${day.completed ? 'Complete' : 'Pending'}`);
    });
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n🎯 FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  console.log(`\n🏠 Room Code: ${global.roomId}`);
  console.log(`👤 Player 1: ${global.player1Id}`);
  console.log(`👤 Player 2: ${global.player2Id}`);
  console.log('\n🚀 Ready for Deployment!\n');
}

comprehensiveTest().catch(console.error);
