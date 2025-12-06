// Backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_key_123", {
    expiresIn: "7d",
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tất cả các trường bắt buộc" });
    }

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    }

    // Tạo người dùng mới
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp email và mật khẩu" });
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    // So sánh mật khẩu
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    // Tạo token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      message: "Lấy thông tin thành công!",
      user,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
