const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },

  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECURITY FIX #6 — Weak Password Policy (OWASP A07:2021)
  // Original: Only enforced a minimum length of 6 characters.
  // Users could set trivially weak passwords like "123456" or "password".
  // Fix: Password must now be at least 8 characters and include:
  //   • At least one uppercase letter  (A-Z)
  //   • At least one lowercase letter  (a-z)
  //   • At least one digit             (0-9)
  //   • At least one special character (@$!%*?&)
  // This prevents dictionary attacks and credential stuffing.
  // ─────────────────────────────────────────────────────────────────────────
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Your password must be longer than 8 characters"],
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          v
        );
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
    select: false, // Never returned in query results by default
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: function (val) {
      // Only runs on CREATE and SAVE — not on findOneAndUpdate
      return val === this.password;
    },
    message: "Passwords are not the same!",
  },

  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  role: {
    type: String,
    enum: ["user", "restaurant-owner", "admin"],
    default: "user",
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  passwordChangedAt: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash password before saving to DB (bcrypt work factor: 12)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // bcrypt with cost factor 12 — slow enough to resist brute-force
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Never persist passwordConfirm to DB
  next();
});

// Compare entered password with hashed DB password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after a JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate a secure password reset token (sha256 hashed, 10 min expiry)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 600000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);