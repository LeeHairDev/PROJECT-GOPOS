// Backend/controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

// Hàm tạo số đơn hàng duy nhất
const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const timestamp = Date.now();
  return `ORD-${timestamp}-${count + 1}`;
};

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "name price sku")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công!",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Lấy chi tiết một đơn hàng
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    res.status(200).json({
      message: "Lấy chi tiết đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      discount = 0,
      tax = 0,
      paymentMethod,
      customerName,
      customerPhone,
      customerId,
      notes,
      isDebt = false,
      debtAmount = 0,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Đơn hàng phải có ít nhất một sản phẩm" });
    }

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn phương thức thanh toán" });
    }

    // Kiểm tra và cập nhật tồn kho
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Sản phẩm ${item.product} không tìm thấy` });
      }

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Sản phẩm ${product.name} không đủ tồn kho` });
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      // Cập nhật tồn kho
      await Product.findByIdAndUpdate(
        item.product,
        { quantity: product.quantity - item.quantity },
        { new: true }
      );
    }

    const finalTotal = total - discount + tax;
    const orderNumber = await generateOrderNumber();

    // Nếu bán nợ, cập nhật công nợ khách hàng
    let paidAmount = finalTotal;
    let paymentStatus = "paid";

    if (isDebt && customerId) {
      const Customer = require("../models/Customer");
      const customer = await Customer.findById(customerId);

      if (customer) {
        // Kiểm tra hạn mức nợ
        if (
          customer.debtLimit > 0 &&
          customer.debt + debtAmount > customer.debtLimit
        ) {
          return res.status(400).json({
            message: `Vượt quá hạn mức công nợ. Hiện tại nợ: ${customer.debt.toLocaleString()}₫, hạn mức: ${customer.debtLimit.toLocaleString()}₫`,
          });
        }

        // Thêm vào lịch sử công nợ
        customer.debtHistory.push({
          type: "add",
          amount: debtAmount,
          description: `Bán nợ đơn hàng ${orderNumber}`,
          orderId: null,
          note: notes,
        });

        // Cập nhật tổng công nợ
        customer.debt += debtAmount;
        paidAmount = finalTotal - debtAmount;
        paymentStatus = debtAmount === finalTotal ? "unpaid" : "partial";

        await customer.save();
      }
    }

    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: orderItems,
      total,
      discount,
      tax,
      finalTotal,
      paymentMethod,
      customerName,
      customerPhone,
      notes,
      status: "pending",
      paymentStatus: paymentStatus,
      customerId: customerId || null,
      isDebt: isDebt && debtAmount > 0,
      debtAmount: isDebt ? debtAmount : 0,
    });

    const populatedOrder = await order.populate("user", "name email phone");

    // Emit real-time notification
    if (global.io) {
      const debtText =
        isDebt && debtAmount > 0
          ? ` (Nợ: ${debtAmount.toLocaleString("vi-VN")}₫)`
          : "";
      global.io.emit("notification:new", {
        type: "order_created",
        title: "🛍️ Đơn hàng mới",
        message: `Đơn hàng ${populatedOrder.orderNumber} từ ${
          customerName || "Khách hàng"
        } - ${finalTotal.toLocaleString("vi-VN")}₫${debtText}`,
        data: populatedOrder,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Staff)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Trạng thái đơn hàng không hợp lệ" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    // Emit real-time notification
    if (global.io) {
      const statusLabels = {
        pending: "⏳ Chờ xử lý",
        completed: "✅ Hoàn thành",
        cancelled: "❌ Hủy",
      };
      global.io.emit("notification:new", {
        type: "order_status_updated",
        title: "🔔 Cập nhật đơn hàng",
        message: `Đơn hàng ${order.orderNumber} - ${statusLabels[status]}`,
        data: order,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Cập nhật trạng thái thanh toán
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin/Staff)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (
      !paymentStatus ||
      !["unpaid", "paid", "refunded"].includes(paymentStatus)
    ) {
      return res
        .status(400)
        .json({ message: "Trạng thái thanh toán không hợp lệ" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    // Emit real-time notification
    if (global.io) {
      const paymentLabels = {
        unpaid: "⏳ Chưa thanh toán",
        paid: "💰 Đã thanh toán",
        refunded: "↩️ Hoàn tiền",
      };
      global.io.emit("notification:new", {
        type: "payment_status_updated",
        title: "💳 Cập nhật thanh toán",
        message: `Đơn hàng ${order.orderNumber} - ${paymentLabels[paymentStatus]}`,
        data: order,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái thanh toán thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Xóa đơn hàng
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    // Hoàn lại tồn kho
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await Product.findByIdAndUpdate(
          item.product,
          { quantity: product.quantity + item.quantity },
          { new: true }
        );
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Xóa đơn hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Lấy báo cáo doanh số
// @route   GET /api/orders/reports/sales
// @access  Private
const getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "completed",
      paymentStatus: "paid",
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.finalTotal,
      0
    );
    const averageOrderValue = totalRevenue / totalOrders || 0;

    // Tính theo ngày
    const salesByDay = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { count: 0, revenue: 0 };
      }
      salesByDay[date].count += 1;
      salesByDay[date].revenue += order.finalTotal;
    });

    res.status(200).json({
      message: "Lấy báo cáo doanh số thành công!",
      report: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        salesByDay,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo doanh số:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

// @desc    Cập nhật đơn hàng (trạng thái, ghi chú, etc)
// @route   PUT /api/orders/:id
// @access  Private (Admin/Staff)
const updateOrder = async (req, res) => {
  try {
    const { status, notes, paymentStatus } = req.body;

    // Validate status if provided
    if (status && !["pending", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Trạng thái đơn hàng không hợp lệ" });
    }

    // Validate paymentStatus if provided
    if (
      paymentStatus &&
      !["unpaid", "paid", "refunded"].includes(paymentStatus)
    ) {
      return res
        .status(400)
        .json({ message: "Tình trạng thanh toán không hợp lệ" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("user", "name email phone")
      .populate("items.product", "name price sku")
      .populate("customerId");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    // Nếu cập nhật thành thanh toán hoàn toàn, cập nhật công nợ khách hàng
    if (paymentStatus === "paid" && order.debtAmount > 0 && order.customerId) {
      const Customer = require("../models/Customer");
      const customer = await Customer.findById(
        order.customerId._id || order.customerId
      );

      if (customer) {
        // Trừ số nợ
        customer.debt = Math.max(0, (customer.debt || 0) - order.debtAmount);

        // Thêm vào lịch sử nợ
        customer.debtHistory.push({
          type: "payment",
          amount: order.debtAmount,
          description: `Thanh toán nợ đơn hàng ${order.orderNumber}`,
          orderId: order._id,
          note: notes || "Thanh toán nợ đơn hàng",
        });

        await customer.save();
      }
    }

    res.status(200).json({
      message: "Cập nhật đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getSalesReport,
};
