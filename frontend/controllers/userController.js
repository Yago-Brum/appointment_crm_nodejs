const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse"); // A helper for custom errors (optional, but recommended)
const sendTokenResponse = require("../utils/generateToken");

// @desc    Get the current user (who is logged in)
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  // The 'protect' middleware adds the user to the req object
  const user = req.user; // req.user is already populated by the authentication middleware

  res.status(200).json({ success: true, data: user });
};

// @desc    Update user profile details
// @route   PUT /api/users/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    // Handles duplicate email or validation error
    if (err.code === 11000) {
      // Error code for duplicate key (email)
      return next(new ErrorResponse("The provided email is already in use.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Update user password
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password"); // Selects the password for comparison

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Current password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save(); // The 'pre-save' middleware will handle hashing the new password

  sendTokenResponse(user, 200, res); // Generates a new token after password change (security)
};

// --- Admin Functions (Optional, but useful) ---

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    // Implement pagination, filters, and sorting here if desired
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(
          `User with ID ${req.params.id} not found`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("Invalid user ID", 400));
    }
    next(err);
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body); // The password will be hashed by the 'pre-save' middleware
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse("The provided email is already in use.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          `User with ID ${req.params.id} not found`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse("The provided email is already in use.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(
          `User with ID ${req.params.id} not found`,
          404
        )
      );
    }
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
