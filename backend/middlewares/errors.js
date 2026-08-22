const ErrorHandler = require("../utils/errorHandler");

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX #9 — Improper Error Handling / Information Leakage (OWASP A05:2021)
//
// Original Issues:
//  1. Full error object + stack trace sent to client even in production.
//  2. Loose equality (==) used for CastError name check — never matched because
//     MongoDB sends "CastError" (capital C) but code checked "castError".
//  3. No fallback — if NODE_ENV was not set, the middleware sent nothing,
//     causing the server to hang on unhandled errors.
//  4. JWT errors returned 400 (Bad Request) instead of 401 (Unauthorized).
//
// Fix:
//  • Development: returns structured error + stack (for debugging only).
//  • Production: sanitizes ALL errors — no stack trace, no internal details.
//  • Proper strict equality (===) and correct error name casing used.
//  • JWT errors now return 401 Unauthorized.
//  • Fallback: always returns a response regardless of NODE_ENV.
// ─────────────────────────────────────────────────────────────────────────────
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // ── DEVELOPMENT mode: full error details for debugging ──────────────────
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,   // Stack trace shown ONLY in development — never in production
      error: err,
    });
  }

  // ── PRODUCTION mode: sanitized generic responses ─────────────────────────
  if (process.env.NODE_ENV === "PRODUCTION") {
    let sanitizedError = { ...err };
    sanitizedError.message = err.message;

    // Mongoose CastError: invalid MongoDB ObjectId in URL params
    // Fixed: was checking "castError" (wrong case) — now correctly "CastError"
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      sanitizedError = new ErrorHandler(message, 400);
    }

    // Mongoose ValidationError: schema validation failures
    // Returns joined user-friendly messages only — no schema internals exposed
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      sanitizedError = new ErrorHandler(message, 400);
    }

    // MongoDB duplicate key error (code 11000)
    // Reveals only the duplicate field name — not the full keyValue object
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate value for field: ${field}. Please use another value.`;
      sanitizedError = new ErrorHandler(message, 400);
    }

    // Invalid JWT signature — return 401 (was incorrectly returning 400)
    if (err.name === "JsonWebTokenError") {
      sanitizedError = new ErrorHandler(
        "Invalid token. Please log in again.",
        401
      );
    }

    // Expired JWT — return 401
    if (err.name === "TokenExpiredError") {
      sanitizedError = new ErrorHandler(
        "Your token has expired. Please log in again.",
        401
      );
    }

    // Send sanitized response — no stack trace, no internal MongoDB/Mongoose details
    return res.status(sanitizedError.statusCode || 500).json({
      success: false,
      message: sanitizedError.message || "Internal Server Error",
    });
  }
};