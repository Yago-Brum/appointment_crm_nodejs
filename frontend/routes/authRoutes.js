const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // O middleware 'protect' para rotas protegidas

const router = express.Router();

// Rotas de Autenticação
router.post("/register", register); // Rota para registar novos utilizadores
router.post("/login", login); // Rota para login de utilizadores
router.get("/logout", protect, logout); // Rota para logout (requer estar logado para deslogar)

module.exports = router;
