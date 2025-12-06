# 🚀 Quick Start - Hệ thống Quản lý Kho Hàng

## ⚡ Khởi động Nhanh (5 phút)

### 1️⃣ Backend Setup

```bash
# Vào thư mục Backend
cd Backend

# Cài đặt dependencies (nếu chưa có)
npm install

# Tạo dữ liệu kho mẫu
node seedWarehouses.js

# Chạy server
npm start
```

✅ Server chạy tại: `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
# Vào thư mục Frontend (terminal mới)
cd Frontend

# Cài đặt dependencies (nếu chưa có)
npm install

# Chạy dev server
npm run dev
```

✅ Frontend chạy tại: `http://localhost:5173` (hoặc port khác)

---

## 📱 Cách Dùng

### 1. **Quản lý Kho Hàng**

1. Login vào hệ thống
2. Click menu `Quản lý kho` (sidebar trái)
3. Bấm nút `Thêm kho` để tạo kho mới
4. Nhập thông tin: tên, địa điểm, sức chứa, quản lý
5. Bấm `Lưu`

### 2. **Nhập Kho**

1. Vào menu `Xuất nhập kho`
2. Chọn "Nhập kho" từ dropdown (phía trên phải)
3. **Chọn kho** (bắt buộc) - load tự động từ backend
4. Bấm sản phẩm (cột trái) để thêm vào phiếu
5. Chỉnh sửa số lượng nếu cần
6. Chọn **Nhà cung cấp** (bắt buộc)
7. Bấm nút xanh `Nhập kho`
8. Xem thông báo thành công ✅

### 3. **Xuất Kho**

1. Vào menu `Xuất nhập kho`
2. Chọn "Xuất kho" từ dropdown
3. **Chọn kho** (bắt buộc)
4. Bấm sản phẩm để thêm
5. Chỉnh sửa số lượng
6. Chọn **Khách hàng** (bắt buộc)
7. Bấm nút xanh `Xuất kho`
8. Xem thông báo thành công ✅

---

## 📊 Dữ liệu Mẫu

**Đã tạo 5 kho mẫu:**

```
✓ Kho bán hàng - TP.HCM (1000 tấn)
✓ Kho chi nhánh - Hà Nội (800 tấn)
✓ Kho dự trữ - TP.HCM (2000 tấn)
✓ Kho nhập khẩu - Cảng Tân Cảng (3000 tấn)
✓ Kho phân phối - Biên Hòa (1500 tấn)
```

---

## 🔄 Workflow Chi Tiết

```
┌─────────────────────┐
│   Quản lý Kho       │ → Tạo/Sửa/Xóa kho
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
    ┌──────▼──────┐      ┌──────▼──────┐
    │  Nhập kho   │      │  Xuất kho   │
    │             │      │             │
    │ • Chọn kho  │      │ • Chọn kho  │
    │ • Sản phẩm  │      │ • Sản phẩm  │
    │ • NCC       │      │ • Khách     │
    │ • Submit    │      │ • Submit    │
    └──────┬──────┘      └──────┬──────┘
           │                     │
           └──────────┬──────────┘
                      │
                  Backend API
                  /api/stock
                      │
           ┌──────────────────────┐
           │ Cập nhật Product qty │
           │ Tạo StockMovement    │
           └──────────────────────┘
                      │
                   ✅ Toast
              "Thành công!"
```

---

## 🛠️ Troubleshooting

### ❌ Backend không chạy

```bash
# Kiểm tra MongoDB
mongod --version

# Kiểm tra port 5000
lsof -i :5000
```

### ❌ Frontend lỗi kết nối

- Đảm bảo backend chạy trước
- Kiểm tra URL: `http://localhost:5000`

### ❌ Kho không hiển thị

```bash
# Chạy lại seed
cd Backend
node seedWarehouses.js
```

---

## 📚 Tài liệu Chi Tiết

- `WAREHOUSE_SYSTEM_GUIDE.md` - Hướng dẫn toàn bộ
- `WAREHOUSE_CHANGES.md` - Danh sách file thay đổi

---

## ✅ Checklist

- [ ] Backend chạy tại port 5000
- [ ] Frontend chạy tại port 5173
- [ ] Dữ liệu kho đã được seed
- [ ] Đăng nhập vào hệ thống
- [ ] Xem được danh sách kho
- [ ] Tạo kho mới
- [ ] Nhập kho thành công
- [ ] Xuất kho thành công

---

## 🎉 Hoàn tất!

Hệ thống quản lý kho hàng đã sẵn sàng sử dụng!

Nếu có vấn đề, kiểm tra:

1. Browser console (`F12`)
2. Terminal backend
3. Dữ liệu MongoDB (check collections)
