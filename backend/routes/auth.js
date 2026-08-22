const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Standard authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.route("/logout").get(authController.logout);
router.route("/me").get(authController.protect, authController.getUserProfile);
router.route("/password/update").put(authController.protect, authController.updatePassword);
router.route("/me/update").put(authController.protect, authController.updateProfile);

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH 2.0 — Google Sign-In Routes (Authorization Code Grant)
//
// Route 1: GET /api/v1/users/auth/google
//   → Initiates OAuth flow — redirects browser to Google's authorization page.
//   → Requests 'profile' and 'email' scopes from Google.
//
// Route 2: GET /api/v1/users/auth/google/callback
//   → Google redirects here after user consents.
//   → passport.authenticate exchanges the authorization code for user profile.
//   → On success: issues our app's JWT, sets it as httpOnly cookie, redirects to frontend.
//   → On failure: redirects to login page with error query param.
// ─────────────────────────────────────────────────────────────────────────────

// Step 1 — Redirect to Google's OAuth consent screen
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2 — Google callback: exchange code → profile → JWT
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    // On failure: redirect to frontend login with error flag
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    // Issue our app's JWT after successful Google authentication
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_TIME + "d" }
    );

    // Set JWT as httpOnly cookie — not accessible by JavaScript (XSS protection)
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    });

    // Redirect to frontend OAuth success handler with token in query string
    // Frontend can store token and update Redux auth state
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/success?token=${token}`
    );
  }
);

module.exports = router;