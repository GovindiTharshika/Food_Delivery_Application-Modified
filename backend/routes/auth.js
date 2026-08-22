const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.route("/logout").get(authController.logout);
router.route("/me").get(authController.protect, authController.getUserProfile);
router.route("/password/update").put(authController.protect, authController.updatePassword);
router.route("/me/update").put(authController.protect, authController.updateProfile);

// Google OAuth 2.0 Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Issue JWT on successful Google login and redirect to frontend
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME + "d"
    });
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000),
      httpOnly: true
    });
    res.redirect(`${process.env.FRONTEND_URL}/oauth/success?token=${token}`);
  }
);

module.exports = router;