const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên khách hàng"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["customer", "supplier", "both"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    avatar: {
      type: String,
      default: null,
    },
    // Quản lý công nợ (Debt Management)
    debt: {
      type: Number,
      default: 0,
      min: [0, "Công nợ không thể âm"],
    },
    debtHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["add", "payment", "cancel"],
          description: "add: tăng nợ, payment: trả nợ, cancel: hủy/cộng",
        },
        amount: {
          type: Number,
          required: true,
        },
        description: String,
        orderId: mongoose.Schema.Types.ObjectId,
        note: String,
      },
    ],
    debtLimit: {
      type: Number,
      default: 0,
      description: "Hạn mức công nợ tối đa (0 = không giới hạn)",
    },
    allowDebt: {
      type: Boolean,
      default: true,
      description: "Cho phép bán nợ cho khách hàng này",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
