const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    checkInTime: {
      type: String, // HH:MM:SS format
      default: null,
    },
    checkOutTime: {
      type: String, // HH:MM:SS format
      default: null,
    },
    status: {
      type: String,
      enum: ["checked-in", "checked-out", "absent"],
      default: "absent",
    },
    workDuration: {
      type: String, // "Xh Ym" format
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique daily attendance per employee
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
