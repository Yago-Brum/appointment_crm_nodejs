const Client = require("../models/Client"); // Imports the Client model
const ErrorResponse = require("../utils/errorResponse"); // Imports the custom error class
const mongoose = require("mongoose"); // Imports mongoose to check for CastError (invalid ID)

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin, Employee)
exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find();
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (err) {
    // Sends the error to the global error handling middleware
    next(err);
  }
};

// @desc    Get a client by ID
// @route   GET /api/clients/:id
// @access  Private (Admin, Employee)
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      // If the client is not found (valid ID, but does not exist)
      return next(
        new ErrorResponse(
          `Client not found with ID ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Handles CastError (invalid ID, e.g., wrong format)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("Invalid client ID", 400));
    }
    next(err);
  }
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private (Admin, Employee)
exports.createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body); // Creates the client with the request body data

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Handles duplicate email error (MongoDB code 11000)
    if (err.code === 11000) {
      return next(
        new ErrorResponse(
          "The provided email is already registered for another client.",
          400
        )
      );
    }
    // Handles Mongoose validation errors (required fields, format, etc.)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Update a client by ID
// @route   PUT /api/clients/:id
// @access  Private (Admin, Employee)
exports.updateClient = async (req, res, next) => {
  try {
    // Finds and updates the client. 'new: true' returns the updated document,
    // 'runValidators: true' ensures Schema validations are run.
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      // If the client is not found
      return next(
        new ErrorResponse(
          `Client not found with ID ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Handles CastError (invalid ID)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("Invalid client ID", 400));
    }
    // Handles duplicate email error
    if (err.code === 11000) {
      return next(
        new ErrorResponse(
          "The provided email is already registered for another client.",
          400
        )
      );
    }
    // Handles validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Delete a client by ID
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      // If the client is not found
      return next(
        new ErrorResponse(
          `Client not found with ID ${req.params.id}`,
          404
        )
      );
    }

    // For Mongoose 6+, 'remove()' is deprecated, use 'deleteOne()'
    await client.deleteOne();

    res.status(200).json({
      success: true,
      data: {}, // Returns an empty object or a success message
    });
  } catch (err) {
    // Handles CastError (invalid ID)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("Invalid client ID", 400));
    }
    next(err);
  }
};
