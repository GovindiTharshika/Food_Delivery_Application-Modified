const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter valid email address"]
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Your password must be longer than 8 characters"],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please consfirm your password"],
    validate: function (_0xb2d882) {
      return _0xb2d882 === this.password;
    },
    message: "password are not same !"
  },
  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    enum: ["user", "restaurant-owner", "admin"],
    default: "user"
  },
  phoneNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});
userSchema.pre("save", async function (_0x502cd6) {
  if (!this.isModified("password")) {
    return _0x502cd6();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  _0x502cd6();
});
userSchema.methods.correctPassword = async function (_0x82086d, _0x3bd57d) {
  return await bcrypt.compare(_0x82086d, _0x3bd57d);
};
userSchema.methods.changedPasswordAfter = function (_0x33b420) {
  if (this.passwordChangedAt) {
    const _0x4f3302 = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return _0x33b420 < _0x4f3302;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const _0x44bb5a = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(_0x44bb5a).digest("hex");
  this.passwordResetExpires = Date.now() + 600000;
  return _0x44bb5a;
};
module.exports = mongoose.model("User", userSchema);