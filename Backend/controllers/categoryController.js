// Backend/controllers/categoryController.js
const Category = require("../models/Category");

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({
      name: 1,
    });
    res.status(200).json({
      message: "Lấy danh sách danh mục thành công!",
      categories,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tên danh mục" });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Danh mục này đã tồn tại" });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      message: "Tạo danh mục thành công!",
      category,
    });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Cập nhật danh mục thành công!",
      category,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }
    res.status(200).json({
      message: "Xóa danh mục thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
