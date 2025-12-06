const Warehouse = require("../models/Warehouse");

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const warehouses = await Warehouse.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      warehouses,
      total: warehouses.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách kho",
      error: err.message,
    });
  }
};

// Get single warehouse by ID
exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Kho không tồn tại",
      });
    }
    res.json({
      success: true,
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin kho",
      error: err.message,
    });
  }
};

// Create new warehouse
exports.createWarehouse = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      capacity,
      description,
      manager,
      isSellingWarehouse,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên kho",
      });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      address,
      capacity: capacity || 0,
      currentStock: 0,
      description,
      manager,
      status: "active",
      isSellingWarehouse: !!isSellingWarehouse,
    });

    res.status(201).json({
      success: true,
      message: "Tạo kho thành công",
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo kho",
      error: err.message,
    });
  }
};

// Update warehouse
exports.updateWarehouse = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      capacity,
      description,
      manager,
      status,
      isSellingWarehouse,
    } = req.body;

    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location,
        address,
        capacity,
        description,
        manager,
        status,
        isSellingWarehouse,
      },
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Kho không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật kho thành công",
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật kho",
      error: err.message,
    });
  }
};

// Set this warehouse as the selling warehouse (only one allowed at a time)
exports.setSellingWarehouse = async (req, res) => {
  try {
    const { isSelling } = req.body;
    const id = req.params.id;

    // Update only this warehouse's selling flag (allow multiple selling warehouses)
    const warehouse = await Warehouse.findByIdAndUpdate(
      id,
      { isSellingWarehouse: !!isSelling },
      { new: true }
    );

    if (!warehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Kho không tồn tại" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái kho bán thành công",
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái kho bán",
      error: err.message,
    });
  }
};

// Delete warehouse
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Kho không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Xóa kho thành công",
      warehouse,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa kho",
      error: err.message,
    });
  }
};
