const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middlewares/errors");

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #4 — Missing Security Headers (OWASP A05:2021)
// Original: Express ran without any HTTP security headers, exposing the app to
// clickjacking, MIME-sniffing, and revealing "X-Powered-By: Express".
// Fix: helmet() sets X-Frame-Options, X-Content-Type-Options, HSTS, CSP, etc.
// ─────────────────────────────────────────────────────────────────────────────
const helmet = require("helmet");
app.use(helmet());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH 2.0 — Session & Passport Initialization (Google OAuth)
// express-session is required by passport to persist user login state
// across the OAuth redirect flow (Authorization Code Grant).
// JWT is issued after successful Google authentication in the callback route.
// ─────────────────────────────────────────────────────────────────────────────
const session = require("express-session");
const passport = require("passport");

app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Load Google OAuth Strategy (passport-google-oauth20)
require("./utils/passport");

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #1 — NoSQL Injection (OWASP A03:2021)
// Original: req.body/req.query passed directly into MongoDB queries.
// Attackers could inject operators like { "$gt": "" } to bypass authentication.
// Fix: express-mongo-sanitize strips keys beginning with '$' or containing '.'
// from req.body, req.query, and req.params before they reach any controller.
// ─────────────────────────────────────────────────────────────────────────────
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #2 — Cross-Site Scripting / XSS (OWASP A03:2021)
// Original: User inputs (reviews, names, etc.) stored without sanitization.
// Attackers could inject <script> tags that execute in victims' browsers.
// Fix: xss-clean encodes dangerous HTML characters in all incoming request data.
// ─────────────────────────────────────────────────────────────────────────────
const xss = require("xss-clean");
app.use(xss());

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #3 — No Rate Limiting / Brute Force (OWASP A07:2021)
// Original: No rate limiting on any endpoint — login/forgot-password could be
// hit unlimited times allowing brute-force, credential stuffing, and DoS.
// Fix: express-rate-limit restricts each IP to 100 requests per 15 minutes
// across all /api routes. Returns 429 Too Many Requests on violation.
// ─────────────────────────────────────────────────────────────────────────────
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  max: 100,                              // Maximum 100 requests per window
  windowMs: 15 * 60 * 1000,             // 15-minute sliding window
  message:
    "Too many requests from this IP, please try again in 15 minutes.",
});
app.use("/api", limiter);               // Applied to ALL /api/* routes

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #8 (partial) — Hardcoded Cloudinary Credentials (OWASP A02:2021)
// Original: cloud_name, api_key, api_secret were hardcoded in authController.js
// and config.env was committed to git, exposing all secrets publicly.
// Fix: All credentials loaded from environment variables via .env file.
//      config.env removed from git history using git-filter-repo.
// ─────────────────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route registrations
const foodRouter = require("./routes/foodItem");
const restaurant = require("./routes/restaurant");
const menuRouter = require("./routes/menu");
const coupon = require("./routes/couponRoutes");
const review = require("./routes/reviewsRoutes");
const order = require("./routes/order");
const auth = require("./routes/auth");
const payment = require("./routes/payment");

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

app.use("/api/v1/eats", foodRouter);
app.use("/api/v1/eats/menus", menuRouter);
app.use("/api/v1/eats/stores", restaurant);
app.use("/api/v1/eats/orders", order);
app.use("/api/v1/reviews", review);
app.use("/api/v1/users", auth);
app.use("/api/v1", payment);
app.use("/api/v1/coupon", coupon);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #9 — Improper Error Handling (OWASP A05:2021)
// Global error handler middleware (see middlewares/errors.js) ensures
// stack traces and internal error details are never sent to clients in production.
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;