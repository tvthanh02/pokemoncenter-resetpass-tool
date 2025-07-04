const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const userAgents = require('./modules/userAgents');

const GET_URL = 'https://www.pokemoncenter-online.com/on/demandware.store/Sites-POL-Site/ja_JP/Account-PasswordReset';
const POST_URL = 'https://www.pokemoncenter-online.com/on/demandware.store/Sites-POL-Site/ja_JP/Account-PasswordResetDialogForm';

async function testCsrfToken() {
  console.log('=== Testing CSRF Token ===');
  
  const jar = new CookieJar();
  const client = axios.create({ 
    jar: jar,
    withCredentials: true,
    timeout: 10000,
    maxRedirects: 5
  });
  
  const headers = {
    'User-Agent': userAgents.random(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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
  };
  
  try {
    console.log('1. Đang lấy trang password reset...');
    const res = await client.get(GET_URL, { headers });
    console.log('✅ Lấy trang thành công');
    
    const $ = cheerio.load(res.data);
    const csrf = $('input[name="csrf_token"]').val();
    
    console.log('2. CSRF Token:', csrf ? csrf.substring(0, 50) + '...' : 'KHÔNG TÌM THẤY');
    
    if (!csrf) {
      console.log('❌ Không tìm thấy CSRF token');
      return;
    }
    
    console.log('3. Đang test POST request...');
    
    const postHeaders = {
      'User-Agent': userAgents.random(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': GET_URL,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Origin': 'https://www.pokemoncenter-online.com'
    };
    
    const params = new URLSearchParams({
      dwfrm_profile_passwordreset_email: 'test@gmail.com',
      dwfrm_profile_customer_birthdayyear: '1990',
      dwfrm_profile_customer_birthdaymonth: '01',
      dwfrm_profile_customer_birthdayday: '01',
      csrf_token: csrf
    });
    
    const postRes = await client.post(POST_URL, params, { headers: postHeaders });
    console.log('✅ POST request thành công, status:', postRes.status);
    console.log('Response length:', postRes.data.length);
    
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

testCsrfToken(); 