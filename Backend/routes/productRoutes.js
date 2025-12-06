// Backend/routes/productRoutes.js
const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, authorize("admin", "staff"), createProduct);
router.put("/:id", authenticate, authorize("admin", "staff"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);
router.put(
  "/:id/stock",
  authenticate,
  authorize("admin", "staff"),
  updateStock
);

module.exports = router;
