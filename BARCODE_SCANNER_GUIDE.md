# 📱 Hướng Dẫn Quét Mã Vạch - GoPOS

## 📋 Tổng Quan

Hệ thống GoPOS đã được cập nhật với chức năng **quét mã vạch** toàn bộ cho các module:

- ✅ **Bán hàng** (Tạo đơn hàng mới)
- ✅ **Sửa sản phẩm** (Quản lý sản phẩm)
- ✅ **Nhập hàng** (Xuất nhập kho)

---

## 🎯 Cách Sử Dụng

### 1. **Bán Hàng - Quét Mã Vạch Sản Phẩm**

#### Vị trí: `Tạo Đơn Hàng` → Tab `Bán Hàng` hoặc `Đơn Hàng`

**Cách thực hiện:**

1. Mở màn hình **Tạo Đơn Hàng**
2. Một thanh tìm kiếm sẽ tự động focus ở phần **"Sản Phẩm"** bên phải
3. **Quét mã vạch sản phẩm** bằng máy quét mã vạch
4. Sản phẩm sẽ được **thêm vào giỏ hàng tự động**
5. Nếu sản phẩm đã có trong giỏ → **Số lượng tăng thêm 1**
6. **Tiếp tục quét** các sản phẩm khác

**Ví dụ:**

```
Quét: 8936009999999 → Thêm sản phẩm "Coca Cola"
Quét: 8936009999999 → Tăng số lượng "Coca Cola" lên 2
Quét: 8934444999999 → Thêm sản phẩm "Pepsi"
```

**Indicator (Chỉ báo):**

- 🔵 Hộp thông báo xanh ở góc dưới phải khi quét mã vạch
- Hiển thị mã vạch đang được quét
- Tự đóng khi quét xong

---

### 2. **Sửa Sản Phẩm - Quét Mã Vạch Để Mở Sản Phẩm**

#### Vị trí: `Quản Lý` → `Sản Phẩm`

**Cách thực hiện:**

1. Mở trang **Quản Lý Sản Phẩm**
2. Trang này sẵn sàng để quét mã vạch
3. **Quét mã vạch sản phẩm** muốn sửa
4. **Form sửa sản phẩm sẽ mở tự động**
5. Chỉnh sửa thông tin và lưu

**Lợi ích:**

- ⚡ Tìm sản phẩm nhanh hơn (không cần tìm kiếm thủ công)
- 🎯 Giảm sai lầm trong chọn sản phẩm
- 📊 Tăng hiệu suất làm việc

---

### 3. **Nhập Hàng - Quét Mã Vạch Để Xác Nhận Sản Phẩm**

#### Vị trí: `Quản Lý` → `Xuất Nhập Kho`

**Cách thực hiện:**

1. Vào trang **Xuất Nhập Kho**
2. Trang này sẵn sàng quét mã vạch
3. **Quét mã vạch sản phẩm nhập** từ phiếu nhập
4. Hệ thống sẽ **hiển thị thông tin sản phẩm**:
   - Tên sản phẩm
   - Giá hiện tại
   - Tồn kho hiện tại
5. **Điều chỉnh số lượng nhập** và lưu

**Lợi ích:**

- ✅ Kiểm tra nhanh sản phẩm
- 🛡️ Tránh nhập nhầm hàng
- 📝 Ghi chép chính xác

---

## 🔧 Cấu Trúc Kỹ Thuật

### Files Được Thêm/Sửa:

1. **`src/hooks/useBarcodeScanner.js`** (MỚI)

   - Hook custom xử lý quét mã vạch
   - Phát hiện tự động khi quét hoàn tất (bằng timeout)
   - Reset buffer sau khi quét

2. **`src/components/BarcodeScanner.jsx`** (MỚI)

   - Component UI hiển thị indicator quét mã vạch
   - Hiển thị ở góc dưới phải khi quét
   - Tự động ẩn khi hoàn tất

3. **`src/components/QuickBarcodeSearch.jsx`** (MỚI)

   - Component tìm kiếm nhanh từ mã vạch
   - Có thể tái sử dụng
   - Hỗ trợ tìm kiếm theo: Barcode, SKU, Product ID

4. **`src/components/NewOrder.jsx`** (UPDATED)

   - Tích hợp `useBarcodeScanner` hook
   - Tìm kiếm sản phẩm theo mã vạch
   - Tự động thêm vào giỏ hàng

5. **`src/components/Products.jsx`** (UPDATED)

   - Tích hợp `useBarcodeScanner` hook
   - Tìm kiếm sản phẩm theo mã vạch
   - Mở form chỉnh sửa tự động

6. **`src/components/Inventory.jsx`** (UPDATED)
   - Tích hợp `useBarcodeScanner` hook
   - Tìm kiếm sản phẩm khi nhập hàng
   - Hiển thị thông tin sản phẩm

---

## 💡 Mẹo Sử Dụng

### ✨ Tối Ưu Quét Mã Vạch:

1. **Chuẩn Bị Đúng Mã Vạch**

   - Đảm bảo máy quét mã vạch được cấu hình đúng
   - Mã vạch phải rõ ràng, không bị dập hay nhoè

2. **Kiểm Tra Dữ Liệu Sản Phẩm**

   - Mỗi sản phẩm nên có:
     - `barcode` (Mã vạch)
     - `sku` (Mã sản phẩm)
     - `_id` (ID trong database)
   - Hệ thống sẽ tìm theo ưu tiên này

3. **Tốc Độ Quét**

   - Quét tốc độ thường (không quá nhanh/chậm)
   - Khoảng cách 3-5cm từ máy quét đến mã vạch

4. **Xử Lý Lỗi**
   - Nếu không tìm thấy: Kiểm tra mã vạch có đúng không
   - Có thể nhập thủ công nếu quét không được
   - Liên hệ admin để cập nhật mã vạch sản phẩm

---

## 🔌 Cách Cấu Hình Máy Quét Mã Vạch

### Yêu Cầu:

- Máy quét mã vạch chuẩn USB (HID - Human Interface Device)
- Hầu hết quét được nhận diện như một keyboard

### Các Bước:

1. **Kết nối máy quét** vào cổng USB
2. **Chọn ngôn ngữ bàn phím**: English (US)
3. **Chế độ quét**: ASCII Mode
4. **Suffix**: ENTER (Enter ở cuối mỗi quét)

### Kiểm Tra:

- Bật notepad
- Quét một mã vạch
- Nội dung mã vạch sẽ xuất hiện trong notepad
- Nếu có, máy quét đã hoạt động đúng ✅

---

## 📌 Chuẩn Bị Dữ Liệu

### Cập Nhật Mã Vạch Sản Phẩm:

Vào **Quản Lý Sản Phẩm** → **Sửa sản phẩm** → Thêm các thông tin:

```json
{
  "name": "Coca Cola 330ml",
  "price": 5000,
  "quantity": 100,
  "sku": "COCA-330",
  "barcode": "8936009999999",
  "category": "Đồ uống",
  "image": "..."
}
```

---

## 🎬 Video Hướng Dẫn

_(Sẽ cập nhật sau)_

---

## ❓ Câu Hỏi Thường Gặp

### Q: Quét mã vạch không hoạt động?

**A:**

- Kiểm tra máy quét có kết nối USB không
- Kiểm tra sản phẩm có `barcode` hoặc `sku` không
- Thử reload trang (F5)

### Q: Muốn tìm thủ công thay vì quét?

**A:**

- Quét Bán Hàng: Gõ tên sản phẩm vào ô tìm kiếm
- Quét Sửa Sản Phẩm: Gõ tên vào ô tìm kiếm
- Hoặc click chuột trực tiếp chọn sản phẩm

### Q: Làm cách nào để tắt quét mã vạch?

**A:**

- Hiện tại quét mã vạch luôn bật trên các trang
- Nếu không cần, có thể click "Đóng" trên indicator
- Hoặc nhấn ESC để reset

### Q: Có thể quét nhiều sản phẩm liên tiếp không?

**A:** ✅ **Có!**

- Quét xong sản phẩm đầu tiên
- Lập tức quét sản phẩm thứ hai
- Không cần chờ hay click gì cả

---

## 🚀 Cải Tiến Trong Tương Lai

- [ ] Hỗ trợ quét từ QR code
- [ ] Bộ đệm quét (quét trước, xử lý sau)
- [ ] Lịch sử quét mã vạch
- [ ] Cấu hình tốc độ quét
- [ ] Tích hợp camera để quét QR
- [ ] Thống kê quét mã vạch

---

## 📞 Hỗ Trợ

Nếu có vấn đề, vui lòng:

1. Kiểm tra console (F12 → Console) xem có lỗi gì
2. Liên hệ admin với screenshot lỗi
3. Cung cấp thông tin: Trình duyệt, Hệ điều hành, Máy quét mã vạch

---

**Last Updated**: 2025-12-06
**Version**: 1.0
