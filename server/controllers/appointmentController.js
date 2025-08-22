const Appointment = require("../models/Appointment");
const Client = require("../models/Client"); // verify if this is needed 
const mongoose = require("mongoose");

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Admin, Employee)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate(
      "client",
      "name email phone"
    );
    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (Admin, Employee)
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "client",
      "name email phone"
    );
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    // Validate ObjectId invalid
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "Appointment ID invalid" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Admin, Employee)
exports.createAppointment = async (req, res) => {
  try {
    const { client, service, date, startTime, endTime, notes } = req.body;

    // validate required fields
    const existingClient = await Client.findById(client);
    if (!existingClient) {
      return res
        .status(404)
        .json({ success: false, error: "Client not found" });
    }

    const appointment = new Appointment({
      client,
      service,
      date,
      startTime,
      endTime,
      notes,
      createdBy: req.user.id, // Assuming req.user is populated with the authenticated user's info
    });

    const newAppointment = await appointment.save();
    res.status(201).json({ success: true, data: newAppointment });
  } catch (err) {
    // Validate ObjectId invalid
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update an appointment by ID
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Employee)
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }

    // Check if the client exists before updating
    if (req.body.client && !(await Client.findById(req.body.client))) {
      return res.status(404).json({
        success: false,
        error: "New cliente not found",
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // responses the updated document
      runValidators: true, // validates the updated document against the schema
    }).populate("client", "name email phone");

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "Appointment ID invalid" });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    delete an appointment by ID
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }
    await appointment.deleteOne(); // Mongoose 6+ usa deleteOne() ou deleteMany()
    res.status(200).json({ success: true, data: {} }); // return empty object on success
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "Appointment ID invalid" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Rotas Adicionais ---

// @desc    get appointments by client ID
// @route   GET /api/appointments/client/:clientId
// @access  Private (Admin, Employee)
exports.getAppointmentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const appointments = await Appointment.find({ client: clientId }).populate(
      "client",
      "name email phone"
    );
    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "client") {
      return res
        .status(400)
        .json({ success: false, error: "Client ID invalid" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    get appointments for today
// @route   GET /api/appointments/today
// @access  Private (Admin, Employee)
exports.getAppointmentsForToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("client", "name email phone");

    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Admin, Employee)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["scheduled", "completed", "canceled", "no-show"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "States invalid." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    ).populate("client", "name email phone");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Appointment not found" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "invalid appointmet ID" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
