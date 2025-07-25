const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse"); // Um helper para erros personalizados (opcional, mas recomendado)
const sendTokenResponse = require("../utils/generateToken");

// @desc    Obter o utilizador atual (quem está logado)
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  // O middleware 'protect' adiciona o utilizador ao objeto req
  const user = req.user; // req.user já vem populado pelo middleware de autenticação

  res.status(200).json({ success: true, data: user });
};

// @desc    Atualizar detalhes do perfil do utilizador
// @route   PUT /api/users/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    // Lida com erro de email duplicado ou validação
    if (err.code === 11000) {
      // Código de erro para chave duplicada (email)
      return next(new ErrorResponse("O email fornecido já está em uso.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Atualizar senha do utilizador
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password"); // Seleciona a senha para comparação

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("A senha atual está incorreta", 401));
  }

  user.password = req.body.newPassword;
  await user.save(); // O middleware 'pre-save' cuidará do hashing da nova senha

  sendTokenResponse(user, 200, res); // Gera um novo token após a troca de senha (segurança)
};

// --- Funções para Admin (Opcional, mas útil) ---

// @desc    Obter todos os utilizadores (apenas para Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    // Implemente paginação, filtros e ordenação aqui se desejar
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Obter um utilizador por ID (apenas para Admin)
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(
          `Utilizador com ID ${req.params.id} não encontrado`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("ID de utilizador inválido", 400));
    }
    next(err);
  }
};

// @desc    Criar utilizador (apenas para Admin)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body); // A senha será hashed pelo middleware 'pre-save'
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse("O email fornecido já está em uso.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Atualizar utilizador (apenas para Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          `Utilizador com ID ${req.params.id} não encontrado`,
          404
        )
      );
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse("O email fornecido já está em uso.", 400));
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Excluir utilizador (apenas para Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(
          `Utilizador com ID ${req.params.id} não encontrado`,
          404
        )
      );
    }
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
