// server/middleware/errorMiddleware.js
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Copia o erro

  error.message = err.message; // Garante que a mensagem seja copiada

  // Log para depuração
  console.error(err.stack); // Mostra a pilha de chamadas do erro

  // Erro de Mongoose Bad ObjectId
  if (err.name === "CastError" && err.path === "_id") {
    const message = `Recurso não encontrado com ID de ${err.path} ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Erro de Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = "Campo duplicado inserido";
    error = new ErrorResponse(message, 400);
  }

  // Erro de Mongoose Validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(messages.join(", "), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Erro de Servidor",
  });
};

module.exports = errorHandler;
