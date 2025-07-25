const Client = require("../models/Client"); // Importa o modelo Client
const ErrorResponse = require("../utils/errorResponse"); // Importa a classe de erro customizada
const mongoose = require("mongoose"); // Importa o mongoose para verificar erros de CastError (ID inválido)

// @desc    Obter todos os clientes
// @route   GET /api/clients
// @access  Private (Admin, Employee)
exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find();
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (err) {
    // Envia o erro para o middleware de tratamento de erros global
    next(err);
  }
};

// @desc    Obter um cliente por ID
// @route   GET /api/clients/:id
// @access  Private (Admin, Employee)
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      // Se o cliente não for encontrado (ID válido, mas não existe)
      return next(
        new ErrorResponse(
          `Cliente não encontrado com ID de ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Lida com erro de CastError (ID inválido, ex: formato incorreto)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("ID de cliente inválido", 400));
    }
    next(err);
  }
};

// @desc    Criar um novo cliente
// @route   POST /api/clients
// @access  Private (Admin, Employee)
exports.createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body); // Cria o cliente com os dados do corpo da requisição

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Lida com erro de email duplicado (código 11000 do MongoDB)
    if (err.code === 11000) {
      return next(
        new ErrorResponse(
          "O email fornecido já está registado para outro cliente.",
          400
        )
      );
    }
    // Lida com erros de validação do Mongoose (campos obrigatórios, formato, etc.)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Atualizar um cliente por ID
// @route   PUT /api/clients/:id
// @access  Private (Admin, Employee)
exports.updateClient = async (req, res, next) => {
  try {
    // Encontra e atualiza o cliente. 'new: true' retorna o documento atualizado,
    // 'runValidators: true' garante que as validações do Schema sejam executadas.
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      // Se o cliente não for encontrado
      return next(
        new ErrorResponse(
          `Cliente não encontrado com ID de ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (err) {
    // Lida com erro de CastError (ID inválido)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("ID de cliente inválido", 400));
    }
    // Lida com erro de email duplicado
    if (err.code === 11000) {
      return next(
        new ErrorResponse(
          "O email fornecido já está registado para outro cliente.",
          400
        )
      );
    }
    // Lida com erros de validação
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return next(new ErrorResponse(messages.join(", "), 400));
    }
    next(err);
  }
};

// @desc    Excluir um cliente por ID
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      // Se o cliente não for encontrado
      return next(
        new ErrorResponse(
          `Cliente não encontrado com ID de ${req.params.id}`,
          404
        )
      );
    }

    // Para Mongoose 6+, 'remove()' está depreciado, use 'deleteOne()'
    await client.deleteOne();

    res.status(200).json({
      success: true,
      data: {}, // Retorna um objeto vazio ou uma mensagem de sucesso
    });
  } catch (err) {
    // Lida com erro de CastError (ID inválido)
    if (err instanceof mongoose.CastError && err.path === "_id") {
      return next(new ErrorResponse("ID de cliente inválido", 400));
    }
    next(err);
  }
};
