# ⚠️ IMPORTANT NOTES & SETUP INSTRUCTIONS

## 🔴 Điều Cần Làm Ngay

### 1. Cài đặt MongoDB

GoPOS sử dụng MongoDB. Bạn cần:

**Option A: Local MongoDB**

```bash
# Windows
- Download từ https://www.mongodb.com/try/download/community
- Cài đặt với default settings
- MongoDB sẽ chạy tại localhost:27017

# Mac (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

```
1. Đăng ký tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster
3. Lấy connection string
4. Update trong Backend/.env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gopos
```

### 2. Cài đặt Node.js

- Download từ: https://nodejs.org/
- Cài phiên bản LTS (Long Term Support)
- Kiểm tra: `node --version` & `npm --version`

### 3. Khởi chạy dự án

**Windows:**

```bash
# Double-click quick-start.bat
# hoặc
quick-start.bat
```

**Mac/Linux:**

```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

## 🔧 Manual Setup (Nếu quick-start không hoạt động)

### Backend

```bash
cd Backend

# Cài đặt dependencies
npm install

# Tạo .env file
cp .env.example .env

# Khởi chạy server
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

### Frontend

```bash
cd Frontend

# Cài đặt dependencies
npm install

# Khởi chạy dev server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## 📋 Danh Sách Các Packages Cần

### Backend (package.json)

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.1.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "nodemon": "^3.0.2"
}
```

### Frontend (package.json)

```json
{
  "react": "^18.2.0",
  "typescript": "^5.3.3",
  "vite": "^5.0.8"
}
```

---

## 🔐 Security - Điều Cần Thay Đổi

### 1. Thay đổi JWT Secret

File: `Backend/.env`

```
JWT_SECRET=your_secret_key_here_change_in_production
```

**Thay thế** `your_secret_key_here_change_in_production` bằng một chuỗi ngẫu nhiên mạnh.

### 2. CORS Configuration (Nếu triển khai production)

File: `Backend/server.js`

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

### 3. Environment Variables

Tạo file `.env.production`:

```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret_key
PORT=5000
```

---

## 🧪 Kiểm Tra Xem Mọi Thứ Hoạt Động

### 1. Kiểm tra MongoDB

```bash
# Mở terminal mới
mongo

# Nếu kết nối thành công, bạn sẽ thấy MongoDB shell
```

### 2. Kiểm tra Backend

```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Kiểm tra: http://localhost:5000
# Bạn sẽ thấy: "Server is running..."
```

### 3. Kiểm tra Frontend

```bash
# Terminal 2: Frontend
cd Frontend
npm run dev

# Truy cập: http://localhost:5173
# Bạn sẽ thấy: Login/Register form
```

### 4. Test API

Sử dụng Postman hoặc Thunder Client:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

- ✅ Kiểm tra MongoDB service đang chạy
- ✅ Kiểm tra MONGODB_URI trong .env
- ✅ Kiểm tra MongoDB port (default: 27017)

### "Port 5000 already in use"

```bash
# Tìm process sử dụng port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### "CORS Error"

- Frontend & Backend chạy trên 2 ports khác nhau (5173 & 5000)
- CORS đã được config trong `server.js`
- Nếu vẫn lỗi, kiểm tra `Origin` header

### "Token not valid"

- Token có hết hạn (7 ngày)
- Xóa localStorage và đăng nhập lại
- Kiểm tra `JWT_SECRET` ở Backend

### "npm install failed"

```bash
# Xóa node_modules
rm -rf node_modules package-lock.json

# Cài lại
npm install

# Hoặc sử dụng npm cache clean
npm cache clean --force
npm install
```

---

## 📚 Tài Liệu Tham Khảo

- **README.md** - Tài liệu chính
- **DEVELOPMENT.md** - Hướng dẫn phát triển
- **API_TESTING.md** - Test API
- **FEATURES_SUMMARY.md** - Danh sách tính năng

---

## 🚀 Triển Khai Production

### Backend (Heroku/Railway)

```bash
# Đảm bảo Procfile tồn tại
echo "web: npm start" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy folder `dist/`
```

---

## 💡 Tips

1. **Sử dụng VS Code Extensions:**

   - REST Client - để test API
   - MongoDB for VS Code - quản lý database
   - ES7+ React/Redux/React-Native snippets

2. **Dùng Postman:**

   - Import collection từ API_TESTING.md
   - Lưu environment variables

3. **Debug:**
   - Sử dụng console.log() ở Backend
   - Sử dụng React DevTools ở Frontend

---

## ❓ Hỏi Đáp

**Q: Tôi cần MongoDB để chạy GoPOS không?**
A: Có, GoPOS sử dụng MongoDB làm database. Bạn có thể dùng local hoặc cloud.

**Q: Tôi có thể đổi database sang SQL không?**
A: Có, nhưng cần rewrite models từ Mongoose sang ORM khác (TypeORM, Sequelize).

**Q: Frontend chạy trên port khác được không?**
A: Có, sửa trong Frontend/vite.config.ts

**Q: Làm sao để reset database?**
A: Vào MongoDB shell và xóa collection hoặc database

---

## 📞 Support

Nếu bạn gặp vấn đề:

1. Kiểm tra lại các bước setup
2. Đọc error message kỹ
3. Tra cứu trong Troubleshooting
4. Tạo issue trên GitHub

---

**Chúc bạn cài đặt thành công! 🎉**
