const express = require("express");
const {
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Middleware de autenticação e autorização

const router = express.Router();

// Rotas para o utilizador logado (perfil pessoal)
router.route("/me").get(protect, getMe);
router.route("/updatedetails").put(protect, updateDetails);
router.route("/updatepassword").put(protect, updatePassword);

// Rotas para gestão de utilizadores (apenas para Admin)
router
  .route("/")
  .get(protect, authorize(["admin"]), getUsers)
  .post(protect, authorize(["admin"]), createUser);

router
  .route("/:id")
  .get(protect, authorize(["admin"]), getUser)
  .put(protect, authorize(["admin"]), updateUser)
  .delete(protect, authorize(["admin"]), deleteUser);

module.exports = router;
