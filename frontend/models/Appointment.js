const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client", // Reference to the Client model
    required: true,
  },
  service: {
    type: String, // Or ObjectId, ref: 'Service' if you create a Service model
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // E.g.: "09:00", or can be Date for more precision
    required: true,
  },
  endTime: {
    type: String, // E.g.: "10:00"
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "canceled", "no-show"],
    default: "scheduled",
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    // Who created the appointment in the CRM
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
