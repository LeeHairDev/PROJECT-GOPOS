// Backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userControllers");
const { authenticate, authorize } = require("../middleware/auth");

// Public create (registration) or admin-create via same endpoint depending on auth
router.post("/", createUser);

// Admin routes for user management
router.get("/", authenticate, authorize("admin"), getAllUsers);
router.get("/:id", authenticate, authorize("admin"), getUserById);
router.put("/:id", authenticate, authorize("admin"), updateUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

module.exports = router;
