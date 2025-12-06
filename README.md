# 🚀 GoPOS - Phần mềm Quản lý Bán hàng (POS)

Hệ thống quản lý bán hàng Full-stack được xây dựng bằng công nghệ MERN Stack (MongoDB, Express.js, React, Node.js) và TypeScript.

## 📋 Mục Tiêu Dự Án

Dự án GoPOS nhằm cung cấp một giải pháp quản lý bán hàng đơn giản, hiệu quả, giúp doanh nghiệp:

- ✅ Quản lý danh mục sản phẩm (CRUD - Create, Read, Update, Delete)
- ✅ Thực hiện giao dịch bán hàng (POS)
- ✅ Quản lý người dùng và phân quyền (Admin/Staff/Customer)
- ✅ Theo dõi tồn kho theo thời gian thực
- ✅ Quản lý đơn hàng và thanh toán
- ✅ Báo cáo và thống kê doanh số

## 🛠️ Công Nghệ Sử Dụng

**Backend:**

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (Authentication)
- bcryptjs (Password Hashing)

**Frontend:**

- React
- TypeScript
- Vite
- Axios

## 📁 Cấu Trúc Thư Mục

```
GoPOS/
├── Backend/
│   ├── models/
│   │   ├── User.js (Người dùng + Auth)
│   │   ├── Product.js (Sản phẩm)
│   │   ├── Category.js (Danh mục)
│   │   └── Order.js (Đơn hàng)
│   ├── controllers/
│   │   ├── authController.js (Đăng nhập/Đăng ký)
│   │   ├── userControllers.js (Quản lý người dùng)
│   │   ├── productController.js (Quản lý sản phẩm)
│   │   ├── categoryController.js (Quản lý danh mục)
│   │   └── orderController.js (Quản lý đơn hàng)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── orderRoutes.js
│   ├── middleware/
│   │   └── auth.js (JWT Authentication & Authorization)
│   ├── config/
│   │   └── db.js (MongoDB Connection)
│   ├── server.js (Entry Point)
│   ├── package.json
│   └── .env.example
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderList.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   └── SalesReport.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── productService.ts
│   │   │   ├── categoryService.ts
│   │   │   └── orderService.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Hướng Dẫn Cài Đặt

### Backend Setup

1. **Cài đặt dependencies:**

```bash
cd Backend
npm install
```

2. **Tạo file .env:**

```bash
cp .env.example .env
```

3. **Cấu hình MongoDB:**
   Mở file `.env` và sửa `MONGODB_URI`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gopos
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

4. **Khởi chạy server:**

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

### Frontend Setup

1. **Cài đặt dependencies:**

```bash
cd Frontend
npm install
```

2. **Khởi chạy ứng dụng:**

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📚 API Endpoints

### Authentication

- **POST** `/api/auth/register` - Đăng ký
- **POST** `/api/auth/login` - Đăng nhập
- **GET** `/api/auth/me` - Lấy thông tin người dùng (cần token)

### Users

- **POST** `/api/users` - Tạo người dùng mới
- **POST** `/api/users/admin-create` - Admin tạo người dùng (cần auth)

### Products

- **GET** `/api/products` - Lấy tất cả sản phẩm
- **GET** `/api/products/:id` - Lấy chi tiết sản phẩm
- **POST** `/api/products` - Tạo sản phẩm (cần auth + staff/admin)
- **PUT** `/api/products/:id` - Cập nhật sản phẩm (cần auth + staff/admin)
- **PUT** `/api/products/:id/stock` - Cập nhật tồn kho (cần auth + staff/admin)
- **DELETE** `/api/products/:id` - Xóa sản phẩm (cần auth + admin)

### Categories

- **GET** `/api/categories` - Lấy tất cả danh mục
- **POST** `/api/categories` - Tạo danh mục (cần auth + admin)
- **PUT** `/api/categories/:id` - Cập nhật danh mục (cần auth + admin)
- **DELETE** `/api/categories/:id` - Xóa danh mục (cần auth + admin)

### Orders

- **GET** `/api/orders` - Lấy tất cả đơn hàng (cần auth)
- **GET** `/api/orders/:id` - Lấy chi tiết đơn hàng (cần auth)
- **GET** `/api/orders/reports/sales` - Báo cáo doanh số (cần auth + staff/admin)
- **POST** `/api/orders` - Tạo đơn hàng (cần auth)
- **PUT** `/api/orders/:id/status` - Cập nhật trạng thái đơn hàng (cần auth + staff/admin)
- **PUT** `/api/orders/:id/payment` - Cập nhật trạng thái thanh toán (cần auth + staff/admin)
- **DELETE** `/api/orders/:id` - Xóa đơn hàng (cần auth + admin)

## 🔐 Phân Quyền

| Role     | Tạo SP | Sửa SP | Xóa SP | Tạo DH | Quản lý DH | Báo cáo | Tạo DM | Quản lý TK |
| -------- | ------ | ------ | ------ | ------ | ---------- | ------- | ------ | ---------- |
| Admin    | ✅     | ✅     | ✅     | ✅     | ✅         | ✅      | ✅     | ✅         |
| Staff    | ✅     | ✅     | ❌     | ✅     | ✅         | ✅      | ❌     | ❌         |
| Customer | ❌     | ❌     | ❌     | ✅     | ❌         | ❌      | ❌     | ❌         |

## 💾 Models Chi Tiết

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "staff" | "customer",
  phone: String,
  address: String,
  status: "active" | "inactive",
  timestamps
}
```

### Product Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  category: ObjectId,
  sku: String (unique),
  image: String,
  status: "active" | "inactive",
  timestamps
}
```

### Category Model

```javascript
{
  name: String (unique),
  description: String,
  status: "active" | "inactive",
  timestamps
}
```

### Order Model

```javascript
{
  orderNumber: String (unique),
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  total: Number,
  discount: Number,
  tax: Number,
  finalTotal: Number,
  status: "pending" | "completed" | "cancelled",
  paymentStatus: "unpaid" | "paid" | "refunded",
  paymentMethod: "cash" | "card" | "bank_transfer" | "other",
  customerName: String,
  customerPhone: String,
  notes: String,
  timestamps
}
```

## 🧪 Hướng Dẫn Sử Dụng

### Tạo Tài Khoản Admin

1. Đăng ký tài khoản bình thường
2. Truy cập MongoDB và sửa role từ "customer" thành "admin"

### Tạo Sản Phẩm

1. Đăng nhập với tài khoản Admin/Staff
2. Vào mục "Sản Phẩm"
3. Tạo danh mục trước (Admin)
4. Nhập thông tin sản phẩm và lưu

### Tạo Đơn Hàng

1. Vào mục "Đơn Hàng"
2. Chọn sản phẩm muốn bán
3. Nhập thông tin khách hàng
4. Chọn phương thức thanh toán
5. Hoàn tất giao dịch

### Xem Báo Cáo (Admin)

1. Đăng nhập với tài khoản Admin
2. Vào mục "Báo Cáo"
3. Xem doanh số theo ngày, tổng doanh thu, v.v.

## 🐛 Troubleshooting

**Lỗi kết nối MongoDB:**

- Kiểm tra MongoDB service đang chạy
- Kiểm tra MONGODB_URI trong .env đúng

**Lỗi CORS:**

- Kiểm tra CORS config trong server.js

**Lỗi JWT Token:**

- Token có hết hạn -> cần đăng nhập lại
- Token không đúng -> xóa localStorage và đăng nhập lại

## 📝 Ghi Chú

- Mật khẩu được mã hóa bằng bcryptjs
- JWT token hết hạn sau 7 ngày
- Tồn kho được cập nhật tự động khi tạo/hủy đơn hàng
- Hỗ trợ phân trang cho danh sách sản phẩm/đơn hàng

## 👨‍💻 Tác Giả

GoPOS - Hệ thống quản lý bán hàng

## 📄 License

MIT License

---

**Để bắt đầu phát triển, chạy:**

```bash
# Backend
cd Backend && npm install && npm run dev

# Frontend (terminal khác)
cd Frontend && npm install && npm run dev
```

Truy cập `http://localhost:5173` để sử dụng ứng dụng!
