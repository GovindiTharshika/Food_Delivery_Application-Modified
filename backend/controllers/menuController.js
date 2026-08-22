const Menu = require("../models/menu");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const Restaurant = require("../models/restaurant");
exports.getAllMenus = catchAsync(async (_0x319735, _0x3aea3b, _0x27d5b1) => {
  let _0x4e0c7e;
  if (_0x319735.params.storeId) {
    _0x4e0c7e = {
      restaurant: _0x319735.params.storeId
    };
  }
  const _0x265680 = await Menu.find(_0x4e0c7e).populate({
    path: "menu.items",
    model: "FoodItem"
  }).exec();
  _0x3aea3b.status(200).json({
    status: "success",
    count: _0x265680.length,
    data: _0x265680
  });
});
exports.createMenu = catchAsync(async (_0x574c71, _0x2df546, _0x4cd2c5) => {
  const _0x2325d4 = await Menu.create(_0x574c71.body);
  _0x2df546.status(201).json({
    status: "success",
    data: _0x2325d4
  });
});
exports.deleteMenu = catchAsync(async (_0x28f25d, _0x584036, _0x49c27e) => {
  const _0x512b19 = await Menu.findByIdAndDelete(_0x28f25d.params.menuId);
  if (!_0x512b19) {
    return _0x49c27e(new ErrorHandler("No document found with that ID", 404));
  }
  _0x584036.status(204).json({
    status: "success"
  });
});