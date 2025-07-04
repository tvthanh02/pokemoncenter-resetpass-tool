const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('🚀 Testing Playwright...');
  
  let browser = null;
  let page = null;
  
  try {
    // Launch browser
    console.log('📱 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    
    // Test navigation
    console.log('🌐 Navigating to test page...');
    await page.goto('https://www.google.com');
    
    console.log('✅ Playwright is working correctly!');
    console.log('📄 Page title:', await page.title());
    
    // Wait a bit to see the page
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (err) {
    console.error('❌ Playwright test failed:', err.message);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    console.log('🔚 Test completed');
  }
}

testPlaywright(); 