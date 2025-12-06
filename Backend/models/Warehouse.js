const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên kho"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      min: [0, "Sức chứa không được âm"],
      default: 0,
    },
    currentStock: {
      type: Number,
      min: [0, "Tồn kho không được âm"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    description: {
      type: String,
      trim: true,
    },
    manager: {
      type: String,
      trim: true,
    },
    isSellingWarehouse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Warehouse", WarehouseSchema);
