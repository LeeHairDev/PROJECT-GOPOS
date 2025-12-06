# GoPOS - API Testing Guide

Tài liệu này giúp bạn test các API endpoints của GoPOS.

## 1. Authentication

### Đăng ký (Register)

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "customer"
}
```

Response:

```json
{
  "message": "Đăng ký thành công!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Đăng nhập (Login)

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

### Lấy thông tin người dùng (Get Me)

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>
```

## 2. Categories

### Lấy tất cả danh mục

```
GET http://localhost:5000/api/categories
```

### Tạo danh mục (Admin)

```
POST http://localhost:5000/api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Điện Tử",
  "description": "Các sản phẩm điện tử"
}
```

## 3. Products

### Lấy tất cả sản phẩm

```
GET http://localhost:5000/api/products
```

### Tạo sản phẩm (Staff/Admin)

```
POST http://localhost:5000/api/products
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "name": "Laptop Dell XPS 13",
  "description": "Laptop cao cấp từ Dell",
  "price": 15000000,
  "quantity": 10,
  "category": "507f1f77bcf86cd799439011",
  "sku": "DELL-XPS-13-001",
  "status": "active"
}
```

### Cập nhật sản phẩm

```
PUT http://localhost:5000/api/products/507f1f77bcf86cd799439011
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "price": 14500000,
  "quantity": 8
}
```

### Xóa sản phẩm (Admin)

```
DELETE http://localhost:5000/api/products/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

## 4. Orders

### Lấy tất cả đơn hàng

```
GET http://localhost:5000/api/orders
Authorization: Bearer <token>
```

### Tạo đơn hàng

```
POST http://localhost:5000/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "product": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ],
  "paymentMethod": "cash",
  "discount": 0,
  "tax": 0,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789"
}
```

### Cập nhật trạng thái đơn hàng

```
PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "status": "completed"
}
```

### Cập nhật trạng thái thanh toán

```
PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439011/payment
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "paymentStatus": "paid"
}
```

### Lấy báo cáo doanh số

```
GET http://localhost:5000/api/orders/reports/sales
Authorization: Bearer <admin_token>
```

## Tools để Test API

- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **Thunder Client** (VS Code Extension)
- **REST Client** (VS Code Extension)

## Headers quan trọng

- Content-Type: application/json
- Authorization: Bearer <token> (đối với các endpoint cần xác thực)

## Status Codes

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
