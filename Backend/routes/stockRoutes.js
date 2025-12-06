const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

// CRUD movements
router.get("/", stockController.getMovements);
router.post("/", stockController.createMovement);
router.delete("/:id", stockController.deleteMovement);

// Reports
router.get(
  "/report/inventory-over-time",
  stockController.reportInventoryOverTime
);
router.get("/report/top-imports", stockController.reportTopImports);

module.exports = router;
