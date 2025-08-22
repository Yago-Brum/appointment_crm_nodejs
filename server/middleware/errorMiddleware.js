// server/middleware/errorMiddleware.js
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // copy the error object
  error.message = err.message; // copy the message from the original error

  // Log detailed error information to the console
  console.error(err.stack); // Shows the error call stack

  // Mongoose Bad ObjectId Error
  if (err.name === "CastError" && err.path === "_id") {
    const message = `Bad ObjectId: ${err.path} ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = "Duplicate Key";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(messages.join(", "), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
