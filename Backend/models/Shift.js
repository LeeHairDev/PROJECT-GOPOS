const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên ca làm"],
      trim: true,
    },
    startTime: {
      type: String, // HH:MM format
      required: [true, "Vui lòng nhập giờ bắt đầu"],
    },
    endTime: {
      type: String, // HH:MM format
      required: [true, "Vui lòng nhập giờ kết thúc"],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", ShiftSchema);
