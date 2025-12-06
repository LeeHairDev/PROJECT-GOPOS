const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.put("/:id/debt", customerController.updateDebt);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
