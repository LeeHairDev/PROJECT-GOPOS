const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const { authenticate, authorize } = require("../middleware/auth");

// Assign shift to employee (MUST be before /:id routes)
router.post(
  "/assign",
  authenticate,
  authorize("admin"),
  shiftController.assignShiftToEmployee
);

// Get all employee shifts for a date
router.get("/by-date", authenticate, shiftController.getEmployeeShiftsForDate);

// Get employee's shift for date
router.get(
  "/employee/:employeeId",
  authenticate,
  shiftController.getEmployeeShiftForDate
);

// Get all shifts
router.get("/", authenticate, shiftController.getAllShifts);

// Create shift
router.post("/", authenticate, authorize("admin"), shiftController.createShift);

// Update shift
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  shiftController.updateShift
);

// Delete shift
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  shiftController.deleteShift
);

module.exports = router;
