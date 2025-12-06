// Backend/routes/orderRoutes.js
const express = require("express");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getSalesReport,
} = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Specific routes trước, generic routes sau (tránh conflict)
router.get(
  "/reports/sales",
  authenticate,
  authorize("admin", "staff"),
  getSalesReport
);

router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.post("/", authenticate, createOrder);
router.put("/:id", authenticate, updateOrder);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  updateOrderStatus
);
router.put(
  "/:id/payment",
  authenticate,
  authorize("admin", "staff"),
  updatePaymentStatus
);
router.delete("/:id", authenticate, authorize("admin"), deleteOrder);

module.exports = router;
