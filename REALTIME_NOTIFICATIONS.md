# 🔔 Hệ Thống Thông Báo Real-Time

## Tổng Quan

Hệ thống thông báo real-time sử dụng Socket.io để gửi các thông báo từ server đến frontend mà không cần refresh trang.

## Các Loại Thông Báo

### 1. **📦 Thông Báo Tạo Sản Phẩm**

- **Sự kiện**: Khi thêm sản phẩm mới
- **Thông tin**: Tên sản phẩm, giá
- **Nơi phát**: `productController.js` → `createProduct()`

### 2. **🛍️ Thông Báo Tạo Đơn Hàng**

- **Sự kiện**: Khi tạo đơn hàng mới
- **Thông tin**: Số đơn hàng, tên khách hàng, tổng tiền
- **Nơi phát**: `orderController.js` → `createOrder()`

### 3. **🔔 Thông Báo Cập Nhật Trạng Thái Đơn Hàng**

- **Sự kiện**: Khi đơn hàng được cập nhật (chờ xử lý, hoàn thành, hủy)
- **Thông tin**: Số đơn hàng, trạng thái mới
- **Nơi phát**: `orderController.js` → `updateOrderStatus()`

### 4. **💳 Thông Báo Cập Nhật Thanh Toán**

- **Sự kiện**: Khi trạng thái thanh toán thay đổi
- **Thông tin**: Số đơn hàng, trạng thái thanh toán
- **Nơi phát**: `orderController.js` → `updatePaymentStatus()`

### 5. **📤 Thông Báo Nhập/Xuất Kho**

- **Sự kiện**: Khi nhập hoặc xuất kho
- **Thông tin**: Tên sản phẩm, số lượng
- **Nơi phát**: `stockController.js` → `createMovement()`

## Cấu Trúc Thông Báo

```javascript
{
  type: "order_created",           // Loại sự kiện
  title: "🛍️ Đơn hàng mới",         // Tiêu đề hiển thị
  message: "ORD-123 - 500,000₫",   // Nội dung thông báo
  data: {...},                      // Dữ liệu chi tiết
  timestamp: Date                   // Thời gian phát sinh
}
```

## Sử Dụng Hook `useNotifications`

```jsx
import useNotifications from "./hooks/useNotifications";

function MyComponent() {
  const {
    notifications, // Danh sách thông báo
    unreadCount, // Số thông báo chưa đọc
    removeNotification, // Xóa thông báo
    markAsRead, // Đánh dấu đã đọc
    clearAll, // Xóa tất cả
  } = useNotifications();

  return (
    <div>
      <p>Có {unreadCount} thông báo mới</p>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## Cài Đặt Backend

1. Cài đặt socket.io:

```bash
cd Backend
npm install socket.io
```

2. Server tự động khởi chạy Socket.io trên cùng port (5000)

## Cài Đặt Frontend

1. Cài đặt socket.io-client:

```bash
cd Frontend
npm install socket.io-client
```

2. Hook `useNotifications` tự động kết nối tới server

## Các Tính Năng

✅ Thông báo tự động biến mất sau 5 giây
✅ Hiển thị số thông báo chưa đọc trên chuông
✅ Dropdown hiển thị danh sách thông báo chi tiết
✅ Đánh dấu đã đọc từng thông báo
✅ Xóa tất cả thông báo cùng lúc
✅ Thời gian hiển thị của mỗi thông báo
✅ Icon emoji để phân biệt loại thông báo

## Phát Triển Thêm

Để thêm thông báo mới cho một sự kiện khác:

1. **Backend**: Thêm code vào controller:

```javascript
if (global.io) {
  global.io.emit("notification:new", {
    type: "your_event_type",
    title: "📝 Tiêu đề",
    message: "Nội dung thông báo",
    data: yourData,
    timestamp: new Date(),
  });
}
```

2. Frontend sẽ tự động nhận và hiển thị thông báo
