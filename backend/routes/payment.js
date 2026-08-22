const express = require("express");
const authController = require("../controllers/authController");
const { processPayment, sendStripApi } = require("../controllers/paymentController");

const router = express.Router();

router.post("/payment/process", authController.protect, processPayment);
router.get("/stripeapi", sendStripApi);

module.exports = router;
