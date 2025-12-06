const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouseController");
const { authenticate } = require("../middleware/auth");

// Get all warehouses
router.get("/", warehouseController.getAllWarehouses);

// Get warehouse by ID
router.get("/:id", warehouseController.getWarehouseById);

// Create warehouse (protected)
router.post("/", authenticate, warehouseController.createWarehouse);

// Update warehouse (protected)
router.put("/:id", authenticate, warehouseController.updateWarehouse);
// Set selling warehouse (protected) - body: { isSelling: true/false }
router.put(
  "/:id/selling",
  authenticate,
  warehouseController.setSellingWarehouse
);

// Delete warehouse (protected)
router.delete("/:id", authenticate, warehouseController.deleteWarehouse);

module.exports = router;
