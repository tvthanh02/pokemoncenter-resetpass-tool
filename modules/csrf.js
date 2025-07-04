const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const userAgents = require('./userAgents');

const GET_URL = 'https://www.pokemoncenter-online.com/on/demandware.store/Sites-POL-Site/ja_JP/Account-PasswordReset';

module.exports = async function getCsrfToken() {
  const jar = new CookieJar();
  const client = axios.create({ 
    jar: jar,
    withCredentials: true,
    timeout: 15000,
    maxRedirects: 5
  });
  
  // Headers giống hệt trình duyệt thật
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };
  
  try {
    // Thêm delay ngẫu nhiên trước khi request
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const res = await client.get(GET_URL, { headers });
    const $ = cheerio.load(res.data);
    const csrf = $('input[name="csrf_token"]').val();
    
    if (!csrf) {
      throw new Error('Không tìm thấy CSRF token');
    }
    
    return { csrf, jar };
  } catch (error) {
    console.error('Lỗi lấy CSRF token:', error.message);
    throw error;
  }
}; 