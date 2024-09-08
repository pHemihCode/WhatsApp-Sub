// File: src/routes/admin.js
const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const stripeService = require("../services/stripeService");
const googleSheetsService = require("../services/googleSheetsService");

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/payments", auth, isAdmin, async (req, res) => {
  try {
    const payments = await stripeService.listPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/refund", auth, isAdmin, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const refund = await stripeService.refundPayment(paymentIntentId);
    res.json(refund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
