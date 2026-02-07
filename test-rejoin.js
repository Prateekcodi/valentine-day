// Test rejoin functionality
const http = require('http');

async function testRejoin() {
  console.log('🔄 Testing Rejoin Functionality...\n');

  // Step 1: Create a room
  console.log('1️⃣ Creating room with Prateek...');
  const createRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/room/create',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ playerName: 'Prateek' }));
    req.end();
  });

  const roomId = createRes.roomId;
  const player1Id = createRes.playerId;
  console.log(`   ✅ Room created: ${roomId}`);
  console.log(`   ✅ Player 1 ID: ${player1Id}\n`);

  // Step 2: Join as Nidhi
  console.log('2️⃣ Joining as Nidhi...');
  const joinRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/room/join',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ roomId, playerName: 'Nidhi' }));
    req.end();
  });

  const player2Id = joinRes.playerId;
  console.log(`   ✅ Nidhi joined: ${player2Id}\n`);

  // Step 3: Simulate Prateek leaving and rejoining with same name
  console.log('3️⃣ Simulating Prateek leaving and rejoining...');
  const rejoinedRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/room/join',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ roomId, playerName: 'Prateek' }));
    req.end();
  });

  if (rejoinedRes.rejoined && rejoinedRes.playerId === player1Id) {
    console.log(`   ✅ Prateek rejoined successfully!`);
    console.log(`   ✅ Same player ID: ${rejoinedRes.playerId}`);
    console.log(`   ✅ Message: ${rejoinedRes.message}\n`);
  } else {
    console.log(`   ❌ Rejoin failed!`);
    console.log(`   Response: ${JSON.stringify(rejoinedRes)}\n`);
  }

  // Step 4: Try to join with different name when room is full
  console.log('4️⃣ Trying to join with different name (should fail)...');
  const failRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/room/join',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ roomId, playerName: 'Random Person' }));
    req.end();
  });

  if (failRes.status === 400) {
    console.log(`   ✅ Correctly rejected: ${failRes.data.error}\n`);
  } else {
    console.log(`   ❌ Unexpected response: ${JSON.stringify(failRes)}\n`);
  }

  console.log('🎉 Rejoin Test Complete!');
}

testRejoin().catch(console.error);
