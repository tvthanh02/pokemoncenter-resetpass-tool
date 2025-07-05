# Pokemon Center Password Reset Tool - Ultra Optimized

Tool brute force DOB cho Pokemon Center với tốc độ **1000-2000 requests/phút**.

## 🚀 Tính năng mới

### Phiên bản Ultra (Khuyến nghị)
- **Tốc độ**: 1000-2000 requests/phút
- **Concurrency**: Tự động tối ưu (20-100 workers)
- **HTTP Requests**: Thay vì browser automation
- **Connection Pooling**: Tái sử dụng connections
- **Rate Limiting**: Thông minh để tránh bị block

### Phiên bản Optimized
- **Tốc độ**: 500-1000 requests/phút
- **Concurrency**: 10-50 workers
- **HTTP Requests**: Với session management

### Phiên bản Original
- **Tốc độ**: 50-100 requests/phút
- **Browser Automation**: Playwright
- **Single-threaded**: 1 worker

## 📦 Cài đặt

```bash
npm install
```

## 🎯 Sử dụng

### Chạy phiên bản Ultra (Khuyến nghị)
```bash
npm start
# hoặc
npm run start-ultra
```

### Chạy phiên bản Optimized
```bash
npm run start-optimized
```

### Chạy phiên bản Original
```bash
npm run start-original
```

## ⚡ Tối ưu hóa chính

### 1. HTTP Requests thay vì Browser Automation
- **Trước**: Mỗi request mở browser mới (chậm)
- **Sau**: HTTP requests trực tiếp (nhanh)

### 2. Connection Pooling
- Tái sử dụng HTTP connections
- Giảm overhead khởi tạo connection

### 3. Concurrency cao
- **Ultra**: 20-100 workers
- **Optimized**: 10-50 workers
- **Original**: 1 worker

### 4. Rate Limiting thông minh
- **Ultra**: 15ms giữa requests (4000 req/min)
- **Optimized**: 30ms giữa requests (2000 req/min)
- **Original**: 8-20s giữa requests (3-7 req/min)

### 5. Session Management
- Tái sử dụng cookies và CSRF tokens
- Giảm số lần khởi tạo session

### 6. Error Handling tối ưu
- Giảm retry và restart
- Recovery nhanh hơn

## 📊 So sánh hiệu suất

| Phiên bản | Requests/phút | Concurrency | Memory | CPU |
|-----------|---------------|-------------|---------|-----|
| Ultra | 1000-2000 | 20-100 | Thấp | Cao |
| Optimized | 500-1000 | 10-50 | Trung bình | Trung bình |
| Original | 50-100 | 1 | Cao | Thấp |

## 🔧 Cấu hình

### Concurrency tự động
- **Ultra**: CPU cores × 4 (tối đa 100)
- **Optimized**: CPU cores × 2 (tối đa 50)
- **Original**: 1

### Rate Limiting
- **Ultra**: 15-25ms delay
- **Optimized**: 30-50ms delay
- **Original**: 8-20s delay

## ⚠️ Lưu ý

1. **Tốc độ cao**: Có thể bị rate limit từ server
2. **Concurrency**: Tăng dần để tìm điểm tối ưu
3. **Monitoring**: Theo dõi CPU và memory usage
4. **Backup**: Luôn có phiên bản dự phòng

## 🛠️ Troubleshooting

### Nếu bị block
1. Giảm concurrency
2. Tăng delay giữa requests
3. Chuyển sang phiên bản chậm hơn

### Nếu memory cao
1. Giảm số workers
2. Restart định kỳ
3. Sử dụng phiên bản Optimized

### Nếu CPU cao
1. Giảm concurrency
2. Sử dụng phiên bản Original
3. Tắt các ứng dụng khác

## 📝 Log

Tool tự động log:
- Tốc độ requests/phút
- DOB tìm thấy
- Errors và warnings
- Progress tracking

## 🎯 Kết quả

Tool sẽ tìm và hiển thị:
- Email và DOB chính xác
- Score của mỗi DOB
- Thời gian tìm thấy
- Tổng số requests đã thực hiện 