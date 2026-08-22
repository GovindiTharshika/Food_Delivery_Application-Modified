const Restaurant = require("../models/restaurant");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllRestaurants = catchAsync(async (_0x368ed1, _0x4468b7, _0x34430a) => {
  const _0x4b1bd5 = new APIFeatures(Restaurant.find(), _0x368ed1.query).search().sort();
  const _0x4c7960 = await _0x4b1bd5.query;
  _0x4468b7.status(200).json({
    status: "success",
    count: _0x4c7960.length,
    restaurants: _0x4c7960
  });
});
exports.createRestaurant = catchAsync(async (_0x27c62a, _0xd03e80, _0x4a060b) => {
  const _0x62f0ff = await Restaurant.create(_0x27c62a.body);
  _0xd03e80.status(201).json({
    status: "success",
    data: _0x62f0ff
  });
});
exports.getRestaurant = catchAsync(async (_0x30e535, _0x5f98b1, _0x4487d1) => {
  const _0x39604f = await Restaurant.findById(_0x30e535.params.storeId);
  if (!_0x39604f) {
    return _0x4487d1(new ErrorHandler("No Restaurant found with that ID", 404));
  }
  _0x5f98b1.status(200).json({
    status: "success",
    data: _0x39604f
  });
});
exports.deleteRestaurant = catchAsync(async (_0x51e932, _0x2c5230, _0x114649) => {
  const _0x442503 = await Restaurant.findByIdAndDelete(_0x51e932.params.storeId);
  if (!_0x442503) {
    return _0x114649(new ErrorHandler("No document found with that ID", 404));
  }
  _0x2c5230.status(204).json({
    status: "success"
  });
});