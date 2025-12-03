// Backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // Trường "name"
    name: {
      type: String,
      required: [true, "Vui lòng thêm tên người dùng"], // Bắt buộc
    },
    // Trường "email"
    email: {
      type: String,
      required: true,
      unique: true, // Quan trọng: Đảm bảo email không trùng lặp
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng điền địa chỉ email hợp lệ",
      ],
    },
  },
  {
    timestamps: true, // Tự động thêm các trường createdAt và updatedAt
  }
);

// Xuất Model để Controller có thể sử dụng
module.exports = mongoose.model("User", UserSchema);
