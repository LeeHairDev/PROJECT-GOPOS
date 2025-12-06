// Backend/controllers/userController.js
const User = require("../models/User");

// @desc    Tạo một người dùng mới (admin hoặc public for registration)
// @route   POST /api/users
// @access  Public (admin-create uses admin middleware)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "staff", phone, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tên, email và mật khẩu." });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
    });

    res
      .status(201)
      .json({ message: "Người dùng đã được tạo thành công!", data: newUser });
  } catch (error) {
    let message = "Lỗi Server nội bộ.";
    if (error.code === 11000) {
      message = "Email này đã được sử dụng (Lỗi trùng lặp).";
      return res.status(400).json({ message });
    }
    console.error("Lỗi khi tạo User:", error);
    res.status(500).json({ message });
  }
};

// @desc Get all employees/users (admin)
// @route GET /api/users
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ value: users, count: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
  }
};

// @desc Get single user
// @route GET /api/users/:id
// @access Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy người dùng" });
  }
};

// @desc Update user
// @route PUT /api/users/:id
// @access Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, address, status, password, avatar } =
      req.body;
    const update = { name, email, role, phone, address, status };
    if (avatar) update.avatar = avatar;
    // If password provided, set it (will be hashed by pre-save)
    if (password) update.password = password;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tìm thấy" });

    Object.assign(user, update);
    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json({ message: "Cập nhật thành công", user: out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tìm thấy" });
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi xóa người dùng" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
