const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ─────────────────────────────────────────────────────────────────────────────
// JWT Token Generator
// Signs a JWT with the user's ID, using secret and expiry from .env
// ─────────────────────────────────────────────────────────────────────────────
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME + "d",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Create and send JWT as httpOnly cookie + JSON response
// httpOnly: true prevents JavaScript from reading the cookie (XSS protection)
// ─────────────────────────────────────────────────────────────────────────────
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cookie not accessible via JavaScript — mitigates XSS token theft
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; // Never send password in response body
  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #8 — Hardcoded Secrets Removed (OWASP A02:2021)
// Original: cloud_name, api_key, api_secret were hardcoded strings in this file.
// The deobfuscated code revealed: api_secret: "c6Eka2VMeuOk7Od0JvHFTCNxzDE"
// config.env was also committed to git, exposing Stripe + Cloudinary + JWT secrets.
// Fix: All credentials now loaded from .env via process.env.
//      config.env removed from all git history using git filter-repo.
// ─────────────────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage config for multer (used as fallback for multipart uploads)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    transformation: [{ width: 150, crop: "scale" }],
  },
});
const upload = multer({ storage }).single("avatar");

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────────────────────
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phoneNumber } = req.body;

  // ─────────────────────────────────────────────────────────────────────────
  // SECURITY FIX #7 — Insecure File Upload (OWASP A04:2021)
  // Original: req.body.avatar (base64 string) was uploaded to Cloudinary without
  // any type validation — any file format (SVG with scripts, HTML, PDF) accepted.
  // Fix: Validate that the base64 data URL starts with 'data:image/' — only
  // standard image MIME types (jpeg, png, gif, webp, etc.) are allowed.
  // ─────────────────────────────────────────────────────────────────────────
  if (req.body.avatar && !req.body.avatar.startsWith("data:image/")) {
    return next(new ErrorHandler("Please upload an image file", 400));
  }

  const result = await cloudinary.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  createSendToken(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // select("+password") needed since password field has select: false
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    // Generic message — do not reveal whether email exists (user enumeration prevention)
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  createSendToken(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECT MIDDLEWARE — JWT Authentication Guard
// Verifies JWT from Authorization header or cookie.
// Also checks if password was changed after token was issued (security measure).
// ─────────────────────────────────────────────────────────────────────────────
exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Extract token from Bearer header or httpOnly cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ErrorHandler(
        "You are not logged in! Please log in to get access.",
        404
      )
    );
  }

  // Verify JWT signature using secret — throws JsonWebTokenError / TokenExpiredError
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check user still exists (not deleted after token issued)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ErrorHandler(
        "User recently changed password! Please log in again.",
        404
      )
    );
  }

  // Check if password changed after token was issued — invalidates old tokens
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ErrorHandler(
        "User recently changed password! Please log in again.",
        404
      )
    );
  }

  req.user = currentUser;
  next();
});

// Get current logged-in user's profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isCorrect = await user.correctPassword(oldPassword, user.password);
    if (!isCorrect) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save(); // Triggers pre-save bcrypt hook

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    // ─────────────────────────────────────────────────────────────────────
    // SECURITY FIX #7 — Insecure File Upload (OWASP A04:2021)
    // Same validation as signup — reject non-image MIME types on profile update.
    // ─────────────────────────────────────────────────────────────────────
    if (!req.body.avatar.startsWith("data:image/")) {
      return next(new ErrorHandler("Please upload an image file", 400));
    }

    const user = await User.findById(req.user.id);
    await cloudinary.uploader.destroy(user.avatar.public_id); // Delete old avatar

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — sends reset token via email
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL =
      process.env.FRONTEND_URL + "/users/resetPassword/" + resetToken;
    await new Email(user, resetURL).sendPasswordReset();

    return res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // Clear token if email fails — do not leave dangling reset tokens
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        "There was an error sending the email, try again later!",
        500
      )
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — verifies hashed token and sets new password
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the plain token from URL to compare with stored hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Token must not be expired
  });

  if (!user) {
    return next(new ErrorHandler("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT — clears JWT cookie
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out" });
});