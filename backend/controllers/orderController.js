const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const { ObjectId } = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    deliveryInfo,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    finalTotal,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    deliveryInfo,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    finalTotal,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
    restaurant: req.body.restaurant,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get a single order by ID
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SECURITY FIX #5 — Insecure Direct Object Reference / IDOR (OWASP A01:2021)
  // Original: Any authenticated user could access ANY order by guessing its ID.
  // There was no check that the order belongs to the requesting user.
  // Fix: Compare order.user._id with req.user.id — only the owner or an admin
  // is allowed to view the order. Returns 403 Forbidden for unauthorized access.
  // ─────────────────────────────────────────────────────────────────────────
  if (
    order.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorHandler("Not authorized to view this order", 403)
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get all orders for the logged-in user
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = new ObjectId(req.user.id);
  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  res.status(200).json({
    success: true,
    orders,
  });
});

// Admin: Get all orders with total revenue
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.finalTotal;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});