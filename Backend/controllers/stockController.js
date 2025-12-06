const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Tạo 1 movement và cập nhật quantity sản phẩm
exports.createMovement = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { product: productId, type, quantity, warehouse } = req.body;

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // If importing into a warehouse and product has no warehouse assigned, set it
    if (type === "in" && warehouse && !product.warehouse) {
      product.warehouse = warehouse;
    }

    // Điều chỉnh quantity
    if (type === "in") {
      product.quantity = (product.quantity || 0) + quantity;
    } else if (type === "out") {
      if ((product.quantity || 0) < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Số lượng xuất vượt quá tồn kho" });
      }
      product.quantity = product.quantity - quantity;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Loại movement không hợp lệ" });
    }

    await product.save({ session });

    const movement = await StockMovement.create([{ ...req.body, warehouse }], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    const created = await StockMovement.findById(movement[0]._id)
      .populate("product")
      .populate("warehouse")
      .populate("customer");

    res.status(201).json(created);
  } catch (err) {
    // If transactions are not supported (common on standalone Mongo), fall back to
    // a simple non-transactional update so local testing still works.
    try {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (e) {}
        try {
          session.endSession();
        } catch (e) {}
      }

      const { product: productId, type, quantity, warehouse } = req.body;
      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      if (type === "in") {
        if (warehouse && !product.warehouse) product.warehouse = warehouse;
        product.quantity = (product.quantity || 0) + quantity;
      } else if (type === "out") {
        if ((product.quantity || 0) < quantity) {
          return res
            .status(400)
            .json({ message: "Số lượng xuất vượt quá tồn kho" });
        }
        product.quantity = product.quantity - quantity;
      } else {
        return res.status(400).json({ message: "Loại movement không hợp lệ" });
      }

      await product.save();

      const movement = await StockMovement.create({ ...req.body, warehouse });
      const created = await StockMovement.findById(movement._id)
        .populate("product")
        .populate("warehouse")
        .populate("customer");

      // Emit real-time notification
      if (global.io) {
        const typeLabel =
          req.body.type === "in" ? "📦 Nhập kho" : "📤 Xuất kho";
        global.io.emit("notification:new", {
          type: "stock_movement",
          title: typeLabel,
          message: `${product.name} - Số lượng: ${req.body.quantity}`,
          data: movement,
          timestamp: new Date(),
        });
      }

      return res.status(201).json(created);
    } catch (err2) {
      return res
        .status(500)
        .json({ message: "Tạo movement thất bại", error: err2.message });
    }
  }
};

// Lấy danh sách movements (có filter ngày, product, type)
exports.getMovements = async (req, res) => {
  try {
    const { startDate, endDate, product, type } = req.query;
    const filter = {};
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    if (product) filter.product = product;
    if (type) filter.type = type;

    const movements = await StockMovement.find(filter)
      .populate("product")
      .populate("warehouse")
      .populate("customer")
      .sort({ date: -1 });

    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Xóa movement và đảo ngược số lượng
exports.deleteMovement = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const movement = await StockMovement.findById(req.params.id).session(
      session
    );
    if (!movement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Movement không tồn tại" });
    }

    const product = await Product.findById(movement.product).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Đảo ngược
    if (movement.type === "in") {
      if ((product.quantity || 0) < movement.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Không thể xóa movement, sẽ tạo số lượng âm" });
      }
      product.quantity = product.quantity - movement.quantity;
    } else {
      product.quantity = (product.quantity || 0) + movement.quantity;
    }

    await product.save({ session });
    await movement.remove({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Đã xóa movement" });
  } catch (err) {
    // Fallback to non-transactional behavior if transactions are unsupported
    try {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (e) {}
        try {
          session.endSession();
        } catch (e) {}
      }

      const movement = await StockMovement.findById(req.params.id);
      if (!movement)
        return res.status(404).json({ message: "Movement không tồn tại" });

      const product = await Product.findById(movement.product);
      if (!product)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });

      if (movement.type === "in") {
        if ((product.quantity || 0) < movement.quantity) {
          return res
            .status(400)
            .json({ message: "Không thể xóa movement, sẽ tạo số lượng âm" });
        }
        product.quantity = product.quantity - movement.quantity;
      } else {
        product.quantity = (product.quantity || 0) + movement.quantity;
      }

      await product.save();
      await movement.remove();

      return res.json({ message: "Đã xóa movement" });
    } catch (err2) {
      return res
        .status(500)
        .json({ message: "Xóa thất bại", error: err2.message });
    }
  }
};

// Báo cáo: inventory over time (aggregate tổng nhập - xuất theo ngày)
exports.reportInventoryOverTime = async (req, res) => {
  try {
    const { startDate, endDate, interval } = req.query; // interval: day, month
    const match = {};
    if (startDate || endDate) match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
    // Group by period and compute totals for 'in' and 'out' separately
    const groupId = {};
    if (interval === "month") {
      groupId.year = { $year: "$date" };
      groupId.month = { $month: "$date" };
    } else {
      groupId.year = { $year: "$date" };
      groupId.month = { $month: "$date" };
      groupId.day = { $dayOfMonth: "$date" };
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: groupId,
          inQty: {
            $sum: {
              $cond: [{ $eq: ["$type", "in"] }, "$quantity", 0],
            },
          },
          outQty: {
            $sum: {
              $cond: [{ $eq: ["$type", "out"] }, "$quantity", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          inQty: 1,
          outQty: 1,
        },
      },
      { $sort: { year: 1, month: 1, day: 1 } },
      {
        $addFields: {
          label: {
            $cond: [
              { $ifNull: ["$day", false] },
              {
                $concat: [
                  { $toString: "$year" },
                  "-",
                  { $toString: "$month" },
                  "-",
                  { $toString: "$day" },
                ],
              },
              {
                $concat: [{ $toString: "$year" }, "-", { $toString: "$month" }],
              },
            ],
          },
        },
      },
      {
        $project: {
          label: 1,
          inQty: 1,
          outQty: 1,
        },
      },
    ];

    const results = await StockMovement.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Lỗi báo cáo", error: err.message });
  }
};

// Báo cáo: top imported products
exports.reportTopImports = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const match = { type: "in" };
    if (startDate || endDate) match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: parseInt(limit, 10) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          product: { _id: 1, name: 1, sku: 1 },
          totalQty: 1,
        },
      },
    ];

    const results = await StockMovement.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Lỗi báo cáo", error: err.message });
  }
};
