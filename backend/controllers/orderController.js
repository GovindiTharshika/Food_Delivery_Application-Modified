const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const {
  ObjectId
} = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
exports.newOrder = catchAsyncErrors(async (_0x4e98fd, _0xb1357, _0x22bc0d) => {
  const {
    orderItems: _0x5e63aa,
    deliveryInfo: _0x2dca76,
    itemsPrice: _0x364de6,
    taxPrice: _0x4c42aa,
    deliveryCharge: _0x41dfe3,
    finalTotal: _0x556a0,
    paymentInfo: _0x2ba91a
  } = _0x4e98fd.body;
  const _0x1e5f83 = await Order.create({
    orderItems: _0x5e63aa,
    deliveryInfo: _0x2dca76,
    itemsPrice: _0x364de6,
    taxPrice: _0x4c42aa,
    deliveryCharge: _0x41dfe3,
    finalTotal: _0x556a0,
    paymentInfo: _0x2ba91a,
    paidAt: Date.now(),
    user: _0x4e98fd.user.id,
    restaurant: _0x4e98fd.body.restaurant
  });
  _0xb1357.status(200).json({
    success: true,
    order: _0x1e5f83
  });
});
exports.getSingleOrder = catchAsyncErrors(async (_0x368eba, _0xbd839a, _0xd9457c) => {
  const _0x368eb2 = await Order.findById(_0x368eba.params.id).populate("user", "name email").populate("restaurant").exec();
  if (!_0x368eb2) {
    return _0xd9457c(new ErrorHandler("No Order found with this ID", 404));
  }
  if (_0x368eb2.user._id.toString() !== _0x368eba.user.id && _0x368eba.user.role !== 'admin') {
    return _0xd9457c(new ErrorHandler("Not authorized to view this order", 403));
  }
  _0xbd839a.status(200).json({
    success: true,
    order: _0x368eb2
  });
});
exports.myOrders = catchAsyncErrors(async (_0x3787c9, _0x2f5fa8, _0x313f57) => {
  const _0x481f34 = new ObjectId(_0x3787c9.user.id);
  const _0x24054a = await Order.find({
    user: _0x481f34
  }).populate("user", "name email").populate("restaurant").exec();
  _0x2f5fa8.status(200).json({
    success: true,
    orders: _0x24054a
  });
});
exports.allOrders = catchAsyncErrors(async (_0x4a7c76, _0x548aed, _0x3e3a3c) => {
  const _0x1dbb19 = await Order.find();
  let _0x22cf41 = 0;
  _0x1dbb19.forEach(_0x4400ec => {
    _0x22cf41 += _0x4400ec.finalTotal;
  });
  _0x548aed.status(200).json({
    success: true,
    totalAmount: _0x22cf41,
    orders: _0x1dbb19
  });
});