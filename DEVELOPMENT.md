# Hướng Dẫn Phát Triển GoPOS

## Cấu trúc Dự án

```
GoPOS/
├── Backend/          # Node.js + Express API
├── Frontend/         # React + TypeScript UI
├── README.md         # Tài liệu chính
└── API_TESTING.md    # Hướng dẫn test API
```

## Bắt Đầu

### 1. Clone Repository

```bash
git clone <repository-url>
cd GoPOS
```

### 2. Setup Backend

```bash
cd Backend
npm install

# Tạo file .env
cp .env.example .env

# Khởi chạy
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

### 3. Setup Frontend

```bash
cd Frontend
npm install

# Khởi chạy
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## Các Features Chính

### ✅ Authentication & Authorization

- Register/Login
- JWT Token
- Role-based Access Control (RBAC)
- 3 roles: Admin, Staff, Customer

### ✅ Product Management

- Tạo, sửa, xóa sản phẩm
- Quản lý danh mục
- Quản lý tồn kho

### ✅ Order Management

- Tạo đơn hàng
- Quản lý trạng thái đơn hàng
- Quản lý trạng thái thanh toán
- Tự động cập nhật tồn kho

### ✅ Sales Report

- Báo cáo doanh số
- Thống kê theo ngày
- Giá trị trung bình đơn hàng

## Các Công Nghệ

### Backend

- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Encryption

### Frontend

- **React** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Fetch API** - HTTP Client

## Project Structure

### Backend

```
Backend/
├── models/              # Database Models
├── controllers/         # Business Logic
├── routes/             # API Routes
├── middleware/         # Auth & Validation
├── config/             # Database Config
├── server.js           # Entry Point
└── package.json
```

### Frontend

```
Frontend/
├── src/
│   ├── components/     # React Components
│   ├── services/       # API Services
│   ├── App.tsx         # Main App
│   └── main.tsx
└── package.json
```

## Database Schema

### Users

- Lưu thông tin đăng nhập
- Hỗ trợ 3 roles

### Products

- SKU (Stock Keeping Unit)
- Danh mục
- Tồn kho tự động cập nhật

### Categories

- Phân loại sản phẩm

### Orders

- Chi tiết sản phẩm
- Tính toán giá tự động
- Quản lý trạng thái

## API Endpoints Overview

```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

Users:
  POST   /api/users
  POST   /api/users/admin-create

Products:
  GET    /api/products
  GET    /api/products/:id
  POST   /api/products
  PUT    /api/products/:id
  DELETE /api/products/:id
  PUT    /api/products/:id/stock

Categories:
  GET    /api/categories
  POST   /api/categories
  PUT    /api/categories/:id
  DELETE /api/categories/:id

Orders:
  GET    /api/orders
  GET    /api/orders/:id
  POST   /api/orders
  PUT    /api/orders/:id/status
  PUT    /api/orders/:id/payment
  DELETE /api/orders/:id
  GET    /api/orders/reports/sales
```

## Development Tips

### 1. Testing API

Sử dụng Postman hoặc Insomnia để test API.
Chi tiết trong `API_TESTING.md`

### 2. Database

MongoDB phải chạy trước backend:

```bash
mongod
```

### 3. Environment Variables

Backend cần các biến:

- `PORT` - Port chạy server
- `MONGODB_URI` - Kết nối MongoDB
- `JWT_SECRET` - Secret key cho JWT
- `NODE_ENV` - development/production

### 4. CORS

Frontend & Backend chạy trên ports khác nhau, nên CORS đã được config.

## Common Issues

### "Cannot GET /api/products"

- Kiểm tra server đã khởi chạy
- Kiểm tra route có tồn tại
- Kiểm tra backend port (5000)

### "MongoError: connect ECONNREFUSED"

- MongoDB service chưa chạy
- Kiểm tra MONGODB_URI

### "Token not found"

- Chưa đăng nhập hoặc token hết hạn
- Xóa localStorage và đăng nhập lại

### CORS Error

- Frontend URL khác Backend URL
- Kiểm tra CORS config trong server.js

## Deployment

### Backend (Heroku/Railway)

```bash
git push heroku main
```

### Frontend (Vercel)

```bash
npm run build
# Deploy folder dist/
```

## Next Steps

1. ✅ Hoàn thành basic CRUD operations
2. 🔄 Thêm validation
3. 🔄 Improve UI/UX
4. 🔄 Add more features
5. 🔄 Deploy to production

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support

Có vấn đề? Tạo issue trên GitHub hoặc liên hệ team phát triển.

---

Happy Coding! 🚀
