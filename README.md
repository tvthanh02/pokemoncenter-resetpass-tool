# DOB Brute Force Tool

Tool brute force DOB (Date of Birth) cho website Pokemon Center sử dụng Playwright để bypass các biện pháp bảo vệ.

## Tính năng

- ✅ Sử dụng Playwright để mô phỏng browser thật
- ✅ Bypass CSRF protection và bot detection
- ✅ Retry logic và error handling
- ✅ Delay ngẫu nhiên để tránh detection
- ✅ GUI với Electron
- ✅ Logging chi tiết

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cài đặt browser engines cho Playwright:
```bash
npx playwright install
```

## Sử dụng

1. Chuẩn bị file `emailList.txt` với danh sách email (mỗi email một dòng)

2. Chạy ứng dụng:
```bash
npm start
```

3. Trong giao diện:
   - Chọn file email
   - Nhấn "Start Brute Force"
   - Theo dõi progress và log

## Cấu trúc file

```
dob-fill/
├── main.js                 # Electron main process
├── renderer.html           # GUI interface
├── renderer.js            # GUI logic
├── modules/
│   ├── bruteForceBrowser.js  # Playwright brute force module
│   ├── dobList.js           # Danh sách DOB để test
│   ├── successPhrases.js    # Cụm từ thành công
│   └── userAgents.js        # User agents
├── utils/
│   └── sleep.js            # Utility delay functions
└── emailList.txt           # Danh sách email
```

## Test

Test Playwright:
```bash
npm run test-playwright
```

## Lưu ý

- Tool sử dụng browser thật nên chậm hơn nhưng an toàn hơn
- Có thể gặp lỗi 403 nếu server phát hiện bot
- Nên sử dụng proxy để tránh IP bị block
- Delay giữa các request để tránh rate limiting

## Troubleshooting

### Lỗi "Executable doesn't exist"
Chạy lại: `npx playwright install`

### Lỗi 403 Forbidden
- Tăng delay giữa các request
- Sử dụng proxy
- Thay đổi User Agent

### Lỗi npm install
- Xóa `node_modules` và `package-lock.json`
- Chạy lại `npm install` 