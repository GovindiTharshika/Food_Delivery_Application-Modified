const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  promisify
} = require("util");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require("cloudinary").v2;
const {
  CloudinaryStorage
} = require("multer-storage-cloudinary");
const multer = require("multer");
const signToken = _0x3f6689 => {
  return jwt.sign({
    id: _0x3f6689
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME + "d"
  });
};
const createSendToken = (_0x41eed4, _0x417ba4, _0x6c972c) => {
  const _0x3a497e = signToken(_0x41eed4._id);
  const _0x28a1fd = {
    expires: new Date(Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  _0x6c972c.cookie("jwt", _0x3a497e, _0x28a1fd);
  _0x41eed4.password = undefined;
  _0x6c972c.status(_0x417ba4).json({
    success: true,
    token: _0x3a497e,
    data: {
      user: _0x41eed4
    }
  });
};
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    transformation: [{
      width: 150,
      crop: "scale"
    }]
  }
});
const upload = multer({
  storage: storage
}).single("avatar");
exports.signup = catchAsyncErrors(async (_0x197cc2, _0x29bee0, _0x10b7bf) => {
  const {
    name: _0x185af2,
    email: _0x6aa07e,
    password: _0x1820db,
    passwordConfirm: _0x3adae8,
    phoneNumber: _0x4a7dbb
  } = _0x197cc2.body;
  if (_0x197cc2.body.avatar && !_0x197cc2.body.avatar.startsWith('data:image/')) {
    return _0x10b7bf(new ErrorHandler("Please upload an image file", 400));
  }
  const _0x45e6bc = await cloudinary.uploader.upload(_0x197cc2.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale"
  });
  const _0x581cd3 = await User.create({
    name: _0x185af2,
    email: _0x6aa07e,
    password: _0x1820db,
    passwordConfirm: _0x3adae8,
    phoneNumber: _0x4a7dbb,
    avatar: {
      public_id: _0x45e6bc.public_id,
      url: _0x45e6bc.secure_url
    }
  });
  createSendToken(_0x581cd3, 200, _0x29bee0);
});
exports.login = catchAsyncErrors(async (_0x1c324f, _0x2e7e0c, _0x26dca) => {
  const {
    email: _0x5bd883,
    password: _0x4c921f
  } = _0x1c324f.body;
  if (!_0x5bd883 || !_0x4c921f) {
    return _0x26dca(new ErrorHandler("Please enter email & password", 400));
  }
  const _0x5da503 = await User.findOne({
    email: _0x5bd883
  }).select("+password");
  if (!_0x5da503) {
    return _0x26dca(new ErrorHandler("Invalid Email or Password", 401));
  }
  const _0x52b142 = await _0x5da503.correctPassword(_0x4c921f, _0x5da503.password);
  if (!_0x52b142) {
    return _0x26dca(new ErrorHandler("Invalid Email or Password", 401));
  }
  createSendToken(_0x5da503, 200, _0x2e7e0c);
});
exports.protect = catchAsyncErrors(async (_0x29d683, _0x588e0d, _0x38ad82) => {
  let _0x5f4c81;
  if (_0x29d683.headers.authorization && _0x29d683.headers.authorization.startsWith("Bearer")) {
    _0x5f4c81 = _0x29d683.headers.authorization.split(" ")[1];
  } else if (_0x29d683.cookies.jwt) {
    _0x5f4c81 = _0x29d683.cookies.jwt;
  }
  if (!_0x5f4c81) {
    return _0x38ad82(new ErrorHandler("You are not logged in! Please log in to get access.", 404));
  }
  const _0x57d26e = await promisify(jwt.verify)(_0x5f4c81, process.env.JWT_SECRET);
  const _0x5dd63f = await User.findById(_0x57d26e.id);
  if (!_0x5dd63f) {
    return _0x38ad82(new ErrorHandler("User recently changed password ! please log in again.", 404));
  }
  if (_0x5dd63f.changedPasswordAfter(_0x57d26e.iat)) {
    return _0x38ad82(new ErrorHandler("User recently changed password ! please log in again.", 404));
  }
  _0x29d683.user = _0x5dd63f;
  _0x38ad82();
});
exports.getUserProfile = catchAsyncErrors(async (_0xfe36a6, _0x2e983e, _0x22eaed) => {
  const _0x335738 = await User.findById(_0xfe36a6.user.id);
  _0x2e983e.status(200).json({
    success: true,
    user: _0x335738
  });
});
exports.updatePassword = async (_0x2e52c8, _0x3d6d00, _0xfc75ef) => {
  try {
    console.log(_0x2e52c8.body);
    const {
      oldPassword: _0x4e4220,
      newPassword: _0x1c1a35,
      newPasswordConfirm: _0x4b4c7c
    } = _0x2e52c8.body;
    const _0x44a294 = await User.findById(_0x2e52c8.user.id).select("+password");
    const _0xfaba5e = await _0x44a294.correctPassword(_0x4e4220, _0x44a294.password);
    if (!_0xfaba5e) {
      return _0xfc75ef(new ErrorHandler("Old password is incorrect", 400));
    }
    _0x44a294.password = _0x1c1a35;
    _0x44a294.passwordConfirm = _0x4b4c7c;
    await _0x44a294.save();
    _0x3d6d00.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (_0xcf7f4a) {
    console.error(_0xcf7f4a);
    return _0xfc75ef(new ErrorHandler("Internal Server Error", 500));
  }
};
exports.updateProfile = catchAsyncErrors(async (_0x3ec468, _0x1e831d, _0x13f2db) => {
  const _0x61fffe = {
    name: _0x3ec468.body.name,
    email: _0x3ec468.body.email
  };
  if (_0x3ec468.body.avatar !== "") {
    if (!_0x3ec468.body.avatar.startsWith('data:image/')) {
      return _0x13f2db(new ErrorHandler("Please upload an image file", 400));
    }
    const _0x111291 = await User.findById(_0x3ec468.user.id);
    const _0x4ebe37 = _0x111291.avatar.public_id;
    const _0x3d4474 = await cloudinary.uploader.destroy(_0x4ebe37);
    const _0x4518d1 = await cloudinary.uploader.upload(_0x3ec468.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale"
    });
    _0x61fffe.avatar = {
      public_id: _0x4518d1.public_id,
      url: _0x4518d1.secure_url
    };
  }
  const _0x17de82 = await User.findByIdAndUpdate(_0x3ec468.user.id, _0x61fffe, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });
  _0x1e831d.status(200).json({
    success: true
  });
});
exports.forgotPassword = catchAsyncErrors(async (_0x3fb72a, _0x2bb396, _0x2baf31) => {
  const _0x3ebfdb = await User.findOne({
    email: _0x3fb72a.body.email
  });
  if (!_0x3ebfdb) {
    return _0x2baf31(new ErrorHandler("There is no user with email address .", 404));
  }
  const _0x35f32e = _0x3ebfdb.createPasswordResetToken();
  await _0x3ebfdb.save({
    validateBeforeSave: false
  });
  try {
    const _0x31b326 = process.env.FRONTEND_URL + "/users/resetPassword/" + _0x35f32e;
    await new Email(_0x3ebfdb, _0x31b326).sendPasswordReset();
    return _0x2bb396.status(200).json({
      status: "success",
      message: "Token sent to email!"
    });
  } catch (_0x2b5928) {
    _0x3ebfdb.passwordResetToken = undefined;
    _0x3ebfdb.passwordResetExpires = undefined;
    await _0x3ebfdb.save({
      validateBeforeSave: false
    });
    return _0x2baf31(new ErrorHandler("There was an error sending the email, try again later!", 500));
  }
});
exports.resetPassword = catchAsyncErrors(async (_0x3b9a1d, _0x3144be, _0x504885) => {
  const _0x50409f = crypto.createHash("sha256").update(_0x3b9a1d.params.token).digest("hex");
  const _0x13a6fd = await User.findOne({
    passwordResetToken: _0x50409f,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });
  if (!_0x13a6fd) {
    return _0x504885(new ErrorHandler("Token is invalid or has expired", 400));
  }
  _0x13a6fd.password = _0x3b9a1d.body.password;
  _0x13a6fd.passwordConfirm = _0x3b9a1d.body.passwordConfirm;
  _0x13a6fd.passwordResetToken = undefined;
  _0x13a6fd.passwordResetExpires = undefined;
  await _0x13a6fd.save();
  createSendToken(_0x13a6fd, 200, _0x3144be);
});
exports.logout = catchAsyncErrors(async (_0xe51dc6, _0x338242, _0x247115) => {
  _0x338242.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true
  });
  _0x338242.status(200).json({
    success: true,
    message: "Logged out"
  });
});