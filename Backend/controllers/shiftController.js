const Shift = require("../models/Shift");
const EmployeeShift = require("../models/EmployeeShift");
const User = require("../models/User");

// Create shift
exports.createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, description } = req.body;

    if (!name || !startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đủ thông tin bắt buộc" });
    }

    const shift = new Shift({
      name,
      startTime,
      endTime,
      description,
    });

    await shift.save();
    res.status(201).json({ message: "Thêm ca làm thành công", shift });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo ca làm", error: err.message });
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách ca làm", error: err.message });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, description } = req.body;

    const shift = await Shift.findByIdAndUpdate(
      id,
      { name, startTime, endTime, description },
      { new: true, runValidators: true }
    );

    if (!shift) {
      return res.status(404).json({ message: "Ca làm không tồn tại" });
    }

    res.json({ message: "Cập nhật ca làm thành công", shift });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi cập nhật ca làm", error: err.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      return res.status(404).json({ message: "Ca làm không tồn tại" });
    }

    res.json({ message: "Xóa ca làm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa ca làm", error: err.message });
  }
};

// Assign shift to employee
exports.assignShiftToEmployee = async (req, res) => {
  try {
    const { employeeId, shiftId, date } = req.body;

    if (!employeeId || !shiftId || !date) {
      return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    // Check if shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: "Ca làm không tồn tại" });
    }

    // Check if already assigned
    let employeeShift = await EmployeeShift.findOne({
      employee: employeeId,
      date,
    });

    if (employeeShift) {
      employeeShift.shift = shiftId;
    } else {
      employeeShift = new EmployeeShift({
        employee: employeeId,
        shift: shiftId,
        date,
      });
    }

    await employeeShift.save();
    await employeeShift.populate("employee shift");

    res.json({
      message: "Gán ca làm cho nhân viên thành công",
      employeeShift,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi gán ca làm", error: err.message });
  }
};

// Get employee's assigned shift for date
exports.getEmployeeShiftForDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ message: "Employee ID and date are required" });
    }

    const employeeShift = await EmployeeShift.findOne({
      employee: employeeId,
      date,
    }).populate("shift");

    res.json(employeeShift);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy ca làm", error: err.message });
  }
};

// Get all employee shifts for a date
exports.getEmployeeShiftsForDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const employeeShifts = await EmployeeShift.find({ date })
      .populate("employee", "name email")
      .populate("shift");

    res.json(employeeShifts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách ca làm", error: err.message });
  }
};
