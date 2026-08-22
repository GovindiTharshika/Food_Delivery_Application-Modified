const Fooditem = require("../models/foodItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllFoodItems = catchAsync(async (_0x36a7ba, _0x52905b, _0xb7e9e8) => {
  let _0x2ee446 = {};
  if (_0x36a7ba.params.storeId) {
    _0x2ee446 = {
      restaurant: _0x36a7ba.params.storeId
    };
  }
  const _0x6fda5c = await Fooditem.find(_0x2ee446);
  _0x52905b.status(200).json({
    status: "success",
    results: _0x6fda5c.length,
    data: _0x6fda5c
  });
});
exports.createFoodItem = catchAsync(async (_0x58521a, _0x31e7ef, _0x3dc0f1) => {
  const _0xd5210c = await Fooditem.create(_0x58521a.body);
  _0x31e7ef.status(201).json({
    status: "success",
    data: _0xd5210c
  });
});
exports.getFoodItem = catchAsync(async (_0x2c390c, _0x2103b9, _0x311d86) => {
  const _0xa5fd27 = await Fooditem.findById(_0x2c390c.params.foodId);
  if (!_0xa5fd27) {
    return _0x311d86(new ErrorHandler("No foodItem found with that ID", 404));
  }
  _0x2103b9.status(200).json({
    status: "success",
    data: _0xa5fd27
  });
});
exports.updateFoodItem = catchAsync(async (_0x321eec, _0x47ff8b, _0x28d8af) => {
  const _0x570a13 = await Fooditem.findByIdAndUpdate(_0x321eec.params.foodId, _0x321eec.body, {
    new: true,
    runValidators: true
  });
  if (!_0x570a13) {
    return _0x28d8af(new ErrorHandler("No document found with that ID", 404));
  }
  _0x47ff8b.status(200).json({
    status: "success",
    data: _0x570a13
  });
});
exports.deleteFoodItem = catchAsync(async (_0x2bc94e, _0x41c58d, _0x50adee) => {
  const _0x171ad1 = await Fooditem.findByIdAndDelete(_0x2bc94e.params.foodId);
  if (!_0x171ad1) {
    return _0x50adee(new ErrorHandler("No document found with that ID", 404));
  }
  _0x41c58d.status(204).json({
    status: "success"
  });
});