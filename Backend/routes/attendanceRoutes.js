const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../middleware/auth");

// Get all employees for attendance
router.get(
  "/employees",
  authenticate,
  attendanceController.getEmployeesForAttendance
);

// Get attendance by date
router.get("/by-date", authenticate, attendanceController.getAttendanceByDate);

// Get employee sales for date
router.get(
  "/sales/by-date",
  authenticate,
  attendanceController.getEmployeeSalesForDate
);

// Get attendance summary for date range
router.get("/summary", authenticate, attendanceController.getAttendanceSummary);

// Get attendance for specific employee
router.get(
  "/:employeeId",
  authenticate,
  attendanceController.getEmployeeAttendance
);

// Check-in
router.post("/check-in", authenticate, attendanceController.checkIn);

// Check-out
router.post("/check-out", authenticate, attendanceController.checkOut);

module.exports = router;
