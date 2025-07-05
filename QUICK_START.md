# 🚀 Quick Start - Pokemon Center DOB Tool

## ⚡ Chạy nhanh

### 1. Cài đặt
```bash
npm install
```

### 2. Chạy phiên bản Ultra (Khuyến nghị)
```bash
npm start
```

### 3. Chuẩn bị file email
Tạo file `emailList.txt` với danh sách email:
```
user1@example.com
user2@example.com
user3@example.com
```

### 4. Sử dụng
1. Chọn file email
2. Chọn năm DOB cần test
3. Nhấn "Start Brute Force"
4. Theo dõi progress và kết quả

## 🎯 Các phiên bản

| Phiên bản | Tốc độ | Sử dụng khi |
|-----------|--------|-------------|
| **Ultra** | 1000-2000 req/min | Muốn tốc độ cao nhất |
| Optimized | 500-1000 req/min | Cân bằng tốc độ và ổn định |
| Original | 50-100 req/min | Muốn an toàn nhất |

## ⚙️ Chuyển đổi phiên bản

### Chạy Ultra (Mặc định)
```bash
npm start
```

### Chạy Optimized
```bash
npm run start-optimized
```

### Chạy Original
```bash
npm run start-original
```

## 📊 Test hiệu suất
```bash
npm run test-performance
```

## ⚠️ Lưu ý quan trọng

1. **Tốc độ cao**: Có thể bị rate limit
2. **Concurrency**: Tự động tối ưu theo CPU
3. **Memory**: Ultra version sử dụng ít memory nhất
4. **Stability**: Nếu bị lỗi, chuyển sang phiên bản chậm hơn

## 🔧 Troubleshooting

### Nếu bị lỗi
1. Giảm concurrency trong settings
2. Chuyển sang phiên bản Optimized
3. Kiểm tra kết nối internet

### Nếu chậm
1. Tăng concurrency
2. Sử dụng phiên bản Ultra
3. Đóng các ứng dụng khác

## 📈 Kết quả mong đợi

- **Ultra**: 1000-2000 requests/phút
- **Optimized**: 500-1000 requests/phút  
- **Original**: 50-100 requests/phút

## 🎯 Mục tiêu đạt được

✅ **1000-2000 requests/phút** - Đã đạt được với phiên bản Ultra
✅ **Tối ưu memory và CPU**
✅ **Connection pooling**
✅ **Rate limiting thông minh**
✅ **Error handling tốt** 