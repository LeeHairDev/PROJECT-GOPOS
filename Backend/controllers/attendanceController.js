const Attendance = require("../models/Attendance");
const User = require("../models/User");
const EmployeeShift = require("../models/EmployeeShift");

// Check-in employee
exports.checkIn = async (req, res) => {
  try {
    const { employeeId, date } = req.body;

    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ message: "Employee ID and date are required" });
    }

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Nhân viên không tồn tại" });
    }

    // If employee has an assigned shift for the date, enforce 1-hour pre-check rule
    const employeeShift = await EmployeeShift.findOne({
      employee: employeeId,
      date,
    }).populate("shift");
    if (employeeShift && employeeShift.shift && employeeShift.shift.startTime) {
      // Build a Date object for the shift start in server local timezone (YYYY-MM-DDTHH:MM:00)
      const shiftStartStr = `${date}T${employeeShift.shift.startTime}:00`;
      const shiftStart = new Date(shiftStartStr);
      const earliestAllowed = new Date(shiftStart.getTime() - 60 * 60 * 1000); // 1 hour before
      const now = new Date();

      if (now < earliestAllowed) {
        return res
          .status(403)
          .json({
            message:
              "Chưa đến thời gian cho phép check-in. Chỉ được check-in trong vòng 1 giờ trước giờ vào ca.",
          });
      }
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // Find or create attendance record
    let attendance = await Attendance.findOne({ employee: employeeId, date });

    if (attendance) {
      // Update existing record
      attendance.checkInTime = checkInTime;
      attendance.status = "checked-in";
    } else {
      // Create new record
      attendance = new Attendance({
        employee: employeeId,
        date,
        checkInTime,
        status: "checked-in",
      });
    }

    await attendance.save();

    // Populate employee info
    await attendance.populate("employee", "name email");

    res.status(201).json({
      message: "Check-in thành công",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi check-in", error: err.message });
  }
};

// Check-out employee
exports.checkOut = async (req, res) => {
  try {
    const { employeeId, date } = req.body;

    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ message: "Employee ID and date are required" });
    }

    const now = new Date();
    const checkOutTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    let attendance = await Attendance.findOne({ employee: employeeId, date });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi check-in" });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({ message: "Nhân viên chưa check-in" });
    }

    attendance.checkOutTime = checkOutTime;
    attendance.status = "checked-out";

    // Calculate work duration
    if (attendance.checkInTime && checkOutTime) {
      const [inH, inM, inS] = attendance.checkInTime.split(":").map(Number);
      const [outH, outM, outS] = checkOutTime.split(":").map(Number);

      const inMinutes = inH * 60 + inM;
      const outMinutes = outH * 60 + outM;
      let duration = outMinutes - inMinutes;

      // Handle day boundary (e.g., night shift)
      if (duration < 0) {
        duration += 24 * 60;
      }

      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      attendance.workDuration = `${hours}h ${minutes}m`;
    }

    await attendance.save();

    // Populate employee info
    await attendance.populate("employee", "name email");

    res.json({
      message: "Check-out thành công",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi check-out", error: err.message });
  }
};

// Get attendance records for a specific date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const attendances = await Attendance.find({ date })
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    // Get all employees and mark absent
    const employees = await User.find({ role: "staff" }).select(
      "_id name email"
    );
    const attendanceMap = new Map(
      attendances.map((a) => [a.employee._id.toString(), a])
    );

    const result = attendances.length > 0 ? attendances : [];

    // Add absent employees
    for (const emp of employees) {
      if (!attendanceMap.has(emp._id.toString())) {
        result.push({
          _id: emp._id,
          employee: { _id: emp._id, name: emp.name, email: emp.email },
          date,
          checkInTime: null,
          checkOutTime: null,
          status: "absent",
          workDuration: null,
        });
      }
    }

    res.json({
      date,
      total: result.length,
      checkedIn: result.filter(
        (a) => a.status === "checked-in" || a.status === "checked-out"
      ).length,
      checkedOut: result.filter((a) => a.status === "checked-out").length,
      absent: result.filter((a) => a.status === "absent").length,
      attendances: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu attendance", error: err.message });
  }
};

// Get attendance for a specific employee
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { employee: employeeId };

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendances = await Attendance.find(filter)
      .populate("employee", "name email")
      .sort({ date: -1 });

    res.json(attendances);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu attendance", error: err.message });
  }
};

// Get all employees for attendance
exports.getEmployeesForAttendance = async (req, res) => {
  try {
    const employees = await User.find({ role: "staff" }).select(
      "_id name email"
    );
    res.json(employees);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách nhân viên", error: err.message });
  }
};

// Get attendance summary for date range
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    const attendances = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("employee", "name email");

    const summary = {};

    for (const att of attendances) {
      const empName = att.employee.name;
      if (!summary[empName]) {
        summary[empName] = {
          employee: att.employee,
          totalDays: 0,
          checkedInDays: 0,
          checkedOutDays: 0,
          absentDays: 0,
          totalHours: 0,
        };
      }

      summary[empName].totalDays += 1;

      if (att.status === "checked-in" || att.status === "checked-out") {
        summary[empName].checkedInDays += 1;
      }

      if (att.status === "checked-out") {
        summary[empName].checkedOutDays += 1;
      }

      if (att.status === "absent") {
        summary[empName].absentDays += 1;
      }

      if (att.workDuration) {
        const [hours] = att.workDuration.split("h").map(Number);
        summary[empName].totalHours += hours || 0;
      }
    }

    res.json(Object.values(summary));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy báo cáo attendance", error: err.message });
  }
};

// Get employee sales for a specific date
exports.getEmployeeSalesForDate = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ message: "Employee ID and date are required" });
    }

    const Order = require("../models/Order");

    // Get attendance record for that date
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date,
    }).populate("employee", "name email");

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi attendance" });
    }

    // Find all orders created by this employee on that date
    // Create date range for the specific date (00:00:00 to 23:59:59)
    const startOfDay = new Date(date + "T00:00:00Z");
    const endOfDay = new Date(date + "T23:59:59Z");

    const orders = await Order.find({
      user: employeeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    })
      .populate("items.product", "name price")
      .sort({ createdAt: 1 });

    // Calculate sales summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.finalTotal,
      0
    );
    const totalItems = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    res.json({
      attendance,
      sales: {
        totalOrders,
        totalRevenue,
        totalItems,
        orders: orders.map((order) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          total: order.finalTotal,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          status: order.status,
        })),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu bán hàng", error: err.message });
  }
};
