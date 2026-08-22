const AppError = require("../utils/errorHandler");
const Review = require("../models/reviewModel");
const catchAsync = require("../middlewares/catchAsyncErrors");
exports.setUserRestaurantIds = (_0x32bc53, _0x517718, _0x439968) => {
  if (!_0x32bc53.body.user) {
    _0x32bc53.body.user = _0x32bc53.user.id;
  }
  if (!_0x32bc53.body.restaurant) {
    _0x32bc53.body.restaurant = _0x32bc53.params.storeId;
  }
  _0x439968();
};
exports.createReviews = catchAsync(async (_0x573641, _0x9ac81c, _0x579df3) => {
  const _0x12e1ad = await Review.create(_0x573641.body);
  _0x9ac81c.status(201).json({
    status: "success",
    data: _0x12e1ad
  });
});
exports.getAllReviews = catchAsync(async (_0x77c949, _0x52c51d, _0x224c9e) => {
  let _0x4777d4 = {};
  if (_0x77c949.params.tourId) {
    _0x4777d4 = {
      restaurant: _0x77c949.params.tourId
    };
  }
  const _0x1821ca = await Review.find(_0x4777d4);
  _0x52c51d.status(200).json({
    status: "success",
    data: _0x1821ca
  });
});
exports.getReview = catchAsync(async (_0x49f69e, _0x916bf3, _0x5777f0) => {
  const _0x155eb8 = await Review.findById(_0x49f69e.params.reviewId);
  if (!_0x155eb8) {
    return _0x5777f0(new AppError("No Review with given Id", 404));
  }
  _0x916bf3.status(200).json({
    status: "success",
    data: _0x155eb8
  });
});
exports.updateReview = catchAsync(async (_0x191b9a, _0x5a65b1, _0x9232f6) => {
  const _0xae3ca = await Review.findByIdAndUpdate(_0x191b9a.params.reviewId, _0x191b9a.body, {
    new: true,
    runValidators: true
  });
  if (!_0xae3ca) {
    return _0x9232f6(new AppError("No Review with given Id", 404));
  }
  _0x5a65b1.status(200).json({
    status: "success",
    data: _0xae3ca
  });
});
exports.deleteReview = catchAsync(async (_0x19ecb0, _0x567252, _0x3f7eed) => {
  const _0x3bab0e = await Review.findByIdAndDelete(_0x19ecb0.params.reviewId);
  if (!_0x3bab0e) {
    return _0x3f7eed(new AppError("No Review with given Id", 404));
  }
  _0x567252.status(204).json({
    status: "success"
  });
});