# Hệ thống Quản lý Kho Hàng - Tài liệu Thực hiện

## Tổng quan

Hệ thống đã được phát triển để hỗ trợ quản lý nhiều kho hàng với các loại sản phẩm khác nhau. Mỗi cửa hàng có thể có nhiều kho, mỗi kho có dung lượng và quản lý độc lập.

---

## 📂 Cấu trúc Thay đổi

### Backend (`/Backend`)

#### 1. **Models**

- **`models/Warehouse.js`** (NEW) - Mô hình Kho hàng
  - `name`: Tên kho (bắt buộc)
  - `location`: Địa điểm
  - `address`: Địa chỉ đầy đủ
  - `capacity`: Sức chứa (tấn/đơn vị)
  - `currentStock`: Tồn kho hiện tại
  - `status`: Trạng thái (active/inactive)
  - `description`: Mô tả
  - `manager`: Người quản lý

#### 2. **Controllers**

- **`controllers/warehouseController.js`** (NEW)
  - `getAllWarehouses(req, res)` - Lấy danh sách kho
  - `getWarehouseById(req, res)` - Lấy chi tiết kho
  - `createWarehouse(req, res)` - Tạo kho mới
  - `updateWarehouse(req, res)` - Cập nhật kho
  - `deleteWarehouse(req, res)` - Xóa kho

#### 3. **Routes**

- **`routes/warehouseRoutes.js`** (NEW)
  - `GET /` - Lấy tất cả kho
  - `GET /:id` - Lấy kho theo ID
  - `POST /` - Tạo kho (protected)
  - `PUT /:id` - Cập nhật kho (protected)
  - `DELETE /:id` - Xóa kho (protected)

#### 4. **Server Configuration**

- **`server.js`** - Cập nhật
  - Thêm import `warehouseRoutes`
  - Thêm route `/api/warehouses`

#### 5. **Seeding**

- **`seedWarehouses.js`** (NEW) - Seed dữ liệu kho mẫu
  - Tạo 5 kho mẫu (Bán hàng, Chi nhánh, Dự trữ, Nhập khẩu, Phân phối)

**Chạy seed:**

```bash
cd Backend
node seedWarehouses.js
```

---

### Frontend (`/Frontend/src`)

#### 1. **Services**

- **`services/warehouseService.ts`** (NEW) - Service để gọi API warehouse
  - `getAllWarehouses(status)` - Lấy danh sách kho
  - `getWarehouseById(id)` - Lấy kho theo ID
  - `createWarehouse(data)` - Tạo kho
  - `updateWarehouse(id, data)` - Cập nhật kho
  - `deleteWarehouse(id)` - Xóa kho

#### 2. **Components**

**`components/Inventory.jsx`** - Cập nhật

- Thêm import `warehouseService`
- Thêm state `warehouses`
- Thêm hàm `fetchWarehouses()`
- Warehouse selector tự động tải từ backend thay vì hardcode
- Gửi ID kho (thay vì tên cứng) khi submit nhập/xuất kho
- Toast notifications cho error/success

**`components/Warehouses.jsx`** (NEW) - Quản lý kho hàng

- Danh sách kho hàng với bảng hiển thị (tên, địa điểm, sức chứa, quản lý, trạng thái)
- Nút "Thêm kho" - mở modal form
- Chỉnh sửa kho - cập nhật thông tin
- Xóa kho - xóa khỏi hệ thống
- Toast notifications cho các hành động

#### 3. **App Integration**

**`App.tsx`** - Cập nhật

- Import `Warehouses` component
- Thêm tab `warehouses` vào `tabTitles`
- Thêm render cho `activeTab === 'warehouses'`

**`components/Sidebar.jsx`** - Cập nhật

- Thêm menu item "Quản lý kho" (icon: `fas fa-boxes`)
- Đặt giữa "Đơn hàng" và "Xuất nhập kho"

---

## 🔄 Quy trình Làm việc

### 1. **Tạo/Quản lý Kho**

1. Vào menu `Quản lý kho`
2. Bấm nút `Thêm kho` để tạo kho mới
3. Nhập thông tin: tên, địa điểm, địa chỉ, sức chứa, người quản lý
4. Bấm `Lưu` → Kho được tạo

### 2. **Nhập/Xuất Kho**

1. Vào menu `Xuất nhập kho`
2. Chọn chế độ: "Nhập kho" hoặc "Xuất kho"
3. **Chọn kho hàng** từ dropdown (tự động tải từ backend)
4. Chọn sản phẩm từ lưới (cột trái)
5. Chỉnh sửa số lượng
6. Chọn nhà cung cấp (nhập) hoặc khách hàng (xuất)
7. Bấm `Nhập kho` / `Xuất kho` → Gửi request tới backend

### 3. **Backend Processing**

- `stockService.createMovement()` gửi:
  ```json
  {
    "product": "product_id",
    "type": "in|out",
    "quantity": 5,
    "reference": "supplier_id|customer_id",
    "warehouse": "warehouse_id",
    "notes": "Nhập từ: ... - Kho: ..."
  }
  ```
- Backend cập nhật `Product.quantity` và tạo `StockMovement` record

---

## 📊 Dữ liệu Mẫu

**5 Kho mẫu đã được tạo:**

| Tên           | Địa điểm      | Sức chứa | Quản lý      |
| ------------- | ------------- | -------- | ------------ |
| Kho bán hàng  | TP.HCM        | 1000     | Nguyễn Văn A |
| Kho chi nhánh | Hà Nội        | 800      | Trần Thị B   |
| Kho dự trữ    | TP.HCM        | 2000     | Lê Văn C     |
| Kho nhập khẩu | Cảng Tân Cảng | 3000     | Phạm Đức D   |
| Kho phân phối | Biên Hòa      | 1500     | Hoàng Văn E  |

---

## 🚀 Cách Chạy

### Backend

```bash
cd Backend
node seedWarehouses.js    # Tạo kho mẫu
npm start                 # Chạy server (port 5000)
```

### Frontend

```bash
cd Frontend
npm run dev               # Chạy dev server
```

### API Endpoints

- `GET /api/warehouses` - Lấy danh sách kho
- `GET /api/warehouses/:id` - Lấy kho theo ID
- `POST /api/warehouses` - Tạo kho (auth)
- `PUT /api/warehouses/:id` - Cập nhật kho (auth)
- `DELETE /api/warehouses/:id` - Xóa kho (auth)
- `POST /api/stock/` - Nhập/xuất kho (auth)

---

## ✅ Tính năng

- ✅ Quản lý nhiều kho hàng
- ✅ Tạo, sửa, xóa kho
- ✅ Nhập kho với chọn warehouse cụ thể
- ✅ Xuất kho với chọn warehouse cụ thể
- ✅ Toast notifications (success/error)
- ✅ Validation (bắt buộc chọn kho, nhà cung cấp, khách hàng)
- ✅ Ghi chú kho vào notes khi nhập/xuất
- ✅ Responsive UI

---

## 📝 Ghi chú

- Tất cả kho được load từ backend
- Chỉ kho có `status = 'active'` mới hiển thị trong dropdown nhập/xuất
- Warehouse ID (ObjectId) được gửi khi submit, không phải tên cứng
- Toast notifications tự động đóng sau 3 giây
- Form nhập/xuất tự động clear sau submit thành công
