const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse"); // Para tratamento de erros customizado
const sendTokenResponse = require("../utils/generateToken");

// @desc    Registar novo utilizador
// @route   POST /api/auth/register
// @access  Public (qualquer um pode registar)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Criar utilizador
    const user = await User.create({
      name,
      email,
      password,
      // A role pode ser definida aqui, mas geralmente em registos públicos é 'employee' ou 'client'
      // Se for para admins criarem utilizadores, a role viria do frontend ou seria hardcoded.
      // Por simplicidade, assumindo que para um CRM, registos abertos seriam 'employee'
      // Ou você pode remover 'role' do corpo da requisição e defini-lo como 'employee' por padrão no modelo.
      role: role || "employee", // Se 'role' não for fornecido, default para 'employee'
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    // Lidar com erro de email duplicado
    if (err.code === 11000) {
      return next(
        new ErrorResponse("O email fornecido já está registado.", 400)
      );
    }
    // Lidar com erros de validação do Mongoose
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err); // Passa outros erros para o middleware de tratamento de erros global
  }
};

// @desc    Login de utilizador
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar email e password
    if (!email || !password) {
      return next(
        new ErrorResponse("Por favor, forneça um email e senha", 400)
      );
    }

    // Verificar utilizador
    const user = await User.findOne({ email }).select("+password"); // Precisamos da senha para comparar

    if (!user) {
      return next(new ErrorResponse("Credenciais inválidas", 401)); // 401: Unauthorized
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password); // Método definido no modelo User

    if (!isMatch) {
      return next(new ErrorResponse("Credenciais inválidas", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout de utilizador / Limpar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  // Para deslogar, simplesmente limpe o cookie do token
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Expira em 10 segundos
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
