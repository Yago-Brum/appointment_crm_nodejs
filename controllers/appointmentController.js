const Appointment = require("../models/Appointment");
const Client = require("../models/Client"); // Pode ser útil para verificar se o cliente existe
const mongoose = require("mongoose");

// @desc    Obter todos os agendamentos
// @route   GET /api/appointments
// @access  Private (Admin, Employee)
exports.getAllAppointments = async (req, res) => {
  try {
    // Popula o campo 'client' para retornar os dados completos do cliente
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

// @desc    Obter um agendamento por ID
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
        .json({ success: false, error: "Agendamento não encontrado" });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    // Validação de ObjectId inválido
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "ID de agendamento inválido" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Criar um novo agendamento
// @route   POST /api/appointments
// @access  Private (Admin, Employee)
exports.createAppointment = async (req, res) => {
  try {
    const { client, service, date, startTime, endTime, notes } = req.body;

    // Opcional: Validar se o cliente existe antes de criar o agendamento
    const existingClient = await Client.findById(client);
    if (!existingClient) {
      return res
        .status(404)
        .json({ success: false, error: "Cliente não encontrado" });
    }

    const appointment = new Appointment({
      client,
      service,
      date,
      startTime,
      endTime,
      notes,
      createdBy: req.user.id, // Assume que o 'protect' middleware adiciona req.user
    });

    const newAppointment = await appointment.save();
    res.status(201).json({ success: true, data: newAppointment });
  } catch (err) {
    // Lidar com erros de validação do Mongoose
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Atualizar um agendamento por ID
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Employee)
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Agendamento não encontrado" });
    }

    // Se o cliente for atualizado, verificar se o novo cliente existe
    if (req.body.client && !(await Client.findById(req.body.client))) {
      return res.status(404).json({
        success: false,
        error: "Novo cliente para agendamento não encontrado",
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Retorna o documento atualizado
      runValidators: true, // Executa as validações do schema
    }).populate("client", "name email phone");

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "ID de agendamento inválido" });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Excluir um agendamento por ID
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Agendamento não encontrado" });
    }
    await appointment.deleteOne(); // Mongoose 6+ usa deleteOne() ou deleteMany()
    res.status(200).json({ success: true, data: {} }); // Retorna um objeto vazio para indicar sucesso
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "ID de agendamento inválido" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Rotas Adicionais ---

// @desc    Obter agendamentos de um cliente específico
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
        .json({ success: false, error: "ID de cliente inválido" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Obter agendamentos para o dia atual
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

// @desc    Atualizar apenas o status de um agendamento
// @route   PATCH /api/appointments/:id/status
// @access  Private (Admin, Employee)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["scheduled", "completed", "canceled", "no-show"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Status inválido fornecido." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true, runValidators: true }
    ).populate("client", "name email phone");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, error: "Agendamento não encontrado" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return res
        .status(400)
        .json({ success: false, error: "ID de agendamento inválido" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
