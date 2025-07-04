const { chromium } = require('playwright');

async function testForm() {
  console.log('🚀 Testing new password reset form...');
  
  let browser = null;
  let page = null;
  
  try {
    // Launch browser
    console.log('📱 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 2000
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    });
    
    page = await context.newPage();
    
    // Navigate to password reset page
    console.log('🌐 Navigating to password reset page...');
    await page.goto('https://www.pokemoncenter-online.com/reset-password/');
    
    console.log('✅ Successfully loaded password reset page');
    console.log('📄 Page title:', await page.title());
    
    // Check if form elements exist
    console.log('🔍 Checking form elements...');
    
    const emailField = await page.$('input[name="dwfrm_profile_passwordreset_email"]');
    const yearField = await page.$('select[name="dwfrm_profile_customer_birthdayyear"]');
    const monthField = await page.$('select[name="dwfrm_profile_customer_birthdaymonth"]');
    const dayField = await page.$('select[name="dwfrm_profile_customer_birthdayday"]');
    
    console.log('📧 Email field found:', !!emailField);
    console.log('📅 Year field found:', !!yearField);
    console.log('📅 Month field found:', !!monthField);
    console.log('📅 Day field found:', !!dayField);
    
    // Test filling form
    console.log('✍️ Testing form filling...');
    
    await emailField.fill('test@example.com');
    await yearField.selectOption('1990');
    await monthField.selectOption('01');
    await dayField.selectOption('01');
    
    console.log('✅ Form filled successfully');
    
    // Look for submit button
    const submitButton = await page.$('button[type="submit"]') || 
                       await page.$('input[type="submit"]') ||
                       await page.$('button:has-text("再発行用メールを送信する")') ||
                       await page.$('button:has-text("送信")');
    
    console.log('🚀 Submit button found:', !!submitButton);
    
    if (submitButton) {
      console.log('📝 Submit button text:', await submitButton.textContent());
    }
    
    // Wait to see the form
    console.log('⏳ Waiting 5 seconds to see the form...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    console.log('🔚 Test completed');
  }
}

testForm(); 