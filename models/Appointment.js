const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client", // Referência ao modelo Client
    required: true,
  },
  service: {
    type: String, // Ou ObjectId, ref: 'Service' se você criar um modelo Service
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Ex: "09:00", ou pode ser Date para maior precisão
    required: true,
  },
  endTime: {
    type: String, // Ex: "10:00"
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
    // Quem criou o agendamento no CRM
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
