const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse"); // For custom error handling
const sendTokenResponse = require("../utils/generateToken");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      // The role can be set here, but usually in public registrations it is 'employee' or 'client'
      // If admins are creating users, the role would come from the frontend or be hardcoded.
      // For simplicity, assuming that for a CRM, open registrations would be 'employee'
      // Or you can remove 'role' from the request body and set it as 'employee' by default in the model.
      role: role || "employee", // If 'role' is not provided, default to 'employee'
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return next(
        new ErrorResponse("The provided email is already registered.", 400)
      );
    }
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err); // Pass other errors to the global error handling middleware
  }
};

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    // Check user
    const user = await User.findOne({ email }).select("+password"); // We need the password to compare

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401)); // 401: Unauthorized
    }

    // Check password
    const isMatch = await user.matchPassword(password); // Method defined in the User model

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    User logout / Clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  // To logout, simply clear the token cookie
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
