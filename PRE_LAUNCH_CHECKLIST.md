# ✅ PRE-LAUNCH CHECKLIST

## 🎯 Trước Khi Chạy

### ✅ Prerequisites

- [ ] Node.js v14+ cài đặt (`node --version`)
- [ ] npm cài đặt (`npm --version`)
- [ ] MongoDB cài đặt (Local hoặc Cloud)
- [ ] Git cài đặt (tuỳ chọn)

### ✅ Project Setup

- [ ] Clone/Download GoPOS
- [ ] Extract nếu là ZIP
- [ ] Mở terminal tại thư mục GoPOS

---

## 🔧 Configuration Checklist

### Backend Setup

- [ ] `cd Backend`
- [ ] `npm install` (Đợi hoàn thành)
- [ ] `cp .env.example .env` (Copy file)
- [ ] Chỉnh sửa `.env`:
  - [ ] `PORT=5000` (giữ nguyên)
  - [ ] `MONGODB_URI` (chỉnh sửa nếu cần)
  - [ ] `JWT_SECRET` (thay đổi bằng string ngẫu nhiên)
  - [ ] `NODE_ENV=development`

### Frontend Setup

- [ ] `cd Frontend` (Quay lại, rồi vào Frontend)
- [ ] `npm install` (Đợi hoàn thành)

---

## 🚀 Pre-Launch Checks

### Verify Installation

- [ ] Backend: `cd Backend && npm list` (Kiểm tra packages)
- [ ] Frontend: `cd Frontend && npm list` (Kiểm tra packages)

### Verify MongoDB

- [ ] MongoDB service đang chạy
- [ ] Test kết nối: `mongo` hoặc MongoDB Compass

### Verify Configuration

- [ ] Backend/.env file tồn tại
- [ ] MONGODB_URI đúng
- [ ] JWT_SECRET không phải string mặc định

---

## ⚡ Launch Checklist

### Terminal 1 - Backend

- [ ] `cd Backend`
- [ ] `npm run dev`
- [ ] Kiểm tra: "Server running on port 5000"
- [ ] Kiểm tra: "MongoDB Connected"

### Terminal 2 - Frontend

- [ ] `cd Frontend`
- [ ] `npm run dev`
- [ ] Kiểm tra: "Local: http://localhost:5173"

### Browser

- [ ] Mở: http://localhost:5173
- [ ] Thấy Login form
- [ ] CSS load bình thường

---

## 🧪 Functionality Checklist

### Authentication

- [ ] Register - Tạo tài khoản mới
- [ ] Login - Đăng nhập thành công
- [ ] Logout - Đăng xuất

### Products

- [ ] Xem danh sách sản phẩm
- [ ] Tạo sản phẩm mới (Admin/Staff)
- [ ] Cập nhật sản phẩm
- [ ] Xóa sản phẩm

### Orders

- [ ] Tạo đơn hàng
- [ ] Thêm sản phẩm vào đơn
- [ ] Xem danh sách đơn hàng
- [ ] Cập nhật trạng thái

### Admin Features (nếu có role admin)

- [ ] Quản lý danh mục
- [ ] Xem báo cáo doanh số

---

## 🐛 Troubleshooting Checklist

### Nếu Backend không khởi động:

- [ ] Kiểm tra MongoDB đang chạy
- [ ] Kiểm tra port 5000 không đang sử dụng
- [ ] Xóa `node_modules` & chạy `npm install` lại

### Nếu Frontend không khởi động:

- [ ] Kiểm tra port 5173 không đang sử dụng
- [ ] Xóa `node_modules` & chạy `npm install` lại
- [ ] Kiểm tra Vite config

### Nếu không thể tạo tài khoản:

- [ ] Kiểm tra Backend log có lỗi
- [ ] Kiểm tra MongoDB kết nối ok
- [ ] Kiểm tra email chưa được dùng

### Nếu không thể tạo sản phẩm:

- [ ] Kiểm tra bạn là Admin/Staff
- [ ] Kiểm tra danh mục đã tạo
- [ ] Kiểm tra token hợp lệ

---

## 📋 Data Checklist

### Test Data (để test)

- [ ] User: test@example.com / 123456
- [ ] Tạo ít nhất 1 danh mục
- [ ] Tạo ít nhất 3 sản phẩm
- [ ] Tạo ít nhất 1 đơn hàng

### API Testing

- [ ] Register endpoint hoạt động
- [ ] Login endpoint hoạt động
- [ ] Product endpoints hoạt động
- [ ] Order endpoints hoạt động

---

## 📚 Documentation Review

- [ ] Đọc `00_START_HERE.md`
- [ ] Đọc `README.md` (phần quan trọng)
- [ ] Đọc `SETUP_NOTES.md` (troubleshooting)
- [ ] Đọc `API_TESTING.md` (nếu test API)

---

## 🎯 Development Checklist (Tiếp Theo)

### Code Quality

- [ ] Không có console.error
- [ ] Không có typo
- [ ] Consistent code style

### Feature Completeness

- [ ] Auth hoạt động
- [ ] CRUD operations hoạt động
- [ ] Role-based access hoạt động
- [ ] Báo cáo hoạt động

### Performance

- [ ] App không lag
- [ ] API response nhanh
- [ ] UI mượt mà

---

## 🚢 Deployment Checklist (Trước Deploy)

### Backend

- [ ] `NODE_ENV=production` in `.env`
- [ ] `JWT_SECRET` đã thay đổi
- [ ] `MONGODB_URI` pointing to production DB
- [ ] Error handling đầy đủ
- [ ] No hardcoded secrets

### Frontend

- [ ] `npm run build` success
- [ ] API URL pointing to production
- [ ] No console errors
- [ ] Performance optimized

### Database

- [ ] Backup production data
- [ ] Indexes created
- [ ] Monitoring setup

---

## 🎓 Final Checks

- [ ] Tất cả features hoạt động ✅
- [ ] Không có major bugs ✅
- [ ] Code sạch & organized ✅
- [ ] Documentation đầy đủ ✅
- [ ] Sẵn sàng deploy ✅

---

## ✨ Ready to Go!

Nếu tất cả checkboxes ✅ thì:

```bash
🚀 GoPOS sẵn sàng phát triển/triển khai
```

---

## 📞 Support

Nếu bất cứ điều gì không hoạt động:

1. Kiểm tra lại checklist này
2. Đọc `SETUP_NOTES.md` (Troubleshooting)
3. Kiểm tra logs ở browser (F12) hoặc terminal

---

**Last Updated:** 2025-12-04
**Version:** 1.0.0
**Status:** ✅ Ready
