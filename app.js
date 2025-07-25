// server/app.js

require("dotenv").config(); // Carrega as variáveis de ambiente
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Para ler cookies JWT

// Importar a função de conexão com o banco de dados
const connectDB = require("./config/db");

// Importar arquivos de rota
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

// Importar middlewares personalizados
const errorHandler = require("./middleware/errorMiddleware"); // Middleware para tratamento de erros global

// Conectar ao banco de dados
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch((err) => console.error("Erro de conexão com MongoDB:", err));

// Middlewares
app.use(express.json()); // Permite que o Express parseie JSON no corpo das requisições
app.use(cookieParser()); // Habilita o parsing de cookies
app.use(
  cors({
    origin: "http://localhost:3000", // Substitua pela URL do seu frontend em desenvolvimento
    credentials: true, // Permite que cookies sejam enviados com as requisições
  })
);

// Montar as rotas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/appointments", appointmentRoutes);

// Middleware de tratamento de erros personalizado (DEVE SER O ÚLTIMO MIDDLEWARE!)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
