// Quick verification test for UI elements
const { chromium } = require('playwright');

async function verifyUI() {
  console.log('🔍 Verifying Valentine Week UI...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // Test landing page
    console.log('📄 Testing landing page...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Landing page loaded');
    
    // Check landing page elements
    const title = await page.locator('h1:has-text("7 Days, One Choice")').isVisible();
    console.log(`✅ Landing page title visible: ${title}`);
    
    // Click Create New Room button
    await page.click('button:has-text("Create New Room")');
    await page.waitForTimeout(500);
    
    // Fill name using correct placeholder
    await page.fill('input[placeholder*="your name"]', 'Test User');
    console.log('✅ Name input filled');
    
    // Click Create button
    await page.click('button:has-text("Create Room")');
    await page.waitForURL('**/room/**', { timeout: 10000 });
    
    const roomId = page.url().split('/room/')[1];
    console.log(`✅ Room created: ${roomId}`);
    
    // Test Day 1 (Rose Day)
    console.log('\n🌹 Testing Day 1 (Rose Day)...');
    await page.goto(`http://localhost:3002/day/1?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const roseButton = await page.locator('button:has-text("Accept This Rose")').isVisible();
    console.log(`✅ Day 1: Rose button visible: ${roseButton}`);
    
    // Test Day 2 (Propose Day)
    console.log('\n💕 Testing Day 2 (Propose Day)...');
    await page.goto(`http://localhost:3002/day/2?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const textarea2 = await page.locator('textarea').first().isVisible();
    console.log(`✅ Day 2: Message textarea visible: ${textarea2}`);
    
    // Test Day 3 (Chocolate Day)
    console.log('\n🍫 Testing Day 3 (Chocolate Day)...');
    await page.goto(`http://localhost:3002/day/3?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const chocolateButtons = await page.locator('button:has-text("Comfort")').first().isVisible();
    console.log(`✅ Day 3: Chocolate buttons visible: ${chocolateButtons}`);
    
    const textarea3 = await page.locator('textarea').first().isVisible();
    console.log(`✅ Day 3: Message textarea visible: ${textarea3}`);
    
    // Test Day 4 (Teddy Day)
    console.log('\n🧸 Testing Day 4 (Teddy Day)...');
    await page.goto(`http://localhost:3002/day/4?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const textarea4 = await page.locator('textarea').first().isVisible();
    console.log(`✅ Day 4: Comfort textarea visible: ${textarea4}`);
    
    // Test Day 5 (Promise Day)
    console.log('\n💍 Testing Day 5 (Promise Day)...');
    await page.goto(`http://localhost:3002/day/5?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const textarea5 = await page.locator('textarea').first().isVisible();
    console.log(`✅ Day 5: Promise textarea visible: ${textarea5}`);
    
    // Test Day 6 (Kiss Day)
    console.log('\n💋 Testing Day 6 (Kiss Day)...');
    await page.goto(`http://localhost:3002/day/6?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const textarea6 = await page.locator('textarea').first().isVisible();
    console.log(`✅ Day 6: Affection textarea visible: ${textarea6}`);
    
    // Test Day 7 (Hug Day)
    console.log('\n🤗 Testing Day 7 (Hug Day)...');
    await page.goto(`http://localhost:3002/day/7?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const textareas7 = await page.locator('textarea').count();
    console.log(`✅ Day 7: Found ${textareas7} textareas (expected: 2)`);
    
    // Test Day 8 (Valentine's Day)
    console.log('\n💝 Testing Day 8 (Valentine\'s Day)...');
    await page.goto(`http://localhost:3002/day/8?room=${roomId}`, { waitUntil: 'networkidle', timeout: 15000 });
    
    const completeButton = await page.locator('button:has-text("Complete")').isVisible();
    console.log(`✅ Day 8: Complete button visible: ${completeButton}`);
    
    // Report console errors
    console.log('\n📊 Console Errors:');
    if (errors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Errors found:');
      errors.slice(0, 5).forEach(e => console.log(`   - ${e}`));
      if (errors.length > 5) console.log(`   ... and ${errors.length - 5} more`);
    }
    
    console.log('\n🎉 UI Verification Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

verifyUI();
