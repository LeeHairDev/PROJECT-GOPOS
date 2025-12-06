// Backend/controllers/productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Thêm tìm kiếm theo tên hoặc SKU hoặc barcode
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category")
      .populate("warehouse")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công!",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

// @desc    Lấy chi tiết một sản phẩm
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("warehouse");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private (Admin/Staff)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      category,
      sku,
      image,
      status,
      warehouse,
    } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp tất cả các trường bắt buộc" });
    }

    // Kiểm tra category có tồn tại
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }

    // Kiểm tra sku có trùng hay không
    if (sku) {
      const existingSku = await Product.findOne({ sku: sku.trim() });
      if (existingSku) {
        return res.status(400).json({
          message: "SKU đã tồn tại",
          error: `SKU ${sku} đã được sử dụng`,
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      quantity: quantity || 0,
      category,
      sku,
      image,
      status: status || "active",
      warehouse: warehouse || undefined,
    });

    // Emit real-time notification
    if (global.io) {
      global.io.emit("notification:new", {
        type: "product_created",
        title: "📦 Sản phẩm mới",
        message: `${name} - ${price.toLocaleString("vi-VN")}₫`,
        data: product,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Tạo sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private (Admin/Staff)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }

    const {
      name,
      description,
      price,
      quantity,
      category,
      sku,
      image,
      status,
      warehouse,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ message: "Danh mục không tìm thấy" });
      }
    }

    // Nếu cập nhật SKU, kiểm tra trùng SKU với sản phẩm khác
    if (sku) {
      const existingSku = await Product.findOne({
        sku: sku.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingSku) {
        return res.status(400).json({
          message: "SKU đã tồn tại",
          error: `SKU ${sku} đã được sử dụng bởi sản phẩm khác`,
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        quantity,
        category,
        sku,
        image,
        status,
        warehouse,
      },
      { new: true, runValidators: true }
    )
      .populate("category")
      .populate("warehouse");

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json({
      message: "Xóa sản phẩm thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

// @desc    Cập nhật tồn kho sản phẩm
// @route   PUT /api/products/:id/stock
// @access  Private (Admin/Staff)
const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "Vui lòng cung cấp số lượng" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }

    res.status(200).json({
      message: "Cập nhật tồn kho thành công!",
      product,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tồn kho:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
