# Hướng Dẫn Sử Dụng Các Chức Năng Mới

## 1. Chức Năng Đăng Nhập / Đăng Xuất ✓

- **Trang Đăng Nhập:** Khi truy cập ứng dụng, bạn sẽ thấy màn hình đăng nhập
  - Email: `admin@test.com`
  - Password: `123456`
- **Đăng Xuất:** Nhấn nút **Sign Out** (icon ra cửa) ở góc trên phải header
  - Sẽ xóa token từ localStorage
  - Quay lại trang đăng nhập

---

## 2. Chức Năng Chuyển Trang (Pagination) ✓

Đã có sẵn ở:

- **Quản lý sản phẩm:** Hiển thị 10 sản phẩm/trang, nút Previous/Next, chọn trang
- **Danh sách hóa đơn:** Hiển thị 10 hóa đơn/trang, navigation tương tự
- Thanh trạng thái: "Hiển thị X đến Y của Z kết quả"

---

## 3. Chức Năng In Hóa Đơn ✓

Tại **Danh sách hóa đơn**:

1. Tìm hóa đơn cần in
2. Nhấn nút **In** (icon printer) ở cột Hành động
3. Cửa sổ modal hiện ra với:
   - Thông tin khách hàng
   - Chi tiết sản phẩm (bảng)
   - Tính toán tiền (tổng, giảm giá, thuế, tổng cộng)
   - Nút "In hóa đơn" hoặc "Đóng"
4. Nhấn "In hóa đơn" để mở dialog in của trình duyệt
   - Chọn máy in hoặc "Save as PDF"

---

## 4. Chức Năng Xuất Excel ✓

### Sản Phẩm:

Tại **Quản lý sản phẩm**:

- Nhấn nút **Xuất Excel** (icon download, màu xanh lá)
- File `Danh_sach_san_pham.xlsx` được tải xuống
- Chứa: STT, Tên, Giá, Tồn kho, Danh mục, Mô tả, Ngày tạo

### Hóa Đơn:

Tại **Danh sách hóa đơn**:

- Nhấn nút **Xuất Excel** (icon download, màu xanh lá)
- File `Danh_sach_hoa_don.xlsx` được tải xuống
- Chứa: Mã HĐ, Khách hàng, Điện thoại, Địa chỉ, Số lượng, Tổng tiền, Giảm giá, Thuế, Trạng thái, Ngày tạo, Ghi chú

---

## Files Được Thêm/Sửa

### Tạo Mới:

1. `Frontend/src/components/modals/PrintModal.jsx` - Modal in hóa đơn
2. `Frontend/src/utils/excelExport.js` - Utility export Excel

### Sửa Đổi:

1. `Frontend/src/App.tsx` - Thêm .jsx vào import
2. `Frontend/src/components/Header.jsx` - Thêm nút Logout + thông tin user
3. `Frontend/src/components/ProvidedAppContainer.jsx` - Thêm handleLogout
4. `Frontend/src/components/Products.jsx` - Thêm nút Xuất Excel
5. `Frontend/src/components/Orders.jsx` - Thêm Print + Xuất Excel

### Dependencies Mới:

- `xlsx` - Thư viện export Excel

---

## Lưu Ý

- Pagination đã hoạt động sẵn ở Products & Orders
- In hóa đơn hỗ trợ in từ trình duyệt (Ctrl+P) hoặc save PDF
- Export Excel tải toàn bộ dữ liệu (không chỉ trang hiện tại)
- Logout sẽ xóa token và đưa bạn quay lại Login page
