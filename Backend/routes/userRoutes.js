// Backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userControllers"); // Import logic xử lý

// Route POST /api/users (để tạo người dùng mới)
// Lưu ý: Chỉ cần '/', vì nó đã được gắn /api/users trong server.js
router.post("/", createUser);

// Ví dụ: Thêm route GET /api/users (để lấy tất cả người dùng)
// Bạn cần tạo hàm getUsers trong controllers/userController.js
// router.get("/", getUsers);
module.exports = router; // <-- PHẢI CÓ DÒNG NÀY ĐỂ XUẤT ROUTER
