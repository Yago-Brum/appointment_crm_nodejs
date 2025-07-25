const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protects the routes
exports.protect = async (req, res, next) => {
  let token;

  // Checks if the token is in the Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Or if the token is in the cookies (usually the case with httpOnly)
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure the token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request (without the password)
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

exports.authorize = (allowedRolesArray) => {
  return (req, res, next) => {
    // req.user is populated by the protect middleware
    // Checks if the user exists and if the user's role is among the allowed roles
    if (!req.user || !allowedRolesArray.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `The user's role (${
            req.user ? req.user.role : "unknown"
          }) is not authorized to access this route`,
          403 // 403: Forbidden
        )
      );
    }
    next();
  };
};
