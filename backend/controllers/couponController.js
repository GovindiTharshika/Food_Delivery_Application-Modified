const Coupon = require("../models/couponModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
exports.createCoupon = catchAsync(async (_0x54888a, _0x29b42e, _0x568def) => {
  const _0x3e63b1 = await Coupon.create(_0x54888a.body);
  _0x29b42e.status(200).json({
    status: "success",
    data: _0x3e63b1
  });
});
exports.getCoupon = catchAsync(async (_0xc812ec, _0x44915a, _0x4142f2) => {
  const _0x52879f = await Coupon.find();
  _0x44915a.status(200).json({
    status: "success",
    data: _0x52879f
  });
});
exports.updateCoupon = catchAsync(async (_0x432c7a, _0x295156, _0x58d385) => {
  const _0x291a58 = await Coupon.findByIdAndUpdate(_0x432c7a.params.couponId, _0x432c7a.body, {
    new: true,
    runValidators: true
  });
  if (!_0x291a58) {
    return _0x58d385(new ErrorHandler("No Coupon found with that ID", 404));
  }
  _0x295156.status(200).json({
    status: "success",
    data: _0x291a58
  });
});
exports.deleteCoupon = catchAsync(async (_0x3c648d, _0xaf9a06, _0x281efd) => {
  const _0x6c84ce = await Coupon.findByIdAndDelete(_0x3c648d.params.couponId);
  if (!_0x6c84ce) {
    return _0x281efd(new ErrorHandler("No coupon found with given Id", 404));
  }
  _0xaf9a06.status(204).json({
    status: "success"
  });
});
exports.couponValidate = catchAsync(async (_0x3962d4, _0x4249c3, _0x4c186a) => {
  const {
    couponCode: _0x2d7459,
    cartItemsTotalAmount: _0x5e1d49
  } = _0x3962d4.body;
  const _0x3c0d48 = await Coupon.aggregate([{
    $addFields: {
      finalTotal: {
        $cond: [{
          $gte: [_0x5e1d49, "$minAmount"]
        }, {
          $subtract: [_0x5e1d49, {
            $min: [{
              $multiply: [_0x5e1d49, {
                $divide: ["$discount", 100]
              }]
            }, "$maxDiscount"]
          }]
        }, _0x5e1d49]
      },
      message: {
        $cond: [{
          $gte: [_0x5e1d49, "$minAmount"]
        }, "", {
          $concat: ["add ₹ ", {
            $toString: {
              $subtract: ["$minAmount", _0x5e1d49]
            }
          }, " more to avail this offer"]
        }]
      }
    }
  }, {
    $project: {
      _id: 0,
      subTitle: 1,
      couponName: 1,
      details: 1,
      minAmount: 1,
      finalTotal: 1,
      message: 1
    }
  }]);
  if (!_0x3c0d48) {
    return _0x4c186a(new ErrorHandler("Invalid coupon code.", 404));
  }
  _0x4249c3.status(200).json({
    status: "success",
    data: _0x3c0d48
  });
});