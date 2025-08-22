const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Middleware de autenticação e autorização

// Rotas para Agendamentos

// GET /api/appointments: Obter todos os agendamentos (pode ter filtros)
// POST /api/appointments: Criar um novo agendamento
router
  .route("/")
  .get(
    protect,
    authorize(["admin", "employee"]),
    appointmentController.getAllAppointments
  )
  .post(
    protect,
    authorize(["admin", "employee"]),
    appointmentController.createAppointment
  );

// GET /api/appointments/today: Obter agendamentos para o dia atual
router.get(
  "/today",
  protect,
  authorize(["admin", "employee"]),
  appointmentController.getAppointmentsForToday
);

// GET /api/appointments/client/:clientId: Obter agendamentos de um cliente específico
router.get(
  "/client/:clientId",
  protect,
  authorize(["admin", "employee"]),
  appointmentController.getAppointmentsByClient
);

// GET /api/appointments/:id: Obter um agendamento específico por ID
// PUT /api/appointments/:id: Atualizar um agendamento específico por ID
// DELETE /api/appointments/:id: Excluir um agendamento específico por ID
router
  .route("/:id")
  .get(
    protect,
    authorize(["admin", "employee"]),
    appointmentController.getAppointmentById
  )
  .put(
    protect,
    authorize(["admin", "employee"]),
    appointmentController.updateAppointment
  )
  .delete(
    protect,
    authorize(["admin"]),
    appointmentController.deleteAppointment
  ); // Apenas admin pode deletar

// PATCH /api/appointments/:id/status: Atualizar apenas o status de um agendamento
router.patch(
  "/:id/status",
  protect,
  authorize(["admin", "employee"]),
  appointmentController.updateAppointmentStatus
);

module.exports = router;
