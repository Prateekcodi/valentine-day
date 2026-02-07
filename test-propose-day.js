const http = require('http');

async function testProposeDay() {
  // Create room
  const createRes = await fetch('http://localhost:3001/api/room/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'Prateek' })
  });
  const createData = await createRes.json();
  console.log('Room created:', createData.roomId);
  console.log('Player 1 ID:', createData.playerId);

  const roomId = createData.roomId;
  const player1Id = createData.playerId;

  // Join room
  const joinRes = await fetch('http://localhost:3001/api/room/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, playerName: 'Partner' })
  });
  const joinData = await joinRes.json();
  console.log('Room joined, Player 2 ID:', joinData.playerId);

  const player2Id = joinData.playerId;

  // Submit Day 2 as Player 1
  console.log('\n--- Player 1 submitting ---');
  const submit1 = await fetch('http://localhost:3001/api/day/2/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId,
      playerId: player1Id,
      message: 'You make my heart smile every single day'
    })
  });
  const result1 = await submit1.json();
  console.log('Player 1 result:', JSON.stringify(result1, null, 2));

  // Submit Day 2 as Player 2
  console.log('\n--- Player 2 submitting ---');
  const submit2 = await fetch('http://localhost:3001/api/day/2/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId,
      playerId: player2Id,
      message: 'Being with you feels like coming home'
    })
  });
  const result2 = await submit2.json();
  console.log('Player 2 result:', JSON.stringify(result2, null, 2));

  if (result2.reflection) {
    console.log('\n=== AI REFLECTION ===');
    console.log(result2.reflection);
    console.log('=====================\n');
  }
}

testProposeDay().catch(console.error);
