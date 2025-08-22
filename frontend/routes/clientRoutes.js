const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Se tiver autenticação

// Rotas para clientes
router
  .route("/")
  .get(
    protect,
    authorize(["admin", "employee"]),
    clientController.getAllClients
  ) // Exemplo: apenas admin/employee podem ver todos
  .post(
    protect,
    authorize(["admin", "employee"]),
    clientController.createClient
  );

router
  .route("/:id")
  .get(protect, clientController.getClientById)
  .put(protect, authorize(["admin", "employee"]), clientController.updateClient)
  .delete(protect, authorize(["admin"]), clientController.deleteClient); // Exemplo: apenas admin pode deletar

module.exports = router;
