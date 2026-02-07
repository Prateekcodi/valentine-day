// Quick script to create a new room and show the link
const https = require('https');

async function createRoom() {
  console.log('🆕 Creating new test room...\n');

  // Create room
  const createRes = await fetch('http://localhost:3001/api/room/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'Prateek' })
  });
  const createData = await createRes.json();
  console.log(`✅ Room created: ${createData.roomId}`);
  console.log(`👤 Player ID: ${createData.playerId}`);

  // Join room
  const joinRes = await fetch('http://localhost:3001/api/room/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: createData.roomId, playerName: 'Partner' })
  });
  const joinData = await joinRes.json();
  console.log(`\n✅ Partner joined: ${joinData.playerId}`);

  console.log('\n========================================');
  console.log('📍 NEW ROOM DETAILS');
  console.log('========================================\n');
  console.log(`🌐 Landing: http://localhost:3000`);
  console.log(`🌐 Day 1:   http://localhost:3000/day/1?room=${createData.roomId}`);
  console.log(`🌐 Room:    http://localhost:3000/room/${createData.roomId}`);
  console.log('\n⚠️  Open in TWO DIFFERENT browsers!');
  console.log('========================================\n');
}

createRoom().catch(console.error);
