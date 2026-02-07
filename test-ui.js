const { chromium } = require('playwright');

async function testUI() {
  console.log('🧪 Testing UI Rendering...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
  });

  const page = await context.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    // Test Landing Page
    console.log('📝 Testing Landing Page...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'load',
      timeout: 30000
    });

    // Wait for React hydration
    await page.waitForTimeout(5000);

    // Force evaluate scripts
    await page.evaluate(() => window.document.body.innerHTML);

    // Check for main elements
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'NOT FOUND');
    console.log(`   H1: ${h1Text}`);

    // Check for buttons
    const createBtn = await page.locator('button:has-text("Create")').first();
    const createVisible = await createBtn.isVisible().catch(() => false);
    console.log(`   Create button visible: ${createVisible}`);

    const joinBtn = await page.locator('button:has-text("Join")').first();
    const joinVisible = await joinBtn.isVisible().catch(() => false);
    console.log(`   Join button visible: ${joinVisible}`);

    // Check for any input field by various selectors
    const inputCount = await page.locator('input').count();
    console.log(`   Input fields found: ${inputCount}`);

    // Test Day 1 Page
    console.log('\n📝 Testing Day 1 Page...');
    await page.goto('http://localhost:3000/day/1?room=LEXLRX', {
      waitUntil: 'load',
      timeout: 30000
    });
    await page.waitForTimeout(5000);

    // Check Day 1 elements
    const roseDayText = await page.locator('text=Rose Day').first();
    const roseVisible = await roseDayText.isVisible().catch(() => false);
    console.log(`   Rose Day visible: ${roseVisible}`);

    const acceptBtn = await page.locator('button:has-text("Accept")').first();
    const acceptVisible = await acceptBtn.isVisible().catch(() => false);
    console.log(`   Accept button visible: ${acceptVisible}`);

    // Check room page
    console.log('\n📝 Testing Room Page...');
    await page.goto('http://localhost:3000/room/LEXLRX', {
      waitUntil: 'load',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    // Final status
    console.log('\n========================================');
    console.log('📊 UI Test Results:');
    console.log('========================================');

    const errorLogs = consoleLogs.filter(l => l.type === 'error');
    if (errorLogs.length > 0) {
      console.log('\n⚠️ Console errors:');
      errorLogs.forEach(e => console.log(`   - ${e.text.substring(0, 100)}`));
    } else {
      console.log('\n✅ No console errors');
    }

    if (errors.length > 0) {
      console.log('\n❌ Page errors:');
      errors.forEach(e => console.log(`   - ${e.substring(0, 100)}`));
    } else {
      console.log('✅ No page errors');
    }

    console.log('\n🎉 UI Rendering Test Complete!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUI();
