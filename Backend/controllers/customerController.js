const Customer = require("../models/Customer");

// Lấy danh sách khách hàng
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Lấy 1 khách hàng theo id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Tạo khách hàng
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Dữ liệu không hợp lệ", error: err.message });
  }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json({ message: "Đã xóa khách hàng" });
  } catch (err) {
    res.status(500).json({ message: "Xóa thất bại", error: err.message });
  }
};

// Cập nhật công nợ khách hàng
exports.updateDebt = async (req, res) => {
  try {
    const { type, amount, note } = req.body;

    if (!type || !amount) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp loại và số tiền" });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    // Tính toán công nợ mới
    let newDebt = customer.debt || 0;
    if (type === "add") {
      newDebt += amount;
    } else if (type === "payment") {
      newDebt -= amount;
      if (newDebt < 0) newDebt = 0;
    } else if (type === "cancel") {
      newDebt += amount;
    }

    // Kiểm tra hạn mức nợ
    if (customer.debtLimit > 0 && newDebt > customer.debtLimit) {
      return res.status(400).json({
        message: `Vượt quá hạn mức công nợ. Hạn mức: ${customer.debtLimit.toLocaleString(
          "vi-VN"
        )}₫`,
      });
    }

    // Thêm vào lịch sử
    customer.debtHistory.push({
      type,
      amount,
      description: `${
        type === "add" ? "Tăng nợ" : type === "payment" ? "Thanh toán" : "Hủy"
      }`,
      note,
    });

    // Cập nhật công nợ
    customer.debt = newDebt;
    await customer.save();

    res.status(200).json({
      message: "Cập nhật công nợ thành công!",
      customer,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi cập nhật công nợ", error: err.message });
  }
};
