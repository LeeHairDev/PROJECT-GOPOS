const mongoose = require("mongoose");

const EmployeeShiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique daily shift per employee
EmployeeShiftSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeShift", EmployeeShiftSchema);
