const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Development: include stack for debugging (server-side only, not a security risk in dev)
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Production: sanitize error — never leak stack traces or internal details
  if (process.env.NODE_ENV === "PRODUCTION") {
    let sanitizedError = { ...err };
    sanitizedError.message = err.message;

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      sanitizedError = new ErrorHandler(message, 400);
    }

    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(val => val.message).join(", ");
      sanitizedError = new ErrorHandler(message, 400);
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate value for field: ${field}. Please use another value.`;
      sanitizedError = new ErrorHandler(message, 400);
    }

    // Handle JWT invalid token
    if (err.name === "JsonWebTokenError") {
      sanitizedError = new ErrorHandler("Invalid token. Please log in again.", 401);
    }

    // Handle JWT expired token
    if (err.name === "TokenExpiredError") {
      sanitizedError = new ErrorHandler("Your token has expired. Please log in again.", 401);
    }

    return res.status(sanitizedError.statusCode || 500).json({
      success: false,
      message: sanitizedError.message || "Internal Server Error"
    });
  }
};